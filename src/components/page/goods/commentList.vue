<template>
    <div class="app-container" @click.stop="searchShow = false">
        <div class="table-title">
            <!-- <div class="line"></div> -->
            <el-tabs class="tabs" value="1" @tab-click="onTabClick">
                <el-tab-pane label="商品评论" name="1"></el-tab-pane>
                <el-tab-pane label="用户评论" name="2"></el-tab-pane>
            </el-tabs>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left" @keydown.enter.native="handleFilter()">
                        <!-- <el-form :model="zt" :rules="rules" ref="formPic" :inline="true" size="small" label-position="right" label-width="110px"> -->
                        <el-form-item label="商品名称" prop="skuName">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.skuName"></el-input>
                        </el-form-item>
                        <el-form-item label="店铺名称" prop="shopId">
                            <el-select class="filter-item" v-model="formFilter.shopId" placeholder="请选择" filterable>
                                <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="订单号" prop="orderNo">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.orderNo"></el-input>
                        </el-form-item>
                        <el-form-item label="用户名称" prop="nickName">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.nickName"></el-input>
                        </el-form-item>
                        <el-form-item label="用户ID" prop="userId">
                            <el-input class="filter-item" placeholder="请输入" v-model.number="formFilter.userId"></el-input>
                        </el-form-item>
                        <el-form-item class="long-time" label="评价时间" prop="createdTime">
                            <el-date-picker
                                class="filter-item"
                                v-model="formFilter.createdTime"
                                value-format="timestamp"
                                type="datetimerange"
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                                :default-time="['00:00:00', '23:59:59']"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item label="状态" prop="checkStatus" v-show="formFilter.isApprove == 2">
                            <el-select class="filter-item" v-model="formFilter.checkStatus" placeholder="请选择" filterable>
                                <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="置顶状态" prop="top" v-show="formFilter.isApprove == 2">
                            <el-select class="filter-item" v-model="formFilter.top" placeholder="请选择" filterable>
                                <el-option v-for="item in topList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item class="form-item-btn" label="">
                            <el-button class="filter-btn" size="" type="" @click="resetForm('formFilter')">重置</el-button>
                            <el-button class="filter-btn" size="" type="primary" @click="handleFilter">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </transition>
            <div class="search-value">
                <template v-for="(item, i) in searchList">
                    <div class="search-item" v-if="i <= showMaxIndex">
                        {{ item.val }}
                        <span class="tags-li-icon" @click="closeSearchItem(item, i)"><i class="el-icon-close"></i></span>
                    </div>
                </template>
                <span style="width: 20px;display: inline-block" v-if="searchList.length > 0 && showMaxIndex < searchList.length - 1">...</span>
                <div class="search-value-clone" ref="searchValueBox">
                    <template v-for="(item, i) in searchList">
                        <div class="search-item" :ref="'searchItem' + i">
                            {{ item.val }}
                            <span class="tags-li-icon"><i class="el-icon-close"></i></span>
                        </div>
                    </template>
                    <span style="width: 20px;display: inline-block">...</span>
                </div>
            </div>
            <el-radio-group v-model="formFilter.isApprove" class="tab-way" @change="onRadioClick">
                <el-radio-button :label="1">未审核</el-radio-button>
                <el-radio-button :label="2">已审核</el-radio-button>
            </el-radio-group>
        </div>
        <el-table :data="list" v-loading.body="listLoading" :height="tableHeight" :header-cell-style="$tableHeaderColor" element-loading-text="Loading" fit>
            <el-table-column label="操作" width="110">
                <template slot-scope="scope">
                    <el-button
                        class="text-blue"
                        type="text"
                        v-if="formFilter.isApprove == 1"
                        v-hasPermission="'mall-backend-comment-approve'"
                        @click.native="updateCommentStatus(scope.row.commentId, 2)"
                        >通过</el-button
                    >
                    <el-button
                        class="text-red"
                        type="text"
                        v-if="scope.row.status != 3"
                        v-hasPermission="'mall-backend-comment-approve'"
                        @click.native="updateCommentStatus(scope.row.commentId, 3)"
                        >拒绝</el-button
                    >
                    <el-button
                        class="text-blue"
                        type="text"
                        v-if="scope.row.status == 2 && formFilter.isApprove == 2"
                        v-hasPermission="'mall-backend-goods-comment-top'"
                        @click.native="openTopDialog(scope.row)"
                        >置顶</el-button
                    >
                </template>
            </el-table-column>
            <el-table-column label="状态" width="100" v-if="formFilter.isApprove == 2">
                <template slot-scope="scope">
                    <span v-if="scope.row.status == 1">未审核</span>
                    <span v-if="scope.row.status == 2">已通过</span>
                    <span v-if="scope.row.status == 3">已拒绝</span>
                </template>
            </el-table-column>
            <el-table-column label="评价内容" width="610">
                <template slot-scope="scope">
                    <div class="contents">
                        <div class="text" v-if="scope.row.message">{{ scope.row.message }}</div>
                        <div class="media">
                            <div class="item" v-for="item in scope.row.medias" :key="item.mediaId">
                                <img :src="item.link" alt="" v-if="item.mediaType == 2" @click="openPreviewPic(scope.row, item.index)" />
                                <img :src="scope.row.videoImg || imgVedio" alt="" v-if="item.mediaType == 1" @click="openPreviewVideo(item.link)" />
                                <img class="play" :src="imgPlay" alt="" v-if="item.mediaType == 1" @click="openPreviewVideo(item.link)" />
                            </div>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="评星" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.rate }}星</span>
                </template>
            </el-table-column>
            <el-table-column label="商品名称" width="160">
                <template slot-scope="scope">
                    <span>{{ scope.row.skuName }}</span>
                </template>
            </el-table-column>
            <el-table-column label="店铺名称" width="100">
                <template slot-scope="scope">
                    <span>{{ shopList.find(item => item.id == scope.row.shopId).shop_name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="订单号" width="130">
                <template slot-scope="scope">
                    <span>{{ scope.row.orderNo }}</span>
                </template>
            </el-table-column>
            <el-table-column label="用户ID" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.userId }}</span>
                </template>
            </el-table-column>
            <el-table-column label="用户名称" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.nickName }}</span>
                </template>
            </el-table-column>
            <el-table-column label="评价时间" width="180">
                <template slot-scope="scope">
                    <span>{{ $moment(scope.row.createdAt).format('YYYY-MM-DD HH:mm:ss') }}</span>
                </template>
            </el-table-column>
        </el-table>
        <div class="pagination-container">
            <el-pagination
                background
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="listQuery.page"
                :page-size="listQuery.limit"
                layout="total, prev, pager, next, jumper"
                :total="total"
            >
            </el-pagination>
        </div>
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisiblePic" :on-close="closePreviewPic" :url-list="previewUrlListPic" :initial-index="previewIndexPic" />
        <!-- 视频预览 -->
        <el-dialog :visible.sync="dialogVisibleVideo" title="预览" @closed="videoClose">
            <video-player class="video-player vjs-custom-skin" ref="videoPlayer" :playsinline="true" :options="playerOptions"></video-player>
        </el-dialog>
        <!-- 置顶 -->
        <el-dialog :visible.sync="dialogVisibleTop" title="置顶" width="380px" @closed="closeDialogTop">
            <el-checkbox v-model="checkedSelf">本宝贝置顶</el-checkbox>
            <el-checkbox v-model="checkedOther">其他宝贝置顶</el-checkbox>
            <span slot="footer" class="dialog-footer">
                <el-button @click="closeDialogTop">取 消</el-button>
                <el-button type="primary" @click="saveTop">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import { queryCommentList, updateCommentApprove, putCommentTop } from '@/api/goods'
import { queryShopList } from '@/api/goods'
import ElImageViewer from '@/components/common/image-viewer'

import { formatMoney } from '@/plugin/tool'
import bus from '@/components/common/bus'
export default {
    data() {
        return {
            list: null,
            total: 0,
            listLoading: false,
            listQuery: {
                page: 1,
                limit: 10
            },
            shopList: [],

            formFilter: {
                pi: 1,
                ps: 10,
                skuName: '', //商品名称
                shopId: '', // 店铺名称
                orderNo: '', // 订单编号
                nickName: '', // 用户名称
                userId: '', // 用户id
                isApprove: 1, // 是否审核 1未审核 2已审核
                startTime: 0, // 时间戳
                endTime: 0, //时间戳
                createdTime: '',
                checkStatus: '', //暂存 审核结果
                status: '', //审核状态 1未审核 2通过 3拒绝
                top: '' // 0 未置顶 1 本宝贝 2 其他宝贝 3 全部
            },
            topList: [
                { value: 0, label: '未置顶' },
                { value: 1, label: '本宝贝' },
                { value: 2, label: '其他宝贝' },
                { value: 3, label: '全部置顶' }
            ],
            statusList: [
                { value: 2, label: '通过' },
                { value: 3, label: '拒绝' }
            ],
            tableHeight: 'calc(100vh - 194px)',
            searchShow: false,
            searchList: [],
            showMaxIndex: 0,
            imgVedio: require('@/assets/img/vedio.png'),
            imgPlay: require('@/assets/img/play.png'),
            // 图片预览
            dialogVisiblePic: false,
            previewUrlListPic: [],
            previewIndexPic: 0,
            // 视频预览
            dialogVisibleVideo: false,
            // 视频播放
            playerOptions: {
                playbackRates: [0.7, 1.0, 1.5, 2.0], //播放速度
                autoplay: false, //如果true,浏览器准备好时开始回放。
                muted: false, // 默认情况下将会消除任何音频。
                loop: false, // 导致视频一结束就重新开始。
                preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
                language: 'zh-CN',
                aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
                fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
                sources: [
                    {
                        type: '',
                        src: 'http://vjs.zencdn.net/v/oceans.mp4' //url地址
                        // src: "" //url地址
                    }
                ],
                poster: '', //你的封面地址
                // width: document.documentElement.clientWidth,
                notSupportedMessage: '此视频暂无法播放，请稍后再试', //允许覆盖Video.js无法播放媒体源时显示的默认信息。
                controlBar: {
                    timeDivider: true,
                    durationDisplay: true,
                    remainingTimeDisplay: false,
                    fullscreenToggle: true //全屏按钮
                }
            },
            activeTab: '1',
            // 置顶
            setTopId: '',
            dialogVisibleTop: false,
            checkedSelf: false, //本宝贝置顶
            checkedOther: false //其他宝贝置顶
        }
    },
    components: {
        ElImageViewer
    },
    watch: {
        searchList: function() {
            this.$nextTick(
                function() {
                    if (!this.$refs.searchValueBox) {
                        return
                    }
                    let maxWidth = window.getComputedStyle(this.$refs.searchValueBox).width.replace('px', '') - 20
                    let showWidth = 0
                    for (let i = 0; i < this.searchList.length; i++) {
                        let el = 'searchItem' + i
                        let _width = this.$refs[el][0].offsetWidth
                        showWidth = showWidth + Math.ceil(Number(_width)) + 8
                        if (showWidth > maxWidth) {
                            this.showMaxIndex = i - 1
                            // console.log('this.showMaxIndex', this.showMaxIndex)
                            return
                        }
                        if (i == this.searchList.length - 1) {
                            if (showWidth <= maxWidth - 20) {
                                this.showMaxIndex = this.searchList.length - 1
                            }
                        }
                    }
                }.bind(this)
            )
        }
    },
    created() {},
    mounted() {
        this.queryShopList()
        this.getList()
    },
    methods: {
        formatMoney: formatMoney,
        getList() {
            let params = _.cloneDeep(this.$refs['formFilter'].model)
            console.log('输出 ~ params', params)
            if (params.createdTime.length == 2) {
                params['startTime'] = Number(this.$moment(params.createdTime[0]).format('X'))
                params['endTime'] = Number(this.$moment(params.createdTime[1]).format('X'))
            } else {
                params['startTime'] = 0
                params['endTime'] = 0
            }
            if (params['checkStatus']) {
                params['status'] = [params['checkStatus']]
            } else {
                params['status'] = params['isApprove'] == 1 ? [1] : [2, 3]
            }
            params['orderNo'] = params['orderNo'] ? Number(params['orderNo']) : 0
            params['ps'] = this.listQuery.limit
            params['pi'] = this.listQuery.page

            queryCommentList(params)
                .then(res => {
                    this.list = res.data.list.map(item => {
                        item.medias = item.medias || []
                        item['img'] = item.medias
                            .filter(e => e.mediaType == 2)
                            .map((e, index) => {
                                e['index'] = index
                                return e
                            })
                        item['video'] = item.medias.filter(e => e.mediaType == 1)
                        return item
                    })
                    this.total = res.data.total
                })
                .catch(err => {})
        },
        // 代理店铺列表
        queryShopList() {
            queryShopList()
                .then(res => {
                    this.shopList = res.data
                })
                .catch(err => {})
        },
        closePreviewPic() {
            this.dialogVisiblePic = false
        },
        openPreviewPic(row, index) {
            console.log('输出 ~ row', row)
            this.previewUrlListPic = row.img.map(item => item.link)

            this.previewIndexPic = index
            this.dialogVisiblePic = true
        },
        openPreviewVideo(url) {
            this.playerOptions['sources'][0]['src'] = url
            this.dialogVisibleVideo = true
        },
        videoClose() {
            this.$refs.videoPlayer.player.pause();
            this.dialogVisibleVideo = false
        },
        gotoDetail(id, order_id) {
            this.$router.push({
                name: 'afterSaleDetail',
                query: {
                    id: id,
                    orderId: order_id
                }
            })
        },

        // 搜索
        handleFilter() {
            this.listQuery.page = 1
            this.searchShow = false
            this.setSearchValue()
            this.getList()
        },
        // 重置
        resetForm(formName) {
            this.$refs[formName].resetFields()
            this.handleFilter()
        },

        // 设置显示的搜索条件
        setSearchValue() {
            let _search = []
            // 商品名称
            if (this.formFilter['skuName']) {
                let obj = {
                    label: 'skuName',
                    val: this.formFilter['skuName']
                }
                _search.push(obj)
            }
            // 店铺名称
            if (this.formFilter['shopId']) {
                this.shopList.forEach(ev => {
                    if (ev.id == this.formFilter['shopId']) {
                        let obj = {
                            label: 'shopId',
                            val: ev.shop_name
                        }
                        _search.push(obj)
                    }
                })
            }

            // 订单编号
            if (this.formFilter['orderNo']) {
                let obj = {
                    label: 'orderNo',
                    val: this.formFilter['orderNo']
                }
                _search.push(obj)
            }
            // 用户名称
            if (this.formFilter['nickName']) {
                let obj = {
                    label: 'nickName',
                    val: this.formFilter['nickName']
                }
                _search.push(obj)
            }
            // 用户id
            if (this.formFilter['userId']) {
                let obj = {
                    label: 'userId',
                    val: this.formFilter['userId']
                }
                _search.push(obj)
            }
            // 评价时间 createdTime
            if (this.formFilter['createdTime'] && this.formFilter['createdTime'].length === 2) {
                let _ge_arr = this.$moment(this.formFilter.createdTime[0])
                    .format('YYYY-MM-DD ')
                    .split('-')
                let _le_arr = this.$moment(this.formFilter.createdTime[1])
                    .format('YYYY-MM-DD ')
                    .split('-')
                let _ge = _ge_arr[1] + '.' + _ge_arr[2]
                let _le = _le_arr[1] + '.' + _le_arr[2]
                let obj = {
                    label: 'createdTime',
                    val: _ge + ' - ' + _le
                }
                _search.push(obj)
            }
            // top
            if (this.formFilter['top']) {
                this.topList.forEach(ev => {
                    if (ev.value == this.formFilter['top']) {
                        let obj = {
                            label: 'top',
                            val: ev.label
                        }
                        _search.push(obj)
                    }
                })
            }
            // status
            if (this.formFilter['checkStatus']) {
                this.statusList.forEach(ev => {
                    if (ev.value == this.formFilter['checkStatus']) {
                        let obj = {
                            label: 'checkStatus',
                            val: ev.label
                        }
                        _search.push(obj)
                    }
                })
            }
            console.log('_search', _search)
            this.searchList = _.cloneDeep(_search)
        },
        // 审核
        updateCommentStatus(commentId, status) {
            let params = {
                commentId, // 评论id
                status // 状态 2通过 3拒绝
            }
            let text = status == 2 ? '通过' : '拒绝'
            this.$confirm(`确定审核${text}?`, '', {
                confirmButtonText: '审核' + text,
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    updateCommentApprove(params)
                        .then(res => {
                            console.log('GOOGLE: res', res)
                            if (res.code === 200) {
                                this.$notify({
                                    title: '审核成功',
                                    message: '',
                                    type: 'success',
                                    duration: 2000
                                })
                                this.getList()
                                // 改变侧边栏提示数字
                                bus.$emit('changSidebarCount')
                            } else {
                                this.$notify({
                                    title: res.msg,
                                    message: '',
                                    type: 'error',
                                    duration: 5000
                                })
                            }
                        })
                        .catch(err => {})
                })
                .catch(() => {})
        },
        openTopDialog(row) {
            console.log('输出 ~ row', row)
            //             dialogVisibleTop: false,
            // checkedSelf: false, //本宝贝置顶
            // checkedOther: false //其他宝贝置顶
            // 0 未置顶 1 本宝贝 2 其他宝贝 3 全部
            switch (row.top) {
                case 0:
                    this.checkedSelf = false
                    this.checkedOther = false
                    break
                case 1:
                    this.checkedSelf = true
                    this.checkedOther = false
                    break
                case 2:
                    this.checkedSelf = false
                    this.checkedOther = true
                    break
                case 3:
                    this.checkedSelf = true
                    this.checkedOther = true
                    break
                default:
                    break
            }
            this.setTopId = row.goodsCommentId
            this.dialogVisibleTop = true
        },
        saveTop() {
            let commentId = this.setTopId
            let checkedSelf = this.checkedSelf
            let checkedOther = this.checkedOther
            let top = 0
            if (checkedSelf && checkedOther) {
                top = 3
            } else if (checkedSelf == true && checkedOther == false) {
                top = 1
            } else if (checkedSelf == false && checkedOther == true) {
                top = 2
            }
            let params = {
                goodsCommentId: commentId, // 商品评论id
                top: top // 0 未置顶 1 本宝贝 2 其他宝贝 3 全部
            }
            putCommentTop(params)
                .then(res => {
                    if (res.code === 200) {
                        this.$notify({
                            title: '置顶成功',
                            message: '',
                            type: 'success',
                            duration: 2000
                        })
                        this.getList()
                        this.dialogVisibleTop = false
                    } else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        })
                    }
                })
                .catch(err => {})
        },
        // 清除单个搜索条件
        closeSearchItem(item, i) {
            this.$set(this.formFilter, item.label, '')
            if (item.label == 'createdTime') {
                this.$set(this.formFilter, 'startTime', '')
                this.$set(this.formFilter, 'endTime', '')
            }
            this.handleFilter()
        },
        // 分页方法
        handleSizeChange(val) {
            this.listQuery.limit = val
            this.getList()
        },
        handleCurrentChange(val) {
            this.listQuery.page = val
            this.getList()
        },
        // radio
        onRadioClick() {
            this.listQuery.page = 1
            this.resetForm('formFilter')
            this.setSearchValue()
        },
        // tab
        onTabClick(e) {
            if (e.name == 2) {
                this.$router.push({ path: '/mall-backend-goods-comment-list-user' })
            }
        },
        // 关闭弹框
        closeDialogTop() {
            this.dialogVisibleTop = false
        }
    }
}
</script>
<style scoped="scoped" lang="less">
.tab-way {
    margin-right: 32px;
    margin-left: auto;
}
.type-tag {
    // display: block;
    padding: 0 11px;
    width: fit-content;
    height: 26px;
    border-radius: 15px;
    color: rgba(255, 255, 255, 0.85);
    word-break: keep-all;
    font-weight: 400;
    line-height: 26px;
    &.type-red {
        background-color: #ff4d4f;
    }
    &.type-purple {
        background-color: #a151ff;
    }
    &.type-yellow {
        background-color: #faad14;
    }
    &.type-blue {
        background-color: #1890ff;
    }
}
.status {
    display: flex;
    align-items: center;
    .text-grey {
        color: rgba(0, 0, 0, 0.25);
    }
    .dot {
        display: block;
        margin-right: 8px;
        width: 8px;
        height: 8px;
        border-radius: 4px;
    }
}
.contents {
    display: flex;
    align-items: center;
    .text {
        margin-right: 18px;
        width: 260px;
        font-size: 14px;
    }
    .media {
        display: flex;
        .item {
            position: relative;
            overflow: hidden;
            margin-right: 8px;
            width: 60px;
            height: 60px;
            cursor: pointer;
            img {
                width: 60px;
                height: auto;
            }
            .play {
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                margin: auto;
                width: 30px;
                height: 30px;
            }
        }
    }
}
.tabs {
    margin-left: 30px;
    & /deep/ .el-tabs__header {
        margin: 0;
    }
    & /deep/ .el-tabs__nav {
        height: 66px;
    }
    & /deep/ .el-tabs__item {
        line-height: 66px;
    }
}
</style>

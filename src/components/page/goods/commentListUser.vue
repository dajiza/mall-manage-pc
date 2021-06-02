<template>
    <div class="app-container" @click.stop="searchShow = false">
        <div class="table-title">
            <!-- <div class="line"></div> -->
            <el-tabs class="tabs" v-model="activeTab" @tab-click="onTabClick">
                <el-tab-pane label="商品评论" name="1"></el-tab-pane>
                <el-tab-pane label="用户评论" name="2"></el-tab-pane>
            </el-tabs>
            <div class="grey-line"></div>
            <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
            <transition name="slide-fade">
                <div class="head-container" v-show="searchShow" @click.stop="">
                    <el-form ref="formFilter" :model="formFilter" :inline="true" size="small" label-position="left">
                        <!-- <el-form :model="zt" :rules="rules" ref="formPic" :inline="true" size="small" label-position="right" label-width="110px"> -->
                        <el-form-item label="状态" prop="checkStatus" v-show="formFilter.isApprove == 2">
                            <el-select class="filter-item" v-model="formFilter.checkStatus" placeholder="请选择" filterable>
                                <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="评论类型" prop="platform">
                            <el-select class="filter-item" v-model="formFilter.platform" placeholder="请选择" filterable>
                                <el-option v-for="item in platformList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="用户ID" prop="userId">
                            <el-input class="filter-item" placeholder="请输入" v-model.number="formFilter.userId"></el-input>
                        </el-form-item>
                        <el-form-item label="用户名称" prop="nickName">
                            <el-input class="filter-item" placeholder="请输入" v-model="formFilter.nickName"></el-input>
                        </el-form-item>
                        <el-form-item label="店铺" prop="shopId">
                            <el-select class="filter-item" v-model="formFilter.shopId" placeholder="请选择" filterable>
                                <el-option v-for="item in shopList" :key="item.id" :label="item.shop_name" :value="item.id"> </el-option>
                            </el-select>
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
            <el-table-column label="操作" width="180">
                <template slot-scope="scope">
                    <el-button class="text-blue" type="text" v-if="formFilter.isApprove == 1" @click.native="updateCommentStatus(scope.row.commentId, 2)">通过</el-button>
                    <el-button class="text-red" type="text" v-if="scope.row.status != 3" @click.native="updateCommentStatus(scope.row.commentId, 3)">拒绝</el-button>
                    <el-button class="text-blue" type="text" @click.native="openSubject(scope.row)">查看原文</el-button>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="100" v-if="formFilter.isApprove == 2">
                <template slot-scope="scope">
                    <span v-if="scope.row.status == 1">未审核</span>
                    <span v-if="scope.row.status == 2">已通过</span>
                    <span v-if="scope.row.status == 3">已拒绝</span>
                </template>
            </el-table-column>
            <el-table-column label="评价内容" min-width="400">
                <template slot-scope="scope">
                    <div class="contents">
                        <div class="text" v-if="scope.row.message">{{ scope.row.message }}</div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="评论类型" width="120">
                <template slot-scope="scope">
                    <span>{{ platformList.find(item => item.value == scope.row.platform).label }}</span>
                </template>
            </el-table-column>
            <el-table-column label="用户ID" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.userId }}</span>
                </template>
            </el-table-column>
            <el-table-column label="店铺名称" width="100">
                <template slot-scope="scope">
                    <span>{{ shopList.find(item => item.id == scope.row.shopId).shop_name }}</span>
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
        <el-dialog :visible.sync="dialogVisibleVideo" title="预览">
            <video-player class="video-player vjs-custom-skin" ref="videoPlayer" :playsinline="true" :options="playerOptions"></video-player>
        </el-dialog>
        <!-- 商品 评论 -->
        <el-dialog class="comment-dialog" :visible.sync="dialogVisibleGoods" title="查看原文" width="400px" @closed="closeDialogGoods">
            <div class="comment" id="comment" v-if="replyData && activePlatform == 1">
                <div class="goods-card">
                    <div class="img">
                        <img :src="replyData.goodsSku.skuImg" alt="" />
                    </div>
                    <div class="text">
                        <div class="title">{{ replyData.goodsSku.skuName }}</div>
                        <div class="info">
                            <div class="spec">{{ replyData.goodsSku.skuAttr.map(item => `${item.Title}:${item.Value}`).join(',') }}</div>
                            <div class="price"><span class="symbol">¥</span>{{ formatMoney(replyData.goodsSku.skuPrice) }}</div>
                        </div>
                    </div>
                </div>
                <div class="detail">
                    <div class="comment-item">
                        <div class="user">
                            <div class="avatar">
                                <img class="fullimg" :src="replyData.avatar || avatar" alt="" />
                            </div>
                            <div class="info">
                                <div class="name">{{ replyData.nickName }}</div>
                                <div class="time">
                                    {{ $moment(replyData.createdAt).format('MM/DD HH:mm') }} <span class="line"></span>
                                    {{ replyData.goodsSku.skuAttr.map(item => item.Value).join(' ') }}
                                </div>
                            </div>
                        </div>
                        <div class="contents">
                            {{ replyData.message }}
                        </div>
                    </div>
                    <div class="media">
                        <div class="item" v-for="item in replyData.medias" :key="item.mediaId" v-if="replyData.medias.length > 1">
                            <img :src="item.link" alt="" @click="openPreviewPic(item.index)" v-if="item.mediaType == 2" />
                            <img :src="item.videoImg || imgVedio" alt="" @click="openPreviewVideo(item.link)" v-if="item.mediaType == 1" />
                            <img class="play" :src="imgPlay" alt="" @click="openPreviewVideo(item.link)" v-if="item.mediaType == 1" />
                        </div>
                        <div class="item item-single" v-for="item in replyData.medias" :key="item.mediaId" v-if="replyData.medias.length == 1">
                            <img :src="item.link" alt="" @click="openPreviewPic(item.index)" v-if="item.mediaType == 2" />
                            <img :src="item.videoImg || imgVedio" alt="" @click="openPreviewVideo(item.link)" v-if="item.mediaType == 1" />
                            <img class="play" :src="imgPlay" alt="" @click="openPreviewVideo(item.link)" v-if="item.mediaType == 1" />
                        </div>
                    </div>
                </div>
                <div class="reply">{{ replyData.replyList.length }}条回复</div>
                <div
                    :id="item.commentId == activeCommentId ? 'active' : ''"
                    :class="['comment-item', item.commentId == activeCommentId ? 'active' : '']"
                    v-for="item in replyData.replyList"
                    :key="item.commentId"
                >
                    <div class="user" :id="'user' + item">
                        <div class="avatar">
                            <img class="fullimg" :src="item.avatar" alt="" />
                        </div>
                        <div class="info">
                            <div class="name">{{ item.nickName }}</div>
                            <div class="time">{{ $moment(item.createdAt).format('MM/DD HH:mm') }}</div>
                        </div>
                    </div>
                    <div class="contents">
                        {{ item.message }}
                    </div>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="danger" @click="checkCommit(3)" v-if="activeStatus != 3">拒 绝</el-button>
                <el-button type="primary" @click="checkCommit(2)" v-if="formFilter.isApprove == 1">通 过</el-button>
            </span>
        </el-dialog>
        <!-- 圈子 评论 -->
        <el-dialog class="comment-dialog comment-circle" :visible.sync="dialogVisibleCircle" title="查看原文" width="400px" @closed="closeDialogCircle">
            <div class="comment" id="comment" v-if="replyData && activePlatform != 1">
                <div class="detail">
                    <div class="comment-item">
                        <div class="user">
                            <div class="avatar">
                                <img class="fullimg" :src="replyData.avatar" alt="" />
                            </div>
                            <div class="info">
                                <div class="name">{{ replyData.nickName }}</div>
                                <div class="contents">
                                    {{ replyData.message }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="media">
                        <div class="item" v-for="item in replyData.medias" :key="item.mediaId" v-if="replyData.medias.length > 1">
                            <img :src="item.link" alt="" @click="openPreviewPic(item.index)" v-if="item.mediaType == 2" />
                            <img :src="item.videoImg || imgVedio" alt="" @click="openPreviewVideo(item.link)" v-if="item.mediaType == 1" />
                            <img class="play" :src="imgPlay" alt="" @click="openPreviewVideo(item.link)" v-if="item.mediaType == 1" />
                        </div>
                        <div class="item item-single" v-for="item in replyData.medias" :key="item.mediaId" v-if="replyData.medias.length == 1">
                            <img :src="item.link" alt="" @click="openPreviewPic(item.index)" v-if="item.mediaType == 2" />
                            <img :src="item.videoImg || imgVedio" alt="" @click="openPreviewVideo(item.link)" v-if="item.mediaType == 1" />
                            <img class="play" :src="imgPlay" alt="" @click="openPreviewVideo(item.link)" v-if="item.mediaType == 1" />
                        </div>
                    </div>
                </div>
                <div class="reply-time">{{ $moment(replyData.createdAt).format('MM/DD HH:mm') }}</div>
                <div class="reply-circle">
                    <div class="like-box" v-if="replyData.likeUsers.length > 0">
                        <span class="iconfont icon-like"></span>
                        <span class="like-name">{{ replyData.likeUsers.join(',') }}</span>
                    </div>
                    <div class="divider" v-if="replyData.likeUsers.length > 0"></div>
                    <div
                        :id="item.commentId == activeCommentId ? 'active' : ''"
                        :class="['circle-item', item.commentId == activeCommentId ? 'active' : '']"
                        v-for="item in replyData.replyList"
                        :key="item.commentId"
                    >
                        <span class="name">{{ item.nickName }}：</span>
                        {{ item.message }}
                    </div>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="danger" @click="checkCommit(3)" v-if="activeStatus != 3">拒 绝</el-button>
                <el-button type="primary" @click="checkCommit(2)" v-if="formFilter.isApprove == 1">通 过</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import { queryReplyList, updateCommentApprove, queryReplySubject } from '@/api/goods'
import { queryShopList } from '@/api/goods'
import ElImageViewer from '@/components/common/image-viewer'

import { formatMoney } from '@/plugin/tool'

export default {
    data() {
        return {
            avatar: require('@/assets/img/wx.jpeg'),
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
                shopId: '',
                platform: '', //0忽略条件查询 1 店铺商品 2 圈子 3 作业
                userId: '',
                nickName: '',
                isApprove: 1, // 是否审核 1未审核 2已审核
                checkStatus: '', //暂存 审核结果
                status: '', // 审核状态 1未审核 2通过 3拒绝
                createdTime: [],
                startTime: 0, // 10位时间戳
                endTime: 0 // 10位时间戳
            },
            //0忽略条件查询 1 店铺商品 2 圈子 3 作业
            platformList: [
                { value: 1, label: '店铺商品' },
                { value: 2, label: '圈子' },
                { value: 3, label: '作业' },
                { value: 4, label: '示范作业' }
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
            activeTab: '2',
            // 评论
            dialogVisibleGoods: false,
            dialogVisibleCircle: false,
            replyData: '',
            activePlatform: '', //查看原文的平台
            activeCommentId: '', //查看原文的评论id
            activeStatus: '' //查看原文的评论状态
        }
    },
    components: {
        ElImageViewer
    },
    // computed: {
    //     // 格式化attr
    //     formatAttr: function() {
    //         return data => {
    //             data = JSON.parse(data)
    //             return data.map(item => `${item.Title}:${item.Value}`).join(',')
    //         }
    //     }
    // },
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

        // var timer = null
        // console.log('输出 ~ document.getElementById', document.getElementById('user7'))
        // var element = document.getElementById('user7').offsetTop
        // var pageTop = document.getElementById('comment')
        // timer = setInterval(function() {
        //     if (pageTop.scrollTop >= element) {
        //         clearInterval(timer)
        //         pageTop.scrollTop = element
        //     } else {
        //         pageTop.scrollTop += 10
        //     }
        // }, 20)
    },
    methods: {
        formatMoney: formatMoney,
        getList() {
            let params = _.cloneDeep(this.$refs['formFilter'].model)
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
            params['platform'] = params['platform'] ? Number(params['platform']) : 0
            params['orderNo'] = params['orderNo'] ? Number(params['orderNo']) : 0
            params['ps'] = this.listQuery.limit
            params['pi'] = this.listQuery.page

            console.log('params', params)
            queryReplyList(params)
                .then(res => {
                    console.log('GOOGLE: res', res)
                    this.list = res.data.list
                    // this.list = res.data.list.map(item => {
                    //     item.medias = item.medias || []
                    //     item['img'] = item.medias
                    //         .filter(e => e.mediaType == 2)
                    //         .map((e, index) => {
                    //             e['index'] = index
                    //             return e
                    //         })
                    //     item['video'] = item.medias.filter(e => e.mediaType == 1)
                    //     return item
                    // })
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
        openPreviewPic(index) {
            this.previewIndexPic = index
            this.dialogVisiblePic = true
        },
        openPreviewVideo(url) {
            this.playerOptions['sources'][0]['src'] = url
            this.dialogVisibleVideo = true
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
            // 评论类型
            if (this.formFilter['platform']) {
                this.platformList.forEach(ev => {
                    if (ev.value == this.formFilter['platform']) {
                        let obj = {
                            label: 'platform',
                            val: ev.label
                        }
                        _search.push(obj)
                    }
                })
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
        // 审核 列表
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
        // 审核 弹窗
        checkCommit(status) {
            let params = {
                commentId: this.activeCommentId, // 评论id
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
                                this.dialogVisibleGoods = false
                                this.dialogVisibleCircle = false
                                this.getList()
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

        openSubject(row) {
            console.log('输出 ~ row', row)
            let params = {
                commentId: row.rootId,
                platform: row.platform //1 店铺商品 2 圈子 3 作业
            }
            this.activePlatform = row.platform
            this.activeCommentId = row.commentId
            this.activeStatus = row.status
            queryReplySubject(params).then(res => {
                console.log('输出 ~ res', res)

                if (res.data.medias) {
                    this.previewUrlListPic = res.data.medias.filter(item => item.mediaType == 2).map(item => item.link)
                } else {
                    res.data.medias = []
                }
                this.replyData = _.cloneDeep(res.data)

                if (row.platform == 1) {
                    this.dialogVisibleGoods = true
                    this.replyData.goodsSku.skuAttr = this.replyData.goodsSku.skuAttr ? JSON.parse(this.replyData.goodsSku.skuAttr) : []
                } else {
                    this.dialogVisibleCircle = true
                }
                this.$nextTick(() => {
                    let activeDom = document.getElementById('active')
                    activeDom.scrollIntoView()
                })
            })
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
            if (e.name == 1) {
                this.$router.push({ path: '/mall-backend-goods-comment-list' })
            }
        },
        // 关闭弹框 商品
        closeDialogGoods() {
            this.replyData = ''
            this.dialogVisibleGoods = false
        },
        // 关闭弹框 圈子
        closeDialogCircle() {
            this.replyData = ''
            this.dialogVisibleCircle = false
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
.comment-dialog {
    & /deep/ .el-dialog {
        margin-top: 50px !important;
    }
    & /deep/ .el-dialog__body {
        padding: 0 !important;
    }
}

.comment {
    overflow-y: scroll;
    height: 500px;
    &::-webkit-scrollbar {
        width: 0;
        height: 0;
    }
    .goods-card {
        display: flex;
        box-sizing: border-box;
        margin: 20px auto 0;
        padding: 10px;
        width: 325px;
        height: 88px;
        border-radius: 10px;
        background: #efefef;
        .img {
            overflow: hidden;
            flex-shrink: 0;
            margin-right: 10px;
            width: 68px;
            height: 68px;
            border-radius: 4px;
            img {
                width: 68px;
                height: auto;
            }
        }
        .text {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            justify-content: space-between;
            .title {
                overflow: hidden;
                height: 40px;
                line-height: 20px;
            }
            .info {
                display: flex;
                align-items: center;
                justify-content: space-between;
                .spec {
                    color: #b2b2b2;
                    font-size: 13px;
                }
                .price {
                    font-size: 15px;
                    .symbol {
                        padding-right: 3px;
                        font-size: 12px;
                    }
                }
            }
        }
    }
    .comment-item {
        padding: 10px 24px;
        &.active {
            background: rgba(24, 144, 255, 0.08);
        }
        .user {
            display: flex;
            .avatar {
                overflow: hidden;
                flex-shrink: 0;
                margin-right: 8px;
                width: 38px;
                height: 38px;
                border-radius: 50%;
            }
            .info {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                .name {
                    font-weight: 500;
                }
                .time {
                    display: flex;
                    align-items: center;
                    color: #b2b2b2;
                    font-size: 12px;
                    .line {
                        display: block;
                        margin: 0 6px;
                        width: 1px;
                        height: 10px;
                        background: #d8d8d8;
                    }
                }
            }
        }
        .contents {
            margin-top: 10px;
            line-height: 20px;
        }
    }
    .detail {
        margin-top: 20px;
        padding: 0 24px;
        .comment-item {
            margin-bottom: 20px;
            padding: 0;
        }
        .media {
            display: flex;
            flex-wrap: wrap;
            .item {
                position: relative;
                overflow: hidden;
                flex-shrink: 0;
                margin-right: 5px;
                margin-bottom: 5px;
                width: 80px;
                height: 80px;
                cursor: pointer;
                img {
                    width: 80px;
                    height: auto;
                }
                .play {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    margin: auto;
                    width: 40px;
                    height: 40px;
                }
            }
            .item-single {
                width: 200px;
                height: 200px;
                img {
                    width: 200px;
                    height: 200px;
                }
            }
        }
    }
    .reply {
        margin: 15px 0 20px;
        padding: 0 24px;
        font-weight: 500;
    }
}
.comment-circle {
    .comment-item {
        .contents {
            margin-top: 8px;
        }
    }
    .detail {
        .media {
            margin-left: 48px;
        }
    }
    .reply-time {
        margin: 15px 0 20px;
        padding: 0 24px 0 72px;
        color: #b2b2b2;
        font-size: 12px;
    }
    .reply-circle {
        margin-left: 72px;
        padding-bottom: 1px;
        width: 295px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.05);
        .like-box {
            padding: 4px 10px 8px;
            font-weight: 500;
            line-height: 20px;
            .icon-like {
                margin-right: 4px;
            }
        }
        .divider {
            margin: 0px auto 4px;
            width: 275px;
        }
        .circle-item {
            padding: 4px 10px 4px;
            .name {
                font-weight: 500;
            }
            &.active {
                background: rgba(24, 144, 255, 0.08);
            }
        }
    }
}
</style>

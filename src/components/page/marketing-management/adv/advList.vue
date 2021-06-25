<template>
    <div class="order-list-container" id="containerWrap" @click.stop="searchShow = false">
        <div class="container container-table-has-search p-t-0 pos-relative">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">广告管理</div>
                <div class="grey-line"></div>
                <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
                <transition name="slide-fade">
                    <div class="container clearfix head-container" ref="searchBox" v-show="searchShow" @click.stop="">
                        <el-form :model="searchForm" :inline="true" ref="searchForm" size="small" label-position="left" @keydown.enter.native="handleSearch()">
                            <el-form-item label="广告名称" prop="title" class="">
                                <el-input class="filter-item" v-model="searchForm.title" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="location" prop="location" class="">
                                <el-select class="filter-item" v-model="searchForm.location" placeholder="请选择" clearable>
                                    <el-option v-for="state in locationOptions" :key="state.id" :value="state.id" :label="state.name" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="应用店铺" prop="shop_id" class="">
                                <el-select class="filter-item" v-model="searchForm.shop_id" placeholder="请选择" clearable>
                                    <el-option v-for="state in shopOptions" :key="state.id" :value="state.id" :label="state.shop_name" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="广告状态" prop="status" class="">
                                <el-select class="filter-item" v-model="searchForm.status" placeholder="请选择" clearable>
                                    <el-option v-for="state in statusOptions" :key="state.id" :value="state.id" :label="state.name" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="广告时间" prop="adv_time" class="long-time">
                                <el-date-picker
                                    class="filter-item"
                                    v-model="searchForm.adv_time"
                                    type="datetimerange"
                                    align="left"
                                    range-separator="至"
                                    start-placeholder="开始时间"
                                    end-placeholder="结束时间"
                                    value-format="yyyy-MM-dd HH:mm:ss"
                                    :default-time="['00:00:00', '23:59:59']"
                                >
                                </el-date-picker>
                            </el-form-item>
                            <el-form-item class="form-item-btn" label="">
                                <el-button class="filter-btn" @click="resetForm('searchForm')">重置</el-button>
                                <el-button class="filter-btn" type="primary" @click="handleSearch()">搜索</el-button>
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
                <el-button type="primary" style="margin-right: 24px" @click="handleAdd" v-hasPermission="'mall-backend-adv-create'">新增广告</el-button>
            </div>
            <el-table v-loading="loading" :data="tableData" ref="multipleTable" class="order-list-table" :height="tableHeight" :header-cell-style="$tableHeaderColor">
                <el-table-column label="操作" width="110">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            class="marginLeft0 marginRight15"
                            :class="{ 'delete-color': scope.row.status > 1 }"
                            v-hasPermission="'mall-backend-adv-change-status'"
                            @click="handleChangeStatus(scope.$index, scope.row)"
                            >{{ scope.row.status > 1 ? '下架' : '上架' }}</el-button
                        >
                        <el-button type="text" class="marginLeft0" v-hasPermission="'mall-backend-adv-update'" @click="handleEditOrCopy(scope.$index, scope.row, 'edit')"
                            >编辑</el-button
                        >
                    </template>
                </el-table-column>
                <el-table-column prop="id" label="ID" width="60"></el-table-column>
                <el-table-column prop="status" label="状态" width="90">
                    <template slot-scope="scope">
                        <span class="order-status" :class="statusClass(scope.row.status)">{{ scope.row.status > 1 ? '已上架' : '已下架' }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="图片" width="120">
                    <template slot-scope="scope">
                        <img class="list-img" :src="getImg(scope.row.logo)" alt="" @click="viewBigImg(scope.row.logo, scope.$index)" />
                    </template>
                </el-table-column>
                <el-table-column prop="title" label="广告名称" width="200"></el-table-column>
                <el-table-column prop="location" label="location" width="120">
                    <template slot-scope="scope">
                        <span>{{ scope.row.location > 1 ? '首页分享位' : '首页banner位' }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="shop_name" label="应用店铺" width="140"></el-table-column>
                <el-table-column label="link" class="" width="300">
                    <template slot-scope="scope">
                        {{ scope.row.link || '' }}
                    </template>
                </el-table-column>
                <el-table-column label="描述" prop="description" class="" width="300"></el-table-column>

                <el-table-column label="时间" width="176">
                    <template slot-scope="scope"> {{ scope.row.start_time }} - {{ scope.row.end_time || '无限制' }} </template>
                </el-table-column>
                <template slot="empty">
                    <EmptyList v-show="false"></EmptyList>
                </template>
            </el-table>
            <div class="pagination-container">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="pageInfo.pageIndex"
                    :page-size="pageInfo.pageSize"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
            <div class="empty-list-box" v-show="tableData.length === 0">
                <EmptyList></EmptyList>
            </div>
        </div>
        <!--大图预览-->
        <el-image-viewer v-if="dialogVisible" :on-close="closeViewer" :url-list="imgSrcList" :initial-index="previewIndex" />
    </div>
</template>

<script>
import { queryAdvList, updateAdvStatus } from '../../../../api/activity'
import EmptyList from '../../../common/empty-list/EmptyList'
import './adv.less'
import { queryShopList } from '@/api/goods'
import IssueRecord from '../../../common/issue-record/IssueRecord.vue'
import ElImageViewer from '../../..//common/image-viewer'
import commUtil from '@/utils/commUtil'
import { getToken } from '@/utils/auth'

export default {
    name: 'AdvList',
    data() {
        return {
            searchForm: {
                title: '', // 优惠券名称
                location: '', // 位置
                status: '', // 优惠券状态
                shop_id: '', // 优惠券店铺
                adv_time: [] // 广告时间
            },
            searchParams: {
                title: '', // 优惠券名称
                location: '', // 位置
                status: '', // 优惠券状态
                shop_id: '', // 优惠券店铺
                adv_time: [] // 广告时间
            },
            pageInfo: {
                name: '',
                pageIndex: 1,
                pageSize: 10
            },
            loading: false,
            tableData: [],
            pageTotal: 0, // 总条数
            id: -1,
            statusOptions: [
                { id: 2, name: '上架' },
                { id: 1, name: '下架' }
            ], // 状态下拉
            shopOptions: [], // 代理店铺下拉列表
            locationOptions: [
                { id: 1, name: '首页banner位' },
                { id: 2, name: '首页分享位' }
            ], // location下拉列表
            tableHeight: 'calc(100vh - 194px)',
            imgSrcList: [],
            previewIndex: 0,
            dialogVisible: false,
            searchShow: false,
            searchList: [],
            showMaxIndex: 0
        }
    },
    components: {
        EmptyList,
        IssueRecord,
        ElImageViewer
    },
    computed: {
        statusClass: function() {
            return data => {
                if (data === 0) {
                    return 'order-paid'
                } else if (data === 1) {
                    return 'order-cancelled'
                } else if (data === 2) {
                    return 'order-paid'
                }
            }
        },
        useGoods: function() {
            let str = ''
            return data => {
                if (data === 1) {
                    str = '全场可用'
                } else if (data === 2) {
                    str = '指定商品'
                } else if (data === 3) {
                    str = '指定标签'
                }
                return str
            }
        },
        //  拼接图片地址
        getImg: function() {
            return data => {
                if (data) {
                    return data + '!/fw/' + 80
                }
            }
        }
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
        this.queryShopList() // 获取代理店铺列表
        // 获取订单列表数据
        this.getListData()
    },
    methods: {
        // 请求-获取订单列表数据
        getListData() {
            let time_start,
                time_end,
                start_time = 0,
                end_time = 0
            // console.log('this.searchParams.adv_time', this.searchParams.adv_time);
            if (this.searchParams.adv_time.length > 0) {
                time_start = this.getTime(this.searchParams.adv_time[0]).toString()
                time_end = this.getTime(this.searchParams.adv_time[1]).toString()
                time_start = new Date(time_start)
                time_end = new Date(time_end)
                start_time = time_start.getTime() / 1000
                end_time = time_end.getTime() / 1000
            }
            let params = {
                page: this.pageInfo.pageIndex,
                limit: this.pageInfo.pageSize,
                title: this.searchParams.title,
                location: this.searchParams.location > 0 ? this.searchParams.location : -1,
                status: this.searchParams.status > 0 ? this.searchParams.status : -1,
                shop_id: this.searchParams.shop_id ? this.searchParams.shop_id : -1,
                start_time: start_time || -1,
                end_time: end_time || -1
            }
            const rLoading = this.openLoading()
            queryAdvList(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        if (res.data.lists) {
                            this.tableData = res.data.lists
                            this.pageTotal = res.data.total
                            this.imgSrcList = []
                            this.previewIndex = 0
                            this.tableData.forEach(ev => {
                                this.imgSrcList.push(ev.logo + '!/fw/640')
                            })
                        } else {
                            this.tableData = []
                            this.pageTotal = 0
                        }
                    } else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        })
                    }
                })
                .catch(() => {})
        },

        // 代理店铺列表
        queryShopList() {
            queryShopList()
                .then(res => {
                    this.shopOptions = res.data || []
                })
                .catch(err => {})
        },

        // 按钮 - 重置
        resetForm(formName) {
            this.$refs[formName].resetFields()
            this.handleSearch()
        },

        // 按钮-触发搜索按钮
        handleSearch() {
            this.$set(this.pageInfo, 'pageIndex', 1)
            // 存储搜索条件
            this.searchParams = _.cloneDeep(this.searchForm)
            this.searchShow = false
            this.setSearchValue()
            this.getListData()
        },

        // 设置显示的搜索条件
        setSearchValue() {
            let _search = []
            // 广告名称 coupon_title
            if (this.searchParams['title']) {
                let obj = {
                    label: 'title',
                    val: this.searchParams['title']
                }
                _search.push(obj)
            }
            // location
            if (this.searchParams['location']) {
                this.locationOptions.forEach(ev => {
                    if (ev.id == this.searchParams['location']) {
                        let obj = {
                            label: 'location',
                            val: ev.name
                        }
                        _search.push(obj)
                    }
                })
            }

            // 应用店铺 shop_id
            if (this.searchParams['shop_id']) {
                this.shopOptions.forEach(ev => {
                    if (ev.id == this.searchParams['shop_id']) {
                        let obj = {
                            label: 'shop_id',
                            val: ev.shop_name
                        }
                        _search.push(obj)
                    }
                })
            }

            // 广告状态 status
            if (this.searchParams['status']) {
                this.statusOptions.forEach(ev => {
                    if (ev.id == this.searchParams['status']) {
                        let obj = {
                            label: 'status',
                            val: ev.name
                        }
                        _search.push(obj)
                    }
                })
            }

            // 广告时间 adv_time
            if (this.searchParams['adv_time'] && this.searchParams['adv_time'].length === 2) {
                console.log('adv_time', this.searchParams.adv_time)
                console.log('111', this.$moment(this.searchParams.adv_time[0]).format('YYYY-MM-DD '))
                let _ge_arr = this.$moment(this.searchParams.adv_time[0])
                    .format('YYYY-MM-DD ')
                    .split('-')
                let _le_arr = this.$moment(this.searchParams.adv_time[1])
                    .format('YYYY-MM-DD ')
                    .split('-')
                //  + ' '+ this.searchParams['created_time_ge'].split(' ')[1]
                let _ge = _ge_arr[1] + '.' + _ge_arr[2]
                //  + ' '+ this.searchParams['created_time_le'].split(' ')[1]
                let _le = _le_arr[1] + '.' + _le_arr[2]
                let obj = {
                    label: 'adv_time',
                    val: _ge + ' - ' + _le
                }
                _search.push(obj)
            }
            this.searchList = _.cloneDeep(_search)
            console.log('this.searchList', this.searchList)
        },

        // 清除单个搜索条件
        closeSearchItem(item, i) {
            this.$set(this.searchForm, item.label, '')
            this.$set(this.searchParams, item.label, '')
            if (item.label == 'adv_time') {
                this.$set(this.searchParams, 'adv_time', [])
                this.$set(this.searchForm, 'adv_time', [])
            }

            this.handleSearch()
        },

        // 按钮-分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val)
            this.searchForm = _.cloneDeep(this.searchParams)
            this.getListData()
        },
        // 上架/下架
        handleChangeStatus(index, row) {
            let params = {
                id: Number(row.id)
            }
            if (row.status < 2) {
                // 上架
                params['status'] = 2
                this.changeStatus(params)
            } else {
                // 下架
                // 二次确认
                this.$confirm('确定要下架该广告吗？', '', {
                    customClass: 'message-delete',
                    type: 'warning'
                })
                    .then(() => {
                        params['status'] = 1
                        this.changeStatus(params)
                    })
                    .catch(() => {})
            }
        },
        // 改变状态
        changeStatus(params) {
            const rLoading = this.openLoading()
            updateAdvStatus(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        this.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        this.getListData()
                    } else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        })
                    }
                })
                .catch(() => {})
        },
        //
        handleAdd() {
            this.$router.push({ path: '/mall-backend-adv-create' })
        },

        // 编辑/复制优惠券
        handleEditOrCopy(index, row, status) {
            this.$router.push({
                path: status === 'edit' ? '/mall-backend-adv-update' : '/mall-backend-adv-copy',
                query: { id: row.id, status }
            })
        },

        // 查看大图
        viewBigImg(pic_url, index) {
            if (pic_url) {
                this.bigImgUrl = pic_url + '!/fw/640'
                // this.$refs.bigImg.show();
                this.previewIndex = index
                this.dialogVisible = true
            }
        },
        closeViewer() {
            this.dialogVisible = false
        },
        //时间格式化
        getTime(val) {
            if (val) {
                const dt = new Date(val)
                let year = dt.getFullYear() //年
                let month = dt.getMonth() + 1 //月
                let date = dt.getDate() //日
                let hh = dt.getHours() //时
                let mm = dt.getMinutes() //分
                let ss = dt.getSeconds() //秒
                month = month < 10 ? '0' + month : month
                date = date < 10 ? '0' + date : date
                hh = hh < 10 ? '0' + hh : hh
                mm = mm < 10 ? '0' + mm : mm
                ss = ss < 10 ? '0' + ss : ss
                let new_time = ''
                new_time = year + '-' + month + '-' + date + ' ' + hh + ':' + mm + ':' + ss
                return new_time
            } else {
                return '-1'
            }
        }
    }
}
</script>

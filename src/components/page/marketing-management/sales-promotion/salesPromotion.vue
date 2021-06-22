<template>
    <div class="order-list-container" id="containerWrap" @click.stop="searchShow = false">
        <div class="container container-table-has-search p-t-0 pos-relative">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">促销管理</div>
                <div class="grey-line"></div>
                <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
                <transition name="slide-fade">
                    <div class="container clearfix head-container" ref="searchBox" v-show="searchShow" @click.stop="">
                        <el-form :model="searchForm" :inline="true" ref="searchForm" size="small" label-position="left">
                            <el-form-item label="促销名称" prop="title" class="">
                                <el-input class="filter-item" v-model="searchForm.title" placeholder="请输入" @keyup.enter.native="handleSearch()"></el-input>
                            </el-form-item>
                            <el-form-item label="类型" prop="type" class="">
                                <el-select class="filter-item" v-model="searchForm.type" placeholder="请选择" clearable>
                                    <el-option v-for="state in typeOptions" :key="state.id" :value="state.id" :label="state.name" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="店铺" prop="shop_id" class="">
                                <el-select class="filter-item" v-model="searchForm.shop_id" placeholder="请选择" clearable>
                                    <el-option v-for="state in shopOptions" :key="state.id" :value="state.id" :label="state.shop_name" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="状态" prop="status" class="">
                                <el-select class="filter-item" v-model="searchForm.status" placeholder="请选择" clearable>
                                    <el-option v-for="state in statusOptions" :key="state.id" :value="state.id" :label="state.name" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="促销时间" prop="adv_time" class="long-time">
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
                                    :picker-options="pickerOptions"
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
                <el-button type="primary" style="margin-right: 24px" @click="handleAdd" v-hasPermission="'mall-backend-promotion-create'">新增</el-button>
            </div>
            <el-table v-loading="loading" :data="tableData" ref="multipleTable" class="order-list-table" :height="tableHeight" :header-cell-style="$tableHeaderColor">
                <el-table-column prop="title" label="促销名称"></el-table-column>
                <el-table-column prop="type" label="促销类型" width="120">
                    <template slot-scope="scope">
                        <span>{{ backType(scope.row.type) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="促销时间" width="350">
                    <template slot-scope="scope"> {{$moment(scope.row.startTime).format('YYYY-MM-DD HH:mm:ss')}} 至 {{ $moment(scope.row.endTime).format('YYYY-MM-DD HH:mm:ss') }} </template>
                </el-table-column>
                <el-table-column label="可用店铺" width="140">
                    <template slot-scope="scope">
                        <span>{{ backShopName(scope.row.shopId) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="110">
                    <template slot-scope="scope">
                        <span class="order-status" :class="statusClass(scope.row.status)">{{ scope.row.status > 1 ? '已上架' : '已下架' }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                class="marginLeft0 marginRight15"
                                :class="{ 'delete-color': scope.row.status > 1 }"
                                v-hasPermission="'mall-backend-promotion-change-status'"
                                @click="handleChangeStatus(scope.$index, scope.row)"
                        >{{ scope.row.status > 1 ? '下架' : '上架' }}</el-button
                        >
                        <el-button type="text" class="marginLeft0" v-hasPermission="'mall-backend-promotion-update'" @click="handleEditOrCopy(scope.$index, scope.row, 'edit')"
                        >编辑</el-button
                        >
                    </template>
                </el-table-column>
                <template slot="empty">
                    <EmptyList></EmptyList>
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
        </div>
        <!--大图预览-->
<!--        <el-image-viewer v-if="dialogVisible" :on-close="closeViewer" :url-list="imgSrcList" :initial-index="previewIndex" />-->
    </div>
</template>

<script>

import { queryList, changeStatus } from '@/api/promotion'
import { queryAdvList, updateAdvStatus } from '../../../../api/activity'
import EmptyList from '../../../common/empty-list/EmptyList'
import './salesPromotion.less'
import { queryShopList } from '@/api/goods'
import IssueRecord from '../../../common/issue-record/IssueRecord.vue'
import ElImageViewer from '../../..//common/image-viewer'
import commUtil from '@/utils/commUtil'
import { getToken } from '@/utils/auth'
import bus from '@/components/common/bus'

export default {
    name: 'AdvList',
    data() {
        return {
            searchForm: {
                title: '', // 名称
                type: '', // 类型
                status: '', // 状态
                shop_id: '', // 店铺
                adv_time: '' // 促销时间
            },
            searchParams: {
                title: '', // 优惠券名称
                type: '', // 位置
                status: '', // 优惠券状态
                shop_id: '', // 优惠券店铺
                adv_time: '' // 广告时间
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
            ], // 状态下拉 下架1 上架2
            shopOptions: [], // 代理店铺下拉列表
            typeOptions: [
                { id: '1', name: '每满减' },
                { id: '2', name: '满减' },
                { id: '3', name: '满折' },
                { id: '4', name: '满件折' },
                { id: '5', name: '加价购' },
                { id: '6', name: '满券' }
            ],
            tableHeight: 'calc(100vh - 194px)',
            imgSrcList: [],
            previewIndex: 0,
            dialogVisible: false,
            searchShow: false,
            searchList: [],
            showMaxIndex: 0,
            pickerOptions: {
                shortcuts: [
                    {
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1) // 当天23:59
                            const start = new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0))
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1) // 当天23:59
                            const start = new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0))
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                            picker.$emit('pick', [start, end])
                        }
                    },
                    {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1) // 当天23:59
                            const start = new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0))
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                            picker.$emit('pick', [start, end])
                        }
                    }
                ]
            },
        }
    },
    components: {
        EmptyList,
        IssueRecord,
        ElImageViewer
    },
    computed: {
        backShopName: function() {
            let shop_name = '';
            return data => {
                const filter_arr = this.shopOptions.filter(item => {
                    return item.id == data;
                });
                if (filter_arr.length > 0) {
                    shop_name = filter_arr[0].shop_name;
                }
                return shop_name;
            };
        },
        backType: function() {
            return data => {
                if (data == 1) {
                    return '每满减'
                } else if (data == 2) {
                    return '满减'
                } else if (data == 3) {
                    return '满折'
                } else if (data == 4) {
                    return '满件折'
                } else if (data == 5) {
                    return '加价购'
                } else if (data == 6) {
                    return '满券'
                }
            }
        },
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
    created() {
        bus.$on('refreshPromotionList', target => {
            // console.log(target);
            if(target==='add'){
                this.$set(this.pageInfo, 'pageIndex', 1);
                this.resetForm('searchForm')
            } else {
                // this.getProductList();
                this.getListData()
            }

        });
    },
    mounted() {
        this.queryShopList() // 获取代理店铺列表
    },
    methods: {
        // 请求-获取订单列表数据
        getListData() {
            let time_start,
                time_end,
                start_time = 0,
                end_time = 0
            if (this.searchParams.adv_time && this.searchParams.adv_time.length > 0) {
                time_start = this.getTime(this.searchParams.adv_time[0]).toString()
                time_end = this.getTime(this.searchParams.adv_time[1]).toString()
                time_start = new Date(time_start)
                time_end = new Date(time_end)
                start_time = time_start.getTime() / 1000
                end_time = time_end.getTime() / 1000
            }
            let params = {
                status: this.searchParams.status > 0 ? this.searchParams.status : 0,
                pi: this.pageInfo.pageIndex,
                ps: this.pageInfo.pageSize,
                shopId: this.searchParams.shop_id ? this.searchParams.shop_id : 0,
                title: this.searchParams.title,
                startTime: start_time || 0,
                endTime: end_time || 0,
                type: Number(this.searchParams.type) || 0 //1每满减 2满减 3满折 4满件折 5加价购 6满卷
            }
            const rLoading = this.openLoading()
            queryList(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        if (res.data.list) {
                            this.tableData = res.data.list
                            this.pageTotal = res.data.total
                            this.imgSrcList = []
                            this.previewIndex = 0
                            // this.tableData.forEach(ev => {
                            //     this.imgSrcList.push(ev.logo + '!/fw/640')
                            // })
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
                    // 获取订单列表数据
                    this.getListData()
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
            // 名称 coupon_title
            if (this.searchParams['title']) {
                let obj = {
                    label: 'title',
                    val: this.searchParams['title']
                }
                _search.push(obj)
            }
            if (this.searchParams['type']) {
                this.typeOptions.forEach(ev => {
                    if (ev.id == this.searchParams['type']) {
                        let obj = {
                            label: 'type',
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

            // 状态 status
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

            // 时间 adv_time
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
                promotionId: Number(row.id)
            }
            if (row.status < 2) {
                // 上架
                params['status'] = 2
                this.changeStatus(params)
            } else {
                // 下架
                // 二次确认
                this.$confirm('确定要下架吗？', '', {
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
            changeStatus(params)
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
            this.$router.push({ path: '/mall-backend-sales-promotion-create' })
        },

        // 编辑/复制优惠券
        handleEditOrCopy(index, row, status) {
            this.$router.push({
                path: status === 'edit' ? '/mall-backend-sales-promotion-update' : '/mall-backend-adv-copy',
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

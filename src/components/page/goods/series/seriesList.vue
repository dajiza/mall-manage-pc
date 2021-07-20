<template>
    <div class="goods-series-container" id="containerWrap" @click="searchShow = false">
        <div class="container container-table-has-search p-t-0 pos-relative">
            <div class="table-title">
                <div class="line"></div>
                <div class="text">商品系列</div>
                <div class="grey-line"></div>
                <i class="el-icon-search search" @click.stop="searchShow = !searchShow"></i>
                <transition name="slide-fade">
                    <div class="container clearfix head-container" ref="searchBox" v-show="searchShow" @click.stop="">
                        <el-form :model="searchForm" :inline="true" ref="searchForm" size="small" label-position="left" @keydown.enter.native="handleSearch()">
                            <el-form-item label="系列名称" prop="title" class="">
                                <el-input class="filter-item" v-model="searchForm.title" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="店铺" prop="shop_id" class="">
                                <el-select class="filter-item" v-model="searchForm.shop_id" placeholder="请选择" clearable>
                                    <el-option v-for="state in shopOptions" :key="state.id" :value="state.id" :label="state.shop_name" />
                                </el-select>
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
                <el-button style="margin-right: 24px" type="primary" @click="handleAdd" v-hasPermission="'mall-backend-goods-series-create'">新增</el-button>
            </div>
            <el-table v-loading="loading" :data="tableData" ref="multipleTable" class="order-list-table" :height="tableHeight" :header-cell-style="$tableHeaderColor">
                <el-table-column prop="id" label="系列ID" width="100"></el-table-column>
                <el-table-column prop="title" label="系列名称"></el-table-column>
                <el-table-column prop="shop_name" label="可用店铺" width="180">
                    <template slot-scope="scope">{{backShopName(scope.row.shop_id)}}</template>
                </el-table-column>
                <el-table-column prop="goods_count" label="包含商品数" width="180"></el-table-column>
                <el-table-column label="操作" width="190">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                class="marginLeft0 marginRight15"
                                v-hasPermission="'mall-backend-goods-series-update'"
                                @click="handleEditOrCopy(scope.$index, scope.row, 'edit')"
                        >编辑</el-button>
                        <el-button
                                type="text"
                                class="marginLeft0 delete-color marginRight15"
                                v-hasPermission="'mall-backend-goods-series-delete'"
                                @click="handleDelete(scope.$index, scope.row)"
                        >删除</el-button>
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
    </div>
</template>

<script>
import { queryGoodsSeriesList, deleteGoodsSeries } from '../../../../api/goodsSeries'
import EmptyList from '../../../common/empty-list/EmptyList'
import './series.less'
import { queryShopList } from '@/api/goods'
import commUtil from '@/utils/commUtil'
import { getToken } from '@/utils/auth'
import bus from '@/components/common/bus'

export default {
    name: 'OrderList',
    data() {
        return {
            searchForm: {
                title: '', // 优惠券名称
                shop_id: '' // 优惠券店铺
            },
            searchParams: {
                title: '', // 名称
                shop_id: '' // 店铺
            },
            pageInfo: {
                pageIndex: 1,
                pageSize: 10
            },
            loading: false,
            tableData: [],
            pageTotal: 0, // 总条数
            id: -1,
            shopOptions: [], // 代理店铺下拉列表
            tableHeight: 'calc(100vh - 194px)',
            searchShow: false,
            searchList: [],
            showMaxIndex: 0,

        }
    },
    components: {
        EmptyList
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
    computed: {
        backShopName: function () {
            let shop_name = ''
            return (data) => {
                if(data){
                    this.shopOptions.forEach((ev)=>{
                        if(ev.id == data) {
                            shop_name = ev.shop_name
                        }
                    })
                    return shop_name
                }
            }
        }
    },
    created() {
        bus.$on('refreshGoodsSeriesList', target => {
            // console.log(target);
            if(target==='add'){
                this.$set(this.pageInfo, 'pageIndex', 1);
                this.resetForm('searchForm')
            } else {
                this.getListData();
            }

        });
    },
    mounted() {
        this.queryShopList() // 获取代理店铺列表
    },
    methods: {
        // 请求-获取订单列表数据
        getListData() {
            let params = {
                page: this.pageInfo.pageIndex,
                limit: this.pageInfo.pageSize,
                title: this.searchParams.title,
                shop_id: this.searchParams.shop_id ? this.searchParams.shop_id : -1,
            }
            const rLoading = this.openLoading()
            queryGoodsSeriesList(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        if (res.data.list) {
                            this.tableData = res.data.list
                            this.pageTotal = res.data.total
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
                    // 获取列表数据
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
            console.log('this.searchParams', this.searchParams)
            // 名称 title
            if (this.searchParams['title']) {
                let obj = {
                    label: 'title',
                    val: this.searchParams['title']
                }
                _search.push(obj)
            }
            // 可用店铺 shop_id
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
            this.searchList = _.cloneDeep(_search)
        },

        // 清除单个搜索条件
        closeSearchItem(item, i) {
            console.log('item',item)
            this.$set(this.searchForm, item.label, '')
            this.$set(this.searchParams, item.label, '')
            this.handleSearch()
        },

        // 按钮-分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val)
            this.searchForm = _.cloneDeep(this.searchParams)
            this.getListData()
        },

        // 新增
        handleAdd() {
            this.$router.push({ path: '/mall-backend-goods-series-create' })
        },

        // 编辑/复制
        handleEditOrCopy(index, row, status) {
            this.$router.push({
                path: status === 'edit' ? '/mall-backend-goods-series-update' : '/mall-backend-coupons-copy',
                query: { id: row.id, status }
            })
        },

        // 删除
        handleDelete(i, row) {
            // 二次确认删除
            this.$confirm('确定要删除该系列吗？', '', {
                customClass: 'message-delete',
                type: 'warning'
            })
                .then(() => {
                    let params = {
                        id: row.id
                    }
                    this.getSeriesDelete(params)
                })
                .catch(() => {})
        },

        // 请求- 删除
        getSeriesDelete(params) {
            const rLoading = this.openLoading()
            deleteGoodsSeries(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        this.$notify({
                            title: '删除成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        // 如果当前页大于1 且 当前页只有1条时  删除后 页码-1
                        if(this.pageInfo.pageIndex > 1 && this.tableData.length < 2){
                            this.$set(this.pageInfo, 'pageIndex', this.pageInfo.pageIndex - 1);
                        }
                        // 获取原因列表
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
    }
}
</script>

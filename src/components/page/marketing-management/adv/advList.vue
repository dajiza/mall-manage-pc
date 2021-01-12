<template>
    <div class="order-list-container" id="containerWrap">
        <div class="container clearfix head-container" ref="searchBox">
            <el-form :model="searchForm" :inline="true" ref="searchForm" size="small" label-position="left">
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
                <el-form-item label="广告时间" prop="pay_time" class="long-time">
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
                    <el-button class="filter-btn" type="primary" @click="handleSearch('searchForm')">搜索</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="container container-table-has-search m-t-16 p-t-0 pos-relative">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>优惠券列表</span>
                </div>
                <el-button type="primary" @click="handleAdd" v-hasPermission="'mall-backend-coupon-create'">新增优惠券</el-button>
            </div>
            <el-table v-loading="loading" :data="tableData" ref="multipleTable" class="order-list-table" :height="$tableHeight" :header-cell-style="$tableHeaderColor">
                <el-table-column label="操作" width="110">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                class="marginLeft0 marginRight15"
                                :class="{'delete-color': scope.row.status > 1}"
                                @click="handleChangeStatus(scope.$index, scope.row)"
                        >{{scope.row.status > 1 ? '下架':'上架'}}</el-button>
                        <el-button
                                type="text"
                                class="marginLeft0"
                                v-hasPermission="'mall-backend-coupon-update'"
                                @click="handleEditOrCopy(scope.$index, scope.row, 'edit')"
                        >编辑</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="id" label="ID" width="70"></el-table-column>
                <el-table-column prop="status" label="状态" width="90">
                    <template slot-scope="scope">
                        <span class="order-status" :class="statusClass(scope.row.status)">{{ scope.row.status > 1 ? '已上架':'已下架' }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="title" label="优惠券名称"></el-table-column>
                <el-table-column label="link" class="">
                    <template slot-scope="scope">
                        {{ scope.row.link || '' }}
                    </template>
                </el-table-column>
                <el-table-column label="描述" prop="description" class=""></el-table-column>
                <el-table-column prop="location" label="location" width="150">
                    <template slot-scope="scope">
                        <span>{{ scope.row.location > 1 ? '首页分享位':'首页banner位' }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="shop_name" label="应用店铺" width="150"></el-table-column>
                <el-table-column label="时间" width="176">
                    <template slot-scope="scope">
                        {{scope.row.start_time}} - {{scope.row.end_time || '无限制'}}
                    </template>
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
    </div>
</template>

<script>
import { queryAdvList, updateAdvStatus } from '../../../../api/activity'
import EmptyList from '../../../common/empty-list/EmptyList'
import './adv.less'
import { queryShopList } from '@/api/goods'
import IssueRecord from '../../../common/issue-record/IssueRecord.vue'
import commUtil from '@/utils/commUtil'
import { getToken } from '@/utils/auth'

export default {
    name: 'OrderList',
    data() {
        return {
            searchForm: {
                title:'', // 优惠券名称
                location:'', // 位置
                status:'', // 优惠券状态
                shop_id:'', // 优惠券店铺
                adv_time:'', // 广告时间
                start_time:'',
                end_time:'',
            },
            searchParams: {
                title:'', // 优惠券名称
                location:'', // 位置
                status:'', // 优惠券状态
                shop_id:'', // 优惠券店铺
                adv_time:'', // 广告时间
                start_time:'',
                end_time:'',
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
            ], // 类型下拉列表
            tableHeight: 'calc(100% - 114px)',
            couponsId:-1
        }
    },
    components: {
        EmptyList,
        IssueRecord
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
            let str = '';
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
    },
    created() {},
    mounted() {
        this.queryShopList(); // 获取代理店铺列表
        // 获取订单列表数据
        this.getListData();
    },
    methods: {
        // 请求-获取订单列表数据
        getListData() {

            let params = {
                page: this.pageInfo.pageIndex,
                limit: this.pageInfo.pageSize,
                title: this.searchParams.title,
                location: -1,
                status: this.searchParams.status > 0 ? this.searchParams.status : -1,
                shop_id: this.searchParams.shop_id ? this.searchParams.shop_id : -1,
                start_time: -1,
                end_time: -1,
            }
            const rLoading = this.openLoading();
            queryAdvList(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        if (res.data.lists) {
                            this.tableData = res.data.lists
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
                })
                .catch(err => {})
        },

        // 按钮 - 重置
        resetForm(formName) {
            this.$refs[formName].resetFields()
            this.searchParams = _.cloneDeep(this.searchForm);
            this.getListData()
        },

        // 按钮-触发搜索按钮
        handleSearch(formName) {
            this.$set(this.pageInfo, 'pageIndex', 1)
            // 存储搜索条件
            this.searchParams = _.cloneDeep(this.searchForm);
            this.getListData();
        },

        // 按钮-分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val);
            this.searchForm = _.cloneDeep(this.searchParams);
            this.getListData();
        },
        // 启用/停用
        handleChangeStatus(index,row){
            this.couponsId = row.id;

        },

        //
        handleAdd(){
            this.$router.push({ path: '/mall-backend-coupons-create' });
        },

        // 编辑/复制优惠券
        handleEditOrCopy(index, row, status) {
            this.$router.push({
                path: status === 'edit' ? '/mall-backend-coupons-edit' : '/mall-backend-coupons-copy',
                query: { id: row.id, status }
            });
        },

        // 确定停用启用
        handleSureChangeStatus(){
            let params = {
                id: this.couponsId
            }
            const rLoading = this.openLoading()
            updateAdvStatus(params)
                .then(res => {
                    rLoading.close();
                    if (res.code === 200) {
                        this.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        })
                        this.getListData();
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

    }
}
</script>

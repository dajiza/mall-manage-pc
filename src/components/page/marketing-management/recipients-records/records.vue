<template>
    <div class="order-list-container" id="containerWrap">
        <div class="container clearfix head-container" ref="searchBox">
            <el-form :model="searchForm" :inline="true" ref="searchForm" size="small" label-position="left">
                <el-form-item label="优惠券名称" prop="coupon_title" class="">
                    <el-input class="filter-item" v-model="searchForm.coupon_title" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="用户微信名" prop="nick_name" class="">
                    <el-input class="filter-item" v-model="searchForm.nick_name" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="用户手机号" prop="phone" class="">
                    <el-input class="filter-item" v-model="searchForm.phone" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="优惠券状态" prop="status" class="">
                    <el-select class="filter-item" v-model="searchForm.status" placeholder="请选择" clearable>
                        <el-option v-for="state in statusOptions" :key="state.id" :value="state.id" :label="state.name" />
                    </el-select>
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
                    <span>领用记录</span>
                </div>
            </div>
            <el-table v-loading="loading" :data="tableData" ref="multipleTable" class="order-list-table" :height="$tableHeight" :header-cell-style="$tableHeaderColor">
                <el-table-column prop="coupon_title" label="优惠券名称"></el-table-column>
                <el-table-column prop="nick_name" label="用户微信名" width="110"></el-table-column>
                <el-table-column prop="phone" label="用户手机号" width="110"></el-table-column>
                <el-table-column prop="shop_name" label="所属店铺"></el-table-column>
                <el-table-column prop="order_no" label="获取途径" width="110">
                    <template slot-scope="scope">{{scope.row.source > 1 ? '前台发放':'后台excel导入'}}</template>
                </el-table-column>
                <el-table-column prop="get_time" label="领取时间" width="168"></el-table-column>
                <el-table-column prop="use_time" label="使用时间" width="168"></el-table-column>
                <el-table-column prop="price_total_detail_end" label="状态" width="80">
                    <template slot-scope="scope">{{scope.row.status > 1 ? '已使用':'未使用'}}</template>
                </el-table-column>
                <el-table-column prop="order_no" label="订单号" width="155"></el-table-column>
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
import { couponSendUserRecord } from '../../../../api/coupons'
import EmptyList from '../../../common/empty-list/EmptyList'
import './records.less'
export default {
    name: 'OrderList',
    data() {
        return {
            searchForm: {
                coupon_title:'', // 优惠券名称
                nick_name:'', // 铜壶微信名
                status:'', // 优惠券状态
                phone:'' // 用户手机号
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
            channelOptions: [], // 购买渠道下拉列表
            statusOptions: [], // 状态下拉
            shopOptions: [], // 代理店铺下拉列表
            searchParams: {
                coupon_title:'', // 优惠券名称
                nick_name:'', // 微信名
                status:'', // 优惠券状态
                phone:'' // 用户手机号
            },
            tableHeight: 'calc(100% - 134px)',
        }
    },
    components: {
        EmptyList
    },
    computed: {

    },
    created() {
        // 状态 下拉列表
        this.statusOptions = [
            { id: 1, name: '已启用' },
            { id: 2, name: '已停用' },
        ]
    },
    mounted() {
        // 获取列表数据
        this.getListData();
    },
    methods: {
        // 请求-获取订单列表数据
        getListData() {
            let params = {
                page: this.pageInfo.pageIndex,
                limit: this.pageInfo.pageSize,
                coupon_id: -1,
                coupon_title: this.searchParams.coupon_title ? this.searchParams.coupon_title : '',
                nick_name: this.searchParams.nick_name ? this.searchParams.nick_name : '',
                phone: this.searchParams.phone ? this.searchParams.phone : '',
                status: this.searchParams.status > 0 ? this.searchParams.status : -1,
            }
            const rLoading = this.openLoading()
            couponSendUserRecord(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        if (res.data.lists) {
                            this.tableData = res.data.lists;
                            this.pageTotal = res.data.total;
                        } else {
                            this.tableData = [];
                            this.pageTotal = 0;
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

        // 按钮 - 重置
        resetForm(formName) {
            this.$refs[formName].resetFields();
            this.$set(this.searchParams, 'coupon_title', '');
            this.$set(this.searchParams, 'status', '');
            this.$set(this.searchParams, 'nick_name', '');
            this.$set(this.searchParams, 'phone', '');
            this.getListData();
        },

        // 按钮-触发搜索按钮
        handleSearch(formName) {
            this.$set(this.pageInfo, 'pageIndex', 1)
            //  存储搜索条件
            this.$set(this.searchParams, 'coupon_title', this.searchForm.coupon_title);
            this.$set(this.searchParams, 'status', this.searchForm.status);
            this.$set(this.searchParams, 'nick_name', this.searchForm.nick_name);
            this.$set(this.searchParams, 'phone', this.searchForm.phone);
            this.getListData()
        },

        // 按钮-分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val)
            if (this.searchParams['status'] > 0) {
                this.$set(this.searchForm, 'status', this.searchParams['status'])
            }
            if (this.searchParams['coupon_title']) {
                this.$set(this.searchForm, 'name', this.searchParams['coupon_title'])
            }
            if (this.searchParams['nick_name']) {
                this.$set(this.searchForm, 'nick_name', this.searchParams['nick_name'])
            }
            if (this.searchParams['phone']) {
                this.$set(this.searchForm, 'phone', this.searchParams['phone'])
            }
            this.getListData()
        }
    }
}
</script>

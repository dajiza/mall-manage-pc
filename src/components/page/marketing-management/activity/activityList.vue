<template>
    <div class="order-list-container" id="containerWrap">
        <div class="container clearfix head-container" ref="searchBox" v-if="false">
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
        <!--m-t-16-->
        <div class="container container-table-has-search p-t-0 pos-relative">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>活动管理</span>
                </div>
            </div>
            <el-table v-loading="loading" :data="tableData" ref="multipleTable" class="order-list-table" :height="$tableHeight" :header-cell-style="$tableHeaderColor">
                <el-table-column prop="id" label="ID" width="90"></el-table-column>
                <el-table-column prop="coupon_title" label="活动名称"></el-table-column>
                <el-table-column prop="phone" label="活动优惠类型" width="160"></el-table-column>
                <el-table-column prop="shop_name" label="应用店铺" width="160"></el-table-column>
                <el-table-column label="活动优惠类型_id" width="160">
                    <template slot-scope="scope">优惠券的名称</template>
                </el-table-column>
                <el-table-column prop="get_time" label="时间" width="184">
                    <template slot-scope="scope">{{scope.row.get_time}}</template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template slot-scope="scope">
                        <span class="order-status" :class="statusClass(scope.row.status)">{{ scope.row.status > 1 ? '已停用':'已启用' }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="110">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            class="marginLeft0 marginRight15"
                            v-if="scope.row.status > 1"
                            @click="handleChangeStatus(scope.$index, scope.row)"
                        >启用</el-button>
                        <el-button
                            type="text"
                            class="marginLeft0 delete-color marginRight15"
                            v-else
                            @click="handleChangeStatus(scope.$index, scope.row)"
                        >停用</el-button>
                    </template>
                </el-table-column>
                <template slot="empty">
                    <EmptyList></EmptyList>
                </template>
            </el-table>
            <div class="pagination-container">
                <el-pagination
                    background
                    layout="total, prev, pager, next, jumper"
                    :current-page="pageInfo.pageIndex"
                    :page-size="pageInfo.pageSize"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                    @size-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>
    </div>
</template>

<script>
import { couponSendUserRecord } from '../../../../api/coupons'
import EmptyList from '../../../common/empty-list/EmptyList'
import './activity.less'
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
            activityId: -1,
        }
    },
    components: {
        EmptyList
    },
    computed: {
        statusClass: function() {
            return data => {
                if (data === 0) {
                    return 'order-paid'
                } else if (data === 1) {
                    return 'order-paid'
                } else if (data === 2) {
                    return 'order-cancelled'
                }
            }
        },
    },
    created() {
        // 状态 下拉列表
        this.statusOptions = [
            { id: 1, name: '已使用' },
            { id: 2, name: '未使用' },
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
            // this.searchParams = _.cloneDeep(this.searchForm);
            this.getListData();
        },

        // 按钮-触发搜索按钮
        handleSearch(formName) {
            this.$set(this.pageInfo, 'pageIndex', 1)
            //  存储搜索条件
            // this.searchParams = _.cloneDeep(this.searchForm);
            this.getListData()
        },

        // 按钮-分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val)
            // this.searchForm = _.cloneDeep(this.searchParams);
            this.getListData()
        },
        // 启用/停用
        handleChangeStatus(index,row){
            this.activityId = row.id;
            if(row.status > 1){
                // 启用
                this.changeStatus();
            }else {
                // 停用
                // 二次确认
                this.$confirm('确定要停用该活动吗？', '', {
                    customClass: 'message-delete',
                    type: 'warning',
                    center: true
                }).then(() => {
                    let params = {
                        type: this.selectedType
                    };
                    params['id'] = row.id;
                    this.changeStatus(params);
                }).catch(() => {});
            }
            this.reasonDialog = true;
        },
        // 改变状态
        changeStatus(){
            const params = {};
            const rLoading = this.openLoading();
            couponSendUserRecord(params)
                .then(res => {
                    rLoading.close()
                    if (res.code === 200) {
                        this.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        });
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
                .catch(() => {})
        }
    }
}
</script>

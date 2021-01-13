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
            <el-table v-loading="loading" :data="tableData" ref="multipleTable" class="order-list-table" :height="tableHeight" :header-cell-style="$tableHeaderColor">
                <el-table-column prop="id" label="ID" width="90"></el-table-column>
                <el-table-column prop="name" label="活动名称"></el-table-column>
                <el-table-column prop="phone" label="活动优惠类型" width="150">
                    <template slot-scope="scope">{{typeBack(scope.row.type)}}</template>
                </el-table-column>
                <el-table-column prop="shop_name" label="应用店铺" width="160"></el-table-column>
                <el-table-column label="活动优惠类型_id" width="160">
                    <template slot-scope="scope">优惠券的名称</template>
                </el-table-column>
                <el-table-column prop="get_time" label="时间" width="184">
                    <template slot-scope="scope">{{scope.row.start_time}} - {{scope.row.end_time || '无限制'}}</template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template slot-scope="scope">
                        <span class="order-status" :class="statusClass(scope.row.status)">{{ scope.row.status > 1 ? '已启用':'已停用' }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="110">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            class="marginLeft0 delete-color marginRight15"
                            v-if="scope.row.status > 1"
                            @click="handleChangeStatus(scope.$index, scope.row)"
                        >停用</el-button>
                        <el-button
                            type="text"
                            class="marginLeft0 marginRight15"
                            v-else
                            @click="handleChangeStatus(scope.$index, scope.row)"
                        >启用</el-button>
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
import { queryActivityList, updateActivityStatus } from '../../../../api/activity'
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
            tableHeight: 'calc(100vh - 244px)',
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
                    return 'order-cancelled'
                } else if (data === 2) {
                    return 'order-paid'
                }
            }
        },
        typeBack: function() {
            let _type = '';
            return data => {
                if (data === 1) {
                    _type = '优惠券';
                }
                return _type
            }
        },
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
            /* coupon_id: -1,
                coupon_title: this.searchParams.coupon_title ? this.searchParams.coupon_title : '',
                nick_name: this.searchParams.nick_name ? this.searchParams.nick_name : '',
                phone: this.searchParams.phone ? this.searchParams.phone : '',
                status: this.searchParams.status > 0 ? this.searchParams.status : -1,
            */
            let params = {
                page: this.pageInfo.pageIndex,
                limit: this.pageInfo.pageSize
            }
            const rLoading = this.openLoading()
            queryActivityList(params)
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
            this.getListData();
        },
        // 启用/停用
        handleChangeStatus(index,row){
            let _start = this.getTime(row.start_time).toString();
            _start = new Date(_start);
            let _end ;
            let has_end = false;
            if(row.end_time){
                has_end = true;
                _end = this.getTime(row.end_time).toString() || 0;
                _end = new Date(_end);
            }else {

            }
            this.activityId = row.id;
            let params = {
                id: row.id,
                start_time: _start.getTime()/1000,
                end_time: has_end ? _end.getTime()/1000 : 0
            };
            if(row.status < 2){
                // 启用
                params['status'] = 2;
                this.changeStatus(params);
            }else {
                // 停用
                // 二次确认
                this.$confirm('确定要停用该活动吗？', '', {
                    customClass: 'message-delete',
                    type: 'warning',
                    center: true
                }).then(() => {
                    params['status'] = 1;
                    this.changeStatus(params);
                }).catch(() => {});
            }
        },
        // 改变状态
        changeStatus(params){
            const rLoading = this.openLoading();
            updateActivityStatus(params)
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
        },
        //时间格式化
        getTime(val){
            if(val){
                const dt = new Date(val);
                let year = dt.getFullYear(); //年
                let month = dt.getMonth() +1; //月
                let date = dt.getDate(); //日
                let hh = dt.getHours(); //时
                let mm = dt.getMinutes(); //分
                let ss = dt.getSeconds(); //秒
                month = month < 10 ? "0" + month : month;
                date  = date <10 ? "0" + date : date;
                hh  = hh <10 ? "0" + hh : hh;
                mm  = mm <10 ? "0" + mm : mm;
                ss  = ss <10 ? "0" + ss : ss;
                let new_time = ''
                new_time = year + "-" + month + "-" + date + ' ' + hh + ':' + mm + ':' + ss;
                return new_time;
            }else {
                return '-1'
            }
        },
    }
}
</script>

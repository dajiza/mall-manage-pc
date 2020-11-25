<template>
    <div class="order-list-container" id="containerWrap">
        <!--订单列表-->
        <div class="container clearfix" ref="searchBox">
            <el-form :model="searchForm" :inline="true" ref="searchForm">
                <div class="search-item-box">
                    <el-form-item label="订单号：" prop="order_no" class="marginRight55">
                        <el-input v-model="searchForm.order_no" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="订单状态：" prop="status" class="marginRight55 select-input">
                        <el-select v-model="searchForm.status" placeholder="请选择" clearable>
                            <el-option
                                    v-for="state in orderStatusOptions"
                                    :key="state.id"
                                    :value="state.id"
                                    :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="订单类型：" prop="order_type" class="marginRight55 select-input" v-if="false">
                        <el-select v-model="searchForm.order_type" placeholder="请选择" clearable>
                            <el-option
                                    v-for="state in orderTypeOptions"
                                    :key="state.id"
                                    :value="state.id"
                                    :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="购买渠道：" prop="channel_id" class="marginRight55 select-input">
                        <el-select v-model="searchForm.channel_id" placeholder="请选择" clearable>
                            <el-option
                                    v-for="state in channelOptions"
                                    :key="state.id"
                                    :value="state.id"
                                    :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                </div>
                <div class="search-item-box">
                    <el-form-item label="收货人姓名：" prop="logistics_name" class="marginRight55 w152">
                        <el-input v-model="searchForm.logistics_name" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="异常类型：" prop="unusual_type" class="marginRight55 select-input">
                        <el-select v-model="searchForm.unusual_type" placeholder="请选择" clearable>
                            <el-option
                                    v-for="state in unusualTypeOptions"
                                    :key="state.id"
                                    :value="state.id"
                                    :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="代理店铺：" prop="shop_id" class="margin-right0 select-input">
                        <el-select v-model="searchForm.shop_id" placeholder="请选择" clearable>
                            <el-option
                                    v-for="state in shopOptions"
                                    :key="state.id"
                                    :value="state.id"
                                    :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                </div>
                <div class="search-item-box">
                    <el-form-item label="支付时间：" prop="pay_time" class="marginRight55">
                        <!--<el-date-picker
                                v-model="searchForm.pay_start_time"
                                type="datetime"
                                placeholder="开始时间"
                                default-time="00:00:00">
                        </el-date-picker>-->
                        <el-date-picker
                                v-model="searchForm.pay_time"
                                type="datetimerange"
                                align="left"
                                start-placeholder="开始时间"
                                end-placeholder="结束时间"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                :picker-options="pickerOptions"
                                :default-time="['00:00:00', '23:59:59']">
                            <!--:picker-options="pickerOptions"-->
                        </el-date-picker>
                    </el-form-item>
                    <div class="btn-right">
                        <el-button @click="resetForm('searchForm')">重置</el-button>
                        <el-button type="primary" @click="handleSearch('searchForm')">搜索</el-button>
                    </div>
                </div>
            </el-form>
        </div>
        <div class="container container-table-has-search m-t-16 p-t-0 pos-relative">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>订单列表</span>
                </div>
            </div>
            <el-table
                    v-loading="loading"
                    :data="tableData"
                    ref="multipleTable"
                    class="order-list-table"
            >
                <el-table-column :fixed="tableData.length > 0" label="操作" width="120">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            class="view-detail"
                            v-hasPermission="'mall-backend-order-detail'"
                            @click="handleViewDetail(scope.$index, scope.row)"
                        >查看订单</el-button>
                        <el-button
                            type="text"
                            class="cancel-order delete-color"
                            v-show="scope.row.status === 0"
                            v-hasPermission="'mall-backend-order-cancel'"
                            @click="handleCancelOrder(scope.$index, scope.row)"
                        >取消订单</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="order_no" label="订单号" width="220"></el-table-column>
                <el-table-column prop="status" label="订单状态" width="150">
                    <template slot-scope="scope">
                        <span class="order-status" :class="orderStatusClass(scope.row.status)"
                        >{{orderStatus(scope.row.status)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="err_type" label="异常类型" width="160">
                    <template slot-scope="scope">
                        {{order_err(scope.row.err_type)}}
                    </template>
                </el-table-column>
                <el-table-column prop="user_name" label="用户昵称" width="180"></el-table-column>
                <el-table-column prop="shop_name" label="代理店铺" width="200"></el-table-column>
                <el-table-column prop="price_total_detail_end" label="订单总计(元)" width="120">
                    <template slot-scope="scope">
                        {{(scope.row.price_total_detail_end/100) | rounding}}
                    </template>
                </el-table-column>
                <el-table-column prop="logistics_money" label="运费(元)" width="120">
                    <template slot-scope="scope">
                        <span v-if="scope.row.logistics_money > 0">{{(scope.row.logistics_money/100) | rounding}}</span>
                        <span v-else>无运费</span>
                    </template>
                </el-table-column>
                <el-table-column prop="price_total_real" label="折扣优惠(元)" width="120">
                    <template slot-scope="scope"></template>
                </el-table-column>
                <el-table-column prop="price_total_real" label="实付金额(元)" width="120">
                    <template slot-scope="scope">
                        {{(scope.row.price_total_real/100) | rounding}}
                    </template>
                </el-table-column>
                <el-table-column prop="created_time" label="下单时间" width="180"></el-table-column>
                <el-table-column prop="paid_time" label="付款时间" width="180"></el-table-column>
                <el-table-column prop="logistics_name" label="收货人姓名" width="140"></el-table-column>
                <el-table-column prop="logistics_phone" label="手机号码" width="140"></el-table-column>
                <el-table-column prop="channel_name" label="购买渠道" width="140">
                    <template slot-scope="scope"></template>
                </el-table-column>
                <template slot="empty">
                    <EmptyList v-show="false"></EmptyList>
                </template>
            </el-table>
            <div class="pagination pos-relative">
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
    import { getOrderList, queryCancelOrder } from '../../../../api/orderList';
    import EmptyList from '../../../common/empty-list/EmptyList';
    import './OrderList.less';
    export default {
        name: 'OrderList',
        data() {
            return {
                searchForm: {
                    order_no:'',   // 订单号
                    status: '',    // 订单状态
                    order_type:'', // 订单类型
                    shop_id:'',    // 代理店铺id
                    channel_id:'', // 购买渠道id
                    logistics_name:'',   // 收货人姓名
                    pay_start_time:'',
                    pay_time:'',
                    unusual_type:''
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
                channelOptions: [],      // 购买渠道下拉列表
                orderStatusOptions: [],  // 订单状态下拉
                shopOptions:[],          // 代理店铺下拉列表
                orderTypeOptions:[],     // 订单类型下拉列表
                unusualTypeOptions:[],   // 异常类型下拉列表
                searchParams: {
                    order_no:'',   // 订单号
                    status: '',    // 订单状态
                    order_type:'', // 订单类型
                    shop_id:'',    // 代理店铺id
                    channel_id:'', // 购买渠道id
                    logistics_name:'',   // 收货人姓名
                    paid_time_le:'',     // 结束时间
                    paid_time_ge:'',     // 开始时间
                    unusual_type:''
                },
                tableHeight: 'calc(100% - 134px)',
                pickerOptions: {
                    shortcuts: [{
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start, end]);
                        }
                    }]
                },
            };
        },
        components: {
            EmptyList
        },
        computed: {
            orderStatus: function () {
                return (data) =>{
                    if(data === 0 ){
                        return '待付款'
                    }else if((data === 1)){
                        return '已付款'
                    }else if((data === 2)){
                        return '处理中'
                    }else if((data === 3)){
                        return '已发货'
                    }else if((data === 9)){
                        return '交易关闭'
                    }else if((data === 10)){
                        return '交易成功'
                    }
                }
            },
            orderStatusClass: function () {
                return (data) =>{
                    if(data === 0 ){
                        return 'order-pending-payment'
                    }else if(data === 1 ){
                        return 'order-paid'
                    }else if(data === 2){
                        return 'order-to-be-delivered'
                    }else if(data === 3){
                        return 'order-shipped'
                    }else if((data === 5 || data === 6 || data === 7)){
                        return 'order-refunding'
                    }else if((data === 4 || data === 8 || data === 9)){
                        return 'order-cancelled'
                    }else if((data === 10)){
                        return 'order-successfully'
                    }
                }
            },
            order_err: function () {
                return (data) =>{
                    if(data === 0 ){
                        return ''
                    }else if(data === 1 ){
                        return '裁布异常'
                    }else if((data === 2)){
                        return '配货异常'
                    }else if((data === 3)){
                        return '发货异常'
                    }
                }
            },
        },
        created() {
            // 订单状态 下拉列表  订单状态 0待付款  1已付款  2处理中；3已发货；4取消；5申请仅退款； 6申请退货退款 ；7退货中；8仅退款关闭 ；9退货关闭；10完成；
            this.orderStatusOptions = [
                { id: '0', name: '待付款' },
                { id: '1', name: '已付款' },
                { id: '2', name: '处理中' },
                { id: '3', name: '已发货' },
                { id: '9', name: '交易关闭' },
                { id: '10', name: '交易成功' }
            ];
            this.unusualTypeOptions = [
                { id: '1', name:'裁布异常'}
            ];
            // 店铺 下拉列表
            /*this.shopOptions = [
                { id: 1, name: '店铺1' },
                { id: 2, name: '店铺2' },
                { id: 3, name: '店铺3' },
                { id: 4, name: '店铺4' }
            ];*/
            // 购买渠道 下拉列表
            /*this.channelOptions = [
                { id: 1, name: '渠道1' },
                { id: 2, name: '渠道2' },
                { id: 3, name: '渠道3' },
                { id: 4, name: '渠道4' }
            ];*/
        },
        mounted() {
            // 获取购买渠道列表数据
            // this.getChannelData();
            // 获取订单列表数据
            this.getListData();
        },
        methods: {
            // 请求-获取订单列表数据
            getListData() {
                let params = {
                    page: this.pageInfo.pageIndex,
                    limit: this.pageInfo.pageSize,
                    order_no: this.searchParams.order_no ? this.searchParams.order_no : '',
                    status: this.searchParams.status !=='' ? this.searchParams.status : -1,
                    shop_id: this.searchParams.shop_id ? this.searchParams.shop_id : -1,
                    channel_id: this.searchParams.channel_id ? this.searchParams.channel_id : -1,
                    logistics_name: this.searchParams.logistics_name ? this.searchParams.logistics_name : '',
                    paid_time_le: this.searchParams.paid_time_le ? this.searchParams.paid_time_le : '',
                    paid_time_ge: this.searchParams.paid_time_ge ? this.searchParams.paid_time_ge: '',
                    err_type: this.searchParams.unusual_type !== '' ? this.searchParams.unusual_type : '0'
                };
                const rLoading = this.openLoading();
                getOrderList(params)
                    .then((res) => {
                        rLoading.close();
                        if (res.code === 200) {
                            if (res.data.list) {
                                this.tableData = res.data.list;
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
                            });
                        }
                    })
                    .catch(() => {});
            },

            // 请求-获取购买渠道列表数据
            getChannelData() {},

            // 按钮 - 重置
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.$set(this.searchParams,'order_no', '');
                this.$set(this.searchParams,'status', '');
                this.$set(this.searchParams,'shop_id', '');
                this.$set(this.searchParams,'channel_id', '');
                this.$set(this.searchParams,'logistics_name', '');
                this.$set(this.searchParams,'paid_time_ge', '');
                this.$set(this.searchParams,'paid_time_le', '');
                this.$set(this.searchParams,'unusual_type', '');
                this.$set(this.pageInfo, 'pageIndex', 1);
                this.getListData();
            },

            // 按钮-触发搜索按钮
            handleSearch(formName) {
                this.$set(this.pageInfo, 'pageIndex', 1);
                //  存储搜索条件
                this.$set(this.searchParams,'order_no', this.searchForm.order_no);
                this.$set(this.searchParams,'status', this.searchForm.status);
                this.$set(this.searchParams,'shop_id', this.searchForm.shop_id);
                this.$set(this.searchParams,'channel_id', this.searchForm.channel_id);
                this.$set(this.searchParams,'logistics_name', this.searchForm.logistics_name);
                this.$set(this.searchParams,'paid_time_ge', this.searchForm.pay_time[0]);
                this.$set(this.searchParams,'paid_time_le', this.searchForm.pay_time[1]);
                this.$set(this.searchParams,'unusual_type', this.searchForm.unusual_type);
                this.getListData();
            },

            // 按钮-查看订单详情
            handleViewDetail(index, row){
                this.$router.push({ path: '/mall-backend-order-detail', query: { order_id: row.id.toString() } });

            },

            // 取消订单
            handleCancelOrder(index, row){
                // 二次确认
                this.$confirm('确定要取消该订单吗？', '', {
                    customClass: 'message-delete',
                    type: 'warning',
                    center: true
                }).then(() => {
                    let params = {
                        user_id: row.user_id,
                        shop_id: row.shop_id,
                        order_id: row.id
                    };
                    const rLoading = this.openLoading();
                    queryCancelOrder(params).then((res) => {
                            rLoading.close();
                            if (res.code === 200) {
                                this.$notify({
                                    title: '订单取消成功',
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
                                });
                            }
                        }).catch(() => {});
                }).catch(() => {});
            },

            //时间格式化
            getInitTime(val){
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

            // 按钮-分页导航
            handlePageChange(val) {
                this.$set(this.pageInfo, 'pageIndex', val);
                if (this.searchParams['status']) {
                    this.$set(this.searchForm, 'status', this.searchParams['status']);
                }
                if (this.searchParams['order_no']) {
                    this.$set(this.searchForm, 'order_no', this.searchParams['order_no']);
                }
                if (this.searchParams['shop_id']) {
                    this.$set(this.searchForm, 'shop_id', this.searchParams['shop_id']);
                }
                if (this.searchParams['channel_id']) {
                    this.$set(this.searchForm, 'channel_id', this.searchParams['channel_id']);
                }
                if (this.searchParams['logistics_name']) {
                    this.$set(this.searchForm, 'logistics_name', this.searchParams['logistics_name']);
                }
                if (this.searchParams['unusual_type']) {
                    this.$set(this.searchForm, 'unusual_type', this.searchParams['unusual_type']);
                }
                let time_arr = [];
                if (this.searchParams['paid_time_ge']) {
                    time_arr[0] = this.searchParams['paid_time_ge'];
                    time_arr[1] = this.searchParams['paid_time_le'];
                    this.$set(this.searchForm, 'pay_time', time_arr);
                }
                this.getListData();
            },
        }
    };
</script>

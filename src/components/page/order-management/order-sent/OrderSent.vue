<template>
    <div class="order-sent-container" id="containerWrap"> <!--ontainer-wrap-->
        <!--订单列表-->
        <div class="container clearfix" ref="searchBox">
            <el-form :model="searchForm" :inline="true" ref="searchForm" :rules="searchFormRules">
                <div class="search-item-box">
                    <el-form-item label="快递单号：" prop="logistics_no" class="marginRight59">
                        <el-input v-model="searchForm.logistics_no" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="收件人名称：" prop="logistics_name" class="marginRight59">
                        <el-input v-model="searchForm.logistics_name" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="收件人手机号：" prop="logistics_phone" class="margin-right0">
                        <el-input v-model="searchForm.logistics_phone" placeholder="请输入"></el-input>
                    </el-form-item>
                </div>
                <div class="search-item-box">
                    <el-form-item label="打单时间：" prop="select_time" class="marginRight59">
                        <!--<el-date-picker
                                v-model="searchForm.pay_start_time"
                                type="datetime"
                                placeholder="开始时间"
                                default-time="00:00:00">
                        </el-date-picker>-->
                        <el-date-picker
                                v-model="searchForm.select_time"
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
                    <span>已发订单列表</span>
                </div>
            </div>
            <el-table
                    v-loading="loading"
                    :data="tableData"
                    ref="multipleTable"
            >
                <el-table-column label="编号" width="75" align="center" type="index">
                    <template scope="scope">
                        <span>{{(pageInfo.pageIndex - 1) * pageInfo.pageSize + scope.$index + 1}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="logistics_no" label="快递单号"></el-table-column>
                <el-table-column prop="logistics_name" label="收件人名称"></el-table-column>
                <el-table-column prop="logistics_phone" label="收件人手机号"></el-table-column>
                <el-table-column prop="logistics_time" label="打单时间"></el-table-column>
                <el-table-column label="操作" width="120">
                    <template slot-scope="scope">
                        <el-button type="text" v-hasPermission="'order-sand-detail'" @click="handleViewDetail(scope.$index,scope.row)">查看</el-button>
                    </template>
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
    import { getSentOrderList } from '../../../../api/orderList';
    import EmptyList from '../../../common/empty-list/EmptyList';
    import './OrderSent.less';
    export default {
        name: 'OrderSent',
        data() {
            var checkMobile = (rule, value, callback) => {
                const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[3678]|18[0-9]|14[57])[0-9]{8}$/;
                if (regMobile.test(value)) {
                    return callback();
                }else {
                    if(!value){
                        callback();
                    }else {
                        callback(new Error('请输入合法的手机号'));
                    }
                }
            };
            return {
                searchForm: {
                    logistics_no:'',      // 快递单号
                    logistics_name:'',    // 收货人姓名
                    logistics_phone:'',   // 收货人手机号
                    logistics_time_le:'', // 打单时间 <=
                    logistics_time_ge:'',  // 打单时间 >=
                    select_time:[]
                },
                searchFormRules:{
                    logistics_phone: [
                        {
                            validator: checkMobile,
                            trigger: 'blur'
                        }
                    ],
                },
                pageInfo: {
                    name: '',
                    pageIndex: 1,
                    pageSize: 10
                },
                loading: false,
                tableData: [],
                pageTotal: 0, // 总条数
                searchParams: {
                    logistics_no:'',      // 快递单号
                    logistics_name:'',    // 收货人姓名
                    logistics_phone:'',   // 收货人手机号
                    logistics_time_le:'', // 打单时间 <=
                    logistics_time_ge:''  // 打单时间 >=
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
        },
        created() {

        },
        mounted() {
            // 获取搜索容器高度
            /*const searchBoxHeight = this.$refs.searchBox.offsetHeight;
            const containerHasSearch = document.getElementsByClassName('container-table-has-search')[0];
            containerHasSearch.style.height = `calc(100% - 16px - ${searchBoxHeight}px)`;*/
            // 获取订单列表数据
            this.getListData();
        },
        methods: {

            // 请求-获取订单列表数据
            getListData() {
                let params = {
                    page: this.pageInfo.pageIndex,
                    limit: this.pageInfo.pageSize,
                    logistics_no: this.searchParams.logistics_no,      // 快递单号
                    logistics_name: this.searchParams.logistics_name,    // 收货人姓名
                    logistics_phone: this.searchParams.logistics_phone,   // 收货人手机号
                    logistics_time_le: this.searchParams.logistics_time_le, // 打单时间 <=
                    logistics_time_ge: this.searchParams.logistics_time_ge, // 打单时间 >=
                };
                const rLoading = this.openLoading();
                getSentOrderList(params)
                    .then((res) => {
                        rLoading.close();
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
                            });
                        }
                    })
                    .catch(() => {});
            },

            // 按钮 - 重置
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.$set(this.searchParams,'logistics_no', '');
                this.$set(this.searchParams,'logistics_name', '');
                this.$set(this.searchParams,'logistics_phone', '');
                this.$set(this.searchParams,'logistics_time_ge', '');
                this.$set(this.searchParams,'logistics_time_le', '');
                this.$set(this.pageInfo, 'pageIndex', 1);
                this.getListData();
            },

            // 按钮-触发搜索按钮
            handleSearch(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.$set(this.pageInfo, 'pageIndex', 1);
                        //  存储搜索条件
                        this.$set(this.searchParams,'logistics_no', this.searchForm.logistics_no);
                        this.$set(this.searchParams,'logistics_name', this.searchForm.logistics_name);
                        this.$set(this.searchParams,'logistics_phone', this.searchForm.logistics_phone);
                        this.$set(this.searchParams,'logistics_time_ge', this.searchForm.select_time[0]);
                        this.$set(this.searchParams,'logistics_time_le', this.searchForm.select_time[1]);
                        this.getListData();
                    }
                })
            },

            // 按钮-查看订单详情
            handleViewDetail(index, row){
                this.$router.push({ path: '/order-sand-detail', query: { order_id: row.id.toString() } });

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
                if (this.searchParams['logistics_no']) {
                    this.$set(this.searchForm, 'logistics_no', this.searchParams['logistics_no']);
                }
                if (this.searchParams['logistics_name']) {
                    this.$set(this.searchForm, 'logistics_name', this.searchParams['logistics_name']);
                }
                if (this.searchParams['logistics_phone']) {
                    this.$set(this.searchForm, 'logistics_phone', this.searchParams['logistics_phone']);
                }
                let time_arr = [];
                if (this.searchParams['logistics_time_le']) {
                    time_arr[0] = this.searchParams['logistics_time_ge'];
                    time_arr[1] = this.searchParams['logistics_time_le'];
                    this.$set(this.searchForm, 'select_time', time_arr);
                }
                this.getListData();
            },
        }
    };
</script>

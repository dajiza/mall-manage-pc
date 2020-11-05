<template>
    <div class="cut-cloth-container" id="containerWrap"> <!-- container-wrap-->
        <div class="container clearfix search-container" ref="searchBox">
            <div class="handle-box">
                <el-form :model="timeForm" :inline="true" ref="timeForm">
                    <el-form-item label="结束时间：" prop="order_end_time">
                        <el-date-picker
                                v-model="timeForm.order_end_time"
                                type="datetime"
                                placeholder="结束时间"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                default-time="00:00:00">
                        </el-date-picker>
                    </el-form-item>
                    <div class="btn-right">
                        <el-button @click="resetForm('timeForm')">重置</el-button>
                        <el-button type="primary" v-hasPermission="'cut-order-create'" @click="orderProcessCreate()">生成裁布单</el-button>
                    </div>
                </el-form>
            </div>
            <div class="handle-box clearfix">
                <el-form
                        :model="searchForm"
                        :inline="true"
                        ref="searchForm"
                        class="second-form"
                >
                    <el-form-item label="状态：" prop="status">
                        <el-select
                                v-model="searchForm.status"
                                placeholder="请选择"
                                class="handle-select mr10"
                        >
                            <el-option
                                    v-for="state in statusList"
                                    :key="state.key"
                                    :value="state.key"
                                    :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                    <div class="btn-right">
                        <el-button type="primary" @click="handleSearch('searchForm')">搜索</el-button>
                    </div>
                </el-form>
            </div>
        </div>
        <div class="container container-table-has-search m-t-16 p-t-0">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>裁布单列表</span>
                </div>
            </div>
            <el-table
                v-loading="loading"
                :data="tableData"
                ref="multipleTable"
            >
                <el-table-column label="编号" width="95" align="left" type="index">
                    <template scope="scope">
                        <span>{{(pageInfo.pageIndex - 1) * pageInfo.pageSize + scope.$index + 1}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="order_end_time" label="结束时间"></el-table-column>
                <el-table-column prop="cut_count" label="货物数量"></el-table-column>
                <el-table-column prop="cut_status" label="状态">
                    <template scope="scope">
                        <span class="status-ball" :class="backClassName(scope.row.cut_status)"></span>
                        <span :class="scope.row.cut_status === 3 ? 'font-stop' : 'font-use'"
                        >{{backCutStatus(scope.row.cut_status)}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="156">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            class="" v-hasPermission="'order-cut-list'"
                            @click="handleView(scope.$index, scope.row)"
                        >查看</el-button>
                        <!--<el-button
                            type="text"
                            class="marginLeft0"
                            @click="handlePrintCutSheet(scope.$index, scope.row)"
                        >打印裁布单</el-button>-->
                    </template>
                </el-table-column>
                <template slot="empty">
                    <EmptyList></EmptyList>
                </template>
            </el-table>
            <div class="pagination pos-relative">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="pageInfo.pageIndex"
                    :page-size="pageInfo.pageSize"
                    :total="pageInfo.pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
                <!--<el-button class="print-selected" type="success" :disabled="multipleSelection.length < 1"
                           @click="handlePrintCutSheet('searchForm')">打印</el-button>-->
            </div>
        </div>
    </div>
</template>

<script>
import { getCutClothList, getOrderProcessCreate } from '../../../../api/cutCloth';
import EmptyList from '../../../common/empty-list/EmptyList';
import './CutCloth.less';
export default {
    name: 'CutCloth',
    data() {
        return {
            timeForm: {
                order_end_time: '',   // 结束时间
            },
            searchForm:{
                status:''
            },
            searchParams:{
                status:''
            },
            pageInfo: {
                name: '',
                pageIndex: 1,
                pageSize: 10,
                pageTotal:0
            },
            loading: false,
            tableData: [],
            multipleSelection:[],
            statusList: [
                {key: '-1',name:'全部'},
                {key: '0',name:'待处理'},
                {key: '1',name:'挑布中'},
                {key: '2',name:'裁布中'},
                {key: '3',name:'已完成'},
            ],
            tableHeight: 'calc(100% - 134px)'
        };
    },
    components: {
        EmptyList
    },
    computed:{
        backCutStatus: function () {
            return (data) =>{
                let str = '';
                if(data === 0){
                    str = '待处理';
                }else if(data === 1){
                    str = '挑布中';
                }else if(data === 2){
                    str = '裁布中';
                }else {
                    str = '已完成';
                }
                return str;
            }
        },
        backClassName: function () {
            return (data) =>{
                let str = '';
                if(data === 0){
                    str = 'color-success';
                }else if(data === 1 || data === 2){
                    str = 'color-FAAD14';
                }else {
                    str = 'color-err';
                }
                return str;
            }
        },
    },
    created() {

    },
    mounted() {
        // 获取用户列表数据
        this.getListData();

        // 获取搜索容器高度
        /*const searchBoxHeight = this.$refs.searchBox.offsetHeight;
        const containerHasSearch = document.getElementsByClassName('container-table-has-search')[0];
        containerHasSearch.style.height = `calc(100% - 16px - ${searchBoxHeight}px)`;*/
    },
    methods: {
        indexMethod(index) {
            index = index + 1 + (this.pageInfo.pageIndex - 1) * this.pageInfo.pageSize;
            return index;
        },
        // 请求-获取裁布列表数据
        getListData() {
            let status_arr = [];
            if(this.searchParams.status === '' || Number(this.searchParams.status) < 0){
                status_arr = [0,1,2,3];
            }else {
                status_arr.push(Number(this.searchParams.status))
            }
            let params = {
                page: this.pageInfo.pageIndex,
                limit: this.pageInfo.pageSize,
                order_end_time_le: '',   //订单结束时间 <=
                order_end_time_ge:"",	//订单结束时间 >=
                pick_status_in: [],     //不检索传 []
                sand_status_in: [],	    //不检索传 []
                cut_status_in: status_arr,		//不检索传 []
            };
            const rLoading = this.openLoading();
            getCutClothList(params)
                .then((res) => {
                    rLoading.close();
                    if (res.code === 200) {
                        if (res.data.lists) {
                            this.tableData = res.data.lists;
                            this.$set(this.pageInfo,'pageTotal',res.data.total);
                        } else {
                            this.tableData = [];
                            this.$set(this.pageInfo,'pageTotal',0);
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

        // 生成裁布单
        orderProcessCreate(){
            if(this.timeForm.order_end_time){
                const params = {
                    order_end_time: this.timeForm.order_end_time
                }
                // ajax 生成发货单  成功刷新 列表
                const rLoading = this.openLoading();
                getOrderProcessCreate(params).then((res) => {
                    if (this.searchParams['status']) {
                        this.$set(this.searchForm, 'status', this.searchParams['status']);
                    }else {
                        this.$set(this.searchForm, 'status', '');
                    }
                    rLoading.close();
                    if (res.code === 200) {
                        this.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        });
                    } else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                    this.$set(this.pageInfo, 'pageIndex', 1);
                    this.getListData();
                }).catch(() => {});
            }else {
                this.$notify({
                    title: '请选择结束时间',
                    message: '',
                    type: 'error',
                    duration: 5000
                });
            }
        },

        // 按钮-查看
        handleView(index, row) {
            this.$router.push({path:'/order-cut-list',query:{id:row.id.toString(),end_time:row.order_end_time}});
        },

        // 按钮-打印裁布单
        handlePrintCutSheet(index, row){
            this.$notify({
                title: '抱歉，功能未上线',
                message: '',
                type: 'error',
                duration: 5000
            });
        },

        // 按钮-分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val);
            if (this.searchParams['status']) {
                this.$set(this.searchForm, 'status', this.searchParams['status']);
            }else {
                this.$set(this.searchForm, 'status', '');
            }
            this.getListData();
        },

        // 获取当前时间
        getTime(){
            const dt = new Date();
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
        },
        // 按钮 - 搜索
        handleSearch(){
            //  存储搜索条件
            if(this.searchForm.status){
                this.$set(this.pageInfo, 'pageIndex', 1);
                this.$set(this.searchParams,'status', this.searchForm.status);
                this.getListData();
            }else {
                this.$notify({
                    title: '请选择状态',
                    message: '',
                    type: 'error',
                    duration: 1000
                });
            }
        },
        // 按钮-重置
        resetForm(formName) {
            this.$refs[formName].resetFields();
        },
        // 多选操作
        handleSelectionChange(val){
            this.multipleSelection = val;
        }
    }
};
</script>

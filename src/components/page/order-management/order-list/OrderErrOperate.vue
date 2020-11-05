<template>
    <div class="order-err-container" id="containerWrap">
        <!--订单列表-->
        <div class="container clearfix" ref="searchBox">
            <div class="handle-box">
                <el-form :model="searchForm" :inline="true" ref="searchForm">
                    <el-form-item label="订单号：" prop="order_no" class="marginRight40 w160">
                        <el-input v-model="searchForm.order_no" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="产品编码：" prop="product_code" class="marginRight40 w160">
                        <el-input v-model="searchForm.product_code" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="调整时间：" prop="created_time" class="w380">
                        <el-date-picker
                                v-model="searchForm.created_time"
                                type="datetimerange"
                                align="left"
                                start-placeholder="开始时间"
                                end-placeholder="结束时间"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                :picker-options="pickerOptions"
                                :default-time="['00:00:00', '23:59:59']">
                        </el-date-picker>
                    </el-form-item>
                </el-form>
            </div>
            <div class="btn-right">
                <el-button @click="resetForm('searchForm')">重置</el-button>
                <el-button type="primary" @click="handleSearch('searchForm')">搜索</el-button>
            </div>
        </div>
        <div class="container container-table-has-search m-t-16 p-t-0 pos-relative">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>手动调整列表</span>
                </div>
            </div>
            <el-table
                    v-loading="loading"
                    :data="tableData"
                    ref="multipleTable"
                    @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column prop="user_name" label="产品图片" width="120">
                    <template slot-scope="scope">
                        <img class="product-img" :src="getImg(scope.row.product_img)" alt="" @click="viewBigImg(scope.row.product_img)">
                    </template>
                </el-table-column>
                <el-table-column prop="product_name" label="产品名称"></el-table-column>
                <el-table-column prop="product_code" label="产品编码"></el-table-column>
                <el-table-column prop="order_no" label="订单号" width="160"></el-table-column>
                <el-table-column prop="num" label="调整数" width="100"></el-table-column>
                <el-table-column prop="updated_time" label="调整时间" width="180"></el-table-column>
                <el-table-column label="操作" width="184">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                class="marginRight32"
                                v-hasPermission="'delivery-list'"
                                @click="handleView(scope.$index, scope.row)"
                        >查看</el-button>
                        <el-button
                                type="text"
                                class="marginLeft0"
                                v-hasPermission="'print-sand-order'"
                                @click="printOrder(scope.$index, scope.row)"
                        >打印调整单</el-button>
                    </template>
                </el-table-column>
                <template slot="empty">
                    <EmptyList></EmptyList>
                </template>
            </el-table>
            <div class="pagination pos-relative">
                <div class="pos-absolute btn-print">
                    <el-button type="success" @click="printSelected" :disabled="multipleSelection.length < 1">打印</el-button>
                </div>
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
        <!--调整单-->
        <el-dialog
                title=""
                custom-class="adjustment-dialog"
                :visible.sync="adjustmentVisible"
                width="700px"
                :destroy-on-close="true"
                append-to-body
        >
            <div slot="title" class="adjustment-dialog-title">
                <span>订单号：{{orderNo}}</span>
                <span>产品编码：{{productCode}}</span>
                <span>共需要 {{adjustment_num}}{{product_unit}}</span>
            </div>
            <el-table :data="adjustmentTableData" ref="multipleTable" tooltip-effect="dark">
                <el-table-column prop="detail_code" label="货物编码" width="300"></el-table-column>
                <el-table-column prop="shelf_code" label="货架编码" width="250"></el-table-column>
                <el-table-column label="选配数量">
                    <template slot-scope="scope">{{scope.row.num}}{{product_unit}}</template>
                </el-table-column>
                <template slot="empty">
                    <EmptyList></EmptyList>
                </template>
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button type="success" @click="handleSurePrint(adjustmentTableData)">打 印</el-button>
            </span>
        </el-dialog>
        <!--大图-->
        <transition name="el-fade-in-linear">
            <BigImg ref="bigImg" :imgUrl="bigImgUrl"></BigImg>
        </transition>
        <div style="width:210mm;position: absolute;z-index: -1;top: -1000px;left: -1000px;display: none">
            <div id="printMe" ref="print" style="width: 100%;margin: 0 auto;background: #fff;box-sizing: border-box;">
                <div style="page-break-after:always;width: 100%;" v-for="(item,i) in printInfo" :key="item.id">
                    <div style="width: 100%;padding-top: 10px;">
                        <div style="width: 100%;box-sizing: border-box;-webkit-box-sizing: border-box;font-size: 14px;padding: 5px 0 10px;">
                            <span style="margin-right: 10px">订单号：{{item.order_no}} </span>
                            <span style="margin-right: 10px">产品编码：{{item.product_code}}</span>
                            <span>共需要 {{item.order_num}}{{item.unit}}</span>
                            <!--{{item.detail[0].unit || ''}}-->
                        </div>
                        <table headerRows='1' style="width: 100% !important;border-color: rgba(0,0,0,1);border-collapse:collapse;font-size: 12px">
                            <thead>
                            <tr>
                                <th style="width: 40%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">货物编码</th>
                                <th style="width: 40%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">货架编码</th>
                                <th style="width: 20%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">选配数量</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="(goods_item,i) in item.detail" :key="i">
                                <td style="width: 40%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">{{goods_item.detail_code}}</td>
                                <td style="width: 40%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">
                                    {{goods_item.shelf_code}}</td>
                                <td style="width: 20%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">
                                    {{goods_item.num}}{{goods_item.unit}}</td>
                                <!--{{goods_item.unit || ''}}-->
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { getOrderErrList } from '../../../../api/orderList';
    import EmptyList from '../../../common/empty-list/EmptyList';
    import BigImg from '../../../common/big-img/BigImg';

    import './OrderList.less';
    export default {
        name: 'orderErrOperate',
        data() {
            return {
                searchForm: {
                    order_no:'',   // 订单号
                    product_code:'',    // 产品编码
                    created_time:'',
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
                    order_no:'',        // 订单号
                    product_code:'',    // 产品编码
                    created_time_le:'',     // 结束时间
                    created_time_ge:'',     // 开始时间
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
                multipleSelection:[],
                bigImgUrl:'',
                adjustmentVisible:false,
                adjustmentTableData:[],
                productCode:'',
                orderNo:'',
                adjustment_num:0,
                printInfo:[],
                product_unit:''
            };
        },
        components: {
            EmptyList,
            BigImg
        },
        computed: {
            //  拼接图片地址
            getImg: function () {
                return (data) => {
                    if(data){
                        return data + '!/fw/' + 80;
                    }
                }
            },
        },
        created() {},
        mounted() {
            // 获取订单列表数据
            this.getListData();
        },
        methods: {

            // 请求-获取订单列表数据
            getListData() {
                let params = {
                    page: this.pageInfo.pageIndex,
                    limit: this.pageInfo.pageSize,
                    product_name:'',
                    product_code: this.searchParams.product_code ? this.searchParams.product_code : '',
                    user_id: -1,
                    order_no: this.searchParams.order_no ? Number(this.searchParams.order_no) : '',
                    created_time_le: this.searchParams.created_time_le ? this.searchParams.created_time_le : '',
                    created_time_ge: this.searchParams.created_time_ge ? this.searchParams.created_time_ge: '',
                };
                const rLoading = this.openLoading();
                getOrderErrList(params)
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
                this.$set(this.searchParams,'order_no', '');
                this.$set(this.searchParams,'product_code', '');
                this.$set(this.searchParams,'created_time_ge', '');
                this.$set(this.searchParams,'created_time_le', '');
                this.$set(this.pageInfo, 'pageIndex', 1);
                this.getListData();
            },

            // 按钮-触发搜索按钮
            handleSearch(formName) {
                this.$set(this.pageInfo, 'pageIndex', 1);
                //  存储搜索条件
                this.$set(this.searchParams,'order_no', this.searchForm.order_no);
                this.$set(this.searchParams,'product_code', this.searchForm.product_code);
                this.$set(this.searchParams,'created_time_ge', this.searchForm.created_time[0]);
                this.$set(this.searchParams,'created_time_le', this.searchForm.created_time[1]);
                this.getListData();
            },

            // 按钮-分页导航
            handlePageChange(val) {
                this.$set(this.pageInfo, 'pageIndex', val);
                if (this.searchParams['order_no']) {
                    this.$set(this.searchForm, 'order_no', this.searchParams['order_no']);
                }
                if (this.searchParams['product_code']) {
                    this.$set(this.searchForm, 'product_code', this.searchParams['product_code']);
                }
                let time_arr = [];
                if (this.searchParams['created_time_ge']) {
                    time_arr[0] = this.searchParams['created_time_ge'];
                    time_arr[1] = this.searchParams['created_time_le'];
                    this.$set(this.searchForm, 'created_time', time_arr);
                }
                this.getListData();
            },

            // 多选操作  -- 选择值发生变化
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },

            // 查看大图
            viewBigImg(pic_url){
                if(pic_url){
                    this.bigImgUrl =  pic_url + '!/fw/640';
                    this.$refs.bigImg.show();
                }
            },

            // 查看
            handleView(index,row){
                this.productCode = row.product_code;
                this.orderNo = row.order_no;
                this.adjustment_num = row.num;
                this.product_unit = JSON.parse(row.operate_json)[0].unit;
                this.adjustmentTableData = JSON.parse(row.operate_json);
                this.adjustmentVisible = true;
            },
            // 打印调整单
            printOrder(index,row){
                this.printInfo = [];
                let obj = {};
                obj['product_code'] = row.product_code;
                obj['order_no'] = row.order_no;
                obj['order_num'] = row.num;
                obj['detail'] = JSON.parse(row.operate_json);
                obj['unit'] = JSON.parse(row.operate_json)[0].unit;
                this.printInfo.push(obj);
                this.$nextTick(()=>{
                    this.$print(this.$refs.print);
                })
            },
            // 调整单 弹窗 - 打印
            handleSurePrint(data){
                this.printInfo = [];
                let obj = {};
                obj['product_code'] = this.productCode;
                obj['order_no'] = this.orderNo;
                obj['order_num'] = this.adjustment_num;
                obj['detail'] = data;
                obj['unit'] = data[0].unit;
                this.printInfo.push(obj);
                this.adjustmentVisible = false;
                this.$nextTick(()=>{
                    this.$print(this.$refs.print);
                })
            },

            // 打印选中
            printSelected(){
                this.printInfo = [];
                this.multipleSelection.forEach((ev)=>{
                    let obj = {};
                    obj['product_code'] = ev.product_code;
                    obj['order_no'] = ev.order_no;
                    obj['order_num'] = ev.num;
                    obj['detail'] = JSON.parse(ev.operate_json);
                    obj['unit'] = JSON.parse(ev.operate_json)[0].unit;
                    this.printInfo.push(obj);
                })
                this.$nextTick(()=>{
                    this.$print(this.$refs.print);
                })
            }
        }
    };
</script>
<style>
    .adjustment-dialog .el-dialog__header{
        padding: 13px 16px !important;
    }
    .adjustment-dialog .el-dialog__body{
        padding: 20px 0 !important;
    }
    .adjustment-dialog .el-dialog__footer{
        padding-right: 16px !important;
    }
    .adjustment-dialog-title span{
        font-size: 16px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.85);
        height: 30px;
        line-height: 30px;
        display: inline-block;
        background: rgba(24, 144, 255, 0.1);
        padding: 0 12px;
        margin-right: 10px;
        border-radius: 2px;
    }
</style>

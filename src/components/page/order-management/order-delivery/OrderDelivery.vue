<template>
    <div class="delivery-container" id="containerWrap"> <!--container-wrap-->
        <div class="container clearfix search-container" ref="searchBox">
            <div class="handle-box">
                <el-form :model="timeForm" :inline="true" ref="timeForm">
                    <el-form-item label="结束时间:" prop="order_end_time">
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
                        <el-button type="primary" v-hasPermission="'sand-order-create'" @click="generateShipmentOrder()">生成发货单</el-button>
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
                    <el-form-item label="状态:" prop="status">
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
                <div class="un-finished">
                    <el-button v-hasPermission="'delivery-list'" @click="unFinishedOrder()">未完结订单</el-button>
                </div>
            </div>
        </div>
        <div class="container container-table-has-search m-t-16 p-t-0">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>发货单列表</span>
                </div>
            </div>
            <el-table
                v-loading="loading"
                :data="tableData"
                ref="multipleTable"
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" align="center" :selectable="handleSelection"></el-table-column>
                <el-table-column label="编号" width="75" align="left" type="index">
                    <template scope="scope">
                        <span>{{(pageInfo.pageIndex - 1) * pageInfo.pageSize + scope.$index + 1}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="order_end_time" label="结束时间"></el-table-column>
                <el-table-column prop="sand_count_order" label="订单数量"></el-table-column>
                <el-table-column prop="cut_status" label="状态">
                    <template scope="scope">
                        <span class="status-ball" :class="backClassName(scope.row.sand_status)"></span>
                        <span :class="scope.row.sand_status === 2 ? 'font-stop' : 'font-use'"
                        >{{backStatus(scope.row.sand_status)}}</span>
                    </template>
                </el-table-column>
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
                            :disabled="scope.row.sand_status === 2"
                            v-hasPermission="'print-sand-order'"
                            @click="printOrder(scope.$index, scope.row)"
                        >打印发货单</el-button>
                    </template>
                </el-table-column>
                <template slot="empty">
                    <EmptyList></EmptyList>
                </template>
            </el-table>
            <div class="pagination pos-relative">
                <div class="pos-absolute btn-print">
                    <el-button type="success" @click="printSelected" v-hasPermission="'print-sand-order'" :disabled="multipleSelection.length < 1">打印</el-button>
                </div>
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="pageInfo.pageIndex"
                    :page-size="pageInfo.pageSize"
                    :total="pageInfo.pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>
        <div class="print-A5-page">
            <div id="printMe" ref="print" style="width: 100%;margin: 0 auto;background: #fff;box-sizing: border-box;">
                <div class="single-sand-order" style="page-break-after:always;width: 100%;" v-for="(first_item,i) in singlePrintData" :key="first_item.id">
                    <div class="logisticsInfo_barCode" style="display: flex;justify-content: space-between;">
                        <div class="logistics-info" style=" width: 70%;">
                            <p class="logistics-info-p" style="width: 100%;line-height: 20px;font-weight: 500;font-size: 14px;">收件人：{{first_item.logistics_name}}</p>
                            <p class="logistics-info-p" style="width: 100%;line-height: 20px;font-weight: 500;font-size: 14px;">手机号码：{{first_item.logistics_phone}}</p>
                            <p class="logistics-info-p" style="width: 100%;line-height: 20px;font-weight: 500;font-size: 14px;">收货地址： {{first_item.logistics_province}}{{first_item.logistics_city}}{{first_item.logistics_area}}{{first_item.logistics_address}}</p>
                        </div>
                        <div class="bar-code" style="width: 25%;">
                            <img :id="'barcode' + first_item.id" style="width: 100%;height: 82px;display: block;"/>
                        </div>
                    </div>
                    <div class="single-order" style="width: 100%;padding-top: 20px;" v-for="(item, index) in first_item.order.filter(value => value.orderIsSelected)" :key="index">
                        <div v-if="item.detail.filter(value => value.status === 2).length" :style="index === first_item.order.filter(value => value.orderIsSelected).length -1? '' : 'page-break-after:always;'">
                            <div class="order-no" style="width: 100%;box-sizing: border-box;-webkit-box-sizing: border-box;font-size: 12px;padding: 5px 0;">订单号：{{item.order_no}}</div>
                            <table class="print-table" headerRows='1' style="width: 100% !important;border-color: rgba(0,0,0,1);border-collapse:collapse;font-size: 10px">
                                <thead>
                                <tr>
                                    <th style="width: 15%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">产品名称</th>
                                    <th style="width: 15%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">产品编码</th>
                                    <th style="width: 15%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">商品名称</th>
                                    <th style="width: 14%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">规格</th>
                                    <th style="width: 11%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">商品实付(元)</th>
                                    <th style="width: 10%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">数量</th>
                                    <th style="width: 10%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">单位</th>
                                    <th style="width: 10%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">合计</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="(goods_item, goods_i) in item.detail.filter(value => value.status === 2)" :key="goods_item.id">
                                    <td style="width: 15%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">{{goods_item.product_name}}</td>
                                    <td style="width: 15%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">{{goods_item.product_code}}</td>
                                    <td style="width: 15%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">{{goods_item.goods_name}}</td>
                                    <td style="width: 14%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">
                                        <p v-for="(item,i) in back_goods_attr(goods_item.goods_attr)">{{item['Title']}}：{{item['Value']}}</p>
                                    </td>
                                    <td style="width: 11%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">{{goods_item.price_real/100}}</td>
                                    <td style="width: 10%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">{{goods_item.num}}</td>
                                    <td style="width: 10%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">{{goods_item.product_unit}}</td>
                                    <td style="width: 10%;border: 1px solid rgba(0,0,0,1);text-align: center;padding: 5px 10px;box-sizing: border-box;">{{goods_item.num}}{{goods_item.product_unit}}</td>
                                </tr>
                                </tbody>

                            </table>
                            <ul v-if="item.message || item.remark" class="leaving-message" style="list-style-type: none;border: 1px solid rgba(0, 0, 0, 1);border-top: 0;padding: 5px 10px;color: #000000;box-sizing: border-box;font-size: 10px;">
                                <li style="display: flex;width: 100%;line-height: 16px" v-if="item.message">
                                    <div style="width: 55px;text-align: left">用户留言:</div>
                                    <div style="flex: 1;">{{item.message}}</div>
                                </li>
                                <li style="display: flex;width: 100%;line-height: 16px" v-if="item.remark">
                                    <div style="width: 55px;text-align: left">后台留言:</div>
                                    <div style="flex: 1;">{{item.remark}}</div>
                                </li>
                            </ul>
                            <ul class="good-info" style="list-style-type: none;display: flex;justify-content: flex-end;border: 1px solid rgba(0, 0, 0, 1);border-top: 0;padding: 0 10px 0 0;height: 32px;line-height: 32px;box-sizing: border-box;color: #000000;font-size: 10px;font-weight: 500;">
                                <li style="padding-right: 10px">
                                    <span>商品数量:</span>
                                    <span>{{buyNumPrint(item.detail)}}</span>
                                </li>
                                <li style="">
                                    <span>产品种类:</span>
                                    <span>{{productNumPrint(item.detail)}}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="order-total" style="width: 100%;font-size: 14px;font-weight: 500;text-align: right;margin-top: 10px;page-break-before:avoid">
                        <span class="" style="padding-right: 16px">商品数量：{{all_goods_total(first_item.order)}}</span>
                        <span class="">产品种类：{{all_product_total(first_item.order)}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import EmptyList from '../../../common/empty-list/EmptyList';
import { getCutClothList, getOrderProcessCreate, getOrderSendList } from '../../../../api/cutCloth';
import jsbarcode from 'jsbarcode'
import './OrderDelivery.less';
import { getAllAttrList } from '../../../../api/configManagement';
export default {
    name: 'OrderDelivery',
    data() {
        return {
            timeForm: {
                order_end_time: '',   // 结束时间
            },
            searchForm:{
                status: '-1'
            },
            searchParams:{
                status: '-1'
            },
            pageInfo: {
                pageIndex: 1,
                pageSize: 10,
                pageTotal: 0 // 总条数
            },
            loading: false,
            tableData: [],
            statusList: [
                {key: '-1',name:'全部'},
                {key: '0',name:'待发货'},
                {key: '1',name:'进行中'},
                {key: '2',name:'已完成'},
            ],
            tableHeight: 'calc(100% - 134px)',
            multipleSelection:[],
            singlePrintData:[],
            orderData:[],
        };
    },
    components: {
        EmptyList
    },
    computed:{
        backStatus: function () {
            return (data) =>{
                let str = '';
                if(data === 0){
                    str = '待发货';
                }else if(data === 2){
                    str = '已完成';
                }else {
                    str = '进行中';
                }
                return str;
            }
        },
        backClassName: function () {
            return (data) =>{
                let str = '';
                if(data === 0){
                    str = 'color-success';
                }else if(data === 1){
                    str = 'color-FAAD14';
                }else if(data === 2){
                    str = 'color-err';
                }
                return str;
            }
        },
        buyNum: function(){
            return (data) => {
                let num = 0;
                if(data){
                    data.forEach((ev)=>{
                        num = num + ev.num
                    })
                }
                return num
            }
        },
        buyNumPrint: function(){
            return (data) => {
                let num = 0;
                if(data){
                    data.forEach((ev)=>{
                        if(ev.status === 2){
                            num = num + ev.num
                        }
                    })
                }
                return num
            }
        },
        productNumPrint: function(){
            return (data) => {
                let num = 0;
                if(data){
                    num = num + data.filter(value => value.status === 2).length
                }
                return num
            }
        },
        /*合计商品总数（打印）*/
        all_goods_total: function(){
            return (data) => {
                let num = 0;
                if(data){
                    data.forEach((ev)=>{
                        if(ev.orderIsSelected){
                            ev.detail.forEach((goods_ev)=>{
                                if(goods_ev.status === 2){
                                    num = num + goods_ev.num
                                }
                            })
                        }
                    })
                }
                return num
            }
        },
        all_product_total: function(){
            return (data) => {
                let num = 0;
                if(data){
                    data.forEach((ev)=>{
                        if(ev.orderIsSelected){
                            num = num + ev.detail.filter(value => value.status === 2).length
                        }
                    })
                }
                return num
            }
        },
        back_goods_attr:function() {
            return (data) =>{
                let attr_arr = [];
                if(data){
                    attr_arr = JSON.parse(data);
                }
                return attr_arr
            }
        },
    },
    mounted() {
        // 获取列表数据
        this.getListData();
        // 获取搜索容器高度
        /*const searchBoxHeight = this.$refs.searchBox.offsetHeight;
        const containerHasSearch = document.getElementsByClassName('container-table-has-search')[0];
        containerHasSearch.style.height = `calc(100% - 16px - ${searchBoxHeight}px)`;*/
    },
    methods: {
        // 请求-获取列表数据
        getListData() {
            let status_arr = [];
            if(this.searchParams.status === '' || Number(this.searchParams.status) < 0){
                status_arr = [0,1,2];
            }else {
                status_arr.push(Number(this.searchParams.status))
            }
            let params = {
                order_end_time_le: '',
                order_end_time_ge: '',
                sand_status_in: status_arr,  //不检索传 []
                pick_status_in: [],     //不检索传 []
                cut_status_in: [],		//不检索传 []
                page: this.pageInfo.pageIndex,
                limit: this.pageInfo.pageSize
            };
            const rLoading = this.openLoading();
            getCutClothList(params).then((res) => {
                rLoading.close();
                if (res.code === 200) {
                    if (res.data.lists) {
                        this.tableData = res.data.lists;
                        this.$set(this.pageInfo,'pageTotal', res.data.total);
                    } else {
                        this.tableData = [];
                        this.$set(this.pageInfo,'pageTotal', 0);
                    }
                } else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }
            }).catch((err)=>{});
        },

        // 按钮 - 搜索
        handleSearch(){
            //  存储搜索条件
            console.log('this.searchForm.status', this.searchForm.status);
            if(this.searchForm.status !== ''){
                this.$set(this.pageInfo, 'pageIndex', 1);
                this.$set(this.searchParams,'status', this.searchForm.status);
                this.getListData();
            }else {
                // this.$notify({
                //     title: '请选择状态',
                //     message: '',
                //     type: 'error',
                //     duration: 5000
                // });
            }
        },

        // 按钮-重置
        resetForm(formName) {
           this.$refs[formName].resetFields();
        },

        // 未完成订单
        unFinishedOrder(){
            this.$router.push({ path: '/delivery-list', query: { orderStatus: '2' } });
        },

        // 按钮-生成发货单
        generateShipmentOrder() {
            if(this.timeForm.order_end_time){
                const params = {
                    order_end_time: this.timeForm.order_end_time
                }
                // ajax 生成发货单  成功刷新 列表 this.$set(this.pageInfo, 'pageIndex', 1);
                const rLoading = this.openLoading();
                getOrderProcessCreate(params).then((res) => {
                    rLoading.close();
                    if (this.searchParams['status']) {
                        this.$set(this.searchForm, 'status', this.searchParams['status']);
                    }else {
                        this.$set(this.searchForm, 'status', '');
                    }
                    if (res.code === 200) {
                        this.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 5000
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
                return ''
            }
        },
        //查看
        handleView(index, row) {
            this.$router.push({ path: '/delivery-list', query: { orderId: row.id } });
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

        // 多选操作  -- 选择值发生变化
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },

        // 打印发货单
        printOrder(index,row){
            this.getSandOrderList(row.id);
        },

        // 打印已选
        printSelected(){
            this.getAll(this.multipleSelection);
        },

        // 批量打印
        handleBulkPrint(orderData){
            this.singlePrintData = [];
            orderData.forEach((userItem)=>{
                let select_order_num = 0;
                userItem.order.forEach((order_ev) =>{
                    if(order_ev.orderIsSelected){
                        select_order_num = select_order_num + 1;
                    }
                });
                if(select_order_num > 0){
                    this.singlePrintData.push(userItem)
                }
            });

            // 检查 打印单数是否大于0
            this.checkBeforePrint();

        },
        //  打印前检查
        checkBeforePrint(){
            if(this.singlePrintData.length > 0){
                this.$nextTick(()=>{
                    this.singlePrintData.forEach((print_item)=>{
                        const barCodeId = '#barcode' + print_item.id;
                        let str = print_item.id.toString();
                        jsbarcode(
                            barCodeId,
                            str,
                            {
                                displayValue: false // 是否在条形码下方显示文字
                            }
                        )
                    });
                })
                setTimeout(()=>{
                    this.$print(this.$refs.print);
                },50)
            }else {
                this.$notify({
                    title: '请选择订单',
                    message: '',
                    type: 'error',
                    duration: 5000
                });
            }
        },
        // 限制选中
        handleSelection (row, index) {
            if (row.sand_status === 2){
                return false
            }else {
                return true
            }
        },

        // 获取发货单列表
        getSandOrderList(id) {
            let params = {
                process_id: id,
                page:1,
                limit:99999,
                status_in: [0,2],
                logistics_name: '',
                user_name: ''
            };
            const rLoading = this.openLoading();
            getOrderSendList(params).then(res=>{
                rLoading.close();
                if (res.code === 200) {
                    if (res.data.lists) {
                        const new_arr = res.data.lists;
                        new_arr.forEach((ev,i)=>{
                            if(ev.order){
                                ev.order.forEach((order_item,index)=>{
                                    order_item['orderIsSelected'] = true;
                                    if(order_item.detail){
                                    }else {
                                        order_item.detail = [];
                                    }
                                })
                            }
                        })
                        this.orderData = new_arr;
                        this.handleBulkPrint(this.orderData);
                    } else {
                        this.orderData = [];
                    }
                } else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }
            }).catch((err)=>{});
        },
        getAll(selected_arr){
            let sand_order_arr = [];
            selected_arr.forEach((ev)=>{
                sand_order_arr.push(getOrderSendList({
                    process_id:  ev.id,
                    page:1,
                    limit:99999,
                    status_in: [0,2],
                    logistics_name: '',
                    user_name: ''})
                )
            });
            this.orderData = [];
            const that = this;
            Promise.all(sand_order_arr).then(resArr => {
                if(resArr && resArr.length){
                    resArr.forEach((res_ev) => {
                        if (res_ev.code === 200) {
                            if (res_ev.data.lists) {
                                const new_arr = res_ev.data.lists;
                                new_arr.forEach((ev,i)=>{
                                    if(ev.order){
                                        ev.order.forEach((order_item,index)=>{
                                            order_item['orderIsSelected'] = true;
                                            if(order_item.detail){
                                            }else {
                                                order_item.detail = [];
                                            }
                                        })
                                    }
                                })
                                that.orderData = that.orderData.concat(new_arr);
                            }
                        }
                    });
                    that.handleBulkPrint(that.orderData);
                }
            }).catch((err)=>{});
            /*this.$ajax.all(
                sand_order_arr
            ).then(that.$ajax.spread(function() {

            }));*/
        }
    }
};
</script>

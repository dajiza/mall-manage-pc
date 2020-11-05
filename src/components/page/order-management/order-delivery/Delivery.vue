<template>
    <div class="delivery">
        <div class="search-container clearfix">
            <el-form :model="searchForm" :inline="true" ref="searchForm">
                <div class="search-item-box">
                    <el-form-item label="用户昵称：" prop="user_name" class="marginRight55">
                        <el-input v-model="searchForm.user_name" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="收货人姓名：" prop="logistics_name" class="marginRight55">
                        <el-input v-model="searchForm.logistics_name" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="代理店铺：" prop="store" class="margin-right0">
                        <el-select
                                v-model="searchForm.store"
                                placeholder="请选择"
                                class="handle-select mr10"
                        >
                            <el-option
                                    v-for="state in storeOptions"
                                    :key="state.key"
                                    :value="state.key"
                                    :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                </div>
                <div class="search-item-box">
                    <el-form-item label="订单状态：" prop="status">
                        <el-select
                                v-model="searchForm.status"
                                placeholder="请选择"
                                class="handle-select mr10"
                        >
                            <el-option
                                    v-for="state in orderStatusOptions"
                                    :key="state.key"
                                    :value="state.key"
                                    :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                    <div class="btn-right">
                        <el-button @click="resetForm('searchForm')">重置</el-button>
                        <el-button type="primary" @click="handleSearch('searchForm')">搜索</el-button>
                    </div>
                </div>
            </el-form>
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
        <div class="m-t-16 p-t-0 order-content table-has-img" v-for="(userItem,i) in orderData" :key="i">
            <div class="consumer-shop">
                <img src="../../../../assets/img/store-icon.svg" alt />
                <span>{{userItem.shop_name}}</span>
            </div>
            <div class="store-content">
                <div class="order-main-content">
                    <div class="single-custom">
                        <div class="custom-info">
                            <ul>
                                <li>
                                    <span>客户ID:</span>
                                    <span>{{backId(userItem.order)}}</span>
                                </li>
                                <li>
                                    <span>用户昵称:</span>
                                    <span>{{userItem.user_name}}</span>
                                </li>
                                <li>
                                    <span>收货信息:</span>
                                    <span>{{userItem.logistics_name}} {{userItem.logistics_phone}}
                                        {{userItem.logistics_province}}{{userItem.logistics_city}}{{userItem.logistics_area}}{{userItem.logistics_address}}</span>
                                </li>
                            </ul>
                        </div>
                        <div class="order-info" v-for="(order_item,ind) in userItem.order" :key="ind">
                            <div class="order-header clearfix">
                                <ul>
                                    <li>
                                        <el-checkbox v-model="order_item.orderIsSelected" @change="select_order(order_item)"></el-checkbox>
                                    </li>
                                    <li>
                                        <span>订单号:</span>
                                        <span>{{order_item.order_no}}</span>
                                    </li>
                                    <li>
                                        <span>订单ID:</span>
                                        <span>{{order_item.id}}</span>
                                    </li>
                                    <li>
                                        <span>购买数量:</span>
                                        <span>{{buyNum(order_item.detail)}}</span>
                                    </li>
                                    <li>
                                        <span>购买渠道:</span>
                                        <span>{{order_item.channel_name}}</span>
                                    </li>
                                    <li>
                                        <span>支付时间:</span>
                                        <span>{{order_item.paid_time}}</span>
                                    </li>
                                </ul>
                                <div class="delivery-button">
                                    <el-button type="primary" @click="handleSingleShipment(order_item,userItem)" v-hasPermission="'order-sand-one'"
                                    >{{order_item.select_box_show && order_item.orderIsSelected?'发货(选中)':'发货'}}</el-button>
                                </div>
                            </div>
                            <div class="product-table">
                                <el-table
                                        :data="order_item.detail"
                                        :ref="'multipleTable'+order_item.id"
                                        tooltip-effect="dark"
                                        @selection-change="handleSelectionChange"
                                        @select="hangeSingleSelect"
                                        @select-all="handleAllSingleTable(order_item.detail,order_item)"
                                >
                                    <el-table-column type="selection" width="55" align="center"
                                                     :selectable="handleSelection"
                                                     v-if="order_item.select_box_show"></el-table-column>
                                    <el-table-column prop="status" label="状态" align="center" width="130">
                                        <template scope="scope">
                                            <span class="order-status" :class="orderStatusClass(scope.row.status)"
                                            >{{orderStatus(scope.row.status)}}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="产品图片" width="120">
                                        <template slot-scope="scope">
                                            <img class="product-img" :src="getImg(scope.row.product_img)" alt="" @click="viewBigImg(scope.row.product_img)">
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="product_name" label="产品名称" width="200"></el-table-column>
                                    <el-table-column prop="product_code" label="产品编码" width="160"></el-table-column>
                                    <el-table-column prop="goods_name" label="商品名称" width="200"></el-table-column>
                                    <el-table-column label="规格" width="160">
                                        <template slot-scope="scope">
                                            <p v-for="(item,i) in back_goods_attr(scope.row.goods_attr)">{{item['Title']}}：{{item['Value']}}</p>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="price" label="单价(元)">
                                        <template slot-scope="scope">
                                           <span>{{scope.row.price/100}}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="price_real" label="商品实付(元)" width="100">
                                        <template slot-scope="scope">
                                            <span>{{scope.row.price_real/100}}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="num" label="数量"></el-table-column>
                                    <el-table-column prop="product_unit" label="单位"></el-table-column>
                                    <el-table-column label="合计">
                                        <template scope="scope">
                                            <span>{{scope.row.num}}{{scope.row.product_unit}}</span>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                            <ul class="leaving-message" v-if="order_item.message || order_item.remark">
                                <li v-show="order_item.message">
                                    <span class="order-remark-title">用户留言:</span>
                                    <span>{{order_item.message}}</span>
                                </li>
                                <li v-show="order_item.remark">
                                    <span class="order-remark-title">后台留言:</span>
                                    <div>{{order_item.remark}}</div>
                                </li>
                            </ul>
                            <ul class="good-info">
                                <li>
                                    <span>商品数量:</span>
                                    <span>{{buyNum(order_item.detail)}}</span>
                                </li>
                                <li>
                                    <span>货物种类:</span>
                                    <span>{{order_item.detail ? order_item.detail.length : 0}}</span>
                                </li>
                            </ul>
                        </div>
                        <div class="custom-info six-operation">
                            <el-button
                                    class="single-operation"
                                    @click="handleAllSelectSingleOrder(userItem,i)"
                            >全选</el-button>
                            <el-button
                                    class="single-operation"
                                    @click="handleInvetSelectSingleOrder(userItem)"
                            >反选</el-button>
                            <el-button class="single-operation" v-hasPermission="'print-sand-order'" @click="handlePrint(userItem)">打印发货单</el-button>
                            <el-button class="single-operation" v-hasPermission="'order-sand-one'" @click="handleMergeShip(userItem)">合并发货</el-button>
                            <el-button class="single-operation" v-if="!userItem.splitShow" @click="splitShipment(userItem,true)">拆分发货</el-button>
                            <el-button class="single-operation" v-if="userItem.splitShow" @click="splitShipment(userItem,false)">取消拆分</el-button>
                            <el-button class="single-operation" v-hasPermission="'show-QR-code'" @click="showCode(userItem)">显示二维码</el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="all-six-operation">
            <el-button class="single-operation" @click="handleWrapAllSelect(orderData)">全选</el-button>
            <el-button class="single-operation" @click="handleWrapInvetSelect(orderData)">反选</el-button>
            <el-button class="single-operation" v-hasPermission="'print-sand-order'" @click="handleBulkPrint(orderData)">批量打印</el-button>
            <el-button class="single-operation" v-hasPermission="'order-sand-all'" @click="handleBulkShipping(orderData)">批量发货</el-button>
            <el-button class="single-operation" v-if="!orderData.allSplitShow" @click="allSplitShipment(orderData,true)">拆分发货</el-button>
            <el-button class="single-operation" v-if="orderData.allSplitShow" @click="allSplitShipment(orderData,false)">取消拆分</el-button>
        </div>
        <div v-show="orderData.length === 0">
            <EmptyList tipText="订单已发完了哦～"></EmptyList>
        </div>
        <transition name="el-fade-in-linear">
            <BigImg ref="bigImg" :imgUrl="bigImgUrl"></BigImg>
        </transition>
        <transition name="el-fade-in-linear">
            <div class="qrcode-box" v-if="codeIsShow" @click="codeHide">
                <div class="qrcode" ref="qrCodeUrl"></div>
            </div>
        </transition>
        <!--单个发货模态框-->
        <el-dialog
                title="填写物流信息"
                :visible.sync="singleShipmentVisible"
                width="380px"
                destroy-on-close="destroy-on-close"
                :before-close="singleShipmentClose"
                :close-on-click-modal="false">
            <el-form ref="singleShipmentBox"
                    :rules="singleShipmentRules"
                     label-width="85px"
                    :model="singleShipmentForm">
                <el-form-item label="选择快递" prop="courierCompany">
                    <el-select v-model="singleShipmentForm.courierCompany" placeholder="请选择" clearable>
                        <el-option
                                v-for="state in courierCompanyOptions"
                                :key="state.id"
                                :value="state.id"
                                :label="state.name"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="快递单号" prop="courierNo">
                    <el-input v-model="singleShipmentForm.courierNo"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="singleShipmentClose">取 消</el-button>
                <el-button type="primary" @click="sureSingleShipment('singleShipmentBox')">确 定</el-button>
            </span>
        </el-dialog>
        <!--批量发货模态框-->
        <el-dialog
                title="填写物流信息"
                :visible.sync="bulkShippingVisible"
                width="1000px"
                destroy-on-close="destroy-on-close"
                :before-close="bulkShippingClose"
                custom-class="bulk-shipping-dialog"
                :close-on-click-modal="false">
            <el-form ref="bulkShippingBox"
                     :model="bulkShippingForm">
                <el-table :data="bulkShippingForm.bulkShippingSelectInfo"
                          :height="tableHeight"
                          ref="multipleTable" tooltip-effect="dark">
                    <el-table-column prop="user_name" label="用户昵称" width="160px"></el-table-column>
                    <el-table-column prop="logistics_info" label="收货信息" width="220px">
                    </el-table-column>
                    <el-table-column prop="order_num" label="订单数" width="100px"></el-table-column>
                    <el-table-column label="快递公司" width="250px">
                        <template slot-scope="scope">
                            <el-form-item label="" :prop="'bulkShippingSelectInfo.' + scope.$index + '.courier_company'"
                                          　:rules="[{required: true, message: '请选择快递公司', trigger: ['blur']}]"
                                          >
                                <el-select class="courier-company-select" v-model="scope.row.courier_company" placeholder="请选择" clearable>
                                    <el-option
                                            v-for="state in courierCompanyOptions"
                                            :key="state.id"
                                            :value="state.id"
                                            :label="state.name"
                                    />
                                </el-select>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="快递单号" width="270px">
                        <template slot-scope="scope">
                            <el-form-item label=""  :prop="'bulkShippingSelectInfo.' + scope.$index + '.courier_order_no'"
                                          :rules="[{required: true, message: '请填写订单号', trigger: ['blur']}]"
                                          >
                                <el-input class="courier-no-input" placeholder="请输入" v-model="scope.row.courier_order_no"></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                </el-table>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="success" @click="saveAndClose">保存并关闭</el-button>
                <el-button type="primary" @click="sureBulkShipping()">确认发货</el-button>
            </span>
        </el-dialog>
        <!--异常提示-->
        <el-dialog
                title="提示"
                :visible.sync="abnormalTipsVisible"
                width="424px" custom-class="abnormalTipsDialog">
            <div class="abnormal-icon">
                <img src="../../../../assets/img/warning-icon.svg" alt="">
            </div>
            <span>本订单中有部分商品，{{tipsText}}，是否已核对发货清单。</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="abnormalTipsVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleSureCheck">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    import './OrderDelivery.less';
    import {getOrderSendList, getSdCompanyList, getOrderSandOne, getOrderSandAll} from '../../../../api/cutCloth';
    import BigImg from '../../../common/big-img/BigImg';
    import EmptyList from '../../../common/empty-list/EmptyList';
    import PrintExpress from '../../../common/print-express/PrintExpress';
    import QRCode from 'qrcodejs2';
    import jsbarcode from 'jsbarcode'

    export default {
        name: 'Delivery',
        data() {
            return {
                searchForm: {
                    user_name: '',
                    logistics_name: '',
                    store: '',
                    status: ''
                },
                searchParams: {
                    user_name: '',
                    logistics_name: '',
                    store: '',
                    status: ''
                },
                loading: false,
                orderData: [],
                multipleSelection: [],
                orderStatusOptions: [{ key: '0', name: '待发货' },{key:'2',name:'部分发货'}],
                storeOptions:[],
                bigImgUrl:'',  // 需要放大图片url
                imgBaseUrl:'',
                codeIsShow:false,
                singleShipmentVisible:false,  // 单个发货模态框 是否显示
                singleShipmentForm:{
                    courierCompany:'',
                    courierNo:''
                },
                singleShipmentRules:{
                    courierCompany:[
                        { required: true, message: '请选择快递公司', trigger: 'blur' },
                    ],
                    courierNo:[
                        { required: true, message: '请输入快递单号', trigger: 'blur' },
                    ]
                },
                bulkShippingVisible:false,  // 批量发货模态框 是否显示
                bulkShippingForm:{
                    bulkShippingSelectInfo:[],
                    rules:{
                        courier_company:[{required: true, message: '请选择快递公司', trigger: ['blur']}],
                        courier_order_no:[{required: true, message: '请填写订单号', trigger: ['blur']}],
                    },
                },
                isBulkShipping: false,    // 是否是批量发货操作
                bulkShippingSelectInfo:[], // 批量发货选中信息
                courierCompanyOptions:[],  // 快递公司下拉列表
                abnormalTipsVisible:false,   // 异常提示弹框是否显示
                tipsText:'',     // 异常提示
                one_span_id:-1,       // 发货单id（发货、合并发货用）
                order_detail_ids:[],    // 发货小订单（商品）（发货、合并发货用）
                tableHeight:'',
                singlePrintData: []  // 打印内容
            };
        },
        components: {
            BigImg,
            EmptyList,
            PrintExpress
        },
        watch: {
        },
        computed: {
            //  拼接图片地址
            getImg: function () {
                return (data) => {
                    if(data.indexOf('http') === -1){
                        return this.imgBaseUrl + data + '!/fw/' + 80;
                    }else {
                        return data + '!/fw/' + 80;
                    }
                }
            },
            backId: function(){
                return (data) => {
                    let user_id;
                    if(data && data.length > 0){
                        user_id = data[0].user_id;
                    }else {
                        user_id = '';
                    }
                    return user_id
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
            orderStatus: function () {
                return (data) =>{
                    if(data === 0 ){
                        return '待付款'
                    }else if((data === 1)){
                        return '已付款'
                    }else if((data === 2)){
                        return '待发货'
                    }else if((data === 3)){
                        return '已发货'
                    }else if((data === 4)){
                        return '已取消'
                    }else if((data === 5)){
                        return '申请仅退款'
                    }else if((data === 6)){
                        return '申请退货退款'
                    }else if((data === 7)){
                        return '退货中'
                    }else if((data === 8)){
                        return '仅退款关闭'
                    }else if((data === 9)){
                        return '已关闭'
                    }else if((data === 10)){
                        return '已完成'
                    }else if((data === 11)){
                        return '未付款关闭'
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
                    }else if((data === 4 || data === 8 || data === 9 || data === 11)){
                        return 'order-cancelled'
                    }else if((data === 10)){
                        return 'order-successfully'
                    }
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
        created() {
            if(this.$route.query.orderStatus){
                this.$set(this.searchParams,'status', '2');
                this.$set(this.searchForm,'status', '2');
            }
            // 请求获取快递公司列表
            this.getSdList();
        },
        mounted() {
            this.getDataList();

        },
        methods: {
            getDataList() {
                let status_arr = [];
                // if(Number(this.searchParams.status) > -1){
                //     status_arr.push(Number(this.searchParams.status))
                // }
                if(this.searchParams.status === '' || Number(this.searchParams.status) < 0){
                    status_arr = [0,2];
                }else {
                    status_arr.push(Number(this.searchParams.status))
                }
                let params = {
                    process_id: Number(this.$route.query.orderId) || -1,
                    page:1,
                    limit:99999,
                    status_in: status_arr,
                    logistics_name: this.searchParams.logistics_name,
                    user_name:this.searchParams.user_name
                };
                const rLoading = this.openLoading();
                getOrderSendList(params).then(res=>{
                    rLoading.close();
                    if (res.code === 200) {
                        if (res.data.lists) {
                            const new_arr = res.data.lists;
                            new_arr['allSplitShow'] = false;
                            new_arr.forEach((ev,i)=>{
                                ev['splitShow'] = false;
                                if(ev.order){
                                    ev.order.forEach((order_item,index)=>{
                                        order_item['select_box_show'] = false;
                                        order_item['orderIsSelected'] = false;
                                        if(order_item.detail){
                                            order_item.detail.forEach((goods_item, goods_index)=>{
                                                goods_item['isSelected'] = false;
                                            })
                                        }else {
                                            order_item.detail = [];
                                        }
                                    })
                                }
                            })
                            this.orderData = new_arr;

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
                }).catch(() => {});
            },

            // 请求获取快递公司列表
            getSdList(){
                let params = {
                    is_app: 0
                };
                const rLoading = this.openLoading();
                getSdCompanyList(params).then(res=>{
                    rLoading.close();
                    if (res.code === 200) {
                        if (res.data) {
                            this.courierCompanyOptions = res.data;
                        } else {
                            this.courierCompanyOptions = [];
                        }
                    } else {
                        this.$notify({ title: res.msg, message: '', type: 'error', duration: 5000 });
                    }
                }).catch(() => {});
            },

            // 限制选中
            handleSelection (row, index) {
                if (row.status === 2){
                    return true
                }else {
                    return false
                }
            },

            // 按钮-重置
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.$set(this.searchParams,'status', '');
                this.$set(this.searchParams,'logistics_name', '');
                this.$set(this.searchParams,'user_name', '');
                this.getDataList();
            },
            // 按钮-触发搜索按钮
            handleSearch(formName) {
                // 储存搜索条件
                this.$set(this.searchParams,'status', this.searchForm.status);
                this.$set(this.searchParams,'logistics_name', this.searchForm.logistics_name);
                this.$set(this.searchParams,'user_name', this.searchForm.user_name);
                this.getDataList();
            },

            // 全选 -- 单个店铺单个客户的所有订单
            handleAllSelectSingleOrder(item, ind) {
                item.order.map((v, index) => {
                    v.orderIsSelected = true;
                    const name = 'multipleTable' + v.id;
                    v.detail.map((s, ind) => {
                        if(s.status === 2){
                            s.isSelected = true;
                            this.$nextTick(() => {
                                this.$refs[name][0].toggleRowSelection(s, true);
                            });
                        }
                    });
                });
            },

            // 反选 -- 单个店铺单个客户的所有订单
            handleInvetSelectSingleOrder(item) {
                item.order.map((v, index) => {
                    v.orderIsSelected = !v.orderIsSelected;
                    const name = 'multipleTable' + v.id;
                    v.detail.map((s, ind) => {
                        if(s.status === 2){
                            s.isSelected = !s.isSelected;
                            this.$nextTick(() => {
                                this.$refs[name][0].toggleRowSelection(s);
                            });
                        }
                    });
                });
            },

            // 全选 -- 外部 所有店铺单个客户的所有订单
            handleWrapAllSelect(orderData){
                orderData.forEach((ev)=>{
                    this.handleAllSelectSingleOrder(ev);
                })
            },

            // 反选 -- 外部 所有店铺单个客户的所有订单
            handleWrapInvetSelect(orderData){
                orderData.forEach((ev)=>{
                    this.handleInvetSelectSingleOrder(ev);
                })
            },

            // 选择订单
            select_order(order_item){
                const name = 'multipleTable' + order_item.id;
                this.$nextTick(()=>{
                    order_item.detail.map((goodsItem, ind) => {
                        this.$nextTick(() => {
                            if(goodsItem.status === 2){
                                goodsItem.isSelected = order_item.orderIsSelected;
                                this.$refs[name][0].toggleRowSelection(goodsItem, order_item.orderIsSelected);
                            }else {
                                goodsItem.isSelected = false;
                                this.$refs[name][0].toggleRowSelection(goodsItem, false);
                            }

                        });
                    });
                })
            },

            // 检查 订单下是否有选中商品
            handleCheckGoods(){
                this.orderData.forEach((user_item,user_i)=>{
                    user_item.order.forEach((order_item,order_i)=>{
                        let new_arr = [];
                        order_item.detail.forEach((goods_item,goods_i)=>{
                            if(goods_item.isSelected){
                                new_arr.push(goods_item);
                            }
                        });
                        if(new_arr.length > 0){
                            order_item['orderIsSelected'] = true;
                        }else {
                            order_item['orderIsSelected'] = false;
                        }
                    })
                })
            },

            // 多选操作  -- 选择值发生变化
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },

            // 单个订单 - 单选
            hangeSingleSelect(selectedNode,row) {
                const bol = row.isSelected;
                this.$set(row,'isSelected',!bol);
                this.$nextTick(()=>{
                    this.handleCheckGoods();
                })
            },

            // 单个订单 - 全选
            handleAllSingleTable(selectedNode,orderItem) {
                this.$nextTick(()=>{
                    // 选中值数组的length > 0 全选，否则 全部取消
                    let select_arr = [];
                    if(this.multipleSelection.length > 0){
                        // selectedNode.map((v) => (v.isSelected = true));
                        selectedNode.forEach((ev)=>{
                            if(ev.status === 2){
                                this.$set(ev,'isSelected',true);
                                select_arr.push(ev);
                            }
                        })
                        if(select_arr.length > 0){
                            this.$set(orderItem,'orderIsSelected',true);
                        }
                        // this.$set(orderItem,'orderIsSelected',true);
                    }else {
                        selectedNode.map((v) => (v.isSelected = false));
                        this.$set(orderItem,'orderIsSelected',false);
                    }
                });
            },

            // 查看大图
            viewBigImg(pic_url){
                if(pic_url){
                    if(pic_url.indexOf('http') === -1){
                        this.bigImgUrl =  this.imgBaseUrl + pic_url + '!/fw/640';
                    }else {
                        this.bigImgUrl =  pic_url + '!/fw/640';
                    }
                    this.$refs.bigImg.show();
                }
            },

            // 拆分发货 -- 单个店铺（单个客户）
            splitShipment(user_item, blo){
                this.$set(user_item,'splitShow',blo);
                user_item.order.forEach((ev)=>{
                    const name = 'multipleTable' + ev.id;
                    ev.detail.map((s, ind) => {
                        this.$nextTick(() => {
                            if(s.status === 2){
                                s.isSelected = ev.orderIsSelected;
                                this.$refs[name][0].toggleRowSelection(s, s.isSelected);
                            }else {
                                s.isSelected = false;
                                this.$refs[name][0].toggleRowSelection(s, false);
                            }
                            ev.select_box_show = blo;
                        });

                    });

                });
                // 如果 全部order 拆分发货开启 则 最外层 拆分发货开启，全部 order 拆分发货为 开启0 则 最外层 拆分发货关闭
                this.$nextTick(() => {
                    let new_arr = [];
                    this.orderData.forEach((item)=>{
                        if(item.splitShow){
                            new_arr.push(item);
                        }
                    });
                    if(new_arr.length === this.orderData.length){
                        this.$set(this.orderData,'allSplitShow',true);
                    }
                    if(new_arr.length === 0){
                        this.$set(this.orderData,'allSplitShow',false);
                    }
                });

            },

            // 拆分发货 -- 全部
            allSplitShipment(orderData,blo){
                this.$set(orderData,'allSplitShow',blo);
                orderData.forEach((user_item)=>{
                    this.splitShipment(user_item,blo);
                })
            },

            // 按钮 - 发货（单个订单）
            handleSingleShipment(order_item,user_item){
                this.one_span_id = user_item.id;
                this.order_detail_ids = [];
                this.isBulkShipping = false;
                if(order_item.select_box_show){
                    let select_goods = [];
                    order_item.detail.forEach(ev=>{
                        if(ev.isSelected && ev.status === 2){
                            select_goods.push(ev);
                            this.order_detail_ids.push(ev.id);
                        }
                    });
                    if(select_goods.length > 0){
                        // 判断有无异常状态订单，如果有 则提示弹框出现
                        this.checkSelectOrder(select_goods);
                    }else {
                        this.$notify({
                            title: '请选择订单',
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                }else {
                    let select_goods = [];
                    if(order_item.detail){
                        order_item.detail.forEach(ev=>{
                            if( ev.status === 2){
                                select_goods.push(ev);
                                this.order_detail_ids.push(ev.id);
                            }
                        });
                    }
                    if(select_goods.length > 0){
                        // 判断有无异常状态订单，如果有 则提示弹框出现
                        this.checkSelectOrder(select_goods);
                    }else {
                        this.$notify({
                            title: '未发现待发货订单',
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                }
            },
            // 按钮 - 合并发货（单订单）
            handleMergeShip(user_item){
                this.one_span_id = user_item.id;
                this.order_detail_ids = [];
                this.isBulkShipping = false;
                this.$nextTick(()=>{
                    let select_goods = [];
                    user_item.order.forEach((ev)=>{
                        if(ev.detail){
                            ev.detail.forEach(ev=>{
                                if(ev.isSelected){
                                    select_goods.push(ev);
                                    this.order_detail_ids.push(ev.id);
                                }
                            });
                        }
                    });
                    if(select_goods.length > 0){
                        // 判断有无异常状态订单，如果有 则提示弹框出现
                        this.checkSelectOrder(select_goods);
                    }else {
                        this.$notify({
                            title: '请选择订单',
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                })
            },

            // 检测选中的订单中有无异常订单
            checkSelectOrder(data){
                let warning_tip = [];
                data.forEach((ev)=>{
                    if(ev.status === 0){
                        warning_tip.push('还未付款');
                    }else if(ev.status === 3){
                        warning_tip.push('已发货');
                    }else if(ev.status === 7){
                        warning_tip.push('正在退款中');
                    }else if(ev.status === 99){
                        warning_tip.push('已退款成功');
                    }
                });
                if(warning_tip.length > 0){
                    const new_arr = [...new Set(warning_tip)];
                    this.tipsText = new_arr.join('、');
                    this.abnormalTipsVisible = true;
                }else {  // 无异常订单
                    if(this.isBulkShipping){
                        this.bulkShippingVisible = true;
                    }else {
                        this.$set(this.singleShipmentForm,'courierNo','');
                        this.singleShipmentVisible = true;
                    }
                }
            },

            // 按钮 - 异常弹窗确定
            handleSureCheck(){
                this.abnormalTipsVisible = false;
                if(this.isBulkShipping){
                    this.bulkShippingVisible = true;
                }else {
                    this.$set(this.singleShipmentForm,'courierNo','');
                    this.singleShipmentVisible = true;
                }
            },

            // 按钮 - 确定发货（单个订单/合并发货）
            sureSingleShipment(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let obj = {};
                        obj = this.courierCompanyOptions.find(item =>{
                            return item.id === this.singleShipmentForm.courierCompany
                        });
                        let params = {
                            id: this.one_span_id,  //发货单ID
                            logistics_company_id: Number(this.singleShipmentForm.courierCompany),  //快递公司id
                            logistics_company_name: obj.name,
                            logistics_no: this.singleShipmentForm.courierNo,  //单号
                            order_detail_ids: this.order_detail_ids  // 小订单ID
                        }
                        const rLoading = this.openLoading();
                        getOrderSandOne(params).then((res) => {
                                rLoading.close();
                                if (res.code === 200) {
                                    this.$notify({
                                        title: '操作成功',
                                        message: '',
                                        type: 'success',
                                        duration: 5000
                                    });
                                    this.singleShipmentVisible = false;
                                    this.getDataList();
                                } else {
                                    this.$notify({
                                        title: res.msg,
                                        message: '',
                                        type: 'error',
                                        duration: 5000
                                    });
                                }
                            }).catch(() => {});
                    }
                });
            },

            // 按钮 - 批量发货
            handleBulkShipping(orderData){
                if(orderData.allSplitShow){
                    this.$notify({
                        title: '请先取消拆分',
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }else {
                    this.bulkShippingSelectInfo = [];   //
                    this.isBulkShipping = true;
                    let select_goods = [];
                    orderData.forEach((first_item,first_i)=>{
                        let arr2 = [];   //
                        let order_ids_arr =[];
                        first_item.order.forEach((order_item,order_i)=>{
                            if(order_item.orderIsSelected){
                                arr2.push(order_item);
                                order_ids_arr.push(order_item.id);
                                if(order_item.detail){
                                    order_item.detail.forEach(ev=>{
                                        select_goods.push(ev);
                                    });
                                }
                            }
                        });

                        if(arr2.length > 0){
                            this.bulkShippingSelectInfo.push({
                                sand_id:first_item.id,
                                order_ids:order_ids_arr,
                                user_name:first_item.user_name,
                                logistics_info: first_item.logistics_name + ' ' + first_item.logistics_phone + ' '
                                    +first_item.logistics_province + first_item.logistics_city
                                    +first_item.logistics_area + first_item.logistics_address,
                                order_num:arr2.length,
                                courier_company: first_item.courier_company ? first_item.courier_company : '',
                                courier_order_no: first_item.courier_order_no ? first_item.courier_order_no : '',
                            });
                            this.$set(this.bulkShippingForm,'bulkShippingSelectInfo', this.bulkShippingSelectInfo);
                            if(this.bulkShippingSelectInfo.length * 92 > 500){
                                this.tableHeight = '500px';
                            }else {
                                this.tableHeight = this.bulkShippingSelectInfo * 92 + 'px';
                            }
                        }
                    });
                    if(select_goods.length > 0){// 判断有无异常状态订单，如果有 则提示弹框出现
                        this.checkSelectOrder(select_goods);
                    }else {
                        this.$notify({
                            title: '请选择订单',
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                }

            },

            // 按钮 - 保存并关闭（批量发货）
            saveAndClose(){
                const save_arr = this.bulkShippingForm.bulkShippingSelectInfo;
                save_arr.forEach((first_item,i)=>{
                    this.orderData.forEach((user_item,user_i)=>{
                        if(user_item.id === first_item.sand_id){
                            user_item['courier_company'] = first_item['courier_company'];
                            user_item['courier_order_no'] = first_item['courier_order_no'];
                            // this.$set(user_item,'courier_company',first_item['courier_company']);
                            // this.$set(user_item,'courier_order_no',first_item['courier_order_no']);
                        }
                    })
                });
                this.bulkShippingVisible = false;
            },

            // 按钮 - 确定发货（批量发货）
            sureBulkShipping(){
                this.$refs['bulkShippingBox'].validate((valid) => {
                    if (valid) {
                        const save_arr = this.bulkShippingForm.bulkShippingSelectInfo;
                        let list = [];
                        save_arr.forEach((ev,i)=>{
                            let obj = {};
                            obj = this.courierCompanyOptions.find(item =>{
                                return item.id === ev.courier_company
                            });
                            // 参数 需要加一个订单id 数组
                            list.push({
                                sand_id:ev.sand_id,
                                logistics_company_id: ev.courier_company,
                                logistics_company_name: obj.name,
                                logistics_no: ev.courier_order_no,
                                order_ids:ev.order_ids
                            })
                        });
                        let params = {
                            data: list
                        }
                        this.postBulkShipping(params);
                    }else {
                        this.$notify({
                            title: '请选择快递公司或输入快递单号',
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                })
            },

            // 请求 - 批量发货
            postBulkShipping(params){
                const rLoading = this.openLoading();
                getOrderSandAll(params).then((res) => {
                    rLoading.close();
                    if (res.code === 200) {
                        this.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 5000
                        });
                        this.bulkShippingVisible = false;
                        this.bulkShippingSelectInfo = [];
                        this.$set(this.bulkShippingForm,'bulkShippingSelectInfo', this.bulkShippingSelectInfo);
                        this.getDataList();
                    } else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                }).catch(() => {});
            },

            // 显示二维码
            showCode(userItem){
                this.codeIsShow = true;
                this.$nextTick(()=>{
                    let params = userItem.id.toString();
                    this.creatQrCode(params);
                })
            },

            // 生成二维码
            creatQrCode(params) {
                var qrcode = new QRCode(this.$refs.qrCodeUrl, {
                    text: params, // 需要转换为二维码的内容
                    width: 500,
                    height: 500,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                })
            },

            codeHide(){
                this.codeIsShow = false;
            },
            // 打印发货单
            handlePrint(userItem){
                let select_order_num = 0;
                this.singlePrintData = [];
                userItem.order.forEach((order_ev) =>{
                    if(order_ev.orderIsSelected){
                        select_order_num = select_order_num + 1;
                    }
                });
                if(select_order_num > 0){
                    this.singlePrintData.push(userItem);
                    // 检查 打印单数是否大于0
                    this.checkBeforePrint();
                }else {
                    this.$notify({
                        title: '请选择订单',
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }
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
            // 单个发货弹框关闭前
            singleShipmentClose() {
                this.$refs['singleShipmentBox'].resetFields();
                this.$refs['singleShipmentBox'].clearValidate();
                this.singleShipmentVisible = false;
            },
            // 批量发货弹框关闭前
            bulkShippingClose() {
                this.$refs['bulkShippingBox'].resetFields();
                this.$refs['bulkShippingBox'].clearValidate();
                this.bulkShippingVisible = false;
            }
        }
    };
</script>
<style>
    .print-A5-page{
        width: 210mm;
        background: #c0c0c0;
        position: absolute;
        z-index: -1;
        top: -10000px;
        left: -1000px;
    }
    #printMe{
        width: 100%;
        margin: 0 auto;
    }
    /* 去除页眉页脚 */
    /*@page {size:auto A4 landscape;margin:10mm 0 8mm 0;}*/
    /* 增加padding */

    @media print {
        /*.single-order .print-table{font-size: 10px;border-collapse:collapse;border: 1px solid rgba(0,0,0,.1);}*/
    }
</style>
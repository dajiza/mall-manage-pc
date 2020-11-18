<template>
    <div class="order-detail-container">
        <div class="container-box container-order-status">当前订单状态：{{orderStatus(order_info.status)}}</div>
        <div class="container-box m-t-16 p-t-0">
            <div class="info-title">
                <div class="global-table-title">
                    <div class="title">
                        <i></i>
                        <span>收货信息</span>
                    </div>
                </div>
            </div>
            <div class="info-content">
                <div class="info-content-box">
                    <div class="info-content-item">
                        <p class="label">用户ID：</p>
                        <p class="info-value">{{order_info.user_id}}</p>
                    </div>
                    <div class="info-content-item">
                        <p class="label">收货人姓名：</p>
                        <p class="info-value">{{order_info.logistics_name}}</p>
                    </div>
                    <div class="info-content-item">
                        <p class="label">用户手机号：</p>
                        <p class="info-value">{{order_info.logistics_phone}}</p>
                    </div>
                </div>
                <div class="logistics-address">
                    <p class="label">收货地址：</p>
                    <p class="info-value">{{order_info.logistics_province}}{{order_info.logistics_city}}{{order_info.logistics_area}}{{order_info.logistics_address}}</p>
                </div>
            </div>

        </div>
        <div class="container-box m-t-16 p-t-0">
            <div class="info-title">
                <div class="global-table-title">
                    <div class="title">
                        <i></i>
                        <span>快递信息</span>
                        <span class="split-order" v-show="back_is_split(order_info)">本订单已拆分发货，可在下方订单信息中查看对应产品物流</span>
                    </div>
                </div>
            </div>
            <div class="info-content">
                <div class="info-content-box">
                    <div class="info-content-item">
                        <span class="label">快递公司：</span>
                        <p class="info-value">{{order_info.logistics_company_name}}</p>
                    </div>
                    <div class="info-content-item">
                        <span class="label">快递单号：</span>
                        <p class="info-value">{{order_info.logistics_no}}</p>
                    </div>
                </div>
            </div>

        </div>
        <div class="container-box m-t-16 p-t-0">
            <div class="info-title">
                <div class="global-table-title">
                    <div class="title">
                        <i></i>
                        <span>订单备注</span>
                    </div>
                        <el-button type="primary" v-hasPermission="'order-add-remark'" @click="handleAddRemarks">添加留言</el-button>
                </div>
            </div>
            <div class="info-content">
                <div class="info-content-box flex-column">
                    <div class="info-content-item info-remarks">
                        <span class="label">用户留言：</span>
                        <p class="info-value">{{order_info.message}}</p>
                    </div>
                    <div class="info-content-item info-remarks" v-show="order_info.remark">
                        <span class="label">备注信息：</span>
                        <p class="info-value remark-text-color">{{order_info.remark}}</p>
                    </div>
                </div>
            </div>

        </div>
        <div class="container m-t-16 order-info-container table-has-img">
            <div class="line"></div>
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>订单信息</span>
                </div>
                <el-button
                    class="btn-refund"
                    type="danger"
                    v-if="false"
                    @click="handleRefundAll()"
                >全部退款</el-button>
            </div>
            <el-table
                :data="order_info.detail"
                ref="multipleTable"
                class="order-detail-info"
            >
                <el-table-column
                    :fixed="true"
                    label="操作"
                    width="130"
                    v-if="order_info.status === 0 || order_info.logistics_no"
                >
                    <template slot-scope="scope">
                        <div v-show="order_info.status === 0">
                            <el-button
                                type="primary"
                                @click="handleUpdatePrice(scope.$index,scope.row)"
                            >修改价格</el-button>
                        </div>
                        <div v-show="order_info.logistics_no">
                            <el-button
                                type="primary"
                                v-show="scope.row.err_type === 0"
                                :disabled="!(scope.row.status === 3 || scope.row.status === 10)"
                                @click="handleViewLogistics(scope.$index,scope.row)">查看物流</el-button>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="图片" width="140">
                    <template slot-scope="scope">
                        <img class="product-img" :src="getImg(scope.row.product_img)" alt="" @click="viewBigImg(scope.row.product_img)">
                    </template>
                </el-table-column>
                <el-table-column prop="product_name" label="产品名称" width="200"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称" width="200"></el-table-column>
                <el-table-column label="规格" width="160">
                    <template slot-scope="scope">
                        <p v-for="(item,i) in back_goods_attr(scope.row.goods_attr)">{{item['Title']}}：{{item['Value']}}</p>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="订单状态" width="133">
                    <template slot-scope="scope">
                        <span class="order-status" :class="orderStatusClass(scope.row.status)"
                        >{{scope.row.status_name}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="price" label="单价(元)">
                    <template slot-scope="scope">
                        <span>{{(scope.row.price/100) | rounding}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="num" label="数量"></el-table-column>
                <el-table-column label="总价(元)">
                    <template slot-scope="scope">
                        <span>{{(Number(scope.row.price/100) * Number(scope.row.num)) | rounding}}</span>
                    </template>
                </el-table-column>
                <el-table-column v-if="false" prop="off_2" label="折扣优惠(元)" width="140">
                    <template slot-scope="scope">
                        <span>{{scope.row.off_2/100 | rounding}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="price_real" label="改价(元)">
                    <template slot-scope="scope">
                        <div class="change-price">
                            <span>{{ scope.row.price_sum_change/1000 | rounding}}</span>
                            <el-popover
                                    popper-class="update-list-popover"
                                    placement="top-end"
                                    width="540"
                                    trigger="click">
                                <div class="popover-title">改价记录</div>
                                <el-table style="margin: 16px 0 36px" :data="priceUpdateData">
                                    <el-table-column width="100" property="date" label="改价(元)">
                                        <template slot-scope="childrenScope">
                                            <span>{{childrenScope.row.change_price/100 | rounding}}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column width="160" property="reason_name" label="改价原因"></el-table-column>
                                    <el-table-column width="100" property="user_name" label="操作人"></el-table-column>
                                    <el-table-column width="180" property="updated_time" label="操作时间"></el-table-column>
                                </el-table>
                                <div class="remark-tip-wrap" slot="reference">
                                    <i class="remark-tip-img cursor-class"></i>
                                </div>
                            </el-popover>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="price_real" label="实付(元)">
                    <template slot-scope="scope">
                        <span>{{(Number(scope.row.price_real) * Number(scope.row.num) - scope.row.off_2 - scope.row.off_1)/100 | rounding}}</span>
                    </template>
                </el-table-column>
                <template slot="empty">
                    <EmptyList></EmptyList>
                </template>
            </el-table>
            <div class="order-base-info clearfix">
                <div class="order-code-time">
                    <div class="code-time clearfix">
                        <div class="info-item">
                            <span class="label">订单号：</span>
                            <span class="info-value">{{order_info.order_no}}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">付款时间：</span>
                            <span class="info-value">{{order_info.paid_time}}</span>
                        </div>
                    </div>
                    <div class="code-time clearfix">
                        <div class="info-item">
                            <span class="label">下单时间：</span>
                            <span class="info-value">{{order_info.created_time}}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">支付交易号：</span>
                            <span class="info-value">{{order_info.pay_no}}</span>
                        </div>
                    </div>
                </div>
                <div class="order-amount clearfix">
                    <div class="order-amount-item shipping">
                        <div class="amount-name" @click="updateShipping">
                            <span>运费</span>
                            <img class="update-icon" src="../../../../assets/img/updateIcon.svg" v-show="order_info.status === 0" alt="" />
                        </div>
                        <div class="amount-value">
                            <el-popover
                                    popper-class="logistics-update-list-popover"
                                    placement="top"
                                    width="540"
                                    trigger="click">
                                <div class="popover-title">改运费记录</div>
                                <el-table style="margin: 16px 0 36px" :data="FreightUpdateList">
                                    <el-table-column width="100" property="date" label="改价(元)">
                                        <template slot-scope="childrenScope">
                                            <span>{{childrenScope.row.change_price/100 | rounding}}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column width="160" property="reason_name" label="改价原因"></el-table-column>
                                    <el-table-column width="100" property="user_name" label="操作人"></el-table-column>
                                    <el-table-column width="180" property="updated_time" label="操作时间"></el-table-column>
                                </el-table>
                                <i
                                    class="remark-tip-img cursor-class marginRight8"
                                    slot="reference"
                                ></i>
                            </el-popover>
                            <span v-show="order_info.logistics_money > 0">¥ {{order_info.logistics_money/100 | rounding}}</span>
                            <span v-show="!order_info.logistics_money">¥ 0.00</span>
                        </div>
                    </div>
                    <div class="order-amount-item total-order">
                        <div class="amount-name">订单总计</div>
                        <div class="amount-value">¥ {{order_info.price_total/100 | rounding}}</div>
                    </div>
                    <div class="order-amount-item coupon-total">
                        <div class="amount-name">优惠券总额</div>
                        <div class="amount-value">¥ {{order_info.off_1/100 | rounding}}</div>
                    </div>
                    <div class="order-amount-item activity-discount">
                        <div class="amount-name">活动优惠总额</div>
                        <div class="amount-value">¥ {{order_info.off_2/100 | rounding}}</div>
                    </div>
                    <div class="order-amount-item buyer-pays">
                        <div class="amount-name">买家实付</div>
                        <div class="amount-value">¥ {{Number(order_info.price_total_real + order_info.logistics_money)/100 | rounding}}</div>
                    </div>
                </div>
            </div>
        </div>
        <!--添加留言-->
        <el-dialog
                title="添加留言"
                :visible.sync="remarksVisible"
                width="420px"
                :destroy-on-close="true"
                :before-close="remarksClose"
                :close-on-click-modal="false"
                append-to-body
        >
            <el-form ref="remarksFormBox" :model="remarksForm"
                     :rules="remarksFormRules" label-width="55px" class="record-form">
                <el-form-item label="备注:" prop="remarks">
                    <el-input
                            ref="remarkInput"
                            type="textarea"
                            placeholder="请输入"
                            :autosize="{minRows: 4,maxRows: 10}"
                            v-model="remarksForm.remarks"
                    ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="remarksClose">取 消</el-button>
                <el-button type="primary" @click="handleSureRemarks">确 定</el-button>
            </span>
        </el-dialog>
        <!--查看物流-->
        <el-dialog
                title="物流信息"
                :visible.sync="logisticsVisible"
                width="380px"
                :destroy-on-close="true"
                custom-class="logistics-info-dialog"
                append-to-body
        >
            <div class="logistics-info-box">
                <p>快递公司：{{view_logistics_company_name}}</p>
                <p class="logistics-no">快递单号：{{view_logistics_no}}</p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="logisticsVisible = false">好 的</el-button>
            </span>
        </el-dialog>
        <!-- 修改价格弹出框 -->
        <el-dialog :title="dialogTitle" :visible.sync="priceUpdateVisible" width="380px"
                   :before-close="dialogClose" :destroy-on-close="true" :close-on-click-modal="false">
            <el-form ref="formBox" :model="priceUpdateForm" :rules="priceUpdateFormRules">
                <el-form-item label="现价:" prop="price">
                    <el-input
                        placeholder="请输入金额"
                        :precision="2"
                        autofocus="autofocus"
                        v-model="priceUpdateForm.price"
                    ></el-input>
                </el-form-item>
                <el-form-item label="修改原因:" prop="reason">
                    <el-input
                        placeholder="请输入"
                        v-model="priceUpdateForm.reason"
                    ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogClose">取 消</el-button>
                <el-button type="primary" @click="sureUpdate">确 定</el-button>
            </span>
        </el-dialog>
        <transition name="el-fade-in-linear">
            <BigImg ref="bigImg" :imgUrl="bigImgUrl"></BigImg>
        </transition>
    </div>
</template>

<script>
    import './OrderList.less';
    import { getOrderDetail, getAddRemarks, queryFreightChangeList, queryOrderDetailChangeList, updateFreight, updateOrderDetail } from '../../../../api/orderList';
    import BigImg from '../../../common/big-img/BigImg';
    import EmptyList from '../../../common/empty-list/EmptyList';
    import Adjustment from './AdjustmentModule';
    export default {
        name: 'OrderDetail',
        data() {
            return{
                pageInfo: {
                    name: '',
                    pageIndex: 1,
                    pageSize: 10
                },
                pageTotal: 0, // 总条数
                remarksVisible:false,
                remarksForm:{
                    remarks:''
                },
                remarksFormRules: {
                    remarks: [
                        { required: true, message: '请输入留言', trigger: 'blur' },
                        { max: 255, message: '最多可输入255个字符', trigger: 'blur' }
                    ]
                },
                order_info:{},
                bigImgUrl:'',  // 需要放大图片url
                imgBaseUrl:'',
                order_list:[],
                logisticsVisible:false,
                view_logistics_company_name:'',
                view_logistics_no:'',
                goodsData:[],
                goodsPageInfo: {
                    pageIndex: 1,
                    pageSize: 2
                },
                product_unit:'',
                need_num:0,
                priceUpdateVisible: false, // 价格
                dialogTitle:'修改价格',
                priceUpdateForm:{
                    price:'',
                    reason:''
                },
                priceUpdateFormRules: {
                    price: [
                        { required: true, message: '请输入金额', trigger: 'blur' },
                        { pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/, message: '请输入正确格式,可保留两位小数' }
                    ],
                    reason: [
                        { required: true, message: '请输入修改原因', trigger: 'blur' },
                        { max: 100, message: '最多可输入100个字符', trigger: 'blur' }
                    ]
                },
                priceUpdateData: [
                    {change_price: 1000,user_name:'操作人1',reason_name:'哈哈哈',updated_time:'2020-11-12 10:26:53'},
                    {change_price: -2000,user_name:'操作人1',reason_name:'哈哈哈',updated_time:'2020-11-12 10:26:53'},
                    {change_price: 3000,user_name:'操作人1',reason_name:'哈哈哈',updated_time:'2020-11-12 10:26:53'}
                ],
                FreightUpdateList:[], // 运费更改列表
                loadingTip:{},
            }
        },
        components: {
            BigImg,
            EmptyList,
            Adjustment
        },
        computed: {
            //  拼接图片地址
            getImg: function () {
                return (data) => {
                    if(data){
                        if(data.indexOf('http') === -1){
                            return this.imgBaseUrl + data + '!/fw/' + 80;
                        }else {
                            return data + '!/fw/' + 80;
                        }
                    }
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
                        return '交易成功'
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
            back_is_split:function() {
                return (data) =>{
                    let is_split = false;
                    let _arr = [];
                    if(data.detail){
                        data.detail.forEach((ev)=>{
                            if(ev.logistics_unique && _arr.indexOf(ev.logistics_unique) === -1){
                                _arr.push(ev.logistics_unique);
                            }
                        })
                        if(_arr.length > 1){
                            is_split = true;
                        }else {
                            is_split = false;
                        }
                    }
                    return is_split
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
            this.imgBaseUrl = localStorage.getItem('sys_upyun_source_url');
        },
        mounted() {
            this.getOrderInfo();
        },
        methods:{
            // 请求 - 详情信息
            getOrderInfo(){
                const params = {
                    id: Number(this.$route.query.order_id),
                    order_no:''
                }
                const rLoading = this.openLoading();
                // this.loadingTip = this.uploadLoading('加载中');
                getOrderDetail(params)
                    .then((res) => {
                        rLoading.close();
                        if (res.code === 200) {
                            this.getFreightUpdateList(); // 请求运费修改列表
                            if (res.data) {
                                this.order_info = res.data;
                            } else {
                                this.order_info = {};
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

            // 运费修改列表
            getFreightUpdateList(){
                const params = {
                    order_id: Number(this.$route.query.order_id)
                }
                queryFreightChangeList(params)
                    .then((res) => {
                        if (res.code === 200) {
                            this.FreightUpdateList = res.data || [];
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

            // 按钮-添加留言
            handleAddRemarks(){
                if(this.order_info.remark){
                    this.$set(this.remarksForm,'remarks',this.order_info.remark);
                }
                this.remarksVisible = true;
                this.$nextTick(()=>{
                    this.$refs.remarkInput.focus();
                });
            },
            // 确定添加留言
            handleSureRemarks(){
                this.$refs['remarksFormBox'].validate((valid) => {
                    if (valid) {
                        const params = {
                            id: Number(this.$route.query.order_id),
                            order_no:'',
                            remark: this.remarksForm.remarks
                        }
                        const rLoading = this.openLoading();
                        getAddRemarks(params)
                            .then((res) => {
                                rLoading.close();
                                if (res.code === 200) {
                                    this.remarksVisible = false;
                                    this.getOrderInfo();
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
                    }
                })
            },

            // 请求 -添加留言

            // 添加留言弹框关闭
            remarksClose(){
                this.$refs['remarksFormBox'].resetFields();
                this.$refs['remarksFormBox'].clearValidate();
                this.remarksVisible = false;
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
            // 查看物流
            handleViewLogistics(index,row){
                this.view_logistics_company_name = row.logistics_company_name;
                this.view_logistics_no = row.logistics_no;
                this.logisticsVisible = true;
            },

            // 发起退款 -手动调整弹出框
            handleRefund(index, row){
            },

            // 全部退款
            handleRefundAll(){},

            // 确定修改
            sureUpdate(){
                this.$refs['formBox'].validate(valid => {
                    if (valid) {
                        const params = {
                            now_price: this.priceUpdateForm.price,
                            reason: this.priceUpdateForm.reason_name
                        };
                        if (this.dialogTitle === '修改运费') {
                            params['order_id'] = Number(this.$route.query.order_id);
                            const rLoading = this.openLoading();
                            updateFreight(params)
                                .then((res) => {
                                    rLoading.close();
                                    if (res.code === 200) {
                                        this.$notify({
                                            title: '运费修改成功',
                                            message: '',
                                            type: 'success',
                                            duration: 3000
                                        });
                                        this.dialogClose();
                                        this.getOrderInfo();
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
                        } else {

                        }
                    } else {
                        return false;
                    }
                });
            },

            // 修改订单价格
            handleUpdatePrice(){
                this.dialogTitle = '修改订单价格';
                this.priceUpdateVisible = true;
            },

            // 弹框关闭前操作
            dialogClose(){
                this.$refs['formBox'].clearValidate();
                this.$refs['formBox'].resetFields();
                this.priceUpdateVisible = false;
            },

            // 修改运费
            updateShipping(){
                this.dialogTitle = '修改运费';
                this.priceUpdateVisible = true;
            },

        }
    };
</script>
<style>
.update-list-popover,.logistics-update-list-popover{
    padding: 0!important;
}
.update-list-popover{
    transform: translateX(8px);
}
.update-list-popover .popover-title, .logistics-update-list-popover .popover-title{
    width: 100%;
    height: 32px;
    line-height: 32px;
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
    padding-left: 8px;
    border-bottom: 1px solid rgba(0,0,0,.06);
}
</style>

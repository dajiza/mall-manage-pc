<template>
    <div class="order-sent-detail-container">
        <div class="container-courier-information">
            <div class="no-company">
                <span class="courier-no">快递单号：{{order_info.logistics_no}}</span>
                <span class="courier-company">快递公司：{{order_info.logistics_company_name}}</span>
            </div>
            <div class="logistics_info clearfix">
                <div class="logistics_item courier-name"><span class="courier-title">收件人：</span> {{order_info.logistics_name}}</div>
                <div class="logistics_item courier-tel"><span class="courier-title">收货人手机号：</span>{{order_info.logistics_phone}}</div>
                <div class="logistics_item courier-time"><span class="courier-title">打单时间：</span>{{order_info.logistics_time}}</div>
                <div class="logistics_item courier-time">
                    <span class="courier-title">收货地址：</span>
                    <span>{{order_info.logistics_province}}{{order_info.logistics_city}}{{order_info.logistics_area}}{{order_info.logistics_address}}</span>
                </div>
            </div>
            <el-button class="print-express" type="success" v-hasPermission="'print-courier'" @click="handlePrint(order_info)">打印快递单</el-button>
        </div>
        <div class="container m-t-16 order-info-container">
            <div class="line"></div>
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>订单详情</span>
                </div>
            </div>
            <div class="order-info-list" v-for="(item ,index) in order_list">
                <div class="order-item-base clearfix">
                    <p>订单号：{{item.order_no}}</p>
                    <p>订单ID：{{item.id}}</p>
                    <p>购买数量：{{buyNum(item.detail)}}</p>
                    <p>购买渠道：{{item.channel_name}}</p>
                    <p>支付时间：{{item.paid_time}}</p>
                </div>
                <div class="order-item-table table-has-img">
                    <el-table
                            :data="item.detail"
                            ref="multipleTable"
                    >
                        <el-table-column label="产品图片" width="130">
                            <template slot-scope="scope">
                                <img class="product-img" :src="getImg(scope.row.product_img)" alt="" @click="viewBigImg(scope.row.product_img)">
                            </template>
                        </el-table-column>
                        <el-table-column prop="product_name" label="产品名称" width="200"></el-table-column>
                        <el-table-column prop="product_code" label="产品编码" width="176"></el-table-column>
                        <el-table-column prop="goods_name" label="商品名称" width="200"></el-table-column>
                        <el-table-column label="规格" width="160">
                            <template slot-scope="scope">
                                <p v-for="(item,i) in back_goods_attr(scope.row.goods_attr)">{{item['Title']}}：{{item['Value']}}</p>
                            </template>
                        </el-table-column>
                        <el-table-column prop="price" label="单价(元)">
                            <template slot-scope="scope">
                                <span>{{(scope.row.price)/100 | rounding}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="price_real" label="商品实付(元)" width="110">
                            <template slot-scope="scope">
                                <span>{{(scope.row.price_real)/100 | rounding}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="num" label="数量"></el-table-column>
                        <el-table-column prop="product_unit" label="单位"></el-table-column>
                        <el-table-column label="合计">
                            <template slot-scope="scope">
                                <span>{{scope.row.num}}{{scope.row.product_unit}}</span>
                            </template>
                        </el-table-column>
                        <template slot="empty">
                            <EmptyList></EmptyList>
                        </template>
                    </el-table>
                </div>
                <ul class="leaving-message">
                    <li>
                        <span>用户留言：</span>
                        <span>{{item.message}}</span>
                    </li>
                    <li>
                        <span>后台留言：</span>
                        <span>{{item.remark}}</span>
                    </li>
                </ul>
                <ul class="good-info">
                    <li>
                        <span>商品数量:</span>
                        <span>{{buyNum(item.detail)}}</span>
                    </li>
                    <li>
                        <span>货物种类:</span>
                        <span>{{item.detail.length}}</span>
                    </li>
                </ul>
            </div>

        </div>
        <div class="container m-t-16 logistics-info-container">
            <div class="line"></div>
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>物流信息</span>
                </div>
            </div>
            <div class="logistics-timeline-box" id="logisticsTimelineBox">
                <el-timeline>
                    <el-timeline-item
                            v-for="(activity, index) in activities"
                            :key="index"
                            :icon="activity.icon"
                            :type="activity.type"
                            :color="activity.color"
                            :size="activity.size"
                            :timestamp="activity.timestamp">
                        {{activity.content}}
                    </el-timeline-item>
                </el-timeline>
            </div>
        </div>
        <transition name="el-fade-in-linear">
            <BigImg ref="bigImg" :imgUrl="bigImgUrl"></BigImg>
        </transition>
        <transition name="el-fade-in-linear">
            <div class="mask-wrap" v-if="showPrint" @click="closePrint()">
                <PrintExpress :expressInfo="expressInfo"></PrintExpress>
            </div>
        </transition>
    </div>
</template>

<script>
    import './OrderSent.less';
    import { getSentOrderDetail } from '../../../../api/orderList';
    import { getLogisticsInfo } from '../../../../api/logistics';
    import BigImg from '../../../common/big-img/BigImg';
    import EmptyList from '../../../common/empty-list/EmptyList';
    import PrintExpress from '../../../common/print-express/PrintExpress';
    import { getConfigList } from '../../../../api/paramsConfig';
    export default {
        name: 'OrderSentDetail',
        data() {
            return{
                pageInfo: {
                    name: '',
                    pageIndex: 1,
                    pageSize: 10
                },
                pageTotal: 0, // 总条数
                remarksVisible:false,
                order_info:{},
                bigImgUrl:'',  // 需要放大图片url
                imgBaseUrl:'',
                order_list:[],
                activities:[],
                showPrint:false,
                expressInfo:{}
            }
        },
        components: {
            BigImg,
            EmptyList,
            PrintExpress
        },
        watch: {
            activities() {
                this.$nextTick(()=>{
                    const container = this.$el.querySelector("#logisticsTimelineBox");
                    container.scrollTop = container.scrollHeight;
                })
            }
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
            buyNum: function(){
                return (data) => {
                    let num = 0;
                    data.forEach((ev)=>{
                        num = num + ev.num
                    })
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
        created() {
            this.imgBaseUrl = localStorage.getItem('sys_upyun_source_url');
            this.order_list = [];
        },
        mounted() {
            this.getOrderInfo();
            this.getLogisticsDetail();
        },
        methods:{
            // 请求 - 详情信息
            getOrderInfo(){
                const params = {
                    id: Number(this.$route.query.order_id)
                }
                const rLoading = this.openLoading();
                getSentOrderDetail(params)
                    .then((res) => {
                        rLoading.close();
                        if (res.code === 200) {
                            if (res.data) {
                                this.order_info = res.data;
                                if(res.data.orders){
                                    this.order_list = res.data.orders;
                                }else {
                                    this.order_list = [];
                                }
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

            // 请求 - 物流信息
            getLogisticsDetail(){
                const params = {
                    sand_operate_id: Number(this.$route.query.order_id)
                }
                const rLoading = this.openLoading();
                this.activities = [];
                getLogisticsInfo(params)
                    .then((res) => {
                        rLoading.close();
                        if (res.code === 200) {
                            if (res.data.lists) {
                                let logisticss_list = res.data.lists;
                                let new_arr = logisticss_list.reverse();
                                new_arr.forEach((ev,index)=>{
                                    let params = {
                                        content: ev.message,
                                        timestamp: this.formatDate(ev.time)
                                    }
                                    if(index === logisticss_list.length -1){
                                        params['color'] = '#FAAD14'
                                    }
                                    this.activities.push(params);
                                })
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

            // 请求 - 获取配置列表
            getConfigListData(){
                const rLoading = this.openLoading();
                let params = {};
                getConfigList(params).then((res) => {
                    rLoading.close();
                    if(res.code === 200){
                        if(res.data){
                            res.data.forEach((ev)=>{
                                if(ev.config_key === 'sys_sender_address'){
                                    localStorage.setItem('sys_sender_address', ev.value);
                                    this.showPrint = true;
                                }
                            })
                            this.showPrint = true;
                        }else {

                        }
                    }else {
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }

                }).catch(() => {});
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
            // 打印快递单
            handlePrint(info){
                this.expressInfo = info;
                // this.showPrint = true;
                this.getConfigListData();
            },
            // 关闭打印
            closePrint(){
                this.showPrint = false;
            },
            // 分页导航
            // handlePageChange(val) {
            //     this.$set(this.pageInfo, 'pageIndex', val);
            //     this.getOrderInfo();
            // },
            formatDate(val) {
                if(val){
                    let dt;
                    if(val.length > 10){
                        dt = new Date(Number(val ));
                    }else {
                        dt = new Date(Number(val) * 1000);
                    }
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
                }
            }
        }
    };
</script>

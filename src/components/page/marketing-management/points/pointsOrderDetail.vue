<template>
    <div class="order-detail-container">
        <div class="container-box container-order-status">当前订单状态：{{is_send?'已发货':'未发货'}}</div>
        <!--收货信息-->
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
                        <p class="label">收货人姓名：</p>
                        <p class="info-value">{{logistics_info.logisticsName}}</p>
                    </div>
                    <div class="info-content-item">
                        <p class="label">用户手机号：</p>
                        <p class="info-value">{{logistics_info.logisticsPhone}}</p>
                    </div>
                    <div class="info-content-item" style="width: unset">
                        <p class="label">收货地址：</p>
                        <p class="info-value">{{logistics_info.logisticsProvince}}{{logistics_info.logisticsCity}}{{logistics_info.logisticsArea}}{{logistics_info.logisticsAddress}}</p>
                    </div>
                    <div class="info-content-item">
                        <p class="label">客户微信名：</p>
                        <p class="info-value">{{logistics_info.nickName}}</p>
                    </div>
                    <div class="info-content-item">
                        <p class="label">订单号：</p>
                        <p class="info-value">{{logistics_info.logisticsNo}}</p>
                    </div>
                    <div class="info-content-item">
                        <p class="label">兑换时间：</p>
                        <p class="info-value">{{ $moment(logistics_info.redeemTime).format('YYYY-MM-DD HH:mm:ss') }}</p>
                    </div>
                    <div class="info-content-item">
                        <p class="label">用户ID：</p>
                        <p class="info-value">{{logistics_info.userId}}</p>
                    </div>
                    <div class="info-content-item">
                        <p class="label">店铺名称：</p>
                        <p class="info-value">{{shopName}}</p>
                    </div>
                </div>
            </div>
        </div>
        <!--订单信息-->
        <div class="container container-box m-t-16 order-info-container" style="padding: 0 0 30px">
            <div class="info-title">
                <div class="global-table-title">
                    <div class="title">
                        <i></i>
                        <span>订单信息</span>
                    </div>
                </div>
            </div>
            <el-table
                    :data="orderList"
                    ref="multipleTable"
                    class="order-detail-info"
            >
                <el-table-column label="图片" width="140">
                    <template slot-scope="scope">
                        <img class="product-img" :src="getImg(scope.row.img)" alt="" @click="viewBigImg(scope.row.img, scope.$index)">
                    </template>
                </el-table-column>
                <el-table-column label="商品名称" prop="title"></el-table-column>
                <el-table-column label="积分" prop="points" width="120"></el-table-column>
                <el-table-column label="数量" prop="num" width="120"></el-table-column>
                <el-table-column label="积分总额" prop="title" width="120">
                    <template slot-scope="scope">{{scope.row.num * scope.row.points}}</template>
                </el-table-column>
                <template slot="empty">
                    <EmptyList></EmptyList>
                </template>
            </el-table>
        </div>
        <!--物流信息-->
        <div class="container-box m-t-16 p-t-0" v-if="is_send">
            <div class="info-title">
                <div class="global-table-title">
                    <div class="title">
                        <i></i>
                        <span>物流信息</span>
                    </div>
                    <el-button type="primary" @click="updateLogisticsInfo">修改</el-button>
                </div>
            </div>
            <div class="info-content">
                <div class="info-content-box">
                    <div class="info-content-item">
                        <p class="label">快递公司：</p>
                        <p class="info-value">{{logistics_company_name}}</p>
                    </div>
                    <div class="info-content-item">
                        <p class="label">快递单号：</p>
                        <p class="info-value">{{logistics_no}}</p>
                    </div>
                </div>
            </div>
        </div>
        <!--物流详情-->
        <div class="container-box m-t-16 logistics-info-container" v-if="is_send && activities.length > 0">
            <div class="info-title">
                <div class="global-table-title">
                    <div class="title">
                        <i></i>
                        <span>物流详情</span>
                    </div>
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

        <!--发货按钮-->
        <div class="btn-send-wrap" v-if="!is_send">
            <el-button style="width: 80px;height: 44px" type="primary" @click="handleOnSend">发货</el-button>
        </div>

        <!--修改物流-->
        <el-dialog
                :title="logisticsTitle"
                :visible.sync="updateLogisticsVisible"
                width="360px"
                :destroy-on-close="true"
                :close-on-click-modal="false"
                custom-class="logistics-info-dialog"
                :before-close="updateDialogClose"
                append-to-body
        >
            <el-form ref="updateForm" :rules="updateFormRules" :model="updateForm" :inline="true" size="small" label-position="left" label-width="82px">

                <el-form-item label="物流公司" prop="logistics_company_id">
                    <el-select style="width: 210px" class="dialog-item" v-model="updateForm.logistics_company_id" placeholder="请选择" filterable>
                        <el-option v-for="item in logisticsCompanyList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="物流单号" prop="logistics_no">
                    <el-input style="width: 210px" class="dialog-item" placeholder="请输入" v-model="updateForm.logistics_no"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button class="auto-send" type="primary" v-if="!is_send" v-hasPermission="'mall-backend-points-order-logistics-auto'" @click="handleOnAuto">自动</el-button>
                <el-button style="margin-left: auto" @click="updateDialogClose">取 消</el-button>
                <el-button type="primary" @click="sureUpdateLogistics">确 定</el-button>
            </span>
        </el-dialog>

        <!--选择物流公司 自动-->
        <el-dialog
                title="选择物流公司"
                :visible.sync="autoShipVisible"
                width="560px"
                :destroy-on-close="true"
                :close-on-click-modal="false"
                custom-class="logistics-info-dialog"
                append-to-body
        >
            <el-form ref="autoForm" :rules="autoFormRules" :model="autoForm" :inline="true" size="small" label-position="top">
                <el-form-item label="物流公司：" prop="logistics_company_id" style="margin-right: 20px">
                    <el-select style="width: 240px;" class="dialog-item" v-model="autoForm.logistics_company_id" placeholder="请选择" filterable>
                        <el-option v-for="item in logisticsCompanyList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="店铺：">
                    <el-input disabled style="width: 240px" class="dialog-item" placeholder="请输入" v-model="shopName"></el-input>
                </el-form-item>
                <el-form-item label="姓名：" prop="name" style="margin-right: 20px">
                    <el-input style="width: 240px" class="dialog-item" placeholder="请输入" v-model="autoForm.name"></el-input>
                </el-form-item>
                <el-form-item label="手机号：" prop="phone">
                    <el-input style="width: 240px" class="dialog-item" placeholder="请输入" v-model="autoForm.phone"></el-input>
                </el-form-item>
                <el-form-item label="收货地址：" prop="shipAddress">
                    <el-input style="width: 500px" class="dialog-item" placeholder="请输入" v-model="autoForm.shipAddress"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" style="margin-left: auto" @click="handleOnPreview">发 货</el-button>
            </span>
        </el-dialog>

        <!--大图预览-->
        <el-image-viewer v-if="imgDialogVisible" :on-close="closeViewer" :url-list="imgSrcList" :initial-index="previewIndex"/>

        <!--预览快递单-->
        <transition name="el-fade-in-linear">
            <div class="mask-wrap" v-if="showPrint" @click="closePrint()">
                <PrintExpress :expressInfo="expressInfo"></PrintExpress>
            </div>
        </transition>
    </div>
</template>

<script>
    import './pointsOrderDetail.less';
    import { queryConfigList } from '@/api/configManagement'
    import { queryOrderDetail, updateLogistics, queryLogisticsAuto, queryLogisticsDetail } from '@/api/points'
    import { querySDList } from '@/api/afterSale'
    import ElImageViewer from '@/components/common/image-viewer';
    import EmptyList from '../../../common/empty-list/EmptyList';
    import PrintExpress from '../../../common/print-express/PrintExpress';
    import commUtil from '../../../../utils/commUtil';
    import { REFUND_STATUS } from '@/plugin/constant'
    export default {
        name: 'pointsOrderDetail',
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
            return{
                REFUND_STATUS,
                logistics_info:{},
                orderList: [],
                imgBaseUrl:'',
                updateLogisticsVisible:false,

                logistics_company_id: -1,
                logistics_company_name:'',
                logistics_no:'',

                previewIndex: 0,
                imgSrcList:[],
                imgDialogVisible: false,
                is_send: false, // false 未发货 true 已发货
                shopId: 0,
                shopName: '',
                activities: [],
                logistics_list:[],
                updateForm: {
                    logistics_company_id: '',
                    logistics_no: ''
                },
                updateFormRules:{
                    logistics_company_id: [
                        { required: true, message: '请选择物流公司', trigger: 'blur' }
                    ],
                    logistics_no: [
                        { required: true, message: '请输入物流单号', trigger: 'blur' },
                        // { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
                    ]
                },
                autoForm: {
                    logistics_company_id: '',
                    name: '',
                    phone: '',
                    shipAddress: ''
                },
                autoFormRules: {
                    logistics_company_id: [
                        { required: true, message: '请选择物流公司', trigger: 'blur' }
                    ],
                    name: [
                        { required: true, message: '请输入姓名', trigger: 'blur' }
                    ],
                    phone: [
                        { required: true, message: '请输入手机号', trigger: 'blur' },
                        {
                            validator: checkMobile,
                            trigger: 'blur'
                        }
                    ],
                    shipAddress: [
                        { required: true, message: '请输入收货地址', trigger: 'blur' }
                    ],
                },
                logisticsCompanyList: [],
                addressInfo:{},
                logisticsTitle: '填写物流',
                autoShipVisible: false, // 自动发货 弹窗
                showPrint: false,
                expressInfo: {}
            }
        },
        components: {
            ElImageViewer,
            EmptyList,
            PrintExpress
        },
        watch: {
            activities() {
                this.$nextTick(()=>{
                    const container = this.$el.querySelector("#logisticsTimelineBox");
                    if(this.is_send && container){
                        container.scrollTop = container.scrollHeight;
                    }
                })
            }
        },
        computed: {
            //  拼接图片地址
            getImg: function () {
                return (data) => {
                    if(data){
                        return data + '!/fw/' + 80;
                    }
                }
            }
        },
        created() {
            this.getConfig() // 获取仓库地址
            this.getSDList() // 快递公司列表
            this.imgBaseUrl = localStorage.getItem('sys_upyun_source_url');
            this.shopId = Number(this.$route.query.shopId)
            this.shopName = this.$route.query.shopName
            this.logistics_no = this.$route.query.logisticsNo || ''
            console.log('logistics_no', this.logistics_no)
        },
        mounted() {
            this.getOrderInfo();
        },
        methods:{
            // 快递公司列表
            getSDList() {
                querySDList()
                    .then(res => {
                        this.logisticsCompanyList = res.data
                    })
                    .catch(err => {})
            },
            // 请求 - 获取配置 仓库地址
            getConfig(){
                queryConfigList({})
                    .then((res) => {
                        if (res.code === 200) {
                            if (res.data){
                                res.data.forEach((ev)=>{
                                    // 仓库地址
                                    if (ev.config_key === 'SYS_RECEIVER_ADDRESS'){
                                        // 金额允许修改的最大百分比
                                        localStorage.setItem('sys_sender_address', ev.value)
                                        this.addressInfo  = JSON.parse(ev.value)
                                        console.log('this.addressInfo', this.addressInfo)
                                    }
                                })
                            }
                        } else {
                            this.queryAPIError(res.msg)
                        }
                    })
                    .catch(() => {});
            },
            // 请求 - 详情信息
            getOrderInfo(){
                const params = {
                    uniqueNo: this.$route.query.uniqueNo,// 合单编号
                    isSend: this.$route.query.isSend > 0 , // 已发货true 未发货false
                    logisticsNo: this.$route.query.logisticsNo || '', // 快递单号 true 状态下 必填 logisticsNo
                    companyId: Number(this.$route.query.logisticsCompanyId) || '' // 物流公司id true 状态下 必填 logisticsCompanyId
                }
                const rLoading = this.openLoading();
                queryOrderDetail(params)
                    .then((res) => {
                        rLoading.close();
                        if (res.code === 200) {
                            if (res.data) {
                                this.orderList = res.data || [];
                                if(res.data && res.data.length > 0){
                                    const i = res.data.length -1
                                    this.logistics_info = res.data[i]
                                    this.logistics_company_name = this.logistics_info.logisticsCompanyName
                                    this.logistics_company_id = Number(this.logistics_info.logisticsCompanyId)
                                    if(this.logistics_info.logisticsNo){
                                        this.logistics_no = this.logistics_info.logisticsNo
                                    }
                                    this.imgSrcList = res.data.map(item =>{return item.img})
                                    console.log('imgSrcList', this.imgSrcList)
                                    console.log('logistics_company_id', this.logistics_company_id)
                                    console.log('logistics_no', this.logistics_no)
                                    if(this.logistics_info.sandTime) {
                                        this.is_send = true
                                        this.getSdInfo() // 请求 物流详情
                                    }
                                }
                            } else {
                                this.logistics_info = {};
                                this.orderList = []
                            }
                        } else {
                            this.queryAPIError(res.msg)
                        }
                    })
                    .catch(() => {
                        rLoading.close();
                    });
            },

            // 查看大图
            viewBigImg(pic_url, index){
                console.log('pic_url', pic_url)
                if (pic_url) {
                    this.previewIndex = index;
                    this.imgDialogVisible = true;
                }
            },

            // 关闭大图
            closeViewer() {
                this.imgDialogVisible = false;
            },

            // 发货
            handleOnSend() {
                // this.expressInfo = {
                //     logistics_no: 12345678,
                //     logistics_order_bulkpen: 33334444,
                //     logistics_name: 'fzf',
                //     logistics_phone: 18142044813,
                //     logistics_province: '浙江省',
                //     logistics_city: '宁波市',
                //     logistics_area: '江北区',
                //     logistics_address: '万达公寓',
                // };
                // this.showPrint = true
                // return
                this.logisticsTitle = '填写物流'
                this.updateLogisticsVisible = true;
            },

            // 自动
            handleOnAuto() {
                console.log('自动')
                this.autoForm.logistics_company_id = ''
                this.autoForm.name = this.logistics_info.logisticsName
                this.autoForm.phone = this.logistics_info.logisticsPhone
                this.autoForm.shipAddress = this.logistics_info.logisticsProvince + this.logistics_info.logisticsCity + this.logistics_info.logisticsArea + this.logistics_info.logisticsAddress
                this.autoShipVisible = true;
                this.updateLogisticsVisible = false
            },

            // 发货
            handleOnPreview() {
                this.$refs['autoForm'].validate((valid) => {
                    if (valid) {
                        let logistics_company_name = ''
                        this.logisticsCompanyList.forEach((ev)=>{
                            if(ev.id == this.autoForm.logistics_company_id){
                                logistics_company_name = ev.name
                            }
                        })
                        let province_txt = '',
                            city_txt = '',
                            area_txt = '',
                            address_txt = ''
                        if(this.autoForm.shipAddress) {
                            const old_address = this.logistics_info.logisticsProvince + this.logistics_info.logisticsCity + this.logistics_info.logisticsArea + this.logistics_info.logisticsAddress
                            if (this.autoForm.shipAddress == old_address) {
                                province_txt = this.logistics_info.logisticsProvince
                                city_txt = this.logistics_info.logisticsCity
                                area_txt = this.logistics_info.logisticsArea
                                address_txt = this.logistics_info.logisticsAddress
                            } else {
                                let txt = this.autoForm.shipAddress
                                if (txt.indexOf('省') > -1) {
                                    province_txt = txt.split('省')[0] + '省'
                                    const _len = province_txt.length
                                    txt = txt.substring(_len)
                                }
                                if (txt.indexOf('市') > -1) {
                                    city_txt = txt.split('市')[0] + '市'
                                    const _len = city_txt.length
                                    txt = txt.substring(_len)
                                }

                                if (txt.indexOf('区') > -1) {
                                    area_txt = txt.split('区')[0] + '区'
                                    const _len = area_txt.length
                                    txt = txt.substring(_len)
                                }
                                address_txt = txt
                            }

                        }
                        const params = {
                            logisticsUnique: this.$route.query.uniqueNo,
                            companyId: this.autoForm.logistics_company_id, // 物流公司id
                            companyName: logistics_company_name, // 物流名称
                            shopId: this.shopId,
                            phone: this.autoForm.phone,
                            name: this.autoForm.name,
                            province: province_txt,
                            city: city_txt,
                            area: area_txt,
                            address: address_txt
                        }
                        console.log('params', params)
                        const rLoading = this.openLoading();
                        queryLogisticsAuto(params)
                            .then((res) => {
                                rLoading.close();
                                if (res.code === 200) {
                                    this.logistics_no = res.data.orderNum
                                    this.logistics_company_name = logistics_company_name
                                    this.is_send = true
                                    this.logistics_company_id = this.autoForm.logistics_company_id
                                    this.logistics_company_name = logistics_company_name
                                    this.autoShipVisible = false;

                                    // 打开快递单
                                    console.log('res=======533', res)
                                    this.expressInfo = {
                                        logistics_no: res.data.orderNum,
                                        logistics_order_bulkpen: res.data.orderBulkpen,
                                        logistics_name: params.name,
                                        logistics_phone: params.phone,
                                        logistics_province: params.province,
                                        logistics_city: params.city,
                                        logistics_area: params.area,
                                        logistics_address: params.address
                                    };
                                    console.log('this.expressInfo', this.expressInfo)
                                    this.showPrint = true
                                    // 请求新的物流详情
                                    // this.getSdInfo()
                                } else {
                                    this.queryAPIError(res.msg)
                                }
                            })
                            .catch(() => {
                                rLoading.close();
                            });
                    }
                })
            },

            // 关闭打印
            closePrint(){
                this.showPrint = false;
            },

            // 修改物流信息
            updateLogisticsInfo(index,row){
                this.logisticsTitle = '修改物流'
                this.updateForm.logistics_no = this.logistics_no
                this.logisticsCompanyList.forEach((ev)=>{
                    if(ev.name == this.logistics_company_name){
                        this.updateForm.logistics_company_id = ev.id
                    }
                })
                this.updateLogisticsVisible = true;
            },

            // 确定修改物流信息
            sureUpdateLogistics() {
                this.$refs['updateForm'].validate((valid) => {
                    if (valid) {
                        let logistics_company_name = ''
                        this.logisticsCompanyList.forEach((ev)=>{
                            if(ev.id == this.updateForm.logistics_company_id){
                                logistics_company_name = ev.name
                            }
                        })
                        // 请求 接口
                        const params = {
                            uniqueNo: this.$route.query.uniqueNo,
                            LogisticsCompanyId: this.updateForm.logistics_company_id, // 物流公司id
                            logisticsNo: this.updateForm.logistics_no, // 快递单号
                            logisticsCompanyName: logistics_company_name // 物流名称
                        }
                        const rLoading = this.openLoading();
                        updateLogistics(params)
                            .then((res) => {
                                rLoading.close();
                                if (res.code === 200) {
                                    this.logistics_no = this.updateForm.logistics_no
                                    this.logistics_company_name = logistics_company_name
                                    this.logistics_company_id = params.LogisticsCompanyId
                                    this.is_send = true
                                    this.updateLogisticsVisible = false
                                    // 请求新的物流详情
                                    // this.getSdInfo()
                                } else {
                                    this.queryAPIError(res.msg)
                                }
                            })
                            .catch(() => {
                                rLoading.close();
                            });
                    }
                })
            },

            // 请求 - 物流详情信息
            getSdInfo(){
                console.log('logistics_company_id', this.logistics_company_id)
                console.log('logistics_no', this.logistics_no)
                const params = {
                    companyId: this.logistics_company_id,//快递公司id
                    logisticsNo: this.logistics_no  // 快递单号
                }
                let _this = this;
                const rLoading = this.openLoading();
                this.activities = [];
                queryLogisticsDetail(params)
                    .then((res) => {
                        rLoading.close();
                        if (res.code === 200) {
                            if (res.data) {
                                let logisticss_list = res.data || [];
                                let new_arr = logisticss_list.reverse();
                                new_arr.forEach((ev,index)=>{
                                    let obj = {
                                        content: ev.message,
                                        timestamp: _this.formatDate(ev.time)
                                    }
                                    if(index === logisticss_list.length -1){
                                        obj['color'] = '#FAAD14'
                                    }
                                    _this.activities.push(obj);
                                })

                            }
                        } else {
                            _this.queryAPIError(res.msg)
                        }
                    })
                    .catch(() => {});
            },

            // 弹框关闭前操作
            updateDialogClose(){
                console.log('弹框关闭前操作')
                this.$refs['updateForm'].clearValidate();
                this.$refs['updateForm'].resetFields();
                this.updateLogisticsVisible = false;
            },

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
            },

            queryAPIError(msg) {
                this.$notify({ title: msg, message: '', type: 'error', duration: 5000 });
            },
        }
    };
</script>
<style lang="less">
    .logistics-timeline-box{
        height: 350px;
        overflow-y: scroll;
        padding: 30px 50px 10px 240px;
        box-sizing: border-box;
        -webkit-box-sizing: border-box;
        //background: #ccc;
        .el-timeline-item__timestamp.is-bottom{
            position: absolute;
            left: -168px;
            top: 0;
            font-size: 14px;
            height: 20px;
            line-height: 20px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #000000;
            margin-top: 0 !important;
            //line-height: 36px;
        }

        /deep/.el-timeline {
            padding-left: 220px;
            padding-top: 10px;
            height: 100%;
            box-sizing: border-box;
            -webkit-box-sizing: border-box;
        }
        .el-timeline-item__icon{
            font-size: 10px;
            color: #D8D8D8;
        }
        .el-timeline-item__node--normal{
            width: 10px;
            height: 10px;
            background: #D8D8D8;
            left: 0;
        }
        .el-timeline-item__wrapper{
            padding-left: 62px;
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #000000;
            //line-height: 36px;
        }
        .el-timeline{
            .el-timeline-item:nth-last-child(2) {
                .el-timeline-item__tail{
                    border-left: 2px solid #FAAD14;
                }
            }
        }
    }
    .btn-send-wrap{
        width: 100%;
        padding: 30px 0;
        text-align: center;
    }
    .dialog-footer{
        display: flex;
        align-items: center;
    }
    .auto-send{
        width: 44px;
        height: 24px;
        background: #1890FF;
        border-radius: 2px;
        text-align: center;
        line-height: 22px;
        font-size: 14px;
        font-weight: 400;
        color: #FFFFFF;
        display: inline-block;
        margin-right: auto;
        padding: 0 !important;
    }
    .el-form--label-top .el-form-item__label{
        padding: 0 !important;
    }
    .mask-wrap{
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        overflow: auto;
        margin: 0;
        z-index: 2005;
        background: rgba(0, 0, 0, 0.15);
    }
</style>
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
    .update-price-form .el-input{
        width: 300px;
    }
</style>

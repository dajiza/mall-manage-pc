<template>
    <div class="operation-product-page">
        <div class="product-content">
            <div class="global-table-title border-bottom">
                <div class="title">
                    <i></i>
                    <span>{{productName}}</span>
                </div>
            </div>
            <el-form
                    ref="operationForm"
                    :model="operationForm"
                    :rules="roleRules"
                    class="product-form"
            >
                <el-form-item style="width:300px">
                    <el-upload
                            class="avatar-uploader"
                            :class="{'has-pic':imageUrl}"
                            :action="uploadImgUrl"
                            :on-success="handleAvatarSuccess"
                            :on-error="uploadError"
                            :before-upload="beforeAvatarUpload"
                            :on-remove="handleRemove"
                            :show-file-list="false"
                            :headers="header"
                            :disabled="true"
                    >
                        <img
                                v-if="imageUrl"
                                :src="imageUrl"
                                class="avatar"
                        />
                        <div v-else class="avatar-uploader-icon">
                            <img src="../../../../assets/img/Icon-Plus.svg" alt="">
                            <span class="add-img-text">添加图片</span>
                        </div>
                        <div class="magnifier-box" v-if="imageUrl" @click.stop="viewBigImg">
                            <img class="magnifier-img" src="../../../../assets/img/magnifier-icon.png" />
                            <!--<el-image class="small-img"
                                      :src="find_img"
                                      :preview-src-list="imgSrcList">
                            </el-image>-->
                        </div>

                    </el-upload>
                </el-form-item>
                <div>
                    <el-row>
                        <el-col :span="8">
                            <el-form-item label="类型选择:" prop="type" class="select-type">
                                <el-radio-group v-model="operationForm.type"
                                                @change="chooseProductType"
                                                :disabled="true">
                                    <el-radio :label="0">布</el-radio>
                                    <el-radio :label="1">其他</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <div class="product-code">产品编码：{{product_code}}</div>
                </div>

                <div class="global-table-title border-bottom">
                    <div class="title">
                        <i></i>
                        <span>货物信息</span>
                    </div>
                    <el-button type="success" v-hasPermission="'product-detail-add'" @click="handleAddGoods">添加</el-button>
                </div>
                <div class="add-goods-box clearfix" v-for="(item, index) in operationForm.goods" :key="index">
                    <el-form-item class="add-goods-item clearfix" label="货架编码:" label-width="75px"
                                  :prop="'goods.' + index + '.shelf_code'">
                        <el-select v-model="item.shelf_code" placeholder="请选择">
                            <el-option
                                    v-for="state in shelf_list"
                                    :key="state.code"
                                    :value="state.code"
                                    :label="state.code"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item class="add-goods-item clearfix" label="库存:" :prop="'goods.' + index + '.stock_num'"
                                  label-width="45px"
                                  :rules="roleRules.stock_num">
                        <el-input v-model.number="item.stock_num" placeholder="请输入" @mousewheel.native.prevent></el-input>&nbsp;&nbsp;<span>{{unitName}}</span>
                    </el-form-item>
                    <div class="btn-box">
                        <el-button type="danger" @click.prevent="removeSingleGood(item, index)">删除</el-button>
                    </div>
                </div>

                <div class="selectedKeys-module" v-if="multipleSelection.length">
                    <div class="info-icon">
                        <span></span>
                        已选择
                        <span>{{multipleSelection.length}}</span>项
                    </div>
                    <span class="print-all" v-hasPermission="'print-goods-tags'" @click="handlePrintSelectedKeys">打印全部已选</span>
                </div>
                <el-table class="goods-info-table"
                          v-loading="loading"
                          :data="goodsData"
                          ref="multipleTable"
                          tooltip-effect="dark"
                          @selection-change="handleSelectionChange"
                >
                    <el-table-column v-hasPermission="'print-goods-tags'" type="selection" width="55" align="center"></el-table-column>
                    <el-table-column prop="detail_code" label="货物编码" width="176"></el-table-column>
                    <el-table-column prop="shelf_code" label="货架编码"></el-table-column>
                    <el-table-column prop="stock_total" label="总库存"></el-table-column>
                    <el-table-column prop="stock_locked" label="待出库库存"></el-table-column>
                    <el-table-column prop="created_time" label="创建时间" width="186"></el-table-column>
                    <el-table-column label="操作" width="300" align="left">
                        <template slot-scope="scope">
                            <el-button
                                    type="text" v-hasPermission="'product-num-update'"
                                    @click="handleEditStock(scope.$index, scope.row)"
                            >修改库存</el-button>
                            <el-button
                                    type="text" class="operate-record" v-hasPermission="'product-detail-log-list'"
                                    @click="handleOperateRecord(scope.$index, scope.row)"
                            >操作记录</el-button>
                            <el-button v-hasPermission="'print-goods-tags'" type="success" @click="handlePrintLabel(scope.row)">打印标贴</el-button>
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
                            :current-page="goodsPageInfo.pageIndex"
                            :page-size="goodsPageInfo.pageSize"
                            :total="goodsPageInfo.pageTotal"
                            @current-change="handlePageChange"
                    ></el-pagination>
                </div>
            </el-form>
            <div class="operations">
                <el-button type="primary" v-hasPermission="'product-update'" :disabled="saveIsClick" @click="handleSaveGood('operationForm')">保存</el-button>
            </div>
        </div>
        <!--<div class="modal-img" v-show="dialogVisible" :class="{'w640':isBigImgOpen}">
            <img :src="bigImgUrl" alt />
        </div>-->
        <!-- 修改库存弹出框 -->
        <ModificationStock
                v-if="stockModalInfo.visible"
                :stockModalInfo="stockModalInfo"
                @handleCloseStockModal="handleCloseStockModal"
                @handleSureStockModal="handleSureStockModal"
        />
        <!-- 操作记录弹出框 -->
        <OperationRecord
                v-if="recordModalInfo.visible"
                :recordModalInfo="recordModalInfo"
                @handleCloseRecordModal="handleCloseRecordModal"
                @handleSureRecordModal="handleSureRecordModal"
        />
        <!--大图预览-->
        <el-image-viewer
                v-if="dialogVisible"
                :on-close="closeViewer"
                :url-list="imgSrcList" />
        <!---->
        <div v-if="printPageShow" class="print-cargo-label-page" @click.stop="">
            <div id="printMe" ref="print" style="width: 100%;background: #fff;box-sizing: border-box;margin-top: 0">
                <div class="label-box" v-for="(item,i) in cargoLabelInfo" :key="i" style="page-break-after:always;width: 100%;height: 60mm;display: flex;justify-content: center;align-items: center">
                    <div class="label-content" style="width: 36mm;height: 53mm;border-radius: 2px;box-sizing: border-box;display: flex;flex-direction: column" :style="i > 0?'margin-top:3mm':'margin-top:1mm'">
                        <table class="print-table" headerRows='1' style="width: 100% !important;border-color: #000;border-collapse:collapse;font-size: 9px!important;box-sizing: border-box">
                            <tr style="height: 30px;line-height: 14px;box-sizing: border-box;">
                                <th style="width: 40%;border: 1px solid #000;text-align: center;box-sizing: border-box;font-weight: 500!important;font-size: 9px!important;">产品名称</th>
                                <td style="width: 60%;border: 1px solid #000;text-align: left;padding:0 2px;box-sizing: border-box;font-weight: 500!important;font-size: 9px!important;">{{item.product_name}}</td>
                            </tr>
                            <tr style="height: 30px;line-height: 14px;box-sizing: border-box;">
                                <th style="width: 40%;border: 1px solid #000;text-align: center;box-sizing: border-box;font-weight: 500!important;font-size: 9px!important;">货物编码</th>
                                <td style="width: 60%;border: 1px solid #000;text-align: left;padding:0 2px;box-sizing: border-box;font-weight: 500!important;font-size: 9px!important;">{{item.detail_code}}</td>
                            </tr>
                            <tr style="height: 30px;line-height: 14px;box-sizing: border-box;">
                                <th style="width: 40%;border: 1px solid #000;text-align: center;box-sizing: border-box;font-weight: 500!important;font-size: 9px!important;">货架编码</th>
                                <td style="width: 60%;border: 1px solid #000;text-align: left;padding:0 2px;box-sizing: border-box;font-weight: 500!important;font-size: 9px!important;">{{item.shelf_code}}</td>
                            </tr>
                        </table>
                        <div class="QRCode-box" style="width: 36mm;flex: 1;box-sizing: border-box;border: 1px solid #000;border-top: none">
                            <div class="qrcode" style="width: 100%;height: 100%;box-sizing:border-box;padding: 8px 0;display: flex;justify-content: center;align-items: center;" :id="'qrCodeUrl' + item.id" :ref="'qrCodeUrl' + item.id"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
    import './ProductList.less';
    import OperationRecord from '../../../common/operation-record/OperationRecord';
    import ModificationStock from '../../../common/modification-stock/ModificationStock';
    import EmptyList from '../../../common/empty-list/EmptyList';
    import PrintCargoLabel from '../../../common/print-cargo-label/PrintCargoLabel'
    import { pictureProcessing} from '../../../../api/photoDetection';
    import { getToken } from '../../../../utils/auth';
    import { getProductDetailCodeCreate, getShelfCodeCreate } from '../../../../api/createCode';
    import {
        getProductDetail,
        getGoodsList,
        getGoodsCreate
    } from '../../../../api/productList';
    import QRCode from 'qrcodejs2';
    import { getShelfList } from '../../../../api/shelf';
    export default {
        name: 'productView',
        data() {
            var checkNum = (rule, value, callback) => {
                setTimeout(() => {
                    if (!value) {
                        return callback(new Error('请输入大于0的数字值'));
                    }
                    if (!Number.isInteger(value)) {
                        callback(new Error('请输入数字值'));
                    }else {
                        callback();
                    }
                }, 10);

            };
            return {
                productForm: {},
                operationTitle:'',
                roleRules: {
                    stock_num:[{ validator: checkNum, trigger: 'blur' }]
                },
                dialogVisible: false,
                isBigImgOpen: false,
                operationForm: {
                    type: 0,
                    img:'',
                    goods: []
                },
                goodsData: [],   // 货物列表
                loading: false,
                multipleSelection: [],
                stockModalInfo: {
                    visible: false,
                    currentItem: {},
                    unit_name:''
                }, //修改库存信息
                recordModalInfo: {
                    visible: false,
                    currentItem: {},
                }, //操作记录信息
                imageUrl: '',  // 展示小图 （可访问，尺寸限制240）
                completeImageUrl:'',  // 完整图片url（可访问，不加尺寸限制）
                imgBaseUrl:'',    //   图片读取地址（存储）
                uploadImgUrl:'',  //   图片上传地址
                back_img_url:'',  //   上传后台返回图片地址（不完整）
                header:{},
                token:'',
                uploadingTip:null,
                bigImgUrl:'',
                bigImgShow: false,
                add_goods:[],
                goodsPageInfo: {
                    pageIndex: 1,
                    pageSize: 10,
                    pageTotal: 0
                }, //
                product_code:'', // 产品编码
                shelfCode:'',   // 货架编码
                unitName:'',    // 单位名称
                productName:'',  // 产品名称
                cargoLabelInfo:[],
                printPageShow:false,
                shelf_list:[],
                saveIsClick:false,
                imgSrcList:[],
                find_img:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAABDlBMVEUAAAAAAAAAAAAAAAAAAAAAAAAKCgoTExMgICAwMDAzMzM2NjY9PT1BQUFERERSUlJaWlpdXV1gYGBiYmJkZGRmZmZpaWlra2ttbW1xcXF0dHR7e3t+fn6KioqLi4uMjIyQkJCSkpKUlJSdnZ2goKCpqamqqqqxsbG5ubm6urq7u7vBwcHCwsLFxcXFxcXMzMzMzMzNzc3Pz8/T09PV1dXV1dXV1dXZ2dna2trb29vd3d3d3d3d3d3d3d3f39/f39/h4eHh4eHi4uLk5OTk5OTo6Ojp6enp6enq6urr6+vr6+vt7e3u7u7v7+/v7+/v7+/w8PDw8PDw8PDx8fHy8vLy8vLy8vLz8/Pz8/Pz8/MsxDGLAAAAWnRSTlMABiIuMDM0Njg7PD0/P0BER0dISUpLS0xNT09TU1laW1xeX2Nma2xyeXp7f4KDhIyNj4+Wl5iZn6Cjo6Smp6ipq6yvsbO6vL2/wMLHx8nKy8vMzc/Q0tPU1dZ5ywIkAAAB8UlEQVRYw+3W2VLbMBSAYSdBDiHY7IVCoGULaxuaxWylkAAmIWxJHMz//i/CRVqgYFEp1Q0z1o1njmY+yZZ1zrGsRDIlDAwrMSCMDCspDEEpU5CIoRiKoRj6EFB6sVj12516rbQ8+B+QW2zxNDreaJ9QervdI+6D3rO7k+kHcmoAZ1tzjhDZ2fVqCJyP60PTl8BJ7jkwtQfczOtCziUE+b9jS7dwN6kHpWvQzL2OTlyAP6QFbUOQexseu4aSDuS2IR81sRASzmhARTiJXrgMB+pQugW5aGgk4MFVhhbhTHbMu7CmDBVhSwbl4VAZqsKcDBqGhjLkgyO9Cx0CZajNvfx21iGrCkkWfdquqwpJFv2z3dBWhWowK3My0FT+RiVYl0ErcKQMLUNVBlVgQxka7BBOSX6jFnxSv7Qe7EVDBfilcftHu7AUNfG5C190EtsO3E5EJOAG7GtlyMw5XIy9cU6h6egl//EbuF549V4NoKxbjubvICyPvDivQheA77oFctIHgt3VYSGEyKxUWsDVT6n0TskeKoW9ol/3f9fufdf2ZNK7TcTMwcNzE8HxVyGEVPpHW+OuHTYCCJtHm9O9iExSabSy7su8IZH66NhsD/hmovWzPSgY6SHtyo+4PY6hGPrgUMoUlDQEDSSMQKlkwnoEIB3GBxprl2YAAAAASUVORK5CYII='
            };
        },
        components: {
            EmptyList,
            ModificationStock,
            OperationRecord,
            PrintCargoLabel,
            ElImageViewer
        },
        computed:{},
        watch: {},
        created() {
            this.operationTitle = '查看产品';
            // 图片读取地址
            this.imgBaseUrl = localStorage.getItem('sys_upyun_source_url');
            // 图片上传地址
            this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file';
            this.token = getToken();
            this.header['token'] = getToken();
            this.getAllAttr();
        },
        mounted() {
        },
        methods: {
            // 图片上传成功
            handleAvatarSuccess(response, file) {
                this.uploadingTip.close();
                if(response.code === 200){
                    this.back_img_url = response.data.file_url;
                    this.completeImageUrl = response.data.file_url;
                    this.imageUrl = response.data.file_url + '!/fw/200';
                    this.bigImgUrl = response.data.file_url + '!/fw/640';
                }else {
                    this.$notify({ title: response.msg, message: '', type: 'error', duration: 5000 });
                }
            },

            // 上传失败
            uploadError(){
                this.uploadingTip.close();
                this.$notify({ title: '上传失败', message: '', type: 'error', duration: 5000 });
            },

            // 获取所有属性列表
            getAllAttr(){
                // 获取详情
                this.getProductDetailData();  // 产品详情
                this.getGoodsListData();      // 货物列表
                const params = { product_id:Number(this.$route.query.id)};
                this.createShelfCode(params); // 获取货架编码
            },

            // 图片上传前检测
            beforeAvatarUpload(file) {
                if(file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg'){
                    this.uploadingTip = this.openLoading('上传中');
                }else {
                    this.$notify({
                        title: '图片格式只支持JPG、PNG',
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                    return false
                }
            },

            handleRemove(file, fileList) {
                this.imageUrl = '';
            },

            //鼠标经过图片
            handleOverImg() {
                this.dialogVisible = true;
                setTimeout(()=>{
                    this.isBigImgOpen = true;
                },)
            },

            //鼠标离开图片
            handleLeaveImg() {
                this.isBigImgOpen = false;
                setTimeout(()=>{
                    this.dialogVisible = false;
                },300)
            },

            // 点击放大镜查看大图
            viewBigImg(){
                this.dialogVisible = true;
            },

            //
            closeViewer(){
                this.dialogVisible = false;
            },

            // 按钮 - 添加货物
            handleAddGoods() {
                this.operationForm.goods.push({
                    shelf_code: this.shelfCode,
                    stock_num:''
                });
            },

            // 按钮 - 删除单个货物
            removeSingleGood(item, index) {
                const del_goods = 'goods.' + index + '.stock_num';
                this.$refs.operationForm.clearValidate(del_goods);
                this.operationForm.goods.splice(index,1);
            },

            //打印贴标
            handlePrintLabel(row) {
                if(row.shelf_code){
                    this.printPageShow = false;
                    this.$nextTick(()=>{
                        this.cargoLabelInfo = [];
                        this.cargoLabelInfo.push({
                            id:row.id,
                            product_name:this.productName,
                            detail_code:row.detail_code,
                            shelf_code:row.shelf_code,
                            type:1
                        })
                        this.printPageShow = true;
                        this.showCode(this.cargoLabelInfo);
                    })
                }else {
                    this.$notify({
                        title: '缺少货架编码',
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }
            },

            // 多选操作
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },

            //打印全部
            handlePrintSelectedKeys() {
                this.printPageShow = false;
                this.cargoLabelInfo = [];
                this.multipleSelection.forEach((ev)=>{
                    this.cargoLabelInfo.push({
                        id:ev.id,
                        product_name:this.productName,
                        detail_code:ev.detail_code,
                        shelf_code:ev.shelf_code,
                        type:1
                    })
                });
                this.$nextTick(()=>{
                    this.printPageShow = true;
                    this.showCode(this.cargoLabelInfo);
                })
            },

            //打开修改库存弹出框
            handleEditStock(index, row) {
                this.$set(this.stockModalInfo, 'unit_name', row.product_data.attr_unit_name);
                this.stockModalInfo = Object.assign({}, this.stockModalInfo, { currentItem: row, visible: true });
            },

            //修改库存记录关闭回调
            handleCloseStockModal(visible) {
                this.$set(this.stockModalInfo, 'visible', visible);
            },

            //修改库存记录确定回调
            handleSureStockModal(visible) {
                this.$set(this.stockModalInfo, 'visible', visible);
                // 刷新货物列表
                this.getGoodsListData();
            },

            //打开操作记录弹出框
            handleOperateRecord(index, row) {
                this.recordModalInfo = Object.assign({}, this.recordModalInfo, { currentItem: row, visible: true });
            },

            //修改库存记录关闭回调
            handleCloseRecordModal(visible) {
                this.$set(this.recordModalInfo, 'visible', visible);
            },

            //修改库存记录确定回调
            handleSureRecordModal(visible) {
                this.$set(this.recordModalInfo, 'visible', visible);
                // 刷新货物列表
                this.getGoodsListData();
            },

            // 按钮-保存
            handleSaveGood(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if(this.completeImageUrl === ''){
                            this.$notify({
                                title: '请上传图片',
                                message: '',
                                type: 'error',
                                duration: 5000
                            });
                            return false
                        }else {
                            this.add_goods = [];
                            this.operationForm.goods.forEach((ev,index) =>{
                                if(ev.stock_num > 0){
                                    this.add_goods.push(ev);
                                }
                            });
                            this.$set(this.operationForm, 'goods', this.add_goods);

                            if(this.add_goods.length > 0){
                                this.saveIsClick = true;
                                this.addGoodsPost(Number(this.$route.query.id));
                            }else {
                                this.$notify({
                                    title: '您还未做任何修改哦～',
                                    message: '',
                                    type: 'error',
                                    duration: 5000
                                });
                            }

                        }
                    }else {
                        console.log('验证失败');
                    }
                })
            },

            // 请求 - 添加货物（查看/编辑时使用）
            addGoodsPost(id){
                let goods_arr = [];
                this.add_goods.forEach((ev,index) =>{
                    let request = {};
                    request['price_in'] = 0;
                    request['product_id'] = id;
                    request['status'] = 0;
                    request['shelf_code'] = ev.shelf_code;
                    request['stock_total'] = Number(ev.stock_num);
                    request['type'] = this.operationForm.type;
                    goods_arr.push(request);
                });
                let params = {
                    data:goods_arr
                }
                this.addGoods(params);
            },

            // 请求 - 产品详情
            getProductDetailData(){
                const params ={
                    id:Number(this.$route.query.id),
                    product_code: ''
                }
                const rLoading = this.openLoading();
                getProductDetail(params)
                    .then((res) => {
                        if (res.code === 200) {
                            this.$set(this.operationForm,'type',res.data.type);
                            this.productName = res.data.name;
                            this.product_code = res.data.product_code;
                            this.unitName = res.data.attr_unit_name;
                            this.$set(this.operationForm,'img',res.data.img);
                            this.completeImageUrl = res.data.img;
                            this.imageUrl = res.data.img + '!/fw/240';
                            this.bigImgUrl = res.data.img + '!/fw/640';
                            this.imgSrcList = [];
                            this.imgSrcList.push(this.bigImgUrl);
                            this.getShelfList();   // 请求 - 获取货架列表
                        } else {
                            this.$notify({
                                title: res.msg,
                                message: '',
                                type: 'error',
                                duration: 5000
                            });
                        }
                        rLoading.close();
                    })
                    .catch(() => {});
            },

            // 请求 - 获取货架列表
            getShelfList() {
                // this.loading = true;
                let params = {
                    floor_code: '-1',
                    room_code: '-1',
                    shelf_code: -1
                };
                const rLoading = this.openLoading();
                getShelfList(params).then((res) => {
                    rLoading.close();
                    if (res.code === 200){
                        if(res.data){
                            if(this.operationForm.type > 0){
                                this.shelf_list = res.data.filter(value => (value.type === 1 && value.status === 0));
                            }else {
                                // 布类型 数据
                                this.shelf_list = res.data.filter(value => (value.type === 0 && value.status === 0));
                            }
                        }else {
                            this.shelf_list = [];
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

            // 请求 - 货物列表
            getGoodsListData(){
                const params ={
                    product_id:Number(this.$route.query.id),
                    product_code: '',
                    shelf_code:'',
                    limit:10,
                    page:this.goodsPageInfo.pageIndex,
                    stock_available_le: -1, //不检索传-1
                    stock_available_ge: -1 //不检索传-1
                }
                const rLoading = this.openLoading();
                getGoodsList(params)
                    .then((res) => {
                        rLoading.close();
                        if (res.code === 200) {
                            this.goodsData = res.data.lists || [];
                            this.$set(this.goodsPageInfo,'pageTotal', res.data.total)
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

            // 请求 - 新增货物
            addGoods(params){
                const rLoading = this.openLoading();
                getGoodsCreate(params).then((res) => {
                    rLoading.close();
                    if (res.code === 200) {
                        this.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 5000
                        });
                        this.$set(this.operationForm, 'goods', []);
                        const params = { product_id:Number(this.$route.query.id)};
                        this.createShelfCode(params); // 获取货架编码
                        this.getGoodsListData();
                        this.saveIsClick = false;
                    } else {
                        this.saveIsClick = false;
                        this.$notify({
                            title: res.msg,
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                }).catch(() => {});
            },

            // 照片处理
            handleNotProcess(id){
                const params = {
                    id:id
                }
                // 照片处理
                pictureProcessing(params).then((res)=>{
                    if(res.code === 200){
                    }else {
                        this.$notify({ title: res.msg, message: '', type: 'error', duration: 5000 });
                    }
                }).catch((err)=>{});
            },

            // 格式化数据
            handlerData(arr){
                let obj = {};
                arr.forEach((item, index) => {
                    let { category_id } = item;
                    if (!obj[category_id]) {
                        obj[category_id] = {
                            category_id,
                            children: []
                        }
                    }
                    obj[category_id].children.push(item);
                });
                let data = Object.values(obj);
                data.forEach(ev=>{
                    ev['name'] = ev.children[0].category_name;
                    ev['id'] = ev.category_id;
                })
                return data;
            },

            // 分页导航
            handlePageChange(val) {
                this.$set(this.goodsPageInfo, 'pageIndex', val);
                this.getGoodsListData();
            },

            // 切换产品种类（布/其它）
            chooseProductType(){
            },

            // 创建货架编号
            createShelfCode(params){
                const rLoading = this.openLoading();
                getShelfCodeCreate(params).then((res) => {
                    rLoading.close();
                    if (res.code === 200) {
                        this.shelfCode = res.data.shelf_code;
                    } else {
                        this.$notify({
                            title: '货架编码获取失败',
                            message: '',
                            type: 'error',
                            duration: 5000
                        });
                    }
                }).catch(() => {});
            },

            // 显示二维码
            showCode(info){
                info.forEach((ev,index)=>{
                    let obj = {
                        code:ev.detail_code,
                        type:1
                    }
                    this.$nextTick(()=>{
                        let params = JSON.stringify(obj);
                        this.creatQrCode(params,ev.id);
                    })
                })
                setTimeout(()=>{
                    this.$print(this.$refs.print);
                },100)
            },

            // 生成二维码
            creatQrCode(params, id) {
                const QR = 'qrCodeUrl' + id;
                var qrcode = new QRCode(document.getElementById("qrCodeUrl"+id), {
                    render: "canvas", //table方式
                    text: params, // 需要转换为二维码的内容
                    width: 96,
                    height: 96,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                })
            },
        }
    };
</script>
<style>
    .print-cargo-label-page{
        position: absolute;
        top: -9999px;
        left: -9999px;
        z-index: -1;
    }
    /* 去除页眉页脚 */
    @page {
        size: auto;
        margin: 10mm 0 8mm 0;
    }
    @media print {
    }
</style>
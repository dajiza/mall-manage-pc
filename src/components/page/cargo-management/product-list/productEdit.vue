<template>
    <div class="operation-product-page">
        <div class="product-content">
            <div class="global-table-title border-bottom">
                <div class="title">
                    <i></i>
                    <span>{{operationTitle}}</span>
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
                    >
                        <img
                                v-if="imageUrl"
                                :src="imageUrl"
                                class="avatar"
                        />
                        <!--@mouseover="handleOverImg"
                                @mouseleave="handleLeaveImg"-->
                        <div v-else class="avatar-uploader-icon">
                            <img src="../../../../assets/img/Icon-Plus.svg" alt="">
                            <span class="add-img-text">添加图片</span>
                        </div>
                        <div class="magnifier-box" v-show="imageUrl" @click.stop="viewBigImg">
                            <img class="magnifier-img" src="../../../../assets/img/magnifier-icon.png" />
                        </div>

                    </el-upload>
                </el-form-item>
                <div>
                    <el-row>
                        <el-col :span="8">
                            <el-form-item label="类型选择:" prop="type" class="select-type">
                                <el-radio-group v-model="operationForm.type" :disabled="true">
                                    <el-radio :label="0">布</el-radio>
                                    <el-radio :label="1">其他</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <div class="product-code">产品编码：{{operationForm.productCode}}</div>
                    <div class="form-item-special clearfix">
                        <el-form-item label="名称:" prop="name">
                            <el-input placeholder="请输入名称" v-model="operationForm.name" />
                        </el-form-item>
                        <el-form-item label="品牌:" prop="brand">
                            <el-select v-model="operationForm.brand" placeholder="请选择品牌">
                                <el-option
                                        v-for="state in brandData"
                                        :key="state.id"
                                        :value="state.id"
                                        :label="state.name"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="分类:" prop="category">
                            <el-select v-model="operationForm.category" placeholder="请选择分类">
                                <el-option
                                        v-for="state in categoryData"
                                        :key="state.id"
                                        :value="state.id"
                                        :label="state.name"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="产地:" v-if="operationForm.type === 0" prop="placeOfOrigin">
                            <el-select
                                    v-model="operationForm.placeOfOrigin"
                                    placeholder="请选择产地"
                            >
                                <el-option
                                        v-for="state in placeOfOriginData"
                                        :key="state.id"
                                        :value="state.id"
                                        :label="state.name"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="颜色:" v-if="operationForm.type === 0" prop="color">
                            <el-select v-model="operationForm.color" placeholder="请选择颜色">
                                <el-option
                                        v-for="state in colorData"
                                        :key="state.id"
                                        :value="state.id"
                                        :label="state.name"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="材质:" v-if="operationForm.type === 0" prop="material">
                            <el-select v-model="operationForm.material" placeholder="请选择材质">
                                <el-option
                                        v-for="state in materialData"
                                        :key="state.id"
                                        :value="state.id"
                                        :label="state.name"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="幅宽(cm):" v-if="operationForm.type === 0" prop="widthOfCloth">
                            <el-input v-model.number="operationForm.widthOfCloth" placeholder="请输入幅宽" @mousewheel.native.prevent />
                        </el-form-item>
                        <el-form-item label="尺寸:" v-if="operationForm.type === 0" prop="size">
                            <el-input v-model.number="operationForm.size" placeholder="请输入尺寸" @mousewheel.native.prevent/>
                        </el-form-item>
                        <el-form-item label="单位:" prop="company">
                            <el-select v-model="operationForm.company" placeholder="请选择单位">
                                <el-option
                                        v-for="state in companyData"
                                        :key="state.id"
                                        :value="state.id"
                                        :label="state.name"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="花纹:" v-if="operationForm.type === 0" prop="attr_pattern">
                            <el-select v-model="operationForm.attr_pattern" placeholder="请选择花纹">
                                <el-option
                                        v-for="state in patternData"
                                        :key="state.id"
                                        :value="state.id"
                                        :label="state.name"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="建议零售价:" prop="retailPrice">
                            <el-input v-model="operationForm.retailPrice" :precision="2" placeholder="请输入价格" />
                        </el-form-item>
                        <el-form-item label="标签:" prop="label">
                            <el-cascader
                                    v-model="operationForm.label"
                                    placeholder="请选择标签"
                                    :options="labelData"
                                    :show-all-levels="false"
                                    :props="{ multiple: true, label:'name', value:'id' }"
                                    filterable
                            ></el-cascader>
                        </el-form-item>
                    </div>
                </div>

                <div class="global-table-title border-bottom">
                    <div class="title">
                        <i></i>
                        <span>货物信息</span>
                    </div>
                    <el-button type="success" @click="handleAddGoods">添加</el-button>
                </div>
                <div class="add-goods-box clearfix" v-for="(item, index) in operationForm.goods" :key="index">
                    <el-form-item class="add-goods-item clearfix" label="货架编码:" label-width="75px"
                                  :prop="'goods.' + index + '.shelf_code'">
                        <!--<el-input v-model="item.shelf_code" placeholder="请输入"></el-input>-->
                        <el-select v-model="item.shelf_code" placeholder="请选择">
                            <el-option
                                    v-for="state in available_shelf_list"
                                    :key="state.code"
                                    :value="state.code"
                                    :label="state.code"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item class="add-goods-item clearfix" label="库存:" :prop="'goods.' + index + '.stock_num'"
                                  label-width="45px"
                                  :rules="roleRules.stock_num">
                        <el-input v-model.number="item.stock_num" placeholder="请输入" @mousewheel.native.prevent></el-input>&nbsp;&nbsp;<span>{{back_unit(operationForm.company)}}</span>
                    </el-form-item>
                    <div class="btn-box">
                        <el-button type="danger" @click.prevent="removeSingleGood(item, index)">删除</el-button>
                        <el-button type="success" @click="handlePrintLabel(item)">打印标贴</el-button>
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
                    <el-table-column type="selection" width="55" align="center"></el-table-column>
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
                            <el-button type="success" v-hasPermission="'print-goods-tags'" @click="handlePrintLabel(scope.row)">打印标贴</el-button>
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
                            hide-on-single-page="hide-on-single-page"
                            @current-change="handlePageChange"
                    ></el-pagination>
                </div>
            </el-form>
            <div class="operations">
                <el-button type="primary" :disabled="saveIsClick" @click="handleSaveGood('operationForm')">保存</el-button>
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
        <div v-if="printPageShow" class="print-cargo-label-page" @click.stop="">
            <div id="printMe" ref="print" style="width: 100%;height: 100%;background: #fff;box-sizing: border-box;">
                <div class="label-box" v-for="(item,i) in cargoLabelInfo" :key="i" style="page-break-after:always;width: 100%;height: 60mm;display: flex;justify-content: center;align-items: center">
                    <div class="label-content" style="width: 36mm;height: 53mm;border-radius: 2px;box-sizing: border-box;display: flex;flex-direction: column" :style="i > 0?'margin-top:3mm':'margin-top:1mm'">
                        <table class="print-table" headerRows='1' style="width: 100% !important;border-color: #000;border-collapse:collapse;font-size: 9px!important;box-sizing: border-box">
                            <tr style="height: 30px;line-height: 14px;box-sizing: border-box;">
                                <th style="width: 40%;border: 1px solid #000;text-align: center;box-sizing: border-box;font-weight: 500!important;font-size: 8px!important;">产品名称</th>
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
        <!--大图预览-->
        <el-image-viewer
                v-if="dialogVisible"
                :on-close="closeViewer"
                :url-list="imgSrcList" />
    </div>
</template>
<script>
    import './ProductList.less';
    import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
    import OperationRecord from '../../../common/operation-record/OperationRecord';
    import ModificationStock from '../../../common/modification-stock/ModificationStock';
    import EmptyList from '../../../common/empty-list/EmptyList';
    import { getAllAttrList } from '../../../../api/configManagement';
    import { getCategoryList } from '../../../../api/productCategory';
    import { getLabelAllList } from '../../../../api/productLabel';
    import { getToken } from '../../../../utils/auth';
    import { getShelfCodeCreate } from '../../../../api/createCode';
    import {
        getProductCreate,
        getProductUpdate,
        getProductDetail,
        getGoodsList,
        getGoodsCreate
    } from '../../../../api/productList';
    import QRCode from 'qrcodejs2';
    import { getShelfList } from '../../../../api/shelf';
    export default {
        name: 'productEdit',
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
            var checkSize = (rule, value, callback) => {
                setTimeout(() => {
                    if (!Number.isInteger(value)) {
                        if(!value){
                            callback();
                        }else {
                            callback(new Error('请输入数字值'));
                        }
                    }else {
                        callback();
                    }
                }, 10);

            };
            return {
                productForm: {},
                operationTitle:'',
                roleRules: {
                    type: [{ required: true, message: '请选择类型' }],
                    name: [
                        { required: true, message: '请输入名称' },
                        { max: 50, message: '名称最多可输入50个字符', trigger: 'blur' }
                    ],
                    brand: [{ required: true, message: '请选择品牌' }],
                    category: [{ required: true, message: '请选择分类' }],
                    placeOfOrigin: [{ required: true, message: '请选择产地' }],
                    color: [{ required: true, message: '请选择颜色' }],
                    attr_pattern: [{ required: true, message: '请选择花纹' }],
                    productCode: [],
                    material: [{ required: true, message: '请选择' }],
                    widthOfCloth: [{ required: true, message: '请输入' },
                        { validator: checkNum, trigger: 'blur' }],
                    size: [{ validator: checkSize, trigger: 'blur' }],
                    company: [{ required: true, message: '请选择单位' }],
                    retailPrice: [{ required: true, message: '请输入价格' },
                        { pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/, message: '请输入正确格式,可保留两位小数' }
                    ],
                    label: [{ required: true, message: '请选择标签' }],
                    stock_num:[{ validator: checkNum, trigger: 'blur' }]
                },
                defaultProps: {
                    children: 'children',
                    label: 'display_name'
                },
                dialogVisible: false,
                isBigImgOpen: false,
                operationForm: {
                    type: 0,
                    name: '',
                    brand: '',
                    category: '',
                    placeOfOrigin: '',
                    color: '',
                    productCode: '',
                    material: '',
                    widthOfCloth: '',
                    size: '',
                    company: '',
                    retailPrice: '',
                    label: [],
                    goods: [],
                    attr_pattern:''
                },
                brandData: [],          // 品牌下拉列表
                brandDataCloth: [],     // 品牌下拉列表（布）
                brandDataOther: [],     // 品牌下拉列表（其它）
                categoryData: [],       // 分类下拉列表
                placeOfOriginData: [],  // 产地下拉列表
                colorData: [],          // 颜色下拉列表
                patternData: [],        // 花纹下拉列表
                materialData: [],       // 材质下拉列表
                companyData: [],        // 单位下拉列表
                labelData: [],          // 标签下拉列表 （处理后）
                labelDataCloth: [],     // 标签下拉列表 （布）（处理后）
                labelDataOther: [],     // 标签下拉列表 （其它）（处理后）
                labelDataClothAll: [],       // 全部标签数据 （布）（未处理）
                labelDataOtherAll: [],       // 全部标签数据 （其它）（未处理）
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
                    currentItem: {}
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
                shelfCode:'',  // 货架编码
                printPageShow:false,
                productName:'',  // 产品名称
                shelf_list:[],   // 货架总列表
                available_shelf_list:[],  // 可用货架列表
                cargoLabelInfo:[],
                saveIsClick:false,
                imgSrcList:[]
            };
        },
        components: {
            EmptyList,
            ModificationStock,
            OperationRecord,
            ElImageViewer
        },
        computed:{
            back_unit: function(){
                return (data) => {
                    let unit = '';
                    this.companyData.forEach((ev)=>{
                        if(ev.id === Number(data)){
                            unit = ev.name
                        }
                    })
                    return unit
                }
            },
        },
        watch: {},
        created() {
            this.operationTitle = '编辑产品';
            // 图片读取地址
            this.imgBaseUrl = localStorage.getItem('sys_upyun_source_url');
            // 图片上传地址
            this.uploadImgUrl = process.env.VUE_APP_BASE_API + '/backend/upload-file';
            this.token = getToken();
            this.header['token'] = getToken();
            this.getAllAttr();
        },
        mounted() {
            if(this.$route.query.code){
                this.$set(this.operationForm,'productCode',this.$route.query.code);
            }
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
                    this.imgSrcList = [];
                    this.imgSrcList.push(this.bigImgUrl);
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
                const that = this;
                const shelf_params ={
                    floor_code: '-1',
                    room_code: '-1',
                    shelf_code: -1
                };
                const rLoading = that.openLoading();
                this.$ajax.all([
                    getAllAttrList({type:1,category:1}),
                    getAllAttrList({type:2}),
                    getAllAttrList({type:3}),
                    getAllAttrList({type:4}),
                    getAllAttrList({type:5, category:1}),
                    getCategoryList({}),
                    getLabelAllList({ category_id: -1, name:'-1',type: 0}),
                    getAllAttrList({type:1, category:2}),
                    getLabelAllList({ category_id: -1, name:'-1',type: 1}),
                    getShelfList(shelf_params),
                    getAllAttrList({type:6}),
                ]).then(that.$ajax.spread(function(res1, res2, res3, res4, res5, res6, res7, res8, res9, res10, res11) {
                    let err_arr = [];
                    if (res1.code === 200){  // 品牌(布)
                        that.brandDataCloth = res1.data || [];
                    }else {
                        that.brandDataCloth = [];
                        if(res1.code === -1 && res1.msg.indexOf('无权限')> -1){
                            err_arr.push(res1.code);
                        }
                        // that.$notify({ title: res1.msg, message: '', type: 'error', duration: 5000 });
                    }
                    if (res2.code === 200){  // 颜色
                        that.colorData = res2.data || [];
                    }else {
                        that.colorData = [];
                        // that.$notify({ title: res2.msg, message: '', type: 'error', duration: 5000 });
                    }
                    if (res3.code === 200){  // 产地
                        that.placeOfOriginData = res3.data || [];
                    }else {
                        // that.$notify({ title: res3.msg, message: '', type: 'error', duration: 5000 });
                    }
                    if (res4.code === 200){  // 单位
                        that.companyData = res4.data || [];
                    }else {
                        // that.$notify({ title: res4.msg, message: '', type: 'error', duration: 5000 });
                    }
                    if (res5.code === 200){  // 材质(布)
                        that.materialData = res5.data || [];
                    }else {
                        // that.$notify({ title: res5.msg, message: '', type: 'error', duration: 5000 });
                    }

                    if (res6.code === 200){  // 分类
                        that.categoryData = res6.data || [];
                    }else {
                        // that.$notify({ title: res6.msg, message: '', type: 'error', duration: 5000 });
                    }

                    if (res7.code === 200){  // 标签(布)
                        that.labelDataClothAll = [];
                        if (res7.data) {
                            that.labelDataClothAll = res7.data;
                            that.labelDataCloth = that.handlerData(that.labelDataClothAll);
                        }else {
                            that.labelDataCloth = [];
                        }
                    }else {
                        that.labelDataCloth = [];
                        if(res7.code === -1 && res7.msg.indexOf('无权限')> -1){
                            err_arr.push(res7.code);
                        }
                        // that.$notify({ title: res7.msg, message: '', type: 'error', duration: 5000 });
                    }
                    if (res8.code === 200){  // 品牌(其它)
                        that.brandDataOther = res8.data || [];
                    }else {
                        // that.$notify({ title: res8.msg, message: '', type: 'error', duration: 5000 });
                    }
                    if (res9.code === 200){  // 标签(布)
                        that.labelDataOtherAll = [];
                        if (res9.data) {
                            that.labelDataOtherAll = res9.data;
                            that.labelDataOther = that.handlerData(that.labelDataOtherAll);
                        }else {
                            that.labelDataOther = [];
                        }
                    }else {
                        // that.$notify({ title: res9.msg, message: '', type: 'error', duration: 5000 });
                    }
                    if (res10.code === 200){  // 货架
                        if(res10.data){
                            that.shelf_list = res10.data;
                        }
                    }else {
                        that.shelf_list = [];
                        if(res10.code === -1 && res10.msg.indexOf('无权限')> -1){
                            err_arr.push(res10.code);
                        }
                        // that.$notify({ title: res9.msg, message: '', type: 'error', duration: 5000 });
                    }
                    if (res11.code === 200){  // 花纹
                        that.patternData = res11.data || [];
                    }else {
                        that.patternData = [];
                    }
                    if(err_arr.length > 0){
                        that.$notify({ title: '产品列表搜索条件权限不足，请联系管理员添加', message: '', type: 'error', duration: 5000 });
                    }
                    rLoading.close();
                    // 编辑-获取详情
                    that.getProductDetailData();
                    that.getGoodsListData();
                    const params = { product_id:Number(that.$route.query.id)};
                    that.createShelfCode(params); // 货架编码
                })).catch((err)=>{});
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
                if(this.operationForm.name && this.operationForm.productCode){
                    this.productName = this.operationForm.name;
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
                let select_unit_name = '';
                this.companyData.forEach((ev)=>{
                    if(ev.id === this.operationForm.company){
                        select_unit_name = ev.name
                    }
                })
                this.$set(this.stockModalInfo, 'unit_name', select_unit_name);
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
                            let tag_arr = [];
                            if(this.operationForm.label.length > 0){
                                this.operationForm.label.forEach(ev=>{
                                    tag_arr.push(ev[1]);
                                })
                            }
                            let params = {};
                            params['name'] = this.operationForm.name;
                            params['category_id'] = Number(this.operationForm.category);
                            params['img'] = this.completeImageUrl;
                            params['type'] = this.operationForm.type;
                            params['price_out'] = Number(this.operationForm.retailPrice)*100;
                            params['attr_pattern'] = Number(this.operationForm.attr_pattern);
                            params['remark'] = '';
                            params['attr_origin'] = Number(this.operationForm.placeOfOrigin);
                            params['attr_brand'] = Number(this.operationForm.brand);
                            params['attr_material'] = Number(this.operationForm.material);
                            params['attr_color'] = Number(this.operationForm.color);
                            params['attr_unit'] = Number(this.operationForm.company);
                            params['attr_width'] = Number(this.operationForm.widthOfCloth);
                            params['attr_size'] = Number(this.operationForm.size);
                            params['tag_ids'] = tag_arr;
                            this.add_goods = [];
                            this.operationForm.goods.forEach((ev,index) =>{
                                if(ev.stock_num > 0){
                                    this.add_goods.push(ev);
                                }
                            });
                            this.$set(this.operationForm, 'goods', this.add_goods);
                            params['id'] = Number(this.$route.query.id);
                            this.saveIsClick = true;
                            this.editProduct(params);
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

            // 请求 - 添加 产品
            addProduct(params){
                const rLoading = this.openLoading();
                getProductCreate(params)
                    .then((res) => {
                        rLoading.close();
                        if (res.code === 200) {
                            this.$notify({
                                title: '操作成功',
                                message: '',
                                type: 'success',
                                duration: 3000
                            });
                            setTimeout(()=>{
                                this.$router.push({path:'/product-list'});
                            },1000)
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

            // 请求 - 编辑 产品
            editProduct(params){
                const rLoading = this.openLoading();
                getProductUpdate(params)
                    .then((res) => {
                        rLoading.close();
                        if (res.code === 200) {
                            if(this.add_goods.length > 0){
                                this.addGoodsPost(Number(this.$route.query.id));
                            }else {
                                this.$notify({
                                    title: '操作成功',
                                    message: '',
                                    type: 'success',
                                    duration: 3000
                                });
                                this.saveIsClick = false;
                            }
                            // 刷新详情
                            this.getProductDetailData();
                        } else {
                            this.saveIsClick = false;
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
                            let labelDataAll = [];
                            if(res.data.type > 0){
                                this.brandData = this.brandDataOther;
                                this.labelData = this.labelDataOther;
                                labelDataAll = this.labelDataOtherAll;
                                this.available_shelf_list = this.shelf_list.filter(value => (value.type === 1 && value.status === 0));
                            }else {
                                // 品牌、标签下拉框赋值 为 布类型 数据
                                this.brandData = this.brandDataCloth;
                                this.labelData = this.labelDataCloth;
                                labelDataAll = this.labelDataClothAll;
                                this.available_shelf_list = this.shelf_list.filter(value => (value.type === 0 && value.status === 0));
                            }
                            this.$set(this.operationForm,'name',res.data.name);
                            this.$set(this.operationForm,'category',res.data.category_id);
                            this.$set(this.operationForm,'company',res.data.attr_unit);
                            this.$set(this.operationForm,'retailPrice',res.data.price_out/100);
                            this.$set(this.operationForm,'brand',res.data.attr_brand);
                            this.$set(this.operationForm,'material',res.data.attr_material);
                            this.$set(this.operationForm,'color',res.data.attr_color);
                            this.$set(this.operationForm,'placeOfOrigin',res.data.attr_origin);
                            this.$set(this.operationForm,'size',res.data.attr_size);
                            this.$set(this.operationForm,'widthOfCloth',res.data.attr_width);
                            this.$set(this.operationForm,'img',res.data.img);
                            this.$set(this.operationForm,'attr_pattern',res.data.attr_pattern || '');
                            this.completeImageUrl = res.data.img;
                            this.imageUrl = res.data.img + '!/fw/240';
                            this.bigImgUrl = res.data.img + '!/fw/640';
                            this.imgSrcList = [];
                            this.imgSrcList.push(this.bigImgUrl);
                            let tags_arr = [];
                            res.data.tag_ids.forEach((event,index)=>{
                                labelDataAll.forEach((ev,i)=>{
                                    if(event === ev.id){
                                        tags_arr.push([ev.category_id, ev.id]);
                                    }
                                })
                            })
                            this.$set(this.operationForm,'label',tags_arr);
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
                            duration: 3000
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

            // 查看大图
            viewBigImg(){
                this.dialogVisible = true;
            },

            // 关闭大图
            closeViewer(){
                this.dialogVisible = false;
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

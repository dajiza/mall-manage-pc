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
                        :disabled="operationTitle === '查看产品'"
                    >
                        <img
                            v-if="imageUrl"
                            :src="imageUrl"
                            class="avatar"
                            @mouseover="handleOverImg"
                            @mouseleave="handleLeaveImg"
                        />
                        <div v-else class="avatar-uploader-icon">
                            <img src="../../../../assets/img/Icon-Plus.svg" alt="">
                            <span class="add-img-text">添加图片</span>
                        </div>

                    </el-upload>
                </el-form-item>
                <div>
                    <el-row>
                        <el-col :span="8">
                            <el-form-item label="类型选择:" prop="type" class="select-type">
                                <el-radio-group v-model="operationForm.type"
                                                @change="chooseProductType"
                                        :disabled="operationTitle !== '新增产品'">
                                    <el-radio :label="0">布</el-radio>
                                    <el-radio :label="1">其他</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <div class="form-item-special clearfix" v-if="isFromEditOrView">
                        <el-form-item label="名称:" prop="name">
                            <el-input placeholder="请输入名称" v-model="operationForm.name" />
                        </el-form-item>
                        <el-form-item label="品牌:" prop="brand">
                            <el-select v-model="operationForm.brand" placeholder="请选择品牌" @change="selectChange">
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
                                    placeholder="请选择产地" @change="selectChange"
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
                            <el-select v-model="operationForm.color" placeholder="请选择颜色" @change="selectChange">
                                <el-option
                                        v-for="state in colorData"
                                        :key="state.id"
                                        :value="state.id"
                                        :label="state.name"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="材质:" v-if="operationForm.type === 0" prop="material">
                            <el-select v-model="operationForm.material" placeholder="请选择材质" @change="selectChange">
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
                        <el-form-item label="产品编码:" v-if="operationForm.type === 0" prop="productCode">
                            <el-input v-model="operationForm.productCode" :disabled="true" />
                        </el-form-item>
                        <el-form-item label="单位:" prop="company">
                            <el-select v-model="operationForm.company" placeholder="请选择单位" @change="selectChange">
                                <el-option
                                        v-for="state in companyData"
                                        :key="state.id"
                                        :value="state.id"
                                        :label="state.name"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="建议零售价:" prop="retailPrice">
                            <el-input v-model="operationForm.retailPrice" :precision="2" placeholder="请输入价格" />
                        </el-form-item>
                        <el-form-item label="产品编码:" v-if="operationForm.type !== 0" prop="productCode">
                            <el-input v-model="operationForm.productCode" :disabled="true" />
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
                    <el-form-item class="add-goods-item clearfix" label="货物编码:" label-width="75px"
                            :prop="'goods.' + index + '.product_code'">
                        <el-input v-model="item.product_code" placeholder="请输入" :disabled="true"></el-input>
                    </el-form-item>
                    <el-form-item class="add-goods-item clearfix" label="货架编码:" label-width="75px"
                                  :prop="'goods.' + index + '.shelf_code'">
                        <el-input v-model="item.shelf_code" placeholder="请输入"></el-input>
                    </el-form-item>
                    <!--:rules="[{required: true, message: '请填写库存', trigger: ['blur']},]"-->
                    <el-form-item class="add-goods-item clearfix" label="库存:" :prop="'goods.' + index + '.stock_num'"
                                  label-width="45px"
                                  :rules="roleRules.stock_num">
                        <el-input v-model.number="item.stock_num" placeholder="请输入" @mousewheel.native.prevent></el-input>&nbsp;&nbsp;<span>{{back_unit(operationForm.company)}}</span>
                    </el-form-item>
                    <div class="btn-box">
                        <el-button type="danger" @click.prevent="removeSingleGood(item, index)">删除</el-button>
                        <el-button type="success" @click="handlePrintLabel">打印标贴</el-button>
                    </div>
                </div>

                <div class="selectedKeys-module" v-if="multipleSelection.length">
                    <div class="info-icon">
                        <span></span>
                        已选择
                        <span>{{multipleSelection.length}}</span>项
                    </div>
                    <span class="print-all" @click="handlePrintSelectedKeys">打印全部</span>
                </div>
                <el-table class="goods-info-table" v-show="operationTitle !== '新增产品'"
                    v-loading="loading"
                    :data="goodsData"
                    ref="multipleTable"
                    tooltip-effect="dark"
                    @selection-change="handleSelectionChange"
                >
                    <el-table-column type="selection" width="55" align="center"></el-table-column>
                    <el-table-column prop="detail_code" label="货物编码"></el-table-column>
                    <el-table-column prop="shelf_code" label="货架编码"></el-table-column>
                    <el-table-column prop="stock_total" label="总库存"></el-table-column>
                    <el-table-column prop="stock_locked" label="待出库库存"></el-table-column>
                    <el-table-column prop="created_time" label="创建时间" width="200"></el-table-column>
                    <el-table-column label="操作" width="300" align="left">
                        <template slot-scope="scope">
                            <el-button
                                type="text"
                                @click="handleEditStock(scope.$index, scope.row)"
                            >修改库存</el-button>
                            <el-button
                                type="text"
                                class="operate-record"
                                @click="handleOperateRecord(scope.$index, scope.row)"
                            >操作记录</el-button>
                            <el-button type="success" @click="handlePrintLabel">打印标贴</el-button>
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
                <el-button type="primary" @click="handleSaveGood('operationForm')">保存</el-button>
            </div>
        </div>
        <div class="modal-img" v-show="dialogVisible" :class="{'w640':isBigImgOpen}">
            <img :src="bigImgUrl" alt />
        </div>
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
    </div>
</template>
<script>
import './ProductList.less';
import OperationRecord from '../../../common/operation-record/OperationRecord';
import ModificationStock from '../../../common/modification-stock/ModificationStock';
import EmptyList from '../../../common/empty-list/EmptyList';
import { pictureProcessing} from '../../../../api/photoDetection';
import { getAllAttrList } from '../../../../api/configManagement';
import { getCategoryList } from '../../../../api/productCategory';
import { getLabelAllList } from '../../../../api/productLabel';
import { getToken } from '../../../../utils/auth';
import { getProductCodeCreate, getProductDetailCodeCreate, getShelfCodeCreate } from '../../../../api/createCode';
import {
    getProductCreate,
    getProductUpdate,
    getProductDetail,
    getGoodsList,
    getGoodsCreate
} from '../../../../api/productList';
export default {
    name: 'OperationProductModule',
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
                goods: []
            },
            brandData: [],          // 品牌下拉列表
            brandDataCloth: [],     // 品牌下拉列表（布）
            brandDataOther: [],     // 品牌下拉列表（其它）
            categoryData: [],       // 分类下拉列表
            placeOfOriginData: [],  // 产地下拉列表
            colorData: [],          // 颜色下拉列表
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
                currentItem: {}
            }, //修改库存信息
            recordModalInfo: {
                visible: false,
                currentItem: {}
            }, //操作记录信息
            isFromEditOrView: true,
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
            goodsCreatedNum:0, // 已创建货物数量（从后台请求到的已存在货物数量）
            goodsNum:0, // 现有货物数量（包括已添加未保存）
            shelfCode:'',  // 货架编码
        };
    },
    components: {
        EmptyList,
        ModificationStock,
        OperationRecord,
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
        if(this.$route.query.status === 'view'){
            this.operationTitle = '查看产品';
            this.isFromEditOrView = false;
        }else if(this.$route.query.status === 'edit'){
            this.operationTitle = '编辑产品';
        }else {
            this.operationTitle = '新增产品';
        }

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
        const pathname = this.getUrlKey('status', window.location.href);
        if (pathname === 'view') {
            this.isFromEditOrView = false;
        };
    },
    methods: {
        getUrlKey(name, url) {
            return (
                decodeURIComponent(
                    (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url) || [, ''])[1].replace(/\+/g, '%20')
                ) || null
            );
        },
        // 图片上传成功
        handleAvatarSuccess(response, file) {
            // this.imageUrl = URL.createObjectURL(file.raw);
            this.uploadingTip.close();
            if(response.code === 200){
                // this.$notify({ title: '操作成功', message: '', type: 'success', duration: 1000 });
                this.back_img_url = response.data.file_url;
                this.completeImageUrl = this.imgBaseUrl + response.data.file_url;
                this.imageUrl = this.imgBaseUrl + response.data.file_url + '!/fw/200';
                this.bigImgUrl = this.imgBaseUrl +  response.data.file_url + '!/fw/640';
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
            ]).then(that.$ajax.spread(function(res1, res2, res3, res4, res5, res6, res7, res8, res9) {
                if (res1.code === 200){  // 品牌(布)
                    that.brandDataCloth = res1.data || [];
                }else {
                    that.$notify({ title: res1.msg, message: '', type: 'error', duration: 5000 });
                }
                if (res2.code === 200){  // 颜色
                    that.colorData = res2.data || [];
                }else {
                    that.$notify({ title: res2.msg, message: '', type: 'error', duration: 5000 });
                }
                if (res3.code === 200){  // 产地
                    that.placeOfOriginData = res3.data || [];
                }else {
                    that.$notify({ title: res3.msg, message: '', type: 'error', duration: 5000 });
                }
                if (res4.code === 200){  // 单位
                    that.companyData = res4.data || [];
                }else {
                    that.$notify({ title: res4.msg, message: '', type: 'error', duration: 5000 });
                }
                if (res5.code === 200){  // 材质(布)
                    that.materialData = res5.data || [];
                }else {
                    that.$notify({ title: res5.msg, message: '', type: 'error', duration: 5000 });
                }

                if (res6.code === 200){  // 分类
                    that.categoryData = res6.data || [];
                }else {
                    that.$notify({ title: res6.msg, message: '', type: 'error', duration: 5000 });
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
                    that.$notify({ title: res7.msg, message: '', type: 'error', duration: 5000 });
                }
                if (res8.code === 200){  // 品牌(其它)
                    that.brandDataOther = res8.data || [];
                }else {
                    that.$notify({ title: res8.msg, message: '', type: 'error', duration: 5000 });
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
                    that.$notify({ title: res9.msg, message: '', type: 'error', duration: 5000 });
                }

                // 查看或者编辑
                if(that.operationTitle !== '新增产品' ){
                    // 获取详情
                    that.getProductDetailData();
                    that.getGoodsListData();
                    // 创建货物编号（产品子编号）
                    const params = { product_id:Number(that.$route.query.id)};
                    that.createGoodsCode(params); // 货物编码
                    that.createShelfCode(params); // 货架编码

                }else {
                    // 新增时 -- 品牌、标签下拉框赋值 为 布类型 数据
                    that.brandData = that.brandDataCloth;
                    that.labelData = that.labelDataCloth;
                    if(that.$route.query.pic_img){
                        that.completeImageUrl = that.$route.query.pic_img;
                        that.imageUrl = that.completeImageUrl + '!/fw/240';
                        that.bigImgUrl = that.completeImageUrl + '!/fw/640';
                    }
                }

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
            if(this.operationTitle !== '新增产品'){ // 查看或者编辑 (产品编码不改变)
                // 获取 货物编码
                this.goodsNum = Number(this.goodsNum + 1);
                let product_code = this.$route.query.code;
                const good_code = this.splicingGoodsCode(product_code,this.goodsNum);
                this.operationForm.goods.push({
                    product_code: good_code,
                    shelf_code: this.shelfCode,
                    stock_num:''
                });
            }else {  // 新增产品
                // 先判断产品编码 是否存在 如果产品编码存在获取货物码 否则 需要先获取产品编码
                if(this.operationForm.productCode){
                    let product_code = this.operationForm.productCode;
                    this.goodsNum = Number(this.goodsNum + 1);
                    const good_code = this.splicingGoodsCode(product_code,this.goodsNum);
                    this.operationForm.goods.push({
                        product_code: good_code,
                        shelf_code: this.shelfCode,
                        stock_num:''
                    });
                }else {
                    this.$notify({
                        title: '请先填写或选择产品信息',
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }
            }
        },
        // 按钮 - 删除单个货物
        removeSingleGood(item, index) {
            const del_goods = 'goods.' + index + '.stock_num';
            this.$refs.operationForm.clearValidate(del_goods);
            this.operationForm.goods.splice(index,1);
            this.reassignCode(); // 删除后 如果新增货物数大于 0 ，重新赋值货物编码
        },

        // 删除或者切换属性后 如果新增货物数大于 0 ，重新赋值货物编码
        reassignCode(){
            let product_code = '';
            if(this.operationTitle !== '新增产品'){
                product_code = this.$route.query.code;
                this.goodsNum = this.goodsCreatedNum;
            }else {
                product_code = this.operationForm.productCode;
                this.goodsNum = 0;
            }
            this.operationForm.goods.forEach((ev,i)=>{
                this.goodsNum = Number(this.goodsNum + 1);
                const new_good_code = this.splicingGoodsCode(product_code,this.goodsNum);
                this.$set(ev,'product_code',new_good_code); // 货物编码赋值
                this.$set(ev,'shelf_code',this.shelfCode);  // 货架编码赋值
            })
        },

        // 拼接货物编码
        splicingGoodsCode(product_code,num){
            if(num > 0 && num < 10){
                return product_code + '-00' + num;
            }else if(num > 9 && num < 99){
                return product_code + '-0' + num;
            }else {
                return product_code + '-' + num;
            }
        },

        //打印贴标
        handlePrintLabel() {
            this.$notify({
                title: '抱歉，功能未上线',
                message: '',
                type: 'error',
                duration: 5000
            });
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        //打印全部
        handlePrintSelectedKeys() {
            this.$notify({
                title: '抱歉，功能未上线',
                message: '',
                type: 'error',
                duration: 5000
            });
        },

        //打开修改库存弹出框
        handleEditStock(index, row) {
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
                        params['price_out'] = Number(this.operationForm.retailPrice);
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

                        if(this.add_goods.length > 0){
                        }
                        if(this.operationTitle === '新增产品'){
                            params['product_code'] = this.operationForm.productCode;
                            params['details'] = [];
                            this.add_goods.forEach((ev,index) =>{
                                let request = {};
                                request['price_in'] = 0;
                                request['shelf_code'] = ev.shelf_code;
                                request['detail_code'] = ev.product_code;
                                request['status'] = 0;
                                request['stock_total'] = Number(ev.stock_num);
                                params['details'].push(request);
                            });
                            this.addProduct(params);
                        }else if(this.operationTitle === '查看产品'){
                            //  请求添加货物
                            if(this.add_goods.length > 0){
                                this.addGoodsPost(Number(this.$route.query.id));
                            }

                        }else{
                            params['id'] = Number(this.$route.query.id);
                            this.editProduct(params);
                        }
                    }
                }else {
                    console.log('验证失败');
                }
            })
        },

        // 请求 - 添加货物（查看/编辑时使用）
        addGoodsPost(id){
            this.add_goods.forEach((ev,index) =>{
                let request = {};
                request['price_in'] = 0;
                request['product_id'] = id;
                request['status'] = 0;
                request['detail_code'] = ev.product_code;
                request['shelf_code'] = ev.shelf_code;
                request['stock_total'] = Number(ev.stock_num);
                let str = 'no_last';
                if(index === this.add_goods.length -1){
                    str = 'is_last'
                }
                this.addGoods(request,str);
                this.$set(this.operationForm, 'goods', []);
            });
        },
        // 请求 - 添加 产品
        addProduct(params){
            const rLoading = this.openLoading();
            getProductCreate(params)
                .then((res) => {
                    rLoading.close();
                    if (res.code === 200) {
                        if(this.$route.query.pic_id){
                            // 如果是从照片检测来的新增页 新增成功后需处理照片
                            this.handleNotProcess(Number(this.$route.query.pic_id));
                        }
                        this.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 5000
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
                                duration: 5000
                            });
                        }
                        // 刷新详情
                        this.getProductDetailData();
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
                        }else {
                            // 品牌、标签下拉框赋值 为 布类型 数据
                            this.brandData = this.brandDataCloth;
                            this.labelData = this.labelDataCloth;
                            labelDataAll = this.labelDataClothAll;
                        }
                        this.$set(this.operationForm,'name',res.data.name);
                        this.$set(this.operationForm,'category',res.data.category_id);
                        this.$set(this.operationForm,'company',res.data.attr_unit);
                        this.$set(this.operationForm,'retailPrice',res.data.price_out);
                        this.$set(this.operationForm,'brand',res.data.attr_brand);
                        this.$set(this.operationForm,'material',res.data.attr_material);
                        this.$set(this.operationForm,'color',res.data.attr_color);
                        this.$set(this.operationForm,'placeOfOrigin',res.data.attr_origin);
                        this.$set(this.operationForm,'size',res.data.attr_size);
                        this.$set(this.operationForm,'widthOfCloth',res.data.attr_width);
                        this.$set(this.operationForm,'img',res.data.img);
                        this.completeImageUrl = res.data.img;
                        this.imageUrl = res.data.img + '!/fw/240';
                        this.bigImgUrl = res.data.img + '!/fw/640';
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
        addGoods(params, str){
            const rLoading = this.openLoading();
            getGoodsCreate(params).then((res) => {
                rLoading.close();
                if (res.code === 200) {
                    if(str === 'is_last'){
                        this.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        });
                        setTimeout(()=>{
                            if(this.operationTitle === '新增产品'){
                                this.$router.push({path:'/product-list'});
                            }
                        },500);
                    }
                    this.getGoodsListData();
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

        //取消
        handleCloseGood(formName) {},

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

        // 获取当前日期的方法
        getProjectNum () {
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
            new_time = year + month + date + hh + mm + ss;
            return new_time;
        },

        // 切换产品种类（布/其它）
        chooseProductType(){
            this.$set(this.operationForm,'label',[]);
            this.$set(this.operationForm,'brand','');
            this.$set(this.operationForm,'productCode','');
            this.$set(this.operationForm,'goods',[]);
            if(this.operationForm.type > 0){
                this.brandData = this.brandDataOther;
                this.labelData = this.labelDataOther;
            }else {
                // 品牌、标签下拉框赋值 为 布类型 数据
                this.brandData = this.brandDataCloth;
                this.labelData = this.labelDataCloth;
            }
        },

        // 检测 基础属性改动 请求产品编码（只有新增时需要改动产品编码）
        selectChange(){
            if(this.operationTitle === '新增产品'){
                if(this.operationForm.type > 0){  // 产品类型为其它
                    if(this.operationForm.company && this.operationForm.brand){
                        this.createProductCode();
                    }
                }else {    // 产品类型为布
                    if(this.operationForm.company && this.operationForm.brand
                        && this.operationForm.placeOfOrigin && this.operationForm.material
                        && this.operationForm.color){
                        this.createProductCode();
                    }
                }
            }

        },

        // 创建 获取 产品编号/货架编号
        createProductCode(){
            let params = {};
            params['type'] = this.operationForm.type;
            params['attr_unit'] = Number(this.operationForm.company);           // 单位
            params['attr_brand'] = Number(this.operationForm.brand);            // 品牌
            if(this.operationForm.type > 0){  // 其它
                params['attr_material'] = -1;
                params['attr_origin'] = -1;
                params['attr_color'] = -1;
            }else {
                params['attr_origin'] = Number(this.operationForm.placeOfOrigin);   // 产地
                params['attr_material'] = Number(this.operationForm.material);      // 材料
                params['attr_color'] = Number(this.operationForm.color);            // 颜色
            }
            const rLoading = this.openLoading();
            getProductCodeCreate(params).then((res) => {
                rLoading.close();
                if (res.code === 200) {
                    this.shelfCode = res.data.shelf_code;
                    this.$set(this.operationForm,'productCode',res.data.product_code);
                    this.reassignCode();
                } else {
                    this.$notify({
                        title: '产品编码获取失败',
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }
            }).catch(() => {});
        },

        // 创建货物编号（产品子编号）
        createGoodsCode(params){
            params['type'] = this.operationForm.type;
            const rLoading = this.openLoading();
            getProductDetailCodeCreate(params).then((res) => {
                rLoading.close();
                if (res.code === 200) {
                    this.goodsCreatedNum = res.data.count;
                    this.goodsNum = res.data.count;
                } else {
                    this.$notify({
                        title: '货物编码获取失败',
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }
            }).catch(() => {});
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
        }
    }
};
</script>
<style>
</style>
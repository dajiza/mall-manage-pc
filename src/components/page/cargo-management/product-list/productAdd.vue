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
                                <el-radio-group v-model="operationForm.type"
                                                @change="chooseProductType">
                                    <el-radio :label="0">布</el-radio>
                                    <el-radio :label="1">其他</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <div class="form-item-special clearfix">
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
                        <el-form-item label="花纹:" v-if="operationForm.type === 0" prop="attr_pattern">
                            <el-select v-model="operationForm.attr_pattern" placeholder="请选择花纹" @change="selectChange">
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
                    <el-button type="success" v-hasPermission="'product-detail-add'" @click="handleAddGoods">添加</el-button>
                </div>
                <div class="add-goods-box clearfix" v-for="(item, index) in operationForm.goods" :key="index">
                    <el-form-item v-show="false" class="add-goods-item clearfix" label="货物编码:" label-width="75px"
                                  :prop="'goods.' + index + '.detail_code'">
                        <el-input v-model="item.detail_code" placeholder="请输入" :disabled="true"></el-input>
                    </el-form-item>
                    <el-form-item class="add-goods-item clearfix" label="货架编码:" label-width="75px"
                                  :prop="'goods.' + index + '.shelf_code'">
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
                    </div>
                </div>
            </el-form>
            <div class="operations">
                <el-button type="primary" :disabled="saveIsClick" v-hasPermission="'product-add'" @click="handleSaveGood('operationForm')">保存</el-button>
            </div>
        </div>
<!--        <div class="modal-img" v-show="dialogVisible" :class="{'w640':isBigImgOpen}">-->
<!--            <img :src="bigImgUrl" alt />-->
<!--        </div>-->
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
    import { pictureProcessing} from '../../../../api/photoDetection';
    import { getAllAttrList } from '../../../../api/configManagement';
    import { getCategoryList } from '../../../../api/productCategory';
    import { getLabelAllList } from '../../../../api/productLabel';
    import { getToken } from '../../../../utils/auth';
    import { getProductCodeCreate } from '../../../../api/createCode';
    import {
        getProductCreate,
        getProductDetail,
        getGoodsList,
    } from '../../../../api/productList';
    import QRCode from 'qrcodejs2';
    import { getShelfList } from '../../../../api/shelf';
    export default {
        name: 'productAdd',
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
                dialogVisible: false,
                isBigImgOpen: false,
                operationForm: {
                    type: 0,
                    name: '',
                    brand: '',
                    category: '',
                    placeOfOrigin: '',
                    color: '',
                    material: '',
                    widthOfCloth: 110,
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
                loading: false,
                imageUrl: '',  // 展示小图 （可访问，尺寸限制240）
                completeImageUrl:'',  // 完整图片url（可访问，不加尺寸限制）
                imgBaseUrl:'',    //   图片读取地址（存储）
                uploadImgUrl:'',  //   图片上传地址
                back_img_url:'',  //   上传后台返回图片地址（不完整）
                header:{},
                token:'',
                uploadingTip:{},
                bigImgUrl:'',
                bigImgShow: false,
                add_goods:[],
                goodsCreatedNum:0, // 已创建货物数量（从后台请求到的已存在货物数量）
                goodsNum:0, // 现有货物数量（包括已添加未保存）
                shelfCode:'',  // 货架编码
                productName:'',  // 产品名称
                cargoLabelInfo:[], // 货物标签列表
                shelf_list:[],   // 货架总列表
                available_shelf_list:[],  // 可用货架列表
                saveIsClick:false,
                imgSrcList:[],
                find_img:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAABDlBMVEUAAAAAAAAAAAAAAAAAAAAAAAAKCgoTExMgICAwMDAzMzM2NjY9PT1BQUFERERSUlJaWlpdXV1gYGBiYmJkZGRmZmZpaWlra2ttbW1xcXF0dHR7e3t+fn6KioqLi4uMjIyQkJCSkpKUlJSdnZ2goKCpqamqqqqxsbG5ubm6urq7u7vBwcHCwsLFxcXFxcXMzMzMzMzNzc3Pz8/T09PV1dXV1dXV1dXZ2dna2trb29vd3d3d3d3d3d3d3d3f39/f39/h4eHh4eHi4uLk5OTk5OTo6Ojp6enp6enq6urr6+vr6+vt7e3u7u7v7+/v7+/v7+/w8PDw8PDw8PDx8fHy8vLy8vLy8vLz8/Pz8/Pz8/MsxDGLAAAAWnRSTlMABiIuMDM0Njg7PD0/P0BER0dISUpLS0xNT09TU1laW1xeX2Nma2xyeXp7f4KDhIyNj4+Wl5iZn6Cjo6Smp6ipq6yvsbO6vL2/wMLHx8nKy8vMzc/Q0tPU1dZ5ywIkAAAB8UlEQVRYw+3W2VLbMBSAYSdBDiHY7IVCoGULaxuaxWylkAAmIWxJHMz//i/CRVqgYFEp1Q0z1o1njmY+yZZ1zrGsRDIlDAwrMSCMDCspDEEpU5CIoRiKoRj6EFB6sVj12516rbQ8+B+QW2zxNDreaJ9QervdI+6D3rO7k+kHcmoAZ1tzjhDZ2fVqCJyP60PTl8BJ7jkwtQfczOtCziUE+b9jS7dwN6kHpWvQzL2OTlyAP6QFbUOQexseu4aSDuS2IR81sRASzmhARTiJXrgMB+pQugW5aGgk4MFVhhbhTHbMu7CmDBVhSwbl4VAZqsKcDBqGhjLkgyO9Cx0CZajNvfx21iGrCkkWfdquqwpJFv2z3dBWhWowK3My0FT+RiVYl0ErcKQMLUNVBlVgQxka7BBOSX6jFnxSv7Qe7EVDBfilcftHu7AUNfG5C190EtsO3E5EJOAG7GtlyMw5XIy9cU6h6egl//EbuF549V4NoKxbjubvICyPvDivQheA77oFctIHgt3VYSGEyKxUWsDVT6n0TskeKoW9ol/3f9fufdf2ZNK7TcTMwcNzE8HxVyGEVPpHW+OuHTYCCJtHm9O9iExSabSy7su8IZH66NhsD/hmovWzPSgY6SHtyo+4PY6hGPrgUMoUlDQEDSSMQKlkwnoEIB3GBxprl2YAAAAASUVORK5CYII='
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
            this.operationTitle = '新增产品';
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
                // this.imageUrl = URL.createObjectURL(file.raw);
                this.uploadingTip.close();
                if(response.code === 200){
                    this.back_img_url = response.data.file_url;
                    this.completeImageUrl = response.data.file_url;
                    this.imageUrl = response.data.file_url + '!/fw/200';
                    this.bigImgUrl = response.data.file_url + '!/fw/640';
                    this.imgSrcList = [];
                    this.imgSrcList.push(this.bigImgUrl);
                }else {
                    this.$notify({ title: response.msg, message: '', type: 'error', duration: 3000 });
                }
            },

            // 上传失败
            uploadError(){
                this.uploadingTip.close();
                this.$notify({ title: '上传失败', message: '', type: 'error', duration: 3000 });
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
                        // that.$notify({ title: res1.msg, message: '', type: 'error', duration: 3000 });
                    }
                    if (res2.code === 200){  // 颜色
                        that.colorData = res2.data || [];
                    }else {
                        that.colorData = [];
                        if(res2.code === -1 && res2.msg.indexOf('无权限')> -1){
                            err_arr.push(res2.code);
                        }
                        // that.$notify({ title: res2.msg, message: '', type: 'error', duration: 3000 });
                    }
                    if (res3.code === 200){  // 产地
                        that.placeOfOriginData = res3.data || [];
                    }else {
                        that.placeOfOriginData = [];
                        // that.$notify({ title: res3.msg, message: '', type: 'error', duration: 3000 });
                    }
                    if (res4.code === 200){  // 单位
                        that.companyData = res4.data || [];
                    }else {
                        that.companyData = [];
                        // that.$notify({ title: res4.msg, message: '', type: 'error', duration: 3000 });
                    }
                    if (res5.code === 200){  // 材质(布)
                        that.materialData = res5.data || [];
                    }else {
                        that.materialData = [];
                        // that.$notify({ title: res5.msg, message: '', type: 'error', duration: 3000 });
                    }

                    if (res6.code === 200){  // 分类
                        that.categoryData = res6.data || [];
                    }else {
                        that.categoryData = [];
                        if(res6.code === -1 && res6.msg.indexOf('无权限')> -1){
                            err_arr.push(res6.code);
                        }
                        // that.$notify({ title: res6.msg, message: '', type: 'error', duration: 3000 });
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
                        // that.$notify({ title: res7.msg, message: '', type: 'error', duration: 3000 });
                    }
                    if (res8.code === 200){  // 品牌(其它)
                        that.brandDataOther = res8.data || [];
                    }else {
                        that.labelDataCloth = [];
                        // that.$notify({ title: res8.msg, message: '', type: 'error', duration: 3000 });
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
                        // that.$notify({ title: res9.msg, message: '', type: 'error', duration: 3000 });
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
                        // that.$notify({ title: res9.msg, message: '', type: 'error', duration: 3000 });
                    }
                    if (res11.code === 200){  // 花纹
                        that.patternData = res11.data || [];
                    }else {
                        that.patternData = [];
                    }
                    that.available_shelf_list = that.shelf_list.filter(value => (value.type === 0 && value.status === 0));
                    rLoading.close();
                    // 新增 -- 品牌、标签下拉框  默认赋值 为 布类型 数据
                    that.brandData = that.brandDataCloth;
                    that.labelData = that.labelDataCloth;
                    if(that.$route.query.pic_img){
                        that.completeImageUrl = that.$route.query.pic_img;
                        that.imageUrl = that.completeImageUrl + '!/fw/240';
                        that.bigImgUrl = that.completeImageUrl + '!/fw/640';
                        that.imgSrcList = [];
                        that.imgSrcList.push(that.bigImgUrl);
                    }
                    if(err_arr.length > 0){
                        that.$notify({ title: '下拉框权限不足，请联系管理员添加', message: '', type: 'error', duration: 5000 });
                    }
                })).catch((err)=>{});
            },

            // 图片上传前检测
            beforeAvatarUpload(file) {
                if(file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg'){
                    this.uploadingTip = this.uploadLoading('上传中');
                }else {
                    this.$notify({
                        title: '图片格式只支持JPG、PNG',
                        message: '',
                        type: 'error',
                        duration: 3000
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

            // 查看大图
            viewBigImg(){
                this.dialogVisible = true;
            },

            // 关闭大图
            closeViewer(){
                this.dialogVisible = false;
            },

            // 按钮 - 添加货物
            handleAddGoods() {
                // 新增产品
                // 获取货架编码的必要信息是否填写
                let flag1 = false;
                if(this.operationForm.type > 0){  // 产品类型为其它
                    if(this.operationForm.company && this.operationForm.brand){
                        flag1 = true;
                    }
                }else {    // 产品类型为布
                    if(this.operationForm.company && this.operationForm.brand && this.operationForm.placeOfOrigin
                        && this.operationForm.material && this.operationForm.color){
                        flag1 = true;
                    }
                }
                // 先判断货架编码 是否存在 如果货架编码存在继续 否则 需要先获取货架编码(添加货架)
                if(this.shelfCode){
                    this.goodsNum = Number(this.goodsNum + 1);
                    this.operationForm.goods.push({
                        shelf_code: this.shelfCode,
                        stock_num:''
                    });
                }else {
                    let tipText = '';
                    if(flag1){
                        tipText = '暂无可用货架，请先添加货架';
                    }else {
                        tipText = '请先填写或选择产品信息';
                    }
                    this.$notify({
                        title: tipText,
                        message: '',
                        type: 'error',
                        duration: 3000
                    });
                }
            },

            // 按钮 - 删除单个货物
            removeSingleGood(item, index) {
                const del_goods = 'goods.' + index + '.stock_num';
                this.$refs.operationForm.clearValidate(del_goods);
                this.operationForm.goods.splice(index,1);
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
                                duration: 3000
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
                            // 新增产品
                            params['details'] = [];
                            this.add_goods.forEach((ev,index) =>{
                                let request = {};
                                request['price_in'] = 0;
                                request['shelf_code'] = ev.shelf_code;
                                request['detail_code'] = ev.detail_code;
                                request['status'] = 0;
                                request['stock_total'] = Number(ev.stock_num);
                                params['details'].push(request);
                            });
                            this.saveIsClick = true;
                            this.addProduct(params);
                        }
                    }else {
                        console.log('验证失败');
                    }
                })
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
                                duration: 3000
                            });
                            this.saveIsClick = false;
                            this.closeSpecifyPage('新增产品');
                            this.$router.push({path:'/product-list'});
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

            // 切换产品种类（布/其它）
            chooseProductType(){
                this.$set(this.operationForm,'label',[]);
                this.$set(this.operationForm,'brand','');
                this.$set(this.operationForm,'goods',[]);
                if(this.operationForm.type > 0){
                    this.brandData = this.brandDataOther;
                    this.labelData = this.labelDataOther;
                    this.available_shelf_list = this.shelf_list.filter(value => (value.type === 1 && value.status === 0));
                }else {
                    // 品牌、标签下拉框赋值 为 布类型 数据
                    this.brandData = this.brandDataCloth;
                    this.labelData = this.labelDataCloth;
                    this.available_shelf_list = this.shelf_list.filter(value => (value.type === 0 && value.status === 0));
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
                    width: 180,
                    height: 180,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                })
            },

            // 关闭当前页面
            closePage(){
                const tagsArr = document.getElementsByClassName('tags-li');
                let currentTags;
                for(let i = 0; i < tagsArr.length; i++ ){
                    if  (tagsArr[i].className.indexOf( 'active' ) > -1) {
                        currentTags = tagsArr[i];
                    }
                }
                const closeDom = currentTags.getElementsByClassName('el-icon-close')[0];
                // IE
                if(document.all) {
                    closeDom.click();
                }
                // 其它浏览器
                else {
                    var e = document.createEvent("MouseEvents");
                    e.initEvent("click", true, true);
                    closeDom.dispatchEvent(e);
                }
            },

            // 关闭指定标题页面
            closeSpecifyPage(close_str){
                const tagsArr = document.getElementsByClassName('tags-li');
                let currentTags;
                for(let i = 0; i < tagsArr.length; i++ ){
                    if  (tagsArr[i].textContent.indexOf(close_str) > -1) {
                        currentTags = tagsArr[i];
                    }
                }
                const closeDom = currentTags.getElementsByClassName('el-icon-close')[0];
                // IE
                if(document.all) {
                    closeDom.click();
                }
                // 其它浏览器
                else {
                    var e = document.createEvent("MouseEvents");
                    e.initEvent("click", true, true);
                    closeDom.dispatchEvent(e);
                }
            },
        }
    };
</script>

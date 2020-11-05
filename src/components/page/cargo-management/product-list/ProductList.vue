<template>
    <div class="product-contain"> <!--container-wrap-->
        <div class="container clearfix " ref="searchBox">
            <el-form :model="searchForm" :inline="true" ref="searchForm" class="search-box">
                <div class="search-item-box">
                    <el-form-item label="名称：" prop="name">
                        <el-input v-model="searchForm.name" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="编码：" prop="name">
                        <el-input v-model="searchForm.product_code" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="分类：" prop="category">
                        <el-select
                                v-model="searchForm.category"
                                placeholder="请选择"
                                class="handle-select"
                        >
                            <el-option v-for="state in categoryOptions" style="width: 200px!important;"
                                       :key="state.id" :value="state.id" :label="state.name"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="标签：" prop="label" class="tags-wrap margin-right0">
                        <el-cascader
                                v-model="searchForm.label"
                                placeholder="请选择"
                                :options="labelOptions"
                                :show-all-levels="false"
                                :props="{ multiple: true, label:'name', value:'id' }"
                                filterable
                        ></el-cascader>
                        <!--<el-input placeholder="请选择" v-show="searchForm.label.length < 1"
                                  @focus="openTags"
                        ></el-input>
                        <div class="">
                            <div class="add-label">+ 标签</div>
                        </div>
                        <div class="tags-box" v-show="labelShow">
                            <el-cascader-panel
                                    v-model="searchForm.label"
                                    filterable
                                    :options="labelOptions" :props="{ multiple: true, label:'name', value:'id' }">
                            </el-cascader-panel>
                        </div>-->

                    </el-form-item>
                </div>
                <div class="search-item-box">
                    <el-form-item label="类型：" prop="product_type" class="">
                        <el-select v-model="searchForm.product_type" placeholder="请选择" @change="selectType">
                            <el-option
                                    v-for="state in productTypeOptions"
                                    :key="state.id"
                                    :value="state.id"
                                    :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="出售状态：" prop="sale_status" class="sale-status">
                        <el-select v-model="searchForm.sale_status" placeholder="请选择">
                            <el-option
                                    v-for="state in saleStatusOptions"
                                    :key="state.id"
                                    :value="state.id"
                                    :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="产地：" prop="placeOfOrigin" class="">
                        <el-select v-model="searchForm.placeOfOrigin" :disabled="searchForm.product_type === 1" placeholder="请选择">
                            <el-option
                                    v-for="state in placeOfOriginData"
                                    :key="state.id"
                                    :value="state.id"
                                    :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="颜色：" prop="color" class="margin-right0">
                        <el-select v-model="searchForm.color" :disabled="searchForm.product_type === 1" placeholder="请选择">
                            <el-option
                                    v-for="state in colorData"
                                    :key="state.id"
                                    :value="state.id"
                                    :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                </div>
                <div class="search-item-box">
                    <el-form-item label="品牌：" prop="brand">
                        <el-select v-model="searchForm.brand" placeholder="请选择">
                            <el-option
                                    v-for="state in brandData"
                                    :key="state.id"
                                    :value="state.id"
                                    :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="材质：" prop="material" class="">
                        <el-select v-model="searchForm.material" :disabled="searchForm.product_type === 1" placeholder="请选择">
                            <el-option
                                    v-for="state in materialData"
                                    :key="state.id"
                                    :value="state.id"
                                    :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="花纹：" prop="attr_pattern" class="margin-right0">
                        <el-select v-model="searchForm.attr_pattern" :disabled="searchForm.product_type === 1" placeholder="请选择">
                            <el-option
                                    v-for="state in patternData"
                                    :key="state.id"
                                    :value="state.id"
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
        <div class="container m-t-16 p-t-0 container-table-has-search table-has-img pos-relative">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>产品列表</span>
                </div>
                <div class="locking-add">
                    <div class="locking-product-list" v-hasPermission="'product-lock-list'" @click="handleInLockingProductList">
                        <img src="../../../../assets/img/locking.svg" alt />
                        <span>锁定产品列表</span>
                    </div>
                    <el-button type="primary" @click="addPage" v-hasPermission="'product-add'">新增产品</el-button>
                </div>
            </div>
            <el-table
                v-loading="loading"
                :data="tableData"
                ref="multipleTable"
                tooltip-effect="dark"
            >
                <el-table-column label="编号" width="95" align="left" type="index">
                    <template scope="scope">
                        <span>{{(pageInfo.pageIndex - 1) * pageInfo.pageSize + scope.$index + 1}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="图片" width="110">
                    <template slot-scope="scope">
                        <img class="product-img" :src="getImg(scope.row.img)" alt="" @click="viewBigImg(scope.row.img)">
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="产品名称" width="200"></el-table-column>
                <el-table-column prop="product_code" label="产品编码" width="140"></el-table-column>
                <el-table-column prop="category_id" label="分类" width="110">
                    <template scope="scope">
                        <span>{{getCategoryName(scope.row.category_id)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="tag_names" label="标签" width="154">
                    <template scope="scope">
                        <span>{{getTags(scope.row.tag_names)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="stock_total" label="总库存"></el-table-column>
                <el-table-column prop="stock_available" label="可用库存"></el-table-column>
                <el-table-column prop="status" label="是否可出售" width="100">
                    <template scope="scope">
                        <span
                                class="status-ball"
                                :class="scope.row.status===0?'color-success':'color-err'"
                        ></span>
                        <span
                                :class="scope.row.status ===  0 ? 'font-use' : 'font-stop'"
                        >{{scope.row.status === 0 ? '可出售' : '不可出售'}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="280">
                    <template slot-scope="scope">
                        <el-button type="text" class="marginRight32" v-hasPermission="'product-update'"
                            @click="handleEdit(scope.$index, scope.row,'edit')"
                        >编辑</el-button>
                        <el-button type="text" class="marginLeft0 marginRight32" v-hasPermission="'view-product-goods'"
                                   @click="handleEdit(scope.$index, scope.row,'view')"
                        >货物</el-button>
                        <el-button type="text" class="marginLeft0 marginRight32" v-hasPermission="'product-lock'"
                                   :disabled="scope.row.stock_available < 1"
                                   @click="handleLock(scope.$index, scope.row)">锁定</el-button>
                        <el-button type="text" v-if="scope.row.status === 0" class="marginLeft0 delete-color"  v-hasPermission="'product-hide'"
                                   @click="handleProductHide(scope.$index, scope.row)">不可出售</el-button>
                        <el-button type="text" v-if="scope.row.status !== 0" class="marginLeft0"  v-hasPermission="'product-hide-free'"
                                   @click="handleProductHide(scope.$index, scope.row)">解锁出售</el-button>
                    </template>
                </el-table-column>
                <template slot="empty">
                    <EmptyList v-show="false"></EmptyList>
                </template>
            </el-table>
            <div class="pagination pos-relative">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="pageInfo.pageIndex"
                    :page-size="pageInfo.pageSize"
                    :total="pageInfo.pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
            <div class="empty-list-box" v-show="tableData.length === 0">
                <EmptyList></EmptyList>
            </div>
        </div>

        <!--锁定产品弹出框 lockingDialog -->
        <el-dialog title="锁定产品" :visible.sync="lockingVisible"
                   custom-class="locking-dialog"
                   width="420px"
                   :before-close="lockingClose"
                   :destroy-on-close="true"
                   :close-on-click-modal="false">
            <el-form ref="lockingDialogBox" :model="lockingDialogForm" :rules="lockingFormRules"
                     label-width="90px" label-position="left">
                <el-form-item label="锁定类型" prop="type">
                    <el-radio-group v-model="lockingDialogForm.type">
                        <el-radio :label="0">按数量锁定</el-radio>
                        <el-radio :label="1">全部</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="锁定数量:" v-if="lockingDialogForm.type < 1" prop="lock_num">
                    <el-input v-model.number="lockingDialogForm.lock_num" placeholder="请输入" @mousewheel.native.prevent
                              @input="lock_num_change"
                    >
                        <template slot="append">{{unit_name}}</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="锁定理由:" prop="reason">
                    <el-select v-model="lockingDialogForm.reason" placeholder="请选择">
                        <el-option v-for="item in reasonOptions" style="width: 260px"
                                   :key="item.id" :value="item.id" :label="item.name"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注:" prop="remark">
                    <el-input
                            type="textarea"
                            placeholder="请输入"
                            :autosize="{minRows: 4,maxRows: 10}"
                            v-model="lockingDialogForm.remark"
                    ></el-input>
                </el-form-item>
                <el-form-item label="截止时间:" prop="end_time">
                    <el-date-picker
                            v-model="lockingDialogForm.end_time"
                            type="datetime"
                            placeholder="选择时间"
                            :picker-options="pickerOptions"
                            format="yyyy-MM-dd HH:mm:ss"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            default-time="00:00:00">
                    </el-date-picker>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="lockingClose">取 消</el-button>
                <el-button type="primary" v-hasPermission="'product-lock'" @click="handleSureLock">确 定</el-button>
            </span>
        </el-dialog>
        <!--放大图片-->
        <!--<transition name="el-fade-in-linear">
            <BigImg ref="bigImg" :imgUrl="bigImgUrl"></BigImg>
        </transition>-->

        <!--大图预览-->
        <transition name="el-fade-in-linear">
            <el-image-viewer
                    v-if="dialogVisible"
                    :on-close="closeViewer"
                    :url-list="imgSrcList" />
        </transition>


    </div>
</template>

<script>
import { getProductList, getProductLock, getProductHide, getProductHideFree } from '../../../../api/productList';
import {getCategoryList} from '../../../../api/productCategory';
import './ProductList.less';
import { getLabelAllList } from '../../../../api/productLabel';
import { getAllAttrList, getReasonAllList } from '../../../../api/configManagement';
import BigImg from '../../../common/big-img/BigImg';
import EmptyList from '../../../common/empty-list/EmptyList';
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'

export default {
    name: 'productList',
    data() {
        var checkLockNum = (rule, value, callback) => {
            if (!value) {
                return callback(new Error('请输入锁定数量'));
            }
            setTimeout(() => {
                if (!Number.isInteger(value)) {
                    callback(new Error('请输入数字值'));
                } else {
                    if (value > this.lock_all_num) {
                        callback(new Error('锁定数量不可大于可用库存'+ this.lock_all_num));
                    } else {
                        callback();
                    }
                }
            }, 10);
        };
        var checkReason = (rule, value, callback) => {
            if (!value) {
                return callback(new Error('请选择锁定理由'));
            }else {
                callback();
            }
        };
        var checkTime = (rule, value, callback) => {
            if (!value) {
                return callback(new Error('请选择截止时间'));
            }else {
                callback();
            }
        };
        return {
            pageInfo: {
                pageIndex: 1,
                pageSize: 10,
                pageTotal: 0
            },
            searchForm: {
                name: '',
                category: '',
                label: [],
                sale_status:'',
                product_type:'',
                product_code:'',
                brand:'',          // 品牌
                placeOfOrigin:'',  // 产地
                color:'',          // 颜色
                material:'',       // 材质
                attr_pattern:''    // 花纹
            },
            searchParams:{
                name:'',
                category_id: '',
                tag_ids:[],
                product_type: -1,
                sale_status: -1,
                product_code:'',
                brand: 0,          // 品牌
                placeOfOrigin: 0,  // 产地
                color: 0,          // 颜色
                material: 0,       // 材质
                attr_pattern: 0    // 花纹
            },  // 已搜索参数
            loading: false,
            tableData: [],
            delList: [],
            categoryOptions: [],
            labelOptions: [],  // 标签下拉列表
            labelCloth:[],     // 标签(布)列表
            labelOther:[],     // 标签(其它)列表
            labelAll:[],       // 标签(布和其它)列表
            tableHeight: 'calc(100% - 134px)',
            categoryList:[],
            reasonOptions:[], // 锁定原因下拉框数据
            lockingDialogForm:{
                type:0,
                lock_num:'',
                reason:'',
                remark:'',
                end_time:''
            },
            lockingFormRules:{
                lock_num: [
                    { validator: checkLockNum, trigger: 'blur' }
                ],
                remark:[
                    { max: 200, message: '最多可输入200位', trigger: 'blur' }
                ],
                reason:[
                    { validator: checkReason, trigger: 'blur' }
                ],
                end_time:[
                    { validator: checkTime, trigger: 'blur' }
                ]
            },
            lock_product_id:-1,
            lockingVisible:false,
            lock_all_num:0,
            pickerOptions: {
                disabledDate: (time) => {
                    // return time.getTime() < Date.now();
                }
            },
            // selectedLabel:[
            //     [1,1],
            //     [2,5]
            // ],
            labelShow:false,
            bigImgUrl:'',  // 需要放大图片url
            imgBaseUrl:'',
            saleStatusOptions:[
                {id:0,name:'可出售'},
                {id:1,name:'不可出售'},
                {id:2,name:'预售'},
            ],
            productTypeOptions:[
                {id:0,name:'布'},
                {id:1,name:'其它'},
            ],
            unit_name:'',
            brandData: [],          // 品牌下拉列表
            brandDataCloth: [],     // 品牌下拉列表（布）
            brandDataOther: [],     // 品牌下拉列表（其它）
            placeOfOriginData: [],  // 产地下拉列表
            colorData: [],          // 颜色下拉列表
            patternData: [],        // 花纹下拉列表
            materialData: [],       // 材质下拉列表
            materialDataCloth: [],       // 材质下拉列表（布）
            materialDataOther: [],       // 材质下拉列表（其它）
            materialDataAll:[],          // 材质总
            brandDataAll:[],             // 品牌总
            imgSrcList:[],
            dialogVisible:false
        };
    },
    components: {
        EmptyList,
        BigImg,
        ElImageViewer
    },
    created() {
        this.imgBaseUrl = localStorage.getItem('sys_upyun_source_url');
        this.getAllAttr();
        /*
        * 待优化：
        * 判断缓存有无 页码和搜索信息 有的话 赋值给 当前页码和搜索条件 请求分类和标签成功后 请求列表数据
        * */
    },
    mounted() {},
    computed: {
        //  拼接图片地址
        getImg: function () {
            return (data) => {
                if(data){
                    return data + '!/fw/' + 80;
                }
            }
        },
        getCategoryName: function () {
            return (data) =>{
                let category_name = '';
                this.categoryList.forEach((ev)=>{
                    if(ev.id === data){
                        category_name = ev.name;
                    }
                })
                return category_name;
            }
        },
        getTags: function () {
            return (data) =>{
                let tags = '';
                if(data){
                    tags = data.join('、');
                }
                return tags;
            }
        },
    },
    methods: {
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
            // 最终输出
            return data;
        },

        // 时间格式化
        getTime(val){
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
                return '-1'
            }
        },

        // 获取 - 产品列表
        getProductList() {
            let tag_arr = [];
            if(this.searchParams.tag_ids.length > 0){
                this.searchParams.tag_ids.forEach(ev=>{
                    tag_arr.push(ev[1]);
                })
            }
            const params ={
                name: this.searchParams.name || '',
                category_id: this.searchParams.category_id || -1,
                tag_ids: tag_arr,
                type: this.searchParams.product_type,
                product_code: this.searchParams.product_code,
                status: this.searchParams.sale_status,
                attr_brand: this.searchParams.brand,
                attr_color: this.searchParams.color,
                attr_material: this.searchParams.material,
                attr_origin: this.searchParams.placeOfOrigin,
                attr_pattern: this.searchParams.attr_pattern,
                attr_unit: 0,
                limit:this.pageInfo.pageSize,
                page:this.pageInfo.pageIndex
            }
            const rLoading = this.openLoading();
            getProductList(params).then((res) => {
                rLoading.close();
                if (res.code === 200){
                    this.tableData = res.data.list || [];
                    this.$set(this.pageInfo, 'pageTotal', res.data.total);
                }else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }
            }).catch((err)=>{});
        },

        // 按钮-重置
        resetForm(formName) {
            this.$refs[formName].resetFields();
            this.$set(this.pageInfo, 'pageIndex', 1);
            this.$set(this.searchParams,'name', '');
            this.$set(this.searchParams,'category_id', -1);
            this.$set(this.searchParams,'tag_ids', []);
            this.$set(this.searchParams,'sale_status', '');
            this.$set(this.searchParams,'product_type', -1);
            this.$set(this.searchParams,'product_code', '');
            this.$set(this.searchParams,'brand', 0);
            this.$set(this.searchParams,'color', 0);
            this.$set(this.searchParams,'material', 0);
            this.$set(this.searchParams,'placeOfOrigin', 0);
            this.$set(this.searchParams,'attr_pattern', 0);
            this.labelOptions = this.labelAll;
            this.brandData = this.brandDataAll;
            this.materialData = this.materialDataAll;
            this.getProductList();
        },

        // 按钮-触发搜索按钮
        handleSearch(formName) {
            this.$set(this.pageInfo, 'pageIndex', 1);
            this.$set(this.searchParams,'name', this.searchForm.name);
            this.$set(this.searchParams,'category_id', this.searchForm.category);
            if(this.searchForm.product_type === ''){
                this.$set(this.searchParams,'product_type',-1);
            }else {
                this.$set(this.searchParams,'product_type',this.searchForm.product_type);
            }
            if(this.searchForm.sale_status === ''){
                this.$set(this.searchParams,'sale_status',-1);
            }else {
                this.$set(this.searchParams,'sale_status',this.searchForm.sale_status);
            }
            if(this.searchForm.brand){
                this.$set(this.searchParams,'brand',this.searchForm.brand);
            }
            if(this.searchForm.color){
                this.$set(this.searchParams,'color',this.searchForm.color);
            }
            if(this.searchForm.material){
                this.$set(this.searchParams,'material',this.searchForm.material);
            }
            if(this.searchForm.placeOfOrigin){
                this.$set(this.searchParams,'placeOfOrigin',this.searchForm.placeOfOrigin);
            }
            if(this.searchForm.attr_pattern){
                this.$set(this.searchParams,'attr_pattern',this.searchForm.attr_pattern);
            }
            this.$set(this.searchParams,'tag_ids', this.searchForm.label);
            this.$set(this.searchParams,'product_code', this.searchForm.product_code);
            this.getProductList();
        },

        // 跳转到添加页面
        addPage() {
            this.$router.push({ path: '/product-add' });
        },

        // 编辑操作/查看操作
        handleEdit(index, row, status) {
            this.$router.push({ path: status === 'edit' ? '/product-update' : '/view-product-goods',
                query: { id: row.id, code: row.product_code, status } });
        },

        // 记录当前搜索内容及页码(模拟缓存)
        saveSearchInfo(){
            sessionStorage.setItem('productSearchParams', JSON.stringify(this.searchParams));
            sessionStorage.setItem('productListPage', this.pageInfo.pageIndex);
        },

        // 分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val);
            if (this.searchParams['name']) {
                this.$set(this.searchForm, 'name', this.searchParams['name']);
            }
            if (this.searchParams['product_code']) {
                this.$set(this.searchForm, 'product_code', this.searchParams['product_code']);
            }
            if (this.searchParams['product_type'] === -1) {
                this.$set(this.searchForm, 'product_type', '');
            }else {
                this.$set(this.searchForm, 'product_type', this.searchParams['product_type']);
            }
            if (this.searchParams['sale_status'] === -1) {
                this.$set(this.searchForm, 'sale_status', '');
            }else {
                this.$set(this.searchForm, 'sale_status', this.searchParams['sale_status']);
            }
            if (this.searchParams['category_id']) {
                this.$set(this.searchForm, 'category_id', this.searchParams['category_id']);
            }
            if (this.searchParams['tag_ids']) {
                this.$set(this.searchForm, 'label', this.searchParams['tag_ids']);
            }
            if (this.searchParams['brand']) {
                this.$set(this.searchForm, 'brand', this.searchParams['brand']);
            }
            if (this.searchParams['color']) {
                this.$set(this.searchForm, 'color', this.searchParams['color']);
            }
            if(this.searchParams['attr_pattern']){
                this.$set(this.searchForm,'attr_pattern',this.searchParams['attr_pattern']);
            }
            if (this.searchParams['material']) {
                this.$set(this.searchForm, 'material', this.searchParams['material']);
            }
            if (this.searchParams['placeOfOrigin']) {
                this.$set(this.searchForm, 'placeOfOrigin', this.searchParams['placeOfOrigin']);
            }
            this.getProductList();
        },

        //切换锁定产品列表界面
        handleInLockingProductList(){
            this.$router.push({path:'/product-lock-list'})
        },

        // 关闭锁定弹框
        lockingClose(){
            this.$refs['lockingDialogBox'].resetFields();
            this.$refs['lockingDialogBox'].clearValidate();
            this.lockingVisible = false;
        },

        // 按钮 - 锁定
        handleLock(index,row){
            // 判断是否有可用库存
            this.unit_name = row.attr_unit_name;
            if(row.stock_available > 0){
                this.lock_all_num = row.stock_available;
                this.lock_product_id = row.id;
                const params = {type:1};
                const rLoading = this.openLoading();
                // 请求锁定理由列表
                getReasonAllList(params).then((res) => {
                    rLoading.close();
                    if (res.code === 200) {
                        this.lockingVisible = true;
                        this.reasonOptions = res.data || [];
                    } else {
                        this.$notify({ title: res.msg, message: '', type: 'error', duration: 3000 });
                    }
                }).catch(() => {});
            }else {
                this.$notify({
                    title: '可用库存不足，无法锁定',
                    message: '',
                    type: 'error',
                    duration: 5000
                });
            }
        },

        // 按钮 - 确定锁定
        handleSureLock(){
            // 成功后
            this.$refs['lockingDialogBox'].validate((valid) => {
                if (valid) {
                    let params = {};
                    params['product_id'] = this.lock_product_id;
                    params['remark'] = this.lockingDialogForm.remark;
                    params['end_time'] = this.lockingDialogForm.end_time;
                    params['reason_id'] = Number(this.lockingDialogForm.reason);
                    if(this.lockingDialogForm.type < 1){   // 按数量锁定
                        params['num'] = Number(this.lockingDialogForm.lock_num);
                    }else {   // 全部锁定
                        params['num'] = this.lock_all_num;
                    }
                    this.productLockOfNum(params);

                }else {
                    console.log('验证不通过');
                }
            })
        },

        // 按钮-隐藏产品/取消隐藏产品
        handleProductHide(index, row) {
            const params = { product_id:row.id, remark:'' };
            if(row.status > 0){ // 请求 - 取消隐藏
                const rLoading = this.openLoading();
                getProductHideFree(params).then((res) => {
                    rLoading.close();
                    if (res.code === 200) {
                        this.$notify({ title: '操作成功', message: '', type: 'success', duration: 3000 });
                        this.getProductList();
                    } else {
                        this.$notify({ title: res.msg, message: '', type: 'error', duration: 5000 });
                    }
                }).catch(() => {});
            }else { // 请求 - 隐藏
                // 二次确认
                this.$confirm('确定将该产品设为不可出售吗？', '', {
                    customClass: 'message-delete',
                    type: 'warning',
                    center: true
                }).then(() => {
                    const rLoading = this.openLoading();
                    getProductHide(params).then((res) => {
                        rLoading.close();
                        if (res.code === 200) {
                            this.$notify({ title: '操作成功', message: '', type: 'success', duration: 3000 });
                            this.getProductList();
                        } else {
                            this.$notify({ title: res.msg, message: '', type: 'error', duration: 5000 });
                        }
                    }).catch(() => {});
                }).catch(() => {});
            }

        },

        // 手动按数量锁定产品
        productLockOfNum(params){
            const rLoading = this.openLoading();
            getProductLock(params).then((res) => {
                rLoading.close();
                if (res.code === 200) {
                    // 如果当前页大于1 且 当前页只有1条时  删除后 页码-1
                    // if(this.pageInfo.pageIndex > 1 && this.tableData.length < 2){
                    //     this.$set(this.pageInfo, 'pageIndex', this.pageInfo.pageIndex - 1);
                    // }
                    this.$notify({ title: '锁定成功', message: '', type: 'success', duration: 3000 });
                    this.lockingVisible = false;
                    this.getProductList();
                } else {
                    this.$notify({ title: res.msg, message: '', type: 'error', duration: 5000 });
                }
            }).catch(() => {});
        },

        // 锁定数量改变
        lock_num_change(){
            if(this.lockingDialogForm.lock_num > this.lock_all_num){
                this.$set(this.lockingDialogForm,'lock_num',this.lock_all_num);
            }
        },

        openTags(){
            console.log('openTags');
            this.labelShow = true;
        },
        // 查看大图
        viewBigImg(pic_url){
            if(pic_url){
                if(pic_url.indexOf('http') === -1){
                    this.bigImgUrl =  this.imgBaseUrl + pic_url + '!/fw/640';
                }else {
                    this.bigImgUrl =  pic_url + '!/fw/640';
                }
                // this.$refs.bigImg.show();
                this.imgSrcList = [];
                this.imgSrcList.push(this.bigImgUrl);
                this.dialogVisible = true;
            }
        },

        // 获取所有搜索用到的数据
        getAllAttr(){
            const that = this;
            const labelClothParams = {
                category_id: -1,
                name:'-1',
                type:0
            };
            const labelOtherParams = {
                category_id: -1,
                name:'-1',
                type:1
            };
            const rLoading = that.openLoading();
            // 获取 产品分类、产品标签（布）、产品标签（其它）
            this.$ajax.all([
                getCategoryList({}),
                getLabelAllList(labelClothParams),
                getLabelAllList(labelOtherParams),
                getAllAttrList({type:1,category:1}),
                getAllAttrList({type:2}),
                getAllAttrList({type:3}),
                getAllAttrList({type:5,category:1}),
                getAllAttrList({type:5,category:2}),
                getAllAttrList({type:1,category:2}),
                getAllAttrList({type:6}),
            ]).then(that.$ajax.spread(function(res1, res2, res3,res4,res5,res6,res7,res8,res9,res10) {
                let label_cloth = [];
                let label_other = [];
                let err_arr = [];
                if (res1.code === 200){  // 产品分类
                    that.categoryList = res1.data || [];
                    that.categoryOptions = that.categoryList;
                }else {
                    if(res1.code === -1 && res1.msg.indexOf('无权限')> -1){
                        err_arr.push(res1.code);
                    }
                    // that.$notify({ title: res1.msg, message: '', type: 'error', duration: 3000 });
                }
                if (res2.code === 200){  // 产品标签（布）
                    label_cloth = res2.data || [];
                    that.labelCloth = that.handlerData(label_cloth);
                }else {
                    if(res2.code === -1 && res2.msg.indexOf('无权限')> -1){
                        err_arr.push(res2.code);
                    }
                    // that.$notify({ title: res2.msg, message: '', type: 'error', duration: 3000 });
                }
                if (res3.code === 200){  // 产品标签（其它）
                    label_other = res3.data || [];
                    that.labelOther = that.handlerData(label_other);
                }else {
                    if(res3.code === -1 && res3.msg.indexOf('无权限')> -1){
                        err_arr.push(res3.code);
                    }
                    // that.$notify({ title: res3.msg, message: '', type: 'error', duration: 3000 });
                }
                if (res4.code === 200){  // 品牌(布)
                    that.brandDataCloth = res4.data || [];
                }else {
                    if(res4.code === -1 && res4.msg.indexOf('无权限')> -1){
                        err_arr.push(res4.code);
                    }
                    // that.$notify({ title: res4.msg, message: '', type: 'error', duration: 5000 });
                }
                if (res5.code === 200){  // 颜色
                    that.colorData = res5.data || [];
                }else {
                    if(res5.code === -1 && res5.msg.indexOf('无权限')> -1){
                        err_arr.push(res5.code);
                    }
                    // that.$notify({ title: res5.msg, message: '', type: 'error', duration: 5000 });
                }
                if (res6.code === 200){  // 产地
                    that.placeOfOriginData = res6.data || [];
                }else {
                    if(res6.code === -1 && res6.msg.indexOf('无权限')> -1){
                        err_arr.push(res6.code);
                    }
                    // that.$notify({ title: res6.msg, message: '', type: 'error', duration: 5000 });
                }
                if (res7.code === 200){  // 材质（布）
                    that.materialDataCloth = res7.data || [];
                }else {
                    if(res7.code === -1 && res7.msg.indexOf('无权限')> -1){
                        err_arr.push(res7.code);
                    }
                    // that.$notify({ title: res7.msg, message: '', type: 'error', duration: 5000 });
                }
                if (res8.code === 200){  // 材质（其它）
                    that.materialDataOther = res8.data || [];
                }else {
                    if(res8.code === -1 && res8.msg.indexOf('无权限')> -1){
                        err_arr.push(res8.code);
                    }
                    // that.$notify({ title: res8.msg, message: '', type: 'error', duration: 5000 });
                }
                if (res9.code === 200){  // 品牌(其它)
                    that.brandDataOther = res9.data || [];
                }else {
                    if(res9.code === -1 && res9.msg.indexOf('无权限')> -1){
                        err_arr.push(res9.code);
                    }
                    // that.$notify({ title: res9.msg, message: '', type: 'error', duration: 5000 });
                }
                if (res10.code === 200){  // 花纹
                    that.patternData = res10.data || [];
                }else {
                    if(res10.code === -1 && res10.msg.indexOf('无权限')> -1){
                        err_arr.push(res10.code);
                    }
                }
                // patternData
                const label_all = label_cloth.concat(label_other);
                that.labelAll = that.handlerData(label_all);
                that.brandDataAll = that.brandDataCloth.concat(that.brandDataOther);
                that.materialDataAll = that.materialDataCloth.concat(that.materialDataOther);
                that.labelOptions = that.labelAll;
                that.brandData = that.brandDataAll;
                that.materialData = that.materialDataAll;
                rLoading.close();
                // 获取产品列表
                that.getProductList();
                if(err_arr.length > 0){
                    that.$notify({ title: '产品列表搜索条件权限不足，请联系管理员添加', message: '', type: 'error', duration: 5000 });
                }
            })).catch((error) => {}); //捕获异常
        },

        // 选择产品类型，根据类型取标签
        selectType(){
            this.$set(this.searchForm,'label',[]);
            this.$set(this.searchForm, 'brand', '');
            this.$set(this.searchForm, 'placeOfOrigin', '');
            this.$set(this.searchForm,'attr_pattern', '');
            this.$set(this.searchForm,'color', '');
            this.$set(this.searchForm,'material', '');
            this.$nextTick(()=>{
                this.$set(this.searchParams,'brand', 0);
                this.$set(this.searchParams,'color', 0);
                this.$set(this.searchParams,'material', 0);
                this.$set(this.searchParams,'tag_ids', []);
                this.$set(this.searchParams,'placeOfOrigin', 0);
                this.$set(this.searchParams,'attr_pattern', 0);
                if(this.searchForm.product_type === 0){
                    this.labelOptions = this.labelCloth;
                    this.brandData = this.brandDataCloth;        // 品牌
                    this.materialData = this.materialDataCloth;  // 材质
                }else if(this.searchForm.product_type === 1){
                    this.labelOptions = this.labelOther;
                    this.brandData = this.brandDataOther;       // 品牌
                    this.materialData = this.materialDataOther; // 材质
                }
            })
        },
        closeViewer(){
            this.dialogVisible = false;
        }
    }
};
</script>

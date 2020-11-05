<template>
    <div class="config-management-container container-wrap">
        <div class="container container-table-no-search p-t-0" @click="cancelReasonType()">
            <div class="tabs-and-add">
                <el-tabs v-model="activeName" @tab-click="handleTabClick">
                    <el-tab-pane :label="brandLabel" :name="brandLabel">
                        <div slot="label">{{brandLabel}}
                            <i class="img-drop-down" @click.stop="selectBrandType"></i>
                            <el-collapse-transition>
                                <div class="reason-list" @click.stop="" v-show="brandTypeShow">
                                    <ul>
                                        <li v-for="item in brandOptions" @click.stop="selectBrandItem(item.key,item.name)"
                                            :class="{'is_selected': brandLabel === item.name}">
                                            <span>{{item.name}}</span>
                                        </li>
                                    </ul>
                                </div>
                            </el-collapse-transition>
                        </div>
                    </el-tab-pane>
                    <!--<el-tab-pane label="品牌" name="品牌"></el-tab-pane>-->
                    <el-tab-pane label="颜色" name="颜色"></el-tab-pane>
                    <el-tab-pane label="产地" name="产地"></el-tab-pane>
                    <el-tab-pane label="单位" name="单位"></el-tab-pane>
                    <el-tab-pane label="材质" name="材质"></el-tab-pane>
                    <!--<el-tab-pane :label="materialLabel" :name="materialLabel">
                        <div slot="label">{{materialLabel}}
                            <i class="img-drop-down" @click.stop="materialBrandType"></i>
                            <el-collapse-transition>
                                <div class="reason-list" @click.stop="" v-show="materialTypeShow">
                                    <ul>
                                        <li v-for="item in materialOptions" @click.stop="selectMaterialItem(item.key,item.name)"
                                            :class="{'is_selected': materialLabel === item.name}">
                                            <span>{{item.name}}</span>
                                        </li>
                                    </ul>
                                </div>
                            </el-collapse-transition>
                        </div>
                    </el-tab-pane>-->
                    <el-tab-pane label="花纹" name="花纹"></el-tab-pane>
                    <el-tab-pane :label="reasonLabel" :name="reasonLabel">
                        <div slot="label">{{reasonLabel}}
                            <i class="img-drop-down" @click.stop="selectReasonType"></i>
                            <el-collapse-transition>
                                <div class="reason-list" @click.stop="" v-show="reasonTypeShow">
                                    <ul>
                                        <li v-for="item in reasonOptions" @click.stop="selectReasonItem(item.key,item.name)"
                                            :class="{'is_selected': reasonLabel === item.name}">
                                            <span>{{item.name}}</span>
                                        </li>
                                    </ul>
                                </div>
                            </el-collapse-transition>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="货架类型" name="货架类型"></el-tab-pane>
                </el-tabs>
                <div v-hasPermission="'attr-add'">
                    <el-button class="btn-add" type="primary" @click="handleAdd" v-show="back_attr_show(activeName)">新增</el-button>
                </div>
                <div v-hasPermission="'reason-add'">
                    <el-button class="btn-add" type="primary" @click="handleAdd" v-show="back_reason_show(activeName)">新增</el-button>
                </div>
                <div v-hasPermission="'shelf-category-add'">
                    <el-button class="btn-add" type="primary" @click="handleAdd" v-show="back_shelf_show(activeName)">新增</el-button>
                </div>
            </div>
            <el-table v-loading="is_loading" :data="tableData" ref="multipleTable" :height="tableHeight">
                <el-table-column prop="name" :label="configLabel"></el-table-column>
                <el-table-column label="操作" width="240">
                    <template slot-scope="scope">
                        <div style="display: inline-block" v-hasPermission="'attr-edit'">
                            <el-button type="text" class="marginRight32" v-show="back_attr_show(activeName)"
                                       @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        </div>
                        <div style="display: inline-block" v-hasPermission="'reason-edit'">
                            <el-button type="text" class="marginRight32" v-show="back_reason_show(activeName)"
                                       @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        </div>
                        <div style="display: inline-block" v-hasPermission="'shelf-category-edit'">
                            <el-button type="text" class="marginRight32" v-show="back_shelf_show(activeName)"
                                       @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        </div>
                        <div style="display: inline-block" v-hasPermission="'attr-del'">
                            <el-button type="text" class="delete-color marginLeft0" v-show="back_attr_show(activeName)"
                                       @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                        </div>
                        <div style="display: inline-block" v-hasPermission="'reason-del'">
                            <el-button type="text" class="delete-color marginLeft0" v-show="back_reason_show(activeName)"
                                       @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                        </div>
                        <div style="display: inline-block" v-hasPermission="'shelf-category-del'">
                            <el-button type="text" class="delete-color marginLeft0" v-show="back_shelf_show(activeName)"
                                       @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                        </div>
                    </template>
                </el-table-column>
                <template  slot="empty" >
                    <EmptyList></EmptyList>
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
        </div>
        <!-- 属性、库存修改理由--添加/编辑弹出框 -->
        <el-dialog :title="attrFormTitle" :visible.sync="attrDialogVisible" width="380px"
                   :before-close="attrDialogClose" :destroy-on-close="true"
                   :close-on-click-modal="false" ustom-class="attrDialog">
            <el-form ref="attrFormBox" :model="attrForm" :rules="attrRules" label-width="90px" class="attr-form">
                <el-form-item :label="setLabel(this.configLabel)" prop="name">
                    <el-input placeholder="请输入" autofocus="autofocus" v-model="attrForm.name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="attrDialogClose">取 消</el-button>
                <el-button type="primary" @click="saveAttrForm">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 货架类型 添加/编辑弹出框 -->
        <ShelfTypeModule :moduleInfo="moduleInfo" v-if="moduleInfo.visible"
                         :ShelfForm="ShelfForm"
                         @closeModule="closeModule"
                         @handleModuleSure="handleModuleSure"
        ></ShelfTypeModule>
    </div>
</template>
<script>
import './ConfigManagement.less';
import { getAttrConfigList, getReasonList, getShelfCategoryList, getAttrAdd,
    getAttrEdit,getAttrDel,getReasonAdd, getReasonEdit, getReasonDel,
    getShelfCategoryAdd, getShelfCategoryEdit, getShelfCategoryDel} from '../../../../api/configManagement';
import EmptyList from '../../../common/empty-list/EmptyList';
import ShelfTypeModule from './ShelfTypeModule'
import commUtil from '../../../../utils/commUtil';
export default {
    name: 'ConfigManagement',
    data() {
        return {
            tableData: [],
            is_loading: false,
            pageInfo: {
                pageIndex: 1,
                pageSize: 10,
                pageTotal: 0
            },
            operationalIndex: -1,
            tableHeight: 'calc(100% - 72px - 84px)',
            selectedType: 1,
            tipTitle:'',
            uploadVisible:false,
            activeName:'品牌(布)',
            configLabel:'品牌名称',  // 弹框
            reasonLabel:'库存修改理由',
            brandLabel:'品牌(布)',
            brandType:1,   // 品牌1 布 2 其它
            brandTypeShow:false,
            brandOptions:[
                {key:1, name:'品牌(布)'},
                {key:2, name:'品牌(其它)'}
            ],
            materialType:1,   // 材质  1 布 2 其它
            materialTypeShow:false,
            materialLabel:'材质(布)',
            materialOptions:[
                {key:1, name:'材质(布)'},
                {key:2, name:'材质(其它)'}
            ],
            attrFormTitle:'',
            attrDialogVisible: false,  // 属性弹窗显示隐藏
            attrForm:{
                name:''
            },
            attrRules:{
                name: [{ required: true, message: '请输入', trigger: 'blur' },
                    { max: 50, message: '最多输入50个字符', trigger: 'blur' }]
            },
            current_id:-1,
            moduleInfo:{
                visible:false,
                title: '',
                id:-1
            },
            ShelfForm:{},
            reasonType:0,
            reasonTypeShow:false,
            reasonOptions:[
                {key:0, name:'库存修改理由'},
                {key:1, name:'锁定理由'},
                {key:2, name:'隐藏理由'},
            ]
        };
    },
    components:{
        EmptyList,
        ShelfTypeModule
    },
    // 计算属性
    computed:{
        setLabel:function() {
            return (data)=>{
                if(data === '库存修改理由'){
                    return '修改理由:'
                }else {
                    return data + ':'
                }
            }
        },
        back_attr_show:function() {
            return (data)=>{
                const flag1 = data.indexOf('品牌') > -1 || data.indexOf('颜色') > -1  || data.indexOf('产地') > -1  || data.indexOf('单位') > -1  || data.indexOf('材质') > -1 || data.indexOf('花纹') > -1 ;
                if(flag1){
                    return true
                }else {
                    return false
                }
            }
        },
        back_reason_show:function() {
            return (data)=>{
                const flag1 = data.indexOf('理由') > -1;
                return flag1
            }
        },
        back_shelf_show:function() {
            return (data)=>{
                const flag1 = data.indexOf('货架类型') > -1;
                if(flag1){
                    return true
                }else {
                    return false
                }
            }
        },
    },
    directives: {
        color: { // 为元素设置指定的字体颜色
            bind(el, binding) {
                el.style.color = binding.value;
            }
        },
        'permission': function (el, binding) { // 自定义指令的简写形式，等同于定义了 bind 和 update 两个钩子函数

        }
    },
    created() {

    },
    mounted() {
        // 获取基础属性列表
        this.getAttrList();
    },
    methods: {

        // 按钮-切换列表
        handleTabClick(tab, event) {
            this.$set(this.pageInfo, 'pageIndex', 1);
            if(this.activeName==='库存修改理由' || this.activeName === '锁定理由' || this.activeName ==='隐藏理由' || this.activeName==='货架类型'){
                this.configLabel = this.activeName;
                if(this.activeName==='库存修改理由' || this.activeName === '锁定理由' || this.activeName ==='隐藏理由'){
                    this.getUpdateReasonList();
                }else {
                    this.getShelfCategory();
                }
            }else {
                if(this.activeName === '品牌(布)' || this.activeName === '品牌(其它)' ){
                    this.selectedType = 1;
                    this.configLabel = '品牌名称';
                }else if(this.activeName === '颜色'){
                    this.selectedType = 2;
                    this.configLabel = this.activeName + '名称';
                }else if(this.activeName === '产地'){
                    this.selectedType = 3;
                    this.configLabel = this.activeName + '名称';
                }else if(this.activeName === '单位'){
                    this.selectedType = 4;
                    this.configLabel = this.activeName + '名称';
                }else if(this.activeName === '材质' || this.activeName === '材质(布)' || this.activeName === '材质(其它)' ){
                    this.selectedType = 5;
                    this.configLabel = '材质名称'
                }else if(this.activeName === '花纹'){
                    this.selectedType = 6;
                    this.configLabel = this.activeName + '名称';
                }
                this.getAttrList();
            }

        },

        // 按钮- 新增
        handleAdd(){
            this.attrFormTitle = '新增' + this.activeName;
            if(this.activeName==='货架类型'){
                this.$set(this.moduleInfo,'title', this.attrFormTitle);
                this.$set(this.ShelfForm,'type',0);
                this.$set(this.ShelfForm,'name', '');
                let arr = [{
                    value: ''
                }]
                this.$set(this.ShelfForm,'floors', arr);
                this.$set(this.moduleInfo,'visible', true);
                // this.moduleInfo = Object.assign({},this.moduleInfo,{currentItem: { },visible:true})
            }else {
                this.$set(this.attrForm,'name','');
                this.attrDialogVisible = true;
            }
        },

        // 属性弹窗保存
        saveAttrForm(){
            this.$refs['attrFormBox'].validate((valid) => {
                if (valid) {
                    // 新增 还是 编辑
                    if(this.attrFormTitle.indexOf('新增') > -1){
                        // 新增
                        if(this.activeName==='货架类型'){

                        }else if(this.activeName==='库存修改理由' || this.activeName === '锁定理由' || this.activeName ==='隐藏理由'){
                            const params = {
                                name: this.attrForm.name,
                                type: this.reasonType
                            };
                            this.reasonAdd(params);
                        }else {
                            const params = {
                                name: this.attrForm.name,
                                type: this.selectedType
                            };
                            if(this.activeName.indexOf('(布)') > -1){
                                params['category'] = 1;
                            }else if(this.activeName.indexOf('(其它)') > -1){
                                params['category'] = 2;
                            }else {
                                params['category'] = 0;
                            }
                            this.attrAdd(params);
                        }
                    }else {
                        // 编辑
                        let params = {};
                        params['id'] = this.current_id;
                        if(this.activeName==='货架类型'){

                        }else if(this.activeName==='库存修改理由'|| this.activeName === '锁定理由' || this.activeName ==='隐藏理由'){
                            params['name'] = this.attrForm.name;
                            params['type'] = this.reasonType
                            this.reasonEdit(params);
                        }else {
                            params['name'] = this.attrForm.name;
                            this.attrEdit(params);
                        }
                    }
                }
            })
        },

        // 按钮- 编辑
        handleEdit(index, row){
            this.current_id = row.id;
            this.attrFormTitle = '编辑' + this.activeName;
            if(this.activeName==='货架类型'){
                this.$set(this.moduleInfo,'title', this.attrFormTitle);
                this.$set(this.moduleInfo,'id', row.id);
                let obj = [];
                let arr = row.content.split(',');
                let new_arr = [];
                arr.forEach((ev)=>{
                    new_arr.push({
                        value:ev
                    })
                });
                obj['name'] = row.name;
                obj['floors'] = new_arr;
                this.$set(this.moduleInfo,'visible', true);
                this.$set(this.ShelfForm,'type', row.type);
                this.$set(this.ShelfForm,'name', row.name);
                this.$set(this.ShelfForm,'floors', new_arr);
            }else {
                this.attrDialogVisible = true;
                this.$nextTick(()=> {
                    // 触发更新
                    this.$set(this.attrForm,'name',row.name);
                })
            }
        },

        // 按钮- 删除
        handleDelete(index, row){
            // 二次确认删除
            this.$confirm('确定要删除该'+ this.activeName +'吗？', '', {
                customClass: 'message-delete',
                type: 'warning',
                center: true
            }).then(() => {
                let params = {};
                params['id'] = row.id;
                if(this.activeName==='货架类型'){
                    this.delShelfCategory(params);
                }else if(this.activeName==='库存修改理由'|| this.activeName === '锁定理由' || this.activeName ==='隐藏理由'){
                    this.reasonDelete(params);
                }else {  // 属性删除
                    params['type'] = this.selectedType;
                    this.getAttrDelete(params);
                }
            }).catch(() => {});

        },

        // 获取基础属性列表
        getAttrList(){
            let params = {
                page: this.pageInfo.pageIndex || 1, // 页码
                limit: this.pageInfo.pageSize || 10,
                type: this.selectedType
            };
            if(this.activeName.indexOf('(布)') > -1){
                params['category'] = 1;
            }else if(this.activeName.indexOf('(其它)') > -1){
                params['category'] = 2;
            }else {
                params['category'] = 0;
            }
            const rLoading = this.openLoading();
            getAttrConfigList(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.tableData = res.data.lists || [];
                    // this.pageInfo = Object.assign({},this.pageInfo,pageInfo)
                    this.pageInfo = Object.assign({}, this.pageInfo, { pageTotal: res.data.total });
                }else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 1000
                    });
                }
            }).catch(()=>{});
        },

        // 获取理由列表  ---  0 库存修改理由 1 锁定理由 2 隐藏理由
        getUpdateReasonList(){
            const params = {
                page: this.pageInfo.pageIndex || 1, // 页码
                limit: this.pageInfo.pageSize || 10,
                type: this.reasonType
            };
            const rLoading = this.openLoading();
            getReasonList(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.tableData = res.data.lists || [];
                    // this.pageInfo = Object.assign({},this.pageInfo,pageInfo)
                    this.pageInfo = Object.assign({}, this.pageInfo, { pageTotal: res.data.total });
                }else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }
            }).catch(()=>{});
        },

        // 获取货架类型列表
        getShelfCategory(){
            const params = {
                page: this.pageInfo.pageIndex || 1, // 页码
                limit: this.pageInfo.pageSize || 10,
            };
            const rLoading = this.openLoading();
            getShelfCategoryList(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.tableData = res.data.lists || [];
                    // this.pageInfo = Object.assign({},this.pageInfo,pageInfo)
                    this.pageInfo = Object.assign({}, this.pageInfo, { pageTotal: res.data.total });
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

        /*属性-增删改*/
        // 请求- 属性新增
        attrAdd(params){
            const rLoading = this.openLoading();
            getAttrAdd(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.attrDialogVisible = false;
                    this.$notify({
                        title: '添加成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    });
                    // 获取基础属性列表
                    this.getAttrList();
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

        // 请求- 属性编辑
        attrEdit(params){
            const rLoading = this.openLoading();
            getAttrEdit(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.attrDialogVisible = false;
                    this.$notify({
                        title: '编辑成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    });
                    // 获取基础属性列表
                    this.getAttrList();
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

        // 请求- 属性删除
        getAttrDelete(params){
            const rLoading = this.openLoading();
            getAttrDel(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.$notify({
                        title: '删除成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    });
                    // 如果当前页大于1 且 当前页只有1条时  删除后 页码-1
                    if(this.pageInfo.pageIndex > 1 && this.tableData.length < 2){
                        this.$set(this.pageInfo, 'pageIndex', this.pageInfo.pageIndex - 1);
                    }
                    // 获取基础属性列表
                    this.getAttrList();
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

        /*库存修改理由-增删改 start*/
        // 请求- 库存修改理由新增
        reasonAdd(params){
            const rLoading = this.openLoading();
            getReasonAdd(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.attrDialogVisible = false;
                    this.$notify({
                        title: '添加成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    });
                    // 获取库存修改理由列表
                    this.getUpdateReasonList();
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

        // 请求- 库存修改理由编辑
        reasonEdit(params){
            const rLoading = this.openLoading();
            getReasonEdit(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.attrDialogVisible = false;
                    this.$notify({
                        title: '编辑成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    });
                    // 获取库存修改理由列表
                    this.getUpdateReasonList();
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

        // 请求- 库存修改理由删除
        reasonDelete(params){
            const rLoading = this.openLoading();
            getReasonDel(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.$notify({
                        title: '删除成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    });
                    // 如果当前页大于1 且 当前页只有1条时  删除后 页码-1
                    if(this.pageInfo.pageIndex > 1 && this.tableData.length < 2){
                         this.$set(this.pageInfo, 'pageIndex', this.pageInfo.pageIndex - 1);
                    }
                    // 获取库存修改理由列表
                    this.getUpdateReasonList();
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
        /*库存修改理由-增删改 end*/

        // 属性弹窗关闭前操作
        attrDialogClose(){
            this.$refs['attrFormBox'].clearValidate();
            this.$refs['attrFormBox'].resetFields();
            this.attrDialogVisible = false;
        },

        // 关闭新增/编辑货架类型 弹框
        closeModule(){
            this.$set(this.moduleInfo,'visible', false);
        },
        // 确定保存 - 新增/编辑货架类型
        handleModuleSure($event){
            if($event.id){
                // 编辑
                this.editShelfCategory($event);
            }else {
                // 新增
                this.addShelfCategory($event);
            }

        },
        // 请求 - 货架类型新增
        addShelfCategory(params){
            const rLoading = this.openLoading();
            getShelfCategoryAdd(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.$set(this.moduleInfo,'visible', false);
                    this.$notify({
                        title: '添加成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    });
                    // 获取货架类型列表
                    this.getShelfCategory();
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

        // 请求 - 货架类型编辑
        editShelfCategory(params){
            const rLoading = this.openLoading();
            getShelfCategoryEdit(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.$set(this.moduleInfo,'visible', false);
                    this.$notify({
                        title: '编辑成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    });
                    // 获取货架类型列表
                    this.getShelfCategory();
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

        // 请求 - 货架类型删除
        delShelfCategory(params){
            const rLoading = this.openLoading();
            getShelfCategoryDel(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.$notify({
                        title: '删除成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    });
                    // 如果当前页大于1 且 当前页只有1条时  删除后 页码-1
                    if(this.pageInfo.pageIndex > 1 && this.tableData.length < 2){
                        this.$set(this.pageInfo, 'pageIndex', this.pageInfo.pageIndex - 1);
                    }
                    // 获取货架类型列表
                    this.getShelfCategory();
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
        // 按钮-分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val);
            // this.getAttrList();
            if(this.activeName==='库存修改理由' || this.activeName === '锁定理由' || this.activeName ==='隐藏理由'){
                this.getUpdateReasonList();
            }else if(this.activeName==='货架类型'){
                this.getShelfCategory();
            }else {
                this.getAttrList();
            }
        },

        // 理由类型  下拉框 显示/隐藏
        selectReasonType(){
            this.brandTypeShow = false;
            this.materialTypeShow = false;
            this.reasonTypeShow = !this.reasonTypeShow;
        },
        // 品牌类型 下拉框 显示/隐藏
        selectBrandType(){
            this.reasonTypeShow = false;
            this.materialTypeShow = false;
            this.brandTypeShow = !this.brandTypeShow;
        },
        // 材质类型 下拉框 显示/隐藏
        materialBrandType(){
            this.reasonTypeShow = false;
            this.brandTypeShow = false;
            this.materialTypeShow = !this.materialTypeShow;
        },
        // 选择 理由类型
        selectReasonItem(num,str){
            // this.activeName = str;
            this.reasonType = num;
            let old_reasonLabel = this.reasonLabel;
            let old_activeName = this.activeName;
            this.reasonLabel = str;
            if(this.activeName === old_reasonLabel){
                this.activeName = str;
                if(old_activeName !== this.activeName){
                    this.$set(this.pageInfo, 'pageIndex', 1);
                    this.getUpdateReasonList();
                }
            }
            // this.configLabel = this.activeName;
            this.reasonTypeShow = false;
        },

        // 选择 品牌类型
        selectBrandItem(num,str){
            this.brandType = num;
            let old_brandLabel = this.brandLabel;
            let old_activeName = this.activeName;
            this.brandLabel = str;
            if(this.activeName === old_brandLabel){
                this.activeName = str;
                if(old_activeName !== this.activeName){
                    this.$set(this.pageInfo, 'pageIndex', 1);
                    this.getAttrList();
                }
            }
            // this.configLabel = this.activeName;
            this.brandTypeShow = false;
        },
        cancelReasonType(){
            this.reasonTypeShow = false;
            this.brandTypeShow = false;
            this.materialTypeShow = false;
        },
        // 选择 材质类型
        selectMaterialItem(num,str){
            this.materialType = num;
            let old_materialLabel = this.materialLabel;
            let old_activeName = this.activeName;
            this.materialLabel = str;
            if(this.activeName === old_materialLabel){
                this.activeName = str;
                if(old_activeName !== this.activeName){
                    this.$set(this.pageInfo, 'pageIndex', 1);
                    this.getAttrList();
                }
            }
            // this.configLabel = this.activeName;
            this.materialTypeShow = false;
        },
        // 处理数据
        processData(data){
            let dealOptions = []
            // 给每个数据加children属性
            data.forEach((ev, one) => {
                ev.subs = []
            })
            data.forEach((ev, one) => {
                let findIndex = data.findIndex((item) => item.permission_id === ev.pid);
                if ((!ev.pid && ev.pid !== 0 && ev.pid !== false) || findIndex === -1) {
                    dealOptions.push(ev);
                } else {
                    data[findIndex].subs.push(ev);
                }
            })
            return dealOptions
        },
        // 是否有权限
        is_has_permission(str){
            if(localStorage.getItem('is_admin') > 0){
                // 超级管理员
                return true;
            }else {
                const role_auth_list = this.processData(JSON.parse(localStorage.getItem('roleAuthList') || '[]'));
                // 普通用户
                let permissions = [];
                role_auth_list.map(item=>{
                    if(item.subs && item.subs.length){
                        item.subs.map(v=>{
                            if(v.subs && v.subs.length){
                                v.subs.map(s=>{
                                    permissions.push(s.name)
                                })
                            }
                        })
                    }
                });
                if (!permissions.includes(str)) {
                    return false
                }else {
                    return true;
                }
            }
        },
    }
};
</script>
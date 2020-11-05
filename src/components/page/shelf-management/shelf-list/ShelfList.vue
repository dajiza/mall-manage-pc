<template>
    <div class="shelf-container container-wrap">
        <div class="container clearfix" ref="searchBox">
            <div class="handle-box">
                <el-form :model="searchForm" :inline="true" ref="searchForm">
                    <el-form-item label="楼层:" prop="floor_code">
                        <el-input v-model="searchForm.floor_code"></el-input>
                    </el-form-item>
                    <el-form-item label="房间:" prop="room_code">
                        <el-input v-model="searchForm.room_code"></el-input>
                    </el-form-item>
                    <el-form-item label="货架号:" prop="shelf_code">
                        <!--<el-input v-model="searchForm.shelf_code"></el-input>-->
                        <el-input v-model="searchForm.shelf_code" placeholder="请输入"
                                  onKeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" type="number"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <div class="btn-right">
                <el-button @click="resetForm('searchForm')">重置</el-button>
                <el-button type="primary" @click="handleSearch('searchForm')">搜索</el-button>
            </div>
        </div>
        <div class="container container-table-has-search m-t-16 p-t-0">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>货架列表</span>
                </div>
                <div>
                    <el-button type="success" v-hasPermission="'print-shelf-tags'" @click="printSelect" :disabled="select_num < 1">打印已选</el-button>
                    <el-button type="primary" v-hasPermission="'shelf-add'" @click="openAddModal">添加货架</el-button>
                </div>
            </div>
            <el-table
                    :data="tableData"
                    style="width: 100%"
                    :row-key="getRowKeys"
                    :expand-row-keys="expands"
                    :height="tableHeight"
                    ref="tableRef"
                    @selection-change="selsChange"
                    @select="rowSelect"
                    @select-all="selectAll"
                    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            >
                <el-table-column type="selection" width="55" v-hasPermission="'print-shelf-tags'"></el-table-column>
                <el-table-column label="货架编号" prop="display_name" width="300">
                    <template slot-scope="scope">
                        <span v-show="scope.row.code" class="child-line marginRight10">|——</span>
                        <span>{{scope.row.code ? scope.row.code : scope.row.belonging_shelf_code}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="used_capacity" label="货架名称">
                    <template slot-scope="scope">
                        <span v-show="!scope.row.code">{{scope.row.shelf_category_name}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="货物数" width="90">
                    <template slot-scope="scope">
                        <span v-show="!scope.row.code">{{scope.row.product_detail_total}}</span>
                        <span v-show="scope.row.code">{{scope.row.product_detail_total}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="配置属性">
                    <template slot-scope="scope">
                        <span v-show="scope.row.code">{{back_attr_config(scope.row.shelf_attr_list)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="created_time" label="添加日期" width="180">
                    <template slot-scope="scope">
                        <span v-show="!scope.row.code">{{scope.row.created_time}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="244" align="left">
                    <template slot-scope="scope">
                        <div style="display: inline-block" v-hasPermission="'shelf-add'">
                            <el-button  v-if="scope.row.code" type="text" class="marginLeft0 marginRight18" v-hasPermission="'shelf-product-detail-list'"
                                        @click="handleViewCargo(scope.$index, scope.row)">查看货物</el-button>
                        </div>
                        <div style="display: inline-block" v-hasPermission="'shelf-status-update'">
                            <el-button
                                    type="text"
                                    v-if="!scope.row.code"
                                    class="marginLeft0 marginRight32"
                                    :class="{'delete-color' : scope.row.status < 1}"
                                    @click="handleChangeStatus(scope.$index, scope.row)"
                            > {{scope.row.status > 0 ? '启用' : '停用'}}</el-button>
                        </div>
                        <el-button  type="text" class="marginRight32 marginLeft0" v-hasPermission="'shelf-attr-set'"
                                    :class="scope.row.code?'marginRight18':'marginRight32'"
                                    @click="handleViewConfig(scope.$index, scope.row)">配置属性</el-button>
                        <el-button  type="text" class="marginLeft0" v-hasPermission="'print-shelf-tags'"
                                    @click="handlePrint(scope.$index, scope.row)">打印标贴</el-button>
                    </template>
                </el-table-column>
                <template  slot="empty" >
                    <span v-show="!is_search" class="empty-list-tip-text">请搜索“楼层”和“房间”来查询您想查看的货架</span>
                    <EmptyList v-show="is_search"></EmptyList>
                </template>
            </el-table>
        </div>
        <!-- 添加货架 -->
        <el-dialog
            title="添加货架"
            :visible.sync="addShelfModalVisible"
            width="420px"
            :before-close="dialogClose"
            :close-on-click-modal="false"
            custom-class="add-shelf-dialog"
        >
            <div class="add-form-wrap">
                <el-form ref="addShelfForm" :model="addShelfForm" :rules="addShelfRules" label-width="90px">
                    <el-form-item label="楼层" prop="floor_code">
                        <el-input v-model="addShelfForm.floor_code" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="房间" prop="room_code">
                        <el-input v-model="addShelfForm.room_code" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="货架数量" prop="shelf_num">
                        <el-input v-model.number="addShelfForm.shelf_num" placeholder="请输入" @mousewheel.native.prevent></el-input>
                        <!--<el-input v-model="addShelfForm.shelf_num" placeholder="请输入"
                                  onKeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))" type="number"></el-input>-->
                    </el-form-item>
                    <el-form-item label="货架类型" prop="shelf_category_id">
                        <el-select
                                v-model="addShelfForm.shelf_category_id"
                                placeholder="请选择"
                                style="width:100%"
                                @change="selectShelfType"
                        >
                            <el-option
                                    v-for="state in shelfTypes"
                                    :key="state.id"
                                    :value="state.id"
                                    :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
            <div class="tags-box" v-show="configShow">
                <el-cascader-panel
                        v-model="addShelfForm.selectedLabel"
                        filterable
                        :key="cascaderKey"
                        :options="options" :props="{ multiple: true, label:'name', value:'id' }">
                </el-cascader-panel>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogClose()">取 消</el-button>
                <el-button type="primary" @click="handleSureModal('addShelfForm')">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 查看货物 -->
        <ViewShelfModal v-if="viewShelfInfo.visible"
                        :viewShelfInfo="viewShelfInfo"
                        @handleSureModal="viewCargoModalSure"></ViewShelfModal>
        <!-- 配置属性 -->
        <el-dialog
                title="配置属性"
                :visible.sync="configModalVisible"
                width="420px"
                :before-close="configDialogClose"
                :close-on-click-modal="false"
                custom-class="config-dialog"
        >
            <div class="config-box">
                <div class="tags-box">
                    <el-cascader-panel
                            v-model="configForm.selectedLabel"
                            filterable
                            :options="options" :props="{ multiple: true, label:'name', value:'id' }">
                    </el-cascader-panel>
                </div>
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button @click="configDialogClose()">取 消</el-button>
                <el-button type="primary" @click="handleSureAttrConfig('addShelfForm')">确 定</el-button>
            </span>
        </el-dialog>

        <!--打印-->
        <div v-if="printPageShow" class="print-cargo-label-page" @click.stop="">
            <div id="printMe" ref="print" style="background: #fff;box-sizing: border-box;">
                <div class="label-box" v-for="(item,i) in cargoLabelInfo" :key="i" style="page-break-after:always;width: 100%;height: 60mm;display: flex;justify-content: center;align-items: center">
                    <div class="label-content" style="width: 36mm;height: 53mm;border-radius: 2px;box-sizing: border-box;display: flex;flex-direction: column" :style="i > 0?'margin-top:4.5mm':'margin-top:3.5mm'">
                        <table class="print-table" headerRows='1' style="width: 100% !important;height:30px;border-color: #000;border-collapse:collapse;font-size: 9px!important;box-sizing: border-box">
                            <tr style="height: 30px;line-height: 14px;box-sizing: border-box;">
                                <th style="width: 40%;height: 30px;border: 1px solid #000;text-align: center;box-sizing: border-box;font-weight: 500!important;font-size: 9px!important;">货架编码</th>
                                <td style="width: 60%;height: 30px;border: 1px solid #000;text-align: left;padding:0 2px;box-sizing: border-box;font-weight: 500!important;font-size: 9px!important;">{{item.shelf_code}}</td>
                            </tr>
                        </table>
                        <div class="QRCode-box" style="width: 36mm;flex: 1;box-sizing: border-box;border: 1px solid #000;border-top: none">
                            <div class="qrcode" style="width: 100%;height: 100%;box-sizing:border-box;padding: 25px 0;display: flex;justify-content: center;align-items: center;" :id="'qrCodeUrl' + item.id" :ref="'qrCodeUrl' + item.id"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getShelfList, createShelf, updateShelfStatus, shelfAttrSet } from '../../../../api/shelf';
import { getAllAttrList, getShelfTypeAllList } from '../../../../api/configManagement';
import ViewShelfModal from './viewShelfModal.vue';
import EmptyList from '../../../common/empty-list/EmptyList';
import './ShelfList.less';
import QRCode from 'qrcodejs2';

export default {
    name: 'shelfList',
    components: {
        ViewShelfModal,
        EmptyList
    },
    data() {
        var checkNum = (rule, value, callback) => {
            setTimeout(() => {
                if (!value) {
                    return callback(new Error('请输入大于0的数字值'));
                }
                if (!Number.isInteger(value)) {
                    callback(new Error('请输入数字值'));
                } else {
                    callback();
                }
            }, 10);
        };
        return {
            tableData: [], //列表
            loading: false,
            searchForm: {
                floor_code: '', //楼层
                room_code: '', //房间
                shelf_code: '' //货架号
            }, //搜索条件
            getRowKeys(row) {
                return row.id;
            },
            expands: [],
            viewShelfInfo: {
                visible: false,
                currentItem: {}
            },
            addShelfForm: {
                floor_code: '',
                room_code: '',
                shelf_num: null,
                shelf_category_id: null,
                selectedLabel:[]
            },
            addShelfRules: {
                floor_code: [
                    { required: true, message: '请输入楼层编码', trigger: 'blur' },
                    { max: 11, message: '最多可输入11位', trigger: 'blur' }
                ],
                room_code: [
                    { required: true, message: '请输入房间编码', trigger: 'blur' },
                    { max: 11, message: '最多可输入11位', trigger: 'blur' }
                ],
                shelf_num: [
                    { validator: checkNum, trigger: 'blur' }
                ],
                shelf_category_id:[{ required: true, message: '请选择', trigger: 'blur' }]
            },
            searchParams: {
                floor_code: '-1',
                room_code: '-1',
                shelf_code: -1,
            },
            addShelfModalVisible: false,
            shelfTypes: [],
            tableHeight: 'calc(100% - 62px - 10px)',
            is_search:false,
            configModalVisible:false,
            configShow:false,
            configForm:{
                selectedLabel:[]
            },
            options: [],
            clothOptions: [],
            otherOptions: [],
            tagsSearch:'',
            shelf_ids_arr:[],   // 配置货架id数组
            cascaderKey:1,
            multipleSelection:[],
            all_selected:false,
            select_num:0,
            cargoLabelInfo:[],
            printPageShow:false

        };
    },
    created() {
        this.getShelfTypeAllList(); // 货架类型
        // this.getShelfList(); // 货架列表
        this.getAllAttr();  // 配置属性
    },
    mounted() {
        // 获取搜索容器高度
        const searchBoxHeight = this.$refs.searchBox.offsetHeight;
        const containerHasSearch = document.getElementsByClassName('container-table-has-search')[0];
        containerHasSearch.style.height = `calc(100% - 16px - ${searchBoxHeight}px)`;
    },
    watch:{
        //切换数据源
        changeMenu(){

        }
    },
    // 计算属性
    computed:{
        back_attr_config:function() {
            return (data)=>{
                let attr_str = '';
                let attr_arr = [];
                if(data){
                    data.forEach((ev=>{
                        attr_arr.push(ev.attr_name);
                    }));
                    if(attr_arr.length > 0){
                        attr_str = attr_arr.join('、');
                    }
                }
                return attr_str
            }
        }
    },
    methods: {

        // 格式化数据
        handlerData(arr){
            let obj = {};
            arr.forEach((item, index) => {
                let { belonging_shelf_code } = item;
                if (!obj[belonging_shelf_code]) {
                    obj[belonging_shelf_code] = {
                        belonging_shelf_code,
                        children: []
                    }
                }
                obj[belonging_shelf_code].children.push(item);
            });
            let data = Object.values(obj);
            data.forEach(ev=>{
                ev['id'] = ev.belonging_shelf_code;
                ev['created_time'] = ev.children[0].created_time;
                ev['status'] = ev.children[0].status;
                ev['shelf_category_name'] = ev.children[0].shelf_category_name;
                ev['type'] = ev.children[0].type;
                ev['level'] = 1;
                ev['is_selected'] = false;
                let detail_num = 0;
                ev.children.forEach(item =>{
                    item['level'] = 2;
                    item['is_selected'] = false;
                    detail_num = Number(detail_num) + Number(item.product_detail_total);
                });
                ev['product_detail_total'] = detail_num;
            })
            // 最终输出
            return data;
        },

        // 请求 - 获取货架列表
        getShelfList() {
            // this.loading = true;
            let params = {
                floor_code: this.searchParams.floor_code || '-1',
                room_code: this.searchParams.room_code || '-1',
                shelf_code: this.searchParams.shelf_code || -1
            };
            const rLoading = this.openLoading();
            getShelfList(params).then((res) => {
                rLoading.close();
                if (res.code === 200){
                    if(res.data){
                        const arr = res.data;
                        arr.forEach((ev,i)=>{
                            ev['belonging_shelf_code'] = ev.floor_code + '-' + ev.room_code + '-' + ev.shelf_code
                        })
                        this.tableData = this.handlerData(res.data);
                    }else {
                        this.tableData = [];
                    }
                } else {
                    this.$notify({
                        title: res.msg,
                        message: '',
                        type: 'error',
                        duration: 5000
                    });
                }
                // this.loading = false;
                // this.tableData = res.data || [];
            }).catch((err)=>{});
        },

        // 请求 - 获取货架类型
        getShelfTypeAllList() {
            getShelfTypeAllList().then((res) => {
                if (res.code === 200){
                    this.shelfTypes = res.data || [];
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

        // 按钮 - 重置
        resetForm(formName) {
            this.$refs[formName].resetFields();
            this.$set(this.searchParams, 'floor_code', '-1');
            this.$set(this.searchParams, 'room_code', '-1');
            this.$set(this.searchParams, 'shelf_code', -1);
            this.is_search = false;
            this.getShelfList();
        },

        // 按钮 - 搜索
        handleSearch(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    let params = this.searchForm;
                    //ajax`
                    const floor_code_value = this.searchForm.floor_code || '-1';
                    const room_code_value = this.searchForm.room_code || '-1';
                    const shelf_code_value = this.searchForm.shelf_code ? Number(this.searchForm.shelf_code) : -1;
                    this.$set(this.searchParams, 'floor_code', floor_code_value);
                    this.$set(this.searchParams, 'room_code', room_code_value);
                    this.$set(this.searchParams, 'shelf_code', shelf_code_value);
                    this.is_search = true;
                    this.getShelfList();
                } else {
                    return false;
                }
            });
        },

        // 按钮-添加货架
        openAddModal() {
            this.$set(this.addShelfForm,'selectedLabel',[]);
            this.configShow = false;
            this.addShelfModalVisible = true;
        },

        // 按钮-改变状态（停用、启用）
        handleChangeStatus(index, row){
            if(row.status < 1){
                this.$confirm('确认要停用该货架吗？', '', {
                    customClass: 'message-delete',
                    type: 'warning',
                    center: true
                }).then(() => {
                    row.children.forEach((ev,i)=>{
                        let params = {};
                        params['id'] = ev.id ;
                        params['status'] = 1
                        if(i === row.children.length - 1){
                            this.ChangeShelfStatus(params,'is_last');
                        }else {
                            this.ChangeShelfStatus(params,'no_last');
                        }
                    });

                }).catch(() => {});
            }else {
                row.children.forEach((ev,i)=>{
                    let params = {};
                    params['id'] = ev.id ;
                    params['status'] = 0;
                    if(i === row.children.length - 1){
                        this.ChangeShelfStatus(params,'is_last');
                    }else {
                        this.ChangeShelfStatus(params,'no_last');
                    }
                });
            }

        },

        // 请求-改变状态（停用、启用）
        ChangeShelfStatus(params, str){
            let rLoading;
            if(str === 'is_last'){
                rLoading = this.openLoading();
            }
            updateShelfStatus(params).then((res) => {
                    if (res.code === 200) {
                        if(str === 'is_last'){
                            rLoading.close();
                            this.$notify({
                                title: '操作成功',
                                message: '',
                                type: 'success',
                                duration: 3000
                            });
                        }
                        this.getShelfList();
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

        // 按钮 - 查看货物
        handleViewCargo(index, row) {
            this.viewShelfInfo = Object.assign({}, this.viewShelfInfo, { currentItem: row, visible: true });
        },
        // 按钮 - 打印标贴
        handlePrint(index,row){
            this.printPageShow = false;
            this.cargoLabelInfo = [];
            if(row.children){
                row.children.forEach((ev)=>{
                    this.cargoLabelInfo.push({
                        id:ev.code,
                        shelf_code:ev.code,
                        type:ev.type
                    })
                })
            }else {
                this.cargoLabelInfo.push({
                    id:row.code,
                    shelf_code:row.code,
                    type:row.type
                })

            }
            this.$nextTick(()=>{
                this.printPageShow = true;
                this.showCode(this.cargoLabelInfo);
            })
        },
        // 按钮- 配置属性
        handleViewConfig(index,row){
            this.$set(this.configForm,'selectedLabel',[]);
            if(row.type > 0){
                this.options = this.otherOptions;
            }else {
                this.options = this.clothOptions;
            }
            this.configModalVisible = true;
            this.shelf_ids_arr = [];
            if(row.children){  // 配置父级货架
                row.children.forEach((ev)=>{
                    this.shelf_ids_arr.push(ev.id);
                })
                this.openAttr();  // 模拟点击展开二级属性
            }else {
                this.shelf_ids_arr.push(row.id);
            }
            this.$nextTick(()=>{
                if(row.shelf_attr_list){
                    let attr_arr = [];
                    row.shelf_attr_list.forEach((ev)=>{
                        attr_arr.push([ev.attr_type,ev.attr_id])
                    });
                    this.$set(this.configForm,'selectedLabel',attr_arr);
                }
            })

        },
        // 模拟点击展开二级属性
        openAttr(){
            setTimeout(function() {
                // IE
                if(document.all) {
                    document.getElementsByClassName("el-cascader-node")[0].click();
                }
                // 其它浏览器
                else {
                    var e = document.createEvent("MouseEvents");
                    e.initEvent("click", true, true);
                    document.getElementsByClassName("el-cascader-node")[0].dispatchEvent(e);
                }
            }, 10);
        },

        // 按钮- 确定配置属性
        handleSureAttrConfig(){
            let tag_arr = [];
            if(this.configForm.selectedLabel.length >0){
                this.configForm.selectedLabel.forEach(ev=>{
                    tag_arr.push(ev[1]);
                })
            }
            let params = {};
            params['attr_ids'] = tag_arr.join();
            params['shelf_ids'] = this.shelf_ids_arr.join();
            const rLoading = this.openLoading();
            shelfAttrSet(params).then((res) => {
                rLoading.close();
                if (res.code === 200) {
                    this.$notify({
                        title: '操作成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    });
                    this.configModalVisible = false;
                    this.getShelfList();
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

        //查看货物弹窗关闭
        viewCargoModalSure(visible) {
            this.$set(this.viewShelfInfo, 'visible', visible);
        },

        // 添加弹框关闭前操作
        dialogClose() {
            this.$set(this.addShelfForm,'selectedLabel',[]);
            this.$refs['addShelfForm'].clearValidate();
            this.$refs['addShelfForm'].resetFields();
            this.addShelfModalVisible = false;
        },
        // 配置属性弹框关闭前操作
        configDialogClose(){
            this.configModalVisible = false;
        },

        //添加弹窗确定
        handleSureModal(formName) {
            // return false
            this.$refs['addShelfForm'].validate((valid) => {
                if (valid) {
                    let tag_arr = [];
                    if(this.addShelfForm.selectedLabel.length >0){
                        this.addShelfForm.selectedLabel.forEach(ev=>{
                            tag_arr.push(ev[1]);
                        })
                    }
                    let params = {...this.addShelfForm,shelf_num:Number(this.addShelfForm.shelf_num)};
                    params['attr_ids'] = tag_arr.join();
                    createShelf(params).then((res) => {
                        if (res.code !== 200) return;
                        this.addShelfModalVisible = false;
                        this.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        });
                        this.getShelfList();
                    }).catch((err)=>{});
                }
            })
        },

        // 选择货架类型
        selectShelfType(){
            if(this.addShelfForm.shelf_category_id > 0){
                let select_obj = this.shelfTypes.filter(value => value.id === this.addShelfForm.shelf_category_id)[0]
                this.$set(this.addShelfForm,'selectedLabel',[]);
                ++this.cascaderKey;
                if(select_obj['type'] > 0){ // 其它
                    this.options = this.otherOptions;
                }else{  // 布
                    this.options = this.clothOptions;
                }
                if(!this.configShow){
                    this.configShow = true;
                }
                this.openAttr();  // 模拟点击展开二级属性
            }
        },

        // 获取所有属性列表
        getAllAttr(){
            this.clothOptions = [];
            this.otherOptions = [];
            const that = this;
            this.$ajax.all([
                getAllAttrList({type:3}),
                getAllAttrList({type:1,category:1}),
                getAllAttrList({type:5, category:1}),
                getAllAttrList({type:1, category:2}),
            ]).then(that.$ajax.spread(function(res1, res2, res3, res4) {
                if (res1.code === 200){  // 产地
                    if(res1.data){
                        that.clothOptions.push({
                            id:3,
                            name:'产地',
                            children:res1.data
                        });
                    }
                }else {
                    that.$notify({ title: res1.msg, message: '', type: 'error', duration: 5000 });
                }
                if (res2.code === 200){  // 品牌(布)
                    if(res2.data){
                        that.clothOptions.push({
                            id:1,
                            name:'品牌',
                            children:res2.data
                        });
                    }
                }else {
                    that.$notify({ title: res2.msg, message: '', type: 'error', duration: 5000 });
                }
                if (res3.code === 200){  // 材质(布)
                    if(res3.data){
                        that.clothOptions.push({
                            id:5,
                            name:'材质',
                            children:res3.data
                        });
                    }
                }else {
                    that.$notify({ title: res3.msg, message: '', type: 'error', duration: 5000 });
                }
                if (res4.code === 200){  // 品牌(其它)
                    if(res3.data){
                        that.otherOptions.push({
                            id:1,
                            name:'品牌',
                            children:res4.data
                        });
                    }
                }else {
                    that.$notify({ title: res4.msg, message: '', type: 'error', duration: 5000 });
                }
                that.options = that.clothOptions;
            })).catch(() => {});
        },

        rowSelect(selection, row) {
            if (selection.indexOf(row) > -1 && row.level === 1) {
                row.children.forEach((children_item)=>{
                    children_item['is_selected'] = true;
                });
                this.toggleSelection(row.children, true);
                row['is_selected'] = true;
            }
            if (selection.indexOf(row) === -1 && row.level === 1) {
                row.children.forEach((children_item)=>{
                    children_item['is_selected'] = false;
                });
                this.toggleSelection(row.children, false);
                row['is_selected'] = false;
            }
            if (selection.indexOf(row) > -1 && row.level === 2) {
                let s = this.tableData.filter(item => {
                    if (item.id === row.belonging_shelf_code) {
                        return item;
                    }
                });
                row['is_selected'] = true;
                s[0].is_selected = true;
                this.toggleSelection(s, true);
            }
            if (selection.indexOf(row) === -1 && row.level === 2) {
                row['is_selected'] = false;
                let s = this.tableData.filter(item => {
                    if (item.id === row.belonging_shelf_code) {
                        return item;
                    }
                });
                const selected_arr = s[0].children.filter(value => value.is_selected);
                // const arr1 =
                if(selected_arr.length < 1){
                    this.toggleSelection(s, false);
                    s[0].is_selected = false;
                }else {
                    this.toggleSelection(s, true);
                    s[0].is_selected = true;
                }

            }
            this.$nextTick(()=>{
                this.select_num =  (this.tableData.filter(item => item.is_selected)).length;
            })
        },
        selectAll(selection) {
            if(this.all_selected){
                this.tableData.forEach(item => {
                    item['is_selected'] = false;
                    if(item.children){
                        item.children.forEach((children_item)=>{
                            children_item['is_selected'] = true;
                        })
                    }
                    this.toggleSelection(item.children, true);
                });
                this.toggleSelection();
                this.all_selected = false;
            }else {
                this.tableData.forEach(item => {
                    item['is_selected'] = true;
                    if(item.children){
                        item.children.forEach((children_item)=>{
                            children_item['is_selected'] = true;
                        })
                    }
                    this.toggleSelection(item.children, true);
                });
                this.all_selected = true;
            }
            this.$nextTick(()=>{
                this.select_num =  (this.tableData.filter(item => item.is_selected)).length;
            })
        },
        toggleSelection(rows, flag) {
            if (rows) {
                rows.forEach(row => {
                    this.$refs.tableRef.toggleRowSelection(row, flag);
                });
            } else {
                this.$refs.tableRef.clearSelection();
            }
        },
        // 多选操作 -- 选择值改变
        selsChange(val){
            // this.multipleSelection = val;
        },

        // 打印已选
        printSelect(){
            this.printPageShow = false;
            this.cargoLabelInfo = [];
            const select_arr = this.tableData.filter(value => value.is_selected);
            select_arr.forEach((ev)=>{
                if(ev.children){
                    ev.children.forEach((children_item)=>{
                        if(children_item.is_selected){
                            this.cargoLabelInfo.push({
                                id:children_item.code,
                                shelf_code:children_item.code,
                                type:children_item.type
                            })
                        }
                    })
                }
            })
            this.$nextTick(()=>{
                this.printPageShow = true;
                this.showCode(this.cargoLabelInfo);
            })
        },
        // 显示二维码
        showCode(info){
            info.forEach((ev,index)=>{
                let obj = {
                    code:ev.shelf_code,
                    type:2
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
                width: 106,
                height: 106,
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
    /* 增加padding */
    @media print {
    }
</style>

<template>
    <div class="config-management-container container-wrap">
        <div class="container container-table-no-search p-t-0" @click="cancelReasonType()">
            <div class="tabs-and-add">
                <el-tabs v-model="activeName" @tab-click="handleTabClick">
                    <el-tab-pane label="退款原因" name="退款原因"></el-tab-pane>
                    <el-tab-pane label="退货原因" name="退货原因"></el-tab-pane>
                    <el-tab-pane label="换货原因" name="换货原因"></el-tab-pane>
                    <el-tab-pane label="后台发起退款原因" name="后台发起退款原因"></el-tab-pane>
                    <el-tab-pane label="拒绝售后理由" name="拒绝售后理由"></el-tab-pane>
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
                </el-tabs>
                <div>
                    <el-button class="btn-add" type="primary" v-hasPermission="'mall-backend-reason-create'" @click="handleAdd">新增</el-button>
                </div>
            </div>
            <el-table v-loading="is_loading" :data="tableData" ref="multipleTable" :height="tableHeight">
                <el-table-column prop="name" :label="configLabel"></el-table-column>
                <el-table-column label="操作" width="240">
                    <template slot-scope="scope">
                        <div style="display: inline-block">
                            <el-button
                                type="text"
                                class="marginRight32"
                                v-hasPermission="'mall-backend-reason-update'"
                                @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        </div>
                        <div style="display: inline-block">
                            <el-button
                                type="text"
                                class="delete-color marginLeft0"
                                v-hasPermission="'mall-backend-reason-delete'"
                                @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                        </div>
                    </template>
                </el-table-column>
                <template  slot="empty" >
                    <EmptyList></EmptyList>
                </template>
            </el-table>
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
    </div>
</template>
<script>
import { queryReasonList, addReason, updateReason, deleteReason } from '../../../api/afterSaleReason';
import EmptyList from '../../common/empty-list/EmptyList';
import './afterSaleReason.less'
export default {
    name: 'afterSaleReason',
    data() {
        return {
            tableData: [],
            is_loading: false,
            pageIndex: 1,
            pageSize: 10,
            pageTotal: 0,
            operationalIndex: -1,
            selectedType: 0,
            tipTitle:'',
            uploadVisible:false,
            activeName:'退款原因',
            configLabel:'退款原因',  // 弹框
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
            tableHeight: 'calc(100% - 100px)',
            reasonType:0,
            reasonTypeShow: false,
            reasonLabel:'修改价格理由',
            reasonOptions:[
                {key:5, name:'修改价格理由'},
                {key:6, name:'修改运费理由'}
            ]
        };
    },
    components:{
        EmptyList,
    },
    // 计算属性
    computed:{
        setLabel:function() {
            return (data)=>{
                if(data === '后台发起退款原因'){
                    return '退款原因:'
                } if(data === '拒绝售后理由'){
                    return '拒绝理由:'
                } if(data === '修改价格理由' || data === '修改运费理由' ){
                    return '修改理由:'
                } else {
                    return data + ':'
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
    },
    created() {

    },
    mounted() {
        // 获取基础属性列表
        this.getDataList();
    },
    methods: {

        // 按钮-切换列表
        handleTabClick(tab, event) {
            this.selectedType = Number(tab.index);
            this.configLabel = tab.label;
            if(tab.label === '修改运费理由'){
                this.selectedType = 6;
                this.configLabel = '修改运费理由';
            }
            this.getDataList();
        },

        // 按钮- 新增
        handleAdd(){
            this.attrFormTitle = '新增' + this.activeName;
            this.$set(this.attrForm,'name','');
            this.attrDialogVisible = true;
        },

        // 属性弹窗保存
        saveAttrForm(){
            this.$refs['attrFormBox'].validate((valid) => {
                if (valid) {
                    // 新增 还是 编辑
                    let params = {
                        name: this.attrForm.name,
                        type: this.selectedType
                    };
                    if(this.attrFormTitle.indexOf('新增') > -1){
                        // 新增
                        this.attrAdd(params);
                    }else {
                        // 编辑
                        params['id'] = this.current_id;
                        this.attrEdit(params);
                    }
                }
            })
        },

        // 按钮- 编辑
        handleEdit(index, row){
            this.current_id = row.id;
            this.attrFormTitle = '编辑' + this.activeName;
            this.attrDialogVisible = true;
            this.$nextTick(()=> {
                // 触发更新
                this.$set(this.attrForm,'name',row.name);
            })
        },

        // 按钮- 删除
        handleDelete(index, row){
            // 二次确认删除
            this.$confirm('确定要删除该'+ this.activeName +'吗？', '', {
                customClass: 'message-delete',
                type: 'warning',
                center: true
            }).then(() => {
                let params = {
                    type: this.selectedType
                };
                params['id'] = row.id;
                this.getAttrDelete(params);
            }).catch(() => {});

        },

        // 获取列表
        getDataList(){
            let params = {
                type: this.selectedType
            };
            const rLoading = this.openLoading();
            queryReasonList(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.tableData = res.data || [];
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

        // 请求- 原因新增
        attrAdd(params){
            const rLoading = this.openLoading();
            addReason(params).then((res) => {
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
                    this.getDataList();
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

        // 请求- 原因编辑
        attrEdit(params){
            const rLoading = this.openLoading();
            updateReason(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.attrDialogVisible = false;
                    this.$notify({
                        title: '编辑成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    });
                    // 获取原因列表
                    this.getDataList();
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

        // 请求- 原因删除
        getAttrDelete(params){
            const rLoading = this.openLoading();
            deleteReason(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    this.$notify({
                        title: '删除成功',
                        message: '',
                        type: 'success',
                        duration: 3000
                    });

                    // 获取原因列表
                    this.getDataList();
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


        // 属性弹窗关闭前操作
        attrDialogClose(){
            this.$refs['attrFormBox'].clearValidate();
            this.$refs['attrFormBox'].resetFields();
            this.attrDialogVisible = false;
        },

        // 理由类型  下拉框 显示/隐藏
        selectReasonType(){
            this.reasonTypeShow = !this.reasonTypeShow;
        },

        // 选择 理由类型
        selectReasonItem(num,str){
            this.selectedType = num;
            let old_reasonLabel = this.reasonLabel;
            let old_activeName = this.activeName;
            this.reasonLabel = str;
            if(this.activeName === old_reasonLabel){
                this.activeName = str;
                if(old_activeName !== this.activeName){
                    this.getDataList();
                }
            }
            this.configLabel = this.activeName;
            this.reasonTypeShow = false;
        },

        cancelReasonType(){
            this.reasonTypeShow = false;
        },
    }
};
</script>
<style scoped="scoped" lang="less">
</style>
<style>
    .config-management-container .tabs-and-add .el-tabs__nav {
        height: 60px;
        line-height: 60px;
    }
    .config-management-container .tabs-and-add .el-tabs--top .el-tabs__item.is-top{
        padding:0 40px;
    }
    .config-management-container .tabs-and-add .el-tabs--top .el-tabs__item.is-top:nth-child(2) {
        padding-left: 24px;
        padding-right: 40px;
    }
</style>
<template>
    <div class="config-management-container container-wrap">
        <div class="container container-table-no-search p-t-0">
            <div class="tabs-and-add">
                <el-tabs v-model="activeName" @tab-click="handleTabClick">
                    <el-tab-pane label="退款原因" name="退款原因"></el-tab-pane>
                    <el-tab-pane label="退货原因" name="退货原因"></el-tab-pane>
                    <el-tab-pane label="换货原因" name="换货原因"></el-tab-pane>
                    <el-tab-pane label="后台发起退款原因" name="后台发起退款原因"></el-tab-pane>
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
            tableHeight: 'calc(100% - 100px)'
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
                }else {
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
    }
};
</script>
<style scoped="scoped" lang="less">
.config-management-container{
    .container{
        padding: 30px 0 15px;
        min-width: 900px;
    }
    .p-t-0 {
        padding-top: 0;
    }
    .tabs-and-add{
        position: relative;
        .el-tab-pane{
            position: relative;
        }
        .img-drop-down{
            position: absolute;
            width: 20px;
            height: 20px;
            top: 10px;
            right: 5px;
            background: transparent url(../../../assets/img/drop-down.svg) no-repeat 50% 50%;
        }
        .reason-list{
            position: absolute;
            top: 50px;
            left: 22px;
            width: 126px;
        //height: 102px;
            max-height: 200px;
            background: #FFFFFF;
            box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12);
            border-radius: 2px;
            overflow: hidden;
        ul,li{
            list-style: none;
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.65);
            line-height: 34px;
            user-select: none;
            -webkit-user-select: none;
        }
        li{
            padding-left: 16px;
            box-sizing: border-box;
            -webkit-box-sizing: border-box;
        &:hover{
             background: rgba(24, 144, 255, .7);
             color: #fff;
         }
        }
        .is_selected{
            background: #1890FF;
            color: #fff;
        }
        }
        .el-tabs__item.is-active{
            color: #1890FF;
            font-weight:500;
            box-shadow: none;
            -webkit-box-shadow: none;
            border: none;
        .img-drop-down{
            background: url(../../../assets/img/drop-down-selected.svg) no-repeat 50% 50%;
        }
        }
        .el-tabs__item.is-active.is-focus{
            box-shadow: none !important;
            -webkit-box-shadow: none !important;
            border: none !important;
        }
        /*选项卡切换*/
        .el-tabs__nav{
            height: 60px;
            line-height: 60px;
        }
        .el-tabs__item{
            padding: 0 25px;
            font-weight:400;
            font-size: 16px;
            font-family:PingFangSC-Regular,PingFang SC;
            color:#595959;
            user-select: none;
            -webkit-user-select: none;
        }
        .el-tabs__active-bar{
            background-color: #1890FF;
        }
        .el-tabs__nav-wrap{
            height: 60px;
            overflow: inherit;
        }
        .el-tabs__nav-scroll{
            height: 60px;
            overflow: inherit;
        }
        .el-tabs__nav-wrap::after{
            height: 1px;
            background-color: #E8E8E8;
        }
        .el-tabs__header{
            margin: 0 0 25px;
        }
        /*按钮-新增*/
        .btn-add{
            position: absolute;
            top: 14px;
            right: 30px;
            font-size: 14px !important;
            padding: 8px 15px !important;
        }
    }
    .el-table .cell{
        padding-left: 24px;
    }
    .attrDialog{

    }
    .attr-form{
        padding-top: 20px;
    }
    .el-dialog .el-dialog__body{
    //padding: 20px 24px 24px 24px !important;
    }
    .add-floor-box{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0 20px;
        span{
            display: inline-block;
            line-height: 25px;
        }
        .shelf-capacity{
            background: rgba(255, 77, 79, 0.05);
            border-radius: 14px;
            color: #FF4D4F;
            height: 25px;
            padding: 0 12px;
        }
        .add-floor{
            color: #1890FF;
            cursor: pointer;
            display: flex;
            i{
                font-size: 20px;
                line-height: 25px;
            }
            .add-text{
                font-size: 14px;
                margin-left: 5px;
            }
        }
    }
    .floors-box{
        .el-input{
            width: 214px !important;
        }
        .el-button--small{
            margin-left: 12px;
            padding: 8px 15px;
            font-size: 14px;
        }
    }
    .add-shelf-dialog{
        .el-radio__label,.el-dialog__body,.el-form-item__label{
            font-weight: 400;
            color: rgba(0, 0, 0, 0.85);
        }
    }
}
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
<template>
    <div class="operation-role-page">
        <div class="role-content">
            <div class="global-table-title border-bottom">
                <div class="title">
                    <i></i>
                    <span>角色信息</span>
                </div>
            </div>
            <el-form
                ref="roleForm"
                :model="roleForm"
                label-width="80px"
                :inline="true"
                class="role-form"
                :rules="roleRules"
            >
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="roleForm.name" placeholder="请输入名称"></el-input>
                </el-form-item>
                <el-form-item label="描述" prop="remark">
                    <el-input v-model="roleForm.remark" placeholder="请输入"></el-input>
                </el-form-item>
            </el-form>
        </div>
        <div class="role-content m-t-16 auth-content">
            <div class="global-table-title border-bottom">
                <div class="title">
                    <i></i>
                    <span>权限分配</span>
                </div>
            </div>
            <el-tree
                :data="allAuthorityList"
                show-checkbox
                ref="authTree"
                node-key="id"
                default-expand-all
                :props="defaultProps"
            ></el-tree>
            <div class="bottom-button">
                <el-button type="primary" v-hasPermission="'role-update'" @click="handleSave('roleForm')">保存</el-button>
            </div>
        </div>
        <!-- 修改密码弹出框 -->
        <el-dialog
                title="修改权限"
                :visible.sync="tipVisible"
                width="380px"
                destroy-on-close="destroy-on-close"
                :before-close="changePasswordClose"
                :close-on-click-modal="false"
        >
            <div>您正在修改当前登录角色的权限，保存成功后需要重新登录，是否继续？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="changePasswordClose">再想想</el-button>
                <el-button type="primary" @click="carryOnSave()">继 续</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import './RoleManagement.less';
import {getAuthorityList} from '../../../../api/authority';
import {getHasCheckedAuthList, addRole, editRoleBase, editRoleAuth} from '../../../../api/role';
import { addUser, editUserInfo } from '../../../../api/user';
export default {
    name: 'OperationRoleModule',
    data() {
        return {
            roleForm: {},
            roleRules: {
                name: [
                    { required: true, message: '请输入名称' },
                    { max: 50, message: '角色名称最多可输入50个字符', trigger: 'blur' }
                ],
                remark: [
                    { required: true, message: '请输入' },
                    { max: 255, message: '备注最多可输入255个字符', trigger: 'blur' }
                ]
            },
            allAuthorityList:[],
            defaultProps: {
                children: 'children',
                label: 'display_name'
            },
            roleHasAuthList: [],
            user_info:{},
            base_params:{},
            auth_request:{},
            tipVisible:false,
            all_update:false, // false 只修改基础 true 基础、权限全部修改
            base_update:false,  // 基础信息是否修改
        };
    },
    watch: {
    },
    created() {
        this.user_info = JSON.parse(localStorage.getItem('login_user_info'));
    },
    mounted() {
        // 获取详情
        this.getRoleDetail();
        // 请求-获取全部权限列表
        this.getAllAuthority();
    },
    methods: {
        getRoleDetail(){
            if(this.$route.query.id){
                let obj = { id: this.$route.query.id,name:this.$route.query.name,remark:this.$route.query.remark};
                this.roleForm = Object.assign({}, this.roleForm,obj);
            }
        },
        // 处理数据
        processData(data){
            let dealOptions = [];
            data.forEach((ev, one) => {
                ev.children = []
            })
            data.forEach((ev, one) => {
                let findIndex = data.findIndex( (item) => item.id === ev.pid)
                if ((!ev.pid && ev.pid !== 0 && ev.pid !== false) || findIndex === -1) {
                    dealOptions.push(ev)
                } else {
                    data[findIndex].children.push(ev)
                }
            });
            return dealOptions
        },

        // 请求-获取全部权限列表
        getAllAuthority(){
            getAuthorityList({page:1,limit:9999}).then(res=>{
                if(res.code === 200){
                    this.allAuthorityList = this.processData(res.data.lists);
                    // 如果是编辑页面 - 去获取 角色 对应权限
                    if(this.$route.query.id){
                        let params = {
                            role_id: Number(this.$route.query.id)
                        };
                        this.getRoleHasAuth(params);
                    }

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

        // 保存按钮
        handleSave(formName){
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    let params = {};  // 修改基础信息参数
                    let request = {}; // 修改权限参数
                    params['name'] = this.roleForm.name;
                    params['remark'] = this.roleForm.remark;
                    let  checked_arr = this.$refs.authTree.getCheckedKeys().concat(this.$refs.authTree.getHalfCheckedKeys());
                    request['permission_ids'] = checked_arr.join();
                    if(this.$route.query.id){
                        //  编辑角色
                        let old_auth_arr = [];
                        this.roleHasAuthList.forEach((ev)=>{
                            old_auth_arr.push(ev.permission_id);
                        })
                        const flag1 = params['name'] === this.$route.query.name;     // 角色名称未改变
                        const flag2 = params['remark'] === this.$route.query.remark; // 角色备注未改变
                        const flag3 = JSON.stringify(old_auth_arr.sort()) === JSON.stringify(checked_arr.sort())     // 角色权限未改变
                        // return false
                        params['id'] = Number(this.$route.query.id);
                        request['role_id'] = Number(this.$route.query.id);
                        this.base_params = params;
                        this.auth_request = request;
                        this.all_update = false;
                        this.base_update = false;
                        if(flag1 && flag2 && flag3){
                            this.$notify({
                                title: '您还未做任何修改哦～',
                                message: '',
                                type: 'error',
                                duration: 5000
                            });
                        }else {
                            if(flag3){ // 权限未修改 只修改了基础信息
                                //  修改-基础信息
                                this.base_update = true;
                                this.roleBaseUpdate(params,false,{});
                            }else if(flag1 && flag2){  // 只修改了权限
                                // 如果编辑权限的角色是当前登录角色
                                if(this.user_info.role_id === Number(this.$route.query.id)){
                                    this.base_update = false;
                                    this.tipVisible = true;
                                }else {
                                    this.authUpdate(request);
                                }
                            } else {   // 都有修改
                                this.base_update = true;
                                this.all_update = true;
                                // 如果编辑权限的角色是当前登录角色
                                if(this.user_info.role_id === Number(this.$route.query.id)){
                                    this.tipVisible = true;
                                }else {
                                    // 先修改基础属性-请求成功再修改权限
                                    this.roleBaseUpdate(params,true,request);
                                }
                            }
                        }
                    }else {
                        // 新增角色
                        this.roleAdd(params, request);
                    }
                }
            })

        },

        // 请求 - 新增角色
        roleAdd(params, request){
            const rLoading = this.openLoading();
            addRole(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    //  分配权限
                    request['role_id'] = res.data.role_id;
                    this.authUpdate(request);
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

        // 请求-获取角色拥有权限列表
        getRoleHasAuth(params){
            getHasCheckedAuthList(params).then((res)=>{
                if(res.code === 200){
                    if(res.data){
                        this.roleHasAuthList = res.data;
                        // 处理数据---去掉父级id ps：加入父级id 会造成该节点全选
                        this.filterData(this.roleHasAuthList);
                        let that = this;
                        setTimeout(()=>{
                            this.roleHasAuthList.forEach((ev)=>{
                                let value = ev.permission_id;
                                that.$refs.authTree.setChecked(value, true, false);
                            })
                        },0)
                    }
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

        // 处理数据---去掉父级id ps：加入父级id 会造成该节点全选
        filterData(list){
            let ids_arr = [];
            list.forEach((ev)=>{
                ids_arr.push(ev);
            });

        },

        // 请求-角色权限修改
        authUpdate(params){
            const rLoading = this.openLoading();
            editRoleAuth(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    if(this.user_info.role_id === Number(this.$route.query.id)){
                        this.$notify({
                            title: '保存成功,请重新登录',
                            message: '',
                            type: 'success',
                            duration: 3000
                        });
                        this.$signOut();
                        setTimeout(()=>{
                            this.$router.push({path:'/login'});
                        },500)
                    }else {
                        this.$notify({
                            title: '保存成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        });
                        setTimeout(()=>{
                            this.$router.push({path:'/role-management'});
                            this.$nextTick(()=>{
                                this.closeSpecifyPage('编辑角色');
                            })
                        },1000)
                    }
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

        // 修改角色基础信息
        roleBaseUpdate(params,authUpdate,request){
            const rLoading = this.openLoading();
            editRoleBase(params).then((res) => {
                rLoading.close();
                if(res.code === 200){
                    if(authUpdate){
                        //  修改-分配权限
                        this.authUpdate(request);
                    }else {
                        this.$notify({
                            title: '保存成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        });
                        this.closePage();
                        setTimeout(()=>{
                            this.$router.push({path:'/role-management'});
                        },800)
                        /*setTimeout(()=>{
                            this.closeSpecifyPage('编辑角色');
                        },1000)*/
                    }

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

        disabledFn() {
            // if (this.dialogtitle == "编辑") {
            //     return true
            // } else if (this.dialogtitle == "新建") {
            //     return false
            // }
        },
        changePasswordClose() {
            this.tipVisible = false;
        },

        // 确定继续保存 - 保存成功后跳转登录
        carryOnSave(){
            if(this.base_update){
                this.roleBaseUpdate(this.base_params,false,{});
            }else {
                this.roleBaseUpdate(this.base_params,true,this.auth_request);
            }
        }

    }
};
</script>
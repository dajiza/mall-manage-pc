<template>
    <div class="user-container container-wrap" id="containerWrap">
        <div class="container clearfix" ref="searchBox">
            <div class="handle-box">
                <el-form :model="searchForm" :inline="true" ref="searchForm" label-width="80px">
                    <el-form-item label="登录账户:" prop="account">
                        <el-input v-model="searchForm.user_name" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="角色名称:" prop="roleName">
                        <el-select v-model="searchForm.role_id" placeholder="请选择" clearable>
                            <el-option
                                v-for="state in roleNameOptions"
                                :key="state.key"
                                :value="state.key"
                                :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="用户状态:" prop="userStatus">
                        <el-select v-model="searchForm.status" placeholder="请选择" clearable>
                            <el-option
                                v-for="state in userStatusOptions"
                                :key="state.key"
                                :value="state.key"
                                :label="state.name"
                            />
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
            <div class="btn-right">
                <!--<el-button @click="resetForm('searchForm')">重置</el-button>-->
                <el-button type="primary" @click="handleSearch('searchForm')">搜索</el-button>
                <el-button type="success" v-hasPermission="'user-create'" @click="handAddUser('add')">添加用户</el-button>
            </div>
        </div>
        <div class="container container-table-has-search m-t-16 p-t-0">
            <div class="global-table-title">
                <div class="title">
                    <i></i>
                    <span>用户列表</span>
                </div>
            </div>
            <el-table
                v-loading="loading"
                :data="tableData"
                ref="multipleTable"
                :height="tableHeight"
            >
                <el-table-column label="编号" width="75" align="left" type="index">
                    <template scope="scope">
                        <span>{{(pageInfo.pageIndex - 1) * pageInfo.pageSize + scope.$index + 1}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="nick_name" label="用户名"></el-table-column>
                <el-table-column prop="user_name" label="登录账户" width="120"></el-table-column>
                <el-table-column prop="role_name" width="120" label="角色名称"></el-table-column>
                <el-table-column prop="status" width="120" label="用户状态">
                    <template scope="scope">
                        <span
                            class="status-ball"
                            :class="scope.row.status===1?'color-success':'color-err'"
                        ></span>
                        <span
                            :class="scope.row.status >  0 ? 'font-use' : 'font-stop'"
                        >{{scope.row.status > 0 ? '启用' : '停用'}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="phone_no" label="手机号" width="130"></el-table-column>
                <el-table-column width="140" prop="role_id" label="是否超级管理员">
                    <template scope="scope">
                        <span>{{scope.row.is_admin > 0 ? '是' : '否'}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注">
                    <template scope="scope">
                        <el-tooltip placement="top" effect="light" popper-class="tooltip-remark">
                            <div slot="content" class="remark-box">
                                <div class="remark-title">备注</div>
                                <div class="remark-content">{{scope.row.remark || '暂无备注'}}</div>
                            </div>
<!--                            <i class="el-icon-warning cursor-class"></i>-->
                            <i class="remark-tip-img cursor-class"></i>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column width="185" prop="updated_time" label="最后登录时间"></el-table-column>
                <el-table-column width="185" prop="created_time" label="创建时间"></el-table-column>
                <el-table-column label="操作" width="240">
                    <template slot-scope="scope">
                        <div style="display: inline-block" v-hasPermission="'user-update'">
                            <el-button type="text" class="marginRight32"
                                    @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                            <el-button type="text" class="marginRight32 marginLeft0"
                                    @click="changePassword(scope.$index, scope.row)"
                            >修改密码</el-button>
                            <el-button v-show="scope.row.status===1"
                                    class="marginLeft0" type="text" @click="handleStop(scope.$index, scope.row)"
                            >停用</el-button>
                            <el-button v-show="scope.row.status===0"
                                    class="marginLeft0" type="text" @click="handleEnable(scope.$index, scope.row)"
                            >启用</el-button>
                        </div>
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
                    :current-page="pageInfo.pageIndex"
                    :page-size="pageInfo.pageSize"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>

        <!-- 添加新用户/编辑用户弹出框 -->
        <el-dialog
            :title="addOrEdit === 'add'?'添加新用户':'编辑'"
            :visible.sync="editVisible"
            width="660px"
            :before-close="editClose"
            :destroy-on-close="true"
            :close-on-click-modal="false"
        >
            <el-form ref="editForm" :rules="editFormRules" :model="editForm">
                <div class="form-content">
                    <div class="form-left">
                        <el-form-item label="姓名" prop="nick_name">
                            <el-input v-model="editForm.nick_name" placeholder="请输入姓名"></el-input>
                        </el-form-item>
                        <el-form-item v-if="addOrEdit === 'add'" label="密码" prop="password">
                            <el-input v-model="editForm.password" placeholder="请输入密码" show-password="show-password"></el-input>
                        </el-form-item>
                        <el-form-item label="角色名称" prop="role_id">
                            <el-select v-model="editForm.role_id" placeholder="请选择角色">
                                <el-option
                                    v-for="state in roleNameOptions"
                                    :key="state.key"
                                    :value="state.key"
                                    :label="state.name"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="是否是超级会员" prop="is_admin">
                            <el-select v-model="editForm.is_admin" placeholder="请选择">
                                <el-option
                                    v-for="state in isSuperOptions"
                                    :key="state.key"
                                    :value="state.key"
                                    :label="state.name"
                                />
                            </el-select>
                        </el-form-item>
                    </div>
                    <div class="form-right">
                        <el-form-item v-if="addOrEdit === 'add'" label="登录账号" prop="user_name">
                            <el-input v-model="editForm.user_name" placeholder="请输入登录账号"></el-input>
                        </el-form-item>
                        <el-form-item label="手机号" prop="phone_no">
                            <el-input v-model="editForm.phone_no" placeholder="请输入手机号码"></el-input>
                        </el-form-item>
                        <el-form-item label="状态选择" prop="status">
                            <el-select v-model="editForm.status" placeholder="请选择状态">
                                <el-option
                                    v-for="state in userStatusOptions"
                                    :key="state.key"
                                    :value="state.key"
                                    :label="state.name"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="备注" prop="remark">
                            <el-input v-model="editForm.remark" placeholder="请填写备注"></el-input>
                        </el-form-item>
                    </div>
                </div>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editClose">取 消</el-button>
                <el-button type="primary" @click="saveEdit('editForm')">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改密码弹出框 -->
        <el-dialog
            title="修改密码"
            :visible.sync="changePasswordVisible"
            width="380px"
            destroy-on-close="destroy-on-close"
            :before-close="changePasswordClose"
            :close-on-click-modal="false"
        >
            <el-form
                ref="changePasswordForm"
                :rules="changePasswordRules"
                :model="changePasswordForm"
            >
                <el-form-item label="新密码" prop="password">
                    <el-input v-model="changePasswordForm.password" placeholder="输入新密码"
                              show-password="show-password"></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="passwordSure">
                    <el-input v-model="changePasswordForm.passwordSure" placeholder="确认新密码"
                              show-password="show-password"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="changePasswordClose">取 消</el-button>
                <el-button type="primary" @click="savePassword('changePasswordForm')">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { getUserList, addUser, editUserInfo } from '../../../../api/user';
import { getRoleList } from '../../../../api/role';
import EmptyList from '../../../common/empty-list/EmptyList';
import {isvalidPass} from '../../../../utils/validate';
import './UserList.less';
export default {
    name: 'userList',
    data() {
        // 自定义手机号验证
        var checkMobile = (rule, value, callback) => {
            const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[3678]|18[0-9]|14[57])[0-9]{8}$/;
            if (regMobile.test(value)) {
                return callback();
            }
            callback(new Error('请输入合法的手机号'));
        };
        var validatePass = (rule, value, callback) => {
            if (value === "") {
                callback(new Error("请输入密码"));
            } else if (!isvalidPass(value)) {
                callback(
                    new Error("密码以字母开头 长度在8~18之间 只能包含字母、数字和下划线")
                );
            } else {
                // if (this.formData.repassword !== "") {
                //     this.$refs.ruleForm.validateField("repassword");
                // }
                callback();
            }
        };
        var validatePass2 = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'));
            } else if (value !== this.changePasswordForm.password) {
                callback(new Error('两次输入密码不一致!'));
            } else {
                callback();
            }
        };
        return {
            searchForm: {
                user_name: '',
                role_id: '',
                status: ''
            },
            pageInfo: {
                name: '',
                pageIndex: 1,
                pageSize: 10
            },
            addOrEdit: '', // 新增或者编辑用户
            loading: false,
            tableData: [],
            editVisible: false,
            pageTotal: 0, // 总条数
            editForm: {
                user_name: '',
                password: '',
                role_id: '',
                is_admin: '',
                nick_name: '',
                phone_no: '',
                status: '',
                remark: ''
            },
            editFormRules: {
                user_name: [
                    { required: true, message: '请输入姓名', trigger: 'blur' },
                    { max: 40, message: '请输入40位以内姓名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 16, message: '请输入6-16位密码', trigger: 'blur' },
                ],
                role_id: [{ required: true, message: '请选择角色名称', trigger: 'blur' }],
                is_admin: [{ required: true, message: '请选择是否是超级管理员', trigger: 'blur' }],
                nick_name: [
                    { required: true, message: '请输入登录账号', trigger: 'blur' },
                    { max: 100, message: '请输入100位以内登录账号', trigger: 'blur' }],
                phone_no: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    {
                        validator: checkMobile,
                        trigger: 'blur'
                    }
                ],
                status: [{ required: true, message: '请选择状态', trigger: 'blur' }],
                remark: [
                    { required: true, message: '请填写备注', trigger: 'blur' },
                    { max: 255, message: '备注最多可输入255个字符', trigger: 'blur' }
                ]
            },
            idx: -1,
            id: -1,
            roleNameOptions: [],
            userStatusOptions: [],
            isSuperOptions: [],
            operationalUserInfo: {},
            operationalUserId: -1,
            operationalIndex: -1,
            changePasswordVisible: false, // 修改密码 弹窗是否显示
            changePasswordForm: {
                password: '',
                passwordSure: ''
            },
            changePasswordRules: {
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 16, message: '请输入6-16位密码', trigger: 'blur' }
                ],
                passwordSure: [{ required: true, validator: validatePass2, trigger: 'blur' }]
            },
            searchParams: {
                user_name: '',
                role_id: '',
                status: ''
            },
            tableHeight: 'calc(100% - 134px)'
        };
    },
    components: {
        EmptyList
    },
    created() {
        // 用户状态
        this.userStatusOptions = [
            { key: '1', name: '启用' },
            { key: '0', name: '停用' }
        ];
        // 是否超级管理员
        this.isSuperOptions = [
            { key: '1', name: '是' },
            { key: '0', name: '否' }
        ];
    },
    mounted() {
        // 获取角色列表数据
        this.getRoleData();
        // 获取用户列表数据
        this.getUserData();
        // 获取搜索容器高度
        const searchBoxHeight = this.$refs.searchBox.offsetHeight;
        const containerHasSearch = document.getElementsByClassName('container-table-has-search')[0];
        containerHasSearch.style.height = `calc(100% - 16px - ${searchBoxHeight}px)`;
    },
    methods: {
        indexMethod(index) {
            index = index + 1 + (this.pageInfo.pageIndex - 1) * this.pageInfo.pageSize;
            return index;
        },
        // 请求-获取用户列表数据
        getUserData() {
            let params = {
                page: this.pageInfo.pageIndex,
                limit: this.pageInfo.pageSize,
                user_name: this.searchParams.user_name ? this.searchParams.user_name : '-1',
                role_id: this.searchParams.role_id ? Number(this.searchParams.role_id) : -1,
                status: this.searchParams.status ? Number(this.searchParams.status) : -1
            };
            const rLoading = this.openLoading();
            getUserList(params)
                .then((res) => {
                    rLoading.close();
                    if (res.code === 200) {
                        if (res.data.lists) {
                            this.tableData = res.data.lists;
                            this.pageTotal = res.data.total;
                        } else {
                            this.tableData = [];
                            this.pageTotal = 0;
                        }
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
        // 请求-获取角色列表数据
        getRoleData() {
            let params = {
                page: 1,
                limit: 999
            };
            getRoleList(params)
                .then((res) => {
                    if (res.code === 200) {
                        this.roleNameOptions = [];
                        if (res.data.lists) {
                            res.data.lists.forEach((ev, i) => {
                                this.roleNameOptions.push({
                                    key: ev.id,
                                    name: ev.name
                                });
                            });
                        }
                    } else {
                    }
                })
                .catch(() => {});
        },

        // 请求-添加用户
        sureAddUser(params) {
            const rLoading = this.openLoading();
            addUser(params)
                .then((res) => {
                    rLoading.close();
                    if (res.code === 200) {
                        this.editVisible = false;
                        this.$notify({
                            title: '操作成功',
                            message: '',
                            type: 'success',
                            duration: 3000
                        });
                        this.getUserData();
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
        // 请求-编辑用户
        editUser(params) {
            const rLoading = this.openLoading();
            editUserInfo(params)
                .then((res) => {
                    rLoading.close();
                    if (res.code === 200) {
                        if (this.editVisible) {
                            this.editVisible = false;
                        }
                        if (this.changePasswordVisible) {
                            this.changePasswordVisible = false;
                        }
                        if(Number(params.user_id) === Number(localStorage.getItem('userId'))){
                            const InfoObj = {
                                id: Number(params.user_id),
                                is_admin: Number(params.is_admin),
                                nick_name: params.nick_name,
                                phone_no: params.phone_no,
                                role_id: Number(params.role_id),
                                status: Number(params.status),
                                user_name: localStorage.getItem('ms_username'),
                            }
                            localStorage.setItem('is_admin', InfoObj.is_admin.toString());
                            localStorage.setItem('login_user_info', JSON.stringify(InfoObj));
                            // 用户是否超级管理员 身份 修改 ，返回重新登录
                            if(Number(InfoObj.is_admin) !== Number(localStorage.getItem('is_admin'))){
                                this.$notify({
                                    title: '操作成功,请重新登录',
                                    message: '',
                                    type: 'success',
                                    duration: 3000
                                });
                                this.$signOut();
                                setTimeout(()=>{
                                    this.$router.push({path:'/login'});
                                },500)
                            }else {
                                this.$notify({ title: '操作成功', message: '', type: 'success', duration: 3000 });
                                this.getUserData();
                            }
                        }else {
                            this.$notify({
                                title: '操作成功',
                                message: '',
                                type: 'success',
                                duration: 3000
                            });
                            this.getUserData();
                        }
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
        // 按钮-触发搜索按钮
        handleSearch(formName) {
            this.$set(this.pageInfo, 'pageIndex', 1);
            //  存储搜索条件
            this.searchParams['user_name'] = this.searchForm.user_name;
            this.searchParams['role_id'] = this.searchForm.role_id;
            this.searchParams['status'] = this.searchForm.status;
            this.getUserData();
        },
        // 按钮-添加用户
        handAddUser() {
            this.addOrEdit = 'add';
            this.editVisible = true;
            this.$nextTick(() => {
                let new_obj = {};
                new_obj['nick_name'] = '';
                new_obj['phone_no'] = '';
                new_obj['is_admin'] = '';
                new_obj['role_id'] = '';
                new_obj['status'] = '';
                new_obj['password'] = '';
                new_obj['remark'] = '';
                // 触发更新
                this.editForm = Object.assign({}, this.editForm, new_obj);
            })
        },
        // 按钮-编辑用户
        handleEdit(index, row) {
            this.addOrEdit = 'edit';
            this.operationalUserId = row.id;
            this.idx = index;
            this.editVisible = true;
            this.$nextTick(() => {
                // 赋值
                let new_obj = {};
                new_obj['nick_name'] = row.nick_name;
                new_obj['phone_no'] = row.phone_no;
                new_obj['is_admin'] = row.is_admin > 0 ? '1' : '0';
                new_obj['role_id'] = row.role_id;
                new_obj['status'] = row.status > 0 ? '1' : '0';
                new_obj['password'] = '-1';
                new_obj['remark'] = row.remark;
                // 触发更新
                this.editForm = Object.assign({}, this.editForm, new_obj);
            });
        },
        // 请求-保存编辑
        saveEdit(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.$nextTick(() => {
                        let params = {};
                        params['nick_name'] = this.editForm.nick_name;
                        params['phone_no'] = this.editForm.phone_no;
                        params['is_admin'] = this.editForm.is_admin > 0 ? 1 : 0;
                        params['role_id'] = Number(this.editForm.role_id);
                        params['status'] = this.editForm.status > 0 ? 1 : 0;
                        params['remark'] = this.editForm.remark;
                        if (this.addOrEdit === 'edit') {
                            params['password'] = '-1';
                            params['user_id'] = this.operationalUserId;
                            this.editUser(params);
                        } else {
                            params['user_name'] = this.editForm.user_name;
                            params['password'] = this.editForm.password;
                            this.sureAddUser(params);
                        }
                    });
                } else {
                    return false;
                }
            });
        },
        // 按钮-分页导航
        handlePageChange(val) {
            this.$set(this.pageInfo, 'pageIndex', val);
            if (this.searchParams['name']) {
                this.$set(this.searchForm, 'name', this.searchParams['name']);
            }
            if (this.searchParams['role_id']) {
                this.$set(this.searchForm, 'role_id', this.searchParams['role_id']);
            }
            if (this.searchParams['status']) {
                this.$set(this.searchForm, 'status', this.searchParams['status']);
            }
            this.getUserData();
        },
        // 按钮-重置
        resetForm(formName) {
            this.$refs[formName].resetFields();
            this.$set(this.pageInfo, 'pageIndex', 1);
            this.getUserData();
        },
        //  按钮-启用操作
        handleEnable(index, row) {
            this.operationalUserId = row.id;
            this.operationalIndex = index;
            let params = {};
            params['user_id'] = row.id;
            params['nick_name'] = row.nick_name;
            params['phone_no'] = row.phone_no;
            params['is_admin'] = row.is_admin;
            params['role_id'] = row.role_id;
            params['remark'] = row.remark;
            params['status'] = 1;
            params['password'] = '-1';
            this.editUser(params);
        },
        //  按钮-停用操作
        handleStop(index, row) {
            // 二次确认删除
            this.$confirm('确定要停用该用户吗？', '', {
                customClass: 'message-delete',
                type: 'warning',
                center: true
            })
                .then(() => {
                    let params = {};
                    params['user_id'] = row.id;
                    params['nick_name'] = row.nick_name;
                    params['phone_no'] = row.phone_no;
                    params['is_admin'] = row.is_admin;
                    params['role_id'] = row.role_id;
                    params['status'] = 0;
                    params['password'] = '-1';
                    params['remark'] = row.remark;
                    // let params = JSON.parse(JSON.stringify(row));
                    // delete params['user_name'];
                    // params['status'] = 0;
                    // params['password'] = '-1';
                    // params['user_id'] = row.id;
                    this.editUser(params);
                })
                .catch(() => {});
        },

        // 按钮-修改密码
        changePassword(index, row) {
            this.operationalIndex = index;
            this.operationalUserInfo = {};
            this.changePasswordVisible = true;
            // 赋值
            this.operationalUserInfo['user_id'] = row.id;
            this.operationalUserInfo['nick_name'] = row.nick_name;
            this.operationalUserInfo['phone_no'] = row.phone_no;
            this.operationalUserInfo['is_admin'] = row.is_admin;
            this.operationalUserInfo['role_id'] = row.role_id;
            this.operationalUserInfo['status'] = row.status;
            this.operationalUserInfo['password'] = '-1';
            this.operationalUserInfo['remark'] = row.remark;
        },
        // 保存更改密码
        savePassword(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    let params = this.operationalUserInfo;
                    params['password'] = this.changePasswordForm.password;
                    this.editUser(params);
                }
            });
        },
        editClose() {
            this.$refs['editForm'].resetFields();
            this.$refs['editForm'].clearValidate();
            this.editVisible = false;
        },
        changePasswordClose() {
            this.$refs['changePasswordForm'].resetFields();
            this.$refs['changePasswordForm'].clearValidate();
            this.changePasswordVisible = false;
        }
    }
};
</script>

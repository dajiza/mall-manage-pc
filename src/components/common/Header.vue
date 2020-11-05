<template>
    <div class="header">
        <!-- 折叠按钮 -->
        <div class="collapse-btn" @click="collapseChage">
            <i v-if="!collapse" class="el-icon-s-fold"></i>
            <i v-else class="el-icon-s-unfold"></i>
        </div>
        <div class="logo">
            <img class="menu-logo" src="../../assets/img/menu-logo.svg" />
            川水仓库管理系统
        </div>
        <div class="header-right">
            <div class="header-user-con">
                <!-- 全屏显示 -->
                <!--<div class="btn-fullscreen" @click="handleFullScreen">
                    <el-tooltip effect="dark" :content="fullscreen?`取消全屏`:`全屏`" placement="bottom">
                        <i class="el-icon-rank"></i>
                    </el-tooltip>
                </div>-->
                <!-- 消息中心 -->
                <!--<div class="btn-bell">
                    <el-tooltip
                        effect="dark"
                        :content="message?`有${message}条未读消息`:`消息中心`"
                        placement="bottom"
                    >
                        <router-link to="/tabs">
                            <i class="el-icon-bell"></i>
                        </router-link>
                    </el-tooltip>
                    <span class="btn-bell-badge" v-if="message"></span>
                </div>-->
                <!-- 用户头像 -->
                <div class="user-avator">
                    <img src="../../assets/img/img.jpg" />
                </div>
                <!-- 用户名下拉菜单 -->
                <el-dropdown class="user-name" trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        {{ username }}
                        <i class="el-icon-caret-bottom"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <!--a href="https://github.com/lin-xin/vue-manage-system" target="_blank">
                            <el-dropdown-item>项目仓库</el-dropdown-item>
                        </a>-->
                        <el-dropdown-item divided command="updatePassword">修改密码</el-dropdown-item>
                        <el-dropdown-item divided command="loginout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
        <!-- 修改密码弹出框 -->
        <el-dialog title="修改密码" :visible.sync="changePasswordVisible" width="380px" destroy-on-close="destroy-on-close" :before-close="changePasswordClose" :close-on-click-modal="false">
            <el-form ref="changePasswordForm" :rules="changePasswordRules" :model="changePasswordForm">
                <el-form-item label="新密码" prop="password">
                    <el-input v-model="changePasswordForm.password" placeholder="输入新密码" show-password="show-password"></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="passwordSure">
                    <el-input v-model="changePasswordForm.passwordSure" placeholder="确认新密码" show-password="show-password"></el-input>
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
import { removeToken } from '../../utils/auth';
import bus from '../common/bus';
import { editUserInfo } from '../../api/user';
export default {
    data() {
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
            collapse: false,
            fullscreen: false,
            name: 'cs',
            message: 2,
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
            user_info: {}
        };
    },
    computed: {
        username() {
            let username = localStorage.getItem('ms_username');
            return username ? username : this.name;
        }
    },
    methods: {
        // 用户名下拉菜单选择事件
        handleCommand(command) {
            if (command === 'loginout') {
                this.$signOut();
                console.log('loginout');
                // localStorage.removeItem('ms_username');
                // localStorage.removeItem('is_admin');
                // localStorage.removeItem('roleAuthList');
                // localStorage.removeItem('userId');
                // localStorage.removeItem('login_user_info');
                // removeToken();
                this.$router.push('/login');
            } else if (command === 'updatePassword') {
                this.user_info = JSON.parse(localStorage.getItem('login_user_info'));
                this.changePasswordVisible = true;
            }
        },
        // 侧边栏折叠
        collapseChage() {
            this.collapse = !this.collapse;
            bus.$emit('collapse', this.collapse);
        },
        // 全屏事件
        handleFullScreen() {
            let element = document.documentElement;
            if (this.fullscreen) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } else {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.webkitRequestFullScreen) {
                    element.webkitRequestFullScreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.msRequestFullscreen) {
                    // IE11
                    element.msRequestFullscreen();
                }
            }
            this.fullscreen = !this.fullscreen;
        },
        // 修改密码弹窗关闭
        changePasswordClose() {
            this.$refs['changePasswordForm'].resetFields();
            this.$refs['changePasswordForm'].clearValidate();
            this.changePasswordVisible = false;
        },
        // 保存更改密码
        savePassword(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    let params = this.user_info;
                    params['user_id'] = params.id;
                    params['password'] = this.changePasswordForm.password;
                    this.editUser(params);
                }
            });
        },
        // 请求-编辑用户
        editUser(params) {
            const rLoading = this.openLoading();
            editUserInfo(params)
                .then(res => {
                    rLoading.close();
                    if (res.code === 200) {
                        this.changePasswordVisible = false;
                        this.$notify({
                            title: '修改成功,请重新登录',
                            message: '',
                            type: 'success',
                            duration: 3000
                        });
                        // 重新登录
                        this.$signOut();
                        this.$router.push('/login');
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
        }
    },
    mounted() {
        /*if (document.body.clientWidth < 1500) {
            this.collapseChage();
        }*/
    }
};
</script>
<style scoped>
.header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 48px !important;
    background-color: #fff;
    color: #fff;
    font-size: 22px;
}
.collapse-btn {
    position: absolute;
    z-index: 10;
    float: left;
    padding: 0 21px;
    line-height: 48px !important;
    cursor: pointer;
}
.header .logo {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding-left: 14px;
    width: 208px;
    height: 60px;
    background-color: #001529;
    box-shadow: 2px 0px 6px 0px rgba(0, 21, 41, 0.35);
    font-size: 17px;
    line-height: 60px;
}
.header .logo .menu-logo {
    display: inline-block;
    margin-right: 10px;
    width: 30px;
    height: 30px;
    vertical-align: middle;
}
.header-right {
    float: right;
    padding-right: 50px;
}
.header-user-con {
    display: flex;
    align-items: center;
    height: 48px;
}
.btn-fullscreen {
    margin-right: 5px;
    font-size: 24px;
    transform: rotate(45deg);
}
.btn-bell,
.btn-fullscreen {
    position: relative;
    width: 30px;
    height: 30px;
    border-radius: 15px;
    text-align: center;
    cursor: pointer;
}
.btn-bell-badge {
    position: absolute;
    top: -2px;
    right: 0;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: #f56c6c;
    color: #fff;
}
.btn-bell .el-icon-bell {
    color: #fff;
}
.user-name {
    margin-left: 10px;
}
.user-avator {
    margin-left: 20px;
}
.user-avator img {
    display: block;
    width: 24px;
    height: 24px;
    border-radius: 50%;
}
.el-dropdown-link {
    color: rgba(0, 0, 0, 0.65);
    font-weight: 400;
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    cursor: pointer;
}
.el-dropdown-menu__item {
    text-align: center;
}
</style>

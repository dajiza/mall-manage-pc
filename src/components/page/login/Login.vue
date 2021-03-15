<template>
    <div class="login-wrap">
        <div class="login-container">
            <div class="ms-login">
                <div class="ms-title">
                    <img class="login-logo" src="../../../assets/img/login-logo.svg" alt="" />
                    <span>川水商城管理系统</span>
                </div>
                <el-form :model="loginForm" :rules="rules" ref="login" label-width="0px" class="ms-content">
                    <el-form-item prop="username">
                        <el-input placeholder="用户名" prefix-icon="el-icon-lx-people" v-model="loginForm.username"></el-input>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input
                            placeholder="密码"
                            prefix-icon="el-icon-lx-lock"
                            show-password="show-password"
                            v-model="loginForm.password"
                            @keyup.enter.native="submitForm()"
                        ></el-input>
                    </el-form-item>
                    <div class="vCode-wrap" v-show="vCodeShow">
                        <el-form-item prop="vCode" :rules="{ required: vCodeShow, message: '请输入验证码', trigger: 'blur' }">
                            <el-input
                                placeholder="验证码"
                                prefix-icon="el-icon-lx-lock"
                                v-model="loginForm.vCode"
                                class="vCode-input-width"
                                @keyup.enter.native="submitForm()"
                            ></el-input>
                        </el-form-item>
                        <div class="vCode-img-box" @click="getVcode">
                            <el-tooltip class="item" effect="dark" content="点击切换验证码" placement="right">
                                <img v-show="vCodeShow" :src="codeBase64" alt />
                            </el-tooltip>
                        </div>
                    </div>
                    <el-checkbox v-model="autoLogin">自动登录</el-checkbox>
                    <div class="login-btn">
                        <el-button type="primary" @click="submitForm()">登录</el-button>
                    </div>
                </el-form>
            </div>
        </div>
        <div class="footer">{{ sys_web_name || '宁波川水文化创意有限公司' }}</div>
    </div>
</template>

<script>
import { getAuthCode, verifyCode, loginApi, getConfigInfo, queryCaptcha, verifyCaptcha } from '../../../api/login';
import { setToken, getToken, setAdminId, getAdminId } from '../../../utils/auth';
import { getUserDetail } from '../../../api/user';
import { getHasCheckedAuthList } from '../../../api/role';
import global from '../../../utils/global.js';

import './Login.less';
export default {
    data: function() {
        return {
            loginForm: {
                username: '', //admin
                password: '',
                vCode: ''
            },
            rules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 1, max: 40, message: '用户名在40个字符以内', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 16, message: '请输入6-16位密码', trigger: 'blur' }
                ]
            },
            autoLogin: false,
            loginErr: 0,
            vCodeShow: false,
            captcha_id: null,
            codeBase64: '',
            sys_name: '',
            sys_web_name: '',
            login_loading: {}
        };
    },
    methods: {
        // 获取配置
        getConfig() {
            getConfigInfo({})
                .then(res => {
                    if (res.code === 200) {
                        this.sys_web_name = res.data.sys_web_name;
                        this.sys_name = res.data.sys_name;
                        // 又拍云文件资源地址 所有图片文件 以这个名称拼接+图片路径  sys_upyun_source_url
                        localStorage.setItem('sys_upyun_source_url', res.data.sys_upyun_source_url);
                    } else {
                        this.$message.error(res.msg);
                    }
                })
                .catch(err => {});
        },
        submitForm() {
            this.$refs.login.validate(valid => {
                if (valid) {
                    let request = {
                        user_name: this.loginForm.username,
                        password: this.loginForm.password
                    };
                    if (this.vCodeShow) {
                        this.verificationCode();
                    } else {
                        this.login(request);
                    }
                    // 请求登录接口
                } else {
                    // this.$message.error('请输入账号和密码');
                    return false;
                }
            });
        },
        // 获取验证码
        getVcode() {
            const request = {
                width: 80,
                height: 40
            };
            getAuthCode(request)
                .then(res => {
                    if (res.code === 200) {
                        const result = res.data;
                        this.codeBase64 = result.captcha_base64;
                        this.captcha_id = result.captcha_id;
                    } else {
                        this.$message.error(res.msg);
                    }
                })
                .catch(err => {});
        },

        // 请求-验证 验证码
        verificationCode() {
            let request = {};
            request['captcha_id'] = this.captcha_id;
            request['captcha_val'] = this.loginForm.vCode;
            verifyCode(request)
                .then(res => {
                    if (res.code === 200) {
                        // 登录请求
                        let params = {
                            user_name: this.loginForm.username,
                            password: this.loginForm.password
                        };
                        this.login(params);
                    } else {
                        this.$message.error(res.msg);
                    }
                })
                .catch(err => {});
        },

        // 请求-login
        login(request) {
            this.login_loading = this.uploadLoading('登录中');
            loginApi(request)
                .then(res => {
                    // 登录成功 loginErr次数清零
                    if (res.code === 200) {
                        const result = res.data;
                        setToken(result.token);
                        this.loginErr = 0;
                        const self = this;
                        //判断复选框是否被勾选 勾选则调用配置cookie方法
                        if (self.autoLogin) {
                            //传入账号名，密码，和保存天数3个参数
                            self.setCookie(self.loginForm.username, self.loginForm.password, 7);
                        } else {
                            //清空Cookie
                            self.clearCookie();
                        }

                        localStorage.setItem('ms_username', this.loginForm.username);
                        // 登录成功，获取用户详情
                        global.loginCheck = result.user_id;
                        localStorage.setItem('userId', result.admin_id); // 同时也要做的是将这个用户id存进localStorage
                        let params = { admin_id: result.admin_id };
                        // 清空首页缓存
                        localStorage.removeItem('mall_sku_sales')
                        localStorage.removeItem('mall_seven_new_user')
                        localStorage.removeItem('mall_daily_sales_data')
                        this.getUserDetailData(params);
                    } else {
                        this.login_loading.close();
                        // 登录失败次数+1
                        this.loginErr = Number(this.loginErr + 1);
                        this.$message.error(res.msg);
                        if (this.loginErr > 2) {
                            // 登录失败次数超过三次 出现验证码
                            this.$nextTick(() => {
                                this.vCodeShow = true;
                                // 请求 获取验证码
                                this.getVcode();
                            });
                        }
                    }
                })
                .catch(() => {});
        },

        // 获取用户详情
        getUserDetailData(params) {
            getUserDetail(params)
                .then(res => {
                    console.log(res);
                    if (res.code === 200) {
                        const result = res.data;
                        // 获取用户详情成功
                        // 是否超级管理 - 超级管理员（所有权限全部开放），否则根据权限显示
                        localStorage.setItem('is_admin', result.is_admin);
                        localStorage.setItem('login_user_info', JSON.stringify(result));
                        if (result.is_admin) {
                            this.login_loading.close();
                            this.$message.success('登录成功');
                            this.$router.push('/dashboard');
                        } else {
                            let params = {
                                role_id: result.role_id
                            };
                            // 根据角色id获取角色权限列表
                            this.getRoleData(params);
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

        // 获取角色权限信息
        getRoleData(params) {
            getHasCheckedAuthList(params)
                .then(res => {
                    if (res.code === 200) {
                        if (res.data) {
                            this.login_loading.close();
                            localStorage.setItem('roleAuthList', JSON.stringify(res.data));
                            this.$message.success('登录成功');
                            this.$router.push('/dashboard');
                        } else {
                            this.login_loading.close();
                            this.$notify({
                                title: '该角色暂未分配权限',
                                message: '',
                                type: 'error',
                                duration: 5000
                            });
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

        // 设置cookie
        setCookie(_name, _pwd, _days) {
            const exdate = new Date(); //获取时间
            exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 1000 * _days); //保存的天数
            //字符串拼接cookie
            window.document.cookie = 'c_s_userName' + '=' + _name + ';path=/;expires=' + exdate.toUTCString();
            window.document.cookie = 'c_s_password' + '=' + _pwd + ';path=/;expires=' + exdate.toUTCString();
        },

        // 读取cookie
        getCookie: function() {
            if (document.cookie.length > 0) {
                const cookie_arr = document.cookie.split('; '); //这里显示的格式需要切割一下自己可输出看下
                cookie_arr.forEach((ev, i) => {
                    const cookie_arr2 = ev.split('='); //再次切割
                    //判断查找相对应的值
                    if (cookie_arr2[0] === 'c_s_userName') {
                        this.autoLogin = true;
                        this.loginForm.username = cookie_arr2[1]; //保存到保存数据的地方
                    } else if (cookie_arr2[0] === 'c_s_password') {
                        this.loginForm.password = cookie_arr2[1];
                    }
                });
            }
        },

        // 清除cookie
        clearCookie: function() {
            this.setCookie('', '', -1); //修改2值都为空，天数为负1天就好了
        }
    },
    created() {
        // this.getConfig();
        this.getCookie();
    },
    mounted() {}
};
</script>

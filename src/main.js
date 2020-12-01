import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
// import VueI18n from 'vue-i18n';
// import { messages } from './components/common/i18n';
import 'element-ui/lib/theme-chalk/index.css'; // 默认主题
import './assets/init.less'; //全局样式
import { setToken, getToken } from './utils/auth';
import './assets/css/icon.css';
import './assets/iconfont/iconfont.css';
// import './components/common/directives';
import 'babel-polyfill';
import Print from './utils/print.js';
import axios from 'axios';
import global from './utils/global.js';
import commUtil from './utils/commUtil';
import { signOut } from './utils/loginOut';
import 'default-passive-events';
import TableHeaderColor from './plugin/tableHeader'; // 引入
//引入lodash
import _ from 'lodash';
import VideoPlayer from 'vue-video-player';
require('video.js/dist/video-js.css');
require('vue-video-player/src/custom-theme.css');
Vue.use(VideoPlayer);
Vue.prototype._ = _;
Vue.use(TableHeaderColor); // 添加
import less from 'less';
Vue.use(less);
import moment from 'moment';
Vue.prototype.$moment = moment;
Vue.prototype.$signOut = signOut;
Vue.prototype.$ajax = axios;
Vue.config.productionTip = false;
// Vue.use(VueI18n);
Vue.use(ElementUI, {
    size: 'small'
});
Vue.use(Print);
// const i18n = new VueI18n({
//     locale: 'zh',
//     messages
// });

//权限指令
Vue.directive('hasPermission', {
    bind(el, binding) {
        /**
         * 如果是超级管理员，所有按钮权限都开放
         * */
        if (localStorage.getItem('is_admin') > 0) {
            // 我是超级管理员
        } else {
            const role_auth_list = commUtil.processData(JSON.parse(localStorage.getItem('roleAuthList') || '[]'));
            // 我是普通用户
            let permissions = [];
            role_auth_list.map(item => {
                if (item.subs && item.subs.length) {
                    item.subs.map(v => {
                        if (v.subs && v.subs.length) {
                            v.subs.map(s => {
                                if (s.subs && s.subs.length) {
                                    s.subs.map(k => {
                                        permissions.push(k.name);
                                    });
                                }

                                // permissions.push(s.name);
                            });
                        }
                    });
                }
            });
            // console.log('permissions', permissions);
            // console.log('binding.value', binding.value);
            if (typeof binding.value === 'string') {
                // console.log('单个判断');
                if (!permissions.includes(binding.value)) {
                    el.style.display = 'none';
                }
            } else {
                // console.log('多重判断');
                // console.log('binding.value', binding.value);
            }
        }
    }
});

Vue.prototype.openLoading = function(str) {
    const loading = this.$loading({
        // 声明一个loading对象
        lock: true, // 是否锁屏
        text: str || '加载中...', // 加载动画的文字
        spinner: 'el-icon-loading', // 引入的loading图标
        background: 'rgba(0, 0, 0, 0.5)', // 背景颜色
        target: '.sub-main', // 需要遮罩的区域
        body: true,
        customClass: 'loading-mask' // 遮罩层新增类名
    });
    setTimeout(function() {
        // 设定定时器，超时5S后自动关闭遮罩层，避免请求失败时，遮罩层一直存在的问题
        loading.close(); // 关闭遮罩层
    }, 5000);
    return loading;
};

Vue.prototype.uploadLoading = function(str) {
    const loading = this.$loading({
        // 声明一个loading对象
        lock: true, // 是否锁屏
        text: str || '加载中...', // 加载动画的文字
        spinner: 'el-icon-loading', // 引入的loading图标
        background: 'rgba(0, 0, 0, 0.5)', // 背景颜色
        target: '.sub-main', // 需要遮罩的区域
        body: true,
        customClass: 'loading-mask' // 遮罩层新增类名
    });
    setTimeout(function() {
        // 设定定时器，超时1000S后自动关闭遮罩层，避免请求失败时，遮罩层一直存在的问题
        loading.close(); // 关闭遮罩层
    }, 1000000);
    return loading;
};

//使用钩子函数对路由进行权限跳转
router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title} | 川水`;
    if (getToken()) {
        // 判断当前浏览器的本地存储里面是不是有已经登录的信息
        if (to.path === '/login' || to.path === '/') {
            // 如果要去的是登录页,直接跳转
            next({ path: '/dashboard' });
        } else if (to.path === '/404' || to.path === '/403') {
            next();
        } else {
            /**
             *  获取权限列表，整理出 二级 以及 三级权限 别名组成的数组
             *  如果to.path 去除'/' 后 在这个数组中 则正常跳转，否则 去往403（无权限）页面
             * */
            const role_auth_list = commUtil.processData(JSON.parse(localStorage.getItem('roleAuthList') || '[]'));
            let permissions = [];
            role_auth_list.map(item => {
                if (item.subs && item.subs.length) {
                    item.subs.map(v => {
                        permissions.push(v.name);
                        if (v.subs && v.subs.length) {
                            v.subs.map(s => {
                                permissions.push(s.name);
                                if (s.subs && s.subs.length) {
                                    s.subs.map(k => {
                                        permissions.push(k.name);
                                    });
                                }
                            });
                        }
                    });
                }
            });
            permissions.push('dashboard');
            // console.log('permissions', permissions);
            const path_url = to.path.replace('/', '');
            // console.log('permissions', permissions);
            // console.log('path_url', path_url);
            if (localStorage.getItem('is_admin') > 0) {
                // 登录用户是超级管理员
                next();
            } else {
                if (permissions.includes(path_url)) {
                    next();
                } else {
                    console.log('path_url', path_url);
                    console.log('permissions', permissions);
                    next({ path: '/403' });
                }
            }
        }
    } else {
        // 没有的话，也就是没有登录
        if (to.path === '/login' || to.path === '/') {
            next();
        } else {
            next({ path: '/login' }); //去登录页
        }
    }
});
Vue.filter('rounding', function(value) {
    //全局方法 Vue.filter() 注册一个自定义过滤器,必须放在Vue实例化前面
    if (typeof value === 'number') {
        return value.toFixed(2);
    } else {
        return value;
    }
});
/*
window.addEventListener("visibilitychange",function(){ //这个方法是监测浏览器窗口发生变化的时候执行
    if (document.hidden === false && global.loginCheck !== Number(localStorage.getItem('userId'))) {
        global.loginCheck = localStorage.getItem('userId')
        //只有当初始创建的loginCheck不等于localStorage里面的userId的时候去覆盖掉这个loginCheck
    }
    //不覆盖的话loginCheck永远都是我们设的初始值
});
*/

new Vue({
    router,
    render: h => h(App)
}).$mount('#app');

import axios from 'axios'
import qs from 'qs'
import { getToken } from './auth'
import { Message, Notification } from 'element-ui-chuanshui'
import router from './../router'

const service = axios.create({
    // process.env.NODE_ENV === 'development' 来判断是否开发环境
    // baseURL: process.env.VUE_APP_MODE === 'local' ? '/api' : process.env.VUE_APP_MODE === 'pro'? 'https://storehouse-api.chuanshui.com' : 'http://storehouse.api.chuanshui.cn',
    baseURL: process.env.VUE_APP_BASE_API,
    timeout: 300000
    //transformRequest 这里主要是 post请求时 请求成功了，但是后台并没有获取到前端的请求参数。如果后台是直接从请求体里取的话，请忽略
    // transformRequest:[
    //     data => {
    //         let params = qs.stringify(data, {indices: false})
    //         return params
    //     }
    //     ]
})

service.interceptors.request.use(
    config => {
        // console.log('getToken', getToken());
        if (getToken()) {
            config.headers['token'] = getToken()
            config.headers['Content-Type'] = 'application/json'
        }
        return config
    },
    error => {
        console.log(error)
        return Promise.reject()
    }
)

service.interceptors.response.use(
    response => {
        if (response.status != 200) {
            Notification({
                title: '服务器异常',
                message: '请联系管理员或稍后再尝试',
                type: 'error',
                duration: 5000
            })
        }
        const res = response.data
        if (res.code === -1) {
            // Message.error(res.msg);
            if (res.msg.indexOf('过期') > -1) {
                if (location.hash !== '#/login') {
                    localStorage.removeItem('ms_username')
                    localStorage.removeItem('is_admin')
                    localStorage.removeItem('roleAuthList')
                    localStorage.removeItem('userId')
                    localStorage.removeItem('login_user_info')
                    localStorage.removeItem('user_token')
                    localStorage.removeItem('sys_upyun_source_url')
                    localStorage.removeItem('sys_sender_address')
                    if (document.getElementsByClassName('el-message').length === 0) {
                        // Message.error('登录过期，请重新登录');
                    }
                    router.push({ path: '/login' }).then(r => {})
                }
            } else {
                if (location.hash !== '#/403') {
                    router.push({ path: '/403' }).then(r => {})
                }
            }
        }
        return res
    },
    error => {
        Notification({
            title: '服务器异常',
            message: '请联系管理员或稍后再尝试',
            type: 'error',
            duration: 5000
        })
        // token 过期
        if (error.message.includes('timeout')) {
            // 判断请求异常信息中是否含有超时timeout字符串
            Message.error('请求超时(数据过大)，请稍后再试')
            return Promise.reject(error) // reject这个错误信息
        }

        if (error.response.status === 401) {
            // notify({
            //     title: '请重新登录',
            //     message: '',
            //     type: 'error',
            //     duration: 3000
            // });
            localStorage.removeItem('ms_username')
            localStorage.removeItem('is_admin')
            localStorage.removeItem('roleAuthList')
            localStorage.removeItem('userId')
            localStorage.removeItem('login_user_info')
            localStorage.removeItem('user_token')
            localStorage.removeItem('sys_upyun_source_url')
            localStorage.removeItem('sys_sender_address')
            if (document.getElementsByClassName('el-message').length === 0) {
                Message.error('登录过期，请重新登录')
            }
            router.push({ path: '/login' }).then(r => {})
        }
        return Promise.reject()
    }
)

export default service

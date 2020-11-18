import { get, post, put } from './util';

// 获取配置信息
export const getConfigInfo = params => post('/backend/get-index-config', params);

// 获取验证码
export const getAuthCode = params => post('/backend/get-captcha', params);

// 验证验证码
export const verifyCode = params => post('/backend/verify-captcha', params);

//  登录
export const loginApi = params => post('/backend/admin-login', params);

//  退出登录
// export const loginOutApi = params =>post('/backend/user-login',params);

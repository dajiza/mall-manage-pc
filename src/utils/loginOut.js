import { removeToken } from './auth';

const signOut = ()=>{
    localStorage.removeItem('ms_username');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('roleAuthList');
    localStorage.removeItem('userId');
    localStorage.removeItem('login_user_info');
    localStorage.removeItem('user_token');
    localStorage.removeItem('sys_upyun_source_url');
    localStorage.removeItem('sys_sender_address');
    //  退出登录删除本地存储信息
}
export {signOut}
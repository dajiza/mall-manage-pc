import { get, post, put } from './util';

// 用户列表
export const getUserList = params => post('/backend/user-list', params);

// 添加用户
export const addUser = params => post('/backend/user-create', params);

// 编辑用户
export const editUserInfo = params => post('/backend/user-update', params);

// 用户详情
export const getUserDetail = params => post('/backend/admin-detail', params);

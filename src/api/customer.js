import { get, post, put } from './util';

// 获取用户列表
export const queryCustomerList = params => post('/backend/user-list', params);

import { get, post, put } from './util';

// 获取用户列表
export const queryAgentList = params => post('/backend/agent-list', params);

// 代理商状态修改
export const updateAgentStatus = params => post('/backend/agent-update-status', params);

// 店铺列表（分页）
export const queryShopListPage = params => post('/backend/shop-list', params);

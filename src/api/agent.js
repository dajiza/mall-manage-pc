import { get, post, put } from './util';

// 获取用户列表
export const queryAgentList = params => post('/backend/agent-list', params);

// 代理商状态修改
export const updateAgentStatus = params => post('/backend/agent-update-status', params);

// 店铺列表（分页）
export const queryShopListPage = params => post('/backend/shop-list', params);

// 代理商列表（不分页，待绑定的）
export const queryAgentListAll = params => post('/backend/agent-list-all', params);

// 店铺创建
export const creatShop = params => post('/backend/shop-create', params);

// 店铺更新
export const updateShop = params => post('/backend/shop-update', params);

// 模糊搜索用户
export const queryUserList = params => post('/backend/user-search', params);

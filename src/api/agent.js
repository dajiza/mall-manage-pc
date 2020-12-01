import { get, post, put } from './util';

// 获取用户列表
export const queryAgentList = params => post('/backend/agent-list', params);

// 代理商状态修改
export const updateAgentStatus = params => post('/backend/agent-update-status', params);

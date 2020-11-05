import {get,post,put} from './util';

// 配置列表
export const getConfigList = params =>post('/backend/config-list',params)

// 修改配置
export const updateConfig = params =>post('/backend/config-update',params)

import {get,post,put} from './util';

// 配置列表
export const queryConfigList = params =>post('/backend/config-list',params)

// 修改配置
export const updateConfig = params =>post('/backend/config-update',params)

// 省
export const queryProvince = params =>post('/backend/area-province-list',params)

// 市
export const queryCity = params =>post('/backend/area-city-list',params)

// 区
export const queryArea = params =>post('/backend/area-county-list',params)
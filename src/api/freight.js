import { get, post, put } from './util';

// 运费模版列表
export const queryFreightList = params => post('/backend/freight-list');

// 创建模版列表
export const creatFreight = params => post('/backend/freight-create', params);

// 修改运费模版
export const updateFreight = params => post('/backend/freight-update', params);

// 运费模版详情
export const queryFreight = params => post('/backend/freight-data', params);

// 删除运费模版
export const deleteFreight = params => post('/backend/freight-delete', params);

// 设为默认
export const updateDefaultFreight = params => post('/backend/freight-default', params);

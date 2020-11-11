import { get, post, put } from './util';

// 运费模版列表
export const queryFreightList = params => post('/backend/freight-list');

// 运费模版列表
export const creatFreight = params => post('/backend/freight-create', params);

// 删除运费模版
export const deleteFreight = params => post('/backend/freight-delete', params);

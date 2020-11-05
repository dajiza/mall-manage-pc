import { get, post, put } from './util';

// 售后申请列表
export const queryAfterSaleList = params => post('/backend/order-apply-list', params);

// 售后申请详情
export const queryAfterSaleDetail = params => post('/backend/order-apply-data', params);

// 售后操作列表日志
export const queryAfterSaleLog = params => post('/backend/order-apply-operate-list', params);

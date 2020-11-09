import { get, post, put } from './util';

// 售后申请列表
export const queryAfterSaleList = params => post('/backend/order-apply-list', params);

// 售后申请详情
export const queryAfterSaleDetail = params => post('/backend/order-apply-data', params);

// 售后操作列表日志
export const queryAfterSaleLog = params => post('/backend/order-apply-operate-list', params);

// 申请审核
export const putApplyApprove = params => post('/backend/order-apply-approve', params);

// 退款-原路返回
export const putRefundVx = params => post('/backend/order-refund-vx', params);

// 退款-财务打款
export const putRefund = params => post('/backend/order-refund', params);

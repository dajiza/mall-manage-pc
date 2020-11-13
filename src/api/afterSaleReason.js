import { get, post, put } from './util';

// 售后原因列表
export const queryReasonList = params => post('/backend/order-reason-list', params)

// 新增售后原因
export const addReason = params => post('/backend/order-reason-create', params)

// 修改售后原因
export const updateReason = params => post('/backend/order-reason-update', params)

// 删除售后原因
export const deleteReason = params => post('/backend/order-reason-delete', params)
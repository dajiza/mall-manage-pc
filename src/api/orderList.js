import { get, post, put } from './util';

// 订单列表
export const getOrderList = params => post('/backend/order-list', params)

// 订单详情
export const getOrderDetail = params => post('/backend/order-data', params)

// 后台添加留言
export const getAddRemarks = params => post('/backend/order-add-remark', params)

// 取消订单
export const queryCancelOrder = params => post('/backend/order-cancel', params)

// 运费修改列表
export const queryFreightChangeList = params => post('/backend/order-freight-change-list', params)

// 订单修改列表
export const queryOrderDetailChangeList = params => post('/backend/order-detail-change-list', params)

// 修改运费金额
export const updateFreight = params => post('/backend/order-freight-update', params)

// 修改订单金额
export const updateOrderDetail = params => post('/backend/order-detail-update', params)
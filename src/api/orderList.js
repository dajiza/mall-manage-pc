import {
    get,
    post,
    put
} from './util';

// 订单列表
export const getOrderList = params => post('/backend/order-list', params)

// 订单详情
export const getOrderDetail = params => post('/backend/order-data', params)

// 后台添加留言
export const getAddRemarks = params => post('/backend/order-add-remark', params)

// 已发订单列表
export const getSentOrderList = params => post('/backend/order-sand-operate-list', params)

// 已发订单详情
export const getSentOrderDetail = params => post('/backend/order-sand-operate-data', params)

// 异常处理列表
export const getOrderErrList = params => post('/backend/order-err-operate-list', params)

// 手工处理订单
export const getOrderErrProcess = params => post('/backend/order-err-operate', params)
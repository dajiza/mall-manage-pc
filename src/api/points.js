import { get, post, put } from './util'
// 列表-详情 暂存数据
export var cacheData = {}
// 订单列表-商品
export const queryGoodsList = params => post('/backend/points-order-goods-list', params)

// 订单列表-优惠券
export const queryCouponList = params => post('/backend/points-order-coupon-list', params)

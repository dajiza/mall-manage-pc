import { get, post, put } from './util'

// 积分商品店铺列表
export const queryPointsShopList = params => post('/backend/points-shop-list', params)

// 积分后台商品列表
export const queryPointsGoodsList = params => post('/backend/points-goods-list', params)

// 创建/编辑商品
export const creatPointsGoods = params => post('/backend/points-goods-edit', params)

// 列表-详情 暂存数据
export var cacheData = {}
// 订单列表-商品
export const queryGoodsList = params => post('/backend/points-order-goods-list', params)

// 订单列表-优惠券
export const queryCouponList = params => post('/backend/points-order-coupon-list', params)

// 订单详情
export const queryOrderDetail = params => post('/backend/points-order-detail', params)

// 修改物流
export const updateLogistics = params => post('/backend/points-order-logistics-edit', params)

// 自动发货
export const queryLogisticsAuto = params => post('/backend/points-order-logistics-auto', params)

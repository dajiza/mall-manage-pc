import { get, post, put } from './util'

// 积分商品店铺列表
export const queryPointsShopList = params => post('/backend/points-shop-list', params)

// 积分后台商品列表
export const queryPointsGoodsList = params => post('/backend/points-goods-list', params)

// 创建/编辑商品
export const creatPointsGoods = params => post('/backend/points-goods-edit', params)

// 积分商品详情-后台
export const queryPointsGoodsDetail = params => post('/backend/points-goods-detail', params)

// 删除商品-后台
export const deletePointsGoods = params => post('/backend/points-goods-delete', params)

// 商品上下架-后台
export const putPointsGoodsStatus = params => post('/backend/points-goods-status', params)

// 优惠券列表后台
export const queryPointsCouponList = params => post('/backend/points-coupon-list', params)

// 优惠券后台新增/编辑
export const creatPointsCoupon = params => post('/backend/points-coupon-edit', params)

// 优惠券详情-后台
export const queryPointsCouponDetail = params => post('/backend/points-coupon-detail', params)

// 删除优惠券后台
export const deletePointsCoupon = params => post('/backend/points-coupon-delete', params)

// 优惠券上/下架-后台
export const putPointsCouponStatus = params => post('/backend/points-coupon-status', params)

// 列表-详情 暂存数据
export var cacheData = {
    orderInfo:{}
}
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

// 物流详情
export const queryLogisticsDetail = params => post('/backend/points-order-logistics-status', params)

// 新增积分优惠券 - 选择优惠券列表
export const queryCouponSelectList = params => post('/backend/points-binding-coupon-list', params)

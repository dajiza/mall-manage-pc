import { get, post, put } from './util'

// 优惠券列表
export const queryList = params => post('/backend/coupon-list', params)

// 优惠券-启用停用
export const changeStatus = params => post('/backend/coupon-update-status', params)

// 优惠券- 发放状态修改
export const changeGrantStatus = params => post('/backend/coupon-update-grant-status', params)

// 优惠券- 发送优惠券
export const querySendCoupons = params => post('/backend/coupon-user-import-excel', params)

// 创建优惠券
export const creatCoupons = params => post('/backend/coupon-create', params)

// 修改优惠券
export const updateCoupons = params => post('/backend/coupon-update', params)

// 优惠券详情
export const queryCouponsDetail = params => post('/backend/coupon-detail', params)

// 优惠券发放记录
export const sendCouponsLog = params => post('/backend/coupon-user-import-excel-record', params)

// 商品分类下拉(全部)
// export const queryAllCate = params => post('/backend/category-list-all', params);

// 优惠券领用记录
export const couponSendUserRecord = params => post('/backend/coupon-user-list', params)

// 筛选商品
export const queryCouponGoodsList = params => post('/backend/coupon-goods-list', params)

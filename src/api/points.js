import { get, post, put } from './util'

// 积分商品店铺列表
export const queryPointsShopList = params => post('/backend/points-shop-list', params)

// 积分后台商品列表
export const queryPointsGoodsList = params => post('/backend/points-goods-list', params)

// 创建/编辑商品
export const creatPointsGoods = params => post('/backend/points-goods-edit', params)

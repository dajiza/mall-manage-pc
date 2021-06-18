import { get, post, put } from './util'

// 促销列表
export const queryList = params => post('/backend/promotion-list', params)

// 上下架
export const changeStatus = params => post('/backend/promotion-status', params)


// 促销-创建、修改
export const editPromotion = params => post('/backend/promotion-edit', params)

// 促销详情
export const queryPromotionDetail = params => post('/backend/promotion-detail', params)

// 促销换购商品列表
// export const queryPromotionSkuList = params => post('/backend/promotion-sku-list', params)

// 换购商品列表-通过skuids获取
export const querySkuList = params => post('/backend/promotion-skus-ids', params)

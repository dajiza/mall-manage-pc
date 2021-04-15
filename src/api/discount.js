import { get, post, put } from './util'

// 创建折扣
export const creatDiscount = params => post('/backend/discount-create', params)

// 删除折扣
export const deleteDiscount = params => post('/backend/discount-delete', params)

// 折扣列表
export const queryDiscountList = params => post('/backend/discount-list', params)

// 更新折扣
export const updateDiscount = params => post('/backend/discount-update', params)

// 用户折扣设置
export const updateUserDiscount = params => post('/backend/user-discount-update', params)

// 商品sku折扣设置
export const updateSkuDiscount = params => post('/backend/goods-sku-discount-update', params)

// 折扣商品批量添加至不享折扣列表
export const updateSkuDiscountBatch = params => post('/backend/goods-sku-discount-batch-remove', params)

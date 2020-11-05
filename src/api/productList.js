import {get,post,put} from './util';

// 产品列表
export const getProductList = params =>post('/backend/product-list',params)

// 隐藏产品
export const getProductHide = params =>post('/backend/product-hide',params)

// 取消隐藏产品
export const getProductHideFree = params =>post('/backend/product-hide-free',params)

// 锁定产品列表
export const getLockProductList = params =>post('/backend/product-lock-list',params)

// 手动解锁
export const getProductLockFree = params =>post('/backend/product-lock-free',params)

// 手动按数量锁定产品
export const getProductLock = params =>post('/backend/product-lock',params)

// 产品添加
export const getProductCreate = params =>post('/backend/product-create',params)

// 产品编辑
export const getProductUpdate = params =>post('/backend/product-update',params)

// 产品详情
export const getProductDetail = params =>post('/backend/product-data',params)

// 货物列表
export const getGoodsList = params =>post('/backend/product-detail-list',params)

// 新增货物（入库）
export const getGoodsCreate = params =>post('/backend/product-detail-create',params)

// 货物详情
export const getGoodDetail = params =>post('/backend/product-detail-data',params)

// 货物操作记录列表
export const getGoodDetailLogList = params =>post('/backend/product-detail-log-list',params)

// 修改库存
export const changeProductNum = params =>post('/backend/product-num-update',params)
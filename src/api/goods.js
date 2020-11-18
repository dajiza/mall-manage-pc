import { get, post, put } from './util';

// 商品列表页面
export const queryGoodsList = params => post('/backend/goods-list', params);

// 商品上下架
export const updateGoodsStatus = params => post('/backend/goods-update-status', params);

// 仓库产品详情
export const queryStoreProduct = params => post('/backend/store-house-product-detail', params);

// 商品是否指定分销
export const updateAllow = params => post('/backend/update-allow', params);

// 商品的创建
export const creatGoods = params => post('/backend/goods-create', params);

// 配置 -- 属性列表(不分页)
export const getAllAttrList = params => post('/backend/store-house-attr-list', params);

// 仓库产品列表
export const queryProduceList = params => post('/backend/store-house-product-list', params);

// 商城后台标签列表(不分页)
export const getLabelAllList = params => post('/backend/tag-list-all', params);

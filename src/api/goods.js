import { get, post, put } from './util';

// 商品列表页面
export const queryGoodsList = params => post('/backend/goods-list', params);

// 商品上下架
export const updateGoodsStatus = params => post('/backend/goods-update-status', params);

// 仓库产品详情
export const queryStoreProduct = params => post('/backend/store-house-product-detail', params);

// 商品是否指定分销
export const updateAllow = params => post('/backend/goods-update-allow', params);

// 商品的创建
export const creatGoods = params => post('/backend/goods-create', params);

// 配置 -- 属性列表(不分页)
export const getAllAttrList = params => post('/backend/store-house-attr-list', params);

// 仓库产品列表
export const queryProduceList = params => post('/backend/store-house-product-list', params);

// 商城后台标签列表(不分页)
export const getLabelAllList = params => post('/backend/tag-list-all', params);

// 仓库产品详情
export const queryProduceDetail = params => post('/backend/store-house-product-detail', params);

// 自定义是属性的列表（所有，下拉使用）
export const queryAttrList = params => post('/backend/consume-attr-list-all', params);

// 店铺列表 代理店铺
export const queryShopList = params => post('/backend/shop-list-all', params);

// 商品的详情
export const queryGoodsDetail = params => post('/backend/goods-detail', params);

// 商品的修改
export const updateGoods = params => post('/backend/goods-update', params);

// 指定代理
export const updateGoodsAssign = params => post('/backend/goods-assign-shop', params);

// 仓库分类列表
export const queryStoreCategoryList = params => post('/backend/store-house-category-list');

// 其他商品分类的列表（所有，下拉使用）
export const queryCategoryListAll = params => post('/backend/category-list-all');

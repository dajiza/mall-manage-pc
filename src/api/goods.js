import { get, post, put } from './util';

// 商品列表页面
export const queryGoodsList = params => post('/backend/goods-list', params);

// 商品上下架
export const updateGoodsStatus = params => post('/backend/goods-update-status', params);

// 商品是否指定分销
export const updateGoodsDistribution = params => post('/backend/update-allow', params);

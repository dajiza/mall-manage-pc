import { get, post, put } from './util';

// 直播商品列表
export const queryLiveGoodsList = params => post('/backend/vx-goods-list', params);

// 新增商品
export const addLiveGoods = params => post('/backend/vx-goods-create', params);

// 同步价格（已入库）
export const querySynchronousPrice = params => post('/backend/vx-goods-price-update', params);

// 修改商品（未入库）
export const updateLiveGoods = params => post('/backend/vx-goods-update', params);

// 删除
export const deleteLiveGoods = params => post('/backend/vx-goods-del', params);

// 提交审核
export const querySubmitAudit = params => post('/backend/vx-goods-again', params);

// 撤销审核
export const queryCancelAudit = params => post('/backend/vx-goods-back', params);

// 商品列表（添加商品）
export const queryShopGoodsList = params => post('/backend/shop-goods-list', params);


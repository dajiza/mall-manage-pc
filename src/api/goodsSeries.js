import { get, post, put } from './util'

// 商品系列列表
export const queryGoodsSeriesList = params => post('/backend/goods-group-list', params)

// 商品系列新增编辑
export const updateGoodsSeries = params => post('/backend/goods-group-save', params)

// 商品系列删除
export const deleteGoodsSeries = params => post('/backend/goods-group-del', params)

// 商品系列详情
export const queryGoodsSeriesDetail = params => post('/backend/goods-group-data', params)

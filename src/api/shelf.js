import {get,post,put} from './util';

// 货架列表
export const getShelfList = params =>post('/backend/shelf-list',params)

// 新增货架
export const createShelf = params =>post('/backend/shelf-create',params)

// 修改货架状态
export const updateShelfStatus = params =>post('/backend/shelf-status-update',params)

// 配置属性
export const shelfAttrSet = params =>post('/backend/shelf-attr-set',params)

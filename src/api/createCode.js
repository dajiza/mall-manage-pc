import {get,post,put} from './util';

// 产品编号创建
export const getProductCodeCreate = params =>post('/backend/product-code-create',params)

// 货物编号创建 (产品子编码)
export const getProductDetailCodeCreate = params =>post('/backend/product-detail-code-create',params)

// 货架编号创建
export const getShelfCodeCreate = params =>post('/backend/product-shelf-code-create',params)
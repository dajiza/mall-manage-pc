import {get,post,put} from './util';

// 自定义属性列表（分页）
export const queryCustomAttrList = params =>post('/backend/consume-attr-list',params)

// 自定义属性添加
export const addCustomAttr = params =>post('/backend/consume-attr-create',params)

// 自定义属性编辑
export const editCustomAttr = params =>post('/backend/consume-attr-update',params)

// 自定义属性删除
export const deleteCustomAttr = params =>post('/backend/consume-attr-delete',params)
import {get,post,put} from './util';

// 配置 -- 属性列表
export const getAttrConfigList = params =>post('/backend/attr-list',params)

// 配置 -- 属性列表(不分页)
export const getAllAttrList = params =>post('/backend/attr-list-all',params)

// 配置 -- 库存修改理由列表
export const getReasonList = params =>post('/backend/reason-list',params)


// 配置 -- 库存修改理由列表(不分页)
export const getReasonAllList = params =>post('/backend/reason-list-all',params)

// 配置 -- 货架类型列表
export const getShelfCategoryList = params =>post('/backend/shelf-category-list',params)

// 配置 -- 货架类型列表(不分页)
export const getShelfTypeAllList = params =>post('/backend/shelf-category-list-all',params)

// 配置 -- 属性新增
export const getAttrAdd = params =>post('/backend/attr-create',params)

// 配置 -- 属性编辑
export const getAttrEdit = params =>post('/backend/attr-update',params)

// 配置 -- 属性删除
export const getAttrDel = params =>post('/backend/attr-del',params)

// 配置 -- 库存修改原因新增
export const getReasonAdd = params =>post('/backend/reason-create',params)

// 配置 -- 库存修改原因编辑
export const getReasonEdit = params =>post('/backend/reason-update',params)

// 配置 -- 库存修改原因删除
export const getReasonDel = params =>post('/backend/reason-del',params)

// 配置 -- 货架类型新增
export const getShelfCategoryAdd = params =>post('/backend/shelf-category-create',params)

// 配置 -- 货架类型编辑
export const getShelfCategoryEdit = params =>post('/backend/shelf-category-update',params)

// 配置 -- 货架类型删除
export const getShelfCategoryDel = params =>post('/backend/shelf-category-del',params)
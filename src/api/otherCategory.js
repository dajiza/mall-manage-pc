import {get,post,put} from './util';

// 其它商品分类列表（分页）
export const queryCategoryList = params =>post('/backend/category-list',params)

// 其它商品分类添加
export const addCategory = params =>post('/backend/category-create',params)

// 其它商品分类编辑
export const editCategory = params =>post('/backend/category-update',params)

// 其它商品分类删除
export const deleteCategory = params =>post('/backend/category-delete',params)
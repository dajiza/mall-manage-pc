import {get,post,put} from './util';

// 产品分类列表
export const getCategoryList = params =>post('/backend/category-list-all',params)

// 产品分类添加
export const addCategory = params =>post('/backend/category-create',params)

// 产品分类编辑
export const editCategory = params =>post('/backend/category-update',params)

// 产品分类删除
export const deleteCategory = params =>post('/backend/category-del',params)
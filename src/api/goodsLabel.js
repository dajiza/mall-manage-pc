import {get,post,put} from './util';

// 标签分类列表
export const getLabelCategoryList = params =>post('/backend/tag-category-list-all',params)

// 标签分类添加
export const addLabelCategory = params =>post('/backend/tag-category-create',params)

// 标签分类编辑
export const editLabelCategory = params =>post('/backend/tag-category-update',params)

// 标签分类删除
export const deleteLabelCategory = params =>post('/backend/tag-category-delete',params)

// 标签列表
export const getLabelList = params =>post('/backend/tag-list',params)

// 标签列表(全部不分页)
export const getLabelAllList = params =>post('/backend/tag-list-all',params)

// 标签添加
export const addLabel = params =>post('/backend/tag-create',params)

// 标签编辑
export const editLabel = params =>post('/backend/tag-update',params)

// 标签删除
export const deleteLabel = params =>post('/backend/tag-delete',params)

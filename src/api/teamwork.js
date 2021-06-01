import { get, post, put } from './util'
// 列表-详情 暂存数据
export var cacheData = {
    teamworkData: '',
    goodsDetail: {}
}
// 团作列表-后台
export const queryCourseList = params => post('/backend/course-list', params)

// 课件列表-后台
export const queryCourseMediaList = params => post('/backend/course-media-list', params)

// 团作报名列表-后台
export const queryCourseApplyList = params => post('/backend/course-apply-list', params)

// 商品默认详情获取
export const queryDefaultDetail = params => post('/backend/goods-default-detail-get', params)

// 商品默认详情创建
export const creatDefaultDetail = params => post('/backend/goods-default-detail-create', params)

// 商品详情模版列表
export const queryDetailTemplateList = params => post('/backend/goods-detail-template-list', params)

// 商品详情模版创建、编辑
export const creatDetailTemplate = params => post('/backend/goods-detail-template-edit', params)

// 商品详情模版创建、编辑
export const deleteDetailTemplate = params => post('/backend/goods-detail-template-delete', params)
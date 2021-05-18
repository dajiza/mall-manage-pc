import { get, post, put } from './util'
// 列表-详情 暂存数据
export var cacheData = {
    teamworkData: ''
}
// 团作列表-后台
export const queryCourseList = params => post('/backend/course-list', params)

// 课件列表-后台
export const queryCourseMediaList = params => post('/backend/course-media-list', params)

// 团作报名列表-后台
export const queryCourseApplyList = params => post('/backend/course-apply-list', params)

// 商品默认详情获取
export const queryDefaultDetail = params => post('/goods-default-detail-get', params)

// 商品默认详情创建
export const creatDefaultDetail = params => post('/goods-default-detail-create', params)

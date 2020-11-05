import {get,post,put} from './util';

// 照片检测列表
export const getPhotoDetectionList = params =>post('/backend/pic-check-list',params)

// 照片检测详情列表 -- 批量检测
export const getDetailList = params =>post('/backend/pic-check-detail-list',params)

// 照片检测详情  -- 照片查询
export const pictureCheckSearch = params =>post('/backend/baidu-img-check-search',params)

// 照片检测详情  -- 照片处理
export const pictureProcessing = params =>post('/backend/pic-check-detail-update',params)
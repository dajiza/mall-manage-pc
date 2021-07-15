import { get, post, put } from './util'

export var cacheData = {
    plate: {}, //所有板块数据
    addPlate: {}, //添加的单个板块数据缓存
    addImg: {} //编辑图片缓存
}
// 获取板块信息
export const queryLayoutDetail = params => post('/backend/page-layout-detail', params)

// 创建/编辑/发布板块
export const saveLayout = params => post('/backend/page-layout-save', params)

// 删除板块
export const deleteLayout = params => post('/backend/page-layout-delete', params)

// 还原板块
export const recoverLayout = params => post('/backend/page-layout-recover', params)

// 前端中转接口
export const transferLayout = params => post('/backend/page-layout-transfer', params)
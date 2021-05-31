import { get, post, put } from './util'

// 页面分享（列表）
export const queryList = params => post('/backend/vx-page-list', params)

// 页面管理（新增）
export const createShare = params => post('/backend/vx-page-create', params)

// 页面管理（删除）
export const deleteShare = params => post('/backend/vx-page-del', params)


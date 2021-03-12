import { get, post, put } from './util'

// 页面管理（列表）
export const queryAboutList = params => post('/backend/about-list', params)

// 页面管理（新增）
export const createAbout = params => post('/backend/about-create', params)

// 页面管理（详情）
export const queryAbout = params => post('/backend/about-data', params)

// 页面管理（删除）
export const deleteAbout = params => post('/backend/about-delete', params)

// 页面管理（修改）
export const updateAbout = params => post('/backend/about-update', params)

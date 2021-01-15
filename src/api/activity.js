import { get, post, put } from './util';

// 广告列表
export const queryAdvList = params => post('/backend/ad-list', params);

// 广告状态
export const updateAdvStatus = params => post('/backend/ad-update-status', params);

// 新增广告
export const createAdv = params => post('/backend/ad-create', params);

// 编辑广告
export const updateAdv = params => post('/backend/ad-update', params);

// 广告详情
export const queryAdvDetail = params => post('/backend/ad-detail', params);

// 活动管理列表
export const queryActivityList = params => post('/backend/activity-list', params);

// 活动-启用停用 activity-update
export const updateActivityStatus = params => post('/backend/activity-update', params);



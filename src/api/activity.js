import { get, post, put } from './util';

// 广告列表
export const queryAdvList = params => post('/backend/ad-list', params);

// 广告状态
export const updateAdvStatus = params => post('/backend/ad-update-status', params);

// 活动管理列表
export const queryList = params => post('/backend/coupon-list', params);

// 优惠券-启用停用




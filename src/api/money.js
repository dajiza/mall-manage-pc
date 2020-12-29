import { get, post, put } from './util'

// 佣金提现审核列表
export const queryWithdrawList = params => post('/backend/commission-withdraw-check-list', params)

// 佣金提现全部列表
export const queryWithdrawListAll = params => post('/backend/commission-withdraw-list', params)

// 店铺业绩
export const queryShopCount = params => post('/backend/commission-shop-count', params)

// 佣金统计
export const queryCommission = params => post('/backend/commission-count', params)

// 佣金提现审核接口
export const putWithdrawCheck = params => post('/backend/commission-withdraw-check', params)

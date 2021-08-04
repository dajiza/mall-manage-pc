import { get, post, put } from './util'

// 获取用户列表
export const queryCustomerList = params => post('/backend/user-list', params)

// 积分明细
export const queryPointsLogList = params => post('/backend/points-log-list', params)

// 钱包记录
export const queryCommissionLog = params => post('/backend/customer-commission-log', params)
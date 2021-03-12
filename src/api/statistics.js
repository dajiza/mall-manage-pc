import { get, post, put } from './util'

// sku报表
export const queryOrderReportSku = params => post('/backend/order-report-sku', params)

// 销售统计 店铺报表
export const queryOrderReportShop = params => post('/backend/order-report-shop', params)

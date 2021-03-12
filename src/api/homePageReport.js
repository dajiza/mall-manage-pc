import { get, post, put } from './util';

// 订单状态报表
export const queryOrderStatusReport = params => post('/backend/order-report-index-status', params);

// SKU排名列表
export const querySKUReport = params => post('/backend/order-report-index-sku', params);

// 销售统计按日
export const queryOrderDaily = params => post('/backend/order-report-index-order-daily', params);

// 销售统计按时
export const queryOrderHour = params => post('/backend/order-report-index-order-hourly', params);

// 七日新用户统计
export const queryNewCustomer = params => post('/backend/report-index-customer', params);



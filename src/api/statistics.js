import { get, post, put } from './util';

// 仓库标签列表
export const queryOrderReportSku = params => post('/backend/order-report-sku', params);

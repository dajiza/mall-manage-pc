import {get,post,put} from './util';

// 物流信息
export const getLogisticsInfo = params =>post('/backend/order-sand-info',params)
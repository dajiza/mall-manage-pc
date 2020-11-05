import {get,post,put} from './util';

// 裁布列表
export const getCutClothList = params =>post('/backend/order-process-list',params)

// 裁布单列表
export const getCutSheetList = params =>post('/backend/order-cut-list',params)

// 配货单列表
export const getDistributionSheetList = params =>post('/backend/order-cut-list-other',params)

// 发货单列表
export const getSdCompanyList = params =>post('/backend/sd-company-list-all',params)

// 生成 裁布/配货/发货单 任务
export const getOrderProcessCreate = params =>post('/backend/order-process-create',params)

// 快递公司列表
export const getOrderSendList = params =>post('/backend/order-sand-list',params)

// 单个发货
export const getOrderSandOne = params =>post('/backend/order-sand-one-h5',params)

// 批量发货
export const getOrderSandAll = params =>post('/backend/order-sand-all-h5',params)
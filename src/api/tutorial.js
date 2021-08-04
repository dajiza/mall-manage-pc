import { get, post, put } from './util';

// 列表
export const queryTutorialList = params => post('/backend/tutorial-list', params);

// 修改可见状态
export const updateAccessStatus = params => post('/backend/tutorial-access-status', params);

// 修改审核状态
export const updateApproveStatus = params => post('/backend/tutorial-approve-status', params);

// 创建或修改看看
export const queryTutorialSave = params => post('/backend/tutorial-save', params);

// 看看详情
export const queryTutorialDetail = params => post('/backend/tutorial-detail', params);

// 作者下拉列表
export const queryAuthorList = params => post('/backend/tutorial-author-opt-list', params);

// 作者添加
export const addTutorialAuthor = params => post('/backend/tutorial-author-add', params);

// 已添加材料清单（sku）
export const queryMaterialSKUList = params => post('/backend/tutorial-material-sku-list', params);





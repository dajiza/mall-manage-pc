import {get,post,put} from './util';

// 权限列表
export const getAuthorityList = params =>post('/backend/permission-list',params)

// 权限添加
export const addAuthority = params =>post('/backend/permission-create',params)

// 权限编辑
export const editAuthority = params =>post('/backend/permission-update',params)

// 权限删除
export const deleteAuthority = params =>post('/backend/permission-delete',params)
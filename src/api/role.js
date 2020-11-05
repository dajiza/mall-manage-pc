import {get,post,put} from './util';

// 角色列表
export const getRoleList = params =>post('/backend/role-list',params);

// 角色已有权限
export const getHasCheckedAuthList = (params) => post('/backend/role-permission-list',params);

// 新增角色
export const addRole = params =>post('/backend/role-create',params);

// 编辑角色-基础信息
export const editRoleBase = params =>post('/backend/role-update',params);

// 编辑角色-权限分配
export const editRoleAuth = params =>post('/backend/role-bind-permission',params);

// 删除角色
export const deleteRole = params =>post('/backend/role-delete',params);
import { http } from '@/utils/http/axios';

//用户列表
export function getRoleList(params) {
  return http.request({
    url: '/admin/role/page',
    method: 'get',
    params,
  });
}

//新增用户
export function addRole(params) {
  return http.request({
    url: '/admin/role',
    method: 'post',
    params,
  });
}

//删除用户
export function deleteRole(roleId) {
  return http.request({
    url: `/admin/role/${roleId}`,
    method: 'delete',
  });
}

//修改用户
export function updateRole(params) {
  return http.request({
    url: '/admin/role',
    method: 'put',
    params,
  });
}

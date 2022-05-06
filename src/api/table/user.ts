import { http } from '@/utils/http/axios';

//用户列表
export function getUserList(params) {
  return http.request({
    url: '/admin/user/page',
    method: 'get',
    params,
  });
}

//新增用户
export function addUser(params) {
  return http.request({
    url: '/admin/user',
    method: 'post',
    params,
  });
}

//删除用户
export function deleteUser(userId) {
  return http.request({
    url: `/admin/user/${userId}`,
    method: 'delete',
  });
}

//修改用户
export function updateUser(params) {
  return http.request({
    url: '/admin/user/editPassword',
    method: 'put',
    params,
  });
}

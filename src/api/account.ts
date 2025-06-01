import request from '@/utils/request';
//查询账目
export const getAccountList = (params: any) =>
    request({
      'url': `/account/pageQuery`,
      'method': 'get',
      params: params
    })
//添加账目
export const addAccount = (data: any) =>
    request({
      'url': `/account`,
      'method': 'post',
      data: data
    })
//根据id删除账目
export const deleteAccountById = (id: any) =>
    request({
      'url': `/account/${id}`,
      'method': 'delete'
    })
//根据id查询账目
export const getAccountById = (id: any) =>
    request({
      'url': `/account/${id}`,
      'method': 'get'
    })
//根据id更新账目
export const updateAccountById = (id: any, data: any) =>
    request({
      'url': `/account/${id}`,
      'method': 'put',
      data: data
    })
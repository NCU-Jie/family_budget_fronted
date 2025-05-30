import request from '@/utils/request';
// 新增接口
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
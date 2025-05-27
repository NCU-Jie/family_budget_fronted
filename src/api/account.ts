import request from '@/utils/request';
// 新增接口
export const getAccountList = (params: any) =>
    request({
      'url': `/account/pageQuery`,
      'method': 'get',
      params: params
    })
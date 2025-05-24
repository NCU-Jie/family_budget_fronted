import request from '@/utils/request';
// 新增接口
export const getTransactionsList = (params: any) =>
    request({
      'url': `/transactions/page`,
      'method': 'get',
      params: params
    })
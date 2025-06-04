import request from '@/utils/request';
//按range查询统计数据
export function getStatistic(params: any) {
  return request({
    url: '/statistic',
    method: 'post',
    data: params,
  });
}
//查询分类统计数据
export function getCategoryStatistic(params: any) {
  return request({
    url: '/statistic/category',
    method: 'post',
    data: params,
  });
}
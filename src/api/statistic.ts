import request from '@/utils/request';
//按range查询统计数据
export function getStatistic(params: any) {
  return request({
    url: '/statistic',
    method: 'post',
    data: params,
  });
}
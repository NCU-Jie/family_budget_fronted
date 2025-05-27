import request from '@/utils/request';
// 新增接口
export const addCategory = (params: any) => {
  return request({
    url: '/category',
    method: 'post',
    data: { ...params }
  });
};
//获取所有分类
export const getCategories = () => {
  return request({
    url: '/category',
    method: 'get'
  });
};
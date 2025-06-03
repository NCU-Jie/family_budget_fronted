import request from '@/utils/request';
// 新增接口
export const addCategory = (params: any) => {
  return request({
    url: '/category/add',
    method: 'post',
    data: { ...params }
  });
};
//获取所有分类
export const getCategoryByTypeId = (typeId: number) => {
  return request({
    url: `/category/list`,
    method: 'get',
    params: { typeId }
  });
};
//分页查询分类
export const getCategories = (params: any) => {
  return request({
    url: '/category/pageQuery',
    method: 'get',
    params: { ...params }
  });
};
//删除分类
export const deleteCategory = (id: number) => {
  return request({
    url: `/category/${id}`,
    method: 'delete'
  });
};
//更新分类
export const updateCategory = (params: any) => {
  return request({
    url: `/category`,
    method: 'put',
    data: { ...params }
    });
  };
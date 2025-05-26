import request from '@/utils/request';
// 新增接口
export const login = (params: any) => {
    return request({
      url: '/member/login',
      method: 'post',
      data: { ...params }
    });
  };
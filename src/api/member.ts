import request from '@/utils/request';
// 获取家庭成员列表
export const getMemberList = (params: any) =>
    request({
      'url': `/member/list`,
      'method': 'get',
      params: params
    })
//添加家庭成员
export const addMember = (data: any) =>
    request({
      'url': `/member/add`,
      'method': 'post',
      data: data
    })
//删除家庭成员
export const deleteMember = (id: any) =>
    request({
        'url': `/member/delete/${id}`,
      'method': 'delete'
    })
//修改家庭成员
export const updateMember = (data: any) =>
    request({
      'url': `/member/update`,
      'method': 'put',
      data: data
    })
//根据id查询成员全部信息
export const getMemberById = (id: any) =>
    request({
      'url': `/member/${id}`,
      'method': 'get'
    })
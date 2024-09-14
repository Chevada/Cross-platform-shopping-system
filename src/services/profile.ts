import type { ProfileDetail, ProfileParams } from '@/types/member'
import { http } from '@/utils/http'

// 获取用户信息的接口
export const getMemberProfileAPI = () => {
  return http<ProfileDetail>({
    method: 'GET',
    url: '/member/profile',
    // 需要携带的请求头token已经在请求拦截器中进行了封装
  })
}

// 修改用户信息的接口
export const putMemberProfileAPI = (data: ProfileParams) => {
  return http<ProfileDetail>({
    method: 'PUT',
    url: '/member/profile',
    data,
  })
}

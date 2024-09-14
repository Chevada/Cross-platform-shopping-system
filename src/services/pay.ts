// 获取微信支付参数。
// 由于微信支付的限制，仅 appid 为 wx26729f20b9efae3a 的开发者才能调用该接口。此外，开发者还需要微信授权登录

import { http } from '@/utils/http'

export const getPayWxPayMiniPayAPI = (data: { orderId: string }) => {
  return http<WechatMiniprogram.RequestPaymentOption>({
    method: 'GET',
    url: '/pay/wxPay/miniPay',
    data,
  })
}

// 模拟支付的接口，开发环境下使用
export const getPayMockAPI = (data: { orderId: string }) => {
  return http<WechatMiniprogram.RequestPaymentOption>({
    method: 'GET',
    url: '/pay/mock',
    data,
  })
}

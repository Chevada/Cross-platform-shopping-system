import type { GoodsResult } from '@/types/goods'
import { http } from '@/utils/http'

// 获取商品详情的api /goods
export const getGoodsByIdAPI = (id: string) => {
  return http<GoodsResult>({
    method: 'GET',
    url: '/goods',
    data: {
      id,
    },
  })
}

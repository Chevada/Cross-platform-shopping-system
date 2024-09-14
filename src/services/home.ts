import { http } from '@/utils/http'
import type { BannerItem, CategoryItem, HotItem, GuessItem } from '@/types/home'
import type { PageParams, PageResult } from '@/types/global'

/**
 *
 * @param distributionSite 广告区域展示位置
        1 为首页（默认值）
        2 为商品分类页
 */
export const getHomeBannerAPI = (distributionSite = 1) => {
  return http<BannerItem[]>({
    method: 'GET',
    url: '/home/banner',
    data: {
      distributionSite,
    },
  })
}

// 获取首页分类的api /home/category/mutli
export const getHomeCategoryApi = () => {
  return http<CategoryItem[]>({
    method: 'GET',
    url: '/home/category/mutli',
  })
}

// 获取热门推荐的api /home/hot/mutli
export const getHotApi = () => {
  return http<HotItem[]>({
    method: 'GET',
    url: '/home/hot/mutli',
  })
}

// 获取猜你喜欢数据的api /home/goods/guessLike
export const getGuessLikeAPI = (data?: PageParams) => {
  return http<PageResult<GuessItem>>({
    method: 'GET',
    url: '/home/goods/guessLike',
    data,
  })
}

<script setup lang="ts">
import CustomNavbar from './components/CustomNavbar.vue'
import { getHomeBannerAPI, getHomeCategoryApi, getHotApi } from '@/services/home'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import type { BannerItem, CategoryItem, HotItem } from '@/types/home'
import CategoryPanel from './components/CategoryPanel.vue'
import HotPanel from './components/HotPanel.vue'
import PageSkeleton from './components/PageSkeleton.vue'
import { useGuessList } from '@/composables'

const bannerList = ref<BannerItem[]>([])
const categoryList = ref<CategoryItem[]>([])
const hotList = ref<HotItem[]>([])
// 控制刷新页面的动画效果
let refreshTrigger = ref<boolean>(false)
// 定义变量控制骨架屏的显示与隐藏
let isLoading = ref<boolean>(false)

// 获取轮播图数据
const getHomeBannerData = async () => {
  const result = await getHomeBannerAPI()
  bannerList.value = result.result
}
// 获取首页分类数据
const getHomeCategoryData = async () => {
  const result = await getHomeCategoryApi()
  categoryList.value = result.result
}
// 获取首页热门推荐数据
const getHotData = async () => {
  const result = await getHotApi()
  hotList.value = result.result
}
// 调用封装好的hooks，实现猜你喜欢数据的分页请求
const { guessRef, onScrolltolower } = useGuessList()

// 自定义下拉函数
const onRefresherrefresh = async () => {
  refreshTrigger.value = true
  // 重置猜你喜欢组件的数据
  guessRef.value.resetData()
  // 下面这样写能让几个请求同时发送，等待所有的异步结果
  await Promise.all([getHomeBannerData(), getHomeCategoryData(), getHotData()])
  // 猜你喜欢组件重新发送数据
  guessRef.value.getMore()
  refreshTrigger.value = false
}

onLoad(async () => {
  isLoading.value = true
  await Promise.all([getHomeBannerData(), getHomeCategoryData(), getHotData()])
  isLoading.value = false
})
</script>

<template>
  <!-- 自定义导航栏 -->
  <CustomNavbar></CustomNavbar>
  <!-- 滚动容器组件 -->
  <!-- 给滚动容器添加滑动触底事件 -->
  <scroll-view
    refresher-enabled
    @refresherrefresh="onRefresherrefresh"
    :refresher-triggered="refreshTrigger"
    @scrolltolower="onScrolltolower"
    class="scroll-view"
    scroll-y
  >
    <!-- 骨架屏 -->
    <PageSkeleton v-if="isLoading"></PageSkeleton>
    <template v-else>
      <!-- 自定义轮播图 -->
      <XtxSwiper :list="bannerList" />
      <!-- 首页分类组件 -->
      <CategoryPanel :list="categoryList"></CategoryPanel>
      <!-- 热门推荐组件 -->
      <HotPanel :list="hotList"></HotPanel>
      <!-- 猜你喜欢组件 -->
      <XtxGuess ref="guessRef"></XtxGuess>
    </template>
  </scroll-view>
</template>

<style lang="scss">
page {
  background-color: #f7f7f7;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.scroll-view {
  flex: 1;
}
</style>

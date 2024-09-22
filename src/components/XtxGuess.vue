<script setup lang="ts">
import { getGuessLikeAPI } from '@/services/home'
import { onMounted, reactive, ref } from 'vue'
import type { GuessItem } from '@/types/home'
import type { PageParams, PageResult } from '@/types/global'

// 保存猜你喜欢的数据
const guessList = ref<GuessItem[]>([])
// 没有更多页面的标记
let finish = ref<boolean>(false)

// 分页参数
// 泛型工具函数，将类型中的可选值变为必填
let pageParams = reactive<Required<PageParams>>({
  page: 1,
  pageSize: 10,
})

// 获取猜你喜欢数据
const getGuessLikeData = async () => {
  // 退出的判断，如果已经加载完所有数据就不会再发请求了
  if (finish.value) {
    return uni.showToast({ icon: 'none', title: '没有更多数据啦~' })
  }
  const result = await getGuessLikeAPI(pageParams)
  guessList.value.push(...result.result.items)
  // 页码累加
  if (pageParams.page < result.result.pages) {
    pageParams.page += 1
  } else {
    finish.value = true
  }
}

// 重置数据的方法，方便外部调用
const resetData = () => {
  pageParams.page = 1
  guessList.value = []
  finish.value = false
}

onMounted(() => {
  getGuessLikeData()
})

// 暴露方法给外部
defineExpose({
  getMore: getGuessLikeData,
  resetData,
})
</script>

<template>
  <!-- 猜你喜欢 -->
  <view class="caption">
    <text class="text">猜你喜欢</text>
  </view>
  <view class="guess">
    <navigator
      class="guess-item"
      v-for="item in guessList"
      :key="item.id"
      :url="`/pages/goods/goods?id=4007498`"
    >
      <image class="image" mode="aspectFill" :src="item.picture"></image>
      <view class="name"> {{ item.desc }} </view>
      <view class="price">
        <text class="small">¥</text>
        <text>{{ item.price }}</text>
      </view>
    </navigator>
  </view>
  <view class="loading-text"> {{ finish ? '我是有底线的' : '正在加载...' }} </view>
</template>

<style lang="scss">
@import '@/components/styles/XtxGuess.scss';

:host {
  display: block;
}
/* 分类标题 */
.caption {
  display: flex;
  justify-content: center;
  line-height: 1;
  padding: 36rpx 0 40rpx;
  font-size: 32rpx;
  color: #262626;
  .text {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 28rpx 0 30rpx;

    &::before,
    &::after {
      content: '';
      width: 20rpx;
      height: 20rpx;
      background-image: url(@/static/images/bubble.png);
      background-size: contain;
      margin: 0 10rpx;
    }
  }
}


// 加载提示文字
.loading-text {
  text-align: center;
  font-size: 28rpx;
  color: #666;
  padding: 20rpx 0;
}
</style>

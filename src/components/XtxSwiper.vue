<script setup lang="ts">
import type { BannerItem } from '@/types/home'
import { ref } from 'vue'

const activeIndex = ref(0)

// 轮播图切换触发的回调
// uni-helper插件已经帮我们定义好了类型
const onChange: UniHelper.SwiperOnChange = (event) => {
  // console.log(event.detail.current)
  activeIndex.value = event.detail.current
}

// 接受数据
const props = defineProps<{
  list: BannerItem[]
}>()
</script>

<template>
  <view class="carousel">
    <swiper @change="onChange" :circular="true" :autoplay="true" :interval="5000">
      <swiper-item v-for="item in list" :key="item.id">
        <navigator url="/pages/index/index" hover-class="none" class="navigator">
          <image mode="aspectFill" class="image" :src="item.imgUrl"></image>
        </navigator>
      </swiper-item>
    </swiper>
    <!-- 指示点 -->
    <view class="indicator">
      <text
        v-for="(item, index) in list"
        :key="item.id"
        class="dot"
        :class="{ active: index === activeIndex }"
      ></text>
    </view>
  </view>
</template>

<style lang="scss">
@import '@/components/styles/XtxSwiper.scss';

:host {
  display: block;
  height: 280rpx;
}

</style>

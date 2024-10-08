<script setup lang="ts">
import { getGoodsByIdAPI } from '@/services/goods'
import type { GoodsResult } from '@/types/goods'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import AddressPanel from './components/AddressPanel.vue'
import ServicePanel from './components/ServicePanel.vue'
import type {
  SkuPopupEvent,
  SkuPopupInstanceType,
  SkuPopupLocaldata,
} from '@/components/vk-data-goods-sku-popup/vk-data-goods-sku-popup'
import { postMemberCartAPI } from '@/services/cart'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 保存商品详情信息,ref可以在初始化对象时不给初始值，而reactive不行
const goods = ref<GoodsResult>()
// 弹出层组件实例,自己定义一下可用方法的类型
const popup = ref<{
  open: (type?: UniHelper.UniPopupType) => void
  close: () => void
}>()

// 定义变量控制弹出层的条件渲染
const popupName = ref<'address' | 'service'>()
// 定义方法，先改变控制弹出层的变量,然后打开弹出层
const openPop = (name: typeof popupName.value) => {
  popupName.value = name
  popup.value?.open()
}

// 从其他页面跳转过来时，会传递商品的id，我们在本组件进行接收
const query = defineProps<{
  id: string
}>()

// 获取商品详情的方法
const getGoodsByIdData = async () => {
  let result = await getGoodsByIdAPI(query.id)
  goods.value = result.result
  // 给商品sku弹窗需要的数据赋值
  localdata.value = {
    _id: result.result.id,
    name: result.result.name,
    goods_thumb: result.result.mainPictures[0],
    spec_list: result.result.specs.map((item) => {
      return {
        name: item.name,
        list: item.values,
      }
    }),
    sku_list: result.result.skus.map((item) => {
      return {
        _id: item.id,
        goods_id: result.result.id,
        goods_name: result.result.name,
        image: item.picture,
        price: item.price * 100, //根据sku插件的说明，价格这里要乘以100
        stock: item.inventory,
        sku_name_arr: item.specs.map((v) => v.valueName),
      }
    }),
  }
}

// 轮播图切换的回调
// 定义变量保存当前的轮播图页码
const currentPage = ref<number>(1)
const onChange: UniHelper.SwiperOnChange = (event) => {
  currentPage.value = event.detail.current + 1
}

// 点击图片的回调，要实现大图功能
const onTapImage = (url: string) => {
  // 大图预览
  uni.previewImage({
    current: url,
    urls: goods.value!.mainPictures,
  })
}

onLoad(() => {
  getGoodsByIdData()
})

// 是否显示sku组件使用的变量
const isShowSku = ref<boolean>(false)

// 用于sku弹窗的商品信息
const localdata = ref({} as SkuPopupLocaldata)

// 控制sku弹窗打开的模式
// 为了让数字1，2，3更有语义，增强可读性，在这里使用枚举
enum SkuMode {
  Both = 1,
  Cart = 2,
  Buy = 3,
}
const mode = ref<SkuMode>(SkuMode.Both)

// 修改sku弹窗的模式
const openSkuPopup = (val: SkuMode) => {
  // 显示sku组件
  ;(isShowSku.value = true), (mode.value = val)
}

// 弹窗组件实例对象
const skuPopupRef = ref<SkuPopupInstanceType>()

// 计算被选中的值
const selectArrText = computed(() => {
  return skuPopupRef.value?.selectArr?.join(' ').trim() || '请选择商品规格'
})

// 加入购物车事件
const onAddCart = async (event: SkuPopupEvent) => {
  await postMemberCartAPI({ skuId: event._id, count: event.buy_num })
  uni.showToast({ icon: 'success', title: '添加成功' })
  isShowSku.value = false
}

// 立即购买事件的回调
const onBuyNow = (event: SkuPopupEvent) => {
  uni.navigateTo({ url: `/pagesOrder/create/create?skuId=${event._id}&count=${event.buy_num}` })
}
</script>

<template>
  <!-- sku弹窗组件 -->
  <vk-data-goods-sku-popup
    v-model="isShowSku"
    :localdata="localdata"
    :mode="mode"
    add-cart-background-color="#ffa868"
    buy-now-background-color="#27ba9b"
    ref="skuPopupRef"
    :actived-style="{
      color: '#27ba9b',
      borderColor: '#27ba9b',
      backgroundColor: '#e9f8f5',
    }"
    @add-cart="onAddCart"
    @buy-now="onBuyNow"
  ></vk-data-goods-sku-popup>
  <scroll-view scroll-y class="viewport">
    <!-- 基本信息 -->
    <view class="goods">
      <!-- 商品主图 -->
      <view class="preview">
        <swiper @change="onChange" circular>
          <swiper-item v-for="item in goods?.mainPictures" :key="item">
            <image @tap="onTapImage(item)" mode="aspectFill" :src="item" />
          </swiper-item>
        </swiper>
        <view class="indicator">
          <text class="current">{{ currentPage }}</text>
          <text class="split">/</text>
          <text class="total">{{ goods?.mainPictures.length }}</text>
        </view>
      </view>

      <!-- 商品简介 -->
      <view class="meta">
        <view class="price">
          <text class="symbol">¥</text>
          <text class="number">{{ goods?.price }}</text>
        </view>
        <view class="name ellipsis">{{ goods?.name }}</view>
        <view class="desc">{{ goods?.desc }} </view>
      </view>

      <!-- 操作面板 -->
      <view class="action">
        <view class="item arrow">
          <text class="label">选择</text>
          <text class="text ellipsis" @tap="openSkuPopup(SkuMode.Both)"> {{ selectArrText }} </text>
        </view>
        <view @tap="openPop('address')" class="item arrow">
          <text class="label">送至</text>
          <text class="text ellipsis"> 请选择收获地址 </text>
        </view>
        <view @tap="openPop('service')" class="item arrow">
          <text class="label">服务</text>
          <text class="text ellipsis"> 无忧退 快速退款 免费包邮 </text>
        </view>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="detail panel">
      <view class="title">
        <text>详情</text>
      </view>
      <view class="content">
        <view class="properties">
          <!-- 属性详情 -->
          <view class="item" v-for="item in goods?.details.properties" :key="item.name">
            <text class="label">{{ item.name }}</text>
            <text class="value">{{ item.value }}</text>
          </view>
        </view>
        <!-- 图片详情 -->
        <image
          v-for="item in goods?.details.pictures"
          :key="item"
          mode="widthFix"
          :src="item"
        ></image>
      </view>
    </view>

    <!-- 同类推荐 -->
    <view class="similar panel">
      <view class="title">
        <text>同类推荐</text>
      </view>
      <view class="content">
        <navigator
          v-for="item in goods?.similarProducts"
          :key="item.id"
          class="goods"
          hover-class="none"
          :url="`/pages/goods/goods?id=${item.id}`"
        >
          <image class="image" mode="aspectFill" :src="item.picture"></image>
          <view class="name ellipsis">{{ item.name }}</view>
          <view class="price">
            <text class="symbol">¥</text>
            <text class="number">{{ item.price }}</text>
          </view>
        </navigator>
      </view>
    </view>
  </scroll-view>

  <!-- 用户操作 -->
  <view class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
    <view class="icons">
      <button class="icons-button"><text class="icon-heart"></text>收藏</button>
      <!-- #ifdef MP-WEIXIN -->
      <button class="icons-button" open-type="contact">
        <text class="icon-handset"></text>客服
      </button> 
      <!-- #endif -->
      <!-- 这里的购物车是跳转到一个普通页面，而非tabBar页面，方便回退回来 -->
      <navigator class="icons-button" url="/pages/cart/cart2" open-type="navigate">
        <text class="icon-cart"></text>购物车
      </navigator>
    </view>
    <view class="buttons">
      <view class="addcart" @tap="openSkuPopup(SkuMode.Cart)"> 加入购物车 </view>
      <view class="buynow" @tap="openSkuPopup(SkuMode.Buy)"> 立即购买 </view>
    </view>
  </view>

  <!-- uni-ui弹出层 -->
  <uni-popup ref="popup" type="bottom" background-color="#fff">
    <AddressPanel v-if="popupName === 'address'" @close="popup?.close()"></AddressPanel>
    <ServicePanel v-if="popupName === 'service'" @close="popup?.close()"></ServicePanel>
  </uni-popup>
</template>

<style lang="scss">

/* #ifdef H5 || APP-PLUS */
.toolbar .icons .navigator-wrap{
  flex:1; 
}
/* #endif */

page {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.viewport {
  background-color: #f4f4f4;
}

.panel {
  margin-top: 20rpx;
  background-color: #fff;
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 90rpx;
    line-height: 1;
    padding: 30rpx 60rpx 30rpx 6rpx;
    position: relative;
    text {
      padding-left: 10rpx;
      font-size: 28rpx;
      color: #333;
      font-weight: 600;
      border-left: 4rpx solid #27ba9b;
    }
    navigator {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.arrow {
  &::after {
    position: absolute;
    top: 50%;
    right: 30rpx;
    content: '\e6c2';
    color: #ccc;
    font-family: 'erabbit' !important;
    font-size: 32rpx;
    transform: translateY(-50%);
  }
}

/* 商品信息 */
.goods {
  background-color: #fff;
  .preview {
    height: 750rpx;
    position: relative;
    .image {
      width: 750rpx;
      height: 750rpx;
    }
    .indicator {
      height: 40rpx;
      padding: 0 24rpx;
      line-height: 40rpx;
      border-radius: 30rpx;
      color: #fff;
      font-family: Arial, Helvetica, sans-serif;
      background-color: rgba(0, 0, 0, 0.3);
      position: absolute;
      bottom: 30rpx;
      right: 30rpx;
      .current {
        font-size: 26rpx;
      }
      .split {
        font-size: 24rpx;
        margin: 0 1rpx 0 2rpx;
      }
      .total {
        font-size: 24rpx;
      }
    }
  }
  .meta {
    position: relative;
    border-bottom: 1rpx solid #eaeaea;
    .price {
      height: 130rpx;
      padding: 25rpx 30rpx 0;
      color: #fff;
      font-size: 34rpx;
      box-sizing: border-box;
      background-color: #35c8a9;
    }
    .number {
      font-size: 56rpx;
    }
    .brand {
      width: 160rpx;
      height: 80rpx;
      overflow: hidden;
      position: absolute;
      top: 26rpx;
      right: 30rpx;
    }
    .name {
      max-height: 88rpx;
      line-height: 1.4;
      margin: 20rpx;
      font-size: 32rpx;
      color: #333;
    }
    .desc {
      line-height: 1;
      padding: 0 20rpx 30rpx;
      font-size: 24rpx;
      color: #cf4444;
    }
  }
  .action {
    padding-left: 20rpx;
    .item {
      height: 90rpx;
      padding-right: 60rpx;
      border-bottom: 1rpx solid #eaeaea;
      font-size: 26rpx;
      color: #333;
      position: relative;
      display: flex;
      align-items: center;
      &:last-child {
        border-bottom: 0 none;
      }
    }
    .label {
      width: 60rpx;
      color: #898b94;
      margin: 0 16rpx 0 10rpx;
    }
    .text {
      flex: 1;
      -webkit-line-clamp: 1;
    }
  }
}

/* 商品详情 */
.detail {
  padding-left: 20rpx;
  .content {
    margin-left: -20rpx;
    .image {
      width: 100%;
    }
  }
  .properties {
    padding: 0 20rpx;
    margin-bottom: 30rpx;
    .item {
      display: flex;
      line-height: 2;
      padding: 10rpx;
      font-size: 26rpx;
      color: #333;
      border-bottom: 1rpx dashed #ccc;
    }
    .label {
      width: 200rpx;
    }
    .value {
      flex: 1;
    }
  }
}

/* 同类推荐 */
.similar {
  .content {
    padding: 0 20rpx 200rpx;
    background-color: #f4f4f4;
    display: flex;
    flex-wrap: wrap;
    .goods {
      width: 340rpx;
      padding: 24rpx 20rpx 20rpx;
      margin: 20rpx 7rpx;
      border-radius: 10rpx;
      background-color: #fff;
    }
    .image {
      width: 300rpx;
      height: 260rpx;
    }
    .name {
      height: 80rpx;
      margin: 10rpx 0;
      font-size: 26rpx;
      color: #262626;
    }
    .price {
      line-height: 1;
      font-size: 20rpx;
      color: #cf4444;
    }
    .number {
      font-size: 26rpx;
      margin-left: 2rpx;
    }
  }
  navigator {
    &:nth-child(even) {
      margin-right: 0;
    }
  }
}

/* 底部工具栏 */
.toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background-color: #fff;
  height: 100rpx;
  padding: 0 20rpx var(--window-bottom);
  border-top: 1rpx solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: content-box;
  .buttons {
    display: flex;
    & > view {
      width: 220rpx;
      text-align: center;
      line-height: 72rpx;
      font-size: 26rpx;
      color: #fff;
      border-radius: 72rpx;
    }
    .addcart {
      background-color: #ffa868;
    }
    .buynow,
    .payment {
      background-color: #27ba9b;
      margin-left: 20rpx;
    }
  }
  .icons {
    padding-right: 10rpx;
    display: flex;
    align-items: center;
    flex: 1;
    .icons-button {
      flex: 1;
      text-align: center;
      line-height: 1.4;
      padding: 0;
      margin: 0;
      border-radius: 0;
      font-size: 20rpx;
      color: #333;
      background-color: #fff;
      &::after {
        border: none;
      }
    }
    text {
      display: block;
      font-size: 34rpx;
    }
  }
}
</style>

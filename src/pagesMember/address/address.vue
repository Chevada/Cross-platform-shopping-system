<script setup lang="ts">
import { deleteMemberAddressByIdAPI, getMemberAddressAPI } from '@/services/address'
import { useAddressStore } from '@/stores/modules/address'
import type { AddressItem } from '@/types/address'
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 保存获取到的地址列表
const addressList = ref<AddressItem[]>()

// 获取收获地址列表的方法
const getMemberAddressData = async () => {
  const result = await getMemberAddressAPI()
  addressList.value = result.result
}

// 页面显示而不单单是页面加载时调用，因为在新增或修改完成回来后，都需要重新发送请求。
onShow(() => {
  getMemberAddressData()
})

// 删除地址的回调
const onDeleteAddress = (id: string) => {
  // 二次确认
  uni.showModal({
    content: '删除地址？',
    success: async (result) => {
      if (result.confirm) {
        // 根据id删除收货地址
        await deleteMemberAddressByIdAPI(id)
        getMemberAddressData()
      }
    },
  })
}

// 修改收货地址的函数
const onChangeAddress = (item: AddressItem) => {
  const addressStore = useAddressStore()
  addressStore.changeSelectedAddress(item)
  uni.navigateBack()
}
</script>

<template>
  <view class="viewport">
    <!-- 地址列表 -->
    <scroll-view class="scroll-view" scroll-y>
      <view v-if="addressList?.length" class="address">
        <uni-swipe-action class="address-list">
          <!-- 收货地址项 -->
          <uni-swipe-action-item class="item" v-for="item in addressList" :key="item.id">
            <view class="item-content" @tap="onChangeAddress(item)">
              <view class="user">
                {{ item.receiver }}
                <text class="contact">{{ item.contact }}</text>
                <text v-if="item.isDefault === 1" class="badge">默认</text>
              </view>
              <view class="locate">{{ item.fullLocation }} {{ item.address }}</view>
              <navigator
                class="edit"
                hover-class="none"
                :url="`/pagesMember/address-form/address-form?id=${item.id}`"
                @tap.stop="() => {}"
              >
                <!-- 使用@tap.stop="()=>{}" 阻止冒泡，防止触发祖先元素的点击实现，而只需要响应自己的点击事件 -->
                修改
              </navigator>
            </view>
            <!-- 右侧插槽，放置删除按钮 -->
            <template #right>
              <button class="delete-button" @tap="onDeleteAddress(item.id)" @tap.stop="() => {}">
                删除
              </button>
            </template>
          </uni-swipe-action-item>
        </uni-swipe-action>
      </view>
      <view v-else class="blank">暂无收货地址</view>
    </scroll-view>
    <!-- 添加按钮 -->
    <view class="add-btn">
      <navigator hover-class="none" url="/pagesMember/address-form/address-form">
        新建地址
      </navigator>
    </view>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
}

/* 删除按钮 */
.delete-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 100%;
  font-size: 28rpx;
  color: #fff;
  border-radius: 0;
  padding: 0;
  background-color: #cf4444;
}

.viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f4f4f4;

  .scroll-view {
    padding-top: 20rpx;
  }
}

.address {
  padding: 0 20rpx;
  margin: 0 20rpx;
  border-radius: 10rpx;
  background-color: #fff;

  .item-content {
    line-height: 1;
    padding: 40rpx 10rpx 38rpx;
    border-bottom: 1rpx solid #ddd;
    position: relative;

    .edit {
      position: absolute;
      top: 36rpx;
      right: 30rpx;
      padding: 2rpx 0 2rpx 20rpx;
      border-left: 1rpx solid #666;
      font-size: 26rpx;
      color: #666;
      line-height: 1;
    }
  }

  .item:last-child .item-content {
    border: none;
  }

  .user {
    font-size: 28rpx;
    margin-bottom: 20rpx;
    color: #333;

    .contact {
      color: #666;
    }

    .badge {
      display: inline-block;
      padding: 4rpx 10rpx 2rpx 14rpx;
      margin: 2rpx 0 0 10rpx;
      font-size: 26rpx;
      color: #27ba9b;
      border-radius: 6rpx;
      border: 1rpx solid #27ba9b;
    }
  }

  .locate {
    line-height: 1.6;
    font-size: 26rpx;
    color: #333;
  }
}

.blank {
  margin-top: 300rpx;
  text-align: center;
  font-size: 32rpx;
  color: #888;
}

.add-btn {
  height: 80rpx;
  text-align: center;
  line-height: 80rpx;
  margin: 30rpx 20rpx;
  color: #fff;
  border-radius: 80rpx;
  font-size: 30rpx;
  background-color: #27ba9b;
}
</style>

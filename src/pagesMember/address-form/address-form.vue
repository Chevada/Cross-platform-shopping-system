<script setup lang="ts">
import {
  getMemberAddressByIdAPI,
  postMemberAddressAPI,
  putMemberAddressByIdAPI,
} from '@/services/address'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 表单数据
const form = ref({
  receiver: '', // 收货人
  contact: '', // 联系方式
  fullLocation: '', // 省市区(前端展示)
  provinceCode: '', // 省份编码(后端参数)
  cityCode: '', // 城市编码(后端参数)
  countyCode: '', // 区/县编码(后端参数)
  address: '', // 详细地址
  isDefault: 0, // 默认地址，1为是，0为否
})

// 获取页面参数
const query = defineProps<{
  id?: string
}>()

// 如果传递过来id，就是修改页面，需要调用获取地址详情的方法
const getMemberAddressByIdData = async () => {
  if (query.id) {
    const result = await getMemberAddressByIdAPI(query.id)
    Object.assign(form.value, result.result)
  }
}

onLoad(() => {
  getMemberAddressByIdData()
})

// 地区改变的回调
const onRegionChange: UniHelper.RegionPickerOnChange = (event) => {
  form.value.fullLocation = event.detail.value.join(' ')
  // 后端参数
  const [provinceCode, cityCode, countyCode] = event.detail.code!
  Object.assign(form.value, { provinceCode, cityCode, countyCode })
}

// 设为默认收货地址的回调
const onSwitchChange: UniHelper.SwitchOnChange = (event) => {
  form.value.isDefault = event.detail.value ? 1 : 0
}

// 保存按钮的回调
const onSubmit = async () => {
  // 提交表单时，首先进行表单校验
  // TODO: ?.在ts中代表什么意思？

  try {
    await formRef.value?.validate?.()
    if (query.id) {
      // 修改地址
      await putMemberAddressByIdAPI(query.id, form.value)
    } else {
      // 新增地址
      await postMemberAddressAPI(form.value)
    }

    uni.showToast({ icon: 'success', title: query.id ? '修改成功' : '保存成功' })
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (error) {
    uni.showToast({ icon: 'error', title: '请完善信息' })
  }
}

uni.setNavigationBarTitle({ title: query.id ? '修改地址' : '新建地址' })

// 表单校验
// 定义校验规则
const rules: UniHelper.UniFormsRules = {
  receiver: {
    rules: [{ required: true, errorMessage: '请输入收货人姓名' }],
  },
  contact: {
    rules: [
      { required: true, errorMessage: '请输入手机号码' },
      { pattern: /^1[3-9]\d{9}$/, errorMessage: '手机号格式不正确' },
    ],
  },
  address: {
    rules: [{ required: true, errorMessage: '请输入地址' }],
  },
  fullLocation: {
    rules: [{ required: true, errorMessage: '请选择地区' }],
  },
}

const formRef = ref<UniHelper.UniFormsInstance>()
</script>

<template>
  <view class="content">
    <uni-forms :rules="rules" :model="form" ref="formRef">
      <!-- 表单内容 -->
      <uni-forms-item name="receiver" class="form-item">
        <text class="label">收货人</text>
        <input class="input" placeholder="请填写收货人姓名" v-model="form.receiver" />
      </uni-forms-item>
      <uni-forms-item name="contact" class="form-item">
        <text class="label">手机号码</text>
        <input class="input" placeholder="请填写收货人手机号码" v-model="form.contact" />
      </uni-forms-item>
      <uni-forms-item class="form-item" name="fullLocation">
        <text class="label">所在地区</text>
        <!-- 此处:value="form.fullLocation.split(' ')的作用是给picker一个初始值（但并不是显示在文本框中的内容，
         而是打开区域选择器时展示的内容。），后边的文本框中的内容是通过view组件条件渲染出来的 -->
        <picker
          @change="onRegionChange"
          class="picker"
          mode="region"
          :value="form.fullLocation.split(' ')"
        >
          <view v-if="form.fullLocation">{{ form.fullLocation }}</view>
          <view v-else class="placeholder">请选择省/市/区(县)</view>
        </picker>
      </uni-forms-item>
      <uni-forms-item name="address" class="form-item">
        <text class="label">详细地址</text>
        <input class="input" placeholder="街道、楼牌号等信息" v-model="form.address" />
      </uni-forms-item>
      <view class="form-item">
        <label class="label">设为默认地址</label>
        <switch
          @change="onSwitchChange"
          class="switch"
          color="#27ba9b"
          :checked="form.isDefault === 1"
        />
      </view>
    </uni-forms>
  </view>
  <!-- 提交按钮 -->
  <button @tap="onSubmit" class="button">保存并使用</button>
</template>

<style lang="scss">
page {
  background-color: #f4f4f4;
}

.content {
  margin: 20rpx 20rpx 0;
  padding: 0 20rpx;
  border-radius: 10rpx;
  background-color: #fff;

  .form-item,
  .uni-forms-item {
    display: flex;
    align-items: center;
    min-height: 96rpx;
    padding: 25rpx 10rpx 40rpx;
    background-color: #fff;
    font-size: 28rpx;
    border-bottom: 1rpx solid #ddd;
    position: relative;
    margin-bottom: 0;

    // 调整 uni-forms 样式
    .uni-forms-item__content {
      display: flex;
    }

    .uni-forms-item__error {
      margin-left: 200rpx;
    }

    &:last-child {
      border: none;
    }

    .label {
      width: 200rpx;
      color: #333;
    }

    .input {
      flex: 1;
      display: block;
      height: 46rpx;
    }

    .switch {
      position: absolute;
      right: -20rpx;
      transform: scale(0.8);
    }

    .picker {
      flex: 1;
    }

    .placeholder {
      color: #808080;
    }
  }
}

.button {
  height: 80rpx;
  margin: 30rpx 20rpx;
  color: #fff;
  border-radius: 80rpx;
  font-size: 30rpx;
  background-color: #27ba9b;
}
</style>

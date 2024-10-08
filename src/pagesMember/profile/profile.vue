<script setup lang="ts">
import { getMemberProfileAPI, putMemberProfileAPI } from '@/services/profile'
import { useMemberStore } from '@/stores'
import type { Gender, ProfileDetail } from '@/types/member'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

// 在用户信息页更新完成数据后，要将数据更新到pinia仓库中，因为目前所做的修改只是针对服务器数据和本文件中用于渲染页面的profile变量
const memberStore = useMemberStore()

// 保存获取的用户信息,获取时可以不提供初始值，而要对profile进行修改时，需要提供初始值
const profile = ref({} as ProfileDetail)

// 获取个人信息的接口
const getMemberProfileData = async () => {
  const result = await getMemberProfileAPI()
  profile.value = result.result
}

// 修改头像
const onAvatarChange = () => {
  // 调用拍照/选择图片的api
  // #ifdef MP-WEIXIN
  uni.chooseMedia({
    // 图片张数
    count: 1,
    // 文件类型
    mediaType: ['image'],
    success: (result) => {
      // 文件的本地路径
      const { tempFilePath } = result.tempFiles[0]
      uploadFile(tempFilePath)
    },
  })
  // #endif

  // #ifdef H5 || APP-PLUS
  uni.chooseImage({
    count:1,
    success:(res)=>{
      const tempFilePath = res.tempFilePaths[0]
      uploadFile(tempFilePath)
    }
  })
  // #endif
}

// 文件上传的方法
const uploadFile = (tempFilePath:string)=>{
  // 文件上传，直接使用wx的uploadFile接口，在这里我们使用uni.uploadFile方法，同时我们在请求拦截器中也对上传文件的方法进行了拦截
  uni.uploadFile({
    url: '/member/profile/avatar',
    name: 'file',
    filePath: tempFilePath,
    success: (success) => {
      if (success.statusCode === 200) {
        const avatar = JSON.parse(success.data).result.avatar
        // 更新当前个人信息页
        profile.value!.avatar = avatar
        uni.showToast({ icon: 'success', title: '更新头像成功' })
        // 仓库进行更新
        memberStore.profile!.avatar = avatar
      } else {
        uni.showToast({ icon: 'error', title: '出现错误啦' })
      }
    },
  })
}

// 点击保存修改用户信息
const onSubmit = async () => {
  const { nickname, gender, birthday, profession } = profile.value
  const result = await putMemberProfileAPI({
    nickname,
    gender,
    birthday,
    profession,
    provinceCode: fullLocationCode[0] || undefined,
    cityCode: fullLocationCode[1] || undefined,
    countyCode: fullLocationCode[2] || undefined,
  })
  // 更新仓库中的昵称
  memberStore.profile!.nickname = result.result.nickname
  uni.showToast({ icon: 'success', title: '保存成功' })
  // 返回上一页
  setTimeout(() => {
    uni.navigateBack()
  }, 500)
}

// 性别改变时触发的回调函数
const onGenderChange: UniHelper.RadioGroupOnChange = (event) => {
  profile.value.gender = event.detail.value as Gender
}

// 生日改变时触发的回调函数
const onBirthdayChange: UniHelper.DatePickerOnChange = (event) => {
  profile.value.birthday = event.detail.value
}

// 地址改变时触发的回调函数
// 存储城市编码，用于发送给后端
let fullLocationCode: [string, string, string] = ['', '', '']
const onFullLocationChange: UniHelper.RegionPickerOnChange = (event) => {
  console.log(event.detail)
  // 修改前端显示
  profile.value.fullLocation = event.detail.value.join(' ')
  fullLocationCode = event.detail.code!
}

onLoad(() => {
  getMemberProfileData()
})
</script>

<template>
  <view class="viewport">
    <!-- 导航栏 -->
    <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
      <navigator open-type="navigateBack" class="back icon-left" hover-class="none"></navigator>
      <view class="title">个人信息</view>
    </view>
    <!-- 头像 -->
    <view class="avatar">
      <view class="avatar-content" @tap="onAvatarChange">
        <image class="image" :src="profile?.avatar" mode="aspectFill" />
        <text class="text">点击修改头像</text>
      </view>
    </view>
    <!-- 表单 -->
    <view class="form">
      <!-- 表单内容 -->
      <view class="form-content">
        <view class="form-item">
          <text class="label">账号</text>
          <text class="account">{{ profile?.account }}</text>
        </view>
        <view class="form-item">
          <text class="label">昵称</text>
          <input class="input" type="text" placeholder="请填写昵称" v-model="profile!.nickname" />
        </view>
        <view class="form-item">
          <text class="label">性别</text>
          <radio-group @change="onGenderChange">
            <label class="radio">
              <radio value="男" color="#27ba9b" :checked="profile?.gender === '男'" />
              男
            </label>
            <label class="radio">
              <radio value="女" color="#27ba9b" :checked="profile?.gender === '女'" />
              女
            </label>
          </radio-group>
        </view>
        <view class="form-item">
          <text class="label">生日</text>
          <picker
            class="picker"
            mode="date"
            start="1900-01-01"
            :end="new Date()"
            :value="profile?.birthday"
            @change="onBirthdayChange"
          >
            <view v-if="profile?.birthday">{{ profile?.birthday }}</view>
            <view class="placeholder" v-else>请选择日期</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">城市</text>
          <picker
            @change="onFullLocationChange"
            class="picker"
            mode="region"
            :value="profile?.fullLocation?.split(' ')"
          >
            <view v-if="profile?.fullLocation">{{ profile?.fullLocation }}</view>
            <view class="placeholder" v-else>请选择城市</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">职业</text>
          <input class="input" type="text" placeholder="请填写职业" v-model="profile!.profession" />
        </view>
      </view>
      <!-- 提交按钮 -->
      <button class="form-button" @tap="onSubmit">保 存</button>
    </view>
  </view>
</template>

<style lang="scss">
page {
  background-color: #f4f4f4;
}

.viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/order_bg.png);
  background-size: auto 420rpx;
  background-repeat: no-repeat;
}

// 导航栏
.navbar {
  position: relative;

  .title {
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
  }

  .back {
    position: absolute;
    height: 40px;
    width: 40px;
    left: 0;
    font-size: 20px;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

// 头像
.avatar {
  text-align: center;
  width: 100%;
  height: 260rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background-color: #eee;
  }

  .text {
    display: block;
    padding-top: 20rpx;
    line-height: 1;
    font-size: 26rpx;
    color: #fff;
  }
}

// 表单
.form {
  background-color: #f4f4f4;

  &-content {
    margin: 20rpx 20rpx 0;
    padding: 0 20rpx;
    border-radius: 10rpx;
    background-color: #fff;
  }

  &-item {
    display: flex;
    height: 96rpx;
    line-height: 46rpx;
    padding: 25rpx 10rpx;
    background-color: #fff;
    font-size: 28rpx;
    border-bottom: 1rpx solid #ddd;

    &:last-child {
      border: none;
    }

    .label {
      width: 180rpx;
      color: #333;
    }

    .account {
      color: #666;
    }

    .input {
      flex: 1;
      display: block;
      height: 46rpx;
    }

    .radio {
      margin-right: 20rpx;
    }

    .picker {
      flex: 1;
    }
    .placeholder {
      color: #808080;
    }
  }

  &-button {
    height: 80rpx;
    text-align: center;
    line-height: 80rpx;
    margin: 30rpx 20rpx;
    color: #fff;
    border-radius: 80rpx;
    font-size: 30rpx;
    background-color: #27ba9b;
  }
}
</style>

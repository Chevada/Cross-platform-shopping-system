/**
 * 添加拦截器：
 *  拦截request请求
 *  拦截uploadFile文件上传
 *
 * TODO:
 * 1. 非http开头需要拼接地址
 * 2. 请求超时
 * 3. 添加小程序端请求的请求头标识
 * 4. 添加token请求头
 *
 */

import { useMemberStore } from '@/stores'

const baseURL = 'https://pcapi-xiaotuxian-front-devtest.itheima.net'

// 添加拦截器
const httpInterceptor = {
  // 拦截前触发,参数为发送请求时传入的请求对象
  invoke(options: UniApp.RequestOptions) {
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
    }
    options.timeout = 10000

    options.header = {
      ...options.header,
      'source-client': 'miniapp',
    }
    // 添加token
    const memberStore = useMemberStore()
    const token = memberStore.profile?.token
    if (token) {
      options.header.Authorization = token
    }
    // console.log(options)
  },
}
uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

interface Data<T> {
  code: string
  msg: string
  result: T
}
// 请求函数的封装,添加类型，支持泛型
// <T>：表示这是一个泛型函数，T 是一个泛型参数，可以是任何类型。
export const http = <T>(options: UniApp.RequestOptions) => {
  return new Promise<Data<T>>((resolve, reject) => {
    uni.request({
      ...options,
      // 服务器有响应
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 获取数据成功
          resolve(res.data as Data<T>)
        } else if (res.statusCode === 401) {
          // 401错误,用户信息错误，清理用户信息，跳转到登陆页面
          const memberStore = useMemberStore()
          memberStore.clearProfile()
          // 跳转页面，这里有坑，前面一定要加/，不然会被解析为相对与调用函数所在页面的相对路径。
          uni.navigateTo({ url: '/pages/login/login' })
          reject(res)
        } else {
          // 其他错误->根据后端错误信息轻提示
          uni.showToast({
            icon: 'none',
            title: (res.data as Data<T>).msg || '请求错误',
          })
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        // 网络错误
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试吧',
        })
        reject(err)
      },
    })
  })
}

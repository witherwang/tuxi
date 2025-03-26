<template>
  <view class="auth-container">
    <!-- Logo -->
    <view class="logo-container">
      <image src="/static/logo.png" class="logo" />
    </view>

    <!-- 登录/注册切换 -->
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{active: currentTab === 'login'}"
        @click="switchTab('login')"
      >登录</view>
      <view 
        class="tab-item"
        :class="{active: currentTab === 'register'}"
        @click="switchTab('register')"
      >注册</view>
    </view>

    <!-- 登录表单 -->
    <view v-if="currentTab === 'login'" class="form-container">
      <view class="input-group">
        <image src="/static/icon-email.png" class="input-icon" />
        <input 
          v-model="loginForm.email" 
          placeholder="邮箱" 
          class="input-field"
        />
      </view>
      <view class="input-group">
        <image src="/static/icon-password.png" class="input-icon" />
        <input 
          v-model="loginForm.password" 
          placeholder="密码" 
          type="password"
          password
          class="input-field"
        />
      </view>
      <button 
        class="submit-btn"
        :class="{loading: loginLoading}"
        @click="handleLogin"
      >
        <text v-if="!loginLoading">登录</text>
        <view v-else class="loading-spinner"></view>
      </button>
    </view>

    <!-- 注册表单 -->
    <view v-if="currentTab === 'register'" class="form-container">
      <view class="input-group">
        <image src="/static/icon-email.png" class="input-icon" />
        <input 
          v-model="registerForm.email" 
          placeholder="邮箱" 
          class="input-field"
        />
      </view>
      <view class="input-group">
        <image src="/static/icon-password.png" class="input-icon" />
        <input 
          v-model="registerForm.password" 
          placeholder="密码" 
          type="password"
          password
          class="input-field"
        />
      </view>
      <view class="input-group">
        <image src="/static/icon-password.png" class="input-icon" />
        <input 
          v-model="registerForm.confirmPassword" 
          placeholder="确认密码" 
          type="password"
          password
          class="input-field"
        />
      </view>
      <button 
        class="submit-btn"
        :class="{loading: registerLoading}"
        @click="handleRegister"
      >
        <text v-if="!registerLoading">注册</text>
        <view v-else class="loading-spinner"></view>
      </button>
    </view>
  </view>
</template>

<script>
import { login, register } from '@/utils/api'

export default {
  data() {
    return {
      currentTab: 'login',
      loginForm: {
        email: '',
        password: ''
      },
      registerForm: {
        email: '',
        password: '',
        confirmPassword: ''
      },
      loginLoading: false,
      registerLoading: false,
      redirectUrl: ''
    }
  },
  onLoad(options) {
    if (options.redirect) {
      this.redirectUrl = decodeURIComponent(options.redirect)
    }
  },
  methods: {
    switchTab(tab) {
      this.currentTab = tab
    },
    async handleLogin() {
      if (this.loginLoading) return
      this.loginLoading = true
      try {
        const res = await login(this.loginForm)
        uni.setStorageSync('token', res.data.token)
        uni.setStorageSync('userInfo', res.data.userInfo)
        
        // 显示成功提示
        uni.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 800, // 提示显示时间
          success: () => {
            // 提示显示完成后跳转
            uni.redirectTo({
              url: '/pages/index/index'
            })
          }
        })
      } catch (error) {
        uni.showToast({ 
          title: error.message, 
          icon: 'none',
          position: 'bottom'
        })
      } finally {
        this.loginLoading = false
      }
    },
    async handleRegister() {
      if (this.registerLoading) return
      this.registerLoading = true
      try {
        if (this.registerForm.password !== this.registerForm.confirmPassword) {
          throw new Error('两次输入的密码不一致')
        }
        const res = await register(this.registerForm)
        uni.showToast({
          title: '注册成功',
          icon: 'success',
          duration: 1500,
          success: () => {
            // 注册成功后自动切换到登录页
            setTimeout(() => {
              this.currentTab = 'login'
            }, 1500)
          }
        })
      } catch (error) {
        uni.showToast({ 
          title: error.message, 
          icon: 'none',
          position: 'bottom'
        })
      } finally {
        this.registerLoading = false
      }
    }
  }
}
</script>

<style lang="scss">
.auth-container {
  padding: 60rpx;
  min-height: 100vh;
  background: #fff;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin: 80rpx 0;
  .logo {
    width: 150rpx;
    height: 150rpx;
    border-radius: 30rpx;
  }
}

.tab-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 60rpx;
  .tab-item {
    margin: 0 60rpx;
    padding: 20rpx 0;
    font-size: 36rpx;
    color: #999;
    position: relative;
    transition: all 0.3s ease;
    &.active {
      color: $theme-color;
      font-weight: bold;
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 6rpx;
        background: $theme-color;
        border-radius: 3rpx;
      }
    }
  }
}

.form-container {
  .input-group {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    padding: 20rpx;
    background: #f5f5f5;
    border-radius: 20rpx;
    transition: all 0.3s ease;
    &:focus-within {
      box-shadow: 0 0 0 2rpx $theme-color-light;
    }
    .input-icon {
      width: 40rpx;
      height: 40rpx;
      margin-right: 20rpx;
    }
    .input-field {
      flex: 1;
      font-size: 32rpx;
      color: #333;
      &::placeholder {
        color: #999;
      }
    }
  }
  .submit-btn {
    margin-top: 60rpx;
    height: 100rpx;
    line-height: 100rpx;
    font-size: 36rpx;
    color: #fff;
    background: linear-gradient(135deg, $theme-color, $theme-color-light);
    border: none;
    border-radius: 50rpx;
    transition: all 0.3s ease;
    &.loading {
      opacity: 0.8;
    }
    &:active {
      transform: scale(0.98);
    }
    .loading-spinner {
      width: 40rpx;
      height: 40rpx;
      border: 4rpx solid #fff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 
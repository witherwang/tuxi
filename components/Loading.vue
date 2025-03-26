<template>
  <view class="loading-container">
    <view class="loading-spinner">
      <view class="spinner-item" v-for="i in 12" :key="i" :style="{ transform: `rotate(${i * 30}deg)` }"></view>
    </view>
  </view>
</template>

<style lang="scss">
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  position: relative;
  animation: spin 1.2s linear infinite;

  .spinner-item {
    width: 4rpx;
    height: 20rpx;
    background: $theme-color;
    position: absolute;
    left: 50%;
    top: 0;
    margin-left: -2rpx;
    opacity: 0;
    animation: fade 1.2s infinite;
    @for $i from 1 through 12 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.1 - 0.1}s;
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fade {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style> 
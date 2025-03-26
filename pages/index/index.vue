<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view 
				class="nav-item" 
				:class="{active: currentIndex === 0}"
				@click="switchTab(0)"
			>首页</view>
			<view 
				class="nav-item"
				:class="{active: currentIndex === 1}"
				@click="switchTab(1)"
			>赛事</view>
			<view 
				class="nav-item"
				:class="{active: currentIndex === 2}"
				@click="switchTab(2)"
			>社区</view>
			<view 
				class="nav-item"
				:class="{active: currentIndex === 3}"
				@click="switchTab(3)"
			>我的</view>
		</view>

		<!-- 页面内容 -->
		<swiper 
			class="content-swiper" 
			:current="currentIndex"
			@change="swiperChange"
		>
			<!-- 首页 -->
			<swiper-item>
				<view class="page-content">
					<!-- 轮播图 -->
					<swiper class="swiper" autoplay circular indicator-dots>
						<swiper-item>
							<image src="/static/banner1.jpg" mode="aspectFill"></image>
						</swiper-item>
						<swiper-item>
							<image src="/static/banner2.jpg" mode="aspectFill"></image>
						</swiper-item>
					</swiper>

					<!-- 社区入口 -->
					<view class="community-entry" @click="goToCommunity">
						<text class="community-title">进入社区</text>
					</view>

					<!-- 功能入口 -->
					<view class="function-grid">
						<view class="grid-item">
							<image src="/static/icon1.png"></image>
							<text>赛事报名</text>
						</view>
						<view class="grid-item" @click="goToLeaderboard">
							<image src="/static/icon2.png"></image>
							<text>排行榜</text>
						</view>
						<view class="grid-item">
							<image src="/static/icon3.png"></image>
							<text>战队招募</text>
						</view>
						<view class="grid-item">
							<image src="/static/icon4.png"></image>
							<text>直播中心</text>
						</view>
					</view>

					<!-- 赛事列表 -->
					<view class="match-list">
						<view class="section-title">
							<text>热门赛事</text>
							<text class="more">更多 ></text>
						</view>
						<view class="match-item" v-for="(item, index) in matches" :key="index">
							<image :src="item.logo" class="match-logo"></image>
							<view class="match-info">
								<text class="match-name">{{ item.name }}</text>
								<text class="match-time">{{ item.time }}</text>
							</view>
							<view class="match-status" :class="item.status">{{ item.statusText }}</view>
						</view>
					</view>
				</view>
			</swiper-item>

			<!-- 赛事 -->
			<swiper-item>
				<view class="page-content">
					<text>赛事页面内容</text>
				</view>
			</swiper-item>

			<!-- 社区 -->
			<swiper-item>
				<view class="page-content">
					<text>社区页面内容</text>
				</view>
			</swiper-item>

			<!-- 我的 -->
			<swiper-item>
				<view class="page-content">
					<view v-if="isLogin">
						<!-- 用户信息 -->
						<view class="user-info">
							<image :src="userInfo.avatar || '/static/avatar.png'" class="avatar"></image>
							<text class="username">{{ userInfo.nickname || '欢迎回来！' }}</text>
							<text class="user-rank">等级: {{ userInfo.rank }}</text>
							<button class="logout-btn" @click="handleLogout">退出登录</button>
						</view>
						<!-- 用户统计数据 -->
						<view class="stats-section">
							<view class="section-title">个人数据</view>
							<view class="stats-grid">
								<view class="stats-item">
									<text class="stats-label">胜场数</text>
									<text class="stats-value">{{ userInfo.stats.win }}</text>
								</view>
								<view class="stats-item">
									<text class="stats-label">K/D</text>
									<text class="stats-value">{{ userInfo.stats.kd }}%</text>
								</view>
								<view class="stats-item">
									<text class="stats-label">回合数</text>
									<text class="stats-value">{{ userInfo.stats.round }}</text>
								</view>
								<view class="stats-item">
									<text class="stats-label">爆头率</text>
									<text class="stats-value">{{ userInfo.stats.headshot }}%</text>
								</view>
								<view class="stats-item">
									<text class="stats-label">经验值</text>
									<text class="stats-value">{{ userInfo.stats.exp }}</text>
								</view>
								<view class="stats-item">
									<text class="stats-label">击杀数</text>
									<text class="stats-value">{{ userInfo.stats.kills }}</text>
								</view>
								<view class="stats-item">
									<text class="stats-label">总回合数</text>
									<text class="stats-value">{{ userInfo.stats.totalRound }}</text>
								</view>
								<view class="stats-item">
									<text class="stats-label">爆头数</text>
									<text class="stats-value">{{ userInfo.stats.headshots }}</text>
								</view>
							</view>
						</view>
					</view>
					<view v-else>
						<button class="login-btn" @click="goToLogin">请先登录</button>
					</view>
				</view>
			</swiper-item>
		</swiper>
		<Loading v-if="loading" />
	</view>
</template>

<script>
	import Loading from '@/components/Loading.vue'

	export default {
		components: {
			Loading
		},
		data() {
			return {
				currentIndex: 0, // 当前选中的tab索引
				matches: [
					{
						logo: '/static/match1.png',
						name: 'CS:GO 春季联赛',
						time: '2023-04-15 14:00',
						status: 'ongoing',
						statusText: '进行中'
					},
					{
						logo: '/static/match2.png',
						name: 'DOTA2 国际邀请赛',
						time: '2023-05-20 10:00',
						status: 'upcoming',
						statusText: '即将开始'
					}
				],
				isLogin: false,
				loading: false,
				userInfo: {},
				statsDisplay: {}
			}
		},
		onLoad() {

		},
		onShow() {
			this.checkLoginStatus()
		},
		methods: {
			// 切换tab
			switchTab(index) {
				this.currentIndex = index
			},
			// swiper滑动事件
			swiperChange(e) {
				this.currentIndex = e.detail.current
			},
			async fetchUserStats() {
				try {
					const res = await uni.request({
						url: 'https://api.i7core.com/user/stats',
						method: 'GET',
						header: {
							'Authorization': `Bearer ${uni.getStorageSync('token')}`
						}
					});
					console.log('API Response:', res); // 打印 API 响应
					if (res.statusCode === 200 && res.data && res.data.stats) {
						console.log('Stats Data:', res.data.stats); // 打印统计数据
						this.statsDisplay = {
							'胜场数': res.data.stats.win,
							'K/D': res.data.stats.kd + '%',
							'回合数': res.data.stats.round,
							'爆头率': res.data.stats.headshot + '%',
							'经验值': res.data.stats.exp,
							'击杀数': res.data.stats.kills,
							'总回合数': res.data.stats.totalRound,
							'爆头数': res.data.stats.headshots
						};
					} else {
						console.error('Invalid response data');
					}
				} catch (error) {
					console.error('获取用户数据失败:', error);
				}
			},
			checkLoginStatus() {
				this.isLogin = !!uni.getStorageSync('token');
				if (this.isLogin) {
					const stats = uni.getStorageSync('stats');
					this.userInfo = {
						nickname: uni.getStorageSync('nickname'),
						avatar: uni.getStorageSync('avatar'),
						rank: uni.getStorageSync('rank'),
						stats: stats
					};
					console.log('User Info:', this.userInfo); // 打印用户信息
					this.fetchUserStats();
				} else {
					console.warn('User not logged in');
				}
			},
			goToLogin() {
				const currentPage = getCurrentPages().pop()
				const redirectUrl = currentPage ? currentPage.route : ''
				uni.navigateTo({
					url: `/pages/auth/index?redirect=${encodeURIComponent(redirectUrl)}`
				})
			},
			handleLogout() {
				uni.removeStorageSync('token')
				this.isLogin = false
				uni.showToast({
					title: '已退出登录',
					icon: 'success'
				})
			},
			goToLeaderboard() {
				uni.navigateTo({
					url: '/pages/leaderboard/index'
				});
			},
			goToCommunity() {
				uni.switchTab({
					url: '/pages/community/community'
				});
			}
		}
	}
</script>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #f5f5f5;
	}

	.navbar {
		display: flex;
		justify-content: space-around;
		padding: 20rpx 0;
		background: #fff;
		position: sticky;
		top: 0;
		z-index: 10;
		box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
		.nav-item {
			font-size: 28rpx;
			color: #666;
			padding: 10rpx 0;
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
					height: 4rpx;
					background: $theme-color;
					border-radius: 2rpx;
				}
			}
		}
	}

	.content-swiper {
		flex: 1;
		height: 100%;
	}

	.page-content {
		padding: 20rpx;
		height: 100%;
	}

	.swiper {
		height: 360rpx;
		border-radius: 20rpx;
		overflow: hidden;
		image {
			width: 100%;
			height: 100%;
			border-radius: 16rpx;
			transition: transform 0.5s ease;
			&:hover {
				transform: scale(1.1);
			}
		}
	}

	.function-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		margin: 30rpx 0;
		background: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
		.grid-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			transition: transform 0.3s ease;
			&:active {
				transform: scale(0.95);
			}
			image {
				width: 100rpx;
				height: 100rpx;
				margin-bottom: 20rpx;
			}
			text {
				font-size: 24rpx;
				color: #666;
			}
		}
	}

	.match-list {
		.section-title {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 32rpx;
			margin-bottom: 20rpx;
			.more {
				font-size: 24rpx;
				color: $theme-color;
			}
		}
		.match-item {
			display: flex;
			align-items: center;
			padding: 20rpx;
			margin-bottom: 20rpx;
			background: #fff;
			border-radius: 16rpx;
			transition: all 0.3s ease;
			box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
			&:active {
				transform: scale(0.98);
			}
			.match-logo {
				width: 100rpx;
				height: 100rpx;
				margin-right: 20rpx;
			}
			.match-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				.match-name {
					font-size: 28rpx;
					margin-bottom: 10rpx;
				}
				.match-time {
					font-size: 24rpx;
					color: #999;
				}
			}
			.match-status {
				padding: 8rpx 16rpx;
				border-radius: 8rpx;
				font-size: 24rpx;
				&.ongoing {
					color: $theme-color;
					background: rgba($theme-color, 0.1);
				}
				&.upcoming {
					color: #f0ad4e;
					background: rgba(240, 173, 78, 0.1);
				}
			}
		}
	}

	.user-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx;
		background: #fff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
		.avatar {
			width: 150rpx;
			height: 150rpx;
			border-radius: 50%;
			margin-bottom: 20rpx;
		}
		.username {
			font-size: 32rpx;
			margin-bottom: 10rpx;
		}
		.user-rank {
			font-size: 28rpx;
			color: #999;
			margin-bottom: 20rpx;
		}
		.logout-btn {
			width: 200rpx;
			height: 80rpx;
			line-height: 80rpx;
			font-size: 28rpx;
			color: #fff;
			background-color: #ff5a5f;
			border-radius: 40rpx;
		}
	}

	.stats-section {
		margin: 40rpx;
		padding: 30rpx;
		background: #fff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			margin-bottom: 30rpx;
		}
		.stats-grid {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-around;
			.stats-item {
				width: 45%;
				margin-bottom: 20rpx;
				text-align: center;
				.stats-label {
					font-size: 24rpx;
					color: #666;
				}
				.stats-value {
					font-size: 36rpx;
					font-weight: bold;
					color: $theme-color;
				}
			}
		}
	}

	.login-btn {
		width: 200rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 28rpx;
		color: #fff;
		background-color: $theme-color;
		border-radius: 40rpx;
	}

	.community-entry {
		margin: 20rpx 0;
		padding: 20rpx;
		background-color: #fff;
		border-radius: 10rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.community-title {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
	}
</style>

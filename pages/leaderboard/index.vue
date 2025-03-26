<template>
	<view class="container">
		<view class="navbar">
			<text>排行榜</text>
		</view>
		<view class="leaderboard-content">
			<view v-for="(item, index) in leaderboard" :key="index" class="leaderboard-item">
				<view class="rank-info">
					<view class="left-info">
						<text class="rank">{{ item.rank }}</text>
					</view>
					<view class="center-info">
						<image :src="item.avatar" class="avatar"></image>
						<text class="name">{{ item.name }}</text>
					</view>
					<view class="right-info">
						<image :src="getRankIcon(item.rankName)" class="rank-icon"></image>
						<text class="level">{{ item.level }}</text>
					</view>
				</view>
				<view class="stats-info">
					<view class="stat">
						<image src="/static/icons/matches.png" class="icon"></image>
						<text class="stat-text">总局数: {{ item.matches }}</text>
					</view>
					<view class="stat">
						<image src="/static/icons/kills.png" class="icon"></image>
						<text class="stat-text">击杀数: {{ item.kills }}</text>
					</view>
					<view class="stat">
						<image src="/static/icons/winrate.png" class="icon"></image>
						<text class="stat-text">胜率: {{ item.winRate }}</text>
					</view>
				</view>
				<view class="stats-info">
					<view class="stat">
						<image src="/static/icons/headshot.png" class="icon"></image>
						<text class="stat-text">爆头率: {{ item.headshotRate }}</text>
					</view>
					<view class="stat">
						<image src="/static/icons/kd.png" class="icon"></image>
						<text class="stat-text">K/D: {{ item.kd }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { fetchRankingData } from '@/utils/api.js';

export default {
	data() {
		return {
			leaderboard: []
		}
	},
	onLoad() {
		this.loadLeaderboardData();
		this.startAutoRefresh();
	},
	methods: {
		loadLeaderboardData() {
			const storedData = uni.getStorageSync('leaderboard');
			if (storedData) {
				this.leaderboard = storedData;
			} else {
				this.fetchLeaderboardData();
			}
		},
		startAutoRefresh() {
			setInterval(() => {
				this.fetchLeaderboardData();
			}, 60000); // 每60秒刷新一次
		},
		async fetchLeaderboardData() {
			try {
				const data = await fetchRankingData();
				const leaderboardData = data.map((item, index) => ({
					rank: index + 1,
					name: item.nickname || '未知玩家',
					avatar: item.avatar || '',
					level: item.level || '',
					kills: item.stats.kills || 0,
					winRate: `${(item.stats.win || 0).toFixed(1)}%`,
					matches: item.stats.totalRound || 0,
					headshotRate: `${(item.stats.headshot || 0).toFixed(1)}%`,
					kd: item.stats.kd || 0,
					rankName: item.rank || '未知'
				}));
				this.leaderboard = leaderboardData;
				uni.setStorageSync('leaderboard', leaderboardData);
			} catch (error) {
				console.error('Error fetching leaderboard data:', error);
			}
		},
		getRankIcon(rankName) {
			// 根据段位名称返回相应的图标路径
			const rankIcons = {
				'元帅': '/static/icons/marshal.png',
				'上将': '/static/icons/shangjiang.png',
				'中将': '/static/icons/lieutenant_general.png',
				'少将': '/static/icons/major_general.png',
				'准将': '/static/icons/brigadier.png',
				'上校': '/static/icons/colonel.png',
				'中校': '/static/icons/lieutenant_colonel.png',
				'少校': '/static/icons/major.png',
				'大尉': '/static/icons/captain.png',
				'中尉': '/static/icons/lieutenant.png',
				'少尉': '/static/icons/second_lieutenant.png'
			};
			return rankIcons[rankName] || '/static/icons/default_rank.png';
		},
		goToLeaderboard() {
			uni.navigateTo({
				url: '/pages/leaderboard/index'
			});
		}
	}
}
</script>

<style lang="scss">
.container {
	padding: 20rpx;
	background: #f5f5f5;
	height: 100vh;
}

.navbar {
	padding: 20rpx;
	background: #fff;
	text-align: center;
	font-size: 32rpx;
	font-weight: bold;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}

.leaderboard-content {
	margin-top: 20rpx;
	background: #f9f9f9;
	padding: 20rpx;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.leaderboard-item {
	margin-bottom: 20rpx;
	padding: 15rpx;
	border-radius: 15rpx;
	background: #fff;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
	display: flex;
	flex-direction: column;
	align-items: center;
}

.rank-info {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	margin-bottom: 10rpx;
}

.left-info {
	display: flex;
	align-items: center;
	width: 33%; /* 占据三分之一宽度 */
}

.center-info {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 34%; /* 居中显示 */
}

.right-info {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	width: 33%; /* 占据三分之一宽度 */
}

.rank {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-right: 10rpx;
}

.avatar {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	margin-right: 5rpx;
}

.name {
	font-size: 24rpx;
	font-weight: bold;
	color: #555;
}

.rank-icon {
	width: 40rpx;
	height: 40rpx;
}

.level {
	font-size: 20rpx;
	color: #888;
}

.stats-info {
	display: flex;
	justify-content: space-around;
	width: 100%;
	margin-bottom: 5rpx;
}

.stat {
	display: flex;
	align-items: center;
}

.icon {
	width: 24rpx;
	height: 24rpx;
	margin-right: 5rpx;
}

.stat-text {
	font-size: 22rpx;
	color: #666;
}
</style> 
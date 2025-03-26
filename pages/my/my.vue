<template>
	<view class="my-container">
		<view class="user-wrap" @click="goto('/uni_modules/star-community-pages/pages/homepage/homepage')">
			<!-- 此处添加背景图片标签 -->
			<!-- <view class="background-image"></view> -->
			<view class="background-mask"></view>
			<view class="user-container">
				<uni-nav-bar background-color="transparent" :shadow="false" :border="false" status-bar>
				</uni-nav-bar>
				<view v-if="hasLogin" class="user-box">
					<image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
					<view class="nickname">
						{{userInfo.nickname||'未填写昵称'}}
					</view>
					<view v-if="userInfo.introduction" class="introduction">
						{{userInfo.introduction ? userInfo.introduction:'点击编辑简介'}}
					</view>
				</view>
				<button v-else style="margin: 100rpx 200rpx;" type="primary" @click.stop="goLogin">登录</button>
			</view>
		</view>
		<!-- <view v-if="hasLogin" style="padding: 0 24rpx 50rpx;"
			@click="goto('/uni_modules/star-wallet-pages/pages/index/index')">
			<star-wallet-card></star-wallet-card>
		</view> -->
		<view class="bottom-container">
			<view class="list-container">
				<view v-if="hasLogin" class="item-box" hover-class="view-hover" :hover-stay-time="50"
					hover-stop-propagation @click="goto(`/uni_modules/star-community-pages/pages/homepage/homepage`)">
					<view class="left-box">
						个人主页
					</view>
					<view class="right-box">
						<image class="icon" src="/uni_modules/star-community-pages/static/right.svg"></image>
					</view>
				</view>
				<view v-if="hasLogin" class="item-box" hover-class="view-hover" :hover-stay-time="50"
					hover-stop-propagation
					@click="goto(`/uni_modules/star-community-pages/pages/my-info/my-info?_id=${userInfo._id}`)">
					<view class="left-box">
						个人资料
					</view>
					<view class="right-box">
						<image class="icon" src="/uni_modules/star-community-pages/static/right.svg"></image>
					</view>
				</view>
				<view v-if="uniIDHasRole('admin')" class="item-box" hover-class="view-hover" :hover-stay-time="50"
					hover-stop-propagation
					@click="goto('/uni_modules/star-community-pages/pages/post-check/post-check')">
					<view class="left-box">
						帖子审核
					</view>
					<view class="right-box">
						<view class="text">
							<view v-if="post_0_count>0" class="count">
								{{ post_0_count }}
							</view>
						</view>
						<image class="icon" src="/uni_modules/star-community-pages/static/right.svg"></image>
					</view>
				</view>
				<view v-if="uniIDHasRole('admin')" class="item-box" hover-class="view-hover" :hover-stay-time="50"
					hover-stop-propagation
					@click="goto('/uni_modules/star-community-pages/pages/comment-check/comment-check')">
					<view class="left-box">
						评论审核
					</view>
					<view class="right-box">
						<view class="text">
							<view v-if="comment_0_count>0" class="count">
								{{ comment_0_count }}
							</view>
						</view>
						<image class="icon" src="/uni_modules/star-community-pages/static/right.svg"></image>
					</view>
				</view>
				<view v-if="uniIDHasRole('admin')" class="item-box" hover-class="view-hover" :hover-stay-time="50"
					hover-stop-propagation
					@click="goto('/uni_modules/star-community-pages/pages/circle-check/circle-check')">
					<view class="left-box">
						圈子审核
					</view>
					<view class="right-box">
						<view class="text">
							<view v-if="circle_0_count>0" class="count">
								{{ circle_0_count }}
							</view>
						</view>
						<image class="icon" src="/uni_modules/star-community-pages/static/right.svg"></image>
					</view>
				</view>
				<!-- <view v-if="uniIDHasRole('admin')" class="item-box" hover-class="view-hover" :hover-stay-time="50"
					hover-stop-propagation @click="goto('/uni_modules/star-community-pages/pages/rsshub/rsshub')">
					<view class="left-box">
						内容生成
					</view>
					<view class="right-box">
						<view class="text">
							RSS
						</view>
						<image class="icon" src="/uni_modules/star-community-pages/static/right.svg"></image>
					</view>
				</view> -->
				<!-- #ifdef MP-WEIXIN -->
				<button class="contact-btn" hover-class="contact-btn-hover" open-type="contact">
					<view class="item-box" hover-class="view-hover" :hover-stay-time="50" hover-stop-propagation>
						<view class="left-box">
							意见反馈
						</view>
						<view class="right-box">
							<image class="icon" src="/uni_modules/star-community-pages/static/right.svg"></image>
						</view>
					</view>
				</button>
				<!-- #endif -->
				<view v-if="hasLogin" class="item-box" hover-class="view-hover" :hover-stay-time="50"
					hover-stop-propagation
					@click="goto('/uni_modules/star-community-pages/pages/user-change/user-change')">
					<view class="left-box">
						切换账号
					</view>
					<view class="right-box">
						<view class="text"></view>
						<image class="icon" src="/uni_modules/star-community-pages/static/right.svg"></image>
					</view>
				</view>
				<view class="item-box" hover-class="view-hover" :hover-stay-time="50" hover-stop-propagation
					@click="copyText('https://ext.dcloud.net.cn/plugin?id=15412','已复制地址链接，请到浏览器打开')">
					<view class="left-box">
						源码地址
					</view>
					<view class="right-box">
						<view class="text">
							期待您的五星好评~
						</view>
						<image class="icon" src="/uni_modules/star-community-pages/static/right.svg"></image>
					</view>
				</view>
				<view v-if="hasLogin" class="item-box" hover-class="view-hover" :hover-stay-time="50"
					hover-stop-propagation @click="changeLoginState">
					<view class="left-box">
						退出登录
					</view>
					<view class="right-box">
						<view class="text"></view>
						<image class="icon" src="/uni_modules/star-community-pages/static/right.svg"></image>
					</view>
				</view>
			</view>
			<view class="logo-box">
				<!-- <image class="logo" src="/uni_modules/star-community-pages/static/logo.svg" mode="widthFix"></image> -->
				<view class="text">
					星之链科技
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		store,
		mutations
	} from '@/uni_modules/uni-id-pages/common/store.js'
	import pagesJson from '@/pages.json'

	export default {
		data() {
			return {
				post_0_count: 0, // 帖子待审数
				comment_0_count: 0, // 评论待审数
				circle_0_count: 0, // 圈子待审数
			};
		},
		computed: {
			hasLogin() {
				return store.hasLogin
			},
			userInfo() {
				return store.userInfo
			}
		},
		onShareAppMessage() {},
		onShareTimeline() {},
		onLoad() {},
		methods: {
			// 退出登录
			changeLoginState() {
				uni.showModal({
					title: '退出登录',
					content: '确定要退出登录吗？',
					success: async (res) => {
						if (res.confirm) {
							if (this.hasLogin) {
								await mutations.logout()
							} else {
								uni.redirectTo({
									url: '/' + pagesJson.uniIdRouter.loginPage
								});
							}
						}
					}
				})
			},
			goLogin() {
				uni.navigateTo({
					url: '/' + pagesJson.uniIdRouter.loginPage
				})
			},
			goto(url) {
				uni.navigateTo({
					url
				})
			},
			// 复制文字
			copyText(data, title) {
				uni.showLoading({
					title: ''
				})
				uni.setClipboardData({
					data,
					success: (res) => {
						uni.hideLoading()
						uni.showToast({
							title,
							icon: 'none'
						})
					},
					fail: (err) => {
						uni.hideLoading()
						uni.showToast({
							title: '复制失败',
							icon: 'error'
						})
					}
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.my-container {
		min-height: 100vh;
		background: linear-gradient(180deg, #d0ddf5, #f7f9fc 31%);
	}

	.view-hover {
		background-color: #eee;
	}

	.user-wrap {
		position: relative;

		.background-image {
			z-index: -2;
			position: absolute;
			height: 100%;
			width: 100%;
			background-size: cover; // 使背景图片覆盖整个容器
			background-position: center; // 将背景图片水平和垂直居中
			background-repeat: no-repeat; // 防止背景图片重复
			background-color: #dae8ff;
		}

		.background-mask {
			z-index: -1;
			position: absolute;
			width: 100%;
			min-height: 100vh;
		}

		.user-container {
			padding: 0 30rpx 50rpx;


			.user-box {
				margin-top: 30rpx;
				display: flex;
				flex-direction: column;
				align-items: center;

				.avatar {
					flex-shrink: 0;
					height: 130rpx;
					width: 130rpx;
					border-radius: 50%;
					background-color: #eee;
				}

				.nickname {
					margin-top: 20rpx;
					font-size: 34rpx;
					font-weight: 700;
				}

				.introduction {
					margin-top: 20rpx;
					color: #4b4b4b;
				}
			}
		}
	}

	.bottom-container {
		margin-top: -50rpx;
		padding-top: 30rpx;
		// background-color: #fff;
		border-radius: 30rpx 30rpx 0 0;
		overflow: hidden;

		.list-container {

			.contact-btn {
				background-color: transparent;
				padding: 0;
			}

			.contact-btn-hover {
				background-color: #f7f8f9;
			}

			.contact-btn::after {
				border: none;
			}

			.item-box {
				box-sizing: border-box;
				padding: 30rpx;
				width: 100%;
				display: inline-flex;
				justify-content: space-between;
				border-bottom: 2rpx #dcdcdc solid;
				font-size: 30rpx;
				line-height: 1;

				.left-box {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
				}

				.right-box {
					display: inline-flex;
					align-items: center;

					.text {

						.count {
							color: red;
							font-weight: 700;
						}
					}

					.icon {
						margin-left: 20rpx;
						height: 30rpx;
						width: 30rpx;
					}
				}
			}
		}


		.logo-box {
			margin: 100rpx 0 30rpx;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;

			.logo {
				width: 25%;
			}

			.text {
				margin-top: 30rpx;
				color: #9c9c9c;
			}
		}
	}
</style>
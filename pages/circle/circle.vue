<template>
	<view class="circle-container">
		<uni-nav-bar left-icon="left" background-color="#f4f4f4" :fixed="true" :shadow="false" :border="false"
			status-bar left-width="20px" @clickLeft="goBack">
			<!-- #ifndef VUE3 -->
			<view slot="default" style="height: 100%;width: 100%;">
				<uv-tabs ref="tabs" :list="tabList" :current="current" :scrollable="true"
					:active-style="{color: '#000',fontWeight: 700}" bg-color="transparent" @change="tabsChange" />
			</view>
			<!-- #endif -->
			<!-- #ifdef VUE3 -->
			<template v-slot:default>
				<view style="height: 100%;width: 100%;">
					<uv-tabs ref="tabs" :list="tabList" :current="current" :scrollable="true"
						:active-style="{color: '#000',fontWeight: 700}" bg-color="transparent" @change="tabsChange" />
				</view>
			</template>
			<!-- #endif -->
		</uni-nav-bar>
		<mescroll-body v-show="current===0" ref="mescrollRef" :down="downOption" :up="upOption" @init="mescrollInit"
			@down="downCallback" @up="upCallback">
			<view class="footprint-contianer">
				<view class="title-box">
					<view class="title">
						我的足迹
					</view>
					<image class="icon"
						:src="show_circle_footprint?'/uni_modules/star-community-pages/static/view.svg':'/uni_modules/star-community-pages/static/view-no.svg'"
						mode="" @click.stop="show_circle_footprint=!show_circle_footprint"></image>
				</view>
				<scroll-view v-show="show_circle_footprint" class="circle-list" scroll-x="true">
					<block v-if="circleViewList.length">
						<view v-for="(item, index) in circleViewList" :key="item._id" class="circle-item"
							@click.stop="clickCircle(item)">
							<image class="image" :src="item.avatar" mode="aspectFill"></image>
							<view class="name star-line-1">
								{{ item.name }}
							</view>
							<view class="tips">
								关注 {{ item.careCount }}
							</view>
						</view>
					</block>
					<view v-else style="text-align: center;padding-bottom: 20rpx;font-size: 26rpx;color: #a7a7a7;">
						暂无足迹~
					</view>
				</scroll-view>
			</view>
			<view class="care-container">
				<view class="title-box">
					<view class="title">
						我关注的圈子
					</view>
					<!-- <image class="icon" src="/uni_modules/star-community-pages/static/view.svg" mode=""></image> -->
				</view>
				<view class="circle-list">
					<view v-for="(item, index) in circleCareList" :key="item._id" class="circle-item star-line-1"
						@click.stop="clickCircle(item.circleList[0])">
						<image class="image" :src="item.circleList[0].avatar" mode="aspectFill"></image>
						<view class="image-right star-line-1">
							<view class="name star-line-1">
								{{ item.circleList[0].name }}
							</view>
							<view class="hot">
								热度 {{ item.circleList[0].viewCount+item.circleList[0].careCount }}
							</view>
						</view>
					</view>
					<view class="circle-item star-line-1"
						@click="goto('/uni_modules/star-community-pages/pages/circle-create/circle-create')">
						<image class="image" src="/uni_modules/star-community-pages/static/circle-create.svg"
							mode="aspectFill"></image>
						<view class="image-right star-line-1">
							<view class="name star-line-1">
								创建圈子
							</view>
							<view class="hot">
								试试创建自己的圈子
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="hot-circle-container">
				<view class="title-box">
					<view class="title">
						热门圈子精选
					</view>
				</view>
				<view class="circle-list">
					<view v-for="(circle, circleIndex) in circleHotList" :key="circle._id" class="circle-item"
						@click.stop="clickCircle(circle)">
						<view class="circle-top">
							<image class="image" :src="circle.avatar" mode="aspectFill"></image>
							<view class="image-right">
								<view class="name star-line-1">
									{{ circle.name }}
								</view>
								<view class="tips">
									<text>关注 {{ circle.careCount || 0 }}</text>
									<text style="padding-left: 20rpx;">帖子 {{ circle.postCount || 0 }}</text>
								</view>
							</view>
							<view class="action-box">
								<!-- <view class="has-care-box" @click.stop="clickCareCircle(circle)">
									已关注
								</view> -->
								<view v-if="!circle.isCareCircle" class="care-box"
									@click.stop="clickCareCircle(circle)">
									关注
								</view>
							</view>
						</view>
						<scroll-view class="post-list" scroll-x="true">
							<view v-for="(post, postIndex) in circle.postList" :key="post._id" class="post-item"
								@click.stop="clickPost(post)">
								<view class="image-box">
									<image v-if="post.mediaList&&post.mediaList.length" class="image"
										:src="post.mediaList[0].poster||post.mediaList[0].url" mode="aspectFill">
									</image>
									<view v-else class="image-content">
										{{ post.content }}
									</view>
								</view>
								<view class="text star-line-1">
									{{ post.title || post.content || '热门贴' }}
								</view>
							</view>
						</scroll-view>
					</view>
				</view>
			</view>
		</mescroll-body>
		<view v-show="current===1">
			<star-circle-menu @clickCircle="clickMenuCircle"></star-circle-menu>
		</view>
	</view>
</template>

<script>
	import {
		store,
		mutations
	} from '@/uni_modules/uni-id-pages/common/store.js'
	import MescrollMixin from '@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js'
	import pagesJson from '@/pages.json'

	export default {
		mixins: [MescrollMixin], // 使用mixin
		data() {
			return {
				tabList: [{
					name: '我的圈子'
				}, {
					name: '圈子广场'
				}],
				current: 0,
				show_circle_footprint: false, // 是否显示圈子足迹
				circleViewList: [], // 圈子足迹
				circleCareList: [], // 我关注的圈子
				circleHotList: [], // 热门圈子精选

				downOption: {
					use: false, // 启用mescroll下拉刷新
				},
				upOption: {
					isBounce: false,
					noMoreSize: 4, // 如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
					toTop: {
						safearea: true,
					}
				}
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
		watch: {
			show_circle_footprint(val) {
				// uni.setStorageSync('show_circle_footprint', val)
				uni.setStorage({
					key: 'show_circle_footprint',
					data: val
				})
			}
		},
		onShareAppMessage() {

		},
		onShareTimeline() {

		},
		// 原生下拉刷新
		async onPullDownRefresh() {
			// 这里加载你想下拉刷新的数据, 比如刷新轮播数据
			await Promise.all([this.getCircleViewList(), this.getCircleCareList(), this.mescroll.resetUpScroll()])
			// 下拉刷新的回调,默认重置上拉加载列表为第一页 (自动执行 page.num=1, 再触发upCallback方法 )
			uni.stopPullDownRefresh()
		},
		onLoad() {
			this.getCircleCareList()

			let show_circle_footprint = uni.getStorageSync('show_circle_footprint')
			if ([true, false].includes(show_circle_footprint)) {
				this.show_circle_footprint = show_circle_footprint
			} else {
				this.show_circle_footprint = true
				uni.setStorageSync('show_circle_footprint', true)
			}
		},
		onShow() {
			this.getCircleViewList()
		},
		methods: {
			// mescroll下拉刷新的回调
			// async downCallback() {
			// 	// 这里加载你想下拉刷新的数据, 比如刷新轮播数据
			// 	await Promise.all([this.getCircleViewList(), this.getCircleCareList(), this.mescroll.resetUpScroll()])
			// 	// 下拉刷新的回调,默认重置上拉加载列表为第一页 (自动执行 page.num=1, 再触发upCallback方法 )
			// },
			// 上拉加载的回调: 其中page.num:当前页 从1开始, page.size:每页数据条数,默认10
			async upCallback(page) {
				try {
					// 请求数据列表
					let list = await this.getCircleHotList(page)
					// 设置列表数据
					if (page.num === 1) this.circleHotList = [] // 如果是第一页需手动制空列表
					this.circleHotList = [...this.circleHotList, ...list] // 追加新数据
					// 联网成功的回调,隐藏下拉刷新和上拉加载的状态
					this.mescroll.endSuccess(list.length)
				} catch (err) {
					console.log(err)
				}
			},
			// 获取圈子足迹
			async getCircleViewList() {
				let circleViewList = uni.getStorageSync('circleViewList') || []
				if (circleViewList.length) {
					let res = await uniCloud.callFunction({
						name: 'star-community-circle',
						data: {
							flag: 3,
							data: {
								circleViewList
							}
						}
					})
					// 对比拉取的足迹列表与本地存储的列表，并保持相同顺序
					let sortedList = [];
					circleViewList.forEach(id => {
						let found = res.result.data.find(item => item._id === id);
						if (found) {
							sortedList.push(found);
						}
					});
					this.circleViewList = sortedList;
				}
			},
			// 获取我关注的圈子
			async getCircleCareList() {
				let userInfo = this.userInfo
				if (!this.hasLogin) return
				let res = await uniCloud.callFunction({
					name: 'star-community-circle',
					data: {
						flag: 7,
						data: {
							my_user_id: userInfo._id,
							match: {
								user_id: userInfo._id,
							},
							sort: {
								createTime: -1
							},
							skip: 0,
							limit: 100
						}
					}
				})
				this.circleCareList = res.result.data
			},
			// 获取热门圈子精选
			async getCircleHotList(page) {
				let userInfo = this.userInfo
				let res = await uniCloud.callFunction({
					name: 'star-community-circle',
					data: {
						flag: 4,
						data: {
							// school: userInfo.school,
							my_user_id: userInfo._id,
							match: {
								status: 1, // 0 审核中 1 正常 2 审核不通过 3 已删除 4 已违规
							},
							skip: (page.num - 1) * page.size,
							limit: page.size
						}
					}
				})
				return res.result.data
				// return mockPost.generateRandomPosts(page.size)
			},
			// 关注圈子
			async clickCareCircle(circle) {
				if (!this.hasLogin) {
					uni.navigateTo({
						url: '/' + pagesJson.uniIdRouter.loginPage
					});
					return
				}
				console.log('clickCareCircle');
				uni.showLoading({
					title: '关注中',
					mask: true
				})
				let user_id = this.userInfo._id
				let circle_id = circle._id

				try {
					await uniCloud.callFunction({
						name: 'star-community-circle',
						data: {
							flag: 5,
							data: {
								user_id,
								circle_id,
							}
						}
					})
					uniCloud.callFunction({
						name: 'star-community-count',
						data: {
							flag: 6,
							data: {
								id: circle._id,
								careIncCount: 1
							}
						}
					})
					this.getCircleCareList()
					uni.hideLoading()
					uni.showToast({
						title: '关注成功'
					})
				} catch (err) {
					console.error(err);
					uni.hideLoading()
					uni.showToast({
						title: '重复关注',
						icon: 'error'
					})
				}
				// 更改所有圈子关注状态
				this.circleHotList.forEach(item => {
					if (item._id === circle._id) {
						item.isCareCircle = true
					}
				})
			},
			// tabs通知swiper切换
			tabsChange(e) {
				this.current = e.index;
			},
			// swiper滑动中
			swiperTransition(e) {
				this.$refs.tabs.setDx(e.detail.dx);
			},
			// swiper滑动结束
			swiperAnimationfinish(e) {
				this.current = e.detail.current;
				this.$refs.tabs.unlockDx();
			},
			// 点击圈子
			clickCircle(circle) {
				uni.navigateTo({
					url: `/uni_modules/star-community-pages/pages/circle-detail/circle-detail?_id=${circle._id}`
				})
			},
			// 点击帖子
			clickPost(post) {
				uni.navigateTo({
					url: `/uni_modules/star-community-pages/pages/post-detail/post-detail?_id=${post._id}`
				})
			},
			// 点击菜单圈子
			clickMenuCircle(circle) {
				console.log('点击菜单圈子', circle);
				uni.navigateTo({
					url: `/uni_modules/star-community-pages/pages/circle-detail/circle-detail?_id=${circle._id}`
				})
			},
			goto(url) {
				uni.navigateTo({
					url
				})
			},
			goBack() {
				uni.navigateBack({
					fail: (err) => {
						console.log(err);
						let path = '/' + pagesJson.pages[0].path
						uni.switchTab({
							url: path,
							fail: (err) => {
								console.log(err);
								uni.navigateTo({
									url: path
								})
							}
						})
					}
				})
			},
			goToCommunity() {
				uni.switchTab({
					url: '/pages/community/community'
				});
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
	::v-deep ::-webkit-scrollbar {
		display: none;
		background: transparent !important;
	}
</style>

<style scoped lang="scss">
	/* start--文本行数限制--start */
	.star-line-1 {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.star-line-2 {
		-webkit-line-clamp: 2;
	}

	.star-line-3 {
		-webkit-line-clamp: 3;
	}

	.star-line-4 {
		-webkit-line-clamp: 4;
	}

	.star-line-2,
	.star-line-3,
	.star-line-4 {
		overflow: hidden;
		word-break: break-all;
		text-overflow: ellipsis;
		display: -webkit-box; // 弹性伸缩盒
		-webkit-box-orient: vertical; // 设置伸缩盒子元素排列方式
	}

	/* end--文本行数限制--end */
	.circle-container {
		position: relative;
		background-color: #f4f4f4;

		.box-container {
			margin: 24rpx 24rpx 0;
			padding: 20rpx;
			background-color: #fff;
			border-radius: 20rpx;

			.title-box {
				width: 100%;
				display: inline-flex;
				align-items: center;
				justify-content: space-between;

				.title {
					font-weight: 800;
					font-size: 26rpx;
				}

				.icon {
					height: 40rpx;
					width: 40rpx;
				}
			}
		}

		.footprint-contianer {
			@extend .box-container;
			margin-top: 10rpx;

			.circle-list {
				margin-top: 20rpx;
				white-space: nowrap;

				.circle-item {
					margin-right: 30rpx;
					display: inline-block;
					text-align: center;

					.image {
						height: 80rpx;
						width: 80rpx;
						background-color: #eee;
						border-radius: 20rpx;
					}

					.name {
						margin-top: 2rpx;
						font-size: 24rpx;
						max-width: 200rpx;
					}

					.tips {
						margin-top: 2rpx;
						font-size: 22rpx;
						color: #d0d0d0;
					}
				}
			}
		}

		.care-container {
			margin-top: 20rpx;
			@extend .box-container;

			.circle-list {
				width: 100%;
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 0 20rpx;

				.circle-item {
					margin-top: 20rpx;
					display: inline-flex;
					align-items: center;

					.image {
						flex-shrink: 0;
						height: 80rpx;
						width: 80rpx;
						background-color: #eee;
						border-radius: 20rpx;
					}

					.image-right {
						padding: 0 14rpx;
						box-sizing: border-box;

						.name {
							font-size: 26rpx;
						}

						.hot {
							margin-top: 8rpx;
							color: #d0d0d0;
							font-size: 22rpx;
						}
					}
				}
			}
		}

		.hot-circle-container {
			margin-top: 20rpx;
			@extend .box-container;

			.circle-list {
				.circle-item {
					margin-top: 20rpx;

					.circle-top {
						width: 100%;
						display: inline-flex;

						.image {
							flex-shrink: 0;
							height: 70rpx;
							width: 70rpx;
							background-color: #eee;
							border-radius: 20rpx;
						}

						.image-right {
							padding: 0 14rpx;
							width: 100%;
							box-sizing: border-box;

							.name {
								font-size: 26rpx;
							}

							.tips {
								margin-top: 4rpx;
								color: #d0d0d0;
								font-size: 22rpx;
							}
						}

						.action-box {
							margin-left: 20rpx;
							flex-shrink: 0;
							text-align: center;

							.border-box {
								margin-bottom: 20rpx;
								border-radius: 100rpx;
								font-size: 28rpx;
								padding: 6rpx 20rpx;
								border: 2rpx solid;
							}

							.care-box {
								@extend .border-box;
								border-color: #55aaff;
								color: #55aaff;
							}

							.has-care-box {
								@extend .border-box;
								color: #878787;
								border-color: #878787;
							}
						}
					}

					.post-list {
						margin-top: 10rpx;
						white-space: nowrap;

						.post-item {
							margin-right: 30rpx;
							width: 240rpx;
							display: inline-block;

							.image-box {
								width: 100%;
								height: 120rpx;
								box-sizing: border-box;
								background-color: #eee;
								border-radius: 10rpx;
								overflow: hidden;

								.image {
									height: 100%;
									width: 100%;
								}

								.image-content {
									height: 100%;
									width: 100%;
									padding: 10rpx;
									font-size: 24rpx;
									color: #989898;
									box-sizing: border-box;
									word-wrap: break-word; // 兼容性较好的属性
									overflow-wrap: break-word; // 按照规范更推荐的属性
									word-break: break-all;
									white-space: normal;
								}
							}

							.text {
								margin-top: 10rpx;
								font-size: 26rpx;
								width: 100%;
							}
						}
					}
				}
			}
		}
	}
</style>
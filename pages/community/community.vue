<template>
	<view class="community-container">
		<!-- <button @click="gCircleList({
				num: 1,
				size: 99999
			})">查询圈子列表</button> -->
		<view class="top-container">
			<view style="margin: 0 24rpx;"
				@click.stop="navigateTo('/uni_modules/star-community-pages/pages/search/search')">
				<uni-search-bar readonly bgColor="#fff" :radius="50" placeholder="输入关键词搜索帖子/评论/圈子/用户" />
			</view>
			<star-banner category_id="community" margin="24rpx 24rpx 0"></star-banner>
			<star-grid category_id="community" margin="24rpx 24rpx 0"></star-grid>
			<star-circle-hot-card margin="24rpx 24rpx 0"></star-circle-hot-card>
			<star-post-hot-card margin="24rpx 24rpx 0"></star-post-hot-card>
			<star-notice-bar category_id="community" margin="24rpx 0 0"></star-notice-bar>
		</view>

		<view class="tabs-container">
			<uv-tabs ref="tabs" :list="tabList" :current="current" :scroll-count="0" bar-animate-mode="worm"
				:active-style="{color: '#000',fontWeight: 700}" bg-color="#fff" @change="tabsChange">
				<!-- #ifndef VUE3 -->
				<view slot="right" class="tabs-right">
					<uni-segmented-control :current="segmentedCurrent" :values="segmentedList" styleType="button"
						activeColor="#00aaff" @clickItem="clickSegmented" />
				</view>
				<!-- #endif -->
				<!-- #ifdef VUE3 -->
				<template v-slot:right>
					<view class="tabs-right">
						<uni-segmented-control :current="segmentedCurrent" :values="segmentedList" styleType="button"
							activeColor="#00aaff" @clickItem="clickSegmented" />
					</view>
				</template>
				<!-- #endif -->
			</uv-tabs>
		</view>
		<view :style="{'background-color': segmentedCurrent===1?'#f4f4f4':'#fff'}">
			<mescroll-body ref="mescrollRef" :fixed="true" :down="downOption" :up="upOption" @init="mescrollInit"
				@down="downCallback" @up="upCallback">
				<view v-if="segmentedCurrent===0" style="padding: 4rpx;">
					<star-post-list :list="postList" :option="postOption" :my_user="userInfo" @selectPost="selectPost"
						@longpressPost="longpressPost" @clickUserAvatar="clickUserAvatarPost"
						@clickUserNickname="clickUserNicknamePost" @clickCareUser="clickCareUserPost"
						@clickChatUser="clickChatUserPost" @clickMore="clickMorePost" @clickSharePost="clickSharePost"
						@clickCommentPost="clickCommentPost" @clickDeletePost="clickDeletePost"
						@toggleLike="toggleLikePost" @clickCirclePost="clickCirclePost">
					</star-post-list>
				</view>
				<block v-if="segmentedCurrent===1">
					<star-post-pic-list ref="starPostPicListRef" :list="postList" :option="postOption"
						:my_user="userInfo" @selectPost="selectPost" @longpressPost="longpressPost"
						@clickUserAvatar="clickUserAvatarPost" @clickUserNickname="clickUserNicknamePost"
						@clickCareUser="clickCareUserPost" @clickChatUser="clickChatUserPost" @clickMore="clickMorePost"
						@clickSharePost="clickSharePost" @clickCommentPost="clickCommentPost"
						@clickDeletePost="clickDeletePost" @toggleLike="toggleLikePost"
						@clickCirclePost="clickCirclePost">
					</star-post-pic-list>
				</block>
			</mescroll-body>
		</view>

		<uni-fab style="zoom: .8; margin-bottom: 100rpx;" :pattern="fabPattern" horizontal="right" @fabClick="clickReleasePost"></uni-fab>
	</view>
</template>

<script>
	import {
		store,
		mutations
	} from '@/uni_modules/uni-id-pages/common/store.js'
	import MescrollMixin from '@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js'
	import StarPostListMixin from '@/mixins/star-post-list.js'

	// #ifdef APP
	import checkUpdate from '@/uni_modules/uni-upgrade-center-app/utils/check-update'
	// #endif

	export default {
		mixins: [MescrollMixin, StarPostListMixin],
		data() {
			return {
				fabPattern: {
					icon: 'plusempty',
					buttonColor: '#1abefb'
				},
				circleCareList: [], // 我关注的圈子
				topContainerHeight: 0,
				tabList: [{
					name: '最新'
				}, {
					name: '关注'
				}],
				segmentedList: ['列表', '瀑布流'],
				segmentedCurrent: 0,
				careUserList: [],
				current: 0,
				postOption: {
					mode: 2,
					lineShow: 6, // 文本超出多少行显示省略号
					showCare: true,
					showChat: true,
					showTop: true,
				},
				downOption: {
					use: false, // 启用mescroll下拉刷新
				},
				upOption: {
					isBounce: false,
					noMoreSize: 4, // 如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
					toTop: {
						right: '24rpx',
						bottom: '140rpx',
						safearea: true,
						width: '80rpx',
						radius: '50%',
					}
				},
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
		async onPullDownRefresh() {
			this.postList = []
			if (this.$refs.starPostPicListRef) {
				this.$refs.starPostPicListRef.clearList()
			}
			await Promise.all([this.mescroll.resetUpScroll(), this.initData()])
			uni.stopPullDownRefresh()
		},
		async onLoad() {
			// #ifdef APP
			checkUpdate()
			// #endif
			await this.initData()
		},
		methods: {
			async gCircleList(page = {
				num: 1,
				size: 99999
			}) {
				console.log(page);
				let res = await uniCloud.callFunction({
					name: 'star-community-circle',
					data: {
						flag: 8,
						data: {
							match: {},
							sort: {
								createTime: -1,
							},
							skip: (page.num - 1) * page.size,
							limit: page.size
						}
					}
				})
				console.log(res);
				this.createGroups(res.result.data)
			},
			async createGroups(groupDataList) {
				const uniImCo = uniCloud.importObject('uni-im-co', {
					customUI: true
				});
				for (let groupData of groupDataList) {
					try {
						let info = groupData; // 假设 groupData 是单个群聊数据对象
						let url = info.avatar;
						const match = url.match(/([^/]+)\.([^.?]+)(\?.*)?$/);

						const name = match[1]; // 文件名
						const extname = match[2]; // 文件扩展名
						const fullUrl = url.split("?")[0]; // 去掉查询参数后的 URL

						// 使用group获取用户列表
						const db = uniCloud.database()
						const collection = db.collection('star-community-circle-care')
						const userRes = await collection.where({
							circle_id: info._id
						}).get()
						let user_ids = userRes.result.data.map(item => item.user_id)
						user_ids.push(info.user_id)
						console.log(user_ids);

						let group_res = await uniImCo.chooseUserIntoGroup({
							group_id: "", // 如果不指定，会生成一个新的群聊
							user_ids: [info.user_id], // 用户ID
							// admin_uids: [info.user_id, '667916e24b01d4591f206d7c'], // 管理员ID
							groupInfo: {
								name: info.name,
								introduction: info.about,
								avatar_file: {
									extname: extname,
									name: name,
									url: fullUrl,
								},
								join_option: 'freeAccess', // 入群方式
							},
							is_mute: true
						});

						let update_res = await uniCloud.callFunction({
							name: 'star-community-circle',
							data: {
								flag: 9,
								data: {
									id: info._id,
									updateData: {
										group_id: group_res.data.group_id,
									},
								}
							}
						})

						console.log('修改成功', group_res, update_res);

						console.log(`群聊创建成功: ${info.name}`, group_res);
					} catch (error) {
						console.error(`群聊创建失败: ${groupData.name}`, error);
					}
				}
			},
			// mescroll下拉刷新的回调
			downCallback() {
				// 这里加载你想下拉刷新的数据, 比如刷新轮播数据
				// loadSwiper();
				// 下拉刷新的回调,默认重置上拉加载列表为第一页 (自动执行 page.num=1, 再触发upCallback方法 )
				this.postList = []
				if (this.$refs.starPostPicListRef) {
					this.$refs.starPostPicListRef.clearList()
				}
				this.mescroll.resetUpScroll()
			},
			// 上拉加载的回调: 其中page.num:当前页 从1开始, page.size:每页数据条数,默认10
			async upCallback(page) {
				try {
					let currentTabName = this.tabList[this.current].name
					if (currentTabName === '关注') {
						await this.getCareUserList({
							size: 1000,
							num: 1
						})
					}
					// 请求数据列表
					let list = await this.getPostList(page)
					// 设置列表数据
					if (page.num === 1) this.postList = [] // 如果是第一页需手动制空列表
					this.postList = [...this.postList, ...list] // 追加新数据
					// 联网成功的回调,隐藏下拉刷新和上拉加载的状态
					this.mescroll.endSuccess(list.length)
				} catch (err) {
					console.log(err)
				}
			},
			async initData() {
				this.$nextTick(() => {
					let topContainerNode = uni.createSelectorQuery().select(".top-container")
					topContainerNode.boundingClientRect((data) => {
						this.topContainerHeight = data.height
					}).exec()
				})
			},
			// 拉取帖子列表
			async getPostList(page) {
				let userInfo = this.userInfo
				let currentTabName = this.tabList[this.current].name

				let match = {
					status: 1, // 0 审核中 1 正常 2 审核不通过 3 已删除 4 已违规
				}
				let sort = {
					createTime: -1,
				}

				if (currentTabName === '最新') {
					sort = {
						top: -1,
						createTime: -1,
					}
				}
				if (currentTabName === '关注') {
					match.user_id = {
						$in: this.careUserList
					}
				}

				let res = await uniCloud.callFunction({
					name: 'star-community-post',
					data: {
						flag: 5,
						data: {
							my_user_id: userInfo._id,
							match,
							sort,
							skip: (page.num - 1) * page.size,
							limit: page.size
						}
					}
				})
				return res.result.data
			},
			// 拉取关注列表
			async getCareUserList(page) {
				let userInfo = this.userInfo

				let res = await uniCloud.callFunction({
					name: 'star-community-care',
					data: {
						flag: 3,
						data: {
							my_user_id: userInfo._id,
							match: {
								user_id: userInfo._id
							},
							sort: {
								createTime: -1
							},
							skip: (page.num - 1) * page.size,
							limit: page.size
						}
					}
				})
				this.careUserList = res.result.data.map(care => care.ta_id)
			},
			// 点击发布帖子按钮
			clickReleasePost() {
				this.navigateTo('/uni_modules/star-community-pages/pages/post-release/post-release')
			},
			//跳转
			navigateTo(url) {
				uni.navigateTo({
					url
				})
			},
			// 切换帖子展示形式
			clickSegmented(e) {
				this.segmentedCurrent = e.currentIndex
				uni.pageScrollTo({
					scrollTop: this.topContainerHeight
				})
			},
			// tabs切换
			tabsChange(e) {
				let index = e.index
				uni.pageScrollTo({
					scrollTop: this.topContainerHeight
				})
				this.postList = []
				if (this.$refs.starPostPicListRef) {
					this.$refs.starPostPicListRef.clearList()
				}
				this.current = index
				this.mescroll.removeEmpty()
				this.mescroll.showUpScroll()
				setTimeout(() => {
					this.mescroll.resetUpScroll()
					// uni.setStorageSync('home_tabCurrent', index)
				}, 300)
			},
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f4f4f4;
		// background: linear-gradient(61.19deg, rgb(239, 241, 246) 32.33%, rgba(228, 243, 253, 0.79) 73.454%, rgba(215, 230, 255, 0.2) 87.306%, rgb(238, 246, 255) 92.829%, rgb(226, 243, 254) 100%);
	}

	::v-deep ::-webkit-scrollbar {
		display: none;
		background: transparent !important;
	}

	::v-deep .uni-noticebar {
		margin-bottom: 0 !important;
	}

	::v-deep .uni-fab {
		right: 24rpx;
		box-shadow: none !important;
	}

	::v-deep .uni-fab__content--other-platform {
		box-shadow: none !important;
	}

	.uni-searchbar {
		padding: 0 !important;
	}
</style>

<style scoped lang="scss">
	.star-line-1 {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.community-container {

		.top-container {
			padding: 24rpx 0;
		}

		.tabs-container {
			z-index: 9;
			position: sticky;
			top: 0;
			background-color: #fff;

			.tabs-right {
				margin-right: 24rpx;
				width: 300rpx;
				zoom: .6;
			}
		}
	}
</style>
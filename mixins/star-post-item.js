import {
	store,
	mutations
} from '@/uni_modules/uni-id-pages/common/store.js'
import uniIm from '@/uni_modules/uni-im/sdk/index.js'
import pagesJson from '@/pages.json'

const StarPostItemMixin = {
	data() {
		return {
			postList: [],
		}
	},
	onShareAppMessage(e) {
		if (e.from === 'button') {
			let postIndex = this.postList.findIndex(item => item._id === e.target.id)
			if (postIndex > -1) {
				let post = this.postList[postIndex]
				uniCloud.callFunction({
					name: 'star-community-count',
					data: {
						flag: 1,
						data: {
							id: post._id,
							shareIncCount: 1,
						}
					}
				})
				this.postList[postIndex].shareCount++
				if (post.mediaList && post.mediaList.length > 0) {
					return {
						title: post.title || post.content,
						imageUrl: post.mediaList[0].poster || post.mediaList[0].url,
						path: `/uni_modules/star-community-pages/pages/post-detail/post-detail?_id=${post._id}`,

					};
				} else if (post.imgList.length > 0) {
					return {
						title: post.title || post.content,
						imageUrl: post.imgList[0],
						path: `/uni_modules/star-community-pages/pages/post-detail/post-detail?_id=${post._id}`,

					};
				} else {
					return {
						title: post.title || post.content,
						path: `/uni_modules/star-community-pages/pages/post-detail/post-detail?_id=${post._id}`,

					};
				}
			}
		}
	},
	onShareTimeline() {

	},
	methods: {
		// 选中贴子
		selectPost(post) {
			console.log(post);
			this.goto(`/uni_modules/star-community-pages/pages/post-detail/post-detail?_id=${post._id}`)
		},
		// 长按帖子
		longpressPost(post) {
			console.log('longpressPost');
			this.showMoreActionSheetPost(post)
		},
		// 点击帖子中的关注用户
		async clickCareUserPost(post) {
			if (!store.hasLogin) {
				uni.navigateTo({
					url: '/' + pagesJson.uniIdRouter.loginPage
				});
				return
			}
			console.log('clickPostCareUser');
			uni.showLoading({
				title: '关注中',
				mask: true
			})
			let user_id = store.userInfo._id
			let ta_id = post.user_id

			try {
				await uniCloud.callFunction({
					name: 'star-community-care',
					data: {
						flag: 1,
						data: {
							user_id,
							ta_id
						}
					}
				})
				uniCloud.callFunction({
					name: 'star-community-count',
					data: {
						flag: 0,
						data: {
							id: user_id,
							careIncCount: 1
						}
					}
				})
				uniCloud.callFunction({
					name: 'star-community-count',
					data: {
						flag: 0,
						data: {
							id: ta_id,
							fansIncCount: 1
						}
					}
				})
				if (ta_id !== user_id) {
					uniCloud.callFunction({
						name: 'star-community-read',
						data: {
							flag: 0,
							data: {
								user_id,
								ta_id,
								status: 0, // 0 未读 1 已读
								type: 3, // 0帖子被赞 1评论被赞 2帖子被收藏 3新增关注 4帖子被回复 5评论被回复
								type_id: '',
								createTime: Date.now(),
								updateTime: Date.now(),
							}
						}
					})
				}
				// 更改所有帖子关注用户状态
				this.postList.forEach(item => {
					if (item.user_id === post.user_id) {
						item.isCareUser = true
					}
				})
				uni.hideLoading()
				uni.showToast({
					title: '关注成功'
				})
			} catch (e) {
				//TODO handle the exception
				uni.hideLoading()
				uni.showToast({
					title: '重复关注',
					icon: 'error'
				})
			}
		},
		// 点击私信用户
		async clickChatUserPost(post) {
			const user_id = post.user_id
			//拿到会话（如果没有自动创建）
			const currentConversation = await uniIm.conversation.get({
				friend_uid: user_id
			});
			console.log('currentConversation', currentConversation);
			// 当前用户给对方发个消息
			if (this.isWidescreen) {
				//若为宽屏，则触发右侧详情页的自定义事件，通知右侧窗体刷新详情
				uni.navigateTo({
					url: '/uni_modules/uni-im/pages/index/index?conversation_id=' + currentConversation
						.id
				});
			} else {
				// 若为窄屏，则打开新窗体，在新窗体打开详情页面
				uni.navigateTo({
					url: '/uni_modules/uni-im/pages/chat/chat?conversation_id=' + currentConversation.id
				});
			}
		},
		// 点击帖子更多
		clickMorePost(post) {
			console.log('clickMore');
			this.showMoreActionSheetPost(post)
		},
		// 显示帖子更多操作菜单选项
		// showMoreActionSheetPost(post) {
		// 	uni.showActionSheet({
		// 		itemList: ['举报'],
		// 		success: async (res) => {
		// 			console.log('选中了第' + (res.tapIndex + 1) + '个按钮');
		// 			uni.showLoading({
		// 				title: '举报中',
		// 				mask: true
		// 			})
		// 			await uniCloud.callFunction({
		// 				name: 'star-community-count',
		// 				data: {
		// 					flag: 1,
		// 					data: {
		// 						id: post._id,
		// 						reportIncCount: 1
		// 					}
		// 				}
		// 			})
		// 			uni.hideLoading()
		// 			uni.showToast({
		// 				title: '举报成功'
		// 			})
		// 		},
		// 		fail: (res) => {
		// 			console.log(res.errMsg);
		// 		}
		// 	});
		// },
		// 点击分享帖子
		clickSharePost(post) {
			console.log('clickSharePost');
		},
		// 点击喜欢帖子
		async toggleLikePost(post, isLiked) {
			if (!store.hasLogin) {
				uni.navigateTo({
					url: '/' + pagesJson.uniIdRouter.loginPage
				});
				return
			}
			console.log('toggleLikePost', isLiked);

			let userInfo = store.userInfo

			if (isLiked) {
				try { // 创建user_id和enmu_id的组合唯一索引
					let insert_like_res = await uniCloud.callFunction({
						name: 'star-community-like',
						data: {
							flag: 1,
							data: {
								user_id: userInfo._id,
								ta_id: post.user_id,
								type: 0, // 点赞类型：0帖子，1评论
								enmu_id: post._id, // 点赞类型对应的id
							}
						}
					})
					console.log(insert_like_res.result);
					uniCloud.callFunction({
						name: 'star-community-count',
						data: {
							flag: 1,
							data: {
								id: post._id,
								likeIncCount: 1
							}
						}
					})
					uniCloud.callFunction({
						name: 'star-community-count',
						data: {
							flag: 0,
							data: {
								id: post.user_id,
								likeIncCount: 1
							}
						}
					})
					if (post.user_id !== userInfo._id) {
						uniCloud.callFunction({
							name: 'star-community-read',
							data: {
								flag: 0,
								data: {
									user_id: userInfo._id,
									ta_id: post.user_id,
									status: 0, // 0 未读 1 已读
									type: 0, // 0帖子被赞 1评论被赞 2帖子被收藏 3新增关注 4帖子被回复 5评论被回复
									type_id: post._id,
									createTime: Date.now(),
									updateTime: Date.now(),
								}
							}
						})
					}
				} catch (e) {
					console.log('重复插入');
				}
			} else {
				let delete_like_res = await uniCloud.callFunction({
					name: 'star-community-like',
					data: {
						flag: 2,
						data: {
							user_id: userInfo._id,
							enmu_id: post._id, // 点赞类型对应的id
						}
					}
				})
				console.log(delete_like_res.result);
				if (delete_like_res.result.deleted > 0) {
					uniCloud.callFunction({
						name: 'star-community-count',
						data: {
							flag: 1,
							data: {
								id: post._id,
								likeIncCount: -1
							}
						}
					})
					uniCloud.callFunction({
						name: 'star-community-count',
						data: {
							flag: 0,
							data: {
								id: post.user_id,
								likeIncCount: -1
							}
						}
					})
				}
			}
		},
		async clickDeletePost(post) {
			uni.showModal({
				title: '提示',
				content: '确定要删除该帖子吗？',
				success: async (res) => {
					if (res.confirm) {
						uni.showLoading({
							title: '删除中',
							mask: true
						})
						await uniCloud.callFunction({
							name: 'star-community-post',
							data: {
								flag: 2,
								data: {
									id: post._id,
									updateData: {
										status: 3, // 0 审核中 1 正常 2 审核不通过 3 已删除 4 已违规
									}
								}
							}
						})
						this.mescroll.resetUpScroll()
						uni.hideLoading()
						uni.showToast({
							title: '删除成功'
						})
					}
				}
			})
		},
		// 点击评论帖子
		clickCirclePost(post) {
			console.log('clickCirclePost');
			this.goto(
				`/uni_modules/star-community-pages/pages/circle-detail/circle-detail?_id=${post.circle_id}`
			)
		},
		// 点击评论帖子
		clickCommentPost(post) {
			console.log('clickCommentPost');
			// 建议跳转后自动下滑到评论区
			this.goto(
				`/uni_modules/star-community-pages/pages/post-detail/post-detail?_id=${post._id}&comment=yes`
			)
		},
		// 点击帖子用户头像
		clickUserAvatarPost(post) {
			console.log('clickPostUserAvatar');
			this.goto(`/uni_modules/star-community-pages/pages/homepage/homepage?_id=${post.user_id}`)
		},
		// 点击贴子用户昵称
		clickUserNicknamePost(post) {
			console.log('clickPostUserNickname');
			this.goto(`/uni_modules/star-community-pages/pages/homepage/homepage?_id=${post.user_id}`)
		},
		// 显示帖子更多操作菜单选项
		showMoreActionSheetPost(post) {
			let userInfo = store.userInfo
			let itemList = ['举报']

			console.log(userInfo);

			if (userInfo._id === post.user_id && [1, 5].includes(post.status)) {
				itemList = [...itemList, post.status === 5 ? '取消私密' : '私密']
			}

			if (this.uniIDHasRole('admin')) {
				itemList = [...itemList, post.top ? '取消置顶(管理员)' : '置顶(管理员)', '删除(管理员)']
			}

			uni.showActionSheet({
				itemList,
				success: async (res) => {
					console.log('选中了第' + (res.tapIndex + 1) + '个按钮');

					let selectItem = itemList[res.tapIndex]

					if (selectItem === '举报') {
						uni.showLoading({
							title: '举报中',
							mask: true
						})
						await uniCloud.callFunction({
							name: 'star-community-count',
							data: {
								flag: 1,
								data: {
									id: post._id,
									reportIncCount: 1
								}
							}
						})
						uni.hideLoading()
						uni.showToast({
							title: '举报成功'
						})
					} else if (['私密', '取消私密'].includes(selectItem)) {
						uni.showLoading({
							title: '更改中',
							mask: true
						})
						let status = post.status === 5 ? 1 : 5
						await uniCloud.callFunction({
							name: 'star-community-post',
							data: {
								flag: 2,
								data: {
									id: post._id,
									updateData: {
										status,
									}
								}
							}
						})
						if (this.post) {
							this.post.status = status
						}
						if (this.postList.length > 0) {
							let postIndex = this.postList.findIndex(item => item._id === post._id)
							if (postIndex > -1) {
								this.postList[postIndex].status = status
							}
						}
						uni.hideLoading()
						uni.showToast({
							title: status === 5 ? '私密成功' : '已取消私密',
							icon: 'none'
						})
					} else if (['置顶(管理员)', '取消置顶(管理员)'].includes(selectItem)) {
						uni.showLoading({
							title: '更改中',
							mask: true
						})
						let top = post.top > 0 ? 0 : Date.now()
						console.log(top);
						await uniCloud.callFunction({
							name: 'star-community-post',
							data: {
								flag: 2,
								data: {
									id: post._id,
									updateData: {
										top,
									}
								}
							}
						})
						if (this.post) {
							this.post.top = top
						}
						if (this.postList.length > 0) {
							let postIndex = this.postList.findIndex(item => item._id === post._id)
							if (postIndex > -1) {
								this.postList[postIndex].top = top
							}
						}
						uni.hideLoading()
						uni.showToast({
							title: top > 0 ? '置顶成功' : '已取消置顶',
							icon: 'none'
						})
					} else if (selectItem === '删除(管理员)') {
						uni.showModal({
							title: '删除提醒',
							content: '确定要删除该贴吗？（违规状态）',
							success: async (res) => {
								if (res.confirm) {
									uni.showLoading({
										title: '删除中',
										mask: true
									})
									await uniCloud.callFunction({
										name: 'star-community-post',
										data: {
											flag: 2,
											data: {
												id: post._id,
												updateData: {
													status: 4, // 0 审核中 1 正常 2 审核不通过 3 已删除 4 已违规
												}
											}
										}
									})
									if (this.post) {
										uni.navigateBack()
									}
									if (this.postList.length > 0) {
										let postIndex = this.postList.findIndex(item => item
											._id === post._id)
										if (postIndex > -1) {
											this.postList.splice(postIndex, 1)
										}
									}
									uni.hideLoading()
									uni.showToast({
										title: '删除成功'
									})
								}
							}
						})
					}
				},
				fail: (res) => {
					console.log(res.errMsg);
				}
			});
		},
		goto(url) {
			uni.navigateTo({
				url
			})
		},
	}
}

export default StarPostItemMixin
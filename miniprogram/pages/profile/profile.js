// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    // 用户信息
    userInfo: {},
    
    // 会员信息
    memberLevel: 'free', // free, standard, premium
    memberLevelText: '免费用户',
    memberExpireDate: '',
    
    // 今日数据统计
    todayStats: {
      weight: '--',
      calories: '--',
      exerciseTime: '--',
      planCount: '--'
    },
    
    // 未读消息数
    unreadCount: 0
  },

  onLoad(options) {
    this.initPage()
  },

  onShow() {
    this.loadUserInfo()
    this.loadMemberInfo()
    this.loadTodayStats()
    this.loadUnreadCount()
  },

  onPullDownRefresh() {
    this.loadUserInfo()
    this.loadMemberInfo()
    this.loadTodayStats()
    this.loadUnreadCount()
    wx.stopPullDownRefresh()
  },

  // 初始化页面
  initPage() {
    this.loadUserInfo()
    this.loadMemberInfo()
    this.loadTodayStats()
    this.loadUnreadCount()
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = app.globalData.userInfo || {}
    this.setData({
      userInfo: userInfo
    })
  },

  // 加载会员信息
  loadMemberInfo() {
    const memberLevel = app.globalData.memberLevel || 'free'
    let memberLevelText = '免费用户'
    let memberExpireDate = ''

    switch (memberLevel) {
      case 'standard':
        memberLevelText = '标准会员'
        memberExpireDate = '2025-12-31'
        break
      case 'premium':
        memberLevelText = '高级会员'
        memberExpireDate = '2025-12-31'
        break
      default:
        memberLevelText = '免费用户'
        memberExpireDate = ''
    }

    this.setData({
      memberLevel: memberLevel,
      memberLevelText: memberLevelText,
      memberExpireDate: memberExpireDate
    })
  },

  // 加载今日统计数据
  loadTodayStats() {
    const todayStats = app.globalData.todayStats || {}
    this.setData({
      todayStats: {
        weight: todayStats.weight || '--',
        calories: todayStats.calories || '--',
        exerciseTime: todayStats.exerciseTime || '--',
        planCount: todayStats.planCount || '--'
      }
    })
  },

  // 加载未读消息数
  loadUnreadCount() {
    // 这里应该从数据库获取未读消息数
    // 暂时使用示例数据
    this.setData({
      unreadCount: 3
    })
  },

  // 编辑个人资料
  editProfile() {
    wx.showActionSheet({
      itemList: ['修改昵称', '修改头像', '修改个人信息'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.editNickname()
            break
          case 1:
            this.editAvatar()
            break
          case 2:
            this.editUserInfo()
            break
        }
      }
    })
  },

  // 修改昵称
  editNickname() {
    wx.showModal({
      title: '修改昵称',
      content: '请输入新的昵称',
      editable: true,
      placeholderText: '请输入昵称',
      success: (res) => {
        if (res.confirm && res.content) {
          // 这里应该调用API更新用户昵称
          const userInfo = { ...this.data.userInfo, nickname: res.content }
          this.setData({
            userInfo: userInfo
          })
          app.globalData.userInfo = userInfo
          wx.showToast({
            title: '昵称修改成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 修改头像
  editAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        // 这里应该上传头像到服务器
        const userInfo = { ...this.data.userInfo, avatar: tempFilePath }
        this.setData({
          userInfo: userInfo
        })
        app.globalData.userInfo = userInfo
        wx.showToast({
          title: '头像修改成功',
          icon: 'success'
        })
      }
    })
  },

  // 修改个人信息
  editUserInfo() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  // 升级会员
  upgradeMember() {
    wx.navigateTo({
      url: '/pages/member/member'
    })
  },

  // 查看体重数据
  viewWeightData() {
    wx.navigateTo({
      url: '/pages/weight-record/weight-record'
    })
  },

  // 查看饮食数据
  viewDietData() {
    wx.navigateTo({
      url: '/pages/diet-record/diet-record'
    })
  },

  // 查看运动数据
  viewExerciseData() {
    wx.navigateTo({
      url: '/pages/exercise-record/exercise-record'
    })
  },

  // 查看计划数据
  viewPlanData() {
    wx.navigateTo({
      url: '/pages/plan-detail/plan-detail'
    })
  },

  // 体重记录
  goToWeightRecord() {
    wx.navigateTo({
      url: '/pages/weight-record/weight-record'
    })
  },

  // 饮食记录
  goToDietRecord() {
    wx.navigateTo({
      url: '/pages/diet-record/diet-record'
    })
  },

  // 运动记录
  goToExerciseRecord() {
    wx.navigateTo({
      url: '/pages/exercise-record/exercise-record'
    })
  },

  // 计划管理
  goToPlanManagement() {
    wx.navigateTo({
      url: '/pages/plan-detail/plan-detail'
    })
  },

  // 健康顾问列表
  goToAdvisorList() {
    wx.navigateTo({
      url: '/pages/advisor-list/advisor-list'
    })
  },

  // 聊天记录
  goToChatHistory() {
    wx.navigateTo({
      url: '/pages/chat/chat'
    })
  },

  // 计划审核
  goToPlanReview() {
    wx.navigateTo({
      url: '/pages/plan-review/plan-review'
    })
  },

  // 会员中心
  goToMemberCenter() {
    wx.navigateTo({
      url: '/pages/member/member'
    })
  },

  // 支付记录
  goToPaymentHistory() {
    wx.navigateTo({
      url: '/pages/payment/payment'
    })
  },

  // 设置
  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  // 消息通知
  goToNotification() {
    wx.navigateTo({
      url: '/pages/notification/notification'
    })
  },

  // 意见反馈
  goToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    })
  },

  // 关于我们
  goToAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户数据
          app.globalData.userInfo = {}
          app.globalData.memberLevel = 'free'
          app.globalData.todayStats = {}
          
          // 清除本地存储
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('memberLevel')
          wx.removeStorageSync('todayStats')
          
          // 跳转到登录页面或首页
          wx.reLaunch({
            url: '/pages/index/index'
          })
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  }
})

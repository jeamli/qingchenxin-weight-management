App({
  onLaunch() {
    wx.cloud && wx.cloud.init({ traceUser: true })

    const userInfo = wx.getStorageSync('userInfo') || {}
    const memberLevel = wx.getStorageSync('memberLevel') || 'free'
    const todayStats = wx.getStorageSync('todayStats') || {}

    this.globalData = {
      userInfo,
      memberLevel,
      todayStats,
      systemConfigs: {}
    }

    // 拉取系统配置（用于配额/费用等）
    wx.cloud.callFunction({ name: 'getSystemConfig' })
      .then(res => {
        if (res && res.result && res.result.systemConfigs) {
          this.globalData.systemConfigs = res.result.systemConfigs
        }
      })
      .catch(() => {})
  }
})
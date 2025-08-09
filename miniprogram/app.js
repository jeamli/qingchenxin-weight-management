App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({ traceUser: true })
    }
    this.globalData = {
      userInfo: wx.getStorageSync('userInfo') || {},
      memberLevel: wx.getStorageSync('memberLevel') || 'free',
      todayStats: {},
      systemConfigs: {},
      isAdvisor: wx.getStorageSync('isAdvisor') || false
    }
    wx.cloud.callFunction({ name: 'getSystemConfig' })
      .then(res => {
        if (res && res.result && res.result.systemConfigs) {
          this.globalData.systemConfigs = res.result.systemConfigs
        }
      })
      .catch(() => {})
  }
})
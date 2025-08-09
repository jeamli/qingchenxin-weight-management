App({
  onLaunch() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const memberLevel = wx.getStorageSync('memberLevel') || 'free'
    const todayStats = wx.getStorageSync('todayStats') || {}

    this.globalData = {
      userInfo,
      memberLevel,
      todayStats
    }
  }
})
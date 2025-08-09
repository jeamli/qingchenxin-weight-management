Page({
  data: {
    userInfo: {},
    todayStats: {
      weight: '--',
      calories: '--',
      exerciseTime: '--'
    },
    quickActions: [
      { text: 'AI对话', url: '/pages/ai/ai', icon: '/images/icon-ai.png' },
      { text: '记录体重', url: '/pages/data/data?tab=weight', icon: '/images/icon-weight.png' },
      { text: '记录饮食', url: '/pages/data/data?tab=diet', icon: '/images/icon-diet.png' },
      { text: '记录运动', url: '/pages/data/data?tab=exercise', icon: '/images/icon-exercise.png' }
    ]
  },
  onShow() {
    const app = getApp()
    this.setData({ userInfo: app.globalData.userInfo || {} })
    this.loadTodayStats()
  },
  loadTodayStats() {
    wx.cloud.callFunction({ name: 'getTodayStats' })
      .then(res => {
        const ts = (res && res.result && res.result.todayStats) || {}
        this.setData({
          todayStats: {
            weight: ts.weightRecorded ? '已记录' : '--',
            calories: ts.dietRecorded ? '已记录' : '--',
            exerciseTime: ts.exerciseRecorded ? '已记录' : '--'
          }
        })
      })
      .catch(() => {})
  },
  go(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({ url })
  }
})
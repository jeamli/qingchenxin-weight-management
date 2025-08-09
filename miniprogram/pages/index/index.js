Page({
  data: {
    userInfo: {},
    overview: [
      { label: '今日体重', value: '--' },
      { label: '饮食记录', value: '--' },
      { label: '运动记录', value: '--' }
    ],
    quick: [
      { text: 'AI对话', url: '/pages/ai/ai', icon: '/images/icon-ai.png' },
      { text: '记录体重', url: '/pages/data/data?tab=weight', icon: '/images/icon-weight.png' },
      { text: '记录饮食', url: '/pages/data/data?tab=diet', icon: '/images/icon-diet.png' },
      { text: '记录运动', url: '/pages/data/data?tab=exercise', icon: '/images/icon-exercise.png' }
    ]
  },
  onShow() {
    const app = getApp()
    this.setData({ userInfo: app.globalData.userInfo })
    wx.cloud.callFunction({ name: 'getTodayStats' }).then(res => {
      const ts = (res.result && res.result.todayStats) || {}
      const ov = [
        { label: '今日体重', value: ts.weightRecorded ? '已记录' : '--' },
        { label: '饮食记录', value: ts.dietRecorded ? '已记录' : '--' },
        { label: '运动记录', value: ts.exerciseRecorded ? '已记录' : '--' }
      ]
      this.setData({ overview: ov })
    }).catch(() => {})
  },
  nav(e){ wx.navigateTo({ url: e.currentTarget.dataset.url }) }
})
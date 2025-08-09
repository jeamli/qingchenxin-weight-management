Page({
  data: {
    memberLevel: 'free',
    benefits: ['基础体重记录', '基础AI对话']
  },
  onShow() {
    const app = getApp()
    const level = (app.globalData.memberLevel) || 'free'
    this.setData({ memberLevel: level })
  }
})
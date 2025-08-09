Page({
  data:{ userInfo:{}, memberLevel:'free' },
  onShow(){ const app=getApp(); this.setData({ userInfo:app.globalData.userInfo, memberLevel:app.globalData.memberLevel }) },
  goMember(){ wx.navigateTo({ url:'/pages/member/member' }) },
  goFeedback(){ wx.navigateTo({ url:'/pages/feedback/feedback' }) }
})
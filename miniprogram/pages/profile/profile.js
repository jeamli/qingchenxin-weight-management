Page({
  data:{ userInfo:{}, memberLevel:'free', isAdvisor:false },
  onShow(){ const app=getApp(); this.setData({ userInfo:app.globalData.userInfo, memberLevel:app.globalData.memberLevel, isAdvisor:app.globalData.isAdvisor }) },
  goMember(){ wx.navigateTo({ url:'/pages/member/member' }) },
  goFeedback(){ wx.navigateTo({ url:'/pages/feedback/feedback' }) },
  goAdvisor(){
    if(!this.data.isAdvisor){ wx.showToast({ title:'非健康顾问账号', icon:'none' }); return }
    wx.navigateTo({ url:'/pages/advisor/home/home' })
  }
})
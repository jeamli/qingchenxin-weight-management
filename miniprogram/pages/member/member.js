Page({
  data:{ memberLevel:'free', expires:'' },
  onShow(){ const app=getApp(); this.setData({ memberLevel:app.globalData.memberLevel }) }
})
Page({
  data:{ patients:[{ id:'u1', name:'李*明', weight:72, bmi:24.8, lastActive:'今天' }] },
  goReview(){ wx.navigateTo({ url:'/pages/advisor/review/review' }) },
  goChat(){ wx.navigateTo({ url:'/pages/advisor/chat/chat' }) }
})
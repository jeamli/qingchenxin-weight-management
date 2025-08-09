Page({
  getUser(){ wx.cloud.callFunction({ name:'getUserInfo' }).then(res=>{ wx.showToast({ title: res.result&&res.result.userInfo?'OK':'FAIL', icon:'none' }) }).catch(()=>wx.showToast({ title:'ERR', icon:'none' })) },
  goRegister(){ wx.navigateTo({ url:'/pages/register/register' }) },
  goPlan(){ wx.navigateTo({ url:'/pages/plan/plan' }) }
})
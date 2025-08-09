Page({
  data:{ plans:[], creating:false, name:'个性化方案' },
  onShow(){ this.load() },
  load(){ wx.cloud.callFunction({ name:'listAIPlans', data:{ limit:50 } }).then(res=>{ this.setData({ plans:(res.result&&res.result.list)||[] }) }).catch(()=>{}) },
  onName(e){ this.setData({ name:e.detail.value }) },
  create(){ if(!this.data.name.trim()) return; this.setData({ creating:true }); wx.cloud.callFunction({ name:'createAIPlan', data:{ plan_name:this.data.name } }).then(()=>{ wx.showToast({ title:'已创建', icon:'none' }); this.setData({ name:'个性化方案' }); this.load() }).finally(()=>this.setData({ creating:false })) },
  requestReview(e){ const id=e.currentTarget.dataset.id; wx.cloud.callFunction({ name:'requestPlanReview', data:{ plan_id:id } }).then(()=>{ wx.showToast({ title:'已提交审核', icon:'none' }); this.load() }).catch(()=>wx.showToast({ title:'失败', icon:'none' })) }
})
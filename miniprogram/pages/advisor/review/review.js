Page({
  data:{ items:[] },
  onShow(){ this.load() },
  load(){ wx.cloud.callFunction({ name:'listPendingReviews', data:{ limit:50 } }).then(res=>{ this.setData({ items:(res.result&&res.result.list)||[] }) }).catch(()=>{}) },
  act(e){ const { id, action } = e.currentTarget.dataset; wx.cloud.callFunction({ name:'actOnReview', data:{ review_id:id, action } }).then(()=>{ wx.showToast({ title:'已处理', icon:'none' }); this.load() }).catch(()=>wx.showToast({ title:'失败', icon:'none' })) }
})
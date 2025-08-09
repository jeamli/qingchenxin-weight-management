Page({
  data:{ messages:[], inputText:'' },
  onShow(){ this.load() },
  load(){ wx.cloud.callFunction({ name:'listChatMessages', data:{ limit:30 } }).then(res=>{ this.setData({ messages: (res.result&&res.result.list)||[] }) }).catch(()=>{}) },
  onInput(e){ this.setData({ inputText:e.detail.value }) },
  send(){ const t=this.data.inputText.trim(); if(!t) return; wx.cloud.callFunction({ name:'addChatMessage', data:{ content:t } }).then(()=>{ this.setData({ inputText:'' }); this.load() }).catch(()=>wx.showToast({ title:'失败', icon:'none' })) }
})
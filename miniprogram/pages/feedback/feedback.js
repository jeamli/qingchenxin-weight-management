Page({
  data:{ content:'' },
  onInput(e){ this.setData({ content:e.detail.value }) },
  submit(){ const c=this.data.content.trim(); if(!c){ wx.showToast({title:'请输入内容',icon:'none'}); return } wx.showToast({title:'已提交(占位)',icon:'success'}) }
})
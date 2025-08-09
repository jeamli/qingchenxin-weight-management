Page({
  data:{ messages:[{id:1,sender:'bot',content:'你好，我是AI营养助手'}], inputText:'' },
  onInput(e){ this.setData({ inputText:e.detail.value }) },
  send(){ const t=this.data.inputText.trim(); if(!t) return; const id=Date.now(); this.setData({ messages:[...this.data.messages,{id, sender:'me', content:t},{id:id+1, sender:'bot', content:'已收到：'+t}], inputText:'' }) }
})
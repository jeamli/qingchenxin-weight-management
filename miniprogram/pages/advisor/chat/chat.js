Page({
  data:{ messages:[{id:1,sender:'user',type:'text',content:'医生您好'}], inputText:'' },
  onInput(e){ this.setData({ inputText:e.detail.value }) },
  send(){ const t=this.data.inputText.trim(); if(!t) return; const m={id:Date.now(),sender:'advisor',type:'text',content:t}; this.setData({ messages:[...this.data.messages,m], inputText:'' }) }
})
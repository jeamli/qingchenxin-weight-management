Page({
  data:{
    messages:[
      { id:1, sender:'ai', type:'text', content:'你好，我是你的AI健康顾问。' }
    ],
    inputText:''
  },
  onInput(e){ this.setData({ inputText:e.detail.value }) },
  send(){
    const text = this.data.inputText.trim()
    if(!text) return
    const userMsg = { id:Date.now(), sender:'user', type:'text', content:text }
    this.setData({ messages:[...this.data.messages,userMsg], inputText:'' })
    setTimeout(()=>{
      const aiMsg = { id:Date.now()+1, sender:'ai', type:'text', content:'收到：'+text }
      this.setData({ messages:[...this.data.messages, aiMsg] })
    },600)
  }
})
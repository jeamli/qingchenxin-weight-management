Page({
  data:{
    user:{},
    form:{ nickname:'', gender:'', age:'', height:'', current_weight:'', target_weight:'' },
    advisors:[],
    selectedAdvisor:null,
    loading:false
  },
  onShow(){ this.loadUser() },
  loadUser(){ wx.cloud.callFunction({ name:'getUserInfo' }).then(res=>{
    const u = (res.result&&res.result.userInfo)||{}
    this.setData({ user:u, form:{ nickname:u.nickname||'', gender:u.gender||'', age:u.age||'', height:u.height||'', current_weight:u.current_weight||'', target_weight:u.target_weight||'' } })
  }).catch(()=>{}) },
  onInput(e){ const k=e.currentTarget.dataset.key; const v=e.detail.value; const f=this.data.form; f[k]=v; this.setData({ form:f }) },
  saveProfile(){
    const f=this.data.form
    const payload={}
    ;['nickname','gender','age','height','current_weight','target_weight'].forEach(k=>{ if(f[k]!=='' && f[k]!==null && f[k]!==undefined) payload[k]= (['age','height','current_weight','target_weight'].includes(k)? Number(f[k]) : f[k]) })
    this.setData({ loading:true })
    wx.cloud.callFunction({ name:'updateUserProfile', data: payload }).then(()=>{ wx.showToast({ title:'已保存', icon:'none' }); this.loadUser() }).finally(()=>this.setData({ loading:false }))
  },
  loadAdvisors(){ wx.cloud.callFunction({ name:'listAdvisors', data:{ limit:50 } }).then(res=>{ this.setData({ advisors:(res.result&&res.result.list)||[] }) }).catch(()=>{}) },
  pickAdvisor(e){ const advisor=e.currentTarget.dataset.advisor; this.setData({ selectedAdvisor:advisor }) },
  bindAdvisor(){ const a=this.data.selectedAdvisor; if(!a){ wx.showToast({ title:'请选择顾问', icon:'none' }); return } wx.cloud.callFunction({ name:'bindAdvisor', data:{ advisor_id: a._id } }).then(()=>{ wx.showToast({ title:'已绑定', icon:'none' }); this.loadUser() }).catch(()=>wx.showToast({ title:'失败', icon:'none' })) }
})
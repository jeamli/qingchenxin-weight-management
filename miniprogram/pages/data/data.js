Page({
  data:{
    tab:'weight',
    weightForm:{ weight:'' },
    dietForm:{ food_name:'', quantity:'', unit:'g', calories:'' },
    exerciseForm:{ exercise_type:'cardio', exercise_name:'', duration:'', intensity:'medium', calories_burned:'' },
    weightList:[], dietList:[], exerciseList:[]
  },
  onShow(){ this.loadAll() },
  setTab(e){ this.setData({ tab:e.currentTarget.dataset.tab }) },
  // load
  loadAll(){ this.loadWeight(); this.loadDiet(); this.loadExercise() },
  loadWeight(){ wx.cloud.callFunction({ name:'listWeightRecords', data:{ limit:20 } }).then(res=>{ this.setData({ weightList:(res.result&&res.result.list)||[] }) }).catch(()=>{}) },
  loadDiet(){ wx.cloud.callFunction({ name:'listDietRecords', data:{ limit:20 } }).then(res=>{ this.setData({ dietList:(res.result&&res.result.list)||[] }) }).catch(()=>{}) },
  loadExercise(){ wx.cloud.callFunction({ name:'listExerciseRecords', data:{ limit:20 } }).then(res=>{ this.setData({ exerciseList:(res.result&&res.result.list)||[] }) }).catch(()=>{}) },
  // binders
  onInput(e){ const { form, key } = e.currentTarget.dataset; const v = e.detail.value; const o = this.data[form]; o[key]=v; this.setData({ [form]:o }) },
  // submit
  submitWeight(){
    const w = Number(this.data.weightForm.weight)
    if(!(w>0)){ wx.showToast({ title:'请输入有效体重', icon:'none' }); return }
    wx.cloud.callFunction({ name:'addWeightRecord', data:{ weight:w } }).then(()=>{ wx.showToast({ title:'已记录', icon:'none' }); this.setData({ weightForm:{ weight:'' } }); this.loadWeight() }).catch(()=>wx.showToast({ title:'失败', icon:'none' }))
  },
  submitDiet(){
    const f = this.data.dietForm
    if(!f.food_name || !(Number(f.quantity)>0)){ wx.showToast({ title:'请完善饮食', icon:'none' }); return }
    const payload = { food_name:f.food_name, quantity:Number(f.quantity), unit:f.unit||'g' }
    if(f.calories!=='') payload.calories = Number(f.calories)
    wx.cloud.callFunction({ name:'addDietRecord', data: payload }).then(()=>{ wx.showToast({ title:'已记录', icon:'none' }); this.setData({ dietForm:{ food_name:'', quantity:'', unit:'g', calories:'' } }); this.loadDiet() }).catch(()=>wx.showToast({ title:'失败', icon:'none' }))
  },
  submitExercise(){
    const f = this.data.exerciseForm
    if(!f.exercise_name || !(Number(f.duration)>0)){ wx.showToast({ title:'请完善运动', icon:'none' }); return }
    const payload = { exercise_type:f.exercise_type, exercise_name:f.exercise_name, duration:Number(f.duration), intensity:f.intensity }
    if(f.calories_burned!=='') payload.calories_burned = Number(f.calories_burned)
    wx.cloud.callFunction({ name:'addExerciseRecord', data: payload }).then(()=>{ wx.showToast({ title:'已记录', icon:'none' }); this.setData({ exerciseForm:{ exercise_type:'cardio', exercise_name:'', duration:'', intensity:'medium', calories_burned:'' } }); this.loadExercise() }).catch(()=>wx.showToast({ title:'失败', icon:'none' }))
  }
})
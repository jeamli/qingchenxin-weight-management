Page({
  data:{
    overview:[
      { label:'今日体重', value:'--' },
      { label:'饮食记录', value:'--' },
      { label:'运动记录', value:'--' }
    ]
  },
  onShow(){
    wx.cloud.callFunction({ name:'getTodayStats' })
      .then(res=>{
        const ts=(res.result&&res.result.todayStats)||{}
        this.setData({
          overview:[
            { label:'今日体重', value: ts.weightRecorded?'已记录':'--' },
            { label:'饮食记录', value: ts.dietRecorded?'已记录':'--' },
            { label:'运动记录', value: ts.exerciseRecorded?'已记录':'--' }
          ]
        })
      })
      .catch(()=>{})
  },
  nav(e){ wx.navigateTo({ url:e.currentTarget.dataset.url }) }
})
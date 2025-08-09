Page({
  data:{
    tabs:[
      {key:'weight',text:'体重管理'},
      {key:'diet',text:'饮食管理'},
      {key:'exercise',text:'运动管理'},
      {key:'plan',text:'方案管理'}
    ],
    active:'weight'
  },
  onLoad(opts){ if(opts&&opts.tab){ this.setData({active:opts.tab}) } },
  switchTab(e){ this.setData({ active:e.currentTarget.dataset.key }) }
})
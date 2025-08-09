Page({
  data: {
    tabs: [
      { key: 'weight', text: '体重管理' },
      { key: 'diet', text: '饮食管理' },
      { key: 'exercise', text: '运动管理' },
      { key: 'plan', text: '方案管理' }
    ],
    active: 'weight'
  },
  onLoad(options) {
    if (options && options.tab) {
      this.setData({ active: options.tab })
    }
  },
  switchTab(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ active: key })
  }
})
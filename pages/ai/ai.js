// pages/ai/ai.js
const app = getApp()

Page({
  data: {
    // 用户信息
    userInfo: {},
    
    // 聊天相关
    messages: [],
    inputText: '',
    scrollToView: '',
    isTyping: false,
    isLoading: false,
    
    // 快捷功能
    showQuickActions: false,
    
    // 会员相关
    showMemberTip: false,
    memberLevel: 'free', // free, standard, premium
    dailyChatCount: 0,
    maxDailyChatCount: 10,
    
    // 示例消息数据
    sampleMessages: [
      {
        id: 1,
        sender_type: 'ai',
        message_type: 'text',
        content: '您好！我是您的专属AI健康顾问，很高兴为您服务。我可以为您提供个性化的减重建议、饮食营养指导、运动计划推荐和健康数据分析。请告诉我您的健康目标或遇到的问题。',
        created_at: new Date(Date.now() - 60000).toISOString()
      },
      {
        id: 2,
        sender_type: 'user',
        message_type: 'text',
        content: '我想减重，请给我一些建议',
        created_at: new Date(Date.now() - 30000).toISOString()
      },
      {
        id: 3,
        sender_type: 'ai',
        message_type: 'text',
        content: '好的！为了给您提供更精准的减重建议，我需要了解一些基本信息：\n\n1. 您当前的身高和体重是多少？\n2. 您的目标体重是多少？\n3. 您希望在多长时间内达到目标？\n4. 您目前的运动习惯如何？\n5. 您有什么特殊的饮食偏好或限制吗？\n\n请提供这些信息，我会为您制定个性化的减重方案。',
        created_at: new Date(Date.now() - 25000).toISOString()
      },
      {
        id: 4,
        sender_type: 'user',
        message_type: 'text',
        content: '我身高165cm，体重70kg，目标体重60kg，希望在3个月内达到目标。平时很少运动，饮食方面没有特殊限制。',
        created_at: new Date(Date.now() - 20000).toISOString()
      },
      {
        id: 5,
        sender_type: 'ai',
        message_type: 'text',
        content: '根据您的情况，我为您制定以下减重计划：\n\n📊 当前BMI：25.7（超重）\n🎯 目标BMI：22.0（正常）\n📅 减重周期：3个月\n\n💡 减重建议：\n1. 每日热量摄入控制在1500-1700卡路里\n2. 每周减重0.5-1kg（安全范围）\n3. 增加运动量，每周至少150分钟中等强度运动\n4. 调整饮食结构，增加蛋白质和膳食纤维\n\n🏃 运动建议：\n- 快走：每天30-45分钟\n- 游泳：每周2-3次\n- 力量训练：每周2次\n\n🍎 饮食建议：\n- 早餐：全麦面包+鸡蛋+牛奶\n- 午餐：糙米饭+瘦肉+蔬菜\n- 晚餐：轻食沙拉+少量主食\n\n需要我为您生成详细的饮食和运动计划吗？',
        created_at: new Date(Date.now() - 15000).toISOString()
      }
    ]
  },

  onLoad(options) {
    this.initPage()
  },

  onShow() {
    this.loadUserInfo()
    this.checkMemberStatus()
  },

  onPullDownRefresh() {
    this.loadMessages()
    wx.stopPullDownRefresh()
  },

  // 初始化页面
  initPage() {
    this.loadUserInfo()
    this.loadMessages()
    this.checkMemberStatus()
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = app.globalData.userInfo || {}
    this.setData({
      userInfo: userInfo
    })
  },

  // 加载聊天记录
  loadMessages() {
    // 这里应该从数据库加载聊天记录
    // 暂时使用示例数据
    this.setData({
      messages: this.data.sampleMessages
    })
    this.scrollToBottom()
  },

  // 检查会员状态
  checkMemberStatus() {
    const memberLevel = app.globalData.memberLevel || 'free'
    const dailyChatCount = app.globalData.dailyChatCount || 0
    const maxDailyChatCount = memberLevel === 'free' ? 10 : (memberLevel === 'standard' ? 50 : 999)
    
    this.setData({
      memberLevel: memberLevel,
      dailyChatCount: dailyChatCount,
      maxDailyChatCount: maxDailyChatCount,
      showMemberTip: memberLevel === 'free' && dailyChatCount >= maxDailyChatCount
    })
  },

  // 输入框变化
  onInputChange(e) {
    this.setData({
      inputText: e.detail.value
    })
  },

  // 发送消息
  sendMessage() {
    const text = this.data.inputText.trim()
    if (!text) return

    // 检查聊天次数限制
    if (this.data.memberLevel === 'free' && this.data.dailyChatCount >= this.data.maxDailyChatCount) {
      this.setData({
        showMemberTip: true
      })
      return
    }

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      sender_type: 'user',
      message_type: 'text',
      content: text,
      created_at: new Date().toISOString()
    }

    this.setData({
      messages: [...this.data.messages, userMessage],
      inputText: '',
      dailyChatCount: this.data.dailyChatCount + 1
    })

    this.scrollToBottom()
    this.simulateAIResponse(text)
  },

  // 发送快捷消息
  sendQuickMessage(e) {
    const text = e.currentTarget.dataset.text
    this.setData({
      inputText: text
    })
    this.sendMessage()
  },

  // 模拟AI回复
  simulateAIResponse(userMessage) {
    this.setData({
      isTyping: true
    })

    // 模拟AI思考时间
    setTimeout(() => {
      const aiResponse = this.generateAIResponse(userMessage)
      
      this.setData({
        messages: [...this.data.messages, aiResponse],
        isTyping: false
      })

      this.scrollToBottom()
    }, 1500 + Math.random() * 1000)
  },

  // 生成AI回复
  generateAIResponse(userMessage) {
    const responses = {
      '减重建议': '根据您的需求，我建议您：\n\n1. 控制每日热量摄入\n2. 增加有氧运动\n3. 调整饮食结构\n4. 保持规律作息\n\n需要我为您制定详细的减重计划吗？',
      '饮食分析': '让我为您分析一下饮食情况：\n\n📊 营养均衡度：良好\n🍎 蛋白质摄入：充足\n🥬 膳食纤维：需要增加\n💧 水分摄入：建议增加\n\n建议：\n- 增加蔬菜水果摄入\n- 减少精制碳水化合物\n- 适量增加蛋白质',
      '运动推荐': '为您推荐以下运动：\n\n🏃 有氧运动：\n- 快走：30-45分钟/天\n- 游泳：2-3次/周\n- 骑自行车：30分钟/天\n\n💪 力量训练：\n- 深蹲：3组×15次\n- 俯卧撑：3组×10次\n- 平板支撑：3组×30秒\n\n建议循序渐进，逐步增加强度。',
      '制定计划': '为您制定个性化计划：\n\n📅 第一阶段（1-4周）：\n- 适应期，建立运动习惯\n- 调整饮食结构\n- 目标：减重2-3kg\n\n📅 第二阶段（5-8周）：\n- 增加运动强度\n- 优化饮食方案\n- 目标：减重3-4kg\n\n📅 第三阶段（9-12周）：\n- 巩固成果\n- 建立长期习惯\n- 目标：达到理想体重'
    }

    let response = '感谢您的咨询！我会根据您的具体情况为您提供个性化的健康建议。'
    
    // 根据用户消息内容选择合适的回复
    if (userMessage.includes('减重') || userMessage.includes('减肥')) {
      response = responses['减重建议']
    } else if (userMessage.includes('饮食') || userMessage.includes('营养')) {
      response = responses['饮食分析']
    } else if (userMessage.includes('运动') || userMessage.includes('锻炼')) {
      response = responses['运动推荐']
    } else if (userMessage.includes('计划') || userMessage.includes('制定')) {
      response = responses['制定计划']
    }

    return {
      id: Date.now() + 1,
      sender_type: 'ai',
      message_type: 'text',
      content: response,
      created_at: new Date().toISOString()
    }
  },

  // 滚动到底部
  scrollToBottom() {
    setTimeout(() => {
      this.setData({
        scrollToView: `msg-${this.data.messages.length}`
      })
    }, 100)
  },

  // 切换快捷功能
  toggleQuickActions() {
    this.setData({
      showQuickActions: !this.data.showQuickActions
    })
  },

  // 拍照
  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        this.uploadImage(res.tempFiles[0].tempFilePath)
      }
    })
  },

  // 选择图片
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        this.uploadImage(res.tempFiles[0].tempFilePath)
      }
    })
  },

  // 上传图片
  uploadImage(filePath) {
    wx.showLoading({
      title: '上传中...'
    })

    // 模拟上传
    setTimeout(() => {
      wx.hideLoading()
      
      const imageMessage = {
        id: Date.now(),
        sender_type: 'user',
        message_type: 'image',
        image_url: filePath,
        created_at: new Date().toISOString()
      }

      this.setData({
        messages: [...this.data.messages, imageMessage]
      })

      this.scrollToBottom()
      
      // 模拟AI分析图片
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          sender_type: 'ai',
          message_type: 'text',
          content: '我看到您上传了一张图片。这是一份健康的午餐，包含了蛋白质、碳水化合物和蔬菜。建议：\n\n✅ 营养搭配合理\n✅ 份量适中\n⚠️ 可以适当增加蔬菜\n\n继续保持这样的饮食习惯！',
          created_at: new Date().toISOString()
        }

        this.setData({
          messages: [...this.data.messages, aiResponse]
        })

        this.scrollToBottom()
      }, 2000)
    }, 1000)
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      urls: [url],
      current: url
    })
  },

  // 升级会员
  upgradeMember() {
    wx.navigateTo({
      url: '/pages/member/member'
    })
  },

  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) { // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) { // 24小时内
      return `${Math.floor(diff / 3600000)}小时前`
    } else {
      return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    }
  }
})

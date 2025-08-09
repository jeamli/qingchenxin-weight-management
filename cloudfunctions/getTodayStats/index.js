// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'qingchegnxin-6gd5zp339c7d1586'
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // 查询今日体重记录
    const weightResult = await db.collection('weight_records').where({
      openid: openid,
      createTime: db.command.gte(startOfDay).and(db.command.lt(endOfDay))
    }).count()

    // 查询今日饮食记录
    const dietResult = await db.collection('diet_records').where({
      openid: openid,
      createTime: db.command.gte(startOfDay).and(db.command.lt(endOfDay))
    }).count()

    // 查询今日运动记录
    const exerciseResult = await db.collection('exercise_records').where({
      openid: openid,
      createTime: db.command.gte(startOfDay).and(db.command.lt(endOfDay))
    }).count()

    // 查询今日AI对话次数
    const aiChatResult = await db.collection('ai_chat_records').where({
      openid: openid,
      createTime: db.command.gte(startOfDay).and(db.command.lt(endOfDay))
    }).count()

    const todayStats = {
      weightRecorded: weightResult.total > 0,
      dietRecorded: dietResult.total > 0,
      exerciseRecorded: exerciseResult.total > 0,
      aiChatCount: aiChatResult.total
    }

    return {
      success: true,
      todayStats: todayStats
    }
  } catch (error) {
    console.error('获取今日统计失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

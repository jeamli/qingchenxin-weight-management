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

    // 先查用户，拿 user_id（与各记录集合保持 user_id 维度、created_at 时间字段一致）
    const userRes = await db.collection('users').where({ openid }).limit(1).get()
    const user = userRes.data && userRes.data[0]
    const userId = user ? (user._id || user.id) : null

    const timeCondition = db.command.gte(startOfDay).and(db.command.lt(endOfDay))

    // 查询今日体重记录
    const weightResult = await db.collection('weight_records').where({
      user_id: userId,
      created_at: timeCondition
    }).count()

    // 查询今日饮食记录
    const dietResult = await db.collection('diet_records').where({
      user_id: userId,
      created_at: timeCondition
    }).count()

    // 查询今日运动记录
    const exerciseResult = await db.collection('exercise_records').where({
      user_id: userId,
      created_at: timeCondition
    }).count()

    // 查询今日AI对话次数（若后续实现）
    let aiChatCount = 0
    try {
      const chatRes = await db.collection('ai_chat_records').where({
        user_id: userId,
        created_at: timeCondition
      }).count()
      aiChatCount = chatRes.total
    } catch (e) {
      aiChatCount = 0
    }

    const todayStats = {
      weightRecorded: weightResult.total > 0,
      dietRecorded: dietResult.total > 0,
      exerciseRecorded: exerciseResult.total > 0,
      aiChatCount
    }

    return {
      success: true,
      todayStats
    }
  } catch (error) {
    console.error('获取今日统计失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

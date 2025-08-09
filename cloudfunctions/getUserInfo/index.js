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
    // 查询用户信息
    const userResult = await db.collection('users').where({
      openid: openid
    }).get()

    let userInfo = null
    let advisorInfo = null
    let memberLevel = 'free'
    let memberExpire = null

    if (userResult.data.length > 0) {
      userInfo = userResult.data[0]
      // 统一蛇形字段，向前兼容旧字段
      memberLevel = userInfo.member_level || userInfo.memberLevel || 'free'
      memberExpire = userInfo.member_expire || userInfo.memberExpire || null
      
      // 如果有顾问信息，查询顾问详情
      const advisorId = userInfo.advisor_id || userInfo.advisorId
      if (advisorId) {
        const advisorResult = await db.collection('advisors').doc(advisorId).get()
        if (advisorResult.data) {
          advisorInfo = advisorResult.data
        }
      }
    } else {
      // 如果用户不存在，创建新用户（蛇形命名）
      const now = new Date()
      const newUser = {
        openid,
        member_level: 'free',
        member_expire: null,
        created_at: now,
        updated_at: now,
        profile: {
          nickname: '',
          avatar: '',
          gender: '',
          age: null,
          height: null,
          weight: null,
          target_weight: null
        }
      }
      
      const addResult = await db.collection('users').add({
        data: newUser
      })
      
      userInfo = {
        _id: addResult._id,
        ...newUser
      }
    }

    return {
      success: true,
      userInfo,
      advisorInfo,
      memberLevel,
      memberExpire
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

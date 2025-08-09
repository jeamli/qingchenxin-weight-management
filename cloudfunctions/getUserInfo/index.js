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
      memberLevel = userInfo.memberLevel || 'free'
      memberExpire = userInfo.memberExpire || null
      
      // 如果有顾问信息，查询顾问详情
      if (userInfo.advisorId) {
        const advisorResult = await db.collection('advisors').doc(userInfo.advisorId).get()
        if (advisorResult.data) {
          advisorInfo = advisorResult.data
        }
      }
    } else {
      // 如果用户不存在，创建新用户
      const newUser = {
        openid: openid,
        createTime: new Date(),
        updateTime: new Date(),
        memberLevel: 'free',
        memberExpire: null,
        profile: {
          nickname: '',
          avatar: '',
          gender: '',
          age: null,
          height: null,
          weight: null,
          targetWeight: null
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
      userInfo: userInfo,
      advisorInfo: advisorInfo,
      memberLevel: memberLevel,
      memberExpire: memberExpire
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

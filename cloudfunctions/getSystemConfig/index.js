// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'qingchegnxin-6gd5zp339c7d1586'
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 查询系统配置
    const configResult = await db.collection('system_config').limit(1).get()
    
    let systemConfig = {
      aiDailyLimit: 5,
      reviewTimeoutHours: 24,
      maxWeightRecordsPerDay: 10,
      maxDietRecordsPerDay: 20,
      maxExerciseRecordsPerDay: 10,
      membershipUpgradeFee: 9900,
      reviewFee: 5000,
      advisorCommissionRate: 0.7
    }

    if (configResult.data.length > 0) {
      systemConfig = { ...systemConfig, ...configResult.data[0] }
    } else {
      // 如果配置不存在，创建默认配置
      await db.collection('system_config').add({
        data: {
          ...systemConfig,
          createTime: new Date(),
          updateTime: new Date()
        }
      })
    }

    return {
      success: true,
      systemConfig: systemConfig
    }
  } catch (error) {
    console.error('获取系统配置失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

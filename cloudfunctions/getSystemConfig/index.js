// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'qingchegnxin-6gd5zp339c7d1586'
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 统一集合名：system_configs（复数）
    const configs = await db.collection('system_configs').get()

    // 默认配置（蛇形键名，便于与DB一致）
    const defaultMap = {
      ai_daily_limit_free: 5,
      ai_daily_limit_standard: 20,
      ai_daily_limit_premium: -1,
      review_timeout_hours: 24,
      max_weight_records_per_day: 10,
      max_diet_records_per_day: 20,
      max_exercise_records_per_day: 10,
      membership_upgrade_fee: 9900,
      review_fee: 5000,
      advisor_commission_rate: 0.7
    }

    // 将 DB 配置聚合为 map（key -> value）
    const dbMap = {}
    configs.data.forEach(c => {
      if (c && c.config_key != null) {
        dbMap[c.config_key] = c.config_value
      }
    })

    const merged = { ...defaultMap, ...dbMap }

    return {
      success: true,
      systemConfigs: merged
    }
  } catch (error) {
    console.error('获取系统配置失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

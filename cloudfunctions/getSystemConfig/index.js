const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async () => {
  try {
    const configs = await db.collection('system_configs').get()
    const defaults = {
      ai_daily_limit_free: 5,
      ai_daily_limit_standard: 20,
      ai_daily_limit_premium: -1
    }
    const map = { ...defaults }
    configs.data.forEach(c => { if (c && c.config_key != null) map[c.config_key] = c.config_value })
    return { success: true, systemConfigs: map }
  } catch (e) {
    console.error(e)
    return { success: false, error: e.message }
  }
}
const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async () => {
  const now = new Date()
  // ensure system_configs defaults
  const defaults = [
    { key:'ai_daily_limit_free', val:5, type:'number', cat:'ai' },
    { key:'ai_daily_limit_standard', val:20, type:'number', cat:'ai' },
    { key:'ai_daily_limit_premium', val:-1, type:'number', cat:'ai' }
  ]
  for (const c of defaults) {
    const exists = await db.collection('system_configs').where({ config_key: c.key }).count()
    if (exists.total === 0) {
      await db.collection('system_configs').add({ data: { config_key:c.key, config_value:c.val, config_type:c.type, category:c.cat, is_active:true, created_at:now, updated_at:now } })
    }
  }
  // seed example user for dev
  const { OPENID } = cloud.getWXContext()
  const u = await db.collection('users').where({ openid: OPENID }).count()
  if (u.total === 0) {
    await db.collection('users').add({ data: { openid: OPENID, member_level:'free', member_expire:null, created_at:now, updated_at:now } })
  }
  return { success:true }
}
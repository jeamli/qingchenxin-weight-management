const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { limit = 20 } = event || {}
  try {
    const u = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!u.data.length) return { success: true, list: [] }
    const user = u.data[0]
    const res = await db.collection('ai_plans').where({ user_id: String(user._id || user.id) }).orderBy('created_at','desc').limit(Math.min(limit,100)).get()
    return { success: true, list: res.data || [] }
  } catch (e) {
    console.error(e)
    return { success: false, error: e.message }
  }
}
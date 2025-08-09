const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { limit = 30 } = event || {}
  try {
    const u = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!u.data.length) return { success:true, list:[] }
    const user = u.data[0]
    const res = await db.collection('chat_messages').where({ user_id: String(user._id) }).orderBy('created_at','desc').limit(Math.min(limit,100)).get()
    const list = (res.data||[]).reverse()
    return { success:true, list }
  } catch (e) {
    console.error(e)
    return { success:false, error:e.message }
  }
}
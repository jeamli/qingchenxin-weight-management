const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { advisor_id } = event || {}
  if (!advisor_id) return { success: false, error: 'MISSING_ADVISOR_ID' }
  try {
    const u = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!u.data.length) return { success: false, error: 'USER_NOT_FOUND' }
    const user = u.data[0]
    await db.collection('users').doc(user._id).update({ data: { advisor_id: String(advisor_id), updated_at: new Date() } })
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false, error: e.message }
  }
}
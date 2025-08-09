const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  try {
    const res = await db.collection('users').where({ openid: OPENID }).get()
    let userInfo
    if (res.data.length > 0) {
      userInfo = res.data[0]
    } else {
      const now = new Date()
      const doc = { openid: OPENID, member_level: 'free', member_expire: null, created_at: now, updated_at: now }
      const add = await db.collection('users').add({ data: doc })
      userInfo = { _id: add._id, ...doc }
    }
    return { success: true, userInfo }
  } catch (e) {
    console.error(e)
    return { success: false, error: e.message }
  }
}
const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { limit = 20 } = event || {}
  try {
    // resolve advisor by OPENID -> find advisors with mapped account (simple: advisors.phone==user.phone is out-of-scope). Here assume advisor OPENID stored in advisors.openid (optional demo)
    const adv = await db.collection('advisors').where({ openid: OPENID }).limit(1).get()
    if (!adv.data.length) return { success: true, list: [] }
    const advisor = adv.data[0]
    const res = await db.collection('review_records').where({ advisor_id: String(advisor._id), review_status:'pending' }).orderBy('created_at','desc').limit(Math.min(limit,100)).get()
    return { success: true, list: res.data || [] }
  } catch (e) {
    console.error(e)
    return { success: false, error: e.message }
  }
}
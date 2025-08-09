const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { plan_id } = event || {}
  if (!plan_id) return { success: false, error: 'MISSING_PLAN_ID' }
  try {
    const u = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!u.data.length) return { success: false, error: 'USER_NOT_FOUND' }
    const user = u.data[0]
    const plan = await db.collection('ai_plans').doc(String(plan_id)).get()
    if (!plan.data || plan.data.user_id !== String(user._id)) return { success: false, error: 'PLAN_NOT_FOUND_OR_FORBIDDEN' }
    const now = new Date()
    await db.collection('ai_plans').doc(String(plan_id)).update({ data: { status:'pending', updated_at: now } })
    await db.collection('review_records').add({ data: {
      plan_id: String(plan_id), user_id: String(user._id), advisor_id: plan.data.advisor_id || (user.advisor_id||null),
      review_type: 'plan_review', review_status: 'pending', review_comment: null, modification_suggestions: null, review_fee: 500,
      fee_status: 'pending', review_time: null, created_at: now, reviewed_at: null, updated_at: now
    } })
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false, error: e.message }
  }
}
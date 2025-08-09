const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { plan_name = '个性化方案', plan_type = 'standard', target_weight = null, duration = null, daily_calories = null } = event || {}
  try {
    const u = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!u.data.length) return { success: false, error: 'USER_NOT_FOUND' }
    const user = u.data[0]
    const now = new Date()
    const doc = {
      user_id: String(user._id || user.id),
      advisor_id: user.advisor_id || null,
      plan_name,
      plan_type,
      target_weight,
      duration,
      expected_loss: null,
      daily_calories,
      diet_plan: null,
      exercise_plan: null,
      lifestyle_plan: null,
      status: 'draft',
      review_comment: null,
      review_fee: 0,
      reviewed_at: null,
      reviewed_by: null,
      execution_status: 'not_started',
      start_date: null,
      end_date: null,
      created_at: now,
      updated_at: now
    }
    const add = await db.collection('ai_plans').add({ data: doc })
    return { success: true, _id: add._id }
  } catch (e) {
    console.error(e)
    return { success: false, error: e.message }
  }
}
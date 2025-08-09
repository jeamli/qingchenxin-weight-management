const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { review_id, action, comment } = event || {}
  if (!review_id || !action) return { success:false, error:'MISSING_PARAM' }
  try {
    const adv = await db.collection('advisors').where({ openid: OPENID }).limit(1).get()
    if (!adv.data.length) return { success:false, error:'NOT_ADVISOR' }
    const advisor = adv.data[0]
    const rr = await db.collection('review_records').doc(String(review_id)).get()
    if (!rr.data || rr.data.advisor_id !== String(advisor._id)) return { success:false, error:'FORBIDDEN' }
    const now = new Date()
    let newStatus = rr.data.review_status
    if (action === 'approve') newStatus = 'approved'
    else if (action === 'reject') newStatus = 'rejected'
    else if (action === 'modify') newStatus = 'modified'
    else return { success:false, error:'INVALID_ACTION' }
    await db.collection('review_records').doc(String(review_id)).update({ data: { review_status:newStatus, review_comment: comment||null, reviewed_at: now, updated_at: now, fee_status: 'paid' } })
    // reflect to plan
    await db.collection('ai_plans').doc(rr.data.plan_id).update({ data: { status: newStatus, reviewed_at: now, reviewed_by: String(advisor._id), updated_at: now } })
    return { success:true }
  } catch (e) {
    console.error(e)
    return { success:false, error:e.message }
  }
}
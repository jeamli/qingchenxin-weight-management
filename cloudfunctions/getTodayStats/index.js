const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  try {
    const u = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    const user = u.data[0]
    const userId = user ? (user._id || user.id) : null
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    const _ = db.command
    const cond = _.gte(start).and(_.lt(end))

    const [w, d, e] = await Promise.all([
      db.collection('weight_records').where({ user_id: userId, created_at: cond }).count(),
      db.collection('diet_records').where({ user_id: userId, created_at: cond }).count(),
      db.collection('exercise_records').where({ user_id: userId, created_at: cond }).count()
    ])

    return {
      success: true,
      todayStats: {
        weightRecorded: w.total > 0,
        dietRecorded: d.total > 0,
        exerciseRecorded: e.total > 0
      }
    }
  } catch (err) {
    console.error(err)
    return { success: false, error: err.message }
  }
}
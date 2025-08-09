const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  try {
    const { exercise_type, exercise_name, duration, intensity, calories_burned, note, photo_url } = event || {}
    if (!exercise_type || !exercise_name || !(duration > 0)) return { success: false, error: 'INVALID_PARAM' }
    const u = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!u.data.length) return { success: false, error: 'USER_NOT_FOUND' }
    const user = u.data[0]
    const userId = user._id || user.id
    const now = new Date()
    const doc = {
      user_id: String(userId),
      exercise_type,
      exercise_name,
      duration: Number(duration),
      intensity: intensity || 'medium',
      calories_burned: calories_burned != null ? Number(calories_burned) : null,
      distance: null,
      steps: null,
      heart_rate_avg: null,
      heart_rate_max: null,
      heart_rate_min: null,
      photo_url: photo_url || '',
      record_date: now,
      record_time: now,
      record_type: 'manual',
      device_info: null,
      location: null,
      note: note || '',
      created_at: now,
      updated_at: now
    }
    const addRes = await db.collection('exercise_records').add({ data: doc })
    return { success: true, _id: addRes._id }
  } catch (e) {
    console.error(e)
    return { success: false, error: e.message }
  }
}
const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  try {
    const { weight, note, photo_url } = event || {}
    if (typeof weight !== 'number' || !(weight > 0)) {
      return { success: false, error: 'INVALID_WEIGHT' }
    }
    const u = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!u.data.length) return { success: false, error: 'USER_NOT_FOUND' }
    const user = u.data[0]
    const userId = user._id || user.id

    let bmi = null
    if (user.height && weight) {
      const h = Number(user.height) / 100
      if (h > 0) bmi = Number((weight / (h * h)).toFixed(1))
    }
    const now = new Date()
    const doc = {
      user_id: String(userId),
      weight,
      bmi,
      record_date: now,
      record_time: now,
      record_type: 'manual',
      photo_url: photo_url || '',
      note: note || '',
      created_at: now,
      updated_at: now
    }
    const addRes = await db.collection('weight_records').add({ data: doc })
    return { success: true, _id: addRes._id }
  } catch (e) {
    console.error(e)
    return { success: false, error: e.message }
  }
}
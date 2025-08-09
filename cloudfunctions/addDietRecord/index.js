const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  try {
    const { food_name, quantity, unit, calories, protein, fat, carbs, meal_type, note, photo_url } = event || {}
    if (!food_name || !(quantity > 0)) return { success: false, error: 'INVALID_PARAM' }
    const u = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!u.data.length) return { success: false, error: 'USER_NOT_FOUND' }
    const user = u.data[0]
    const userId = user._id || user.id
    const now = new Date()
    const doc = {
      user_id: String(userId),
      food_name,
      food_category: null,
      quantity: Number(quantity),
      unit: unit || 'g',
      calories: calories != null ? Number(calories) : null,
      protein: protein != null ? Number(protein) : null,
      fat: fat != null ? Number(fat) : null,
      carbs: carbs != null ? Number(carbs) : null,
      fiber: null,
      sugar: null,
      sodium: null,
      photo_url: photo_url || '',
      meal_type: meal_type || 'breakfast',
      record_date: now,
      record_time: now,
      record_type: 'manual',
      ai_confidence: null,
      note: note || '',
      created_at: now,
      updated_at: now
    }
    const addRes = await db.collection('diet_records').add({ data: doc })
    return { success: true, _id: addRes._id }
  } catch (e) {
    console.error(e)
    return { success: false, error: e.message }
  }
}
const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  try {
    const fields = event || {}
    const now = new Date()
    const res = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!res.data.length) return { success: false, error: 'USER_NOT_FOUND' }
    const user = res.data[0]
    const patch = {}
    const allow = ['nickname','gender','age','height','current_weight','target_weight']
    allow.forEach(k=>{ if (fields[k] !== undefined) patch[k] = fields[k] })
    if (patch.height || patch.current_weight) {
      const height = Number(patch.height ?? user.height)
      const weight = Number(patch.current_weight ?? user.current_weight)
      if (height>0 && weight>0) patch.bmi = Number((weight / Math.pow(height/100,2)).toFixed(1))
    }
    patch.updated_at = now
    await db.collection('users').doc(user._id).update({ data: patch })
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false, error: e.message }
  }
}
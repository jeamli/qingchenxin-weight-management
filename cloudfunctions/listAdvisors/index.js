const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async (event) => {
  const { keyword = '', limit = 20 } = event || {}
  try {
    let coll = db.collection('advisors')
    // simple keyword filter on name
    if (keyword) {
      coll = coll.where({ name: db.RegExp({ regexp: keyword, options: 'i' }) })
    }
    const res = await coll.orderBy('created_at','desc').limit(Math.min(limit,100)).get()
    return { success: true, list: res.data || [] }
  } catch (e) {
    console.error(e)
    return { success: false, error: e.message }
  }
}
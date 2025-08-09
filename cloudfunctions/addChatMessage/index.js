const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { content } = event || {}
  if (!content) return { success:false, error:'EMPTY_CONTENT' }
  try {
    const u = await db.collection('users').where({ openid: OPENID }).limit(1).get()
    if (!u.data.length) return { success:false, error:'USER_NOT_FOUND' }
    const user = u.data[0]
    const now = new Date()
    // user message
    await db.collection('chat_messages').add({ data: { user_id:String(user._id), advisor_id: user.advisor_id||null, sender_type:'user', message_type:'text', content, image_url:null, file_url:null, file_name:null, file_size:null, is_read:false, read_at:null, is_deleted:false, deleted_at:null, created_at:now, updated_at:now } })
    // bot echo
    const reply = 'AI建议：保持规律记录，今日加油！\n你说：' + content
    await db.collection('chat_messages').add({ data: { user_id:String(user._id), advisor_id: user.advisor_id||null, sender_type:'system', message_type:'text', content: reply, image_url:null, file_url:null, file_name:null, file_size:null, is_read:false, read_at:null, is_deleted:false, deleted_at:null, created_at:now, updated_at:now } })
    return { success:true }
  } catch (e) {
    console.error(e)
    return { success:false, error:e.message }
  }
}
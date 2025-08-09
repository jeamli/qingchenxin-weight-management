// 初始化 NoSQL 集合与配置（CloudBase）
// 运行环境：云函数 Node.js（需引入 wx-server-sdk）或本地脚本改造

const cloud = require('wx-server-sdk')

cloud.init({
  env: process.env.TCB_ENV || process.env.SCF_NAMESPACE
})

const db = cloud.database()
const _ = db.command

async function ensureCollectionSeed(collection, sampleDoc) {
  try {
    await db.collection(collection).limit(1).get()
  } catch (e) {
    // 集合不存在时首次写入
    await db.collection(collection).add({ data: sampleDoc })
  }
}

async function createIndexes() {
  // users
  await db.collection('users').createIndex({ openid: 1 }, { unique: true })
  await db.collection('users').createIndex({ advisor_id: 1 })
  await db.collection('users').createIndex({ member_level: 1 })
  await db.collection('users').createIndex({ status: 1 })
  await db.collection('users').createIndex({ created_at: -1 })

  // weight_records
  await db.collection('weight_records').createIndex({ user_id: 1, record_date: -1 })
  await db.collection('weight_records').createIndex({ user_id: 1, created_at: -1 })
  await db.collection('weight_records').createIndex({ record_type: 1 })

  // diet_records
  await db.collection('diet_records').createIndex({ user_id: 1, record_date: -1 })
  await db.collection('diet_records').createIndex({ user_id: 1, meal_type: 1, record_date: -1 })
  await db.collection('diet_records').createIndex({ meal_type: 1 })
  await db.collection('diet_records').createIndex({ record_type: 1 })

  // exercise_records
  await db.collection('exercise_records').createIndex({ user_id: 1, record_date: -1 })
  await db.collection('exercise_records').createIndex({ user_id: 1, exercise_type: 1 })
  await db.collection('exercise_records').createIndex({ exercise_type: 1 })
  await db.collection('exercise_records').createIndex({ intensity: 1 })
  await db.collection('exercise_records').createIndex({ record_type: 1 })

  // ai_plans
  await db.collection('ai_plans').createIndex({ user_id: 1, status: 1 })
  await db.collection('ai_plans').createIndex({ advisor_id: 1, status: 1 })
  await db.collection('ai_plans').createIndex({ plan_type: 1 })
  await db.collection('ai_plans').createIndex({ status: 1 })
  await db.collection('ai_plans').createIndex({ execution_status: 1 })
  await db.collection('ai_plans').createIndex({ created_at: -1 })

  // system_configs
  await db.collection('system_configs').createIndex({ config_key: 1 }, { unique: true })
  await db.collection('system_configs').createIndex({ category: 1 })
  await db.collection('system_configs').createIndex({ is_active: 1 })

  // P1: advisors, chat_messages, review_records, payment_records, notifications
  await db.collection('advisors').createIndex({ phone: 1 }, { unique: true })
  await db.collection('advisors').createIndex({ email: 1 }, { unique: true, sparse: true })
  await db.collection('advisors').createIndex({ id_card: 1 }, { unique: true, sparse: true })
  await db.collection('advisors').createIndex({ license_number: 1 }, { unique: true, sparse: true })
  await db.collection('advisors').createIndex({ status: 1 })
  await db.collection('advisors').createIndex({ verification_status: 1 })
  await db.collection('advisors').createIndex({ rating: -1 })
  await db.collection('advisors').createIndex({ is_online: 1 })
  await db.collection('advisors').createIndex({ consultation_fee: 1 })
  await db.collection('advisors').createIndex({ created_at: -1 })

  await db.collection('chat_messages').createIndex({ user_id: 1, advisor_id: 1, created_at: -1 })
  await db.collection('chat_messages').createIndex({ advisor_id: 1, user_id: 1, created_at: -1 })
  await db.collection('chat_messages').createIndex({ sender_type: 1 })
  await db.collection('chat_messages').createIndex({ message_type: 1 })
  await db.collection('chat_messages').createIndex({ is_read: 1 })
  await db.collection('chat_messages').createIndex({ is_deleted: 1 })

  await db.collection('review_records').createIndex({ plan_id: 1, review_status: 1 })
  await db.collection('review_records').createIndex({ advisor_id: 1, review_status: 1 })
  await db.collection('review_records').createIndex({ user_id: 1, review_status: 1 })
  await db.collection('review_records').createIndex({ review_type: 1 })
  await db.collection('review_records').createIndex({ fee_status: 1 })
  await db.collection('review_records').createIndex({ created_at: -1 })

  await db.collection('payment_records').createIndex({ order_id: 1 }, { unique: true })
  await db.collection('payment_records').createIndex({ transaction_id: 1 }, { unique: true, sparse: true })
  await db.collection('payment_records').createIndex({ user_id: 1, status: 1 })
  await db.collection('payment_records').createIndex({ payment_type: 1, status: 1 })
  await db.collection('payment_records').createIndex({ status: 1 })
  await db.collection('payment_records').createIndex({ created_at: -1 })

  await db.collection('notifications').createIndex({ user_id: 1 })
  await db.collection('notifications').createIndex({ advisor_id: 1 })
  await db.collection('notifications').createIndex({ notification_type: 1 })
  await db.collection('notifications').createIndex({ priority: 1 })
  await db.collection('notifications').createIndex({ is_read: 1 })
  await db.collection('notifications').createIndex({ is_sent: 1 })
  await db.collection('notifications').createIndex({ scheduled_at: -1 })
  await db.collection('notifications').createIndex({ expire_at: -1 })
  await db.collection('notifications').createIndex({ created_at: -1 })

  // P2: food_database, exercise_database, user_goals, user_statistics, user_feedback
  await db.collection('food_database').createIndex({ food_name: 1 }, { unique: true })
  await db.collection('food_database').createIndex({ food_category: 1 })
  await db.collection('food_database').createIndex({ food_subcategory: 1 })
  await db.collection('food_database').createIndex({ is_active: 1 })
  await db.collection('food_database').createIndex({ created_at: -1 })
  // 文本索引如需可在控制台或管理脚本单独创建

  await db.collection('exercise_database').createIndex({ exercise_name: 1 }, { unique: true })
  await db.collection('exercise_database').createIndex({ exercise_category: 1 })
  await db.collection('exercise_database').createIndex({ intensity_level: 1 })
  await db.collection('exercise_database').createIndex({ difficulty_level: 1 })
  await db.collection('exercise_database').createIndex({ is_active: 1 })
  await db.collection('exercise_database').createIndex({ created_at: -1 })

  await db.collection('user_goals').createIndex({ user_id: 1, status: 1 })
  await db.collection('user_goals').createIndex({ user_id: 1, goal_type: 1 })
  await db.collection('user_goals').createIndex({ goal_type: 1 })
  await db.collection('user_goals').createIndex({ status: 1 })
  await db.collection('user_goals').createIndex({ target_date: -1 })
  await db.collection('user_goals').createIndex({ created_at: -1 })

  await db.collection('user_statistics').createIndex({ user_id: 1, stat_date: 1 }, { unique: true })
  await db.collection('user_statistics').createIndex({ user_id: 1, stat_date: -1 })
  await db.collection('user_statistics').createIndex({ stat_date: -1 })
  await db.collection('user_statistics').createIndex({ total_calories: -1 })
  await db.collection('user_statistics').createIndex({ total_exercise_minutes: -1 })

  await db.collection('user_feedback').createIndex({ user_id: 1 })
  await db.collection('user_feedback').createIndex({ feedback_type: 1 })
  await db.collection('user_feedback').createIndex({ category: 1 })
  await db.collection('user_feedback').createIndex({ status: 1 })
  await db.collection('user_feedback').createIndex({ priority: 1 })
  await db.collection('user_feedback').createIndex({ assigned_to: 1 })
  await db.collection('user_feedback').createIndex({ created_at: -1 })

  // P3: membership_records, advisor_income_records, audit_logs, operation_logs
  await db.collection('membership_records').createIndex({ user_id: 1, created_at: -1 })
  await db.collection('membership_records').createIndex({ change_type: 1 })
  await db.collection('membership_records').createIndex({ effective_date: -1 })

  await db.collection('advisor_income_records').createIndex({ advisor_id: 1, created_at: -1 })
  await db.collection('advisor_income_records').createIndex({ income_type: 1 })
  await db.collection('advisor_income_records').createIndex({ status: 1 })

  await db.collection('audit_logs').createIndex({ user_id: 1, created_at: -1 })
  await db.collection('audit_logs').createIndex({ advisor_id: 1, created_at: -1 })
  await db.collection('audit_logs').createIndex({ resource_type: 1, resource_id: 1 })
  await db.collection('audit_logs').createIndex({ action: 1 })
  await db.collection('audit_logs').createIndex({ status: 1 })
  await db.collection('audit_logs').createIndex({ ip_address: 1 })

  await db.collection('operation_logs').createIndex({ user_id: 1 })
  await db.collection('operation_logs').createIndex({ module: 1 })
  await db.collection('operation_logs').createIndex({ action: 1 })
  await db.collection('operation_logs').createIndex({ status: 1 })
  await db.collection('operation_logs').createIndex({ created_at: -1 })
}

async function seedSystemConfigs() {
  const now = new Date()
  const configs = [
    { key: 'ai_daily_limit_free', val: 5, type: 'number', cat: 'ai', public: true },
    { key: 'ai_daily_limit_standard', val: 20, type: 'number', cat: 'ai', public: true },
    { key: 'ai_daily_limit_premium', val: -1, type: 'number', cat: 'ai', public: true },
    { key: 'review_timeout_hours', val: 24, type: 'number', cat: 'review', public: false },
    { key: 'max_weight_records_per_day', val: 10, type: 'number', cat: 'limit', public: true },
    { key: 'max_diet_records_per_day', val: 20, type: 'number', cat: 'limit', public: true },
    { key: 'max_exercise_records_per_day', val: 10, type: 'number', cat: 'limit', public: true },
    { key: 'membership_upgrade_fee', val: 9900, type: 'number', cat: 'payment', public: true },
    { key: 'review_fee', val: 5000, type: 'number', cat: 'payment', public: true },
    { key: 'advisor_commission_rate', val: 0.7, type: 'number', cat: 'payment', public: false },
    { key: 'data_retention_days', val: 365, type: 'number', cat: 'system', public: false },
    { key: 'max_file_size_mb', val: 10, type: 'number', cat: 'system', public: false },
    { key: 'session_timeout_minutes', val: 30, type: 'number', cat: 'system', public: false },
    { key: 'default_ai_model', val: 'gpt-3.5-turbo', type: 'string', cat: 'ai', public: true },
    { key: 'max_chat_history', val: 50, type: 'number', cat: 'ai', public: false }
  ]

  for (const c of configs) {
    const exists = await db.collection('system_configs').where({ config_key: c.key }).count()
    if (exists.total === 0) {
      await db.collection('system_configs').add({
        data: {
          config_key: c.key,
          config_value: c.val,
          config_type: c.type,
          category: c.cat,
          is_active: true,
          created_at: now,
          updated_at: now
        }
      })
    }
  }
}

async function main() {
  // 通过插入示例文档确保集合存在
  const now = new Date()
  await ensureCollectionSeed('users', { openid: 'seed', created_at: now, updated_at: now, _seed: true })
  await ensureCollectionSeed('weight_records', { user_id: 'seed', weight: 70, record_date: now, record_time: now, created_at: now, updated_at: now, _seed: true })
  await ensureCollectionSeed('diet_records', { user_id: 'seed', food_name: '苹果', quantity: 1, record_date: now, record_time: now, created_at: now, updated_at: now, _seed: true })
  await ensureCollectionSeed('exercise_records', { user_id: 'seed', exercise_type: 'cardio', exercise_name: '步行', duration: 30, record_date: now, record_time: now, created_at: now, updated_at: now, _seed: true })
  await ensureCollectionSeed('ai_plans', { user_id: 'seed', plan_name: '示例方案', plan_type: 'standard', status: 'draft', created_at: now, updated_at: now, _seed: true })
  await ensureCollectionSeed('system_configs', { config_key: 'seed', config_value: 'seed', config_type: 'string', is_active: true, created_at: now, updated_at: now, _seed: true })

  // Ensure seeds for P1/P2/P3 collections
  await ensureCollectionSeed('advisors', { name: '示例顾问', phone: 'seed', status: 'pending', created_at: now, updated_at: now, _seed: true })
  await ensureCollectionSeed('chat_messages', { user_id: 'seed', advisor_id: 'seed', sender_type: 'system', message_type: 'text', content: 'seed', created_at: now, updated_at: now, _seed: true })
  await ensureCollectionSeed('review_records', { plan_id: 'seed', user_id: 'seed', advisor_id: 'seed', review_type: 'plan_review', review_status: 'pending', created_at: now, _seed: true })
  await ensureCollectionSeed('payment_records', { user_id: 'seed', order_id: 'seed', payment_type: 'service', amount: 1, status: 'pending', created_at: now, _seed: true })
  await ensureCollectionSeed('notifications', { user_id: 'seed', notification_type: 'system', title: 'seed', content: 'seed', created_at: now, _seed: true })

  await ensureCollectionSeed('food_database', { food_name: '示例食物', food_category: 'others', is_active: true, created_at: now, updated_at: now, _seed: true })
  await ensureCollectionSeed('exercise_database', { exercise_name: '示例运动', exercise_category: 'cardio', is_active: true, created_at: now, updated_at: now, _seed: true })
  await ensureCollectionSeed('user_goals', { user_id: 'seed', goal_type: 'weight_loss', goal_name: 'seed', status: 'active', created_at: now, updated_at: now, _seed: true })
  await ensureCollectionSeed('user_statistics', { user_id: 'seed', stat_date: now, total_calories: 0, created_at: now, updated_at: now, _seed: true })
  await ensureCollectionSeed('user_feedback', { user_id: 'seed', feedback_type: 'suggestion', title: 'seed', status: 'pending', created_at: now, updated_at: now, _seed: true })

  await ensureCollectionSeed('membership_records', { user_id: 'seed', new_level: 'free', change_type: 'upgrade', effective_date: now, created_at: now, _seed: true })
  await ensureCollectionSeed('advisor_income_records', { advisor_id: 'seed', income_type: 'commission', amount: 0, status: 'pending', created_at: now, _seed: true })
  await ensureCollectionSeed('audit_logs', { action: 'create', resource_type: 'seed', resource_id: 'seed', status: 'success', created_at: now, _seed: true })
  await ensureCollectionSeed('operation_logs', { module: 'seed', action: 'init', status: 'success', created_at: now, _seed: true })

  await createIndexes()
  await seedSystemConfigs()

  return { success: true }
}

module.exports = { main }

if (require.main === module) {
  main().then(res => console.log(res)).catch(err => console.error(err))
}
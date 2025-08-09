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

  await createIndexes()
  await seedSystemConfigs()

  return { success: true }
}

module.exports = { main }

if (require.main === module) {
  main().then(res => console.log(res)).catch(err => console.error(err))
}
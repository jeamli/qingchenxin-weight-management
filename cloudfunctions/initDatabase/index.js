const cloud = require('wx-server-sdk')

cloud.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE })
const db = cloud.database()
const _ = db.command

async function ensureSeed(collection, sampleDoc) {
  try {
    const cnt = await db.collection(collection).count()
    if (cnt.total === 0) {
      await db.collection(collection).add({ data: sampleDoc })
    }
  } catch (e) {
    // try create by adding once
    try { await db.collection(collection).add({ data: sampleDoc }) } catch (_) {}
  }
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
          updated_at: now,
          _seed: true
        }
      })
    }
  }
}

exports.main = async () => {
  const now = new Date()
  const { OPENID } = cloud.getWXContext()

  // P0
  await ensureSeed('users', {
    openid: OPENID || 'seed_openid', unionid: null, nickname: '示例用户', real_name: null, avatar: '', phone: null, email: null, gender: 'female', age: 28, birth_date: now,
    height: 165, current_weight: 65.5, target_weight: 55, bmi: 24.1, occupation: 'engineer', activity_level: 'light',
    health_goals: ['减重'], medical_history: [], dietary_restrictions: [], allergies: [], preferred_language: 'zh-CN', timezone: 'Asia/Shanghai',
    advisor_id: null, member_level: 'free', member_expire: null, status: 'active',
    notification_settings: { weight_reminder: true, diet_reminder: true, exercise_reminder: true, ai_suggestion: true },
    privacy_settings: { share_data: false, public_profile: false },
    last_login: now, login_count: 0, created_at: now, updated_at: now, _seed: true
  })

  await ensureSeed('weight_records', {
    user_id: 'seed_user', weight: 70.0, bmi: 24.5, record_date: now, record_time: now, record_type: 'manual',
    photo_url: '', note: '示例体重记录', device_info: { platform: 'miniprogram', version: '1.0.0', model: 'unknown' },
    location: { latitude: 0, longitude: 0, address: '' }, created_at: now, updated_at: now, _seed: true
  })

  await ensureSeed('diet_records', {
    user_id: 'seed_user', food_name: '苹果', food_category: '水果', quantity: 150, unit: 'g', calories: 78,
    protein: 0.3, fat: 0.2, carbs: 20.6, fiber: 2.4, sugar: 15.6, sodium: 1.0, photo_url: '',
    meal_type: 'snack', record_date: now, record_time: now, record_type: 'manual', ai_confidence: null, note: '加餐',
    created_at: now, updated_at: now, _seed: true
  })

  await ensureSeed('exercise_records', {
    user_id: 'seed_user', exercise_type: 'cardio', exercise_name: '步行', duration: 30, intensity: 'medium',
    calories_burned: 120, distance: 2.5, steps: 3500, heart_rate_avg: 110, heart_rate_max: 130, heart_rate_min: 95,
    photo_url: '', record_date: now, record_time: now, record_type: 'manual',
    device_info: { platform: 'miniprogram', version: '1.0.0', model: 'unknown' }, location: { latitude: 0, longitude: 0, address: '' },
    note: '示例运动记录', created_at: now, updated_at: now, _seed: true
  })

  await ensureSeed('ai_plans', {
    user_id: 'seed_user', advisor_id: null, plan_name: '示例减重方案', plan_type: 'standard', target_weight: 60, duration: 90, expected_loss: 5.0,
    daily_calories: 1650,
    diet_plan: { meal_plans: [{ meal_type: 'breakfast', foods: [{ name: '燕麦粥', quantity: '1碗', calories: 150 }] }, { meal_type: 'lunch', foods: [{ name: '糙米饭', quantity: '1碗', calories: 200 }] }] },
    exercise_plan: { weekly_schedule: [{ day: 'monday', exercises: [{ name: '快走', duration: 30, intensity: 'moderate' }] }] },
    lifestyle_plan: { suggestions: ['多喝水'], habits: ['早睡'] },
    status: 'draft', review_comment: null, review_fee: 0, reviewed_at: null, reviewed_by: null,
    execution_status: 'not_started', start_date: null, end_date: null, created_at: now, updated_at: now, _seed: true
  })

  await ensureSeed('system_configs', {
    config_key: 'sample_config', config_value: 'sample_value', config_type: 'string', description: '示例配置',
    category: 'system', is_active: true, created_at: now, updated_at: now, _seed: true
  })

  // P1
  await ensureSeed('advisors', {
    name: '示例顾问', avatar: '', phone: 'seed-phone', email: null, id_card: null, license_number: null, specialty: ['营养'], specialization: ['减重'],
    qualification: null, education: null, work_experience: null, hospital: null, description: '示例', experience_years: 1,
    consultation_fee: 0, user_count: 0, rating: 5.0, total_income: 0, monthly_income: 0, status: 'pending',
    verification_status: 'pending', is_online: false, max_users: 100, max_daily_consultations: 20, response_time: null,
    available_time: null, service_areas: null, languages: ['zh-CN'], certificates: null, created_at: now, updated_at: now, _seed: true
  })

  await ensureSeed('chat_messages', {
    user_id: 'seed_user', advisor_id: 'seed_advisor', sender_type: 'system', message_type: 'text', content: '欢迎', image_url: null,
    file_url: null, file_name: null, file_size: null, is_read: false, read_at: null, is_deleted: false, deleted_at: null,
    created_at: now, updated_at: now, _seed: true
  })

  await ensureSeed('review_records', {
    plan_id: 'seed_plan', user_id: 'seed_user', advisor_id: 'seed_advisor', review_type: 'plan_review', review_status: 'pending',
    review_comment: null, modification_suggestions: null, review_fee: 0, fee_status: 'pending', review_time: null,
    created_at: now, reviewed_at: null, updated_at: now, _seed: true
  })

  await ensureSeed('payment_records', {
    user_id: 'seed_user', order_id: 'seed_order', transaction_id: null, payment_type: 'service', amount: 1, currency: 'CNY',
    status: 'pending', payment_method: 'wechat_pay', description: '示例', related_id: null, refund_amount: 0, refund_reason: null,
    refund_time: null, created_at: now, paid_at: null, updated_at: now, _seed: true
  })

  await ensureSeed('notifications', {
    user_id: 'seed_user', advisor_id: null, notification_type: 'system', title: '欢迎', content: '示例通知', image_url: null,
    action_url: null, action_type: null, priority: 'normal', is_read: false, read_at: null, is_sent: true, sent_at: now,
    scheduled_at: null, expire_at: null, created_at: now, updated_at: now, _seed: true
  })

  // P2
  await ensureSeed('food_database', {
    food_name: '示例食物', food_category: 'others', food_subcategory: null, calories_per_100g: 0, protein_per_100g: 0, fat_per_100g: 0, carbs_per_100g: 0,
    fiber_per_100g: 0, sugar_per_100g: 0, sodium_per_100g: 0, vitamin_a: 0, vitamin_c: 0, vitamin_d: 0, vitamin_e: 0, calcium: 0, iron: 0, zinc: 0,
    common_units: [{ unit_name: '份', weight: 100, calories: 0, protein: 0, fat: 0, carbs: 0 }], image_url: '', description: '示例',
    tags: ['示例'], is_active: true, search_keywords: ['示例'], created_at: now, updated_at: now, _seed: true
  })

  await ensureSeed('exercise_database', {
    exercise_name: '示例运动', exercise_category: 'cardio', exercise_subcategory: null, calories_per_hour: 0, intensity_level: 'low',
    equipment_needed: [], target_muscles: [], difficulty_level: 'beginner', duration_range: { min: 10, max: 60, recommended: 30 },
    instructions: '示例说明', precautions: ['注意事项示例'], benefits: ['益处示例'], video_url: '', image_url: '', tags: ['示例'],
    is_active: true, search_keywords: ['示例'], created_at: now, updated_at: now, _seed: true
  })

  await ensureSeed('user_goals', {
    user_id: 'seed_user', goal_type: 'weight_loss', goal_name: '示例目标', target_weight: 60, current_weight: 70, start_weight: 72,
    target_date: now, weekly_loss_target: 0.5, daily_calorie_target: 1600, daily_protein_target: 80, daily_fat_target: 50, daily_carbs_target: 180,
    exercise_minutes_target: 30, water_intake_target: 2000, steps_target: 8000, status: 'active', progress_percentage: 0,
    start_date: now, end_date: null, notes: '示例', created_at: now, updated_at: now, _seed: true
  })

  await ensureSeed('user_statistics', {
    user_id: 'seed_user', stat_date: now, total_calories: 0, total_protein: 0, total_fat: 0, total_carbs: 0, total_fiber: 0, total_sugar: 0,
    total_sodium: 0, total_exercise_minutes: 0, total_calories_burned: 0, weight_change: 0, steps_count: 0, water_intake: 0, sleep_hours: 0,
    meal_count: 0, exercise_count: 0, weight_record_count: 0, ai_chat_count: 0,
    goal_progress: { weight_progress: 0, calorie_progress: 0, exercise_progress: 0, water_progress: 0 }, created_at: now, updated_at: now, _seed: true
  })

  await ensureSeed('user_feedback', {
    user_id: 'seed_user', feedback_type: 'suggestion', category: 'app', title: '示例反馈', content: '内容', rating: null, images: [], contact_info: null,
    priority: 'normal', status: 'pending', assigned_to: null, admin_reply: null, reply_at: null, resolved_at: null, tags: ['示例'], created_at: now, updated_at: now, _seed: true
  })

  // P3
  await ensureSeed('membership_records', {
    user_id: 'seed_user', old_level: null, new_level: 'free', change_type: 'upgrade', payment_id: null, amount: 0,
    effective_date: now, expire_date: null, created_at: now, _seed: true
  })

  await ensureSeed('advisor_income_records', {
    advisor_id: 'seed_advisor', income_type: 'commission', amount: 0, related_id: null, related_type: null, description: '示例',
    status: 'pending', paid_at: null, created_at: now, _seed: true
  })

  await ensureSeed('audit_logs', {
    user_id: null, advisor_id: null, action: 'create', resource_type: 'seed', resource_id: 'seed', old_value: null, new_value: null,
    changed_fields: null, ip_address: null, user_agent: null, session_id: null, request_id: null, execution_time: 0, status: 'success',
    error_message: null, created_at: now, _seed: true
  })

  await ensureSeed('operation_logs', {
    user_id: null, module: 'seed', action: 'init', description: '初始化示例', request_data: null, response_data: null, ip_address: null,
    user_agent: null, execution_time: 0, status: 'success', error_code: null, error_message: null, created_at: now, _seed: true
  })

  // default configs
  await seedSystemConfigs()

  return { success: true }
}
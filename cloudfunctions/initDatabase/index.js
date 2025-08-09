// 云函数：初始化数据库集合和索引
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'qingchegnxin-6gd5zp339c7d1586'
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, collection } = event
  
  try {
    switch (action) {
      case 'init_p0_collections':
        return await initP0Collections()
      case 'create_indexes':
        return await createIndexes(collection)
      case 'init_system_configs':
        return await initSystemConfigs()
      default:
        return {
          success: false,
          error: '未知操作类型'
        }
    }
  } catch (error) {
    console.error('数据库初始化失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 初始化P0核心集合
async function initP0Collections() {
  const collections = [
    'users',
    'weight_records', 
    'diet_records',
    'exercise_records',
    'ai_plans',
    'system_configs'
  ]
  
  const results = []
  
  for (const collectionName of collections) {
    try {
      // 检查集合是否存在
      const exists = await checkCollectionExists(collectionName)
      
      if (!exists) {
        // 创建集合（通过插入一个示例文档）
        const sampleDoc = createSampleDocument(collectionName)
        await db.collection(collectionName).add({
          data: sampleDoc
        })
        
        results.push({
          collection: collectionName,
          status: 'created',
          message: '集合创建成功'
        })
      } else {
        results.push({
          collection: collectionName,
          status: 'exists',
          message: '集合已存在'
        })
      }
    } catch (error) {
      results.push({
        collection: collectionName,
        status: 'error',
        message: error.message
      })
    }
  }
  
  return {
    success: true,
    results: results
  }
}

// 检查集合是否存在
async function checkCollectionExists(collectionName) {
  try {
    const result = await db.collection(collectionName).limit(1).get()
    return true
  } catch (error) {
    return false
  }
}

// 创建示例文档
function createSampleDocument(collectionName) {
  const now = new Date()
  
  switch (collectionName) {
    case 'users':
      return {
        openid: 'sample_openid',
        nickname: '示例用户',
        status: 'active',
        member_level: 'free',
        preferred_language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        notification_settings: {
          weight_reminder: true,
          diet_reminder: true,
          exercise_reminder: true,
          ai_suggestion: true
        },
        privacy_settings: {
          share_data: false,
          public_profile: false
        },
        login_count: 0,
        created_at: now,
        updated_at: now,
        _sample: true // 标记为示例数据
      }
      
    case 'weight_records':
      return {
        user_id: 'sample_user_id',
        weight: 70.0,
        bmi: 24.5,
        record_date: now,
        record_time: now,
        record_type: 'manual',
        device_info: {
          platform: 'miniprogram',
          version: '1.0.0'
        },
        created_at: now,
        updated_at: now,
        _sample: true
      }
      
    case 'diet_records':
      return {
        user_id: 'sample_user_id',
        food_name: '苹果',
        food_category: '水果',
        quantity: 1,
        unit: '个',
        calories: 85,
        nutrition: {
          protein: 0.3,
          fat: 0.2,
          carbs: 22,
          fiber: 4,
          sugar: 16,
          sodium: 1
        },
        meal_type: 'snack',
        record_date: now,
        record_time: now,
        record_type: 'manual',
        created_at: now,
        updated_at: now,
        _sample: true
      }
      
    case 'exercise_records':
      return {
        user_id: 'sample_user_id',
        exercise_name: '步行',
        exercise_type: 'cardio',
        duration: 30,
        intensity: 'moderate',
        calories_burned: 120,
        steps: 3000,
        record_date: now,
        start_time: now,
        end_time: new Date(now.getTime() + 30 * 60 * 1000),
        record_type: 'manual',
        device_source: 'manual',
        created_at: now,
        updated_at: now,
        _sample: true
      }
      
    case 'ai_plans':
      return {
        user_id: 'sample_user_id',
        plan_type: 'comprehensive',
        title: '示例减重计划',
        description: '基于AI生成的个性化减重方案',
        content: {
          objectives: ['减重5kg', '改善饮食习惯'],
          diet_plan: {
            daily_calories: 1600,
            meal_plans: [{
              meal_type: 'breakfast',
              foods: [{
                name: '燕麦粥',
                quantity: '1碗',
                calories: 150
              }]
            }]
          },
          exercise_plan: {
            weekly_schedule: [{
              day: 'monday',
              exercises: [{
                name: '快走',
                duration: 30,
                intensity: 'moderate'
              }]
            }]
          },
          lifestyle_suggestions: ['保证充足睡眠', '多喝水']
        },
        ai_model: 'deepseek-v1',
        status: 'draft',
        review_status: 'not_required',
        created_at: now,
        updated_at: now,
        _sample: true
      }
      
    case 'system_configs':
      return {
        config_key: 'sample_config',
        config_value: 'sample_value',
        config_type: 'string',
        category: 'system',
        description: '示例配置',
        is_public: false,
        created_at: now,
        updated_at: now,
        _sample: true
      }
      
    default:
      return {
        name: `示例${collectionName}`,
        created_at: now,
        _sample: true
      }
  }
}

// 初始化系统配置
async function initSystemConfigs() {
  const configs = [
    {
      config_key: 'ai_daily_limit_free',
      config_value: 5,
      config_type: 'number',
      category: 'ai',
      description: '免费用户每日AI对话次数限制',
      is_public: true,
      default_value: 5
    },
    {
      config_key: 'ai_daily_limit_standard',
      config_value: 20,
      config_type: 'number',
      category: 'ai',
      description: '标准会员每日AI对话次数限制',
      is_public: true,
      default_value: 20
    },
    {
      config_key: 'ai_daily_limit_premium',
      config_value: -1,
      config_type: 'number',
      category: 'ai',
      description: '高级会员每日AI对话次数限制（-1表示无限制）',
      is_public: true,
      default_value: -1
    },
    {
      config_key: 'membership_upgrade_fee',
      config_value: 9900,
      config_type: 'number',
      category: 'payment',
      description: '会员升级费用（分）',
      is_public: true,
      default_value: 9900
    },
    {
      config_key: 'review_fee',
      config_value: 5000,
      config_type: 'number',
      category: 'payment',
      description: '方案审核费用（分）',
      is_public: true,
      default_value: 5000
    },
    {
      config_key: 'advisor_commission_rate',
      config_value: 0.7,
      config_type: 'number',
      category: 'payment',
      description: '健康顾问分成比例',
      is_public: false,
      default_value: 0.7
    },
    {
      config_key: 'max_weight_records_per_day',
      config_value: 10,
      config_type: 'number',
      category: 'limit',
      description: '每日最大体重记录次数',
      is_public: true,
      default_value: 10
    },
    {
      config_key: 'max_diet_records_per_day',
      config_value: 20,
      config_type: 'number',
      category: 'limit',
      description: '每日最大饮食记录次数',
      is_public: true,
      default_value: 20
    },
    {
      config_key: 'max_exercise_records_per_day',
      config_value: 10,
      config_type: 'number',
      category: 'limit',
      description: '每日最大运动记录次数',
      is_public: true,
      default_value: 10
    },
    {
      config_key: 'review_timeout_hours',
      config_value: 24,
      config_type: 'number',
      category: 'ai',
      description: '方案审核超时时间（小时）',
      is_public: false,
      default_value: 24
    }
  ]
  
  const results = []
  const now = new Date()
  
  for (const config of configs) {
    try {
      // 检查配置是否已存在
      const existing = await db.collection('system_configs').where({
        config_key: config.config_key
      }).get()
      
      if (existing.data.length === 0) {
        // 添加时间戳
        config.created_at = now
        config.updated_at = now
        config.validation = {
          required: true
        }
        
        await db.collection('system_configs').add({
          data: config
        })
        
        results.push({
          config_key: config.config_key,
          status: 'created'
        })
      } else {
        results.push({
          config_key: config.config_key,
          status: 'exists'
        })
      }
    } catch (error) {
      results.push({
        config_key: config.config_key,
        status: 'error',
        message: error.message
      })
    }
  }
  
  return {
    success: true,
    results: results
  }
}

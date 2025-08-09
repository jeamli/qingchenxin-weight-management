// 云开发数据库初始化脚本
// 用于创建P0核心集合和初始数据

const cloud = require('wx-server-sdk');

cloud.init({
  env: 'qingchegnxin-6gd5zp339c7d1586'
});

const db = cloud.database();

// P0核心集合创建和初始化
async function initCoreCollections() {
  console.log('开始初始化云开发数据库核心集合...');
  
  try {
    // 1. 创建用户集合（users）
    await initUsersCollection();
    
    // 2. 创建饮食记录集合（diet_records）
    await initDietRecordsCollection();
    
    // 3. 创建运动记录集合（exercise_records）
    await initExerciseRecordsCollection();
    
    // 4. 创建AI方案集合（ai_plans）
    await initAiPlansCollection();
    
    // 5. 创建系统配置集合（system_configs）
    await initSystemConfigsCollection();
    
    console.log('✅ 所有核心集合初始化完成！');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
  }
}

// 1. 用户集合初始化
async function initUsersCollection() {
  console.log('初始化 users 集合...');
  
  const sampleUser = {
    openid: 'sample_openid_001',
    unionid: null,
    nickname: '测试用户',
    real_name: null,
    avatar: 'https://example.com/avatar.png',
    phone: null,
    email: null,
    gender: 'female',
    age: 28,
    birth_date: '1995-06-15',
    height: 165.0,
    current_weight: 65.5,
    target_weight: 55.0,
    bmi: 24.1,
    occupation: '软件工程师',
    activity_level: 'light',
    health_goals: ['减重', '健康饮食', '规律运动'],
    medical_history: [],
    dietary_restrictions: ['无特殊限制'],
    allergies: [],
    preferred_language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    advisor_id: null,
    member_level: 'free',
    member_expire: null,
    status: 'active',
    notification_settings: {
      weight_reminder: true,
      diet_reminder: true,
      exercise_reminder: true,
      advisor_message: true
    },
    privacy_settings: {
      data_sharing: false,
      public_profile: false
    },
    last_login: new Date(),
    login_count: 1,
    created_at: new Date(),
    updated_at: new Date()
  };
  
  try {
    await db.collection('users').add({
      data: sampleUser
    });
    console.log('✅ users 集合创建成功');
  } catch (error) {
    if (error.errCode === -1) {
      console.log('ℹ️  users 集合已存在，跳过创建');
    } else {
      console.error('❌ users 集合创建失败:', error);
    }
  }
}

// 2. 饮食记录集合初始化
async function initDietRecordsCollection() {
  console.log('初始化 diet_records 集合...');
  
  const sampleDietRecord = {
    user_id: 'sample_user_id_001',
    food_name: '苹果',
    food_category: '水果',
    quantity: 150.0,
    unit: 'g',
    calories: 78.0,
    protein: 0.3,
    fat: 0.2,
    carbs: 20.6,
    fiber: 2.4,
    sugar: 15.6,
    sodium: 1.0,
    photo_url: null,
    meal_type: 'snack',
    record_date: '2025-08-09',
    record_time: new Date(),
    record_type: 'manual',
    note: '下午加餐',
    nutrition_analysis: {
      daily_calories_percent: 4.0,
      nutrition_score: 85
    },
    ai_recognition: {
      confidence: 0.95,
      recognized_foods: ['苹果'],
      analysis_result: '营养价值高的水果'
    },
    created_at: new Date(),
    updated_at: new Date()
  };
  
  try {
    await db.collection('diet_records').add({
      data: sampleDietRecord
    });
    console.log('✅ diet_records 集合创建成功');
  } catch (error) {
    if (error.errCode === -1) {
      console.log('ℹ️  diet_records 集合已存在，跳过创建');
    } else {
      console.error('❌ diet_records 集合创建失败:', error);
    }
  }
}

// 3. 运动记录集合初始化
async function initExerciseRecordsCollection() {
  console.log('初始化 exercise_records 集合...');
  
  const sampleExerciseRecord = {
    user_id: 'sample_user_id_001',
    exercise_name: '快走',
    exercise_category: '有氧运动',
    duration_minutes: 30,
    calories_burned: 120.0,
    intensity: 'moderate',
    distance: 2.5,
    unit: 'km',
    steps: 3500,
    heart_rate: {
      avg: 110,
      max: 130,
      min: 95
    },
    record_date: '2025-08-09',
    record_time: new Date(),
    record_type: 'manual',
    location: {
      name: '社区公园',
      latitude: 31.2304,
      longitude: 121.4737
    },
    weather: {
      temperature: 25,
      humidity: 65,
      condition: '晴天'
    },
    equipment_used: ['运动手环'],
    note: '晚饭后散步',
    performance_analysis: {
      calorie_efficiency: 4.0,
      performance_score: 80
    },
    created_at: new Date(),
    updated_at: new Date()
  };
  
  try {
    await db.collection('exercise_records').add({
      data: sampleExerciseRecord
    });
    console.log('✅ exercise_records 集合创建成功');
  } catch (error) {
    if (error.errCode === -1) {
      console.log('ℹ️  exercise_records 集合已存在，跳过创建');
    } else {
      console.error('❌ exercise_records 集合创建失败:', error);
    }
  }
}

// 4. AI方案集合初始化
async function initAiPlansCollection() {
  console.log('初始化 ai_plans 集合...');
  
  const sampleAiPlan = {
    user_id: 'sample_user_id_001',
    plan_type: 'weight_loss',
    plan_title: '个性化减重方案',
    plan_description: '基于您的身体数据和健康目标，为您定制的3个月减重计划',
    target_weight_loss: 10.5,
    duration_weeks: 12,
    daily_calorie_target: 1650,
    weekly_exercise_target: 150,
    diet_plan: {
      breakfast: {
        calories: 400,
        foods: ['燕麦粥', '鸡蛋', '牛奶'],
        description: '营养均衡的早餐搭配'
      },
      lunch: {
        calories: 600,
        foods: ['糙米饭', '瘦肉', '蔬菜'],
        description: '高蛋白低脂午餐'
      },
      dinner: {
        calories: 450,
        foods: ['蔬菜沙拉', '鱼肉', '少量主食'],
        description: '清淡营养的晚餐'
      },
      snacks: {
        calories: 200,
        foods: ['水果', '坚果'],
        description: '健康加餐选择'
      }
    },
    exercise_plan: {
      monday: ['快走30分钟', '力量训练20分钟'],
      tuesday: ['瑜伽45分钟'],
      wednesday: ['跑步25分钟', '拉伸15分钟'],
      thursday: ['游泳30分钟'],
      friday: ['快走30分钟', '力量训练20分钟'],
      saturday: ['户外运动60分钟'],
      sunday: ['瑜伽30分钟', '休息']
    },
    health_tips: [
      '每天至少饮水8杯',
      '保证充足睡眠7-8小时',
      '避免熬夜和过度压力',
      '定期监测体重变化'
    ],
    ai_confidence: 0.92,
    generation_algorithm: 'GPT-4',
    advisor_reviewed: false,
    reviewed_by: null,
    review_time: null,
    review_comments: null,
    status: 'active',
    effectiveness_score: null,
    user_feedback: null,
    created_at: new Date(),
    updated_at: new Date()
  };
  
  try {
    await db.collection('ai_plans').add({
      data: sampleAiPlan
    });
    console.log('✅ ai_plans 集合创建成功');
  } catch (error) {
    if (error.errCode === -1) {
      console.log('ℹ️  ai_plans 集合已存在，跳过创建');
    } else {
      console.error('❌ ai_plans 集合创建失败:', error);
    }
  }
}

// 5. 系统配置集合初始化
async function initSystemConfigsCollection() {
  console.log('初始化 system_configs 集合...');
  
  const systemConfigs = [
    {
      config_key: 'ai_daily_limit_free',
      config_value: 5,
      config_type: 'number',
      description: '免费用户每日AI对话次数限制',
      category: 'ai_limits',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      config_key: 'ai_daily_limit_standard',
      config_value: 20,
      config_type: 'number',
      description: '标准会员每日AI对话次数限制',
      category: 'ai_limits',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      config_key: 'ai_daily_limit_premium',
      config_value: -1,
      config_type: 'number',
      description: '高级会员每日AI对话次数限制（-1表示无限制）',
      category: 'ai_limits',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      config_key: 'review_timeout_hours',
      config_value: 24,
      config_type: 'number',
      description: '健康顾问审核超时时间（小时）',
      category: 'review_settings',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      config_key: 'membership_upgrade_fee',
      config_value: 9900,
      config_type: 'number',
      description: '会员升级费用（分）',
      category: 'payment',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      config_key: 'review_fee',
      config_value: 5000,
      config_type: 'number',
      description: '专业审核费用（分）',
      category: 'payment',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      config_key: 'advisor_commission_rate',
      config_value: 0.7,
      config_type: 'number',
      description: '健康顾问分成比例',
      category: 'advisor_settings',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];
  
  try {
    for (const config of systemConfigs) {
      await db.collection('system_configs').add({
        data: config
      });
    }
    console.log('✅ system_configs 集合创建成功');
  } catch (error) {
    if (error.errCode === -1) {
      console.log('ℹ️  system_configs 集合已存在，跳过创建');
    } else {
      console.error('❌ system_configs 集合创建失败:', error);
    }
  }
}

// 导出初始化函数
module.exports = {
  initCoreCollections
};

// 如果直接运行此脚本
if (require.main === module) {
  initCoreCollections();
}

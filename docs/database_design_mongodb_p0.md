# 体重管理数字医生小程序 - 文档型数据库设计（P0核心集合）

**文档版本**：v1.0  
**创建日期**：2025年8月9日  
**数据库类型**：云开发文档型数据库（MongoDB）  
**环境ID**：qingchegnxin-6gd5zp339c7d1586

---

## 🟢 P0 - 核心集合（初期必须）

这些集合是小程序的核心功能，必须优先实现：

### 1. users（用户集合）

**设计思想**：用户基础信息和健康数据的核心存储，保持原MySQL设计的所有字段和约束逻辑。

```javascript
// 集合名：users
{
  "_id": "ObjectId",                    // 文档ID（MongoDB自动生成）
  "openid": "String",                   // 微信openid（唯一）
  "unionid": "String",                  // 微信unionid（可选）
  "nickname": "String",                 // 脱敏姓名（李X明）
  "real_name": "String",                // 真实姓名（加密存储）
  "avatar": "String",                   // 头像URL
  "phone": "String",                    // 手机号（加密）
  "email": "String",                    // 邮箱
  "gender": "String",                   // 性别：male/female
  "age": "Number",                      // 年龄
  "birth_date": "Date",                 // 出生日期
  "height": "Number",                   // 身高(cm)
  "current_weight": "Number",           // 当前体重(kg)
  "target_weight": "Number",            // 目标体重(kg)
  "bmi": "Number",                      // BMI指数
  "occupation": "String",               // 职业
  "activity_level": "String",           // 活动水平：sedentary/light/moderate/active
  "health_goals": ["String"],           // 健康目标数组
  "medical_history": ["String"],        // 病史数组
  "dietary_restrictions": ["String"],   // 饮食限制
  "allergies": ["String"],              // 过敏信息
  "preferred_language": "String",       // 首选语言（默认：zh-CN）
  "timezone": "String",                 // 时区（默认：Asia/Shanghai）
  "advisor_id": "String",               // 关联健康顾问ID（引用advisors._id）
  "member_level": "String",             // 会员等级：free/standard/premium
  "member_expire": "Date",              // 会员到期时间
  "status": "String",                   // 状态：active/inactive/blocked/pending
  "notification_settings": {            // 通知设置
    "weight_reminder": "Boolean",
    "diet_reminder": "Boolean",
    "exercise_reminder": "Boolean",
    "ai_suggestion": "Boolean"
  },
  "privacy_settings": {                 // 隐私设置
    "share_data": "Boolean",
    "public_profile": "Boolean"
  },
  "last_login": "Date",                 // 最后登录时间
  "login_count": "Number",              // 登录次数
  "created_at": "Date",                 // 创建时间
  "updated_at": "Date"                  // 更新时间
}
```

**索引设计**：
- `openid`: 唯一索引
- `advisor_id`: 普通索引
- `member_level`: 普通索引
- `status`: 普通索引
- `created_at`: 普通索引

### 2. weight_records（体重记录集合）

**设计思想**：保持原有的体重记录结构，支持手动输入、拍照识别等多种记录方式。

```javascript
// 集合名：weight_records
{
  "_id": "ObjectId",                    // 文档ID
  "user_id": "String",                  // 用户ID（引用users._id）
  "weight": "Number",                   // 体重(kg)
  "bmi": "Number",                      // BMI指数
  "record_date": "Date",                // 记录日期（YYYY-MM-DD）
  "record_time": "Date",                // 具体记录时间
  "record_type": "String",              // 记录类型：manual/photo/auto
  "photo_url": "String",                // 照片URL（如果是拍照记录）
  "note": "String",                     // 备注
  "device_info": {                      // 设备信息
    "platform": "String",              // 平台：miniprogram/app
    "version": "String",                // 版本号
    "model": "String"                   // 设备型号
  },
  "location": {                         // 位置信息（可选）
    "latitude": "Number",
    "longitude": "Number",
    "address": "String"
  },
  "created_at": "Date",                 // 创建时间
  "updated_at": "Date"                  // 更新时间
}
```

**索引设计**：
- `user_id + record_date`: 复合索引
- `user_id + created_at`: 复合索引
- `record_type`: 普通索引

### 3. diet_records（饮食记录集合）

**设计思想**：详细记录饮食信息，支持营养分析和热量计算。

```javascript
// 集合名：diet_records
{
  "_id": "ObjectId",                    // 文档ID
  "user_id": "String",                  // 用户ID（引用users._id）
  "food_name": "String",                // 食物名称
  "food_category": "String",            // 食物分类（主食/蔬菜/蛋白质等）
  "quantity": "Number",                 // 数量
  "unit": "String",                     // 单位（克/个/份等）
  "calories": "Number",                 // 热量(kcal)
  "nutrition": {                        // 营养信息
    "protein": "Number",                // 蛋白质(g)
    "fat": "Number",                    // 脂肪(g)
    "carbs": "Number",                  // 碳水化合物(g)
    "fiber": "Number",                  // 膳食纤维(g)
    "sugar": "Number",                  // 糖分(g)
    "sodium": "Number"                  // 钠(mg)
  },
  "meal_type": "String",                // 餐次：breakfast/lunch/dinner/snack
  "record_date": "Date",                // 记录日期
  "record_time": "Date",                // 记录时间
  "record_type": "String",              // 记录类型：manual/photo/ai
  "ai_confidence": "Number",            // AI识别置信度（0-1）
  "photo_url": "String",                // 食物照片URL
  "note": "String",                     // 备注
  "location": {                         // 用餐地点（可选）
    "name": "String",                   // 地点名称
    "address": "String"                 // 详细地址
  },
  "created_at": "Date",                 // 创建时间
  "updated_at": "Date"                  // 更新时间
}
```

**索引设计**：
- `user_id + record_date`: 复合索引
- `user_id + meal_type + record_date`: 复合索引
- `food_category`: 普通索引

### 4. exercise_records（运动记录集合）

**设计思想**：记录各种运动类型和强度，支持热量消耗计算。

```javascript
// 集合名：exercise_records
{
  "_id": "ObjectId",                    // 文档ID
  "user_id": "String",                  // 用户ID（引用users._id）
  "exercise_name": "String",            // 运动名称
  "exercise_type": "String",            // 运动类型：cardio/strength/flexibility
  "duration": "Number",                 // 运动时长（分钟）
  "intensity": "String",                // 运动强度：low/medium/high
  "calories_burned": "Number",          // 消耗热量(kcal)
  "distance": "Number",                 // 运动距离（公里）
  "steps": "Number",                    // 步数
  "heart_rate_avg": "Number",           // 平均心率（可选）
  "heart_rate_max": "Number",           // 最大心率（可选）
  "heart_rate_min": "Number",           // 最小心率（可选）
  "photo_url": "String",                // 运动照片URL（可选）
  "record_date": "Date",                // 记录日期
  "start_time": "Date",                 // 开始时间
  "end_time": "Date",                   // 结束时间
  "record_type": "String",              // 记录类型：manual/auto/device
  "device_source": "String",            // 数据来源：manual/apple_health/wechat_sport/device
  "route_data": {                       // 运动轨迹（可选）
    "coordinates": [                    // GPS坐标数组
      {
        "latitude": "Number",
        "longitude": "Number",
        "timestamp": "Date"
      }
    ]
  },
  "note": "String",                     // 备注
  "weather": {                          // 天气信息（可选）
    "temperature": "Number",
    "condition": "String"
  },
  "created_at": "Date",                 // 创建时间
  "updated_at": "Date"                  // 更新时间
}
```

**索引设计**：
- `user_id + record_date`: 复合索引
- `user_id + exercise_type + record_date`: 复合索引
- `exercise_type`: 普通索引

### 5. ai_plans（AI方案集合）

**设计思想**：存储AI生成的个性化健康方案，支持顾问审核流程。

```javascript
// 集合名：ai_plans
{
  "_id": "ObjectId",                    // 文档ID
  "user_id": "String",                  // 用户ID（引用users._id）
  "advisor_id": "String",               // 健康顾问ID（引用advisors._id，可选）
  "plan_name": "String",                // 方案名称
  "plan_type": "String",                // 方案类型：gentle/standard/aggressive
  "target_weight": "Number",            // 目标体重(kg)
  "duration": "Number",                 // 持续时间(天)
  "expected_loss": "Number",            // 预期减重(kg)
  "daily_calories": "Number",           // 每日热量
  "diet_plan": {                        // 饮食计划（JSON）
    "meal_plans": [
      {
        "meal_type": "String",          // 餐次
        "foods": [
          {
            "name": "String",
            "quantity": "String",
            "calories": "Number"
          }
        ]
      }
    ]
  },
  "exercise_plan": {                    // 运动计划（JSON）
    "weekly_schedule": [
      {
        "day": "String",                // 星期
        "exercises": [
          {
            "name": "String",
            "duration": "Number",
            "intensity": "String"
          }
        ]
      }
    ]
  },
  "lifestyle_plan": {                   // 生活方式建议（JSON）
    "suggestions": ["String"],
    "habits": ["String"]
  },
  "status": "String",                   // 状态：draft/pending/reviewed/approved/rejected
  "review_comment": "String",           // 审核意见
  "review_fee": "Number",               // 审核费用（分）
  "reviewed_at": "Date",                // 审核时间
  "reviewed_by": "String",              // 审核人ID（引用advisors._id）
  "execution_status": "String",         // 执行状态：not_started/in_progress/completed/paused
  "start_date": "Date",                 // 开始日期
  "end_date": "Date",                   // 结束日期
  "created_at": "Date",                 // 创建时间
  "updated_at": "Date"                  // 更新时间
}
```

**索引设计**：
- `user_id + status`: 复合索引
- `advisor_id + status`: 复合索引
- `reviewed_by + status`: 复合索引
- `plan_type`: 普通索引
- `status`: 普通索引
- `execution_status`: 普通索引

### 6. system_configs（系统配置集合）

**设计思想**：集中管理系统配置，支持动态调整各种参数。

```javascript
// 集合名：system_configs
{
  "_id": "ObjectId",                    // 文档ID
  "config_key": "String",               // 配置键（唯一）
  "config_value": "Mixed",              // 配置值（可以是各种类型）
  "config_type": "String",              // 配置类型：string/number/boolean/object/array
  "category": "String",                 // 配置分类：ai/payment/limit/ui等
  "description": "String",              // 配置描述
  "is_public": "Boolean",               // 是否公开（客户端可访问）
  "is_active": "Boolean",               // 是否启用
  "default_value": "Mixed",             // 默认值
  "validation": {                       // 验证规则
    "required": "Boolean",
    "min_value": "Number",
    "max_value": "Number",
    "allowed_values": ["Mixed"]
  },
  "created_at": "Date",                 // 创建时间
  "updated_at": "Date"                  // 更新时间
}
```

**预设配置数据**：
```javascript
// AI相关配置
{
  "config_key": "ai_daily_limit_free",
  "config_value": 5,
  "config_type": "number",
  "category": "ai",
  "description": "免费用户每日AI对话次数限制"
}

// 会员相关配置
{
  "config_key": "membership_upgrade_fee",
  "config_value": 9900,
  "config_type": "number",
  "category": "payment",
  "description": "会员升级费用（分）"
}

// 数据限制配置
{
  "config_key": "max_weight_records_per_day",
  "config_value": 10,
  "config_type": "number",
  "category": "limit",
  "description": "每日最大体重记录次数"
}
```

**索引设计**：
- `config_key`: 唯一索引
- `category`: 普通索引
- `is_public`: 普通索引
- `is_active`: 普通索引

---

## 🔄 转换说明

### 与MySQL设计的主要差异：

1. **主键**：使用MongoDB的ObjectId替代MySQL的自增ID
2. **外键关系**：使用字符串引用替代严格的外键约束
3. **JSON字段**：直接使用嵌套文档结构，更加灵活
4. **枚举类型**：使用字符串替代MySQL的ENUM类型
5. **索引**：调整为适合文档数据库的索引策略

### 保持的设计思想：

1. **数据完整性**：通过应用层逻辑保证数据一致性
2. **业务逻辑**：所有业务规则和验证逻辑保持不变
3. **查询需求**：索引设计支持所有原有查询场景
4. **扩展性**：文档结构更加灵活，便于后续扩展

---

## 📋 下一步

P0核心集合设计完成后，接下来将设计：
- P1重要集合（advisors, chat_messages, review_records等）
- P2功能集合（food_database, exercise_database等）
- P3高级集合（membership_records, audit_logs等）

# 体重管理数字医生小程序 - 文档型数据库设计（完整版 P0/P1/P2/P3）

文档版本：v1.0  
创建日期：2025-08-09  
数据库类型：腾讯云开发文档型数据库（MongoDB）

---

## 设计总览与约定

- 主键：所有集合使用 MongoDB `_id: ObjectId`。
- 外键：使用字符串（或 ObjectId 字符串）引用，例如 `user_id: String` 引用 `users._id`。
- 命名：统一使用蛇形命名（snake_case）。
- 时间：统一使用 `Date` 类型字段，命名为 `created_at`、`updated_at`、`record_date`、`record_time` 等。
- 数值：MySQL 中的 `decimal/float/int` 统一映射为 `Number`。
- 枚举：统一以 `String` 存储，并在“枚举约束”中列出允许值，约束在应用层/云函数侧校验。
- JSON：MySQL `json` 字段映射为嵌套对象或数组。
- 索引：按照 MySQL 的 BTree/复合索引意图，定义为集合的复合索引；全文搜索建议使用文本索引或云搜索能力。
- 约束：MySQL 的 CHECK/触发器/存储过程/视图，迁移为应用层校验、云函数逻辑、聚合管道与定时任务。

---

## P0 - 核心集合

### 1. users（用户集合）

设计意图：用户基础信息、健康属性、会员状态、通知与隐私。

示例文档：
```javascript
{
  _id: ObjectId,
  openid: String,                // 唯一
  unionid: String | null,
  nickname: String | null,
  real_name: String | null,      // 敏感信息，建议加密
  avatar: String | null,
  phone: String | null,          // 敏感信息，建议加密
  email: String | null,
  gender: String | null,         // enum: male/female
  age: Number | null,            // 1..120
  birth_date: Date | null,
  height: Number | null,         // cm: 50..300
  current_weight: Number | null, // kg: 10..500
  target_weight: Number | null,  // kg: 10..500
  bmi: Number | null,
  occupation: String | null,
  activity_level: String | null, // enum: sedentary/light/moderate/active
  health_goals: [String] | null,
  medical_history: [String] | null,
  dietary_restrictions: [String] | null,
  allergies: [String] | null,
  preferred_language: String,    // default zh-CN
  timezone: String,              // default Asia/Shanghai
  advisor_id: String | null,     // 引用 advisors._id
  member_level: String,          // enum: free/standard/premium
  member_expire: Date | null,
  status: String,                // enum: active/inactive/blocked/pending
  notification_settings: {
    weight_reminder: Boolean,
    diet_reminder: Boolean,
    exercise_reminder: Boolean,
    ai_suggestion: Boolean
  } | null,
  privacy_settings: {
    share_data: Boolean,
    public_profile: Boolean
  } | null,
  last_login: Date | null,
  login_count: Number,           // >= 0
  created_at: Date,
  updated_at: Date
}
```

索引：
- 唯一：`openid`
- 普通：`advisor_id`、`member_level`、`status`、`created_at`
- 建议（补充脚本一致性）：`(nickname, current_weight, bmi, status)` 作为复合检索需求可建立组合索引

约束迁移：
- CHECK(age/height/weight) 转应用层校验；
- BMI 计算触发器迁移为：在写入/更新用户/体重记录时，由应用或云函数计算 `bmi`。

---

### 2. weight_records（体重记录集合）

```javascript
{
  _id: ObjectId,
  user_id: String,             // 引用 users._id
  weight: Number,              // kg: 10..500
  bmi: Number | null,
  record_date: Date,           // 仅日期
  record_time: Date,           // 精确时间
  record_type: String,         // enum: manual/photo/auto
  photo_url: String | null,
  note: String | null,
  device_info: {
    platform: String,
    version: String,
    model: String
  } | null,
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  } | null,
  created_at: Date,
  updated_at: Date
}
```

索引：
- 复合：`(user_id, record_date)`、`(user_id, created_at)`
- 单列：`record_type`

约束迁移：
- CHECK(weight) 转应用层；
- BMI 触发器迁移为：保存时按用户身高计算并写 `bmi`。

---

### 3. diet_records（饮食记录集合）

```javascript
{
  _id: ObjectId,
  user_id: String,               // 引用 users._id
  food_name: String,
  food_category: String | null,
  quantity: Number,              // > 0
  unit: String | null,
  calories: Number | null,
  protein: Number | null,
  fat: Number | null,
  carbs: Number | null,
  fiber: Number | null,
  sugar: Number | null,
  sodium: Number | null,
  photo_url: String | null,
  meal_type: String | null,      // enum: breakfast/lunch/dinner/snack
  record_date: Date,
  record_time: Date,
  record_type: String,           // enum: manual/photo/ai
  ai_confidence: Number | null,  // 0..1（MySQL 为 0..1 或 0..100；此处按 0..1 建议）
  note: String | null,
  created_at: Date,
  updated_at: Date
}
```

索引：
- 复合：`(user_id, record_date)`、`(user_id, meal_type, record_date)`
- 单列：`meal_type`、`record_type`

约束迁移：
- CHECK(quantity/calories) 转应用层。

---

### 4. exercise_records（运动记录集合）

```javascript
{
  _id: ObjectId,
  user_id: String,                 // 引用 users._id
  exercise_type: String,           // enum: cardio/strength/flexibility
  exercise_name: String,
  duration: Number,                // minutes: 1..480
  intensity: String,               // enum: low/medium/high
  calories_burned: Number | null,
  distance: Number | null,         // km >= 0
  steps: Number | null,            // >= 0
  heart_rate_avg: Number | null,
  heart_rate_max: Number | null,
  heart_rate_min: Number | null,
  photo_url: String | null,
  record_date: Date,
  record_time: Date,
  record_type: String,             // enum: manual/photo/auto
  device_info: {
    platform: String,
    version: String,
    model: String
  } | null,
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  } | null,
  note: String | null,
  created_at: Date,
  updated_at: Date
}
```

索引：
- 复合：`(user_id, record_date)`、`(user_id, exercise_type)`
- 单列：`exercise_type`、`intensity`、`record_type`

约束迁移：
- CHECK(duration/calories_burned/distance/steps) 转应用层。

---

### 5. ai_plans（AI 方案集合）

```javascript
{
  _id: ObjectId,
  user_id: String,                 // 引用 users._id
  advisor_id: String | null,       // 引用 advisors._id
  plan_name: String,
  plan_type: String,               // enum: gentle/standard/aggressive
  target_weight: Number | null,
  duration: Number | null,         // days
  expected_loss: Number | null,    // kg
  daily_calories: Number | null,
  diet_plan: {                     // 自由 JSON，建议结构化
    meal_plans: [{
      meal_type: String,
      foods: [{ name: String, quantity: String, calories: Number }]
    }]
  } | null,
  exercise_plan: {
    weekly_schedule: [{
      day: String,
      exercises: [{ name: String, duration: Number, intensity: String }]
    }]
  } | null,
  lifestyle_plan: {
    suggestions: [String],
    habits: [String]
  } | null,
  status: String,                  // enum: draft/pending/reviewed/approved/rejected
  review_comment: String | null,
  review_fee: Number,              // 分
  reviewed_at: Date | null,
  reviewed_by: String | null,      // advisors._id
  execution_status: String,        // enum: not_started/in_progress/completed/paused
  start_date: Date | null,
  end_date: Date | null,
  created_at: Date,
  updated_at: Date
}
```

索引：
- 复合：`(user_id, status)`、`(advisor_id, status)`
- 单列：`plan_type`、`status`、`execution_status`、`created_at`

约束迁移：
- CHECK(duration/daily_calories) 转应用层。

---

### 6. system_configs（系统配置集合）

```javascript
{
  _id: ObjectId,
  config_key: String,           // 唯一
  config_value: Any,            // Mixed
  config_type: String,          // enum: string/number/boolean/object
  description: String | null,
  category: String | null,      // ai/review/record/payment/system/limit
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

索引：
- 唯一：`config_key`
- 普通：`category`、`is_active`

初始配置建议（合并 P0 与补充脚本）：
- ai_daily_limit_free: 5
- ai_daily_limit_standard: 20
- ai_daily_limit_premium: -1
- review_timeout_hours: 24
- max_weight_records_per_day: 10
- max_diet_records_per_day: 20
- max_exercise_records_per_day: 10
- membership_upgrade_fee: 9900
- review_fee: 5000
- advisor_commission_rate: 0.7
- data_retention_days: 365
- max_file_size_mb: 10
- session_timeout_minutes: 30
- default_ai_model: "gpt-3.5-turbo"
- max_chat_history: 50

---

## P1 - 重要集合

### 1. advisors（健康顾问集合）

```javascript
{
  _id: ObjectId,
  name: String,
  avatar: String | null,
  phone: String,                 // 加密存储
  email: String | null,
  id_card: String | null,        // 加密存储
  license_number: String | null,
  specialty: [String] | null,
  specialization: [String] | null,
  qualification: String | null,
  education: String | null,
  work_experience: String | null,
  hospital: String | null,
  description: String | null,
  experience_years: Number | null,
  consultation_fee: Number,      // 分
  user_count: Number,            // >= 0
  rating: Number | null,         // 1..5 (0.5 步进可约定)
  total_income: Number,          // 分
  monthly_income: Number,        // 分
  status: String,                // enum: active/inactive/blocked/pending
  verification_status: String,   // enum: pending/verified/rejected
  is_online: Boolean,
  max_users: Number,
  max_daily_consultations: Number,
  response_time: Number | null,  // minutes
  available_time: Any | null,    // JSON
  service_areas: [String] | null,
  languages: [String] | null,
  certificates: [Any] | null,
  created_at: Date,
  updated_at: Date
}
```

索引：
- 唯一：`phone`、`email`、`id_card`、`license_number`
- 普通：`status`、`verification_status`、`rating`、`user_count`、`is_online`、`consultation_fee`、`created_at`

约束迁移：
- CHECK(experience_years/rating) 转应用层。

---

### 2. chat_messages（聊天记录集合）

```javascript
{
  _id: ObjectId,
  user_id: String,
  advisor_id: String,
  sender_type: String,           // enum: user/advisor/system
  message_type: String,          // enum: text/image/file/system
  content: String | null,
  image_url: String | null,
  file_url: String | null,
  file_name: String | null,
  file_size: Number | null,
  is_read: Boolean,
  read_at: Date | null,
  is_deleted: Boolean,
  deleted_at: Date | null,
  created_at: Date,
  updated_at: Date
}
```

索引：
- 复合：`(user_id, advisor_id, created_at)`、`(advisor_id, user_id, created_at)`
- 单列：`sender_type`、`message_type`、`is_read`、`is_deleted`

---

### 3. review_records（审核记录集合）

```javascript
{
  _id: ObjectId,
  plan_id: String,               // 引用 ai_plans._id
  user_id: String,               // 引用 users._id
  advisor_id: String,            // 引用 advisors._id
  review_type: String,           // enum: plan_review/chat_review
  review_status: String,         // enum: pending/approved/rejected/modified
  review_comment: String | null,
  modification_suggestions: Any | null,
  review_fee: Number,            // 分
  fee_status: String,            // enum: pending/paid/refunded
  review_time: Number | null,    // minutes
  created_at: Date,
  reviewed_at: Date | null,
  updated_at: Date
}
```

索引：
- 复合：`(plan_id, review_status)`、`(advisor_id, review_status)`、`(user_id, review_status)`
- 单列：`review_type`、`review_status`、`fee_status`、`created_at`

---

### 4. payment_records（支付记录集合）

```javascript
{
  _id: ObjectId,
  user_id: String,
  order_id: String,              // 唯一
  transaction_id: String | null, // 唯一
  payment_type: String,          // enum: membership/review/service
  amount: Number,                // 分 > 0
  currency: String,              // default CNY
  status: String,                // enum: pending/success/failed/refunded
  payment_method: String,        // e.g. wechat_pay
  description: String | null,
  related_id: String | null,     // 关联实体（如 ai_plans._id 或 membership_records._id）
  refund_amount: Number,         // 分 >= 0 <= amount
  refund_reason: String | null,
  refund_time: Date | null,
  created_at: Date,
  paid_at: Date | null,
  updated_at: Date
}
```

索引：
- 唯一：`order_id`、`transaction_id`
- 复合：`(user_id, status)`、`(payment_type, status)`
- 单列：`status`、`created_at`

---

### 5. notifications（通知集合）

```javascript
{
  _id: ObjectId,
  user_id: String,
  advisor_id: String | null,
  notification_type: String,     // enum: system/reminder/advisor_message/achievement/alert
  title: String,
  content: String,
  image_url: String | null,
  action_url: String | null,
  action_type: String | null,    // navigate/open_url/open_modal
  priority: String,              // enum: low/normal/high/urgent
  is_read: Boolean,
  read_at: Date | null,
  is_sent: Boolean,
  sent_at: Date | null,
  scheduled_at: Date | null,
  expire_at: Date | null,
  created_at: Date,
  updated_at: Date
}
```

索引：
- 单列：`user_id`、`advisor_id`、`notification_type`、`priority`、`is_read`、`is_sent`、`scheduled_at`、`expire_at`、`created_at`

---

## P2 - 功能集合

### 1. food_database（食物数据库）

```javascript
{
  _id: ObjectId,
  food_name: String,                 // 唯一
  food_category: String,             // enum: grains/vegetables/fruits/meat/dairy/nuts/seafood/others
  food_subcategory: String | null,
  calories_per_100g: Number | null,
  protein_per_100g: Number | null,
  fat_per_100g: Number | null,
  carbs_per_100g: Number | null,
  fiber_per_100g: Number | null,
  sugar_per_100g: Number | null,
  sodium_per_100g: Number | null,
  vitamin_a: Number | null,
  vitamin_c: Number | null,
  vitamin_d: Number | null,
  vitamin_e: Number | null,
  calcium: Number | null,
  iron: Number | null,
  zinc: Number | null,
  common_units: [
    { unit_name: String, weight: Number, calories: Number, protein: Number, fat: Number, carbs: Number }
  ] | null,
  image_url: String | null,
  description: String | null,
  tags: [String] | null,
  is_active: Boolean,
  search_keywords: [String] | null,
  created_at: Date,
  updated_at: Date
}
```

索引：
- 唯一：`food_name`
- 普通：`food_category`、`food_subcategory`、`is_active`、`created_at`
- 文本索引建议：`food_name` + `search_keywords`

约束迁移：
- CHECK(各 per_100g 数值>=0) 转应用层。

---

### 2. exercise_database（运动数据库）

```javascript
{
  _id: ObjectId,
  exercise_name: String,            // 唯一
  exercise_category: String,        // enum: cardio/strength/flexibility/balance/sports
  exercise_subcategory: String | null,
  calories_per_hour: Number | null,
  intensity_level: String | null,   // enum: low/medium/high
  equipment_needed: [String] | null,
  target_muscles: [String] | null,
  difficulty_level: String | null,  // enum: beginner/intermediate/advanced
  duration_range: { min: Number, max: Number, recommended: Number } | null,
  instructions: String | null,
  precautions: [String] | null,
  benefits: [String] | null,
  video_url: String | null,
  image_url: String | null,
  tags: [String] | null,
  is_active: Boolean,
  search_keywords: [String] | null,
  created_at: Date,
  updated_at: Date
}
```

索引：
- 唯一：`exercise_name`
- 普通：`exercise_category`、`intensity_level`、`difficulty_level`、`is_active`、`created_at`
- 文本索引建议：`exercise_name` + `search_keywords`

---

### 3. user_goals（用户目标）

```javascript
{
  _id: ObjectId,
  user_id: String,
  goal_type: String,               // enum: weight_loss/weight_gain/maintenance/muscle_gain
  goal_name: String,
  target_weight: Number | null,
  current_weight: Number | null,
  start_weight: Number | null,
  target_date: Date | null,
  weekly_loss_target: Number | null,
  daily_calorie_target: Number | null,
  daily_protein_target: Number | null,
  daily_fat_target: Number | null,
  daily_carbs_target: Number | null,
  exercise_minutes_target: Number | null,
  water_intake_target: Number | null,
  steps_target: Number | null,
  status: String,                  // enum: active/completed/abandoned/paused
  progress_percentage: Number,     // 0..100
  start_date: Date | null,
  end_date: Date | null,
  notes: String | null,
  created_at: Date,
  updated_at: Date
}
```

索引：
- 复合：`(user_id, status)`、`(user_id, goal_type)`
- 单列：`goal_type`、`status`、`target_date`、`created_at`

---

### 4. user_statistics（用户统计）

```javascript
{
  _id: ObjectId,
  user_id: String,
  stat_date: Date,                   // 每日一条
  total_calories: Number,
  total_protein: Number,
  total_fat: Number,
  total_carbs: Number,
  total_fiber: Number,
  total_sugar: Number,
  total_sodium: Number,
  total_exercise_minutes: Number,
  total_calories_burned: Number,
  weight_change: Number,
  steps_count: Number,
  water_intake: Number,
  sleep_hours: Number,
  meal_count: Number,
  exercise_count: Number,
  weight_record_count: Number,
  ai_chat_count: Number,
  goal_progress: {                  // 可选汇总结构
    weight_progress: Number | null,
    calorie_progress: Number | null,
    exercise_progress: Number | null,
    water_progress: Number | null
  } | null,
  created_at: Date,
  updated_at: Date
}
```

索引：
- 唯一：`(user_id, stat_date)`
- 复合：`(user_id, stat_date DESC)`
- 单列：`stat_date`、`total_calories`、`total_exercise_minutes`

---

### 5. user_feedback（用户反馈）

```javascript
{
  _id: ObjectId,
  user_id: String,
  feedback_type: String,           // enum: bug/feature/suggestion/complaint/praise
  category: String | null,         // enum: app/ai/advisor/payment/other
  title: String,
  content: String,
  rating: Number | null,           // 1..5
  images: [String] | null,
  contact_info: Any | null,
  priority: String,                // enum: low/normal/high/urgent
  status: String,                  // enum: pending/processing/resolved/closed
  assigned_to: String | null,      // 处理人ID（内部）
  admin_reply: String | null,
  reply_at: Date | null,
  resolved_at: Date | null,
  tags: [String] | null,
  created_at: Date,
  updated_at: Date
}
```

索引：
- 单列：`user_id`、`feedback_type`、`category`、`status`、`priority`、`assigned_to`、`created_at`

---

## P3 - 高级集合

### 1. membership_records（会员记录）

```javascript
{
  _id: ObjectId,
  user_id: String,
  old_level: String | null,        // enum: free/standard/premium
  new_level: String,               // enum: free/standard/premium
  change_type: String,             // enum: upgrade/downgrade/renewal/expire
  payment_id: String | null,       // 引用 payment_records._id
  amount: Number | null,
  effective_date: Date,
  expire_date: Date | null,
  created_at: Date
}
```

索引：
- 复合：`(user_id, created_at)`
- 单列：`change_type`、`effective_date`

---

### 2. advisor_income_records（顾问收入记录）

```javascript
{
  _id: ObjectId,
  advisor_id: String,
  income_type: String,             // enum: consultation/review/commission
  amount: Number,                  // >= 0
  related_id: String | null,
  related_type: String | null,
  description: String | null,
  status: String,                  // enum: pending/paid/cancelled
  paid_at: Date | null,
  created_at: Date
}
```

索引：
- 复合：`(advisor_id, created_at)`
- 单列：`income_type`、`status`

---

### 3. audit_logs（审计日志）

```javascript
{
  _id: ObjectId,
  user_id: String | null,
  advisor_id: String | null,
  action: String,                  // enum: create/update/delete/login/logout
  resource_type: String,
  resource_id: String,
  old_value: Any | null,
  new_value: Any | null,
  changed_fields: [String] | null,
  ip_address: String | null,
  user_agent: String | null,
  session_id: String | null,
  request_id: String | null,
  execution_time: Number | null,   // ms
  status: String,                  // enum: success/failed
  error_message: String | null,
  created_at: Date
}
```

索引：
- 复合：`(user_id, created_at)`、`(advisor_id, created_at)`、`(resource_type, resource_id)`
- 单列：`action`、`status`、`ip_address`、`created_at`

---

### 4. operation_logs（操作日志）

```javascript
{
  _id: ObjectId,
  user_id: String | null,
  module: String,
  action: String,
  description: String | null,
  request_data: Any | null,
  response_data: Any | null,
  ip_address: String | null,
  user_agent: String | null,
  execution_time: Number | null,   // ms
  status: String,                  // enum: success/failed/error
  error_code: String | null,
  error_message: String | null,
  created_at: Date
}
```

索引：
- 单列：`user_id`、`module`、`action`、`status`、`created_at`

---

## 兼容性与迁移说明

- 字段命名：统一蛇形命名，与原 MySQL 字段一致；兼容已有小程序/云函数中曾使用的驼峰字段，可在读写层做映射（如 `member_level` ↔ `memberLevel`）。
- 外键关系：通过 `*_id` 字段引用目标集合 `_id`，不强制外键约束，由应用层保证一致性。
- CHECK 约束：全部迁移至应用层/云函数校验，或采用 CloudBase 的数据库规则与参数校验中间层。
- 触发器：
  - BMI 计算：在新增/更新 `users`、`weight_records` 时计算 `bmi` 并写入。
- 视图：
  - `v_user_basic_info`、`v_user_weight_trend`、`v_user_stats_overview` 迁移为聚合管道/预计算集合（例如 `user_statistics` 每日汇总）。
- 存储过程：
  - `sp_get_user_stats`、`sp_get_user_recent_records` 迁移为云函数，内部执行聚合查询或多次查询后合并返回。
- 初始数据：
  - `system_configs` 可按“初始配置建议”预置；业务运行时可在控制台或管理后台修改。

---

## 安全与权限建议

- 规则：
  - 多数写操作在云函数执行，前端仅最小化读权限。
  - 以 `openid` → `users._id` 的鉴权映射来限制用户仅访问自己的数据文档（如 `user_id == auth.uid`）。
- 敏感字段：
  - `real_name`、`phone`、`id_card` 等建议加密存储；日志与审计中避免输出全量敏感信息。

---

## 索引与性能建议

- 复合索引优先覆盖主要查询路径（时间范围 + 用户/顾问维度）。
- 大集合（如 `chat_messages`、`notifications`）建议分桶或加时间维度索引。
- 文本搜索可在 `food_database`、`exercise_database` 上建立文本索引（或借助搜索服务）。

---

## 与原 MySQL 设计的一致性核对清单

- 覆盖的表（全部）：
  - P0：`users`、`weight_records`、`diet_records`、`exercise_records`、`ai_plans`、`system_configs`
  - P1：`advisors`、`chat_messages`、`review_records`、`payment_records`、`notifications`
  - P2：`food_database`、`exercise_database`、`user_goals`、`user_statistics`、`user_feedback`
  - P3：`membership_records`、`advisor_income_records`、`audit_logs`、`operation_logs`
- 字段与业务含义：保留并映射为文档结构；所有枚举/约束在应用层保证。
- 索引：按 MySQL 复合索引与单列索引意图等价迁移。
- 触发器/视图/存储过程：提供迁移策略，确保功能不丢失。

---

## 附：集合创建与示例索引（云函数伪代码）

```javascript
// 以 initDatabase 云函数为例，按需插入示例文档触发集合创建，并创建索引
const db = cloud.database()

async function createIndexes() {
  await db.collection('users').createIndex({ openid: 1 }, { unique: true })
  await db.collection('users').createIndex({ advisor_id: 1 })
  await db.collection('users').createIndex({ member_level: 1 })
  await db.collection('users').createIndex({ status: 1 })
  await db.collection('users').createIndex({ created_at: -1 })

  await db.collection('weight_records').createIndex({ user_id: 1, record_date: -1 })
  await db.collection('weight_records').createIndex({ user_id: 1, created_at: -1 })
  await db.collection('weight_records').createIndex({ record_type: 1 })

  await db.collection('diet_records').createIndex({ user_id: 1, record_date: -1 })
  await db.collection('diet_records').createIndex({ user_id: 1, meal_type: 1, record_date: -1 })
  await db.collection('diet_records').createIndex({ meal_type: 1 })
  await db.collection('diet_records').createIndex({ record_type: 1 })

  await db.collection('exercise_records').createIndex({ user_id: 1, record_date: -1 })
  await db.collection('exercise_records').createIndex({ user_id: 1, exercise_type: 1 })
  await db.collection('exercise_records').createIndex({ exercise_type: 1 })
  await db.collection('exercise_records').createIndex({ intensity: 1 })
  await db.collection('exercise_records').createIndex({ record_type: 1 })

  await db.collection('ai_plans').createIndex({ user_id: 1, status: 1 })
  await db.collection('ai_plans').createIndex({ advisor_id: 1, status: 1 })
  await db.collection('ai_plans').createIndex({ plan_type: 1 })
  await db.collection('ai_plans').createIndex({ status: 1 })
  await db.collection('ai_plans').createIndex({ execution_status: 1 })
  await db.collection('ai_plans').createIndex({ created_at: -1 })

  await db.collection('system_configs').createIndex({ config_key: 1 }, { unique: true })
  await db.collection('system_configs').createIndex({ category: 1 })
  await db.collection('system_configs').createIndex({ is_active: 1 })

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

  await db.collection('food_database').createIndex({ food_name: 1 }, { unique: true })
  await db.collection('food_database').createIndex({ food_category: 1 })
  await db.collection('food_database').createIndex({ food_subcategory: 1 })
  await db.collection('food_database').createIndex({ is_active: 1 })
  await db.collection('food_database').createIndex({ created_at: -1 })
  // 文本索引：db.command.createIndex({ food_name: 'text', search_keywords: 'text' })

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
```

---

以上设计完整覆盖原 MySQL 设计（含 P0/P1/P2/P3 与补充脚本）的字段、索引与业务含义，并给出文档型数据库的落地方案与等价实现路径。
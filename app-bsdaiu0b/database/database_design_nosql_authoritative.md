# 体重管理数字医生小程序 - NoSQL 数据库设计（权威版）

文档版本：v1.0  
创建日期：2025-08-09  
数据库：腾讯云开发（CloudBase）文档型数据库（MongoDB 兼容）

本文件为唯一权威版本，整合了完整的数据模型定义、索引策略、分表与数据生命周期、缓存、权限规则、枚举字典、聚合与运维指南。可直接作为落地实现与审查依据。

---

## 0. 设计约定
- 命名：字段统一蛇形（snake_case），集合名小写复数（如 `weight_records`）。
- 主键/引用：`_id: ObjectId`；引用以 `*_id: String` 存储目标 `_id` 字符串。
- 时间/数值：时间统一 `Date`；数值统一 `Number`。
- 枚举：以 `String` 存储，统一在“全局枚举字典”维护；应用/云函数校验。
- 约束迁移：CHECK/触发器/视图/存储过程 → 应用层校验、云函数逻辑、聚合管道/预计算、定时任务。
- 安全：前端最小化权限；写入与敏感读取在云函数执行；结合规则限制用户仅访问自身数据。

---

## 1. 数据模型（P0/P1/P2/P3 全覆盖）

### 1.1 P0 - 核心集合

#### users（用户）
```javascript
{
  _id: ObjectId,
  openid: String,                 // 唯一
  unionid: String | null,
  nickname: String | null,
  real_name: String | null,       // 敏感，建议加密
  avatar: String | null,
  phone: String | null,           // 敏感，建议加密
  email: String | null,
  gender: String | null,          // enum: male/female
  age: Number | null,             // 1..120
  birth_date: Date | null,
  height: Number | null,          // cm: 50..300
  current_weight: Number | null,  // kg: 10..500
  target_weight: Number | null,   // kg: 10..500
  bmi: Number | null,
  occupation: String | null,
  activity_level: String | null,  // sedentary/light/moderate/active
  health_goals: [String] | null,
  medical_history: [String] | null,
  dietary_restrictions: [String] | null,
  allergies: [String] | null,
  preferred_language: String,     // zh-CN
  timezone: String,               // Asia/Shanghai
  advisor_id: String | null,      // advisors._id
  member_level: String,           // free/standard/premium
  member_expire: Date | null,
  status: String,                 // active/inactive/blocked/pending
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
  login_count: Number,
  created_at: Date,
  updated_at: Date
}
```
索引：唯一 `openid`；普通 `advisor_id`、`member_level`、`status`、`created_at`

#### weight_records（体重记录）
```javascript
{
  _id: ObjectId,
  user_id: String,
  weight: Number,                 // 10..500
  bmi: Number | null,
  record_date: Date,              // 日期
  record_time: Date,              // 时间
  record_type: String,            // manual/photo/auto
  photo_url: String | null,
  note: String | null,
  device_info: { platform: String, version: String, model: String } | null,
  location: { latitude: Number, longitude: Number, address: String } | null,
  created_at: Date,
  updated_at: Date
}
```
索引：复合 `(user_id, record_date)`、`(user_id, created_at)`；单列 `record_type`

#### diet_records（饮食记录）
```javascript
{
  _id: ObjectId,
  user_id: String,
  food_name: String,
  food_category: String | null,
  quantity: Number,               // > 0
  unit: String | null,
  calories: Number | null,
  protein: Number | null,
  fat: Number | null,
  carbs: Number | null,
  fiber: Number | null,
  sugar: Number | null,
  sodium: Number | null,
  photo_url: String | null,
  meal_type: String | null,       // breakfast/lunch/dinner/snack
  record_date: Date,
  record_time: Date,
  record_type: String,            // manual/photo/ai
  ai_confidence: Number | null,   // 0..1
  note: String | null,
  created_at: Date,
  updated_at: Date
}
```
索引：复合 `(user_id, record_date)`、`(user_id, meal_type, record_date)`；单列 `meal_type`、`record_type`

#### exercise_records（运动记录）
```javascript
{
  _id: ObjectId,
  user_id: String,
  exercise_type: String,          // cardio/strength/flexibility
  exercise_name: String,
  duration: Number,               // 1..480
  intensity: String,              // low/medium/high
  calories_burned: Number | null,
  distance: Number | null,
  steps: Number | null,
  heart_rate_avg: Number | null,
  heart_rate_max: Number | null,
  heart_rate_min: Number | null,
  photo_url: String | null,
  record_date: Date,
  record_time: Date,
  record_type: String,            // manual/photo/auto
  device_info: { platform: String, version: String, model: String } | null,
  location: { latitude: Number, longitude: Number, address: String } | null,
  note: String | null,
  created_at: Date,
  updated_at: Date
}
```
索引：复合 `(user_id, record_date)`、`(user_id, exercise_type)`；单列 `exercise_type`、`intensity`、`record_type`

#### ai_plans（AI 方案）
```javascript
{
  _id: ObjectId,
  user_id: String,
  advisor_id: String | null,
  plan_name: String,
  plan_type: String,              // gentle/standard/aggressive
  target_weight: Number | null,
  duration: Number | null,
  expected_loss: Number | null,
  daily_calories: Number | null,
  diet_plan: { meal_plans: [{ meal_type: String, foods: [{ name: String, quantity: String, calories: Number }] }] } | null,
  exercise_plan: { weekly_schedule: [{ day: String, exercises: [{ name: String, duration: Number, intensity: String }] }] } | null,
  lifestyle_plan: { suggestions: [String], habits: [String] } | null,
  status: String,                 // draft/pending/reviewed/approved/rejected
  review_comment: String | null,
  review_fee: Number,
  reviewed_at: Date | null,
  reviewed_by: String | null,
  execution_status: String,       // not_started/in_progress/completed/paused
  start_date: Date | null,
  end_date: Date | null,
  created_at: Date,
  updated_at: Date
}
```
索引：复合 `(user_id, status)`、`(advisor_id, status)`；单列 `plan_type`、`status`、`execution_status`、`created_at`

#### system_configs（系统配置）
```javascript
{
  _id: ObjectId,
  config_key: String,             // 唯一
  config_value: Any,
  config_type: String,            // string/number/boolean/object/array
  description: String | null,
  category: String | null,        // ai/review/record/payment/system/limit
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
}
```
索引：唯一 `config_key`；普通 `category`、`is_active`

初始建议（部分）：ai_daily_limit_free/standard/premium、review_timeout_hours、max_*_records_per_day、membership_upgrade_fee、review_fee、advisor_commission_rate、data_retention_days、max_file_size_mb、session_timeout_minutes、default_ai_model、max_chat_history

### 1.2 P1 - 重要集合

#### advisors（健康顾问）
```javascript
{
  _id: ObjectId,
  name: String,
  avatar: String | null,
  phone: String,
  email: String | null,
  id_card: String | null,
  license_number: String | null,
  specialty: [String] | null,
  specialization: [String] | null,
  qualification: String | null,
  education: String | null,
  work_experience: String | null,
  hospital: String | null,
  description: String | null,
  experience_years: Number | null,
  consultation_fee: Number,
  user_count: Number,
  rating: Number | null,
  total_income: Number,
  monthly_income: Number,
  status: String,
  verification_status: String,
  is_online: Boolean,
  max_users: Number,
  max_daily_consultations: Number,
  response_time: Number | null,
  available_time: Any | null,
  service_areas: [String] | null,
  languages: [String] | null,
  certificates: [Any] | null,
  created_at: Date,
  updated_at: Date
}
```
索引：唯一 `phone`、`email`、`id_card`、`license_number`；普通 `status`、`verification_status`、`rating`、`user_count`、`is_online`、`consultation_fee`、`created_at`

#### chat_messages（聊天记录）
```javascript
{
  _id: ObjectId,
  user_id: String,
  advisor_id: String,
  sender_type: String,            // user/advisor/system
  message_type: String,           // text/image/file/system
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
索引：复合 `(user_id, advisor_id, created_at)`、`(advisor_id, user_id, created_at)`；单列 `sender_type`、`message_type`、`is_read`、`is_deleted`

#### review_records（审核记录）
```javascript
{
  _id: ObjectId,
  plan_id: String,
  user_id: String,
  advisor_id: String,
  review_type: String,            // plan_review/chat_review
  review_status: String,          // pending/approved/rejected/modified
  review_comment: String | null,
  modification_suggestions: Any | null,
  review_fee: Number,
  fee_status: String,             // pending/paid/refunded
  review_time: Number | null,
  created_at: Date,
  reviewed_at: Date | null,
  updated_at: Date
}
```
索引：复合 `(plan_id, review_status)`、`(advisor_id, review_status)`、`(user_id, review_status)`；单列 `review_type`、`fee_status`、`created_at`

#### payment_records（支付记录）
```javascript
{
  _id: ObjectId,
  user_id: String,
  order_id: String,               // 唯一
  transaction_id: String | null,  // 唯一
  payment_type: String,
  amount: Number,
  currency: String,               // CNY
  status: String,                 // pending/success/failed/refunded
  payment_method: String,         // wechat_pay
  description: String | null,
  related_id: String | null,
  refund_amount: Number,
  refund_reason: String | null,
  refund_time: Date | null,
  created_at: Date,
  paid_at: Date | null,
  updated_at: Date
}
```
索引：唯一 `order_id`、`transaction_id`；复合 `(user_id, status)`、`(payment_type, status)`；单列 `status`、`created_at`

#### notifications（通知）
```javascript
{
  _id: ObjectId,
  user_id: String,
  advisor_id: String | null,
  notification_type: String,      // system/reminder/advisor_message/achievement/alert
  title: String,
  content: String,
  image_url: String | null,
  action_url: String | null,
  action_type: String | null,     // navigate/open_url/open_modal
  priority: String,               // low/normal/high/urgent
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
索引：`user_id`、`advisor_id`、`notification_type`、`priority`、`is_read`、`is_sent`、`scheduled_at`、`expire_at`、`created_at`

### 1.3 P2 - 功能集合

#### food_database（食物库）
```javascript
{
  _id: ObjectId,
  food_name: String,              // 唯一
  food_category: String,          // grains/vegetables/fruits/meat/dairy/nuts/seafood/others
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
  common_units: [ { unit_name: String, weight: Number, calories: Number, protein: Number, fat: Number, carbs: Number } ] | null,
  image_url: String | null,
  description: String | null,
  tags: [String] | null,
  is_active: Boolean,
  search_keywords: [String] | null,
  created_at: Date,
  updated_at: Date
}
```
索引：唯一 `food_name`；普通 `food_category`、`food_subcategory`、`is_active`、`created_at`；文本索引建议 `food_name`+`search_keywords`

#### exercise_database（运动库）
```javascript
{
  _id: ObjectId,
  exercise_name: String,          // 唯一
  exercise_category: String,      // cardio/strength/flexibility/balance/sports
  exercise_subcategory: String | null,
  calories_per_hour: Number | null,
  intensity_level: String | null, // low/medium/high
  equipment_needed: [String] | null,
  target_muscles: [String] | null,
  difficulty_level: String | null,// beginner/intermediate/advanced
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
索引：唯一 `exercise_name`；普通 `exercise_category`、`intensity_level`、`difficulty_level`、`is_active`、`created_at`；文本索引建议 `exercise_name`+`search_keywords`

#### user_goals（目标）
```javascript
{
  _id: ObjectId,
  user_id: String,
  goal_type: String,              // weight_loss/weight_gain/maintenance/muscle_gain
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
  status: String,                 // active/completed/abandoned/paused
  progress_percentage: Number,    // 0..100
  start_date: Date | null,
  end_date: Date | null,
  notes: String | null,
  created_at: Date,
  updated_at: Date
}
```
索引：复合 `(user_id, status)`、`(user_id, goal_type)`；单列 `goal_type`、`status`、`target_date`、`created_at`

#### user_statistics（统计）
```javascript
{
  _id: ObjectId,
  user_id: String,
  stat_date: Date,                // 每日一条
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
  goal_progress: { weight_progress: Number | null, calorie_progress: Number | null, exercise_progress: Number | null, water_progress: Number | null } | null,
  created_at: Date,
  updated_at: Date
}
```
索引：唯一 `(user_id, stat_date)`；复合 `(user_id, stat_date DESC)`；单列 `stat_date`、`total_calories`、`total_exercise_minutes`

#### user_feedback（反馈）
```javascript
{
  _id: ObjectId,
  user_id: String,
  feedback_type: String,          // bug/feature/suggestion/complaint/praise
  category: String | null,        // app/ai/advisor/payment/other
  title: String,
  content: String,
  rating: Number | null,          // 1..5
  images: [String] | null,
  contact_info: Any | null,
  priority: String,               // low/normal/high/urgent
  status: String,                 // pending/processing/resolved/closed
  assigned_to: String | null,
  admin_reply: String | null,
  reply_at: Date | null,
  resolved_at: Date | null,
  tags: [String] | null,
  created_at: Date,
  updated_at: Date
}
```
索引：`user_id`、`feedback_type`、`category`、`status`、`priority`、`assigned_to`、`created_at`

### 1.4 P3 - 高级集合

#### membership_records（会员记录）
```javascript
{
  _id: ObjectId,
  user_id: String,
  old_level: String | null,       // free/standard/premium
  new_level: String,              // free/standard/premium
  change_type: String,            // upgrade/downgrade/renewal/expire
  payment_id: String | null,      // payment_records._id
  amount: Number | null,
  effective_date: Date,
  expire_date: Date | null,
  created_at: Date
}
```
索引：复合 `(user_id, created_at)`；单列 `change_type`、`effective_date`

#### advisor_income_records（顾问收入）
```javascript
{
  _id: ObjectId,
  advisor_id: String,
  income_type: String,            // consultation/review/commission
  amount: Number,
  related_id: String | null,
  related_type: String | null,
  description: String | null,
  status: String,                 // pending/paid/cancelled
  paid_at: Date | null,
  created_at: Date
}
```
索引：复合 `(advisor_id, created_at)`；单列 `income_type`、`status`

#### audit_logs（审计日志）
```javascript
{
  _id: ObjectId,
  user_id: String | null,
  advisor_id: String | null,
  action: String,                 // create/update/delete/login/logout
  resource_type: String,
  resource_id: String,
  old_value: Any | null,
  new_value: Any | null,
  changed_fields: [String] | null,
  ip_address: String | null,
  user_agent: String | null,
  session_id: String | null,
  request_id: String | null,
  execution_time: Number | null,  // ms
  status: String,                 // success/failed
  error_message: String | null,
  created_at: Date
}
```
索引：复合 `(user_id, created_at)`、`(advisor_id, created_at)`、`(resource_type, resource_id)`；单列 `action`、`status`、`ip_address`、`created_at`

#### operation_logs（操作日志）
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
  execution_time: Number | null,
  status: String,                 // success/failed/error
  error_code: String | null,
  error_message: String | null,
  created_at: Date
}
```
索引：`user_id`、`module`、`action`、`status`、`created_at`

---

## 2. 索引策略（摘要）
见各集合“索引”小节。文本搜索建议在 `food_database`、`exercise_database` 上建立文本索引（名称+关键词）。

---

## 3. 分表与数据生命周期
- 分表对象：`weight_records`、`diet_records`、`exercise_records`、`chat_messages`、`user_statistics`、`operation_logs`、`audit_logs`
- 命名：`<collection>_YYYYMM`
- 路由：写入按时间决定分表；读取按时间拆分并聚合。
- 保留期：`system_configs.data_retention_days`；定时云函数清理/归档（或 TTL）。

---

## 4. 缓存策略
- 键：`users:{userId}`、`goals:{userId}`、`food:{foodId}`、`exercise:{exerciseId}`
- TTL：用户 10m、目标 5m、食物/运动 24h；变更后刷新/延迟双删、预热、空值短 TTL。

---

## 5. 权限与规则（示例）
前端仅最小读取，写入走云函数。规则片段（示意）：
```json
{
  "users": { "read": "auth != null && doc._id != null", "write": false },
  "weight_records": { "read": "auth != null && doc.user_id == auth.uid", "write": false },
  "diet_records": { "read": "auth != null && doc.user_id == auth.uid", "write": false },
  "exercise_records": { "read": "auth != null && doc.user_id == auth.uid", "write": false },
  "ai_plans": { "read": "auth != null && doc.user_id == auth.uid", "write": false },
  "system_configs": { "read": true, "write": false }
}
```

---

## 6. 全局枚举字典
gender、activity_level、member_level、user_status、record_type、meal_type、diet_record_type、exercise_type、intensity、plan_type、plan_status、execution_status、sender_type、message_type、review_type、review_status、fee_status、payment_type、payment_status、notification_type、priority、feedback_type、feedback_status、difficulty_level（详见上文注释）。

---

## 7. 聚合与预计算
- 每日汇总写入 `user_statistics`（云函数定时执行）。
- 最近记录汇总（合并体重/饮食/运动，排序分页）。
- 文本搜索（食物/运动）使用文本索引。

---

## 8. 校验与写入
- 应用层严格校验范围与枚举。
- 写入/更新时计算 BMI。
- 支付/审核场景确保幂等唯一键（`order_id`、`transaction_id`）。

---

## 9. 初始化与运维
- 预置关键 `system_configs`；
- 创建关键索引；
- 定时任务：每日统计、过期清理/归档；
- 监控：写入失败与延迟告警；审计敏感操作。

---

## 10. 一致性核对
- 集合覆盖：P0/P1/P2/P3 与补充脚本全部表；
- 字段未删减；
- 约束等价迁移；
- 提供分表/索引/缓存/归档/权限的治理方案。

---

本权威版文档可直接用于 CloudBase 集合落地与代码实现对照。
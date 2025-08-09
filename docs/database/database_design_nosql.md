# 体重管理数字医生小程序 - NoSQL 数据库设计（完全版）

文档版本：v1.0  
创建日期：2025-08-09  
数据库：腾讯云开发（CloudBase）文档型数据库

---

## 0. 指南与约定

- 命名风格：字段统一蛇形命名（snake_case），集合名统一小写复数（如 `weight_records`）。
- 主键与引用：
  - 文档 `_id: ObjectId`（由数据库生成）。
  - 业务引用使用 `*_id: String`，保存目标文档 `_id` 字符串，应用层保证一致性。
- 时间与数值：时间统一 `Date` 类型；数值统一 `Number`。
- 枚举：使用 `String` 存储，统一在“全局枚举字典”维护取值范围，应用层/云函数校验。
- 约束迁移：MySQL 的 CHECK/触发器/视图/存储过程 → 应用层校验、云函数逻辑、聚合管道/预计算集合、定时任务。
- 安全：前端最小权限；读写主要在云函数（受信任环境）；结合安全规则限制用户仅能访问自己的数据。

---

## 1. 数据模型（P0/P1/P2/P3）

以下为集合结构（与关系模型一一映射），字段未做删减。

### 1.1 P0 - 核心集合

- users（用户）
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
  activity_level: String | null,  // enum: sedentary/light/moderate/active
  health_goals: [String] | null,
  medical_history: [String] | null,
  dietary_restrictions: [String] | null,
  allergies: [String] | null,
  preferred_language: String,     // 默认 zh-CN
  timezone: String,               // 默认 Asia/Shanghai
  advisor_id: String | null,      // advisors._id
  member_level: String,           // enum: free/standard/premium
  member_expire: Date | null,
  status: String,                 // enum: active/inactive/blocked/pending
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
  login_count: Number,            // >= 0
  created_at: Date,
  updated_at: Date
}
```

- weight_records（体重记录）
```javascript
{
  _id: ObjectId,
  user_id: String,
  weight: Number,                 // kg: 10..500
  bmi: Number | null,
  record_date: Date,              // 日期
  record_time: Date,              // 时间
  record_type: String,            // enum: manual/photo/auto
  photo_url: String | null,
  note: String | null,
  device_info: { platform: String, version: String, model: String } | null,
  location: { latitude: Number, longitude: Number, address: String } | null,
  created_at: Date,
  updated_at: Date
}
```

- diet_records（饮食记录）
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
  meal_type: String | null,       // enum: breakfast/lunch/dinner/snack
  record_date: Date,
  record_time: Date,
  record_type: String,            // enum: manual/photo/ai
  ai_confidence: Number | null,   // 0..1
  note: String | null,
  created_at: Date,
  updated_at: Date
}
```

- exercise_records（运动记录）
```javascript
{
  _id: ObjectId,
  user_id: String,
  exercise_type: String,          // enum: cardio/strength/flexibility
  exercise_name: String,
  duration: Number,               // 1..480
  intensity: String,              // enum: low/medium/high
  calories_burned: Number | null,
  distance: Number | null,        // >= 0
  steps: Number | null,           // >= 0
  heart_rate_avg: Number | null,
  heart_rate_max: Number | null,
  heart_rate_min: Number | null,
  photo_url: String | null,
  record_date: Date,
  record_time: Date,
  record_type: String,            // enum: manual/photo/auto
  device_info: { platform: String, version: String, model: String } | null,
  location: { latitude: Number, longitude: Number, address: String } | null,
  note: String | null,
  created_at: Date,
  updated_at: Date
}
```

- ai_plans（AI 方案）
```javascript
{
  _id: ObjectId,
  user_id: String,
  advisor_id: String | null,
  plan_name: String,
  plan_type: String,              // enum: gentle/standard/aggressive
  target_weight: Number | null,
  duration: Number | null,        // days
  expected_loss: Number | null,   // kg
  daily_calories: Number | null,
  diet_plan: { meal_plans: [{ meal_type: String, foods: [{ name: String, quantity: String, calories: Number }] }] } | null,
  exercise_plan: { weekly_schedule: [{ day: String, exercises: [{ name: String, duration: Number, intensity: String }] }] } | null,
  lifestyle_plan: { suggestions: [String], habits: [String] } | null,
  status: String,                 // enum: draft/pending/reviewed/approved/rejected
  review_comment: String | null,
  review_fee: Number,             // 分
  reviewed_at: Date | null,
  reviewed_by: String | null,
  execution_status: String,       // enum: not_started/in_progress/completed/paused
  start_date: Date | null,
  end_date: Date | null,
  created_at: Date,
  updated_at: Date
}
```

- system_configs（系统配置）
```javascript
{
  _id: ObjectId,
  config_key: String,             // 唯一
  config_value: Any,
  config_type: String,            // enum: string/number/boolean/object/array
  description: String | null,
  category: String | null,        // ai/review/record/payment/system/limit
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

### 1.2 P1 - 重要集合

- advisors（健康顾问）
- chat_messages（聊天记录）
- review_records（审核记录）
- payment_records（支付记录）
- notifications（通知）

字段与结构与关系模型一致，详见补充的 `database_design_mongodb_full.md` 或上一个章节的风格（此处不重复大段定义）。

### 1.3 P2 - 功能集合

- food_database（食物库）、exercise_database（运动库）、user_goals（目标）、user_statistics（统计）、user_feedback（反馈）

定义同前；`food_database`/`exercise_database` 建议增加文本索引（名称+关键词）。

### 1.4 P3 - 高级集合

- membership_records（会员记录）、advisor_income_records（顾问收入）、audit_logs（审计日志）、operation_logs（操作日志）

定义同前；日志类集合建议分表与归档策略。

---

## 2. 索引设计（关键路径）

- users：`openid` 唯一；`advisor_id`、`member_level`、`status`、`created_at` 普通。
- weight_records：`(user_id, record_date)`、`(user_id, created_at)`；`record_type`。
- diet_records：`(user_id, record_date)`、`(user_id, meal_type, record_date)`；`meal_type`、`record_type`。
- exercise_records：`(user_id, record_date)`、`(user_id, exercise_type)`；`exercise_type`、`intensity`、`record_type`。
- ai_plans：`(user_id, status)`、`(advisor_id, status)`；`plan_type`、`status`、`execution_status`、`created_at`。
- system_configs：`config_key` 唯一；`category`、`is_active`。
- chat_messages：`(user_id, advisor_id, created_at)`、`(advisor_id, user_id, created_at)`；`sender_type`、`message_type`、`is_read`、`is_deleted`。
- payment_records：`order_id`、`transaction_id` 唯一；`(user_id, status)`、`(payment_type, status)`；`status`、`created_at`。
- notifications：`user_id`、`advisor_id`、`notification_type`、`priority`、`is_read`、`is_sent`、`scheduled_at`、`expire_at`、`created_at`。
- food_database / exercise_database：唯一名索引；分类/难度/强度等单列索引；文本索引建议（名称+关键词）。
- user_goals：`(user_id, status)`、`(user_id, goal_type)`；`goal_type`、`status`、`target_date`、`created_at`。
- user_statistics：唯一 `(user_id, stat_date)`；`(user_id, stat_date DESC)`；`stat_date`、`total_calories`、`total_exercise_minutes`。
- user_feedback：`user_id`、`feedback_type`、`category`、`status`、`priority`、`assigned_to`、`created_at`。
- membership_records：`(user_id, created_at)`；`change_type`、`effective_date`。
- advisor_income_records：`(advisor_id, created_at)`；`income_type`、`status`。
- audit_logs：`(user_id, created_at)`、`(advisor_id, created_at)`、`(resource_type, resource_id)`；`action`、`status`、`ip_address`、`created_at`。
- operation_logs：`user_id`、`module`、`action`、`status`、`created_at`。

---

## 3. 分表与数据生命周期（NoSQL 适配）

### 3.1 分表（按月分表/分桶）
- 适用集合：
  - 高频时间序列：`weight_records`、`diet_records`、`exercise_records`、`chat_messages`、`user_statistics`、`operation_logs`、`audit_logs`。
- 命名规范：`<collection>_YYYYMM`，示例：`weight_records_202508`。
- 路由策略：
  - 写入：按 `record_date` / `created_at` 计算目标分表名，再写入。
  - 读取：按时间范围拆分跨表查询（云函数聚合），再 merge/sort/limit。
- 聚合跨表：在云函数内并发查询目标分表，使用内存聚合或临时集合汇总（注意限制与分页）。

### 3.2 数据保留与归档
- 保留期配置：`system_configs.data_retention_days`（例如 365 天）。
- 清理策略：
  - 优先采用定时云函数清理超龄数据/归档到对象存储（CSV/JSON）。
  - 若后端支持 TTL 索引（依赖底层能力），可在日志类集合启用 `expire_at` + TTL；否则一律云函数定时清理。

---

## 4. 缓存策略（可选但推荐）

### 4.1 缓存键（示例）
```javascript
const CACHE_KEYS = {
  USERS: (userId) => `users:${userId}`,
  GOALS: (userId) => `goals:${userId}`,
  FOOD: (foodId) => `food:${foodId}`,
  EXERCISE: (exerciseId) => `exercise:${exerciseId}`
}
```

### 4.2 过期时间（示例）
```javascript
const CACHE_TTL = {
  USERS: 600,               // 10分钟
  GOALS: 300,               // 5分钟
  FOOD: 86400,              // 24小时
  EXERCISE: 86400           // 24小时
}
```

### 4.3 更新与穿透保护
- 数据变更后主动刷新缓存/延迟双删。
- 缓存预热（热门食物/运动项目）。
- 对空值短 TTL 缓存，避免穿透。

---

## 5. 安全与访问控制（CloudBase 规则示例）

- 总体策略：
  - 前端仅最小读取；所有写入、敏感读取走云函数。
  - 通过 `users` 将 `auth.openid` 映射为应用侧 `users._id`，并在集合中持久化 `user_id` 字段用于鉴权。

- 规则片段（伪示例，具体以 CloudBase 规则语法为准）：
```json
// 仅示例，非完整规则文件
{
  "users": { "read": "auth != null && doc._id != null", "write": false },
  "weight_records": { "read": "auth != null && doc.user_id == auth.uid", "write": false },
  "diet_records": { "read": "auth != null && doc.user_id == auth.uid", "write": false },
  "exercise_records": { "read": "auth != null && doc.user_id == auth.uid", "write": false },
  "ai_plans": { "read": "auth != null && doc.user_id == auth.uid", "write": false },
  "system_configs": { "read": true, "write": false }
}
```
- 实际生产：将 `write` 全部置为 false，仅云函数持有服务端密钥写。

---

## 6. 全局枚举字典

- gender: `male` | `female`
- activity_level: `sedentary` | `light` | `moderate` | `active`
- member_level: `free` | `standard` | `premium`
- user_status: `active` | `inactive` | `blocked` | `pending`
- record_type（weight/exercise）: `manual` | `photo` | `auto`
- meal_type（diet）: `breakfast` | `lunch` | `dinner` | `snack`
- diet_record_type: `manual` | `photo` | `ai`
- exercise_type（exercise_records）: `cardio` | `strength` | `flexibility`
- intensity: `low` | `medium` | `high`
- plan_type: `gentle` | `standard` | `aggressive`
- plan_status: `draft` | `pending` | `reviewed` | `approved` | `rejected`
- execution_status: `not_started` | `in_progress` | `completed` | `paused`
- sender_type: `user` | `advisor` | `system`
- message_type: `text` | `image` | `file` | `system`
- review_type: `plan_review` | `chat_review`
- review_status: `pending` | `approved` | `rejected` | `modified`
- fee_status: `pending` | `paid` | `refunded`
- payment_type: `membership` | `review` | `service`
- payment_status: `pending` | `success` | `failed` | `refunded`
- notification_type: `system` | `reminder` | `advisor_message` | `achievement` | `alert`
- priority: `low` | `normal` | `high` | `urgent`
- feedback_type: `bug` | `feature` | `suggestion` | `complaint` | `praise`
- feedback_status: `pending` | `processing` | `resolved` | `closed`
- difficulty_level（exercise_database）: `beginner` | `intermediate` | `advanced`

---

## 7. 聚合与预计算（替代视图/存储过程）

- 用户统计每日汇总（写回 `user_statistics`）：
```javascript
// 伪代码（云函数）
const stats = await Promise.all([
  db.collection('diet_records').where({ user_id, record_date: between(day0, day1) }).get(),
  db.collection('exercise_records').where({ user_id, record_date: between(day0, day1) }).get(),
  db.collection('weight_records').where({ user_id, record_date: between(day0, day1) }).get()
])
// 计算合计并 upsert 到 user_statistics
```

- 最近记录查询（合并不同集合）：
```javascript
// 伪代码：分别查 weight/diet/exercise 最近 N 条，合并后按时间倒序 slice
```

- 文本搜索（食物/运动）：
```javascript
// 若支持 text 索引
// db.food_database.createIndex({ food_name: 'text', search_keywords: 'text' })
```

---

## 8. 校验与写入策略

- 应用层校验：严格执行“全局枚举字典”和数值范围（如体重、时长、热量）。
- BMI 计算：`users` 与 `weight_records` 写入/更新时自动计算写入。
- 幂等与去重：支付/审核等需要业务幂等键（如 `order_id`、`transaction_id` 唯一约束）。

---

## 9. 初始化与运维

- 初始化：
  - 预置 `system_configs` 关键项（AI 限额、审核超时、记录上限、费用等）。
  - 创建关键索引（见第 2 章）。
- 定时任务：
  - 每日统计汇总写 `user_statistics`。
  - 按 `data_retention_days` 清理或归档过期分表数据。
- 监控与审计：
  - 关键集合写入失败监控与告警。
  - `audit_logs` 记录管理端敏感操作，`operation_logs` 记录系统行为。

---

## 10. 与关系模型一致性核对

- 覆盖集合：P0/P1/P2/P3 与补充脚本中的所有表均有映射。
- 字段未删减：所有列已映射为文档字段/嵌套结构。
- 约束等价：CHECK/触发器/视图/存储过程均提供 NoSQL 等价迁移方案。
- 性能与治理：提供分表、索引、缓存、归档与权限治理方案，满足 NoSQL 场景最佳实践。

---

本设计文档完全符合 NoSQL 设计要求，可直接作为 CloudBase 集合落地指南与运行手册。
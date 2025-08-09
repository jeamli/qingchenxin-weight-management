-- =====================================================
-- 体重管理数字医生小程序 - MySQL数据库P2/P3表创建脚本
-- 版本：v1.0
-- 创建日期：2025年8月8日
-- 说明：P2功能表和P3高级表的创建脚本
-- =====================================================

-- 设置字符集和时区
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

USE `health_app`;

-- =====================================================
-- P2功能表（中期完善）
-- =====================================================

-- 1. 食物数据库表（food_database）
CREATE TABLE `food_database` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '食物ID（主键）',
  `food_name` varchar(200) NOT NULL COMMENT '食物名称',
  `food_category` enum('grains','vegetables','fruits','meat','dairy','nuts','seafood','others') NOT NULL COMMENT '食物分类',
  `food_subcategory` varchar(100) DEFAULT NULL COMMENT '食物子分类',
  `calories_per_100g` decimal(6,2) DEFAULT NULL COMMENT '每100g热量(kcal)',
  `protein_per_100g` decimal(5,2) DEFAULT NULL COMMENT '每100g蛋白质(g)',
  `fat_per_100g` decimal(5,2) DEFAULT NULL COMMENT '每100g脂肪(g)',
  `carbs_per_100g` decimal(5,2) DEFAULT NULL COMMENT '每100g碳水化合物(g)',
  `fiber_per_100g` decimal(5,2) DEFAULT NULL COMMENT '每100g膳食纤维(g)',
  `sugar_per_100g` decimal(5,2) DEFAULT NULL COMMENT '每100g糖分(g)',
  `sodium_per_100g` decimal(8,2) DEFAULT NULL COMMENT '每100g钠(mg)',
  `vitamin_a` decimal(8,2) DEFAULT NULL COMMENT '维生素A(μg)',
  `vitamin_c` decimal(8,2) DEFAULT NULL COMMENT '维生素C(mg)',
  `vitamin_d` decimal(8,2) DEFAULT NULL COMMENT '维生素D(μg)',
  `vitamin_e` decimal(8,2) DEFAULT NULL COMMENT '维生素E(mg)',
  `calcium` decimal(8,2) DEFAULT NULL COMMENT '钙(mg)',
  `iron` decimal(8,2) DEFAULT NULL COMMENT '铁(mg)',
  `zinc` decimal(8,2) DEFAULT NULL COMMENT '锌(mg)',
  `common_units` json DEFAULT NULL COMMENT '常见单位信息（包含unit_name/weight/calories/protein/fat/carbs）',
  `image_url` varchar(500) DEFAULT NULL COMMENT '食物图片',
  `description` text DEFAULT NULL COMMENT '食物描述',
  `tags` json DEFAULT NULL COMMENT '标签数组',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '是否启用',
  `search_keywords` json DEFAULT NULL COMMENT '搜索关键词',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_food_name` (`food_name`),
  KEY `idx_food_category` (`food_category`),
  KEY `idx_food_subcategory` (`food_subcategory`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_created_at` (`created_at`),
  FULLTEXT KEY `ft_food_name_keywords` (`food_name`, `search_keywords`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='食物数据库表';

-- 2. 运动数据库表（exercise_database）
CREATE TABLE `exercise_database` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '运动ID（主键）',
  `exercise_name` varchar(200) NOT NULL COMMENT '运动名称',
  `exercise_category` enum('cardio','strength','flexibility','balance','sports') NOT NULL COMMENT '运动分类',
  `exercise_subcategory` varchar(100) DEFAULT NULL COMMENT '运动子分类',
  `calories_per_hour` decimal(6,2) DEFAULT NULL COMMENT '每小时消耗卡路里',
  `intensity_level` enum('low','medium','high') DEFAULT NULL COMMENT '强度等级',
  `equipment_needed` json DEFAULT NULL COMMENT '所需器材',
  `target_muscles` json DEFAULT NULL COMMENT '目标肌群',
  `difficulty_level` enum('beginner','intermediate','advanced') DEFAULT NULL COMMENT '难度等级',
  `duration_range` json DEFAULT NULL COMMENT '推荐时长范围（包含min/max/recommended）',
  `instructions` text DEFAULT NULL COMMENT '运动说明',
  `precautions` json DEFAULT NULL COMMENT '注意事项',
  `benefits` json DEFAULT NULL COMMENT '运动益处',
  `video_url` varchar(500) DEFAULT NULL COMMENT '教学视频',
  `image_url` varchar(500) DEFAULT NULL COMMENT '运动图片',
  `tags` json DEFAULT NULL COMMENT '标签',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '是否启用',
  `search_keywords` json DEFAULT NULL COMMENT '搜索关键词',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_exercise_name` (`exercise_name`),
  KEY `idx_exercise_category` (`exercise_category`),
  KEY `idx_intensity_level` (`intensity_level`),
  KEY `idx_difficulty_level` (`difficulty_level`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_created_at` (`created_at`),
  FULLTEXT KEY `ft_exercise_name_keywords` (`exercise_name`, `search_keywords`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运动数据库表';

-- 3. 用户目标设定表（user_goals）
CREATE TABLE `user_goals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '目标ID（主键）',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID（外键）',
  `goal_type` enum('weight_loss','weight_gain','maintenance','muscle_gain') NOT NULL COMMENT '目标类型',
  `goal_name` varchar(200) NOT NULL COMMENT '目标名称',
  `target_weight` decimal(5,2) DEFAULT NULL COMMENT '目标体重(kg)',
  `current_weight` decimal(5,2) DEFAULT NULL COMMENT '当前体重(kg)',
  `start_weight` decimal(5,2) DEFAULT NULL COMMENT '起始体重(kg)',
  `target_date` date DEFAULT NULL COMMENT '目标日期',
  `weekly_loss_target` decimal(4,2) DEFAULT NULL COMMENT '每周减重目标(kg)',
  `daily_calorie_target` int unsigned DEFAULT NULL COMMENT '每日热量目标(kcal)',
  `daily_protein_target` decimal(5,2) DEFAULT NULL COMMENT '每日蛋白质目标(g)',
  `daily_fat_target` decimal(5,2) DEFAULT NULL COMMENT '每日脂肪目标(g)',
  `daily_carbs_target` decimal(5,2) DEFAULT NULL COMMENT '每日碳水化合物目标(g)',
  `exercise_minutes_target` int unsigned DEFAULT NULL COMMENT '每日运动时间目标(分钟)',
  `water_intake_target` int unsigned DEFAULT NULL COMMENT '每日饮水目标(ml)',
  `steps_target` int unsigned DEFAULT NULL COMMENT '每日步数目标',
  `status` enum('active','completed','abandoned','paused') DEFAULT 'active' COMMENT '状态',
  `progress_percentage` decimal(5,2) DEFAULT 0.00 COMMENT '进度百分比',
  `start_date` date DEFAULT NULL COMMENT '开始日期',
  `end_date` date DEFAULT NULL COMMENT '结束日期',
  `notes` text DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id_status` (`user_id`, `status`),
  KEY `idx_user_id_goal_type` (`user_id`, `goal_type`),
  KEY `idx_goal_type` (`goal_type`),
  KEY `idx_status` (`status`),
  KEY `idx_target_date` (`target_date`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户目标设定表';

-- 4. 用户统计表（user_statistics）
CREATE TABLE `user_statistics` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '统计ID（主键）',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID（外键）',
  `stat_date` date NOT NULL COMMENT '统计日期',
  `total_calories` int unsigned DEFAULT 0 COMMENT '总热量(kcal)',
  `total_protein` decimal(6,2) DEFAULT 0.00 COMMENT '总蛋白质(g)',
  `total_fat` decimal(6,2) DEFAULT 0.00 COMMENT '总脂肪(g)',
  `total_carbs` decimal(6,2) DEFAULT 0.00 COMMENT '总碳水化合物(g)',
  `total_fiber` decimal(6,2) DEFAULT 0.00 COMMENT '总膳食纤维(g)',
  `total_sugar` decimal(6,2) DEFAULT 0.00 COMMENT '总糖分(g)',
  `total_sodium` decimal(8,2) DEFAULT 0.00 COMMENT '总钠(mg)',
  `total_exercise_minutes` int unsigned DEFAULT 0 COMMENT '总运动时间(分钟)',
  `total_calories_burned` int unsigned DEFAULT 0 COMMENT '总消耗热量(kcal)',
  `weight_change` decimal(4,2) DEFAULT 0.00 COMMENT '体重变化(kg)',
  `steps_count` int unsigned DEFAULT 0 COMMENT '步数',
  `water_intake` int unsigned DEFAULT 0 COMMENT '饮水量(ml)',
  `sleep_hours` decimal(3,1) DEFAULT 0.0 COMMENT '睡眠时长(小时)',
  `meal_count` tinyint unsigned DEFAULT 0 COMMENT '餐次数量',
  `exercise_count` tinyint unsigned DEFAULT 0 COMMENT '运动次数',
  `weight_record_count` tinyint unsigned DEFAULT 0 COMMENT '体重记录次数',
  `ai_chat_count` tinyint unsigned DEFAULT 0 COMMENT 'AI对话次数',
  `goal_progress` json DEFAULT NULL COMMENT '目标进度（包含weight_progress/calorie_progress/exercise_progress/water_progress）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_stat_date` (`user_id`, `stat_date`),
  KEY `idx_user_id_stat_date_desc` (`user_id`, `stat_date` DESC),
  KEY `idx_user_id_stat_date_asc` (`user_id`, `stat_date` ASC),
  KEY `idx_stat_date` (`stat_date` DESC),
  KEY `idx_total_calories` (`total_calories`),
  KEY `idx_total_exercise_minutes` (`total_exercise_minutes`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户统计表';

-- 5. 用户反馈表（user_feedback）
CREATE TABLE `user_feedback` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '反馈ID（主键）',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID（外键）',
  `feedback_type` enum('bug','feature','suggestion','complaint','praise') NOT NULL COMMENT '反馈类型',
  `category` enum('app','ai','advisor','payment','other') DEFAULT NULL COMMENT '反馈分类',
  `title` varchar(200) NOT NULL COMMENT '反馈标题',
  `content` text NOT NULL COMMENT '反馈内容',
  `rating` tinyint unsigned DEFAULT NULL COMMENT '评分(1-5)',
  `images` json DEFAULT NULL COMMENT '图片URL数组',
  `contact_info` json DEFAULT NULL COMMENT '联系信息',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal' COMMENT '优先级',
  `status` enum('pending','processing','resolved','closed') DEFAULT 'pending' COMMENT '状态',
  `assigned_to` bigint unsigned DEFAULT NULL COMMENT '分配给谁',
  `admin_reply` text DEFAULT NULL COMMENT '管理员回复',
  `reply_at` datetime DEFAULT NULL COMMENT '回复时间',
  `resolved_at` datetime DEFAULT NULL COMMENT '解决时间',
  `tags` json DEFAULT NULL COMMENT '标签数组',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_feedback_type` (`feedback_type`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户反馈表';

-- =====================================================
-- P3高级表（后期优化）
-- =====================================================

-- 6. 会员记录表（membership_records）
CREATE TABLE `membership_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '记录ID（主键）',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID（外键）',
  `old_level` enum('free','standard','premium') DEFAULT NULL COMMENT '原会员等级',
  `new_level` enum('free','standard','premium') NOT NULL COMMENT '新会员等级',
  `change_type` enum('upgrade','downgrade','renewal','expire') NOT NULL COMMENT '变更类型',
  `payment_id` bigint unsigned DEFAULT NULL COMMENT '支付记录ID',
  `amount` decimal(10,2) DEFAULT NULL COMMENT '支付金额',
  `effective_date` datetime NOT NULL COMMENT '生效时间',
  `expire_date` datetime DEFAULT NULL COMMENT '到期时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id_created_at` (`user_id`, `created_at`),
  KEY `idx_change_type` (`change_type`),
  KEY `idx_effective_date` (`effective_date`),
  CONSTRAINT `fk_membership_records_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_membership_records_payment_id` FOREIGN KEY (`payment_id`) REFERENCES `payment_records` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员记录表';

-- 7. 健康顾问收入记录表（advisor_income_records）
CREATE TABLE `advisor_income_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '记录ID（主键）',
  `advisor_id` bigint unsigned NOT NULL COMMENT '健康顾问ID（外键）',
  `income_type` enum('consultation','review','commission') NOT NULL COMMENT '收入类型',
  `amount` decimal(10,2) NOT NULL COMMENT '收入金额',
  `related_id` bigint unsigned DEFAULT NULL COMMENT '关联记录ID',
  `related_type` varchar(50) DEFAULT NULL COMMENT '关联记录类型',
  `description` varchar(500) DEFAULT NULL COMMENT '收入描述',
  `status` enum('pending','paid','cancelled') DEFAULT 'pending' COMMENT '状态',
  `paid_at` datetime DEFAULT NULL COMMENT '支付时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_advisor_id_created_at` (`advisor_id`, `created_at`),
  KEY `idx_income_type` (`income_type`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_advisor_income_records_advisor_id` FOREIGN KEY (`advisor_id`) REFERENCES `advisors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='健康顾问收入记录表';

-- 8. 审计日志表（audit_logs）
CREATE TABLE `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '审计日志ID（主键）',
  `user_id` bigint unsigned DEFAULT NULL COMMENT '操作用户ID（可选）',
  `advisor_id` bigint unsigned DEFAULT NULL COMMENT '健康顾问ID（可选）',
  `action` enum('create','update','delete','login','logout') NOT NULL COMMENT '操作类型',
  `resource_type` varchar(50) NOT NULL COMMENT '资源类型',
  `resource_id` bigint unsigned NOT NULL COMMENT '资源ID',
  `old_value` json DEFAULT NULL COMMENT '修改前值',
  `new_value` json DEFAULT NULL COMMENT '修改后值',
  `changed_fields` json DEFAULT NULL COMMENT '变更字段',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(500) DEFAULT NULL COMMENT '用户代理',
  `session_id` varchar(100) DEFAULT NULL COMMENT '会话ID',
  `request_id` varchar(100) DEFAULT NULL COMMENT '请求ID',
  `execution_time` int unsigned DEFAULT NULL COMMENT '执行时间(ms)',
  `status` enum('success','failed') NOT NULL COMMENT '操作状态',
  `error_message` text DEFAULT NULL COMMENT '错误信息',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id_created_at` (`user_id`, `created_at`),
  KEY `idx_advisor_id_created_at` (`advisor_id`, `created_at`),
  KEY `idx_resource_type_resource_id` (`resource_type`, `resource_id`),
  KEY `idx_action` (`action`),
  KEY `idx_status` (`status`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_audit_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_audit_logs_advisor_id` FOREIGN KEY (`advisor_id`) REFERENCES `advisors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审计日志表';

-- 9. 操作日志表（operation_logs）
CREATE TABLE `operation_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '操作日志ID（主键）',
  `user_id` bigint unsigned DEFAULT NULL COMMENT '操作用户ID',
  `module` varchar(50) NOT NULL COMMENT '模块名称',
  `action` varchar(100) NOT NULL COMMENT '操作名称',
  `description` text DEFAULT NULL COMMENT '操作描述',
  `request_data` json DEFAULT NULL COMMENT '请求数据',
  `response_data` json DEFAULT NULL COMMENT '响应数据',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(500) DEFAULT NULL COMMENT '用户代理',
  `execution_time` int unsigned DEFAULT NULL COMMENT '执行时间(ms)',
  `status` enum('success','failed','error') NOT NULL COMMENT '操作状态',
  `error_code` varchar(50) DEFAULT NULL COMMENT '错误代码',
  `error_message` text DEFAULT NULL COMMENT '错误信息',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_module` (`module`),
  KEY `idx_action` (`action`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- =====================================================
-- 数据约束（简化版）
-- =====================================================

-- 食物数据库表约束
ALTER TABLE `food_database` ADD CONSTRAINT `chk_calories_per_100g` CHECK (`calories_per_100g` IS NULL OR `calories_per_100g` >= 0);
ALTER TABLE `food_database` ADD CONSTRAINT `chk_protein_per_100g` CHECK (`protein_per_100g` IS NULL OR `protein_per_100g` >= 0);
ALTER TABLE `food_database` ADD CONSTRAINT `chk_fat_per_100g` CHECK (`fat_per_100g` IS NULL OR `fat_per_100g` >= 0);

-- 运动数据库表约束
ALTER TABLE `exercise_database` ADD CONSTRAINT `chk_calories_per_hour` CHECK (`calories_per_hour` IS NULL OR `calories_per_hour` >= 0);

-- 用户目标表约束
ALTER TABLE `user_goals` ADD CONSTRAINT `chk_target_weight` CHECK (`target_weight` IS NULL OR (`target_weight` >= 10 AND `target_weight` <= 500));
ALTER TABLE `user_goals` ADD CONSTRAINT `chk_current_weight` CHECK (`current_weight` IS NULL OR (`current_weight` >= 10 AND `current_weight` <= 500));
ALTER TABLE `user_goals` ADD CONSTRAINT `chk_progress_percentage` CHECK (`progress_percentage` >= 0 AND `progress_percentage` <= 100);

-- 用户统计表约束
ALTER TABLE `user_statistics` ADD CONSTRAINT `chk_total_calories` CHECK (`total_calories` >= 0);
ALTER TABLE `user_statistics` ADD CONSTRAINT `chk_total_exercise_minutes` CHECK (`total_exercise_minutes` >= 0);
ALTER TABLE `user_statistics` ADD CONSTRAINT `chk_steps_count` CHECK (`steps_count` >= 0);
ALTER TABLE `user_statistics` ADD CONSTRAINT `chk_water_intake` CHECK (`water_intake` >= 0);

-- 用户反馈表约束
ALTER TABLE `user_feedback` ADD CONSTRAINT `chk_rating` CHECK (`rating` IS NULL OR (`rating` >= 1 AND `rating` <= 5));

-- 会员记录表约束
ALTER TABLE `membership_records` ADD CONSTRAINT `chk_amount` CHECK (`amount` IS NULL OR `amount` >= 0);

-- 健康顾问收入记录表约束
ALTER TABLE `advisor_income_records` ADD CONSTRAINT `chk_amount_income` CHECK (`amount` >= 0);

-- =====================================================
-- 创建完成提示
-- =====================================================

SELECT 'P2功能表和P3高级表创建完成！' AS message;

-- 显示创建的表名
SELECT 'food_database' AS table_name, '食物数据库表' AS description UNION ALL
SELECT 'exercise_database', '运动数据库表' UNION ALL
SELECT 'user_goals', '用户目标设定表' UNION ALL
SELECT 'user_statistics', '用户统计表' UNION ALL
SELECT 'user_feedback', '用户反馈表' UNION ALL
SELECT 'membership_records', '会员记录表' UNION ALL
SELECT 'advisor_income_records', '健康顾问收入记录表' UNION ALL
SELECT 'audit_logs', '审计日志表' UNION ALL
SELECT 'operation_logs', '操作日志表';

SET FOREIGN_KEY_CHECKS = 1;

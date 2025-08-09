-- =====================================================
-- 体重管理数字医生小程序 - MySQL数据库表结构
-- 版本：v1.0
-- 创建日期：2025年8月8日
-- 说明：P0核心表（初期必须）
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `health_app` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `health_app`;

-- =====================================================
-- 1. 用户表（users）- 核心表
-- =====================================================
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID（主键）',
  `openid` varchar(64) NOT NULL COMMENT '微信openid',
  `unionid` varchar(64) DEFAULT NULL COMMENT '微信unionid',
  `nickname` varchar(50) DEFAULT NULL COMMENT '脱敏姓名（李X明）',
  `real_name` varchar(100) DEFAULT NULL COMMENT '真实姓名（加密存储）',
  `avatar` varchar(500) DEFAULT NULL COMMENT '头像URL',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号（加密）',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `gender` enum('male','female') DEFAULT NULL COMMENT '性别',
  `age` tinyint unsigned DEFAULT NULL COMMENT '年龄',
  `birth_date` date DEFAULT NULL COMMENT '出生日期',
  `height` decimal(5,2) DEFAULT NULL COMMENT '身高(cm)',
  `current_weight` decimal(5,2) DEFAULT NULL COMMENT '当前体重(kg)',
  `target_weight` decimal(5,2) DEFAULT NULL COMMENT '目标体重(kg)',
  `bmi` decimal(4,2) DEFAULT NULL COMMENT 'BMI指数',
  `occupation` varchar(100) DEFAULT NULL COMMENT '职业',
  `activity_level` enum('sedentary','light','moderate','active') DEFAULT NULL COMMENT '活动水平',
  `health_goals` json DEFAULT NULL COMMENT '健康目标数组',
  `medical_history` json DEFAULT NULL COMMENT '病史数组',
  `dietary_restrictions` json DEFAULT NULL COMMENT '饮食限制',
  `allergies` json DEFAULT NULL COMMENT '过敏信息',
  `preferred_language` varchar(10) DEFAULT 'zh-CN' COMMENT '首选语言',
  `timezone` varchar(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
  `advisor_id` bigint unsigned DEFAULT NULL COMMENT '关联健康顾问ID',
  `member_level` enum('free','standard','premium') DEFAULT 'free' COMMENT '会员等级',
  `member_expire` datetime DEFAULT NULL COMMENT '会员到期时间',
  `status` enum('active','inactive','blocked','pending') DEFAULT 'active' COMMENT '状态',
  `notification_settings` json DEFAULT NULL COMMENT '通知设置',
  `privacy_settings` json DEFAULT NULL COMMENT '隐私设置',
  `last_login` datetime DEFAULT NULL COMMENT '最后登录时间',
  `login_count` int unsigned DEFAULT 0 COMMENT '登录次数',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_advisor_id` (`advisor_id`),
  KEY `idx_member_level` (`member_level`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =====================================================
-- 2. 体重记录表（weight_records）- 核心表
-- =====================================================
CREATE TABLE `weight_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '记录ID（主键）',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID（外键）',
  `weight` decimal(5,2) NOT NULL COMMENT '体重(kg)',
  `bmi` decimal(4,2) DEFAULT NULL COMMENT 'BMI指数',
  `record_date` date NOT NULL COMMENT '记录日期',
  `record_time` datetime NOT NULL COMMENT '记录时间',
  `record_type` enum('manual','photo','auto') DEFAULT 'manual' COMMENT '记录类型',
  `photo_url` varchar(500) DEFAULT NULL COMMENT '照片URL',
  `note` text DEFAULT NULL COMMENT '备注',
  `device_info` json DEFAULT NULL COMMENT '设备信息',
  `location` json DEFAULT NULL COMMENT '位置信息',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id_record_date` (`user_id`, `record_date`),
  KEY `idx_user_id_created_at` (`user_id`, `created_at`),
  KEY `idx_record_type` (`record_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='体重记录表';

-- =====================================================
-- 3. 饮食记录表（diet_records）- 核心表
-- =====================================================
CREATE TABLE `diet_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '记录ID（主键）',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID（外键）',
  `food_name` varchar(200) NOT NULL COMMENT '食物名称',
  `food_category` varchar(50) DEFAULT NULL COMMENT '食物分类',
  `quantity` decimal(8,2) NOT NULL COMMENT '数量',
  `unit` varchar(20) DEFAULT NULL COMMENT '单位',
  `calories` decimal(8,2) DEFAULT NULL COMMENT '热量(kcal)',
  `protein` decimal(6,2) DEFAULT NULL COMMENT '蛋白质(g)',
  `fat` decimal(6,2) DEFAULT NULL COMMENT '脂肪(g)',
  `carbs` decimal(6,2) DEFAULT NULL COMMENT '碳水化合物(g)',
  `fiber` decimal(6,2) DEFAULT NULL COMMENT '膳食纤维(g)',
  `sugar` decimal(6,2) DEFAULT NULL COMMENT '糖分(g)',
  `sodium` decimal(8,2) DEFAULT NULL COMMENT '钠(mg)',
  `photo_url` varchar(500) DEFAULT NULL COMMENT '照片URL',
  `meal_type` enum('breakfast','lunch','dinner','snack') DEFAULT NULL COMMENT '餐次类型',
  `record_date` date NOT NULL COMMENT '记录日期',
  `record_time` datetime NOT NULL COMMENT '记录时间',
  `record_type` enum('manual','photo','ai') DEFAULT 'manual' COMMENT '记录类型',
  `ai_confidence` decimal(3,2) DEFAULT NULL COMMENT 'AI识别置信度',
  `note` text DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id_record_date` (`user_id`, `record_date`),
  KEY `idx_user_id_meal_type_record_date` (`user_id`, `meal_type`, `record_date`),
  KEY `idx_meal_type` (`meal_type`),
  KEY `idx_record_type` (`record_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='饮食记录表';

-- =====================================================
-- 4. 运动记录表（exercise_records）- 核心表
-- =====================================================
CREATE TABLE `exercise_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '记录ID（主键）',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID（外键）',
  `exercise_type` enum('cardio','strength','flexibility') NOT NULL COMMENT '运动类型',
  `exercise_name` varchar(200) NOT NULL COMMENT '运动名称',
  `duration` int unsigned NOT NULL COMMENT '运动时长(分钟)',
  `intensity` enum('low','medium','high') NOT NULL COMMENT '运动强度',
  `calories_burned` decimal(8,2) DEFAULT NULL COMMENT '消耗卡路里',
  `distance` decimal(8,2) DEFAULT NULL COMMENT '距离(km)',
  `steps` int unsigned DEFAULT NULL COMMENT '步数',
  `heart_rate_avg` int unsigned DEFAULT NULL COMMENT '平均心率',
  `heart_rate_max` int unsigned DEFAULT NULL COMMENT '最大心率',
  `heart_rate_min` int unsigned DEFAULT NULL COMMENT '最小心率',
  `photo_url` varchar(500) DEFAULT NULL COMMENT '照片URL',
  `record_date` date NOT NULL COMMENT '记录日期',
  `record_time` datetime NOT NULL COMMENT '记录时间',
  `record_type` enum('manual','photo','auto') DEFAULT 'manual' COMMENT '记录类型',
  `device_info` json DEFAULT NULL COMMENT '设备信息',
  `location` json DEFAULT NULL COMMENT '位置信息',
  `note` text DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id_record_date` (`user_id`, `record_date`),
  KEY `idx_user_id_exercise_type` (`user_id`, `exercise_type`),
  KEY `idx_exercise_type` (`exercise_type`),
  KEY `idx_intensity` (`intensity`),
  KEY `idx_record_type` (`record_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运动记录表';

-- =====================================================
-- 5. AI方案表（ai_plans）- 核心表
-- =====================================================
CREATE TABLE `ai_plans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '方案ID（主键）',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID（外键）',
  `advisor_id` bigint unsigned DEFAULT NULL COMMENT '健康顾问ID（外键，可选）',
  `plan_name` varchar(200) NOT NULL COMMENT '方案名称',
  `plan_type` enum('gentle','standard','aggressive') DEFAULT 'standard' COMMENT '方案类型',
  `target_weight` decimal(5,2) DEFAULT NULL COMMENT '目标体重',
  `duration` int unsigned DEFAULT NULL COMMENT '持续时间(天)',
  `expected_loss` decimal(4,2) DEFAULT NULL COMMENT '预期减重(kg)',
  `daily_calories` int unsigned DEFAULT NULL COMMENT '每日热量',
  `diet_plan` json DEFAULT NULL COMMENT '饮食计划',
  `exercise_plan` json DEFAULT NULL COMMENT '运动计划',
  `lifestyle_plan` json DEFAULT NULL COMMENT '生活方式建议',
  `status` enum('draft','pending','reviewed','approved','rejected') DEFAULT 'draft' COMMENT '状态',
  `review_comment` text DEFAULT NULL COMMENT '审核意见',
  `review_fee` int unsigned DEFAULT 0 COMMENT '审核费用',
  `reviewed_at` datetime DEFAULT NULL COMMENT '审核时间',
  `reviewed_by` bigint unsigned DEFAULT NULL COMMENT '审核人ID',
  `execution_status` enum('not_started','in_progress','completed','paused') DEFAULT 'not_started' COMMENT '执行状态',
  `start_date` date DEFAULT NULL COMMENT '开始日期',
  `end_date` date DEFAULT NULL COMMENT '结束日期',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id_status` (`user_id`, `status`),
  KEY `idx_advisor_id_status` (`advisor_id`, `status`),
  KEY `idx_plan_type` (`plan_type`),
  KEY `idx_status` (`status`),
  KEY `idx_execution_status` (`execution_status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI方案表';

-- =====================================================
-- 6. 系统配置表（system_configs）- 核心表
-- =====================================================
CREATE TABLE `system_configs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '配置ID（主键）',
  `config_key` varchar(100) NOT NULL COMMENT '配置键',
  `config_value` json DEFAULT NULL COMMENT '配置值',
  `config_type` enum('string','number','boolean','object') DEFAULT 'string' COMMENT '配置类型',
  `description` varchar(500) DEFAULT NULL COMMENT '配置描述',
  `category` varchar(50) DEFAULT NULL COMMENT '配置分类',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '是否启用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`),
  KEY `idx_category` (`category`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- =====================================================
-- 数据约束（简化版）
-- =====================================================

-- 用户表约束
ALTER TABLE `users` ADD CONSTRAINT `chk_age_basic` CHECK (`age` IS NULL OR (`age` >= 1 AND `age` <= 120));
ALTER TABLE `users` ADD CONSTRAINT `chk_height_basic` CHECK (`height` IS NULL OR (`height` >= 50 AND `height` <= 300));
ALTER TABLE `users` ADD CONSTRAINT `chk_weight_basic` CHECK (`current_weight` IS NULL OR (`current_weight` >= 10 AND `current_weight` <= 500));

-- 体重记录表约束
ALTER TABLE `weight_records` ADD CONSTRAINT `chk_weight_basic` CHECK (`weight` >= 10 AND `weight` <= 500);

-- 饮食记录表约束
ALTER TABLE `diet_records` ADD CONSTRAINT `chk_quantity_basic` CHECK (`quantity` > 0 AND `quantity` <= 10000);
ALTER TABLE `diet_records` ADD CONSTRAINT `chk_calories_basic` CHECK (`calories` IS NULL OR (`calories` >= 0 AND `calories` <= 10000));

-- 运动记录表约束
ALTER TABLE `exercise_records` ADD CONSTRAINT `chk_duration_basic` CHECK (`duration` >= 1 AND `duration` <= 480);
ALTER TABLE `exercise_records` ADD CONSTRAINT `chk_calories_burned_basic` CHECK (`calories_burned` IS NULL OR (`calories_burned` >= 0 AND `calories_burned` <= 5000));
ALTER TABLE `exercise_records` ADD CONSTRAINT `chk_distance_basic` CHECK (`distance` IS NULL OR (`distance` >= 0 AND `distance` <= 1000));
ALTER TABLE `exercise_records` ADD CONSTRAINT `chk_steps_basic` CHECK (`steps` IS NULL OR (`steps` >= 0 AND `steps` <= 100000));

-- AI方案表约束
ALTER TABLE `ai_plans` ADD CONSTRAINT `chk_duration_basic` CHECK (`duration` IS NULL OR (`duration` >= 1 AND `duration` <= 365));
ALTER TABLE `ai_plans` ADD CONSTRAINT `chk_daily_calories_basic` CHECK (`daily_calories` IS NULL OR (`daily_calories` >= 500 AND `daily_calories` <= 5000));

-- =====================================================
-- 触发器：自动计算BMI
-- =====================================================
DELIMITER $$

-- 用户表BMI计算触发器
CREATE TRIGGER `tr_users_bmi_calc` 
BEFORE INSERT ON `users` 
FOR EACH ROW 
BEGIN
    IF NEW.current_weight IS NOT NULL AND NEW.height IS NOT NULL AND NEW.height > 0 THEN
        SET NEW.bmi = NEW.current_weight / POWER(NEW.height / 100, 2);
    END IF;
END$$

CREATE TRIGGER `tr_users_bmi_calc_update` 
BEFORE UPDATE ON `users` 
FOR EACH ROW 
BEGIN
    IF NEW.current_weight IS NOT NULL AND NEW.height IS NOT NULL AND NEW.height > 0 THEN
        SET NEW.bmi = NEW.current_weight / POWER(NEW.height / 100, 2);
    END IF;
END$$

-- 体重记录表BMI计算触发器
CREATE TRIGGER `tr_weight_records_bmi_calc` 
BEFORE INSERT ON `weight_records` 
FOR EACH ROW 
BEGIN
    DECLARE user_height DECIMAL(5,2);
    
    SELECT height INTO user_height 
    FROM users 
    WHERE id = NEW.user_id;
    
    IF user_height IS NOT NULL AND user_height > 0 THEN
        SET NEW.bmi = NEW.weight / POWER(user_height / 100, 2);
    END IF;
END$$

CREATE TRIGGER `tr_weight_records_bmi_calc_update` 
BEFORE UPDATE ON `weight_records` 
FOR EACH ROW 
BEGIN
    DECLARE user_height DECIMAL(5,2);
    
    SELECT height INTO user_height 
    FROM users 
    WHERE id = NEW.user_id;
    
    IF user_height IS NOT NULL AND user_height > 0 THEN
        SET NEW.bmi = NEW.weight / POWER(user_height / 100, 2);
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- 初始化系统配置数据
-- =====================================================
INSERT INTO `system_configs` (`config_key`, `config_value`, `config_type`, `description`, `category`, `is_active`) VALUES
('ai_daily_limit', '5', 'number', '免费用户每日AI对话次数限制', 'ai', 1),
('review_timeout_hours', '24', 'number', '审核超时时间（小时）', 'review', 1),
('max_weight_records_per_day', '10', 'number', '每日最大体重记录数', 'record', 1),
('max_diet_records_per_day', '20', 'number', '每日最大饮食记录数', 'record', 1),
('max_exercise_records_per_day', '10', 'number', '每日最大运动记录数', 'record', 1),
('membership_upgrade_fee', '9900', 'number', '会员升级费用（分）', 'payment', 1),
('review_fee', '5000', 'number', '审核费用（分）', 'payment', 1),
('advisor_commission_rate', '0.7', 'number', '健康顾问分成比例', 'payment', 1);

-- =====================================================
-- 创建完成提示
-- =====================================================
SELECT 'P0核心表创建完成！' AS message;
SELECT '已创建的表：' AS info;
SELECT '1. users - 用户表' AS table_name;
SELECT '2. weight_records - 体重记录表' AS table_name;
SELECT '3. diet_records - 饮食记录表' AS table_name;
SELECT '4. exercise_records - 运动记录表' AS table_name;
SELECT '5. ai_plans - AI方案表' AS table_name;
SELECT '6. system_configs - 系统配置表' AS table_name;

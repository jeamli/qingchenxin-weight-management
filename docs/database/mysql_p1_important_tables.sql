-- =====================================================
-- 体重管理数字医生小程序 - MySQL数据库表结构
-- 版本：v1.0
-- 创建日期：2025年8月8日
-- 说明：P1重要表（初期建议）
-- =====================================================

USE `health_app`;

-- =====================================================
-- 1. 健康顾问表（advisors）- 重要表
-- =====================================================
CREATE TABLE `advisors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '健康顾问ID（主键）',
  `name` varchar(100) NOT NULL COMMENT '姓名',
  `avatar` varchar(500) DEFAULT NULL COMMENT '头像URL',
  `phone` varchar(20) NOT NULL COMMENT '手机号（加密）',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `id_card` varchar(20) DEFAULT NULL COMMENT '身份证号（加密）',
  `license_number` varchar(50) DEFAULT NULL COMMENT '执业证书号',
  `specialty` json DEFAULT NULL COMMENT '专业领域数组',
  `specialization` json DEFAULT NULL COMMENT '专业特长',
  `qualification` varchar(200) DEFAULT NULL COMMENT '资质证书',
  `education` varchar(100) DEFAULT NULL COMMENT '学历',
  `work_experience` text DEFAULT NULL COMMENT '工作经历',
  `hospital` varchar(200) DEFAULT NULL COMMENT '合作医院',
  `description` text DEFAULT NULL COMMENT '专业描述',
  `experience_years` tinyint unsigned DEFAULT NULL COMMENT '从业年限',
  `consultation_fee` int unsigned DEFAULT 0 COMMENT '咨询费用（分）',
  `user_count` int unsigned DEFAULT 0 COMMENT '服务用户数',
  `rating` decimal(2,1) DEFAULT NULL COMMENT '评分（1-5）',
  `total_income` bigint unsigned DEFAULT 0 COMMENT '总收入（分）',
  `monthly_income` bigint unsigned DEFAULT 0 COMMENT '月收入（分）',
  `status` enum('active','inactive','blocked','pending') DEFAULT 'pending' COMMENT '状态',
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending' COMMENT '认证状态',
  `is_online` tinyint(1) DEFAULT 0 COMMENT '是否在线',
  `max_users` int unsigned DEFAULT 100 COMMENT '最大服务用户数',
  `max_daily_consultations` int unsigned DEFAULT 20 COMMENT '每日最大咨询数',
  `response_time` int unsigned DEFAULT NULL COMMENT '平均响应时间（分钟）',
  `available_time` json DEFAULT NULL COMMENT '可服务时间',
  `service_areas` json DEFAULT NULL COMMENT '服务区域',
  `languages` json DEFAULT NULL COMMENT '掌握语言',
  `certificates` json DEFAULT NULL COMMENT '证书信息',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`),
  UNIQUE KEY `uk_email` (`email`),
  UNIQUE KEY `uk_id_card` (`id_card`),
  UNIQUE KEY `uk_license_number` (`license_number`),
  KEY `idx_status` (`status`),
  KEY `idx_verification_status` (`verification_status`),
  KEY `idx_rating` (`rating`),
  KEY `idx_user_count` (`user_count`),
  KEY `idx_is_online` (`is_online`),
  KEY `idx_consultation_fee` (`consultation_fee`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='健康顾问表';

-- =====================================================
-- 2. 聊天记录表（chat_messages）- 重要表
-- =====================================================
CREATE TABLE `chat_messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '消息ID（主键）',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID（外键）',
  `advisor_id` bigint unsigned NOT NULL COMMENT '健康顾问ID（外键）',
  `sender_type` enum('user','advisor','system') NOT NULL COMMENT '发送者类型',
  `message_type` enum('text','image','file','system') DEFAULT 'text' COMMENT '消息类型',
  `content` text DEFAULT NULL COMMENT '消息内容',
  `image_url` varchar(500) DEFAULT NULL COMMENT '图片URL',
  `file_url` varchar(500) DEFAULT NULL COMMENT '文件URL',
  `file_name` varchar(200) DEFAULT NULL COMMENT '文件名',
  `file_size` bigint unsigned DEFAULT NULL COMMENT '文件大小',
  `is_read` tinyint(1) DEFAULT 0 COMMENT '是否已读',
  `read_at` datetime DEFAULT NULL COMMENT '阅读时间',
  `is_deleted` tinyint(1) DEFAULT 0 COMMENT '是否已删除',
  `deleted_at` datetime DEFAULT NULL COMMENT '删除时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id_advisor_id_created_at` (`user_id`, `advisor_id`, `created_at`),
  KEY `idx_advisor_id_user_id_created_at` (`advisor_id`, `user_id`, `created_at`),
  KEY `idx_sender_type` (`sender_type`),
  KEY `idx_message_type` (`message_type`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_is_deleted` (`is_deleted`),
  CONSTRAINT `fk_chat_messages_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chat_messages_advisor_id` FOREIGN KEY (`advisor_id`) REFERENCES `advisors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天记录表';

-- =====================================================
-- 3. 审核记录表（review_records）- 重要表
-- =====================================================
CREATE TABLE `review_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '审核记录ID（主键）',
  `plan_id` bigint unsigned NOT NULL COMMENT '方案ID（外键）',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID（外键）',
  `advisor_id` bigint unsigned NOT NULL COMMENT '健康顾问ID（外键）',
  `review_type` enum('plan_review','chat_review') NOT NULL COMMENT '审核类型',
  `review_status` enum('pending','approved','rejected','modified') NOT NULL COMMENT '审核状态',
  `review_comment` text DEFAULT NULL COMMENT '审核意见',
  `modification_suggestions` json DEFAULT NULL COMMENT '修改建议',
  `review_fee` int unsigned DEFAULT 0 COMMENT '审核费用（分）',
  `fee_status` enum('pending','paid','refunded') DEFAULT 'pending' COMMENT '费用状态',
  `review_time` int unsigned DEFAULT NULL COMMENT '审核耗时(分钟)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `reviewed_at` datetime DEFAULT NULL COMMENT '审核时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_plan_id_review_status` (`plan_id`, `review_status`),
  KEY `idx_advisor_id_review_status` (`advisor_id`, `review_status`),
  KEY `idx_user_id_review_status` (`user_id`, `review_status`),
  KEY `idx_review_type` (`review_type`),
  KEY `idx_review_status` (`review_status`),
  KEY `idx_fee_status` (`fee_status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_review_records_plan_id` FOREIGN KEY (`plan_id`) REFERENCES `ai_plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_records_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_records_advisor_id` FOREIGN KEY (`advisor_id`) REFERENCES `advisors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审核记录表';

-- =====================================================
-- 4. 支付记录表（payment_records）- 重要表
-- =====================================================
CREATE TABLE `payment_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '支付记录ID（主键）',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID（外键）',
  `order_id` varchar(64) NOT NULL COMMENT '订单ID',
  `transaction_id` varchar(64) DEFAULT NULL COMMENT '微信支付交易ID',
  `payment_type` enum('membership','review','service') NOT NULL COMMENT '支付类型',
  `amount` int unsigned NOT NULL COMMENT '支付金额(分)',
  `currency` varchar(10) DEFAULT 'CNY' COMMENT '货币类型',
  `status` enum('pending','success','failed','refunded') DEFAULT 'pending' COMMENT '支付状态',
  `payment_method` varchar(20) DEFAULT 'wechat_pay' COMMENT '支付方式',
  `description` varchar(500) DEFAULT NULL COMMENT '支付描述',
  `related_id` bigint unsigned DEFAULT NULL COMMENT '关联ID（方案ID、会员ID等）',
  `refund_amount` int unsigned DEFAULT 0 COMMENT '退款金额(分)',
  `refund_reason` varchar(200) DEFAULT NULL COMMENT '退款原因',
  `refund_time` datetime DEFAULT NULL COMMENT '退款时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `paid_at` datetime DEFAULT NULL COMMENT '支付时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_id` (`order_id`),
  UNIQUE KEY `uk_transaction_id` (`transaction_id`),
  KEY `idx_user_id_status` (`user_id`, `status`),
  KEY `idx_payment_type_status` (`payment_type`, `status`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_payment_records_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付记录表';

-- =====================================================
-- 5. 通知表（notifications）- 重要表
-- =====================================================
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '通知ID（主键）',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID（外键）',
  `advisor_id` bigint unsigned DEFAULT NULL COMMENT '健康顾问ID（外键，可选）',
  `notification_type` enum('system','reminder','advisor_message','achievement','alert') NOT NULL COMMENT '通知类型',
  `title` varchar(200) NOT NULL COMMENT '通知标题',
  `content` text NOT NULL COMMENT '通知内容',
  `image_url` varchar(500) DEFAULT NULL COMMENT '通知图片',
  `action_url` varchar(500) DEFAULT NULL COMMENT '点击跳转链接',
  `action_type` varchar(50) DEFAULT NULL COMMENT '操作类型：navigate/open_url/open_modal',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal' COMMENT '优先级',
  `is_read` tinyint(1) DEFAULT 0 COMMENT '是否已读',
  `read_at` datetime DEFAULT NULL COMMENT '阅读时间',
  `is_sent` tinyint(1) DEFAULT 0 COMMENT '是否已发送',
  `sent_at` datetime DEFAULT NULL COMMENT '发送时间',
  `scheduled_at` datetime DEFAULT NULL COMMENT '计划发送时间',
  `expire_at` datetime DEFAULT NULL COMMENT '过期时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_advisor_id` (`advisor_id`),
  KEY `idx_notification_type` (`notification_type`),
  KEY `idx_priority` (`priority`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_is_sent` (`is_sent`),
  KEY `idx_scheduled_at` (`scheduled_at`),
  KEY `idx_expire_at` (`expire_at`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- =====================================================
-- 数据约束（简化版）
-- =====================================================

-- 健康顾问表约束
ALTER TABLE `advisors` ADD CONSTRAINT `chk_experience_years_basic` CHECK (`experience_years` IS NULL OR (`experience_years` >= 0 AND `experience_years` <= 50));
ALTER TABLE `advisors` ADD CONSTRAINT `chk_rating_basic` CHECK (`rating` IS NULL OR (`rating` >= 1 AND `rating` <= 5));

-- 审核记录表约束
ALTER TABLE `review_records` ADD CONSTRAINT `chk_review_fee` CHECK (`review_fee` >= 0 AND `review_fee` <= 100000);
ALTER TABLE `review_records` ADD CONSTRAINT `chk_review_time` CHECK (`review_time` >= 0 AND `review_time` <= 1440);

-- 支付记录表约束
ALTER TABLE `payment_records` ADD CONSTRAINT `chk_amount_basic` CHECK (`amount` > 0 AND `amount` <= 10000000);
ALTER TABLE `payment_records` ADD CONSTRAINT `chk_refund_amount_basic` CHECK (`refund_amount` >= 0 AND `refund_amount` <= `amount`);

-- =====================================================
-- 创建完成提示
-- =====================================================
SELECT 'P1重要表创建完成！' AS message;
SELECT '已创建的表：' AS info;
SELECT '1. advisors - 健康顾问表' AS table_name;
SELECT '2. chat_messages - 聊天记录表' AS table_name;
SELECT '3. review_records - 审核记录表' AS table_name;
SELECT '4. payment_records - 支付记录表' AS table_name;
SELECT '5. notifications - 通知表' AS table_name;
-- =====================================================
-- 体重管理数字医生小程序 - MySQL数据库补充脚本
-- 版本：v1.1
-- 创建日期：2025年8月8日
-- 说明：补充索引、约束、触发器等设计元素（修复与设计文档的一致性）
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

USE `health_app`;

-- =====================================================
-- 1. 补充索引设计（修复与设计文档的一致性）
-- =====================================================

-- 用户表补充索引（修复索引定义）
ALTER TABLE `users` ADD KEY `idx_user_basic_info` (`id`, `nickname`, `current_weight`, `bmi`, `status`);

-- 运动记录表补充索引（仅添加缺失的索引）
ALTER TABLE `exercise_records` ADD KEY `idx_exercise_name` (`exercise_name`);

-- 聊天记录表补充索引（仅添加缺失的索引）
ALTER TABLE `chat_messages` ADD KEY `idx_user_advisor_date` (`user_id`, `advisor_id`, `created_at`);

-- 支付记录表补充索引（仅添加缺失的索引）
ALTER TABLE `payment_records` ADD KEY `idx_user_id` (`user_id`);
ALTER TABLE `payment_records` ADD KEY `idx_payment_type` (`payment_type`);

-- 通知表补充索引（仅添加缺失的索引）
ALTER TABLE `notifications` ADD KEY `idx_user_id` (`user_id`);
ALTER TABLE `notifications` ADD KEY `idx_is_read` (`is_read`);

-- =====================================================
-- 2. 补充数据约束条件（与设计文档保持一致）
-- =====================================================

-- 注意：基础约束已在主脚本中添加，这里仅添加额外的约束
-- 根据设计文档，BMI约束应该通过触发器自动计算，不需要CHECK约束

-- 运动记录表额外约束（与设计文档保持一致）
ALTER TABLE `exercise_records` ADD CONSTRAINT `chk_distance_basic` 
CHECK (`distance` IS NULL OR (`distance` >= 0 AND `distance` <= 1000));

ALTER TABLE `exercise_records` ADD CONSTRAINT `chk_steps_basic` 
CHECK (`steps` IS NULL OR (`steps` >= 0 AND `steps` <= 100000));

-- =====================================================
-- 3. 补充系统配置数据（避免重复，仅添加缺失的配置）
-- =====================================================

-- 插入缺失的系统配置（使用正确的格式）
INSERT INTO `system_configs` (`config_key`, `config_value`, `config_type`, `description`, `category`, `is_active`) VALUES
('data_retention_days', '365', 'number', '数据保留天数', 'system', 1),
('max_file_size_mb', '10', 'number', '最大文件上传大小（MB）', 'system', 1),
('session_timeout_minutes', '30', 'number', '会话超时时间（分钟）', 'system', 1),
('default_ai_model', 'gpt-3.5-turbo', 'string', '默认AI模型', 'ai', 1),
('max_chat_history', '50', 'number', '最大聊天历史记录数', 'ai', 1)
ON DUPLICATE KEY UPDATE 
`config_value` = VALUES(`config_value`),
`config_type` = VALUES(`config_type`),
`description` = VALUES(`description`),
`category` = VALUES(`category`),
`is_active` = VALUES(`is_active`);

-- =====================================================
-- 4. 创建视图（可选）
-- =====================================================

-- 用户基本信息视图
CREATE OR REPLACE VIEW `v_user_basic_info` AS
SELECT 
    id,
    nickname,
    avatar,
    current_weight,
    target_weight,
    height,
    bmi,
    member_level,
    status,
    created_at
FROM users
WHERE status = 'active';

-- 用户体重趋势视图
CREATE OR REPLACE VIEW `v_user_weight_trend` AS
SELECT 
    u.id as user_id,
    u.nickname,
    wr.record_date,
    wr.weight,
    wr.bmi,
    LAG(wr.weight) OVER (PARTITION BY u.id ORDER BY wr.record_date) as prev_weight,
    wr.weight - LAG(wr.weight) OVER (PARTITION BY u.id ORDER BY wr.record_date) as weight_change
FROM users u
LEFT JOIN weight_records wr ON u.id = wr.user_id
WHERE u.status = 'active';

-- 用户统计概览视图
CREATE OR REPLACE VIEW `v_user_stats_overview` AS
SELECT 
    u.id as user_id,
    u.nickname,
    u.current_weight,
    u.target_weight,
    u.bmi,
    COUNT(wr.id) as total_weight_records,
    COUNT(dr.id) as total_diet_records,
    COUNT(er.id) as total_exercise_records,
    MAX(wr.record_date) as last_weight_record,
    MAX(dr.record_date) as last_diet_record,
    MAX(er.record_date) as last_exercise_record
FROM users u
LEFT JOIN weight_records wr ON u.id = wr.user_id
LEFT JOIN diet_records dr ON u.id = dr.user_id
LEFT JOIN exercise_records er ON u.id = er.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.nickname, u.current_weight, u.target_weight, u.bmi;

-- =====================================================
-- 5. 创建存储过程（可选）
-- =====================================================

DELIMITER $$

-- 获取用户统计信息的存储过程
CREATE PROCEDURE `sp_get_user_stats`(IN p_user_id BIGINT)
BEGIN
    DECLARE total_weight_records INT;
    DECLARE total_diet_records INT;
    DECLARE total_exercise_records INT;
    DECLARE current_bmi DECIMAL(4,2);
    DECLARE weight_change DECIMAL(5,2);
    
    -- 获取记录数量
    SELECT COUNT(*) INTO total_weight_records FROM weight_records WHERE user_id = p_user_id;
    SELECT COUNT(*) INTO total_diet_records FROM diet_records WHERE user_id = p_user_id;
    SELECT COUNT(*) INTO total_exercise_records FROM exercise_records WHERE user_id = p_user_id;
    
    -- 获取当前BMI
    SELECT bmi INTO current_bmi FROM users WHERE id = p_user_id;
    
    -- 获取体重变化
    SELECT 
        (MAX(weight) - MIN(weight)) INTO weight_change
    FROM weight_records 
    WHERE user_id = p_user_id;
    
    -- 返回结果
    SELECT 
        p_user_id as user_id,
        total_weight_records,
        total_diet_records,
        total_exercise_records,
        current_bmi,
        weight_change;
END$$

-- 获取用户最近记录的存储过程
CREATE PROCEDURE `sp_get_user_recent_records`(IN p_user_id BIGINT, IN p_limit INT)
BEGIN
    -- 获取最近体重记录
    SELECT 'weight' as record_type, record_date, weight as value, note
    FROM weight_records 
    WHERE user_id = p_user_id 
    ORDER BY record_date DESC 
    LIMIT p_limit;
    
    -- 获取最近饮食记录
    SELECT 'diet' as record_type, record_date, food_name as value, note
    FROM diet_records 
    WHERE user_id = p_user_id 
    ORDER BY record_date DESC 
    LIMIT p_limit;
    
    -- 获取最近运动记录
    SELECT 'exercise' as record_type, record_date, exercise_name as value, note
    FROM exercise_records 
    WHERE user_id = p_user_id 
    ORDER BY record_date DESC 
    LIMIT p_limit;
END$$

DELIMITER ;

-- =====================================================
-- 6. 创建完成提示
-- =====================================================

SELECT 'MySQL数据库补充脚本执行完成！' AS message;
SELECT '已修复：索引定义、约束条件、系统配置与设计文档的一致性' AS details;
SELECT '已添加：额外索引、约束、系统配置、视图、存储过程等' AS details;

SET FOREIGN_KEY_CHECKS = 1;

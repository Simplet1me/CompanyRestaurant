DROP DATABASE IF EXISTS company_restaurant;

CREATE DATABASE company_restaurant
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_general_ci;

USE company_restaurant;

CREATE TABLE `user` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name`        VARCHAR(50)  NOT NULL                COMMENT '姓名',
    `login_name`  VARCHAR(50)  NOT NULL                COMMENT '登录名（唯一）',
    `password`    VARCHAR(100) NOT NULL                COMMENT '密码（SHA-256 加盐散列）',
    `phone`       VARCHAR(20)  NOT NULL                COMMENT '联系电话（送餐用）',
    `department`  VARCHAR(50)  DEFAULT NULL            COMMENT '工作单位（部门）',
    `workstation` VARCHAR(100) NOT NULL                COMMENT '工位信息（送餐用）',
    `role`        VARCHAR(20)  NOT NULL DEFAULT 'EMPLOYEE' COMMENT '角色：MANAGER/CHEF/DELIVERER/FINANCE/EMPLOYEE',
    `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_login_name` (`login_name`)
) ENGINE = InnoDB COMMENT = '用户表';

CREATE TABLE `recipe` (
    `id`          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '菜品系统 id',
    `name`        VARCHAR(100)  NOT NULL                COMMENT '菜肴名称',
    `photo`       VARCHAR(255)  DEFAULT NULL            COMMENT '菜品图片 URL',
    `unit`        VARCHAR(20)   NOT NULL                COMMENT '计量单位（份/两/个/例/杯…）',
    `classify`    VARCHAR(50)   NOT NULL                COMMENT '分类（主食/糕点/菜肴/甜点…）',
    `price`       DECIMAL(10,2) NOT NULL                COMMENT '单位价格（元）',
    `create_time` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_classify` (`classify`)
) ENGINE = InnoDB COMMENT = '食谱表（菜品库，菜单的数据来源）';

CREATE TABLE `menu` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '菜单编号',
    `name`        VARCHAR(100) NOT NULL                COMMENT '菜单名字（每次创建独立命名）',
    `status`      VARCHAR(20)  NOT NULL DEFAULT 'USE'  COMMENT '状态：USE 使用中 / HISTORY 历史',
    `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '建立时间',
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`)
) ENGINE = InnoDB COMMENT = '菜单表（同一时刻仅一份 USE，由业务层保证）';

CREATE TABLE `menu_items` (
    `id`          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '菜单项 id',
    `menu_id`     BIGINT        NOT NULL                COMMENT '所属菜单 id',
    `recipe_id`   BIGINT        DEFAULT NULL            COMMENT '来源食谱菜品 id（仅溯源，可空）',
    `name`        VARCHAR(100)  NOT NULL                COMMENT '菜名（快照）',
    `photo`       VARCHAR(255)  DEFAULT NULL            COMMENT '图片 URL（快照）',
    `unit`        VARCHAR(20)   NOT NULL                COMMENT '计量单位（快照）',
    `classify`    VARCHAR(50)   NOT NULL                COMMENT '分类（快照）',
    `price`       DECIMAL(10,2) NOT NULL                COMMENT '单价（快照，可独立修改）',
    `create_time` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_menu_id` (`menu_id`)
) ENGINE = InnoDB COMMENT = '菜单菜品表（创建菜单时从 recipe 快照复制，此后与食谱解耦）';

CREATE TABLE `orders` (
    `id`          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '订单 id',
    `user_id`     BIGINT        NOT NULL                COMMENT '下单用户 id',
    `emp_name`    VARCHAR(50)   NOT NULL                COMMENT '员工姓名（下单时快照）',
    `phone`       VARCHAR(20)   NOT NULL                COMMENT '联系电话（下单时快照，送餐用）',
    `workstation` VARCHAR(100)  DEFAULT NULL            COMMENT '工位信息（下单时快照，送餐用）',
    `meal_date`   DATE          NOT NULL                COMMENT '用餐日期（决定每天一单的唯一性）',
    `status`      VARCHAR(20)   NOT NULL DEFAULT 'VALID' COMMENT '状态：VALID 有效 / CANCELLED 已取消',
    `total_price` DECIMAL(10,2) NOT NULL                COMMENT '总计价格（元）',
    `create_time` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_meal` (`user_id`, `meal_date`),
    KEY `idx_meal_date_status` (`meal_date`, `status`)
) ENGINE = InnoDB COMMENT = '订单表（每个员工每个用餐日期一张订单）';

CREATE TABLE `order_items` (
    `id`           BIGINT        NOT NULL AUTO_INCREMENT COMMENT '明细 id',
    `order_id`     BIGINT        NOT NULL                COMMENT '所属订单 id',
    `menu_item_id` BIGINT        DEFAULT NULL            COMMENT '来源菜单项 id（仅溯源，可空）',
    `name`         VARCHAR(100)  NOT NULL                COMMENT '菜名（下单时快照）',
    `unit`         VARCHAR(20)   NOT NULL                COMMENT '计量单位（快照）',
    `price`        DECIMAL(10,2) NOT NULL                COMMENT '单价（快照，元）',
    `qty`          INT           NOT NULL                COMMENT '分量（正整数，如米饭 4 两）',
    `amount`       DECIMAL(10,2) NOT NULL                COMMENT '合计价格 = 单价 × 分量',
    PRIMARY KEY (`id`),
    KEY `idx_order_id` (`order_id`)
) ENGINE = InnoDB COMMENT = '订单明细表（下单时从 menu_items 快照复制，此后与菜单解耦）';

CREATE TABLE `system_config` (
    `id`           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `config_key`   VARCHAR(50)  NOT NULL                COMMENT '配置键',
    `config_value` VARCHAR(50)  NOT NULL                COMMENT '配置值',
    `description`  VARCHAR(200) DEFAULT NULL            COMMENT '说明',
    `update_time`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE = InnoDB COMMENT = '系统配置表（key-value）';

-- 真实业务接口创建后的数据库快照；图片UUID必须与现有MinIO对象一起保留。
SET NAMES utf8mb4;
SET @OLD_SQL_MODE=@@SQL_MODE;
SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS=0;
DROP DATABASE IF EXISTS `company_restaurant`;
CREATE DATABASE `company_restaurant` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `company_restaurant`;

CREATE TABLE `menu` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '菜单编号',
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '菜单名字（每次创建独立命名）',
  `status` varchar(20) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'USE' COMMENT '状态：USE 使用中 / HISTORY 历史',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '建立时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='菜单表（同一时刻仅一份 USE，由业务层保证）';

CREATE TABLE `menu_items` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '菜单项 id',
  `menu_id` bigint NOT NULL COMMENT '所属菜单 id',
  `recipe_id` bigint DEFAULT NULL COMMENT '来源食谱菜品 id（仅溯源，可空）',
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '菜名（快照）',
  `photo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '图片 URL（快照）',
  `unit` varchar(20) COLLATE utf8mb4_general_ci NOT NULL COMMENT '计量单位（快照）',
  `classify` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '分类（快照）',
  `price` decimal(10,2) NOT NULL COMMENT '单价（快照，可独立修改）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_menu_id` (`menu_id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='菜单菜品表（创建菜单时从 recipe 快照复制，此后与食谱解耦）';

CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '明细 id',
  `order_id` bigint NOT NULL COMMENT '所属订单 id',
  `menu_item_id` bigint DEFAULT NULL COMMENT '来源菜单项 id（仅溯源，可空）',
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '菜名（下单时快照）',
  `unit` varchar(20) COLLATE utf8mb4_general_ci NOT NULL COMMENT '计量单位（快照）',
  `price` decimal(10,2) NOT NULL COMMENT '单价（快照，元）',
  `qty` int NOT NULL COMMENT '分量（正整数，如米饭 4 两）',
  `amount` decimal(10,2) NOT NULL COMMENT '合计价格 = 单价 × 分量',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='订单明细表（下单时从 menu_items 快照复制，此后与菜单解耦）';

CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '订单 id',
  `user_id` bigint NOT NULL COMMENT '下单用户 id',
  `emp_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '员工姓名（下单时快照）',
  `phone` varchar(20) COLLATE utf8mb4_general_ci NOT NULL COMMENT '联系电话（下单时快照，送餐用）',
  `workstation` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '工位信息（下单时快照，送餐用）',
  `meal_date` date NOT NULL COMMENT '用餐日期（决定每天一单的唯一性）',
  `status` varchar(20) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'VALID' COMMENT '状态：VALID 有效 / CANCELLED 已取消',
  `total_price` decimal(10,2) NOT NULL COMMENT '总计价格（元）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_meal` (`user_id`,`meal_date`),
  KEY `idx_meal_date_status` (`meal_date`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='订单表（每个员工每个用餐日期一张订单）';

CREATE TABLE `recipe` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '菜品系统 id',
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '菜肴名称',
  `photo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '菜品图片 URL',
  `unit` varchar(20) COLLATE utf8mb4_general_ci NOT NULL COMMENT '计量单位（份/两/个/例/杯…）',
  `classify` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '分类（主食/糕点/菜肴/甜点…）',
  `price` decimal(10,2) NOT NULL COMMENT '单位价格（元）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_classify` (`classify`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='食谱表（菜品库，菜单的数据来源）';

CREATE TABLE `system_config` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `config_key` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '配置键',
  `config_value` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '配置值',
  `description` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '说明',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='系统配置表（key-value）';

CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '姓名',
  `login_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '登录名（唯一）',
  `password` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '密码（SHA-256 加盐散列）',
  `phone` varchar(20) COLLATE utf8mb4_general_ci NOT NULL COMMENT '联系电话（送餐用）',
  `department` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '工作单位（部门）',
  `workstation` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '工位信息（送餐用）',
  `role` varchar(20) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'EMPLOYEE' COMMENT '角色：MANAGER/CHEF/DELIVERER/FINANCE/EMPLOYEE',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_login_name` (`login_name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户表';

START TRANSACTION;
INSERT INTO `menu` (`id`,`name`,`status`,`create_time`) VALUES (2,'aaa','HISTORY','2026-10-09T23:15:33');
INSERT INTO `menu` (`id`,`name`,`status`,`create_time`) VALUES (3,'111','HISTORY','2026-10-10T08:55:51');
INSERT INTO `menu` (`id`,`name`,`status`,`create_time`) VALUES (4,'经典家常菜单','HISTORY','2026-10-18T21:54:07');
INSERT INTO `menu` (`id`,`name`,`status`,`create_time`) VALUES (5,'清爽轻食菜单','HISTORY','2026-10-18T21:54:07');
INSERT INTO `menu` (`id`,`name`,`status`,`create_time`) VALUES (6,'周日午餐菜单','HISTORY','2026-10-18T21:54:07');
INSERT INTO `menu` (`id`,`name`,`status`,`create_time`) VALUES (7,'周一精选菜单','USE','2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (3,2,2,'米饭','','两','主食',0.30,'2026-10-09T23:15:33');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (5,3,1,'炒白菜','','份','菜肴',5.00,'2026-10-10T08:55:51');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (6,3,2,'米饭','','两','主食',0.30,'2026-10-10T09:15:52');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (7,3,3,'光明记忆水晶','/uploads/image/ecdd2a13-c2f6-4bf2-a2ef-b8f6bcf35d2c.png','个','主食',10.00,'2026-10-18T14:27:48');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (8,4,4,'香软米饭','/uploads/image/4836f596-1b8b-4d1a-b43f-495c3b9e9687.jpeg','碗','主食',2.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (9,4,6,'宫保鸡丁','/uploads/image/2b968cad-075a-4684-8db7-0aaa684d9bcf.jpeg','份','菜肴',16.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (10,4,7,'麻婆豆腐','/uploads/image/c5b28b9c-c5fe-421b-bf2b-5812e1012733.jpeg','份','菜肴',8.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (11,4,10,'清炒西兰花','/uploads/image/4f1c5852-00eb-44c7-84b1-f1906a9abd47.jpeg','份','素菜',7.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (12,4,11,'蛋花汤','/uploads/image/3fd841c2-3a28-4b1b-8148-d0217b8a9090.jpeg','碗','汤品',3.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (13,4,12,'黄金小馒头','/uploads/image/1d493fd0-b74c-46aa-a8ae-093ed0c2d958.jpeg','个','糕点',2.50,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (14,5,4,'香软米饭','/uploads/image/4836f596-1b8b-4d1a-b43f-495c3b9e9687.jpeg','碗','主食',2.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (15,5,5,'什锦炒饭','/uploads/image/f954fb16-287b-4045-a6cd-4daf20777920.jpeg','份','主食',9.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (16,5,8,'番茄炒蛋','/uploads/image/75cd0c18-bee3-482b-baae-bb914ead7156.jpeg','份','菜肴',10.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (17,5,10,'清炒西兰花','/uploads/image/4f1c5852-00eb-44c7-84b1-f1906a9abd47.jpeg','份','素菜',7.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (18,5,11,'蛋花汤','/uploads/image/3fd841c2-3a28-4b1b-8148-d0217b8a9090.jpeg','碗','汤品',3.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (19,5,13,'凉拌黄瓜','/uploads/image/c93b343d-5a56-4121-91dd-ed33be6c6e01.jpeg','份','凉菜',6.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (20,6,4,'香软米饭','/uploads/image/4836f596-1b8b-4d1a-b43f-495c3b9e9687.jpeg','碗','主食',2.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (21,6,6,'宫保鸡丁','/uploads/image/2b968cad-075a-4684-8db7-0aaa684d9bcf.jpeg','份','菜肴',15.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (22,6,7,'麻婆豆腐','/uploads/image/c5b28b9c-c5fe-421b-bf2b-5812e1012733.jpeg','份','菜肴',8.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (23,6,8,'番茄炒蛋','/uploads/image/75cd0c18-bee3-482b-baae-bb914ead7156.jpeg','份','菜肴',10.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (24,6,9,'红烧肉','/uploads/image/52008551-eb6b-411c-ac57-78b4b48e7b02.jpeg','份','菜肴',20.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (25,6,10,'清炒西兰花','/uploads/image/4f1c5852-00eb-44c7-84b1-f1906a9abd47.jpeg','份','素菜',7.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (26,6,11,'蛋花汤','/uploads/image/3fd841c2-3a28-4b1b-8148-d0217b8a9090.jpeg','碗','汤品',3.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (27,6,12,'黄金小馒头','/uploads/image/1d493fd0-b74c-46aa-a8ae-093ed0c2d958.jpeg','个','糕点',2.50,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (28,6,13,'凉拌黄瓜','/uploads/image/c93b343d-5a56-4121-91dd-ed33be6c6e01.jpeg','份','凉菜',6.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (29,7,4,'香软米饭','/uploads/image/4836f596-1b8b-4d1a-b43f-495c3b9e9687.jpeg','碗','主食',2.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (30,7,5,'什锦炒饭','/uploads/image/f954fb16-287b-4045-a6cd-4daf20777920.jpeg','份','主食',9.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (31,7,6,'宫保鸡丁','/uploads/image/2b968cad-075a-4684-8db7-0aaa684d9bcf.jpeg','份','菜肴',16.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (32,7,7,'麻婆豆腐','/uploads/image/c5b28b9c-c5fe-421b-bf2b-5812e1012733.jpeg','份','菜肴',8.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (33,7,8,'番茄炒蛋','/uploads/image/75cd0c18-bee3-482b-baae-bb914ead7156.jpeg','份','菜肴',10.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (34,7,9,'红烧肉','/uploads/image/52008551-eb6b-411c-ac57-78b4b48e7b02.jpeg','份','菜肴',20.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (35,7,10,'清炒西兰花','/uploads/image/4f1c5852-00eb-44c7-84b1-f1906a9abd47.jpeg','份','素菜',7.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (36,7,11,'蛋花汤','/uploads/image/3fd841c2-3a28-4b1b-8148-d0217b8a9090.jpeg','碗','汤品',3.00,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (37,7,12,'黄金小馒头','/uploads/image/1d493fd0-b74c-46aa-a8ae-093ed0c2d958.jpeg','个','糕点',2.50,'2026-10-18T21:54:07');
INSERT INTO `menu_items` (`id`,`menu_id`,`recipe_id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`) VALUES (38,7,13,'凉拌黄瓜','/uploads/image/c93b343d-5a56-4121-91dd-ed33be6c6e01.jpeg','份','凉菜',6.00,'2026-10-18T21:54:07');
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (1,1,1,'炒白菜','份',5.00,2,10.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (2,1,2,'米饭','两',0.30,4,1.20);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (3,2,1,'炒白菜','份',5.00,2,10.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (4,2,2,'米饭','两',0.30,2,0.60);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (5,3,20,'香软米饭','碗',2.00,1,2.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (6,3,21,'宫保鸡丁','份',15.00,1,15.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (7,3,25,'清炒西兰花','份',7.00,1,7.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (8,3,26,'蛋花汤','碗',3.00,1,3.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (9,4,20,'香软米饭','碗',2.00,2,4.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (10,4,24,'红烧肉','份',20.00,1,20.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (11,4,28,'凉拌黄瓜','份',6.00,1,6.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (12,5,20,'香软米饭','碗',2.00,1,2.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (13,5,22,'麻婆豆腐','份',8.00,1,8.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (14,5,23,'番茄炒蛋','份',10.00,1,10.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (15,5,26,'蛋花汤','碗',3.00,1,3.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (16,6,20,'香软米饭','碗',2.00,1,2.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (17,6,23,'番茄炒蛋','份',10.00,1,10.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (18,6,25,'清炒西兰花','份',7.00,1,7.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (19,6,27,'黄金小馒头','个',2.50,2,5.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (20,7,20,'香软米饭','碗',2.00,1,2.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (21,7,21,'宫保鸡丁','份',15.00,1,15.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (22,7,26,'蛋花汤','碗',3.00,1,3.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (23,7,28,'凉拌黄瓜','份',6.00,1,6.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (24,8,20,'香软米饭','碗',2.00,1,2.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (25,8,22,'麻婆豆腐','份',8.00,1,8.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (26,8,25,'清炒西兰花','份',7.00,1,7.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (27,8,26,'蛋花汤','碗',3.00,1,3.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (28,9,30,'什锦炒饭','份',9.00,1,9.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (29,9,33,'番茄炒蛋','份',10.00,1,10.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (30,9,36,'蛋花汤','碗',3.00,1,3.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (31,10,29,'香软米饭','碗',2.00,2,4.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (32,10,31,'宫保鸡丁','份',16.00,1,16.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (33,10,35,'清炒西兰花','份',7.00,1,7.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (34,11,29,'香软米饭','碗',2.00,1,2.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (35,11,34,'红烧肉','份',20.00,1,20.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (36,11,36,'蛋花汤','碗',3.00,1,3.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (37,12,29,'香软米饭','碗',2.00,1,2.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (38,12,32,'麻婆豆腐','份',8.00,1,8.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (39,12,38,'凉拌黄瓜','份',6.00,1,6.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (40,12,37,'黄金小馒头','个',2.50,2,5.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (41,13,29,'香软米饭','碗',2.00,1,2.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (42,13,31,'宫保鸡丁','份',16.00,1,16.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (43,13,33,'番茄炒蛋','份',10.00,1,10.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (44,13,36,'蛋花汤','碗',3.00,1,3.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (45,14,30,'什锦炒饭','份',9.00,1,9.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (46,14,35,'清炒西兰花','份',7.00,1,7.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (47,14,36,'蛋花汤','碗',3.00,1,3.00);
INSERT INTO `order_items` (`id`,`order_id`,`menu_item_id`,`name`,`unit`,`price`,`qty`,`amount`) VALUES (48,14,37,'黄金小馒头','个',2.50,1,2.50);
INSERT INTO `orders` (`id`,`user_id`,`emp_name`,`phone`,`workstation`,`meal_date`,`status`,`total_price`,`create_time`) VALUES (1,1,'刘明','12200993311','XX楼301室','2026-10-09','VALID',11.20,'2026-10-08T12:53:56');
INSERT INTO `orders` (`id`,`user_id`,`emp_name`,`phone`,`workstation`,`meal_date`,`status`,`total_price`,`create_time`) VALUES (2,2,'张伟','13900001111','A栋502','2026-10-10','VALID',10.60,'2026-10-09T23:13:53');
INSERT INTO `orders` (`id`,`user_id`,`emp_name`,`phone`,`workstation`,`meal_date`,`status`,`total_price`,`create_time`) VALUES (3,7,'刘明','13800001001','餐厅办公室101','2026-10-18','VALID',27.00,'2026-10-18T21:54:07');
INSERT INTO `orders` (`id`,`user_id`,`emp_name`,`phone`,`workstation`,`meal_date`,`status`,`total_price`,`create_time`) VALUES (4,8,'王建国','13800001002','厨房操作间','2026-10-18','VALID',30.00,'2026-10-18T21:54:07');
INSERT INTO `orders` (`id`,`user_id`,`emp_name`,`phone`,`workstation`,`meal_date`,`status`,`total_price`,`create_time`) VALUES (5,9,'赵小川','13800001003','配餐台A区','2026-10-18','VALID',23.00,'2026-10-18T21:54:07');
INSERT INTO `orders` (`id`,`user_id`,`emp_name`,`phone`,`workstation`,`meal_date`,`status`,`total_price`,`create_time`) VALUES (6,10,'陈静','13800001004','行政楼203','2026-10-18','VALID',24.00,'2026-10-18T21:54:07');
INSERT INTO `orders` (`id`,`user_id`,`emp_name`,`phone`,`workstation`,`meal_date`,`status`,`total_price`,`create_time`) VALUES (7,11,'张伟','13800001005','研发楼A301-01','2026-10-18','VALID',26.00,'2026-10-18T21:54:07');
INSERT INTO `orders` (`id`,`user_id`,`emp_name`,`phone`,`workstation`,`meal_date`,`status`,`total_price`,`create_time`) VALUES (8,12,'李娜','13800001006','办公楼B205-03','2026-10-18','VALID',20.00,'2026-10-18T21:54:07');
INSERT INTO `orders` (`id`,`user_id`,`emp_name`,`phone`,`workstation`,`meal_date`,`status`,`total_price`,`create_time`) VALUES (9,7,'刘明','13800001001','餐厅办公室101','2026-10-19','VALID',22.00,'2026-10-18T21:54:07');
INSERT INTO `orders` (`id`,`user_id`,`emp_name`,`phone`,`workstation`,`meal_date`,`status`,`total_price`,`create_time`) VALUES (10,8,'王建国','13800001002','厨房操作间','2026-10-19','VALID',27.00,'2026-10-18T21:54:07');
INSERT INTO `orders` (`id`,`user_id`,`emp_name`,`phone`,`workstation`,`meal_date`,`status`,`total_price`,`create_time`) VALUES (11,9,'赵小川','13800001003','配餐台A区','2026-10-19','VALID',25.00,'2026-10-18T21:54:07');
INSERT INTO `orders` (`id`,`user_id`,`emp_name`,`phone`,`workstation`,`meal_date`,`status`,`total_price`,`create_time`) VALUES (12,10,'陈静','13800001004','行政楼203','2026-10-19','VALID',21.00,'2026-10-18T21:54:07');
INSERT INTO `orders` (`id`,`user_id`,`emp_name`,`phone`,`workstation`,`meal_date`,`status`,`total_price`,`create_time`) VALUES (13,11,'张伟','13800001005','研发楼A301-01','2026-10-19','VALID',31.00,'2026-10-18T21:54:08');
INSERT INTO `orders` (`id`,`user_id`,`emp_name`,`phone`,`workstation`,`meal_date`,`status`,`total_price`,`create_time`) VALUES (14,12,'李娜','13800001006','办公楼B205-03','2026-10-19','VALID',21.50,'2026-10-18T21:54:08');
INSERT INTO `recipe` (`id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`,`update_time`) VALUES (1,'炒白菜','','份','菜肴',5.00,'2026-10-08T12:53:48','2026-10-08T12:53:48');
INSERT INTO `recipe` (`id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`,`update_time`) VALUES (2,'米饭','','两','主食',0.30,'2026-10-08T12:53:48','2026-10-08T12:53:48');
INSERT INTO `recipe` (`id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`,`update_time`) VALUES (3,'光明记忆水晶','/uploads/image/ecdd2a13-c2f6-4bf2-a2ef-b8f6bcf35d2c.png','个','主食',10.00,'2026-10-18T14:27:32','2026-10-18T14:27:32');
INSERT INTO `recipe` (`id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`,`update_time`) VALUES (4,'香软米饭','/uploads/image/4836f596-1b8b-4d1a-b43f-495c3b9e9687.jpeg','碗','主食',2.00,'2026-10-18T21:54:06','2026-10-18T21:54:06');
INSERT INTO `recipe` (`id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`,`update_time`) VALUES (5,'什锦炒饭','/uploads/image/f954fb16-287b-4045-a6cd-4daf20777920.jpeg','份','主食',9.00,'2026-10-18T21:54:06','2026-10-18T21:54:06');
INSERT INTO `recipe` (`id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`,`update_time`) VALUES (6,'宫保鸡丁','/uploads/image/2b968cad-075a-4684-8db7-0aaa684d9bcf.jpeg','份','菜肴',16.00,'2026-10-18T21:54:06','2026-10-18T21:54:06');
INSERT INTO `recipe` (`id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`,`update_time`) VALUES (7,'麻婆豆腐','/uploads/image/c5b28b9c-c5fe-421b-bf2b-5812e1012733.jpeg','份','菜肴',8.00,'2026-10-18T21:54:06','2026-10-18T21:54:06');
INSERT INTO `recipe` (`id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`,`update_time`) VALUES (8,'番茄炒蛋','/uploads/image/75cd0c18-bee3-482b-baae-bb914ead7156.jpeg','份','菜肴',10.00,'2026-10-18T21:54:06','2026-10-18T21:54:06');
INSERT INTO `recipe` (`id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`,`update_time`) VALUES (9,'红烧肉','/uploads/image/52008551-eb6b-411c-ac57-78b4b48e7b02.jpeg','份','菜肴',20.00,'2026-10-18T21:54:06','2026-10-18T21:54:06');
INSERT INTO `recipe` (`id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`,`update_time`) VALUES (10,'清炒西兰花','/uploads/image/4f1c5852-00eb-44c7-84b1-f1906a9abd47.jpeg','份','素菜',7.00,'2026-10-18T21:54:06','2026-10-18T21:54:06');
INSERT INTO `recipe` (`id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`,`update_time`) VALUES (11,'蛋花汤','/uploads/image/3fd841c2-3a28-4b1b-8148-d0217b8a9090.jpeg','碗','汤品',3.00,'2026-10-18T21:54:07','2026-10-18T21:54:07');
INSERT INTO `recipe` (`id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`,`update_time`) VALUES (12,'黄金小馒头','/uploads/image/1d493fd0-b74c-46aa-a8ae-093ed0c2d958.jpeg','个','糕点',2.50,'2026-10-18T21:54:07','2026-10-18T21:54:07');
INSERT INTO `recipe` (`id`,`name`,`photo`,`unit`,`classify`,`price`,`create_time`,`update_time`) VALUES (13,'凉拌黄瓜','/uploads/image/c93b343d-5a56-4121-91dd-ed33be6c6e01.jpeg','份','凉菜',6.00,'2026-10-18T21:54:07','2026-10-18T21:54:07');
INSERT INTO `system_config` (`id`,`config_key`,`config_value`,`description`,`update_time`) VALUES (1,'order_deadline','09:00','订餐截止时间（HH:mm）','2026-10-18T21:54:08');
INSERT INTO `system_config` (`id`,`config_key`,`config_value`,`description`,`update_time`) VALUES (2,'serve_start_time','11:30','配餐开始时间（HH:mm，必须晚于订餐截止时间）','2026-10-18T21:54:08');
INSERT INTO `user` (`id`,`name`,`login_name`,`password`,`phone`,`department`,`workstation`,`role`,`create_time`,`update_time`) VALUES (1,'刘明','liuming','f43fa7885cecd4a4c53b6782ad162818063817241ce98ea519048b74420b3e39','12200993311','综合部','XX楼301室','MANAGER','2026-10-08T12:53:25','2026-10-08T12:53:25');
INSERT INTO `user` (`id`,`name`,`login_name`,`password`,`phone`,`department`,`workstation`,`role`,`create_time`,`update_time`) VALUES (2,'张伟','zhangwei','f43fa7885cecd4a4c53b6782ad162818063817241ce98ea519048b74420b3e39','13900001111','研发部','A栋502','EMPLOYEE','2026-10-08T12:53:25','2026-10-08T12:53:25');
INSERT INTO `user` (`id`,`name`,`login_name`,`password`,`phone`,`department`,`workstation`,`role`,`create_time`,`update_time`) VALUES (7,'刘明','manager','f43fa7885cecd4a4c53b6782ad162818063817241ce98ea519048b74420b3e39','13800001001','餐饮管理部','餐厅办公室101','MANAGER','2026-10-18T21:54:05','2026-10-18T21:54:05');
INSERT INTO `user` (`id`,`name`,`login_name`,`password`,`phone`,`department`,`workstation`,`role`,`create_time`,`update_time`) VALUES (8,'王建国','chef','f43fa7885cecd4a4c53b6782ad162818063817241ce98ea519048b74420b3e39','13800001002','后厨','厨房操作间','CHEF','2026-10-18T21:54:05','2026-10-18T21:54:05');
INSERT INTO `user` (`id`,`name`,`login_name`,`password`,`phone`,`department`,`workstation`,`role`,`create_time`,`update_time`) VALUES (9,'赵小川','deliverer','f43fa7885cecd4a4c53b6782ad162818063817241ce98ea519048b74420b3e39','13800001003','配送组','配餐台A区','DELIVERER','2026-10-18T21:54:05','2026-10-18T21:54:05');
INSERT INTO `user` (`id`,`name`,`login_name`,`password`,`phone`,`department`,`workstation`,`role`,`create_time`,`update_time`) VALUES (10,'陈静','finance','f43fa7885cecd4a4c53b6782ad162818063817241ce98ea519048b74420b3e39','13800001004','财务部','行政楼203','FINANCE','2026-10-18T21:54:06','2026-10-18T21:54:06');
INSERT INTO `user` (`id`,`name`,`login_name`,`password`,`phone`,`department`,`workstation`,`role`,`create_time`,`update_time`) VALUES (11,'张伟','employee01','f43fa7885cecd4a4c53b6782ad162818063817241ce98ea519048b74420b3e39','13800001005','研发部','研发楼A301-01','EMPLOYEE','2026-10-18T21:54:06','2026-10-18T21:54:06');
INSERT INTO `user` (`id`,`name`,`login_name`,`password`,`phone`,`department`,`workstation`,`role`,`create_time`,`update_time`) VALUES (12,'李娜','employee02','f43fa7885cecd4a4c53b6782ad162818063817241ce98ea519048b74420b3e39','13800001006','市场部','办公楼B205-03','EMPLOYEE','2026-10-18T21:54:06','2026-10-18T21:54:06');
INSERT INTO `user` (`id`,`name`,`login_name`,`password`,`phone`,`department`,`workstation`,`role`,`create_time`,`update_time`) VALUES (13,'周晨','employee03','f43fa7885cecd4a4c53b6782ad162818063817241ce98ea519048b74420b3e39','13800001007','人事部','行政楼202-05','EMPLOYEE','2026-10-18T21:54:06','2026-10-18T21:54:06');
COMMIT;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET SQL_MODE=@OLD_SQL_MODE;

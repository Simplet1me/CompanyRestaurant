package com.simplet1me.companyrestaurant.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户实体，对应表 user
 */
@Data
public class User {

    /** 主键 */
    private Long id;

    /** 姓名 */
    private String name;

    /** 登录名（唯一） */
    private String loginName;

    /** 密码（BCrypt 密文） */
    private String password;

    /** 联系电话（送餐用） */
    private String phone;

    /** 工作单位（部门） */
    private String department;

    /** 工位信息（送餐用） */
    private String workstation;

    /** 角色：MANAGER/CHEF/DELIVERER/FINANCE/EMPLOYEE */
    private String role;

    /** 创建时间 */
    private LocalDateTime createTime;

    /** 更新时间 */
    private LocalDateTime updateTime;
}

package com.simplet1me.companyrestaurant.entity;

/**
 * 系统角色。
 * 任何角色的用户都拥有普通员工的点餐权限。
 */
public enum Role {

    /** 餐厅经理（系统管理员） */
    MANAGER,

    /** 厨房主管 */
    CHEF,

    /** 配餐员 */
    DELIVERER,

    /** 财务管理 */
    FINANCE,

    /** 企业员工 */
    EMPLOYEE
}

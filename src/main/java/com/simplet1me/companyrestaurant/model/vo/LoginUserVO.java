package com.simplet1me.companyrestaurant.model.vo;

import lombok.Data;

/**
 * 登录用户信息（会话与接口响应共用，不含密码）
 */
@Data
public class LoginUserVO {

    private Long id;

    private String name;

    private String loginName;

    /** 角色：MANAGER/CHEF/DELIVERER/FINANCE/EMPLOYEE */
    private String role;

    private String phone;

    private String department;

    private String workstation;
}

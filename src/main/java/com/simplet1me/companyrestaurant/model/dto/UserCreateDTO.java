package com.simplet1me.companyrestaurant.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 管理员新增用户请求体
 */
@Data
public class UserCreateDTO {

    @NotBlank(message = "姓名不能为空")
    private String name;

    @NotBlank(message = "登录名不能为空")
    private String loginName;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 32, message = "密码长度须为 6~32 位")
    private String password;

    @NotBlank(message = "联系电话不能为空")
    private String phone;

    private String department;

    @NotBlank(message = "工位信息不能为空")
    private String workstation;

    /** 角色：MANAGER/CHEF/DELIVERER/FINANCE/EMPLOYEE */
    @NotBlank(message = "角色不能为空")
    private String role;
}

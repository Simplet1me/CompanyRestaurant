package com.simplet1me.companyrestaurant.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 注册请求体。
 * 自助注册的用户角色固定为 EMPLOYEE，管理员添加/批量导入由用户管理模块提供。
 */
@Data
public class RegisterDTO {

    @NotBlank(message = "姓名不能为空")
    private String name;

    @NotBlank(message = "登录名不能为空")
    private String loginName;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 32, message = "密码长度须为 6~32 位")
    private String password;

    @NotBlank(message = "联系电话不能为空")
    private String phone;

    /** 工作单位（部门），可选 */
    private String department;

    @NotBlank(message = "工位信息不能为空")
    private String workstation;
}

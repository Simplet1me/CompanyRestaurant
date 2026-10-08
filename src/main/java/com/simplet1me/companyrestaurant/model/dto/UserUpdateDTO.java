package com.simplet1me.companyrestaurant.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 管理员修改用户请求体（不含密码）
 */
@Data
public class UserUpdateDTO {

    @NotBlank(message = "姓名不能为空")
    private String name;

    @NotBlank(message = "联系电话不能为空")
    private String phone;

    private String department;

    @NotBlank(message = "工位信息不能为空")
    private String workstation;

    @NotBlank(message = "角色不能为空")
    private String role;
}

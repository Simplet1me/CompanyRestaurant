package com.simplet1me.companyrestaurant.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 登录请求体
 */
@Data
public class LoginDTO {

    @NotBlank(message = "登录名不能为空")
    private String loginName;

    @NotBlank(message = "密码不能为空")
    private String password;

    /** 记住我（选做，暂未启用） */
    private Boolean rememberMe;
}

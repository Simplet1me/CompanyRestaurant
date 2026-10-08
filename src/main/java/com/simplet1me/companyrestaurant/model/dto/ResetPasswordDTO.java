package com.simplet1me.companyrestaurant.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 管理员重置用户密码请求体
 */
@Data
public class ResetPasswordDTO {

    @NotBlank(message = "新密码不能为空")
    @Size(min = 6, max = 32, message = "密码长度须为 6~32 位")
    private String newPassword;
}

package com.simplet1me.companyrestaurant.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 系统参数（订餐时间）请求体，格式 HH:mm
 */
@Data
public class ConfigDTO {

    @NotBlank(message = "订餐截止时间不能为空")
    private String orderDeadline;

    @NotBlank(message = "配餐开始时间不能为空")
    private String serveStartTime;
}

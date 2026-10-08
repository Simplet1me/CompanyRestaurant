package com.simplet1me.companyrestaurant.model.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 下单明细请求体
 */
@Data
public class OrderItemDTO {

    /** 菜单项 id（必须属于当前使用中菜单） */
    @NotNull(message = "menuItemId 不能为空")
    private Long menuItemId;

    /** 分量（正整数，如米饭 4 两） */
    @NotNull(message = "分量不能为空")
    @Min(value = 1, message = "分量必须为正整数")
    private Integer qty;
}

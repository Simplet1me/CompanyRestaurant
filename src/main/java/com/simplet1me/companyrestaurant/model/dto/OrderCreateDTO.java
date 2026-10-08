package com.simplet1me.companyrestaurant.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * 下单请求体（用餐日期由服务端按订餐时间窗口计算，前端无需传）
 */
@Data
public class OrderCreateDTO {

    @NotEmpty(message = "点餐明细不能为空")
    @Valid
    private List<OrderItemDTO> items;
}

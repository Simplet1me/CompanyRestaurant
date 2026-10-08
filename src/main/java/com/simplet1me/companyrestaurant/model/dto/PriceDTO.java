package com.simplet1me.companyrestaurant.model.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 修改菜单菜品价格请求体
 */
@Data
public class PriceDTO {

    @NotNull(message = "价格不能为空")
    @DecimalMin(value = "0.01", message = "价格必须大于 0")
    private BigDecimal price;
}

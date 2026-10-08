package com.simplet1me.companyrestaurant.model.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 食谱菜品新增/修改请求体
 */
@Data
public class RecipeDTO {

    @NotBlank(message = "菜肴名称不能为空")
    private String name;

    /** 菜品图片 URL（上传功能 TODO，可先填外链） */
    private String photo;

    @NotBlank(message = "计量单位不能为空")
    private String unit;

    @NotBlank(message = "分类不能为空")
    private String classify;

    @NotNull(message = "单位价格不能为空")
    @DecimalMin(value = "0.01", message = "单位价格必须大于 0")
    private BigDecimal price;
}

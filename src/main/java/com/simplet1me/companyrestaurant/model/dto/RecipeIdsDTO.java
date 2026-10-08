package com.simplet1me.companyrestaurant.model.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * 向菜单添加菜品请求体
 */
@Data
public class RecipeIdsDTO {

    @NotEmpty(message = "recipeIds 不能为空")
    private List<Long> recipeIds;
}

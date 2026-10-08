package com.simplet1me.companyrestaurant.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * 创建菜单请求体
 */
@Data
public class MenuCreateDTO {

    @NotBlank(message = "菜单名字不能为空")
    private String name;

    /** 从食谱选择的菜品 id 数组（菜品信息以快照复制入菜单） */
    @NotEmpty(message = "至少选择一种菜品")
    private List<Long> recipeIds;
}

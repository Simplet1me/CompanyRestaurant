package com.simplet1me.companyrestaurant.controller;

import com.simplet1me.companyrestaurant.annotation.RequireRole;
import com.simplet1me.companyrestaurant.common.PageResult;
import com.simplet1me.companyrestaurant.common.Result;
import com.simplet1me.companyrestaurant.entity.Recipe;
import com.simplet1me.companyrestaurant.entity.Role;
import com.simplet1me.companyrestaurant.model.dto.IdsDTO;
import com.simplet1me.companyrestaurant.model.dto.RecipeDTO;
import com.simplet1me.companyrestaurant.service.RecipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 食谱管理接口（增删改与批量删除：餐厅经理、厨房主管；查看：登录即可）
 */
@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    /** 食谱列表（分页） */
    @GetMapping
    public Result<PageResult<Recipe>> pageList(@RequestParam(defaultValue = "1") int pageNum,
                                               @RequestParam(defaultValue = "10") int pageSize,
                                               @RequestParam(required = false) String keyword,
                                               @RequestParam(required = false) String classify) {
        return Result.success(recipeService.pageList(pageNum, pageSize, keyword, classify));
    }

    /** 新增菜品 */
    @PostMapping
    @RequireRole({Role.MANAGER, Role.CHEF})
    public Result<Recipe> create(@Valid @RequestBody RecipeDTO dto) {
        return Result.success(recipeService.create(dto));
    }

    /** 菜品详情 */
    @GetMapping("/{id}")
    public Result<Recipe> getById(@PathVariable Long id) {
        return Result.success(recipeService.getById(id));
    }

    /** 修改菜品 */
    @PutMapping("/{id}")
    @RequireRole({Role.MANAGER, Role.CHEF})
    public Result<Recipe> update(@PathVariable Long id, @Valid @RequestBody RecipeDTO dto) {
        return Result.success(recipeService.update(id, dto));
    }

    /** 删除菜品 */
    @DeleteMapping("/{id}")
    @RequireRole({Role.MANAGER, Role.CHEF})
    public Result<Void> delete(@PathVariable Long id) {
        recipeService.delete(id);
        return Result.success();
    }

    /** 批量删除菜品 */
    @DeleteMapping("/batch")
    @RequireRole({Role.MANAGER, Role.CHEF})
    public Result<Void> deleteBatch(@Valid @RequestBody IdsDTO dto) {
        recipeService.deleteBatch(dto.getIds());
        return Result.success();
    }
}

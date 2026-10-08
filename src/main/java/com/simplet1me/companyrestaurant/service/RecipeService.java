package com.simplet1me.companyrestaurant.service;

import com.simplet1me.companyrestaurant.common.PageResult;
import com.simplet1me.companyrestaurant.entity.Recipe;
import com.simplet1me.companyrestaurant.model.dto.RecipeDTO;

import java.util.List;

/**
 * 食谱管理服务（餐厅经理、厨房主管）
 */
public interface RecipeService {

    PageResult<Recipe> pageList(int pageNum, int pageSize, String keyword, String classify);

    Recipe create(RecipeDTO dto);

    Recipe getById(Long id);

    Recipe update(Long id, RecipeDTO dto);

    void delete(Long id);

    void deleteBatch(List<Long> ids);
}

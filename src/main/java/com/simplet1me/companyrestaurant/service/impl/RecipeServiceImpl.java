package com.simplet1me.companyrestaurant.service.impl;

import com.simplet1me.companyrestaurant.common.BusinessException;
import com.simplet1me.companyrestaurant.common.PageResult;
import com.simplet1me.companyrestaurant.entity.Recipe;
import com.simplet1me.companyrestaurant.mapper.RecipeMapper;
import com.simplet1me.companyrestaurant.model.dto.RecipeDTO;
import com.simplet1me.companyrestaurant.service.RecipeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 食谱管理服务实现。
 * 食谱是菜品库，菜单从食谱快照选菜，因此食谱的增删改不影响已有菜单与订单。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecipeServiceImpl implements RecipeService {

    private final RecipeMapper recipeMapper;

    @Override
    public PageResult<Recipe> pageList(int pageNum, int pageSize, String keyword, String classify) {
        pageNum = Math.max(pageNum, 1);
        pageSize = Math.min(Math.max(pageSize, 1), 100);
        int offset = (pageNum - 1) * pageSize;
        long total = recipeMapper.countByCond(keyword, classify);
        List<Recipe> list = recipeMapper.pageList(keyword, classify, offset, pageSize);
        return PageResult.of(total, list);
    }

    @Override
    public Recipe create(RecipeDTO dto) {
        Recipe recipe = new Recipe();
        recipe.setName(dto.getName());
        recipe.setPhoto(dto.getPhoto());
        recipe.setUnit(dto.getUnit());
        recipe.setClassify(dto.getClassify());
        recipe.setPrice(dto.getPrice());
        recipeMapper.insert(recipe);
        log.info("新增菜品: id={}, name={}", recipe.getId(), recipe.getName());
        return recipe;
    }

    @Override
    public Recipe getById(Long id) {
        return requireRecipe(id);
    }

    @Override
    public Recipe update(Long id, RecipeDTO dto) {
        Recipe recipe = requireRecipe(id);
        recipe.setName(dto.getName());
        recipe.setPhoto(dto.getPhoto());
        recipe.setUnit(dto.getUnit());
        recipe.setClassify(dto.getClassify());
        recipe.setPrice(dto.getPrice());
        recipeMapper.update(recipe);
        return recipe;
    }

    @Override
    public void delete(Long id) {
        requireRecipe(id);
        recipeMapper.deleteById(id);
        log.info("删除菜品: id={}", id);
    }

    @Override
    public void deleteBatch(List<Long> ids) {
        recipeMapper.deleteByIds(ids);
        log.info("批量删除菜品: ids={}", ids);
    }

    private Recipe requireRecipe(Long id) {
        Recipe recipe = recipeMapper.findById(id);
        if (recipe == null) {
            throw new BusinessException("菜品不存在");
        }
        return recipe;
    }
}

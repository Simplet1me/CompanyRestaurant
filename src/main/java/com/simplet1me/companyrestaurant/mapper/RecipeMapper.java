package com.simplet1me.companyrestaurant.mapper;

import com.simplet1me.companyrestaurant.entity.Recipe;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 食谱表 Mapper
 */
public interface RecipeMapper {

    List<Recipe> pageList(@Param("keyword") String keyword, @Param("classify") String classify,
                          @Param("offset") int offset, @Param("size") int size);

    long countByCond(@Param("keyword") String keyword, @Param("classify") String classify);

    Recipe findById(@Param("id") Long id);

    int insert(Recipe recipe);

    int update(Recipe recipe);

    int deleteById(@Param("id") Long id);

    int deleteByIds(@Param("ids") List<Long> ids);
}

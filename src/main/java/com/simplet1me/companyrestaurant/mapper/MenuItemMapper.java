package com.simplet1me.companyrestaurant.mapper;

import com.simplet1me.companyrestaurant.entity.MenuItem;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.List;

/**
 * 菜单菜品表 Mapper（快照）
 */
public interface MenuItemMapper {

    List<MenuItem> findByMenuId(@Param("menuId") Long menuId);

    List<MenuItem> findByMenuIds(@Param("menuIds") List<Long> menuIds);

    MenuItem findById(@Param("id") Long id);

    int insertBatch(@Param("items") List<MenuItem> items);

    int updatePrice(@Param("id") Long id, @Param("price") BigDecimal price);

    int deleteById(@Param("id") Long id);

    int deleteByMenuId(@Param("menuId") Long menuId);
}

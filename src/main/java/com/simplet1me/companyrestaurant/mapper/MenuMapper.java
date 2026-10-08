package com.simplet1me.companyrestaurant.mapper;

import com.simplet1me.companyrestaurant.entity.Menu;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 菜单表 Mapper
 */
public interface MenuMapper {

    List<Menu> pageList(@Param("offset") int offset, @Param("size") int size);

    long countAll();

    Menu findById(@Param("id") Long id);

    /** 当前使用中的菜单（业务层保证至多一份） */
    Menu findByStatus(@Param("status") String status);

    int insert(Menu menu);

    int deleteById(@Param("id") Long id);

    /** 将所有 USE 菜单转为 HISTORY（启用新菜单时调用） */
    int updateStatusWhereUse(@Param("status") String status);

    int updateStatusById(@Param("id") Long id, @Param("status") String status);
}

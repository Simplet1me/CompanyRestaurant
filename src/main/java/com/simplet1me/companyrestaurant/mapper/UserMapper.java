package com.simplet1me.companyrestaurant.mapper;

import com.simplet1me.companyrestaurant.entity.User;
import org.apache.ibatis.annotations.Param;

/**
 * 用户表 Mapper（由启动类 @MapperScan 扫描注册）
 */
public interface UserMapper {

    /**
     * 按主键查询用户
     */
    User findById(@Param("id") Long id);

    /**
     * 按登录名查询用户
     */
    User findByLoginName(@Param("loginName") String loginName);

    /**
     * 新增用户（id 回填）
     */
    int insert(User user);

    /**
     * 修改密码
     */
    int updatePassword(@Param("id") Long id, @Param("password") String password);
}

package com.simplet1me.companyrestaurant.annotation;

import com.simplet1me.companyrestaurant.entity.Role;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 角色权限注解：标注在 Controller 方法上，由 RoleInterceptor 校验。
 * 未标注的方法任何登录用户均可访问（任何角色都拥有普通员工权限）。
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {

    /** 允许访问的角色列表 */
    Role[] value();
}

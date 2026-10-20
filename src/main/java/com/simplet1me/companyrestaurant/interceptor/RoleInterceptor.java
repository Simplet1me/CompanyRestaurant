package com.simplet1me.companyrestaurant.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simplet1me.companyrestaurant.annotation.RequireRole;
import com.simplet1me.companyrestaurant.common.Result;
import com.simplet1me.companyrestaurant.common.ResultCode;
import com.simplet1me.companyrestaurant.entity.Role;
import com.simplet1me.companyrestaurant.model.vo.LoginUserVO;
import com.simplet1me.companyrestaurant.utils.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

/**
 * 角色权限拦截器：校验 Controller 方法上 @RequireRole 声明的角色（在 LoginInterceptor 之后执行，此时已登录）
 */
@Component
public class RoleInterceptor implements HandlerInterceptor {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    // 对请求进行拦截，检查是否符合权限
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        // 放行普通接口，所有人允许访问
        RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
        if (requireRole == null) {
            return true;
        }

        // 获取用户的权限
        LoginUserVO loginUser = SessionUtil.getLoginUser(request.getSession(false));
        // 与接口允许的权限进行对比，如果正确，放行请求
        if (loginUser != null && hasRole(loginUser.getRole(), requireRole.value())) {
            return true;
        }

        response.setStatus(ResultCode.FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(
                OBJECT_MAPPER.writeValueAsString(Result.error(ResultCode.FORBIDDEN, "无权限操作")));
        return false;
    }

    private boolean hasRole(String userRole, Role[] allowedRoles) {
        // 先进行合法性检查，在进行对比
        try {
            Role role = Role.valueOf(userRole);
            return Arrays.asList(allowedRoles).contains(role);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}

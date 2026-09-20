package com.simplet1me.companyrestaurant.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simplet1me.companyrestaurant.common.Result;
import com.simplet1me.companyrestaurant.common.ResultCode;
import com.simplet1me.companyrestaurant.utils.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;

/**
 * 登录拦截器：Session 中无登录用户时统一返回 401
 */
@Component
public class LoginInterceptor implements HandlerInterceptor {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        // CORS 预检请求直接放行
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        HttpSession session = request.getSession(false);
        if (session != null && SessionUtil.getLoginUser(session) != null) {
            return true;
        }
        response.setStatus(ResultCode.UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(
                OBJECT_MAPPER.writeValueAsString(Result.error(ResultCode.UNAUTHORIZED, "未登录或会话已过期")));
        return false;
    }
}

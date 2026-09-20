package com.simplet1me.companyrestaurant.utils;

import com.simplet1me.companyrestaurant.model.vo.LoginUserVO;
import jakarta.servlet.http.HttpSession;

/**
 * 会话工具：登录用户信息存于 HttpSession（由 Cookie 携带 JSESSIONID 维持会话）
 */
public final class SessionUtil {

    /** Session 中登录用户的键 */
    public static final String LOGIN_USER_KEY = "loginUser";

    private SessionUtil() {
    }

    public static void setLoginUser(HttpSession session, LoginUserVO user) {
        session.setAttribute(LOGIN_USER_KEY, user);
    }

    public static LoginUserVO getLoginUser(HttpSession session) {
        return session == null ? null : (LoginUserVO) session.getAttribute(LOGIN_USER_KEY);
    }

    public static void clear(HttpSession session) {
        session.invalidate();
    }
}

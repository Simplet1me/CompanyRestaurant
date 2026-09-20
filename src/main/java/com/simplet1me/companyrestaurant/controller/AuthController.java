package com.simplet1me.companyrestaurant.controller;

import com.simplet1me.companyrestaurant.common.Result;
import com.simplet1me.companyrestaurant.model.dto.ChangePasswordDTO;
import com.simplet1me.companyrestaurant.model.dto.LoginDTO;
import com.simplet1me.companyrestaurant.model.dto.RegisterDTO;
import com.simplet1me.companyrestaurant.model.vo.LoginUserVO;
import com.simplet1me.companyrestaurant.service.AuthService;
import com.simplet1me.companyrestaurant.utils.SessionUtil;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 认证接口：登录 / 注册 / 登出 / 当前用户 / 修改密码
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 登录：成功后 Session 保存登录用户，响应自动携带 JSESSIONID Cookie
     */
    @PostMapping("/login")
    public Result<LoginUserVO> login(@Valid @RequestBody LoginDTO loginDTO, HttpSession session) {
        LoginUserVO vo = authService.login(loginDTO);
        SessionUtil.setLoginUser(session, vo);
        return Result.success(vo);
    }

    /**
     * 注册：自助注册（角色固定为企业员工），注册成功即建立会话
     */
    @PostMapping("/register")
    public Result<LoginUserVO> register(@Valid @RequestBody RegisterDTO registerDTO, HttpSession session) {
        LoginUserVO vo = authService.register(registerDTO);
        SessionUtil.setLoginUser(session, vo);
        return Result.success(vo);
    }

    /**
     * 登出：销毁会话
     */
    @PostMapping("/logout")
    public Result<Void> logout(HttpSession session) {
        SessionUtil.clear(session);
        return Result.success();
    }

    /**
     * 当前登录用户
     */
    @GetMapping("/me")
    public Result<LoginUserVO> me(HttpSession session) {
        return Result.success(SessionUtil.getLoginUser(session));
    }

    /**
     * 修改自己的密码
     */
    @PutMapping("/password")
    public Result<Void> changePassword(@Valid @RequestBody ChangePasswordDTO dto, HttpSession session) {
        LoginUserVO loginUser = SessionUtil.getLoginUser(session);
        authService.changePassword(loginUser.getId(), dto);
        return Result.success();
    }
}

package com.simplet1me.companyrestaurant.service;

import com.simplet1me.companyrestaurant.model.dto.ChangePasswordDTO;
import com.simplet1me.companyrestaurant.model.dto.LoginDTO;
import com.simplet1me.companyrestaurant.model.dto.RegisterDTO;
import com.simplet1me.companyrestaurant.model.vo.LoginUserVO;

/**
 * 认证服务：登录 / 注册 / 修改密码
 */
public interface AuthService {

    /**
     * 登录：校验登录名与密码，返回登录用户信息
     */
    LoginUserVO login(LoginDTO loginDTO);

    /**
     * 注册：自助注册，角色固定为 EMPLOYEE，返回注册用户信息
     */
    LoginUserVO register(RegisterDTO registerDTO);

    /**
     * 修改自己的密码
     */
    void changePassword(Long userId, ChangePasswordDTO dto);
}

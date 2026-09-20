package com.simplet1me.companyrestaurant.service.impl;

import com.simplet1me.companyrestaurant.common.BusinessException;
import com.simplet1me.companyrestaurant.entity.Role;
import com.simplet1me.companyrestaurant.entity.User;
import com.simplet1me.companyrestaurant.mapper.UserMapper;
import com.simplet1me.companyrestaurant.model.dto.ChangePasswordDTO;
import com.simplet1me.companyrestaurant.model.dto.LoginDTO;
import com.simplet1me.companyrestaurant.model.dto.RegisterDTO;
import com.simplet1me.companyrestaurant.model.vo.LoginUserVO;
import com.simplet1me.companyrestaurant.service.AuthService;
import com.simplet1me.companyrestaurant.utils.SHA256Util;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 认证服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;

    /** SHA-256 加盐散列，盐值配置在 application-local.yml（PasswordProperties 加载） */
    private final SHA256Util SHA256Util;

    @Override
    public LoginUserVO login(LoginDTO loginDTO) {
        User user = userMapper.findByLoginName(loginDTO.getLoginName());
        // 统一提示，不区分"用户不存在"与"密码错误"
        if (user == null || !SHA256Util.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }
        log.info("用户登录成功: loginName={}", user.getLoginName());
        return toVO(user);
    }

    @Override
    public LoginUserVO register(RegisterDTO registerDTO) {
        if (userMapper.findByLoginName(registerDTO.getLoginName()) != null) {
            throw new BusinessException("登录名已存在");
        }

        User user = new User();
        user.setName(registerDTO.getName());
        user.setLoginName(registerDTO.getLoginName());
        user.setPassword(SHA256Util.encode(registerDTO.getPassword()));
        user.setPhone(registerDTO.getPhone());
        user.setDepartment(registerDTO.getDepartment());
        user.setWorkstation(registerDTO.getWorkstation());
        // 自助注册的角色固定为企业员工
        user.setRole(Role.EMPLOYEE.name());

        userMapper.insert(user);
        log.info("新用户注册成功: loginName={}, id={}", user.getLoginName(), user.getId());
        return toVO(user);
    }

    @Override
    public void changePassword(Long userId, ChangePasswordDTO dto) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        if (!SHA256Util.matches(dto.getOldPassword(), user.getPassword())) {
            throw new BusinessException("原密码不正确");
        }
        userMapper.updatePassword(userId, SHA256Util.encode(dto.getNewPassword()));
        log.info("用户修改密码成功: userId={}", userId);
    }

    private LoginUserVO toVO(User user) {
        LoginUserVO vo = new LoginUserVO();
        vo.setId(user.getId());
        vo.setName(user.getName());
        vo.setLoginName(user.getLoginName());
        vo.setRole(user.getRole());
        vo.setPhone(user.getPhone());
        vo.setDepartment(user.getDepartment());
        vo.setWorkstation(user.getWorkstation());
        return vo;
    }
}

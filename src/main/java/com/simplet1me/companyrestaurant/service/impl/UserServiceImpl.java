package com.simplet1me.companyrestaurant.service.impl;

import com.simplet1me.companyrestaurant.common.BusinessException;
import com.simplet1me.companyrestaurant.common.PageResult;
import com.simplet1me.companyrestaurant.entity.Role;
import com.simplet1me.companyrestaurant.entity.User;
import com.simplet1me.companyrestaurant.mapper.OrderMapper;
import com.simplet1me.companyrestaurant.mapper.UserMapper;
import com.simplet1me.companyrestaurant.model.dto.ResetPasswordDTO;
import com.simplet1me.companyrestaurant.model.dto.UserCreateDTO;
import com.simplet1me.companyrestaurant.model.dto.UserUpdateDTO;
import com.simplet1me.companyrestaurant.model.vo.UserVO;
import com.simplet1me.companyrestaurant.service.UserService;
import com.simplet1me.companyrestaurant.utils.SHA256Util;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 用户管理服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    private final OrderMapper orderMapper;

    private final SHA256Util SHA256Util;

    @Override
    public PageResult<UserVO> pageList(int pageNum, int pageSize, String keyword, String role, String department) {
        pageNum = Math.max(pageNum, 1);
        pageSize = Math.min(Math.max(pageSize, 1), 100);
        int offset = (pageNum - 1) * pageSize;
        long total = userMapper.countByCond(keyword, role, department);
        List<UserVO> list = userMapper.pageList(keyword, role, department, offset, pageSize)
                .stream().map(this::toVO).toList();
        return PageResult.of(total, list);
    }

    @Override
    public UserVO create(UserCreateDTO dto) {
        checkRole(dto.getRole());
        if (userMapper.findByLoginName(dto.getLoginName()) != null) {
            throw new BusinessException("登录名已存在");
        }
        User user = new User();
        user.setName(dto.getName());
        user.setLoginName(dto.getLoginName());
        user.setPassword(SHA256Util.encode(dto.getPassword()));
        user.setPhone(dto.getPhone());
        user.setDepartment(dto.getDepartment());
        user.setWorkstation(dto.getWorkstation());
        user.setRole(dto.getRole());
        userMapper.insert(user);
        log.info("管理员新增用户: loginName={}, role={}", user.getLoginName(), user.getRole());
        return toVO(user);
    }

    @Override
    public UserVO getById(Long id) {
        return toVO(requireUser(id));
    }

    @Override
    public UserVO update(Long id, UserUpdateDTO dto) {
        checkRole(dto.getRole());
        User user = requireUser(id);
        user.setName(dto.getName());
        user.setPhone(dto.getPhone());
        user.setDepartment(dto.getDepartment());
        user.setWorkstation(dto.getWorkstation());
        user.setRole(dto.getRole());
        userMapper.update(user);
        return toVO(user);
    }

    @Override
    public void delete(Long id, Long currentUserId) {
        if (id.equals(currentUserId)) {
            throw new BusinessException("不能删除自己");
        }
        requireUser(id);
        if (orderMapper.countValidByUserId(id) > 0) {
            throw new BusinessException("该用户存在有效订单，不允许删除");
        }
        userMapper.deleteById(id);
        log.info("删除用户: userId={}", id);
    }

    @Override
    public void resetPassword(Long id, ResetPasswordDTO dto) {
        requireUser(id);
        userMapper.updatePassword(id, SHA256Util.encode(dto.getNewPassword()));
        log.info("重置用户密码: userId={}", id);
    }

    private User requireUser(Long id) {
        User user = userMapper.findById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return user;
    }

    private void checkRole(String role) {
        try {
            Role.valueOf(role);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("非法的角色值: " + role);
        }
    }

    private UserVO toVO(User user) {
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setName(user.getName());
        vo.setLoginName(user.getLoginName());
        vo.setRole(user.getRole());
        vo.setPhone(user.getPhone());
        vo.setDepartment(user.getDepartment());
        vo.setWorkstation(user.getWorkstation());
        vo.setCreateTime(user.getCreateTime());
        return vo;
    }
}

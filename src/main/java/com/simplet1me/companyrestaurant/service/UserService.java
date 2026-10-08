package com.simplet1me.companyrestaurant.service;

import com.simplet1me.companyrestaurant.common.PageResult;
import com.simplet1me.companyrestaurant.model.dto.ResetPasswordDTO;
import com.simplet1me.companyrestaurant.model.dto.UserCreateDTO;
import com.simplet1me.companyrestaurant.model.dto.UserUpdateDTO;
import com.simplet1me.companyrestaurant.model.vo.UserVO;

/**
 * 用户管理服务（餐厅经理）
 */
public interface UserService {

    PageResult<UserVO> pageList(int pageNum, int pageSize, String keyword, String role, String department);

    UserVO create(UserCreateDTO dto);

    UserVO getById(Long id);

    UserVO update(Long id, UserUpdateDTO dto);

    void delete(Long id, Long currentUserId);

    void resetPassword(Long id, ResetPasswordDTO dto);
}

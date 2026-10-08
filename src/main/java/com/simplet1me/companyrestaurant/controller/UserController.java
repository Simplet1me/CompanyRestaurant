package com.simplet1me.companyrestaurant.controller;

import com.simplet1me.companyrestaurant.annotation.RequireRole;
import com.simplet1me.companyrestaurant.common.PageResult;
import com.simplet1me.companyrestaurant.common.Result;
import com.simplet1me.companyrestaurant.entity.Role;
import com.simplet1me.companyrestaurant.model.dto.ResetPasswordDTO;
import com.simplet1me.companyrestaurant.model.dto.UserCreateDTO;
import com.simplet1me.companyrestaurant.model.dto.UserUpdateDTO;
import com.simplet1me.companyrestaurant.model.vo.LoginUserVO;
import com.simplet1me.companyrestaurant.model.vo.UserVO;
import com.simplet1me.companyrestaurant.service.UserService;
import com.simplet1me.companyrestaurant.utils.SessionUtil;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 用户管理接口（餐厅经理）。
 * TODO 2.7 批量导入用户（Excel 上传）暂未实现，待文件上传模块完成后补充。
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** 用户列表（分页） */
    @GetMapping
    @RequireRole(Role.MANAGER)
    public Result<PageResult<UserVO>> pageList(@RequestParam(defaultValue = "1") int pageNum,
                                               @RequestParam(defaultValue = "10") int pageSize,
                                               @RequestParam(required = false) String keyword,
                                               @RequestParam(required = false) String role,
                                               @RequestParam(required = false) String department) {
        return Result.success(userService.pageList(pageNum, pageSize, keyword, role, department));
    }

    /** 新增用户 */
    @PostMapping
    @RequireRole(Role.MANAGER)
    public Result<UserVO> create(@Valid @RequestBody UserCreateDTO dto) {
        return Result.success(userService.create(dto));
    }

    /** 用户详情 */
    @GetMapping("/{id}")
    @RequireRole(Role.MANAGER)
    public Result<UserVO> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }

    /** 修改用户 */
    @PutMapping("/{id}")
    @RequireRole(Role.MANAGER)
    public Result<UserVO> update(@PathVariable Long id, @Valid @RequestBody UserUpdateDTO dto) {
        return Result.success(userService.update(id, dto));
    }

    /** 删除用户 */
    @DeleteMapping("/{id}")
    @RequireRole(Role.MANAGER)
    public Result<Void> delete(@PathVariable Long id, HttpSession session) {
        LoginUserVO loginUser = SessionUtil.getLoginUser(session);
        userService.delete(id, loginUser.getId());
        return Result.success();
    }

    /** 重置用户密码 */
    @PutMapping("/{id}/password")
    @RequireRole(Role.MANAGER)
    public Result<Void> resetPassword(@PathVariable Long id, @Valid @RequestBody ResetPasswordDTO dto) {
        userService.resetPassword(id, dto);
        return Result.success();
    }
}

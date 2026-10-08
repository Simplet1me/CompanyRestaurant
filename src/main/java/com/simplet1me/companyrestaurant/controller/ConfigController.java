package com.simplet1me.companyrestaurant.controller;

import com.simplet1me.companyrestaurant.annotation.RequireRole;
import com.simplet1me.companyrestaurant.common.Result;
import com.simplet1me.companyrestaurant.entity.Role;
import com.simplet1me.companyrestaurant.model.dto.ConfigDTO;
import com.simplet1me.companyrestaurant.service.ConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 系统配置接口（查询：登录即可；修改：餐厅经理）
 */
@RestController
@RequestMapping("/api/configs")
@RequiredArgsConstructor
public class ConfigController {

    private final ConfigService configService;

    /** 查询系统参数 */
    @GetMapping
    public Result<ConfigDTO> getConfig() {
        return Result.success(configService.getConfig());
    }

    /** 修改系统参数（订餐截止时间/配餐开始时间） */
    @PutMapping
    @RequireRole(Role.MANAGER)
    public Result<ConfigDTO> update(@Valid @RequestBody ConfigDTO dto) {
        return Result.success(configService.update(dto));
    }
}

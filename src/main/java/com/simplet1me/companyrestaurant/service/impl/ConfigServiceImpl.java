package com.simplet1me.companyrestaurant.service.impl;

import com.simplet1me.companyrestaurant.common.BusinessException;
import com.simplet1me.companyrestaurant.entity.SystemConfig;
import com.simplet1me.companyrestaurant.mapper.SystemConfigMapper;
import com.simplet1me.companyrestaurant.model.dto.ConfigDTO;
import com.simplet1me.companyrestaurant.service.ConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeParseException;

/**
 * 系统配置服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConfigServiceImpl implements ConfigService {

    private final SystemConfigMapper systemConfigMapper;

    @Override
    public ConfigDTO getConfig() {
        ConfigDTO dto = new ConfigDTO();
        dto.setOrderDeadline(getValue(SystemConfig.KEY_ORDER_DEADLINE, DEFAULT_ORDER_DEADLINE));
        dto.setServeStartTime(getValue(SystemConfig.KEY_SERVE_START_TIME, DEFAULT_SERVE_START_TIME));
        return dto;
    }

    @Override
    public ConfigDTO update(ConfigDTO dto) {
        LocalTime deadline = parseTime(dto.getOrderDeadline(), "订餐截止时间");
        LocalTime serveStart = parseTime(dto.getServeStartTime(), "配餐开始时间");
        if (!serveStart.isAfter(deadline)) {
            throw new BusinessException("配餐开始时间必须晚于订餐截止时间");
        }
        systemConfigMapper.upsert(SystemConfig.KEY_ORDER_DEADLINE, dto.getOrderDeadline(), "订餐截止时间（HH:mm）");
        systemConfigMapper.upsert(SystemConfig.KEY_SERVE_START_TIME, dto.getServeStartTime(), "配餐开始时间（HH:mm，必须晚于订餐截止时间）");
        log.info("更新订餐时间配置: deadline={}, serveStart={}", dto.getOrderDeadline(), dto.getServeStartTime());
        return dto;
    }

    @Override
    public LocalTime getOrderDeadline() {
        return parseTime(getValue(SystemConfig.KEY_ORDER_DEADLINE, DEFAULT_ORDER_DEADLINE), "订餐截止时间");
    }

    @Override
    public LocalTime getServeStartTime() {
        return parseTime(getValue(SystemConfig.KEY_SERVE_START_TIME, DEFAULT_SERVE_START_TIME), "配餐开始时间");
    }

    private String getValue(String key, String defaultValue) {
        SystemConfig config = systemConfigMapper.findByKey(key);
        return config == null ? defaultValue : config.getConfigValue();
    }

    private LocalTime parseTime(String value, String name) {
        try {
            return LocalTime.parse(value);
        } catch (DateTimeParseException e) {
            throw new BusinessException(name + "格式非法，应为 HH:mm");
        }
    }
}

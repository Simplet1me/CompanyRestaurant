package com.simplet1me.companyrestaurant.service;

import com.simplet1me.companyrestaurant.model.dto.ConfigDTO;

import java.time.LocalTime;

/**
 * 系统配置服务：订餐截止时间 / 配餐开始时间（可自定义，未配置时使用默认值）
 */
public interface ConfigService {

    /** 默认订餐截止时间 */
    String DEFAULT_ORDER_DEADLINE = "09:00";

    /** 默认配餐开始时间 */
    String DEFAULT_SERVE_START_TIME = "11:30";

    ConfigDTO getConfig();

    ConfigDTO update(ConfigDTO dto);

    LocalTime getOrderDeadline();

    LocalTime getServeStartTime();
}

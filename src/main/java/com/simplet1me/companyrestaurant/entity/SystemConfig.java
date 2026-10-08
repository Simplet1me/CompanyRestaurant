package com.simplet1me.companyrestaurant.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 系统配置实体（key-value），对应表 system_config
 */
@Data
public class SystemConfig {

    /** 订餐截止时间 配置键 */
    public static final String KEY_ORDER_DEADLINE = "order_deadline";

    /** 配餐开始时间 配置键 */
    public static final String KEY_SERVE_START_TIME = "serve_start_time";

    /** 主键 */
    private Long id;

    /** 配置键 */
    private String configKey;

    /** 配置值 */
    private String configValue;

    /** 说明 */
    private String description;

    /** 更新时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;
}

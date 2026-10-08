package com.simplet1me.companyrestaurant.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 菜单实体，对应表 menu
 */
@Data
public class Menu {

    public static final String STATUS_USE = "USE";
    public static final String STATUS_HISTORY = "HISTORY";

    /** 菜单编号 */
    private Long id;

    /** 菜单名字 */
    private String name;

    /** 状态：USE 使用中 / HISTORY 历史 */
    private String status;

    /** 建立时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
}

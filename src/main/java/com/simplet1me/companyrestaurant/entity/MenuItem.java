package com.simplet1me.companyrestaurant.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 菜单菜品实体（快照），对应表 menu_items。
 * 创建菜单时从 recipe 复制，此后与食谱解耦，价格可独立修改。
 */
@Data
public class MenuItem {

    /** 菜单项 id */
    private Long id;

    /** 所属菜单 id */
    private Long menuId;

    /** 来源食谱菜品 id（仅溯源，可空） */
    private Long recipeId;

    /** 菜名（快照） */
    private String name;

    /** 图片 URL（快照） */
    private String photo;

    /** 计量单位（快照） */
    private String unit;

    /** 分类（快照） */
    private String classify;

    /** 单价（快照，可独立修改） */
    private BigDecimal price;

    /** 创建时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
}

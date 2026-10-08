package com.simplet1me.companyrestaurant.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 食谱实体（菜品库），对应表 recipe
 */
@Data
public class Recipe {

    /** 菜品系统 id */
    private Long id;

    /** 菜肴名称 */
    private String name;

    /** 菜品图片 URL */
    private String photo;

    /** 计量单位（份/两/个/例/杯…） */
    private String unit;

    /** 分类（主食/糕点/菜肴/甜点…） */
    private String classify;

    /** 单位价格（元） */
    private BigDecimal price;

    /** 创建时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;

    /** 更新时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;
}

package com.simplet1me.companyrestaurant.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.simplet1me.companyrestaurant.entity.MenuItem;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 菜单视图（含菜单菜品明细）
 */
@Data
public class MenuVO {

    private Long id;

    private String name;

    /** USE 使用中 / HISTORY 历史 */
    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;

    /** 菜单菜品（快照） */
    private List<MenuItem> items;
}

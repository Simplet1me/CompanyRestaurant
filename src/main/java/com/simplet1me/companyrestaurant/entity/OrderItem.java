package com.simplet1me.companyrestaurant.entity;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 订单明细实体（快照），对应表 order_items。
 * 下单时从 menu_items 复制，此后与菜单解耦。
 */
@Data
public class OrderItem {

    /** 明细 id */
    private Long id;

    /** 所属订单 id */
    private Long orderId;

    /** 来源菜单项 id（仅溯源，可空） */
    private Long menuItemId;

    /** 菜名（下单时快照） */
    private String name;

    /** 计量单位（快照） */
    private String unit;

    /** 单价（快照，元） */
    private BigDecimal price;

    /** 分量（正整数，如米饭 4 两） */
    private Integer qty;

    /** 合计价格 = 单价 × 分量 */
    private BigDecimal amount;
}

package com.simplet1me.companyrestaurant.model.vo;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 订单明细视图
 */
@Data
public class OrderItemVO {

    private Long id;

    /** 菜名（下单时快照） */
    private String name;

    /** 计量单位（快照） */
    private String unit;

    /** 单价（快照，元） */
    private BigDecimal price;

    /** 分量 */
    private Integer qty;

    /** 合计价格 = 单价 × 分量 */
    private BigDecimal amount;
}

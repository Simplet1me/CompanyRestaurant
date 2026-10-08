package com.simplet1me.companyrestaurant.model.vo;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 报表菜品统计行（月度统计/个人消费统计/总括订单共用）
 */
@Data
public class ReportItemVO {

    /** 菜名 */
    private String name;

    /** 计量单位 */
    private String unit;

    /** 分量合计 */
    private Long totalQty;

    /** 加权平均单价 = 金额合计 ÷ 分量合计（Java 侧计算） */
    private BigDecimal avgPrice;

    /** 金额合计 */
    private BigDecimal totalAmount;
}

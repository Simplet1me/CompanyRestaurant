package com.simplet1me.companyrestaurant.model.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 月度销售统计总报表视图
 */
@Data
public class MonthlyReportVO {

    /** 统计年月 yyyy-MM */
    private String month;

    /** 菜品统计信息（按菜名+单位分组） */
    private List<ReportItemVO> items;

    /** 总计价格（元） */
    private BigDecimal totalAmount;
}

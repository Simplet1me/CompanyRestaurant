package com.simplet1me.companyrestaurant.model.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 员工月度订单汇总表视图
 */
@Data
public class EmployeeReportVO {

    /** 统计年月 yyyy-MM */
    private String month;

    /** 员工信息 */
    private UserVO employee;

    /** 该月全部订单（每天一单） */
    private List<OrderVO> orders;

    /** 月度合计金额（元） */
    private BigDecimal monthTotalAmount;
}

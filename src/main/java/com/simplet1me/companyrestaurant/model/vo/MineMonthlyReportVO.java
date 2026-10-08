package com.simplet1me.companyrestaurant.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 个人月度消费统计汇总表视图（月度报表 + 员工信息）
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MineMonthlyReportVO extends MonthlyReportVO {

    /** 员工信息（姓名/联系电话/工位） */
    private UserVO employee;
}

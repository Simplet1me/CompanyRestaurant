package com.simplet1me.companyrestaurant.service;

import com.simplet1me.companyrestaurant.model.vo.EmployeeReportVO;
import com.simplet1me.companyrestaurant.model.vo.MineMonthlyReportVO;
import com.simplet1me.companyrestaurant.model.vo.MonthlyReportVO;

/**
 * 统计报表服务。
 * 统计口径：按用餐日期归属月份，已取消订单不计入；单价为加权平均（金额合计÷分量合计）。
 * TODO 报表导出 Excel（EasyExcel）暂未实现。
 */
public interface ReportService {

    /** 月度销售统计总报表（经理/财务） */
    MonthlyReportVO monthly(String month);

    /** 员工月度订单汇总表（经理/财务） */
    EmployeeReportVO employeeMonthly(Long userId, String month);

    /** 个人月度消费统计汇总表（查自己） */
    MineMonthlyReportVO mineMonthly(Long userId, String month);

    /** 个人月度订单汇总表（查自己） */
    EmployeeReportVO mineOrders(Long userId, String month);
}

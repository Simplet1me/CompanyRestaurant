package com.simplet1me.companyrestaurant.service;

import com.simplet1me.companyrestaurant.model.vo.*;
import com.simplet1me.companyrestaurant.utils.ExcelUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class ReportExportService {
    public ResponseEntity<byte[]> monthly(String title, MonthlyReportVO report) throws IOException {
        List<List<?>> rows = new ArrayList<>();
        String employee = report instanceof MineMonthlyReportVO mine ? mine.getEmployee().getName() : "全部员工";
        for (ReportItemVO item : report.getItems()) {
            rows.add(Arrays.asList(report.getMonth(), employee, item.getName(), item.getUnit(), item.getTotalQty(), item.getAvgPrice(), item.getTotalAmount()));
        }
        rows.add(Arrays.asList(report.getMonth(), employee, "合计", "", "", "", report.getTotalAmount()));
        return ExcelUtil.download(title + "_" + report.getMonth(),
                List.of("月份", "员工", "菜品", "单位", "分量", "加权均价（元）", "金额（元）"), rows);
    }

    public ResponseEntity<byte[]> orders(String title, EmployeeReportVO report) throws IOException {
        List<List<?>> rows = new ArrayList<>();
        UserVO user = report.getEmployee();
        for (OrderVO order : report.getOrders()) {
            for (OrderItemVO item : order.getItems()) {
                rows.add(Arrays.asList(report.getMonth(), user.getName(), user.getPhone(), user.getDepartment(), user.getWorkstation(),
                        order.getId().toString(), order.getMealDate(), order.getCreateTime(), item.getName(), item.getUnit(), item.getQty(), item.getPrice(), item.getAmount()));
            }
        }
        rows.add(Arrays.asList(report.getMonth(), user.getName(), user.getPhone(), user.getDepartment(), user.getWorkstation(), "", "", "", "月度合计", "", "", "", report.getMonthTotalAmount()));
        return ExcelUtil.download(title + "_" + report.getMonth(),
                List.of("月份", "姓名", "联系电话", "部门", "工位", "订单编号", "用餐日期", "下单时间", "菜品", "单位", "数量", "单价（元）", "金额（元）"), rows);
    }
}

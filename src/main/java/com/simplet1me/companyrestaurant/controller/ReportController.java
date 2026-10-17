package com.simplet1me.companyrestaurant.controller;

import com.simplet1me.companyrestaurant.annotation.RequireRole;
import com.simplet1me.companyrestaurant.common.Result;
import com.simplet1me.companyrestaurant.entity.Role;
import com.simplet1me.companyrestaurant.model.vo.EmployeeReportVO;
import com.simplet1me.companyrestaurant.model.vo.LoginUserVO;
import com.simplet1me.companyrestaurant.model.vo.MineMonthlyReportVO;
import com.simplet1me.companyrestaurant.model.vo.MonthlyReportVO;
import com.simplet1me.companyrestaurant.model.vo.UserVO;
import com.simplet1me.companyrestaurant.service.ReportService;
import com.simplet1me.companyrestaurant.service.ReportExportService;
import com.simplet1me.companyrestaurant.service.UserService;
import com.simplet1me.companyrestaurant.common.PageResult;
import org.springframework.http.ResponseEntity;
import java.io.IOException;
import com.simplet1me.companyrestaurant.utils.SessionUtil;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 统计报表接口。
 * 月度销售统计/员工月度订单汇总：经理、财务；个人报表：登录即可（查自己）。
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final ReportExportService reportExportService;
    private final UserService userService;

    @GetMapping("/employees")
    @RequireRole({Role.MANAGER, Role.FINANCE})
    public Result<PageResult<UserVO>> employees(
            @RequestParam(required = false) String keyword) {
        return Result.success(userService.pageList(1, 100, keyword, null, null));
    }

    @GetMapping("/monthly/export")
    @RequireRole({Role.MANAGER, Role.FINANCE})
    public ResponseEntity<byte[]> exportMonthly(@RequestParam String month) throws IOException {
        return reportExportService.monthly("月度销售统计总报表", reportService.monthly(month));
    }

    @GetMapping("/employee/{userId}/export")
    @RequireRole({Role.MANAGER, Role.FINANCE})
    public ResponseEntity<byte[]> exportEmployee(@PathVariable Long userId, @RequestParam String month) throws IOException {
        return reportExportService.orders("员工月度订单汇总表", reportService.employeeMonthly(userId, month));
    }

    @GetMapping("/mine/monthly/export")
    public ResponseEntity<byte[]> exportMineMonthly(@RequestParam String month, HttpSession session) throws IOException {
        return reportExportService.monthly("个人月度消费统计汇总表", reportService.mineMonthly(SessionUtil.getLoginUser(session).getId(), month));
    }

    @GetMapping("/mine/orders/export")
    public ResponseEntity<byte[]> exportMineOrders(@RequestParam String month, HttpSession session) throws IOException {
        return reportExportService.orders("个人月度订单汇总表", reportService.mineOrders(SessionUtil.getLoginUser(session).getId(), month));
    }

    /** 月度销售统计总报表 */
    @GetMapping("/monthly")
    @RequireRole({Role.MANAGER, Role.FINANCE})
    public Result<MonthlyReportVO> monthly(@RequestParam String month) {
        return Result.success(reportService.monthly(month));
    }

    /** 员工月度订单汇总表 */
    @GetMapping("/employee/{userId}")
    @RequireRole({Role.MANAGER, Role.FINANCE})
    public Result<EmployeeReportVO> employeeMonthly(@PathVariable Long userId, @RequestParam String month) {
        return Result.success(reportService.employeeMonthly(userId, month));
    }

    /** 个人月度消费统计汇总表 */
    @GetMapping("/mine/monthly")
    public Result<MineMonthlyReportVO> mineMonthly(@RequestParam String month, HttpSession session) {
        LoginUserVO loginUser = SessionUtil.getLoginUser(session);
        return Result.success(reportService.mineMonthly(loginUser.getId(), month));
    }

    /** 个人月度订单汇总表 */
    @GetMapping("/mine/orders")
    public Result<EmployeeReportVO> mineOrders(@RequestParam String month, HttpSession session) {
        LoginUserVO loginUser = SessionUtil.getLoginUser(session);
        return Result.success(reportService.mineOrders(loginUser.getId(), month));
    }
}

package com.simplet1me.companyrestaurant.service;

import com.simplet1me.companyrestaurant.common.BusinessException;
import com.simplet1me.companyrestaurant.model.dto.UserCreateDTO;
import com.simplet1me.companyrestaurant.model.vo.*;
import com.simplet1me.companyrestaurant.utils.ExcelUtil;
import jakarta.validation.Validation;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ExcelFeaturesTests {
    private final UserService users = mock(UserService.class);

    private UserImportService importer() {
        return new UserImportService(users, Validation.buildDefaultValidatorFactory().getValidator());
    }

    @Test void templateSeparatesExampleFromImportData() throws Exception {
        byte[] bytes = importer().template().getBody();
        assertNotNull(bytes);
        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            assertEquals(3, workbook.getNumberOfSheets());
            assertEquals(0, workbook.getSheet("用户数据").getLastRowNum());
            assertEquals("zhangsan", workbook.getSheet("填写示例").getRow(1).getCell(1).getStringCellValue());
            assertEquals("@", workbook.getSheet("用户数据").getColumnStyle(3).getDataFormatString());
        }
        assertThrows(BusinessException.class, () -> importer().importUsers(new MockMultipartFile("file", "template.xlsx", "", bytes)));
        verifyNoInteractions(users);
    }

    @Test void importsValidRowsAndReportsInvalidDuplicateAndFormulaRows() throws Exception {
        when(users.create(any())).thenAnswer(invocation -> {
            UserCreateDTO dto = invocation.getArgument(0);
            if (dto.getLoginName().equals("duplicate")) throw new BusinessException("登录名已存在");
            return new UserVO();
        });
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = ExcelUtil.addSheet(workbook, "用户数据", UserImportService.HEADERS, List.of(
                List.of("员工", "first", "abc123", "0013800138000", "", "A01", "EMPLOYEE"),
                List.of("", "invalid", "abc123", "13800138000", "", "A02", "EMPLOYEE"),
                List.of("重复", "duplicate", "abc123", "13800138000", "", "A03", "EMPLOYEE"),
                List.of("公式", "formula", "abc123", "13800138000", "", "A04", "EMPLOYEE")));
        sheet.getRow(4).getCell(0).setCellFormula("1+1");
        var result = importer().importUsers(file(workbook));
        assertEquals(1, result.successCount());
        assertEquals(List.of(3, 4, 5), result.failures().stream().map(UserImportService.Failure::row).toList());
        ArgumentCaptor<UserCreateDTO> saved = ArgumentCaptor.forClass(UserCreateDTO.class);
        verify(users, times(2)).create(saved.capture());
        assertEquals("0013800138000", saved.getAllValues().getFirst().getPhone());
    }

    @Test void rejectsBadHeaderBeforeAnyInsert() throws Exception {
        Workbook workbook = new XSSFWorkbook();
        ExcelUtil.addSheet(workbook, "用户数据", List.of("错误表头"), List.of(List.of("员工")));
        assertThrows(BusinessException.class, () -> importer().importUsers(file(workbook)));
        verifyNoInteractions(users);
    }

    @Test void rejectsOversizedRowCountAndCorruptFiles() throws Exception {
        Workbook workbook = new XSSFWorkbook();
        ExcelUtil.addSheet(workbook, "用户数据", UserImportService.HEADERS, List.of()).createRow(1001);
        assertThrows(BusinessException.class, () -> importer().importUsers(file(workbook)));
        assertThrows(BusinessException.class, () -> importer().importUsers(new MockMultipartFile("file", "bad.xlsx", "", new byte[]{1, 2, 3})));
        verifyNoInteractions(users);
    }

    @Test void exportsNumericMoneyAndTextWithoutFormulaInjection() throws Exception {
        MonthlyReportVO report = new MonthlyReportVO();
        report.setMonth("2026-10");
        ReportItemVO item = new ReportItemVO();
        item.setName("=1+1"); item.setUnit("份"); item.setTotalQty(3L);
        item.setAvgPrice(new BigDecimal("12.34")); item.setTotalAmount(new BigDecimal("37.02"));
        report.setItems(List.of(item)); report.setTotalAmount(new BigDecimal("37.02"));
        var response = new ReportExportService().monthly("月度销售", report);
        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(response.getBody()))) {
            Sheet sheet = workbook.getSheetAt(0);
            assertEquals(CellType.STRING, sheet.getRow(1).getCell(2).getCellType());
            assertEquals("=1+1", sheet.getRow(1).getCell(2).getStringCellValue());
            assertEquals(37.02, sheet.getRow(1).getCell(6).getNumericCellValue(), 0.00001);
            assertEquals(37.02, sheet.getRow(2).getCell(6).getNumericCellValue(), 0.00001);
        }
        assertTrue(response.getHeaders().getFirst("Content-Disposition").contains("attachment"));
    }

    @Test void exportsOrderDetailsAndEmptyReports() throws Exception {
        UserVO user = new UserVO(); user.setName("员工"); user.setPhone("00123");
        EmployeeReportVO report = new EmployeeReportVO(); report.setMonth("2026-10"); report.setEmployee(user);
        OrderItemVO item = new OrderItemVO(); item.setName("米饭"); item.setUnit("份"); item.setQty(2);
        item.setPrice(new BigDecimal("2.50")); item.setAmount(new BigDecimal("5.00"));
        OrderVO order = new OrderVO(); order.setId(1L); order.setItems(List.of(item));
        report.setOrders(List.of(order)); report.setMonthTotalAmount(new BigDecimal("5.00"));
        var exporter = new ReportExportService();
        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(exporter.orders("订单", report).getBody()))) {
            assertEquals("00123", workbook.getSheetAt(0).getRow(1).getCell(2).getStringCellValue());
            assertEquals(5, workbook.getSheetAt(0).getRow(2).getCell(12).getNumericCellValue());
        }
        report.setOrders(List.of()); report.setMonthTotalAmount(BigDecimal.ZERO);
        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(exporter.orders("订单", report).getBody()))) {
            assertEquals(1, workbook.getSheetAt(0).getLastRowNum());
            assertEquals(0, workbook.getSheetAt(0).getRow(1).getCell(12).getNumericCellValue());
        }
    }

    private MockMultipartFile file(Workbook workbook) throws Exception {
        try (workbook; ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            workbook.write(out);
            return new MockMultipartFile("file", "users.xlsx", "", out.toByteArray());
        }
    }
}

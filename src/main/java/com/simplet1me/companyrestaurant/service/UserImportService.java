package com.simplet1me.companyrestaurant.service;

import com.simplet1me.companyrestaurant.common.BusinessException;
import com.simplet1me.companyrestaurant.model.dto.UserCreateDTO;
import com.simplet1me.companyrestaurant.utils.ExcelUtil;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserImportService {
    public static final List<String> HEADERS = List.of("姓名", "登录名", "密码", "联系电话", "部门", "工位信息", "角色");
    private final UserService userService;
    private final Validator validator;

    public record Failure(int row, String reason) {}
    public record ImportResult(int successCount, int failureCount, List<Failure> failures) {}

    public ResponseEntity<byte[]> template() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        ExcelUtil.addSheet(workbook, "用户数据", HEADERS, List.of());
        ExcelUtil.addSheet(workbook, "填写示例", HEADERS,
                List.of(List.of("张三", "zhangsan", "Example123", "13800138000", "研发部", "A栋301", "EMPLOYEE")));
        Sheet instructions = ExcelUtil.addSheet(workbook, "填写说明", List.of("项目", "说明"), List.of(
                List.of("导入范围", "仅导入用户数据工作表，示例不会被导入；请保留第一行表头"),
                List.of("必填字段", "除部门外均必填；密码6~32位；登录名不可重复"),
                List.of("角色", "MANAGER 餐厅经理 / CHEF 厨房主管 / DELIVERER 配餐员 / FINANCE 财务 / EMPLOYEE 员工"),
                List.of("文本格式", "联系电话、登录名和密码请保持文本格式，以保留前导零；不支持公式"),
                List.of("限制", "支持xlsx/xls，最大10MB、1000行用户；成功行入库，失败行按行号返回原因")));
        instructions.setColumnWidth(1, 90 * 256);
        CellStyle wrapped = workbook.createCellStyle();
        wrapped.setWrapText(true);
        for (int i = 1; i <= instructions.getLastRowNum(); i++) {
            instructions.getRow(i).getCell(1).setCellStyle(wrapped);
            instructions.getRow(i).setHeightInPoints(42);
        }
        return ExcelUtil.download("用户批量导入模板", workbook);
    }

    // 导入excel
    public ImportResult importUsers(MultipartFile file) {
        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        if (file.isEmpty() || file.getSize() > 10 * 1024 * 1024 || !(name.endsWith(".xlsx") || name.endsWith(".xls"))) {
            throw new BusinessException("请上传不超过10MB的xlsx或xls文件");
        }
        // 完整解析文件后才开始写入，避免损坏的工作簿产生部分写入。
        List<RowData> data = new ArrayList<>();
        try (var input = file.getInputStream(); Workbook workbook = WorkbookFactory.create(input)) {
            Sheet sheet = workbook.getSheet("用户数据");
            if (sheet == null) throw new BusinessException("缺少用户数据工作表，请下载并使用导入模板");
            if (sheet.getLastRowNum() > 1000) throw new BusinessException("每次最多导入1000行用户");
            DataFormatter formatter = new DataFormatter(Locale.ROOT);
            Row header = sheet.getRow(0);
            for (int i = 0; i < HEADERS.size(); i++) {
                if (header == null || !HEADERS.get(i).equals(formatter.formatCellValue(header.getCell(i)).trim())) {
                    throw new BusinessException("表头不匹配，请使用下载的模板，勿修改列顺序");
                }
            }
            for (int n = 1; n <= sheet.getLastRowNum(); n++) {
                Row row = sheet.getRow(n);
                if (row == null) continue;
                List<String> values = new ArrayList<>();
                boolean formula = false;
                for (int c = 0; c < HEADERS.size(); c++) {
                    Cell cell = row.getCell(c);
                    formula |= cell != null && cell.getCellType() == CellType.FORMULA;
                    values.add(formatter.formatCellValue(cell));
                }
                if (values.stream().allMatch(String::isBlank)) continue;
                data.add(new RowData(n + 1, values, formula));
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("无法读取Excel文件，请确认文件完整且未加密");
        }
        if (data.isEmpty()) throw new BusinessException("用户数据工作表没有待导入用户");
        int success = 0;
        List<Failure> failures = new ArrayList<>();
        for (RowData row : data) {
            try {
                if (row.formula()) throw new BusinessException("不支持公式，请填写文本值");
                List<String> v = row.values();
                UserCreateDTO dto = new UserCreateDTO();
                dto.setName(v.get(0).trim()); dto.setLoginName(v.get(1).trim()); dto.setPassword(v.get(2));
                dto.setPhone(v.get(3).trim()); dto.setDepartment(v.get(4).trim());
                dto.setWorkstation(v.get(5).trim()); dto.setRole(v.get(6).trim());
                String errors = validator.validate(dto).stream().map(x -> x.getMessage()).sorted().collect(Collectors.joining("；"));
                if (!errors.isEmpty()) throw new BusinessException(errors);
                userService.create(dto);
                success++;
            } catch (BusinessException e) {
                failures.add(new Failure(row.number(), e.getMessage()));
            } catch (DataIntegrityViolationException e) {
                failures.add(new Failure(row.number(), "登录名重复或字段长度超过数据库限制"));
            }
        }
        return new ImportResult(success, failures.size(), failures);
    }

    private record RowData(int number, List<String> values, boolean formula) {}
}

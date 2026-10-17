package com.simplet1me.companyrestaurant.utils;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;

/** 模板和报表共用的 Excel 写入、格式及下载响应。字符串始终作为文本写入。 */
public final class ExcelUtil {
    private ExcelUtil() {}

    public static Sheet addSheet(Workbook workbook, String name, List<String> headers,
                                 List<? extends List<?>> rows) {
        Sheet sheet = workbook.createSheet(name);
        CellStyle header = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        header.setFont(font);
        header.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
        header.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        CellStyle money = workbook.createCellStyle();
        money.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
        CellStyle text = workbook.createCellStyle();
        text.setDataFormat(workbook.createDataFormat().getFormat("@"));
        Row heading = sheet.createRow(0);
        for (int i = 0; i < headers.size(); i++) {
            Cell cell = heading.createCell(i);
            cell.setCellValue(headers.get(i));
            cell.setCellStyle(header);
            sheet.setColumnWidth(i, 22 * 256);
            sheet.setDefaultColumnStyle(i, text);
        }
        for (List<?> values : rows) {
            Row row = sheet.createRow(sheet.getLastRowNum() + 1);
            for (int i = 0; i < values.size(); i++) {
                Cell cell = row.createCell(i);
                Object value = values.get(i);
                if (value instanceof BigDecimal decimal) {
                    cell.setCellValue(decimal.doubleValue());
                    cell.setCellStyle(money);
                } else if (value instanceof Number number) {
                    cell.setCellValue(number.doubleValue());
                } else {
                    cell.setCellValue(value == null ? "" : value.toString());
                }
            }
        }
        sheet.createFreezePane(0, 1);
        sheet.setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(0, sheet.getLastRowNum(), 0, headers.size() - 1));
        return sheet;
    }

    public static ResponseEntity<byte[]> download(String filename, Workbook workbook) throws IOException {
        try (workbook; ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            workbook.write(out);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                            .filename(filename + ".xlsx", StandardCharsets.UTF_8).build().toString())
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(out.toByteArray());
        }
    }

    public static ResponseEntity<byte[]> download(String filename, List<String> headers,
                                                   List<? extends List<?>> rows) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        addSheet(workbook, "报表", headers, rows);
        return download(filename, workbook);
    }
}

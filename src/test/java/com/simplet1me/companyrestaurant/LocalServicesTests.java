package com.simplet1me.companyrestaurant;

import com.simplet1me.companyrestaurant.model.vo.LoginUserVO;
import com.simplet1me.companyrestaurant.service.UserImportService;
import com.simplet1me.companyrestaurant.utils.ExcelUtil;
import com.simplet1me.companyrestaurant.utils.SessionUtil;
import io.minio.MinioClient;
import io.minio.RemoveObjectArgs;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 显式开启的本机MySQL/MinIO联调：数据库改动回滚，仅删除测试自行创建的图片。 */
@SpringBootTest(properties = {"logging.level.root=WARN", "debug=false"})
@EnabledIfSystemProperty(named = "integration.local", matches = "true")
@Transactional
class LocalServicesTests {
    @Autowired WebApplicationContext context;
    @Autowired JdbcTemplate jdbc;
    @Autowired UserImportService importer;
    @Value("${minio.endpoint}") String endpoint;
    @Value("${minio.access-key}") String accessKey;
    @Value("${minio.secret-key}") String secretKey;
    @Value("${minio.bucket}") String bucket;
    MockMvc mvc;

    @BeforeEach void setup() { mvc = MockMvcBuilders.webAppContextSetup(context).build(); }

    MockHttpSession session(String role, Long id) {
        var session = new MockHttpSession();
        var user = new LoginUserVO(); user.setRole(role); user.setId(id); user.setName("联调用户");
        SessionUtil.setLoginUser(session, user);
        return session;
    }

    @Test void templateAndImportAreManagerOnlyAndPasswordsAreHashed() throws Exception {
        mvc.perform(get("/api/users/import/template")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/import/template").session(session("FINANCE", 1L))).andExpect(status().isForbidden());
        byte[] template = mvc.perform(get("/api/users/import/template").session(session("MANAGER", 1L)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsByteArray();
        Files.createDirectories(Path.of("docs/examples"));
        Files.write(Path.of("docs/examples/user-import-template.xlsx"), template);
        String login = "import_" + UUID.randomUUID().toString().substring(0, 8);
        Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(template));
        var row = workbook.getSheet("用户数据").createRow(1);
        var values = List.of("联调用户", login, "Example123", "13800138000", "研发部", "A01", "EMPLOYEE");
        for (int i = 0; i < values.size(); i++) row.createCell(i).setCellValue(values.get(i));
        byte[] file;
        try (workbook; var out = new ByteArrayOutputStream()) { workbook.write(out); file = out.toByteArray(); }
        var upload = new MockMultipartFile("file", "users.xlsx", "application/octet-stream", file);
        mvc.perform(multipart("/api/users/import").file(upload).session(session("EMPLOYEE", 1L))).andExpect(status().isForbidden());
        mvc.perform(multipart("/api/users/import").file(upload).session(session("MANAGER", 1L)))
                .andExpect(jsonPath("$.data.successCount").value(1));
        assertNotEquals("Example123", jdbc.queryForObject("select password from user where login_name=?", String.class, login));
        mvc.perform(multipart("/api/users/import").file(upload).session(session("MANAGER", 1L)))
                .andExpect(jsonPath("$.data.failureCount").value(1));
    }

    @Test void allFourExportsProduceWorkbooksAndRespectRoles() throws Exception {
        String login = "report_" + UUID.randomUUID().toString().substring(0, 8);
        Workbook workbook = new XSSFWorkbook();
        ExcelUtil.addSheet(workbook, "用户数据", UserImportService.HEADERS,
                List.of(List.of("报表用户", login, "Example123", "13800138000", "研发部", "A01", "EMPLOYEE")));
        try (workbook; var out = new ByteArrayOutputStream()) {
            workbook.write(out);
            importer.importUsers(new MockMultipartFile("file", "users.xlsx", "", out.toByteArray()));
        }
        Long id = jdbc.queryForObject("select id from user where login_name=?", Long.class, login);
        for (String path : List.of("/api/reports/monthly/export", "/api/reports/employee/" + id + "/export",
                "/api/reports/mine/monthly/export", "/api/reports/mine/orders/export")) {
            String role = path.contains("/mine/") ? "EMPLOYEE" : "FINANCE";
            byte[] data = mvc.perform(get(path).param("month", "2026-10").session(session(role, id)))
                    .andExpect(status().isOk()).andExpect(header().string("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .andReturn().getResponse().getContentAsByteArray();
            try (Workbook exported = WorkbookFactory.create(new ByteArrayInputStream(data))) {
                assertTrue(exported.getSheetAt(0).getLastRowNum() >= 1);
            }
        }
        mvc.perform(get("/api/reports/monthly/export").param("month", "2026-10").session(session("EMPLOYEE", id)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/reports/employees").session(session("FINANCE", id)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.code").value(200));
    }

    @Test void uploadsToRealMinioAndReadsBackIdenticalImage() throws Exception {
        byte[] png = Base64.getDecoder().decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+afo4AAAAASUVORK5CYII=");
        var image = new MockMultipartFile("file", "test.png", "image/png", png);
        mvc.perform(multipart("/api/files/upload/image").file(image).session(session("EMPLOYEE", 1L))).andExpect(status().isForbidden());
        var response = mvc.perform(multipart("/api/files/upload/image").file(image).session(session("CHEF", 1L)))
                .andExpect(jsonPath("$.code").value(200)).andReturn().getResponse().getContentAsString();
        String url = new com.fasterxml.jackson.databind.ObjectMapper().readTree(response).path("data").path("url").asText();
        try {
            byte[] retrieved = mvc.perform(get(url)).andExpect(status().isOk()).andExpect(content().contentType("image/png"))
                    .andReturn().getResponse().getContentAsByteArray();
            assertArrayEquals(png, retrieved);
        } finally {
            MinioClient.builder().endpoint(endpoint).credentials(accessKey, secretKey).build()
                    .removeObject(RemoveObjectArgs.builder().bucket(bucket).object("images/" + url.substring(url.lastIndexOf('/') + 1)).build());
        }
    }
}

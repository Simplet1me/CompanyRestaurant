package com.simplet1me.companyrestaurant;

import com.simplet1me.companyrestaurant.model.dto.ConfigDTO;
import com.simplet1me.companyrestaurant.model.dto.LoginDTO;
import com.simplet1me.companyrestaurant.service.AuthService;
import com.simplet1me.companyrestaurant.service.ConfigService;
import com.simplet1me.companyrestaurant.service.ReportService;
import com.simplet1me.companyrestaurant.service.UserImportService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import javax.sql.DataSource;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 显式启用：在随机命名的临时数据库验证reset.sql，不操作业务数据库。 */
@SpringBootTest(properties = {"logging.level.root=WARN", "debug=false"})
@EnabledIfSystemProperty(named = "integration.demo", matches = "true")
class DemoSeedTests {
    private static final String DATABASE = "company_restaurant_demo_verify_" + UUID.randomUUID().toString().replace("-", "");

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> "jdbc:mysql://localhost:3306/" + DATABASE
                + "?createDatabaseIfNotExist=true&useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true");
    }

    @Autowired DataSource dataSource;
    @Autowired JdbcTemplate jdbc;
    @Autowired AuthService auth;
    @Autowired UserImportService importer;
    @Autowired ReportService reports;
    @Autowired ConfigService configs;
    @Autowired WebApplicationContext context;

    @Test void resetSupportsDemoLoginReportsImportImagesAndMinutePrecision() throws Exception {
        String sql = Files.readString(Path.of("db/reset.sql"), StandardCharsets.UTF_8).replace("company_restaurant", DATABASE);
        assertTrue(DATABASE.matches("company_restaurant_demo_verify_[a-f0-9]{32}"));
        try {
            for (int run = 0; run < 2; run++) {
                try (var connection = dataSource.getConnection()) {
                    assertEquals(DATABASE, connection.getCatalog());
                    ScriptUtils.executeSqlScript(connection, new EncodedResource(new ByteArrayResource(sql.getBytes(StandardCharsets.UTF_8)), StandardCharsets.UTF_8));
                }
                assertEquals(9, count("user"));
                assertEquals(13, count("recipe"));
                assertEquals(6, count("menu"));
                assertEquals(35, count("menu_items"));
                assertEquals(14, count("orders"));
                assertEquals(48, count("order_items"));
            }
            assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM menu WHERE status='USE'", Integer.class));
            assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM orders WHERE user_id=(SELECT id FROM user WHERE login_name='employee03')", Integer.class));
            assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM orders o WHERE o.total_price <> (SELECT SUM(i.amount) FROM order_items i WHERE i.order_id=o.id)", Integer.class));
            for (String login : new String[]{"manager", "chef", "deliverer", "finance", "employee01", "employee02", "employee03"}) {
                LoginDTO dto = new LoginDTO(); dto.setLoginName(login); dto.setPassword("123456");
                assertEquals(login, auth.login(dto).getLoginName());
            }
            assertEquals(0, reports.monthly("2026-10").getTotalAmount().compareTo(new BigDecimal("319.30")));
            Long employeeId = jdbc.queryForObject("SELECT id FROM user WHERE login_name='employee01'", Long.class);
            assertEquals(2, reports.mineOrders(employeeId, "2026-10").getOrders().size());
            assertEquals(0, reports.mineMonthly(employeeId, "2026-10").getTotalAmount().compareTo(new BigDecimal("57.00")));
            byte[] excel = Files.readAllBytes(Path.of("用户名单.xlsx"));
            var imported = importer.importUsers(new MockMultipartFile("file", "demo.xlsx", "", excel));
            assertEquals(5, imported.successCount()); assertEquals(0, imported.failureCount());
            assertEquals(14, count("user"));
            LoginDTO importedLogin = new LoginDTO(); importedLogin.setLoginName("import01"); importedLogin.setPassword("123456");
            assertEquals("EMPLOYEE", auth.login(importedLogin).getRole());
            var mvc = MockMvcBuilders.webAppContextSetup(context).build();
            for (String photo : jdbc.queryForList("SELECT photo FROM recipe WHERE photo <> ''", String.class)) {
                mvc.perform(get(photo)).andExpect(status().isOk());
            }
            ConfigDTO config = new ConfigDTO(); config.setOrderDeadline("09:01"); config.setServeStartTime("11:32");
            configs.update(config);
            assertEquals("09:01", configs.getConfig().getOrderDeadline());
            assertEquals("11:32", configs.getConfig().getServeStartTime());
        } finally {
            jdbc.execute("DROP DATABASE IF EXISTS `" + DATABASE + "`");
        }
    }

    private int count(String table) { return jdbc.queryForObject("SELECT COUNT(*) FROM `" + table + "`", Integer.class); }
}

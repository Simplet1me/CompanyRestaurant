import java.sql.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.io.*;

/** 只读导出实际数据库结构和全部数据，不拼造业务记录。 */
class DatabaseSnapshot {
    static String id(String value) { return "`" + value.replace("`", "``") + "`"; }
    static String sql(Object value) {
        if (value == null) return "NULL";
        if (value instanceof byte[] bytes) return "0x" + HexFormat.of().formatHex(bytes);
        if (value instanceof Number) return value.toString();
        if (value instanceof Boolean b) return b ? "1" : "0";
        return "'" + value.toString().replace("\\", "\\\\").replace("\0", "\\0").replace("\n", "\\n")
                .replace("\r", "\\r").replace("\u001a", "\\Z").replace("'", "''") + "'";
    }
    static String json(Object value) {
        if (value == null) return "null";
        if (value instanceof Number || value instanceof Boolean) return value.toString();
        if (value instanceof Map<?, ?> map) {
            List<String> entries = new ArrayList<>();
            map.forEach((k,v) -> entries.add(json(k.toString()) + ":" + json(v)));
            return "{" + String.join(",", entries) + "}";
        }
        if (value instanceof List<?> list) return "[" + String.join(",", list.stream().map(DatabaseSnapshot::json).toList()) + "]";
        return "\"" + value.toString().replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t") + "\"";
    }
    public static void main(String[] args) throws Exception {
        if (args.length != 2) throw new IllegalArgumentException("Usage: DatabaseSnapshot.java snapshot.sql manifest.json");
        Class.forName("com.mysql.cj.jdbc.Driver");
        try (Connection connection = DriverManager.getConnection(System.getenv("DEMO_DB_URL"), System.getenv("DEMO_DB_USER"), System.getenv("DEMO_DB_PASSWORD"))) {
            String database = connection.getCatalog();
            if (!"company_restaurant".equals(database)) throw new IllegalStateException("Unexpected database");
            connection.setTransactionIsolation(Connection.TRANSACTION_REPEATABLE_READ);
            connection.setReadOnly(true);
            connection.setAutoCommit(false);
            StringBuilder output = new StringBuilder("-- 真实业务接口创建后的数据库快照；图片UUID必须与现有MinIO对象一起保留。\n");
            output.append("SET NAMES utf8mb4;\nSET @OLD_SQL_MODE=@@SQL_MODE;\nSET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';\nSET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS;\nSET FOREIGN_KEY_CHECKS=0;\n");
            try (Statement statement = connection.createStatement(); ResultSet result = statement.executeQuery("SHOW CREATE DATABASE " + id(database))) {
                result.next(); output.append("DROP DATABASE IF EXISTS ").append(id(database)).append(";\n").append(result.getString(2)).append(";\nUSE ").append(id(database)).append(";\n\n");
            }
            List<String> tables = new ArrayList<>();
            try (Statement statement = connection.createStatement(); ResultSet result = statement.executeQuery("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'")) {
                while (result.next()) tables.add(result.getString(1));
            }
            Collections.sort(tables);
            Map<String,Object> manifest = new LinkedHashMap<>();
            for (String table : tables) {
                try (Statement statement = connection.createStatement(); ResultSet result = statement.executeQuery("SHOW CREATE TABLE " + id(table))) {
                    result.next(); output.append(result.getString(2)).append(";\n\n");
                }
            }
            output.append("START TRANSACTION;\n");
            for (String table : tables) {
                List<Map<String,Object>> rows = new ArrayList<>();
                try (Statement statement = connection.createStatement(); ResultSet result = statement.executeQuery("SELECT * FROM " + id(table) + " ORDER BY id")) {
                    ResultSetMetaData metadata = result.getMetaData();
                    List<String> columns = new ArrayList<>();
                    for (int c=1;c<=metadata.getColumnCount();c++) columns.add(id(metadata.getColumnLabel(c)));
                    while (result.next()) {
                        List<String> values = new ArrayList<>();
                        Map<String,Object> row = new LinkedHashMap<>();
                        for (int c=1;c<=metadata.getColumnCount();c++) {
                            Object value = result.getObject(c); values.add(sql(value));
                            if (!"password".equals(metadata.getColumnLabel(c))) row.put(metadata.getColumnLabel(c), value);
                        }
                        rows.add(row);
                        output.append("INSERT INTO ").append(id(table)).append(" (").append(String.join(",",columns)).append(") VALUES (").append(String.join(",",values)).append(");\n");
                    }
                }
                manifest.put(table, rows);
            }
            output.append("COMMIT;\nSET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;\nSET SQL_MODE=@OLD_SQL_MODE;\n");
            connection.commit();
            Files.writeString(Path.of(args[0]), output, StandardCharsets.UTF_8);
            Files.writeString(Path.of(args[1]), json(manifest), StandardCharsets.UTF_8);
            manifest.forEach((table,rows) -> System.out.println(table + ": " + ((List<?>)rows).size()));
        }
    }
}

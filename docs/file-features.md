# 文件与 Excel 功能

## 用户批量导入

餐厅经理在“用户管理 → 批量导入”下载模板。模板包含空白“用户数据”、一个“填写示例”和“填写说明”工作表。示例不会自动导入；将实际用户填入数据表后上传。

- `GET /api/users/import/template`：下载模板，仅 MANAGER。
- `POST /api/users/import`：multipart 字段 `file`，仅 MANAGER。
- 支持 xlsx、xls，最大10MB、1000行数据；必须保留工作表名称和表头顺序。
- 表头：姓名、登录名、密码、联系电话、部门、工位信息、角色。
- 除部门外均必填。密码6~32位，导入时复用用户创建服务进行散列。角色填写英文枚举。
- 电话、登录名、密码保持文本格式；不接受公式。模板中的数据列已设置为文本。
- 成功行直接入库，失败行返回 Excel 行号及原因。修正后仅重新提交失败行，避免重复创建。
- 响应：`{successCount, failureCount, failures: [{row, reason}]}`。

模板副本：`examples/user-import-template.xlsx`。应用下载接口是模板的权威来源。

## 菜品图片

食谱新增/编辑页面使用文件选择、上传和预览，支持更换及移除，不再提供 URL 输入框。

- `POST /api/files/upload/image`：multipart 字段 `file`，MANAGER / CHEF；返回 `{url}`。
- 支持 JPEG / PNG / GIF / WebP，最大5MB；服务端检查文件头。
- MinIO 默认端点 `http://127.0.0.1:9000`，桶 `company-restaurant`，对象路径 `images/{UUID}.{type}`。
- `GET /uploads/image/{name}` 从私有桶回读图片，缓存30天；固定地址不会因签名过期失效。
- 配置见本地文件 `application-local.yml`（Git已忽略），可用 `MINIO_ENDPOINT`、`MINIO_BUCKET`、`MINIO_ACCESS_KEY`、`MINIO_SECRET_KEY` 覆盖。
- 部署时需将 `/api` 和 `/uploads` 都代理到后端；开发环境 Vite 已配置两者。

## Excel 报表导出

四类报表在对应页面按当前月份和员工下载。财务通过报表专用员工搜索接口选择员工，无需用户管理权限。

| 接口 | 权限 |
|---|---|
| `/api/reports/monthly/export` | MANAGER / FINANCE |
| `/api/reports/employee/{userId}/export` | MANAGER / FINANCE |
| `/api/reports/mine/monthly/export` | 当前登录用户，仅本人 |
| `/api/reports/mine/orders/export` | 当前登录用户，仅本人 |

全部为 GET，参数 `month=yyyy-MM`。`ExcelUtil` 负责共用工作表样式、金额格式和下载响应；`ReportExportService` 复用现有报表查询数据。订单报表每个菜品一行，附月度合计；空报表仍包含表头及零合计。字符串作为文本写入，避免内容被解释为公式。前端共用下载函数识别JSON业务错误，避免将错误响应保存成Excel。

## 验证

- `./mvnw test`：导入边界、模板结构、报表金额、图片校验及上下文测试。
- `./mvnw -Dtest=LocalServicesTests -Dintegration.local=true test`：连接本机MySQL与MinIO，验证真实导入、四类导出、角色限制、图片上传回读。数据库数据在测试后回滚，上传的测试图片在结束时删除。
- `cd frontend && npm run build`：TypeScript检查及前端构建。

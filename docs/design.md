# 企业餐厅网络点餐系统 - 系统架构设计

> 架构有变动时必须更新本文档；接口契约见 `interfaces.md`，建表语句见 `sql.md`，需求依据见 `requirements.md`。

## 1. 技术选型

| 层面 | 选型 | 理由 |
|---|---|---|
| 语言/运行时 | Java 21 | 项目已初始化（pom.xml 既定） |
| 框架 | Spring Boot 4.1.1 | 项目已初始化；课程允许"使用 Spring 相关框架" |
| 持久层 | MyBatis（mybatis-spring-boot-starter 4.1.0，与 Spring Boot 4.x 兼容，已编译验证） | SQL 显式可控，课程要求的"数据库增删查改"体现直接，答辩易讲解 |
| 数据库 | MySQL 8.x（mysql-connector-j） | 课程报告环境（Win10 + IDEA + MySQL） |
| 会话 | HttpSession + Cookie（JSESSIONID） | 课程必做项"session 和 cookie 的使用" |
| 密码 | SHA-256 加盐散列（JDK MessageDigest + HexFormat 自实现，零额外依赖） | 盐值配置于 application-local.yml，由 PasswordProperties（@ConfigurationProperties）加载 |
| Excel | EasyExcel（阿里） | 用户批量导入（读）+ 报表导出（写），API 简洁 |
| 对象存储 | MinIO（io.minio 8.5.13） | 菜品图片等文件存储（MinioOssUtil 已提供上传封装） |
| 校验 | spring-boot-starter-validation（Jakarta Bean Validation） | 参数校验注解化 |
| 前端 | 无（纯后端 REST API，前端由组员另行开发） | 用户决策；接口契约见 interfaces.md |
| 日志 | SLF4J + Logback（Spring Boot 默认） | 零配置 |

版本注意：Spring Boot 4.1.1 基于 Spring Framework 7 / Jakarta EE 11。MyBatis 已锁定 4.1.0（编译验证通过）；EasyExcel 版本在报表模块实现时确认兼容性。

## 2. 总体架构

**前后端分离**：

```
┌──────────────┐        HTTP/JSON (REST)         ┌─────────────────────────────┐
│  前端(另写)   │ ◀────────────────────────────▶ │      本后端（本项目）         │
│  Vue/任意技术 │   Cookie: JSESSIONID (会话)     │  Spring Boot + MyBatis + MySQL│
│  Ajax 调用    │   multipart (文件上传)          │  拦截器(登录/权限) → Controller │
└──────────────┘   application/octet-stream (下载)│  → Service → Mapper → MySQL   │
                                                  └─────────────────────────────┘
```

- 后端只产出 JSON 与文件流，不渲染任何 HTML（打印页由前端渲染 + 浏览器打印）。
- 菜品图片等文件存 MinIO 对象存储（MinioOssUtil 封装上传，返回访问 URL）。

## 3. 后端分层与包结构

```
com.simplet1me.companyrestaurant
├── CompanyRestaurantApplication.java        # 启动类（@MapperScan）
├── common/                                  # 通用组件
│   ├── Result.java                          # 统一响应体 {code, msg, data}
│   ├── ResultCode.java                      # 响应码常量
│   ├── BusinessException.java               # 业务异常
│   └── GlobalExceptionHandler.java          # @RestControllerAdvice 全局异常处理
├── config/                                  # 配置
│   └── WebConfig.java                       # 拦截器注册、CORS（允许携带 Cookie）
├── interceptor/                             # 拦截器（课程选做项）
│   ├── LoginInterceptor.java                # 登录校验：Session 无用户 → 401
│   └── RoleInterceptor.java                 # 权限校验：@RequireRole 声明的角色不满足 → 403
├── controller/                              # REST 控制器（只做参数接收/校验/返回，不含业务）
│   └── AuthController.java                  # 登录/注册/登出/当前用户/修改密码
├── service/ + service/impl/                 # 业务层（事务边界、业务规则）
├── mapper/                                  # MyBatis Mapper 接口（XML 在 resources/mapper/）
├── entity/                                  # 与表对应的实体与枚举（User、Role…）
├── model/dto/                               # 请求体（入参）
├── model/vo/                                # 响应视图（出参，如 LoginUserVO）
├── properties/                              # 配置属性类（预留）
└── utils/                                   # SessionUtil、MinioOssUtil 等工具
```

## 4. 模块划分（与 4 人分组对应）

课程要求"以模块分配任务"，模块间通过接口文档解耦，按此划分可并行开发。共 **13 个模块、47 个接口**：

| # | 模块 | 内容（接口数） | 对应包 |
|---|---|---|---|
| M1 | 认证与会话 ✅ | 登录/注册/登出/当前用户/修改密码（5）；Session+Cookie、SHA-256、登录拦截器 | auth + interceptor + common |
| M2 | 用户管理 ✅ | 用户 CRUD、重置密码（6，经理） | user |
| M3 | 用户批量导入 ⚠️TODO | Excel 批量导入（1，经理）；EasyExcel 读 + 文件上传，未实现 | user |
| M4 | 文件服务 ⚠️TODO | 图片上传至 MinIO（MinioOssUtil 已有封装）、文件访问（2），未实现 | file + utils |
| M5 | 食谱管理 ✅ | 食谱 CRUD + 批量删除（6，经理/厨房主管） | recipe |
| M6 | 菜单管理 ✅ | 菜单列表/当前/创建/详情/删除/启用（6，经理） | menu |
| M7 | 菜单菜品管理 ✅ | 向菜单加菜、修改价格、删除菜品（3，经理） | menu |
| M8 | 点餐下单 ✅ | 订餐状态、下单（时间窗口判定+三层快照）、我的订单（3，所有角色） | order |
| M9 | 订单管理 ✅ | 按日查询、详情、经理删单（3，经理/配餐员） | order |
| M10 | 总括订单与配餐 ✅ | 总括订单汇总（厨房主管）、配餐批量订单（配餐员）（2） | order |
| M11 | 月度销售统计 ✅（导出TODO） | 月度销售总报表查询（1，经理/财务）；Excel 导出未实现 | report |
| M12 | 员工与个人报表 ✅（导出TODO） | 员工月度订单汇总、个人月度消费统计/订单汇总（3）；导出（3）未实现 | report |
| M13 | 系统配置 ✅ | 订餐截止/配餐开始时间查询与修改（2，经理） | config |

实现状态：47 个接口中 38 个已实现并冒烟测试通过，9 个 TODO（批量导入 1、文件服务 2、报表导出 4、占位 2）。

**4 人分工建议**（按技术相关性聚合，接口数相对均衡）：

| 组员 | 负责模块 | 接口数 | 说明 |
|---|---|---|---|
| 组员 1 | M1 + M2 + M3 + M4 | 14 | 公共基础与用户域；M1 已完成，剩余工作量适中 |
| 组员 2 | M5 + M6 + M7 | 15 | 菜品域：食谱/菜单 CRUD + 快照复制，逻辑直接 |
| 组员 3 | M8 + M9 + M10 | 8 | 订单域：接口少但时间窗口判定、快照、事务逻辑最复杂 |
| 组员 4 | M11 + M12 + M13 | 10 | 报表域：分组统计 SQL + EasyExcel 导出 + 简单配置 |

组内可先并行开发 M2~M13，每完成一个模块即按 `interfaces.md` 与前端联调。

## 5. 数据库设计概览

> 完整建表语句与初始化数据见 `sql.md`。

```
user ─┬─< orders ──< order_items      （下单快照）
      │
recipe ──< menu_items ──< menu 关系：menu 1─N menu_items
```

| 表 | 说明 | 关键设计 |
|---|---|---|
| `user` | 用户 | login_name 唯一；role 枚举；password 存 SHA-256 加盐散列 |
| `recipe` | 食谱（菜品库） | 唯一实体；photo 存图片 URL |
| `menu` | 菜单 | name 独立命名；status：USE(使用中)/HISTORY(历史)；同一时刻仅一份 USE |
| `menu_items` | 菜单菜品（**快照**） | 从 recipe 复制；price 可独立修改；recipe 变动不影响本表 |
| `orders` | 订单 | (user_id, meal_date) 唯一；姓名/电话/工位为下单时快照 |
| `order_items` | 订单明细（**快照**） | 从 menu_items 复制；amount = qty × price |
| `system_config` | 系统配置 | key-value：订餐截止时间、配餐开始时间 |

- 外键：逻辑外键（应用层维护），不建物理外键约束——快照表需要与源表解耦（源记录可删，快照必须留存）。
- 金额字段 DECIMAL(10,2)；时间 DATETIME；日期 DATE。
- 快照表保留源 id（menu_items.recipe_id、order_items.menu_item_id，可空），仅作溯源，不参与业务逻辑。

## 6. 关键机制设计

### 6.1 统一响应体与异常处理

```json
{ "code": 200, "msg": "ok", "data": { } }
```

| code | 含义 |
|---|---|
| 200 | 成功 |
| 400 | 参数错误/业务规则不满足（msg 说明原因，如"当前不在订餐时间窗口内"） |
| 401 | 未登录（登录拦截器统一返回） |
| 403 | 无权限（权限拦截器统一返回） |
| 500 | 服务器错误（GlobalExceptionHandler 兜底，msg 不暴露堆栈） |

- Controller 不 try-catch 业务异常：Service 抛 `BusinessException`，由 `GlobalExceptionHandler` 统一转为 Result。
- 时间字段统一格式 `yyyy-MM-dd HH:mm:ss`，日期 `yyyy-MM-dd`（Jackson 全局配置）。

### 6.2 认证与会话（课程必做：session + cookie）

- 登录成功：`HttpSession` 存入 `LoginUserVO`（id、登录名、姓名、角色），响应头自动携带 `Set-Cookie: JSESSIONID=...`。
- 自助注册（公开接口）：角色固定 `EMPLOYEE`，密码 SHA-256 加盐散列入库（PasswordUtil），注册成功即建立会话（同登录）。
- 每次请求：`LoginInterceptor` 从 Session 取用户校验登录态；无会话返回 401（登录、注册接口在拦截器排除清单中）。
- 角色权限：`RoleInterceptor` 读取 Controller 方法上的 `@RequireRole` 校验角色，不满足返回 403；未标注的方法任何登录用户可访问（任何角色都拥有普通员工权限）。
- 登出：`session.invalidate()`。
- 前端配合：Ajax 需开启 `withCredentials`（fetch 为 `credentials: 'include'`），CORS 不允许 `*` 通配（见 6.3）。
- Cookie 进阶使用（选做）：登录接口可选 `rememberMe` 参数，勾选后额外签发 7 天有效期的随机 token 存 Cookie + 服务端表/内存，用于会话过期后的自动登录。

### 6.3 跨域 CORS

- 开发期前端独立启动，后端在 `WebConfig.addCorsMappings` 中放开跨域（课程选做项"web 过滤器"的等价实现）。
- `allowCredentials(true)` + `allowedOriginPatterns("*")`（携带 Cookie 时不能用 `allowedOrigins("*")`），暴露 `Content-Disposition` 响应头（下载文件名）；生产环境收紧为具体前端域名。
- 配置载体为 application.yml，可按环境切换。

### 6.4 文件上传/下载（课程必做：编程实现）⚠️ 本模块未实现（TODO）

**上传（两类）**：

| 场景 | 接口 | 存储 |
|---|---|---|
| 菜品图片 | `POST /api/files/upload/image` | 上传至 MinIO（`MinioOssUtil` 封装，对象名 `image/{yyyyMM}/{uuid}.{ext}`），返回访问 URL 存入 recipe.photo |
| 用户批量导入 | `POST /api/users/import` | EasyExcel 读取，不落盘，直接入库 |

- 上传限制：图片仅允许 jpg/jpeg/png/gif/webp，单文件 ≤ 5MB；导入仅允许 .xlsx/.xls，单文件 ≤ 10MB。
- 对象名使用 UUID 重命名，防冲突防路径穿越。

**下载（两类）**：

| 场景 | 方式 |
|---|---|
| 图片访问 | MinIO 返回的访问 URL（前端直接访问） |
| 报表导出 | `GET /api/reports/.../export`，EasyExcel 流式写出，`Content-Disposition: attachment; filename*=UTF-8''...`（中文文件名编码） |

### 6.5 订餐时间窗口判定（核心业务规则）

配置 `system_config`：`order_deadline`（默认 `09:00`）、`serve_start_time`（默认 `11:30`）。

服务端判定（`OrderService.canOrderNow()`）：

```
now.time < order_deadline      → 可订，meal_date = 今天
now.time ≥ serve_start_time    → 可订，meal_date = 明天
否则                           → 不可订，提示"当前不在订餐时间窗口内"
```

- 下单接口服务端强制校验，**不信任前端**传入的用餐日期归属；前端仅传明细，meal_date 由服务端按当前时间计算。
- 查询"我的订单/当日订单"时也按该规则提示当前可订状态。
- 保存配置时校验：serve_start_time > order_deadline，且两者均为 HH:mm。

### 6.6 快照写入流程

- 创建菜单选菜：`recipe` 行 → 复制生成 `menu_items`（name/photo/unit/classify/price 全部拷贝）。
- 下单：`menu_items` 行 → 复制生成 `order_items`（name/unit/price 拷贝 + qty 用户填 + amount = qty × price）。
- 事务：下单接口（校验窗口 → 校验唯一 → 插 orders → 插 order_items）整体 `@Transactional`。

### 6.7 菜单切换（启用）

`PUT /api/menus/{id}/activate` 事务内两步：

1. `UPDATE menu SET status='HISTORY' WHERE status='USE'`；
2. `UPDATE menu SET status='USE' WHERE id=?`。

历史菜单复用 = 对历史菜单再次 activate。员工下单查询的菜单永远取 `status='USE'` 且创建时间最新的一份。

### 6.8 Excel 导入导出（EasyExcel）

- 导入用户模板列：姓名、登录名、密码（明文，入库前 BCrypt）、联系电话、工作单位、工位信息、角色（角色须在枚举内，行级校验；任一行出错整批回滚并返回错误行号+原因）。
- 导出报表：定义导出 VO + 简单表头；报表数据由查询 Service 组装后交给 EasyExcel 写出到 response 输出流。

### 6.9 分页约定

- 请求参数 `pageNum`（从 1 起，默认 1）、`pageSize`（默认 10，最大 100）。
- 响应 `PageResult{ total, list }`；Mapper 手写 `LIMIT #{offset}, #{pageSize}` + `COUNT` 查询。

## 7. 关键流程

### 7.1 下单流程

```
员工 → POST /api/orders {items:[{menuItemId, qty}]}
  → LoginInterceptor（Session 校验）
  → OrderController → OrderService
      1. 读 system_config 判定时间窗口 → 计算 meal_date（窗口外则 400）
      2. 校验当前使用中菜单，items 必须来自该菜单
      3. 校验 (user_id, meal_date) 无有效订单（重复下单则 400）
      4. 快照写入 orders + order_items（@Transactional）
  → 返回订单详情
```

### 7.2 当日业务时间线（与需求对齐）

```
09:00 订餐截止 ─── 厨房主管打印总括订单备料
11:30 配餐开始 ─── 配餐员批量打印订单配送；同时开启次日订餐
```

### 7.3 报表统计流程

```
GET /api/reports/monthly?month=2026-09
  → 按 meal_date 在 [月初, 月末] 内的有效订单
  → order_items 按 (name, unit) 分组：SUM(qty)、SUM(amount)
  → 单价 = SUM(amount)/SUM(qty)；总计 = 全部 SUM(amount)
  → 返回 VO；export 版走 EasyExcel 下载
```

## 8. 非功能设计

| 项 | 设计 |
|---|---|
| 配置 | 隐私项（数据库账号密码）剥离至 `src/main/resources/application-local.yml`，由主配置 `spring.config.import: optional:classpath:application-local.yml` 加载，该文件已加入 .gitignore 不入库；上传目录/跨域白名单可配置 |
| 事务 | Service 层 `@Transactional`；仅写操作；隔离级别默认 |
| 日志 | 业务关键动作（登录、下单、删单、导入、导出）info 级带操作人 |
| 安全 | 密码 SHA-256 加盐散列（盐值不入库，配置于 application-local.yml）；上传类型/大小/路径校验；SQL 全参数化（MyBatis `#{}`）防注入；异常不泄露堆栈 |
| 性能 | 订单/报表查询建 `(meal_date, status)`、`(user_id, meal_date)` 索引（见 sql.md） |

## 9. 课程要求落实清单

| 课程要求 | 设计落实 | 对应章节 |
|---|---|---|
| 数据库增删查改 | 全模块 MyBatis CRUD | §3、§5 |
| session 和 cookie | HttpSession 登录态 + JSESSIONID Cookie（+ rememberMe 选做） | §6.2 |
| 编程实现文件上传 | 菜品图片上传 / 用户 Excel 导入 | §6.4（⚠️ 未实现 TODO） |
| 编程实现文件下载 | 报表 Excel 导出下载 | §6.4（⚠️ 未实现 TODO） |
| Spring 拦截器（选做） | LoginInterceptor + RoleInterceptor | §6.2 |
| web 过滤器（选做） | CorsFilter / 编码过滤器 | §6.3 |
| 前端 ajax（选做） | 纯 REST API 设计，前端全程 Ajax | §2 |
| Spring 转换器/格式化器（选做） | Jackson 日期格式化、枚举序列化（实现时选做） | §6.1 |

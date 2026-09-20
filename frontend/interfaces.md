# 企业餐厅网络点餐系统 - 接口文档

> **接口有变动时必须更新本文档。** 本文档是前后端契约，前端据此开发。
> 架构设计见 `design.md`，建表见 `sql.md`。

## 0. 通用约定

### 0.1 基础信息

- Base URL：`http://{host}:{port}/api`（开发环境默认 `http://localhost:8080/api`）
- 数据格式：请求/响应均为 `application/json;charset=UTF-8`（文件上传为 `multipart/form-data`，下载为文件流）
- 日期时间格式：`yyyy-MM-dd HH:mm:ss`；日期格式：`yyyy-MM-dd`；月份：`yyyy-MM`；时间点：`HH:mm`

### 0.2 统一响应体

```json
{ "code": 200, "msg": "ok", "data": {} }
```

| code | 含义 | 处理建议 |
|---|---|---|
| 200 | 成功 | 取 data |
| 400 | 参数错误 / 业务规则不满足 | 展示 msg（如"当前不在订餐时间窗口内"） |
| 401 | 未登录 | 跳转登录页 |
| 403 | 无权限 | 提示"无权限操作" |
| 500 | 服务器错误 | 提示"系统繁忙" |

### 0.3 认证与会话

- 登录成功后服务端返回 `Set-Cookie: JSESSIONID=...`；**此后所有请求必须携带该 Cookie**。
- 前端 fetch 需 `credentials: 'include'`（axios 为 `withCredentials: true`）。
- 除登录、注册接口外，所有接口都要求登录（未登录返回 401）。

### 0.4 分页约定

- 请求参数：`pageNum`（从 1 起，默认 1）、`pageSize`（默认 10，最大 100）。
- 分页响应：

```json
{ "code": 200, "msg": "ok", "data": { "total": 57, "list": [ ... ] } }
```

### 0.5 角色枚举

| 值 | 角色 |
|---|---|
| MANAGER | 餐厅经理（系统管理员） |
| CHEF | 厨房主管 |
| DELIVERER | 配餐员 |
| FINANCE | 财务管理 |
| EMPLOYEE | 企业员工 |

任何角色的用户均拥有点餐（普通员工）权限。各接口"权限"栏为额外要求的主角色。

### 0.6 其他枚举

- 菜单状态 menu.status：`USE`（使用中）/ `HISTORY`（历史）
- 订单状态 orders.status：`VALID`（有效）/ `CANCELLED`（已取消）
- 文件下载响应头：`Content-Disposition: attachment; filename*=UTF-8''<urlencoded文件名>`

---

## 1. 认证 Auth

### 1.1 登录

`POST /api/auth/login`　权限：无需登录

请求体：

```json
{ "loginName": "liuming", "password": "123456", "rememberMe": false }
```

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| loginName | string | ✓ | 登录名 |
| password | string | ✓ | 密码 |
| rememberMe | boolean | | 记住我（选做，默认 false） |

响应 data：

```json
{ "id": 1, "name": "刘明", "loginName": "liuming", "role": "MANAGER", "phone": "12200993311", "department": "综合部", "workstation": "XX楼301室" }
```

错误：400 用户名或密码错误。

### 1.2 注册

`POST /api/auth/register`　权限：无需登录

请求体：

```json
{ "name": "张伟", "loginName": "zhangwei", "password": "123456", "phone": "13900001111", "department": "研发部", "workstation": "A栋502" }
```

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| name | string | ✓ | 姓名 |
| loginName | string | ✓ | 登录名，唯一 |
| password | string | ✓ | 密码（6~32 位） |
| phone | string | ✓ | 联系电话（送餐用） |
| department | string | | 工作单位（部门） |
| workstation | string | ✓ | 工位信息（送餐用） |

- 自助注册的角色固定为 `EMPLOYEE`；由管理员添加指定角色用户见 §2。
- 注册成功即建立会话（与登录一致），直接返回登录用户信息。

响应 data 同 1.1。错误：400 登录名已存在。

### 1.3 登出

`POST /api/auth/logout`　权限：登录即可

响应：`data: null`。

### 1.4 当前登录用户

`GET /api/auth/me`　权限：登录即可

响应 data 同 1.1（不含密码）。

### 1.5 修改自己的密码

`PUT /api/auth/password`　权限：登录即可

请求体：

```json
{ "oldPassword": "123456", "newPassword": "654321" }
```

响应：`data: null`。错误：400 原密码不正确。

---

## 2. 用户管理 User

### 2.1 用户列表（分页）

`GET /api/users?pageNum=1&pageSize=10&keyword=&role=&department=`　权限：MANAGER

| 参数 | 说明 |
|---|---|
| keyword | 姓名/登录名模糊搜索 |
| role | 按角色筛选（可选） |
| department | 按部门模糊筛选（可选） |

响应 data.list 元素：

```json
{ "id": 3, "name": "张伟", "loginName": "zhangwei", "role": "EMPLOYEE", "phone": "13900001111", "department": "研发部", "workstation": "A栋502", "createTime": "2026-09-05 10:00:00" }
```

### 2.2 新增用户

`POST /api/users`　权限：MANAGER

请求体：

```json
{ "name": "张伟", "loginName": "zhangwei", "password": "123456", "phone": "13900001111", "department": "研发部", "workstation": "A栋502", "role": "EMPLOYEE" }
```

| 字段 | 必填 | 说明 |
|---|---|---|
| name | ✓ | 姓名 |
| loginName | ✓ | 登录名，唯一 |
| password | ✓ | 初始密码（明文传入，后端加密存储） |
| phone | ✓ | 联系电话（送餐用） |
| department | | 工作单位（部门） |
| workstation | ✓ | 工位信息（送餐用） |
| role | ✓ | 角色枚举，默认 EMPLOYEE |

响应：`data` 为新用户（不含密码）。错误：400 登录名已存在。

### 2.3 用户详情

`GET /api/users/{id}`　权限：MANAGER

响应 data 同 2.1 元素。

### 2.4 修改用户

`PUT /api/users/{id}`　权限：MANAGER

请求体同 2.2（**不含 password**）。响应：更新后的用户。

### 2.5 删除用户

`DELETE /api/users/{id}`　权限：MANAGER

响应：`data: null`。错误：400 不能删除自己；400 该用户存在有效订单时不允许删除（需先取消其订单）。

### 2.6 重置用户密码

`PUT /api/users/{id}/password`　权限：MANAGER

请求体：`{ "newPassword": "888888" }`。响应：`data: null`。

### 2.7 批量导入用户（文件上传）

`POST /api/users/import`　权限：MANAGER

`multipart/form-data`，字段 `file`（.xlsx/.xls，≤10MB）。

模板列（第一行为表头）：

| 姓名 | 登录名 | 密码 | 联系电话 | 工作单位 | 工位信息 | 角色 |
|---|---|---|---|---|---|---|
| 张伟 | zhangwei | 123456 | 13900001111 | 研发部 | A栋502 | EMPLOYEE |

角色列填写 §0.5 枚举值，留空默认 EMPLOYEE。

响应 data：

```json
{ "successCount": 10, "failCount": 1, "failDetails": [ { "row": 5, "reason": "登录名已存在" } ] }
```

- 任一行校验失败则该行不导入，其余行正常导入；
- 文件格式错误返回 400。

---

## 3. 文件 File

### 3.1 上传图片（菜品图片）

`POST /api/files/upload/image`　权限：登录即可（实际用于食谱/菜单编辑界面）

`multipart/form-data`，字段 `file`（jpg/jpeg/png/gif/webp，≤5MB）。

响应 data：

```json
{ "url": "/uploads/image/202609/uuid1234.jpg" }
```

`url` 存入食谱/菜单的 `photo` 字段；前端拼接域名即可访问（GET 静态资源）。

### 3.2 图片访问（静态资源）

`GET /uploads/**`　无需认证

磁盘目录映射，浏览器缓存 30 天。

---

## 4. 食谱管理 Recipe

### 4.1 食谱列表（分页）

`GET /api/recipes?pageNum=1&pageSize=10&keyword=&classify=`　权限：登录即可

| 参数 | 说明 |
|---|---|
| keyword | 菜名模糊搜索 |
| classify | 按分类精确筛选 |

响应 data.list 元素：

```json
{ "id": 1, "name": "炒白菜", "photo": "/uploads/image/202609/a.jpg", "unit": "份", "classify": "菜肴", "price": 5.00, "createTime": "2026-09-05 10:00:00", "updateTime": "2026-09-10 14:20:00" }
```

### 4.2 新增菜品

`POST /api/recipes`　权限：MANAGER、CHEF

请求体：

```json
{ "name": "青椒炒肉丝", "photo": "/uploads/image/202609/a.jpg", "unit": "份", "classify": "菜肴", "price": 12.00 }
```

| 字段 | 必填 | 说明 |
|---|---|---|
| name | ✓ | 菜肴名称 |
| photo | | 菜品图片 URL（先调 3.1 上传获取） |
| unit | ✓ | 计量单位（份/两/个/例/杯…） |
| classify | ✓ | 分类（主食/糕点/菜肴/甜点…） |
| price | ✓ | 单位价格（元，>0，两位小数） |

响应：新菜品完整信息。

### 4.3 菜品详情

`GET /api/recipes/{id}`　权限：登录即可

响应同 4.1 元素。

### 4.4 修改菜品

`PUT /api/recipes/{id}`　权限：MANAGER、CHEF

请求体同 4.2。修改不影响已有菜单与订单（快照机制）。响应：更新后菜品。

### 4.5 删除菜品

`DELETE /api/recipes/{id}`　权限：MANAGER、CHEF

删除不影响已有菜单与订单。响应：`data: null`。

### 4.6 批量删除菜品

`DELETE /api/recipes/batch`　权限：MANAGER、CHEF

请求体：`{ "ids": [1, 2, 3] }`。响应：`data: null`。

---

## 5. 菜单管理 Menu

### 5.1 菜单列表（含历史）

`GET /api/menus?pageNum=1&pageSize=10`　权限：登录即可

响应 data.list 元素：

```json
{ "id": 2, "name": "第38周菜单", "status": "USE", "createTime": "2026-09-15 09:30:00" }
```

### 5.2 当前使用中菜单（员工点餐用）

`GET /api/menus/current`　权限：登录即可

响应 data：

```json
{
  "id": 2, "name": "第38周菜单", "status": "USE", "createTime": "2026-09-15 09:30:00",
  "items": [
    { "id": 21, "name": "炒白菜", "photo": "/uploads/image/202609/a.jpg", "unit": "份", "classify": "菜肴", "price": 5.00 },
    { "id": 22, "name": "米饭", "photo": "/uploads/image/202609/b.jpg", "unit": "两", "classify": "主食", "price": 0.30 }
  ]
}
```

无使用中菜单时 `data: null`。

### 5.3 创建菜单

`POST /api/menus`　权限：MANAGER

请求体：

```json
{
  "name": "第39周菜单",
  "recipeIds": [1, 2, 5, 8]
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| name | ✓ | 菜单名字（独立命名） |
| recipeIds | ✓ | 从食谱选择的菜品 id 数组 |

菜品信息（含价格）从食谱快照复制。响应：新菜单完整信息（含 items）。

### 5.4 菜单详情

`GET /api/menus/{id}`　权限：登录即可

响应 data 同 5.2 结构（含 items）。

### 5.5 向菜单添加菜品

`POST /api/menus/{id}/items`　权限：MANAGER

请求体：`{ "recipeIds": [3, 4] }`。响应：更新后菜单。

### 5.6 修改菜单菜品价格

`PUT /api/menus/items/{itemId}/price`　权限：MANAGER

请求体：`{ "price": 6.50 }`。仅影响本菜单该菜品，不影响食谱。响应：更新后菜单项。

### 5.7 删除菜单菜品

`DELETE /api/menus/items/{itemId}`　权限：MANAGER

响应：`data: null`。不影响已有订单。

### 5.8 删除菜单

`DELETE /api/menus/{id}`　权限：MANAGER

响应：`data: null`。错误：400 使用中的菜单不可删除，须先启用新菜单。

### 5.9 启用菜单（更换/复用）

`PUT /api/menus/{id}/activate`　权限：MANAGER

启用指定菜单（旧使用中菜单自动转历史；历史菜单可借此复用）。响应：启用后的菜单。

---

## 6. 订餐与订单 Order

### 6.1 当前订餐状态

`GET /api/orders/status`　权限：登录即可

响应 data：

```json
{
  "canOrder": true,
  "mealDate": "2026-09-21",
  "deadline": "09:00",
  "serveStartTime": "11:30",
  "reason": null
}
```

| 字段 | 说明 |
|---|---|
| canOrder | 当前是否在订餐时间窗口内 |
| mealDate | 若可订，本次订单对应的用餐日期 |
| reason | 不可订时的原因提示（"已过订餐截止时间" / "次日订餐尚未开始"） |

### 6.2 下单

`POST /api/orders`　权限：登录即可（任何角色）

请求体：

```json
{ "items": [ { "menuItemId": 21, "qty": 2 }, { "menuItemId": 22, "qty": 4 } ] }
```

| 字段 | 必填 | 说明 |
|---|---|---|
| menuItemId | ✓ | 菜单项 id（必须属于当前使用中菜单） |
| qty | ✓ | 分量（正整数，如米饭 4 两） |

响应 data：

```json
{
  "id": 1001, "mealDate": "2026-09-21", "status": "VALID",
  "empName": "刘明", "phone": "12200993311", "workstation": "XX楼301室",
  "createTime": "2026-09-20 14:30:22", "totalPrice": 6.20,
  "items": [
    { "id": 5001, "name": "炒白菜", "unit": "份", "price": 5.00, "qty": 1, "amount": 5.00 },
    { "id": 5002, "name": "米饭", "unit": "两", "price": 0.30, "qty": 4, "amount": 1.20 }
  ]
}
```

错误：400 当前不在订餐时间窗口内；400 该用餐日期已下过单；400 菜单项不属于当前使用中菜单。

### 6.3 我的订单

`GET /api/orders/mine?mealDate=&pageNum=1&pageSize=10`　权限：登录即可

- `mealDate`（可选）：按用餐日期精确查询。
- 响应 data.list 元素同 6.2 下单响应。

### 6.4 订单查询（按用餐日期，经理/配餐员用）

`GET /api/orders?mealDate=2026-09-21&pageNum=1&pageSize=100`　权限：MANAGER、DELIVERER

- `mealDate`（可选）：默认按"最近一个可订用餐日期"。
- 响应 data.list 元素同 6.2。

### 6.5 订单详情

`GET /api/orders/{id}`　权限：登录即可（普通员工仅能查看自己的订单；MANAGER/DELIVERER 可查看任意）

响应 data 同 6.2。

### 6.6 删除（取消）订单

`DELETE /api/orders/{id}`　权限：MANAGER

物理删除；员工在订餐窗口内可重新下单。响应：`data: null`。

### 6.7 总括订单（厨房主管备料汇总）

`GET /api/orders/blanket?mealDate=2026-09-21`　权限：CHEF（MANAGER 也可）

响应 data：

```json
{
  "mealDate": "2026-09-21",
  "totalEmployeeCount": 35,
  "items": [
    { "name": "米饭", "unit": "两", "totalQty": 86 },
    { "name": "炒白菜", "unit": "份", "totalQty": 23 }
  ]
}
```

（对当天所有有效订单按 菜名+单位 汇总分量。）

### 6.8 配餐订单批量查询（配餐员配送用）

`GET /api/orders/delivery?mealDate=2026-09-21`　权限：DELIVERER（MANAGER 也可）

响应 data（按员工列出全部订单，含送餐信息）：

```json
{
  "mealDate": "2026-09-21",
  "orders": [
    {
      "id": 1001, "empName": "刘明", "phone": "12200993311", "workstation": "XX楼301室",
      "items": [ { "name": "米饭", "unit": "两", "qty": 4 }, { "name": "小炒肉", "unit": "份", "qty": 1 } ]
    }
  ]
}
```

前端按此渲染批量打印页（落款：送餐员、打印时间）。

---

## 7. 统计报表 Report

### 7.1 月度销售统计总报表

`GET /api/reports/monthly?month=2026-09`　权限：MANAGER、FINANCE

响应 data：

```json
{
  "month": "2026-09",
  "items": [
    { "name": "米饭", "unit": "两", "totalQty": 310, "avgPrice": 0.30, "totalAmount": 93.00 },
    { "name": "小炒肉", "unit": "份", "totalQty": 120, "avgPrice": 5.00, "totalAmount": 600.00 }
  ],
  "totalAmount": 693.00
}
```

- 按用餐日期归属月份，已取消订单不计入。
- 单价为加权平均（totalAmount ÷ totalQty）。

### 7.2 月度销售统计总报表导出

`GET /api/reports/monthly/export?month=2026-09`　权限：MANAGER、FINANCE

响应：Excel 文件流（下载）。文件名如 `月度销售统计总报表_2026-09.xlsx`。

### 7.3 员工月度订单汇总表

`GET /api/reports/employee/{userId}?month=2026-09`　权限：MANAGER、FINANCE

响应 data：

```json
{
  "month": "2026-09",
  "employee": { "id": 3, "name": "张伟", "phone": "13900001111", "department": "研发部", "workstation": "A栋502" },
  "orders": [
    {
      "id": 1002, "mealDate": "2026-09-02", "createTime": "2026-09-01 15:10:00", "totalPrice": 9.20,
      "items": [ { "name": "米饭", "unit": "两", "price": 0.30, "qty": 4, "amount": 1.20 } ]
    }
  ],
  "monthTotalAmount": 186.50
}
```

### 7.4 员工月度订单汇总表导出

`GET /api/reports/employee/{userId}/export?month=2026-09`　权限：MANAGER、FINANCE

响应：Excel 文件流。文件名如 `员工月度订单汇总表_张伟_2026-09.xlsx`。

### 7.5 个人月度消费统计汇总表

`GET /api/reports/mine/monthly?month=2026-09`　权限：登录即可（查自己）

响应 data：

```json
{
  "month": "2026-09",
  "employee": { "name": "刘明", "phone": "12200993311", "workstation": "XX楼301室" },
  "items": [
    { "name": "米饭", "unit": "两", "totalQty": 18, "avgPrice": 0.30, "totalAmount": 5.40 }
  ],
  "totalAmount": 61.20
}
```

### 7.6 个人月度消费统计汇总表导出

`GET /api/reports/mine/monthly/export?month=2026-09`　权限：登录即可

响应：Excel 文件流。文件名如 `个人月度消费统计汇总表_2026-09.xlsx`。

### 7.7 个人月度订单汇总表

`GET /api/reports/mine/orders?month=2026-09`　权限：登录即可（查自己）

响应 data 结构同 7.3。

### 7.8 个人月度订单汇总表导出

`GET /api/reports/mine/orders/export?month=2026-09`　权限：登录即可

响应：Excel 文件流。

---

## 8. 系统配置 Config

### 8.1 查询系统参数

`GET /api/configs`　权限：登录即可

响应 data：

```json
{ "orderDeadline": "09:00", "serveStartTime": "11:30" }
```

### 8.2 修改系统参数

`PUT /api/configs`　权限：MANAGER

请求体：

```json
{ "orderDeadline": "09:00", "serveStartTime": "11:30" }
```

- 格式 `HH:mm`；校验 `serveStartTime > orderDeadline`。
- 响应：更新后的参数。错误：400 时间格式非法或配餐开始时间必须晚于订餐截止时间。

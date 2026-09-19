# TASK-009: 全栈中后台综合收口（CRUD 闭环 · 角色鉴权 · 生产部署）

> **目标**：把 TASK-001 ~ TASK-008 的全部技能串成一个**可交付的中后台应用** —— 登录鉴权 → 仪表盘 → 用户 CRUD（分页/搜索/新增/编辑/删除）→ 详情 → 角色鉴权 → 全局 401 → 防抖与请求取消 → 生产构建与部署。
> **代码工作区**：`src/exercises/TASK-009-admin-console/`（脚手架与 TODO ①~⑤ 已就位）
> **任务定位**：阶段 8 终极关 —— 这是你的**结业项目**，也是唯一一个"做出来能放进简历"的成果。

---

## 🎯 业务需求（做成什么样算完成）

一个"用户管理控制台"，两种角色看到不同的能力：

| 功能 | ADMIN | GUEST | 说明 |
| :--- | :---: | :---: | :--- |
| 登录 / 登出 / 刷新保持登录 | ✅ | ✅ | 复用 TASK-008 |
| 仪表盘（用户总数、当前角色） | ✅ | ✅ | TODO ⑤ |
| 用户列表（分页 + 关键字搜索） | ✅ | ✅ | TODO ② |
| 用户详情 `/users/:id` | ✅ | ✅ | TODO ④ |
| 新增 / 编辑 / 删除 | ✅ | ❌（按钮隐藏） | TODO ②③，后端返回 **403** |
| 未登录访问任何管理页 | ⛔ 跳登录 | ⛔ 跳登录 | 复用 `ProtectedRoute` |

**关键设计约束（来自前几个任务的教训）**：
1. 删除最后一页的最后一条 → **页码必须自动回退**，否则出现「第 5 / 4 页 + 空列表」；
2. 搜索输入必须**防抖**（否则每敲一个字打一次请求）；参数变化时**取消在途请求**（`AbortController`）；
3. 角色隐藏只是体验 —— **后端必须独立校验**（本任务后端已做，可用 `guest` 账号实测 403）；
4. token 失效（401）必须**全局统一处理**（进阶），而不是每个页面各写一遍。

---

## 📡 后端接口速查（TASK-009 新增「管理端」接口）

> ⚠️ **必须先重启后端**（`Ctrl+C` 后重新 `python -m uvicorn main:app --port 8000 --reload`），否则新接口会 404。

| 接口 | 方法 | 权限 | 说明 |
| :--- | :---: | :--- | :--- |
| `/api/admin/users/page` | GET | 已登录（任意角色） | 分页 + 关键字；返回 `PageResult<ApiUser>` |
| `/api/admin/users` | POST | **ADMIN** | 新增，body 为 `CreateUserCommand` |
| `/api/admin/users/{id}` | PUT | **ADMIN** | 编辑（整量更新），body 为 `UpdateUserCommand` |
| `/api/admin/users/{id}` | DELETE | **ADMIN** | 删除 |
| `/api/users/{id}` | GET | 公开 | 详情（TASK-004 已有，可直接复用） |
| `/api/reset` | POST | 公开 | 重置为 23 条种子数据（调试常用） |

**权限语义（务必分清）**：

| 状态 | HTTP | 后端 detail |
| :--- | :---: | :--- |
| 没带 / 带了无效 token | **401** | `未提供有效的 Authorization 头，请先登录` / `登录状态已失效，请重新登录` |
| 已登录但角色不够（guest 增删改） | **403** | `当前角色 GUEST 无权执行该操作（需要 ADMIN）` |

> **401 vs 403 的区别是真实工程的分水岭**：401 = "你是谁？我不知道" → 前端应跳登录；403 = "我知道你是谁，但你不能干这个" → 前端应提示无权限。把它们混成一个码，前端就无法决定该跳登录还是给提示。

**实测命令**：

```bash
# 登录取 token（admin / guest 各来一次）
curl -X POST "http://127.0.0.1:8000/api/auth/login?delay=0" \
     -H "Content-Type: application/json" -d '{"username":"guest","password":"guest123"}'

# guest 删除 → 期望 403
curl -X DELETE -H "Authorization: Bearer <guest-token>" http://127.0.0.1:8000/api/admin/users/1

# admin 新增 → 期望 201
curl -X POST -H "Authorization: Bearer <admin-token>" -H "Content-Type: application/json" \
     -d '{"name":"新用户","username":"newbie","email":"new@t.com"}' \
     http://127.0.0.1:8000/api/admin/users
```

---

## 🧱 工作区结构（脚手架已就位）

```
src/exercises/TASK-009-admin-console/
├── AdminApp.tsx                     ✅ 已给定：侧边栏 + 内容区 + 路由表（受保护）
├── types.ts                         ✅ 已给定：CreateUserCommand / UpdateUserCommand / UserFormState
├── api/adminUserApi.ts              TODO ①  4 个管理端接口函数
├── pages/AdminUsersPage.tsx         TODO ②  列表 + 搜索防抖 + 分页 + 角色感知 + 删除回退
├── components/UserFormModal.tsx     TODO ③  新增/编辑弹窗（受控表单）
├── pages/UserDetailPage.tsx         TODO ④  动态路由详情 + 三态
└── pages/DashboardPage.tsx          TODO ⑤  仪表盘统计卡片
```

**复用清单（别重复造）**：`AuthProvider` / `AppHeader` / `ProtectedRoute`（TASK-008）、`httpClient` 与拦截器 / `PageResult<T>` / `usePagedUsers` / `Pagination`（TASK-007）、`ApiUser` 契约（TASK-005）、`NotFoundPage`（TASK-006）。

---

## 💡 所需知识点与提示

- **接口层与状态层解耦**：`usePagedUsers` 目前硬编码调用公开接口。要接管理端接口，**推荐给它加一个 `fetcher` 参数**（传入不同的请求实现），而不是复制一份状态机出来 —— 这就是**依赖注入**在前端的形态。
- **防抖（debounce）**：思路是"值变化后等 300ms，没有新变化才真正使用它"。自写 `useDebouncedValue(value, delay)`：用 `useState` + `useEffect` 定时器 + **清理函数 `clearTimeout`**（依赖数组 `[value, delay]`）。
- **请求取消（AbortController）**：在 `useEffect` 的清理函数里 `controller.abort()`，并把 `signal` 通过 api 层透传给 axios。被取消的请求会抛 `code === 'ERR_CANCELED'` —— **它必须先于"无响应"判定被静默处理**（TASK-007 已预留）。
- **末页回退**：删除成功后，若 `page > totalPages`（新值），应 `setPage(totalPages)` 再刷新；这是"越界页码"的正解（而不是让用户看到空列表）。
- **401 vs 403**：`error.response.status` 决定前端行为（跳登录 vs 提示无权限）。
- **全局 401（进阶）**：拦截器不在 React 树里 → 用 `window.location` 硬跳，或**事件广播**（`window.dispatchEvent(new CustomEvent('auth:unauthorized'))`）+ 在 Provider 内部监听并处理。

---

## ⚠️ 编码前必读的 6 个坑

1. **忘记重启后端** → 管理端接口 404（最容易浪费 20 分钟的一个坑）。
2. **删除后不处理页码回退** → 「第 5 / 4 页 + 空列表」；并且 `Pagination` 的"下一页"按钮状态也会错乱。
3. **搜索输入不加防抖** → 输入"架构师"三个字打三次请求，且**旧响应可能后到**覆盖新结果（竞态）。
4. **把 401 与 403 当同一件事** → guest 点删除时被跳去登录页（应该提示"无权限"而不是"你未登录"）。
5. **只在前端隐藏按钮就当完成了权限控制** → 用 `curl` 一测就穿（本任务后端会返回 403，正好用来对照体验层与安全层的差别）。
6. **`UserFormModal` 用 `useState` 预填编辑数据**：`useState(编辑数据)` 的初始值**只在首次渲染生效**；若要支持"在同一个弹窗里切换到另一个用户"，需要用 `key` 强制重建组件，或在依赖变化时同步 state（TASK-009 会讲清这个取舍）。

---

## ✅ 验收标准 (DoD)

- [ ] ① `adminUserApi.ts` 实现 4 个函数（泛型齐全、URL 用相对子路径、不手写 Authorization 头）
- [ ] ② `AdminUsersPage` 完成：分页 + 关键字搜索（**防抖生效**：连续输入只打一次请求）+ 四态渲染
- [ ] ③ 角色感知：`guest` 登录时「新增 / 编辑 / 删除」入口消失；直接调接口返回 **403 中文提示**
- [ ] ④ 新增 / 编辑弹窗可用：受控表单 + `submitting` 禁用 + 错误提示 + 成功后刷新列表
- [ ] ⑤ 删除成功且**末页被删空时页码自动回退**（不出现空列表 + 越界页码）
- [ ] ⑥ `UserDetailPage` 完成：`useParams` 取 id（含 `string | undefined` 收窄）+ 三态 + 404 中文提示
- [ ] ⑦ `DashboardPage` 完成：展示当前用户 + 用户总数（用分页接口的 `total`，不拉全量）
- [ ] ⑧ 未登录访问任意管理页 → 跳登录；刷新浏览器保持登录（回归 TASK-008）
- [ ] ⑨ （进阶）**全局 401 处理**：token 失效后任意请求都能触发"清 token + 跳登录"（不是每个页面各写一遍）
- [ ] ⑩ （进阶）**请求取消**：快速切换参数时，在途请求被 `AbortController` 真正取消（Network 面板可见 `(canceled)`）
- [ ] ⑪ **生产构建与部署**：`npm run build` 成功 + `npm run preview` 可跑通；写出 Nginx 静态托管 + `/api` 反向代理配置样例（归档到 `docx/notes/deploy.md`）
- [ ] ⑫ 通过教练终审与结业口试（跨任务综合考察）

### 🚀 结业加分项（选做）
- [ ] 用户列表支持排序（按 id / 姓名），并处理"排序变化 → 页码归 1"
- [ ] 表格行的加载骨架（skeleton）替代整块 loading，减少布局跳动
- [ ] 表单校验：邮箱格式、必填项（提交前拦截，错误定位到字段）
- [ ] 404 页面提供"返回仪表盘"按钮

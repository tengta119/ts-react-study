# TASK-006: React Router 前端单页路由与动态传参 (SPA Routing)

> **目标**：掌握现代前端单页应用（SPA）的核心路由体系：页面无刷新导航、动态路由传参（`useParams`）、编程式跳转（`useNavigate`）与 404 路由兜底。
> **代码工作区**：`src/exercises/TASK-006-router/`

---

## 🎯 业务需求

将前面零散的各个功能页面整合为一个结构规范的**中后台 SPA 导航应用**：
1. **路由表规划**：
   - `/`：系统首页概览（`HomePage`）
   - `/users`：用户中心列表（挂载上一任务实现的 `UserManager`）
   - `/users/:id`：用户个人档案详情页（`UserDetailPage`），动态提取 URL 路径中的 `:id`，向本地后端 `GET /api/users/{id}` 发起详情查询
   - `/register`：新增用户注册页面（挂载之前实现的 `UserForm`）
   - `*`：404 未知页面兜底提示
2. **导航与高亮（NavLink）**：
   - 顶部导航栏使用 `<NavLink to="...">`，当处于当前路径时，导航按钮自动高亮显示；
   - 点击导航栏任何链接，浏览器地址栏平滑变化，**页面绝对不发生白屏整页刷新**。
3. **编程式跳转与返回（useNavigate）**：
   - 在用户卡片上点击“查看详情”按钮，通过 `navigate('/users/' + user.id)` 平滑切入详情页；
   - 在详情页提供“⬅️ 返回用户列表”按钮，通过 `navigate('/users')` 或 `navigate(-1)` 历史回退。

---

## 💡 所需知识点与提示

- **核心组件**：
  - `BrowserRouter`：路由上下文容器，基于 HTML5 History API 监听 URL 变化；
  - `Routes` & `Route`：路由规则匹配器，按 `path` 分发对应的 `element` 组件；
  - `Link` vs 原生 `<a>`：`<a>` 会触发整页刷新导致 React State 全部丢失；`<Link to="...">` 拦截默认行为，仅修改 History 并局部换组件；
  - `NavLink`：自带 `isActive` 状态的特殊 Link，专供导航栏高亮。
- **核心 Hooks**：
  - `useParams<{ id: string }>()`：类比 Spring Boot 的 `@PathVariable("id")`，提取动态路径参数；
  - `useNavigate()`：类比重定向 `redirect:`，在代码逻辑中平滑跳转页面。

### ⚠️ 编码前必读的 2 个坑

- **`useParams` 拿到的参数永远是 `string | undefined`**：即使 URL 是 `/users/1`，在 JS 中拿到的也是字符串 `"1"`，发请求或做比较时记得做类型转换或非空守卫。
- **所有 Router Hooks 必须包裹在 `BrowserRouter` 内部**：如果在 `<BrowserRouter>` 外层使用 `useNavigate` 或 `useParams`，React Router 会抛出致命报错 `useNavigate() may be used only in the context of a <Router> component`。

---

## ✅ 验收标准

- [x] 页面切换完全无刷新，地址栏 URL 联动；
- [x] 顶部导航栏 `<NavLink>` 当前激活路由高亮；
- [x] 动态路由 `/users/:id` 正确解析 `:id` 并拉取展示详情；
- [x] 包含 404 兜底页面和编程式导航返回；
- [x] 通过教练 Code Review 并通关归档。

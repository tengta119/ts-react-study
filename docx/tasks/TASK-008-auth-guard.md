# TASK-008: JWT 登录认证、全局登录态与路由守卫 (Auth & Route Guard)

> **目标**：打通「前后端分离项目的登录鉴权闭环」—— token 持久化、请求自动携带令牌、全局登录态共享、受保护路由守卫，以及 401 失效的统一处理思路。
> **代码工作区**：`src/exercises/TASK-008-auth-guard/`（脚手架与 TODO ①~⑦ 已就位）
> **任务定位**：阶段 8 第二关 —— 从「能调 API」进阶到「有身份、有权限边界的应用」。

---

## 🎯 业务需求

把应用从"所有人都能看"升级为"需要登录才能用"：

1. **登录页 `/login`（公开）**
   - 受控表单：登录名 + 密码；提交时 `e.preventDefault()`；
   - 请求中按钮禁用并显示「登录中…」；失败时展示后端返回的中文提示（如「用户名或密码错误」）；
   - 登录成功后进入受保护页面。
2. **登录态持久化**
   - 登录成功 → token 存进 `localStorage`（键名统一引用 TASK-007 的 `TOKEN_KEY`）；
   - **刷新浏览器后依然是登录状态**（用 token 换用户信息恢复登录态）；
   - 登出 → 清除 token 与用户信息。
3. **全局登录态 `AuthContext`**
   - 任何组件都能通过 `useAuth()` 拿到 `{ user, initializing, login, logout }`；
   - 导航栏可据此显示/隐藏入口（例如登录后才显示"用户列表"）。
4. **路由守卫 `ProtectedRoute`（🔒）**
   - `/profile`、`/users` 未登录访问 → 自动跳转 `/login`；
   - 登录后正常进入；**校验登录态期间不能把已登录用户踢出去**；
   - 浏览器后退键不应在"登录页 ⇄ 受保护页"之间来回弹。
5. **401 失效链路可验证**
   - 用后端的 `POST /api/auth/logout` 让 token 服务端失效，再访问受保护接口，应能看到后端返回的
     「登录状态已失效，请重新登录」。

---

## 📡 后端接口速查（TASK-008 新增）

| 接口 | 方法 | 鉴权 | 说明 |
| :--- | :---: | :---: | :--- |
| `/api/auth/login` | POST | 否 | 入参 `{ username, password }`，返回 `{ token, tokenType, expiresIn, user }`；`?delay=1.5` 可模拟慢速网络 |
| `/api/auth/me` | GET | **是** | 需 `Authorization: Bearer <token>`；无 token / token 无效均返回 **401** |
| `/api/auth/logout` | POST | 是 | 让当前 token 在服务端失效（专供测试 401 链路） |

**演示账号**：`admin / admin123`（ADMIN）、`guest / guest123`（GUEST）

```bash
# 1) 登录拿 token
curl -X POST "http://127.0.0.1:8000/api/auth/login?delay=0" \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'

# 2) 带 token 访问受保护接口
curl -H "Authorization: Bearer learn-jwt.admin.xxxx" http://127.0.0.1:8000/api/auth/me

# 3) 【重要】让 token 失效，用于验证 401 链路
curl -X POST -H "Authorization: Bearer learn-jwt.admin.xxxx" http://127.0.0.1:8000/api/auth/logout
```

---

## 🧱 分层结构与 Java 对照

```
src/exercises/TASK-008-auth-guard/
├── types.ts                     契约：LoginCommand / AuthUser / LoginResult / AuthContextValue
├── tokenStore.ts                token 持久化封装（⇄ TokenRepository）
├── authApi.ts                   认证接口（⇄ AuthClient / Feign）
├── AuthContext.ts               createContext + useAuth（⇄ SecurityContextHolder 的"读"）
├── AuthProvider.tsx             Provider：状态 + 启动恢复 + login/logout（⇄ 鉴权过滤器 + 会话恢复）
├── components/ProtectedRoute.tsx 路由守卫（⇄ OncePerRequestFilter：拦截未鉴权请求）
├── pages/LoginPage.tsx          登录页（⇄ 认证接口的 Controller + 表单页）
├── pages/ProfilePage.tsx        个人中心（受保护资源）
└── AuthApp.tsx                  路由表 + AuthProvider 包裹
```

| 后端概念 | 前端对应物 | 说明 |
| :--- | :--- | :--- |
| Session + JSESSIONID Cookie | JWT + `localStorage` token | Session 服务端有状态；JWT 自包含、服务端**无状态** |
| `SecurityContextHolder` / `ThreadLocal` | `AuthContext` + `useContext` | 当前主体"随取随用"，不必层层传参 |
| `OncePerRequestFilter` 鉴权 | `ProtectedRoute` | **关键差异**：后端是安全边界，前端只是体验 |
| `@PreAuthorize("hasRole('ADMIN')")` | `role` 字段判断（进阶） | 角色级鉴权 |
| 登录接口下发 token | `loginApi` + `saveToken` | token 是后续所有请求的"通行证" |

---

## 💡 所需知识点与提示

- **JWT 为什么取代 Session**：Session 要求服务端存会话（多实例要共享 Redis）；JWT 把用户信息签进令牌，服务端**只需校验签名**，天然适合无状态横向扩展。代价是"主动失效困难"（需黑名单/短过期 + refresh token）。
- **Bearer 令牌的位置**：`Authorization: Bearer <token>` —— 你在 TASK-007 的请求拦截器里**已经把插槽做好了**，本任务只需保证"登录成功后 token 及时写入 localStorage"。
- **Context 解决 Prop Drilling**：`user` 是跨层级数据（导航栏、个人页、守卫都要用），用 Context 避免中间组件被迫转发 props。
- **`initializing` 的时序**：刷新页面时"有 token"≠"已登录"，必须问后端才知道用户是谁。这段"还不知道"的时间必须显式建模，否则必踩坑（见下方坑 1）。
- **`replace` 的意义**：守卫跳转用**替换**（`replace`）而非压栈，避免历史记录出现「登录页 ⇄ 受保护页」来回弹的死循环。

---

## ⚠️ 编码前必读的 6 个坑

### 坑 1（本任务第一大坑）：把"未知"当作"未登录"，刷新即被踢出
`initializing` 若初始为 `false`，刷新页面的瞬间 `user === null` 成立 → 守卫立刻把你重定向到 `/login`。
✅ 必须**三态建模**：`initializing` → 显示「校验登录态…」；`initializing=false && user=null` → 才跳登录页。

### 坑 2：token 的写入顺序
`loginApi` 成功后必须**先** `saveToken(token)` **再** `setUser(user)`。
反例：先 `setUser`，界面立刻渲染受保护页面 → 组件发起新请求 → 拦截器读 localStorage 时 token 还没写进去 → **401**。
（顺序错误的本质：把"状态更新"当成了"副作用已完成"。）

### 坑 3：登录成功后不要用 `useEffect` 监听 `user` 变化去跳转
事件处理器里"请求成功 → 立即跳转"最直接可靠。
用 `useEffect([user])` 跳转会导致：**先渲染登录页一帧**（闪烁），并且引入额外一次渲染与潜在的重复跳转竞态。

### 坑 4：拦截器里**不能**用 `useNavigate`
axios 拦截器不在 React 组件树里，没有路由上下文。
全局 401 处理的正解是"解耦"：拦截器只**通知**（`window.location.href = '/login'`，或派发自定义事件/回调注册），由 React 世界（AuthProvider）负责清 token 与跳转。这也是进阶挑战。

### 坑 5：前端守卫**不是**安全边界
JS 可以被绕过（改前端代码、直接调接口）。**后端必须独立鉴权**（我们的 `/api/auth/me` 就是示范）。
前端守卫的价值只在于"更好的用户体验"，永远不能替代后端权限校验。

### 坑 6：`localStorage` 存 token 的固有风险（认知题，不必实现）
`localStorage` 可被同源脚本读取 → 一旦 XSS 就泄露 token。
更安全的方案是 `HttpOnly + Secure + SameSite` Cookie（JS 读不到）+ CSRF 防护。
本任务用 `localStorage` 是为了让你**亲手感受 token 的生命周期**；真实项目要按安全等级权衡。

---

### 🔢 编号约定（脚手架文件里的 TODO 编号 = 下方验收项编号）

| TODO | 文件 | 内容 |
| :--: | :--- | :--- |
| ① | `tokenStore.ts` | `saveToken / readToken / clearToken` |
| ② | `authApi.ts` | `loginApi / fetchMeApi / logoutApi` |
| ③ | `AuthProvider.tsx` | 状态 + 启动恢复登录态 + `login`/`logout`（**核心**） |
| ④ | `pages/LoginPage.tsx` | 受控登录表单 + 三态 + 成功后跳转 |
| ⑤ | `pages/ProfilePage.tsx` | 展示用户信息 + 登出 |
| ⑥ | `components/ProtectedRoute.tsx` | 三态分流守卫 |
| ⑦ | `AuthApp.tsx` | 用 `<ProtectedRoute>` 包裹 `/profile` 与 `/users` |

---

## ✅ 验收标准 (DoD)

- [ ] ① `tokenStore.ts` 完成 `saveToken / readToken / clearToken`，且统一使用 `TOKEN_KEY` 常量（取消脚手架里注释掉的导入）
- [ ] ② `authApi.ts` 完成三个接口函数，URL 写相对子路径（`/auth/login` 而非 `/api/auth/login`）
- [ ] ③ `AuthProvider` 完成：`user` / `initializing` 三态、启动时用 token 恢复登录态、`login` **先写 token 再更新用户**、`logout` 清 token 与用户
- [ ] ④ `LoginPage` 完成：受控表单 + `preventDefault` + `submitting` 禁用 + 错误中文提示 + 成功后跳转
- [ ] ⑤ `ProfilePage` 展示 `username / name / role`，登出后回到登录页且 token 已清除
- [ ] ⑥ `ProtectedRoute` 三态分流：`initializing` 显示校验中、未登录 `<Navigate to="/login" replace />`、已登录放行
- [ ] ⑦ `AuthApp` 里 `/profile` 与 `/users` 已用 `<ProtectedRoute>` 包裹（原先的直接放行路由已替换）
- [ ] ⑧ `useAuth()` 在 Provider 之外调用时报出明确错误（已由教练提供，需实际验证一次）
- [ ] ⑨ 刷新浏览器仍保持登录态（不闪回登录页）；未登录直接访问 `/profile` 会跳到 `/login`；后退键不会死循环
- [ ] ⑩ 用 `POST /api/auth/logout` 制造 token 失效，观察到后端中文 401 提示（并理解为何此时界面仍显示已登录 —— 引出进阶项）
- [ ] ⑪ 通过教练 Code Review 与口试

### 🚀 进阶挑战（选做）
- [ ] **登录后回跳原页面**：守卫跳转时带 `state={{ from: location.pathname }}`，登录成功后 `navigate(from, { replace: true })`
- [ ] **全局 401 处理**：拦截器发现 401 → 清 token → 通知 AuthProvider → 跳登录（注意坑 4 的解耦约束）
- [ ] **角色鉴权**：`role !== 'ADMIN'` 时拒绝进入某页面（对照后端 `@PreAuthorize`）
- [ ] **token 过期提示**：用 `expiresIn` 做倒计时，临期提醒或自动静默刷新
- [ ] **导航栏联动**：登录后才显示「用户列表 / 个人中心」，未登录时只显示「登录」

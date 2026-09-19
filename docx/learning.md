# 学习进度与知识看板 (learning.md)

> 当前状态：**阶段 8 第二关 TASK-008 已通关 ✅ ｜ 开启终极关 TASK-009（全栈中后台综合收口）（2026-09-17）**
> 核心策略：**先理解 → 自己写 → 教练 Review → 纠错修改 → 总结归纳**

---

## 📌 当前任务状态

| 任务编号 | 任务名称 | 状态 | 代码工作区 | 完成时间 |
| :--- | :--- | :---: | :--- | :--- |
| [`TASK-001`](./tasks/TASK-001-counter.md) | 全功能计数器 (Counter) | ✅ 已通关 | `src/exercises/TASK-001-counter/Counter.tsx` | 2026-09-17 · 验收通过，已通关归档 |
| [`TASK-002`](./tasks/TASK-002-todo.md) | 经典待办清单 (Todo List) | ✅ 已通关 | `src/exercises/TASK-002-todo/TodoList.tsx` | 2026-09-17 · 验收通过，已通关归档 |
| [`TASK-003`](./tasks/TASK-003-form.md) | 受控表单与多字段联动 | ✅ 已通关 | `src/exercises/TASK-003-form/UserForm.tsx` | 2026-09-17 · 验收通过，已通关归档 |
| [`TASK-004`](./tasks/TASK-004-api.md) | 对接后端 API 与副作用处理 | ✅ 已通关 | `src/exercises/TASK-004-api/UserListApi.tsx` | 2026-09-17 · 验收通过，已通关归档 |
| [`TASK-005`](./tasks/TASK-005-refactor-hook.md) | 组件拆分、父子通信与自定义 Hook | ✅ 已通关 | `src/exercises/TASK-005-refactor-hook/` | 2026-09-17 · 验收通过，已通关归档 |
| [`TASK-006`](./tasks/TASK-006-router.md) | React Router 单页路由与动态传参 | ✅ 已通关 | `src/exercises/TASK-006-router/` | 2026-09-17 · 验收通过，已通关归档 |
| [`TASK-007`](./tasks/TASK-007-http-layer.md) | 统一请求层封装与服务端分页联调 | ✅ 已通关 | `src/exercises/TASK-007-http-layer/` | 2026-09-17 · 验收通过，已通关归档 |
| [`TASK-008`](./tasks/TASK-008-auth-guard.md) | JWT 登录认证、全局登录态与路由守卫 | ✅ 已通关 | `src/exercises/TASK-008-auth-guard/` | 2026-09-17 · 验收通过，已通关归档 |
| [`TASK-009`](./tasks/TASK-009-admin-console.md) | 全栈中后台综合收口（CRUD + 全局 401 + 部署） | 🟡 进行中 | `src/exercises/TASK-009-admin-console/` | — |

**TASK-008 总结**：
- 打通**前后端分离项目的登录鉴权闭环**：登录 → token 持久化 → 请求自动携带令牌 → 全局登录态 → 路由守卫 → 登出/失效；
- 掌握 **JWT 与 Session 的本质差异**（有状态 vs 无状态；`JSESSIONID` 浏览器自动带 vs `Bearer token` 前端手动带）；
- 用 `AuthContext` + `useContext` 实现**全局登录态共享**（对应后端 `SecurityContextHolder`，解决 Prop Drilling），并理解了 **Provider 只能影响子树** 的作用域边界（Q-RC-13）；
- 掌握**启动恢复登录态的三态建模**：`initializing` 初值必须为 `true`（“未知”≠“未登录”），否则刷新页面会把已登录用户踢出；
- 完成 `ProtectedRoute` 三态分流守卫（对应 `OncePerRequestFilter`），并明确了**前端守卫只是体验、后端才是安全边界**；
- 修复了“未 `await` 登出就跳转”导致的**跳转乒乓**，并把 `logout` 契约诚实化为 `Promise<void>`；
- 完成导航栏与登录态联动（`AppHeader` 作为 Provider 子组件）、登录页三态与错误中文提示、ProfilePage 登出与 401 演练；
- 类型现代性修正：事件类型改用 `React.SubmitEvent<HTMLFormElement>`（React 19 已弃用 `FormEvent`）。

**TASK-007 总结**：
- 搭出**四层前端请求架构**：`httpClient`（基础设施）→ `userApi`（Repository）→ `usePagedUsers`（Service/Hook）→ `UserPagedList` + `Pagination`（View），与 Spring Boot 分层一一对应；
- 掌握 **axios 拦截器**作为前端「横切关注点」：请求拦截器统一注入 `Authorization: Bearer <token>`（`AxiosHeaders.set` 官方 API），响应拦截器把异常归一化为**四分支**（`ERR_CANCELED` 优先 → 有 `response` 取 `detail` 并兜底 `HTTP xxx` → 超时双码 → 无响应网络不可达）；
- 打通**服务端分页契约** `PageResult<T>`（`list/total/page/size/totalPages`），掌握 `offset = (page-1)*size` 与「`totalPages` 以后端为权威」；
- 用 `useRef` **请求序号法**解决竞态（`try` 与 `finally` 双处比对），并在 `<StrictMode>` 双跑 effect 场景下验证有效；
- 修正了一个隐蔽的时序缺陷：`loading` 初始值必须为 `true`（`useEffect` 在渲染提交后才执行，首帧只能读到初始值）；
- 用 Vite dev proxy 绕过开发期跨域（等价生产 Nginx `proxy_pass`）；调试日志已用 `import.meta.env.DEV` 治理。

**下一步推荐目标**：开启 **TASK-008：JWT 登录认证与路由守卫**（`AuthContext` 登录态共享、`ProtectedRoute` 守卫、401 全局跳登录、`TOKEN_KEY` 读写闭环）。

**TASK-006 总结**：
- 深刻掌握了现代单页应用（SPA）无刷新路由的底层机制（利用 HTML5 `pushState` 修改地址栏，在内存中静默挂载卸载组件，彻底告别传统多页跳转白屏）；
- 熟练运用 `<BrowserRouter>`、`<Routes>`、`<Route>` 构建集中式路由表，理解了其与 Spring MVC `HandlerMapping` 的对应关系；
- 洞悉了动态路由 `:id` 底层正则命名捕获组的解析机制，彻底融会贯通了与 Spring Boot `@PathVariable` 的底层一致性；
- 熟练运用 `useParams<{ id: string }>()` 安全提取路径参数、`useNavigate()` 编程式导航回退，以及 `<NavLink>` 动态 `isActive` 菜单高亮。

**下一步进行中**：**TASK-009「全栈中后台综合收口」**（阶段 8 终极关，工作区 `src/exercises/TASK-009-admin-console/`）。将把 TASK-001~008 的成果串成一个完整的中后台应用：登录 → 仪表盘 → 用户 CRUD（分页/搜索/新增/编辑/删除+末页回退）→ 角色鉴权 → 全局 401 → 防抖与请求取消 → 生产构建与部署。

**TASK-008 已提供的现成基础**：`AuthProvider` / `useAuth` / `ProtectedRoute` / `AppHeader` / `TOKEN_KEY` / `httpClient` 拦截器体系 / 分页 Hook `usePagedUsers`。

---

## 🎯 当前学习阶段

- **当前路线**：从前端局部技术（State/Effect/Component/Router）走向全栈工程化闭环
- **主攻方向**：
  1. Spring Boot 安全认证（JWT Token / 登录拦截 / 前端 Auth 守卫）
  2. 统一网络请求封装（Axios 拦截器 / Request & Response Interceptors）
  3. 前后端分离工程化全栈项目独立构建

---

## 🗺️ 阶段路线里程碑

| 阶段 | 主题 | 核心目标 | 状态 |
| :--- | :--- | :--- | :---: |
| **阶段 1** | **TypeScript 核心基石** | 掌握类型系统，克服从 Java 名义类型向结构化类型的转变 | ✅ 阶段通关（贯穿 TASK-001~006） |
| **阶段 2** | **React 组件与 JSX** | 理解 JSX 语法本质、函数组件、Props 单向数据流 | ✅ 阶段通关（贯穿 TASK-001~006） |
| **阶段 3** | **State 与交互 (useState)** | 理解组件重渲染机制、不可变数据原则、事件处理 | ✅ 阶段通关（TASK-001 通关） |
| **阶段 4** | **列表、Key 与表单受控组件** | 掌握 `map` 渲染、Key 的底层机制、多表单受控输入 | ✅ 阶段通关（TASK-002, TASK-003 通关） |
| **阶段 5** | **副作用与生命周期 (useEffect)** | 掌握数据请求、定时器清理、依赖项数组机制 | ✅ 阶段通关（TASK-004 通关） |
| **阶段 6** | **组件拆分与通信** | 父子通信、状态提升、自定义 Hook 抽离逻辑 | ✅ 阶段通关（TASK-005 通关） |
| **阶段 7** | **React Router 前端路由** | 单页应用导航、动态路由传参、路由守卫思路 | ✅ 阶段通关（TASK-006 通关） |
| **阶段 8** | **Spring Boot + React 联调实战** | 跨域配置、Token 认证、CRUD 完整小项目独立开发 | 🟡 进行中（TASK-007/008 通关，TASK-009 进行中） |

---

## ✅ 已掌握技能栈 (Mastered)

- [x] **`useState` 基础与泛型**：状态声明、泛型标注与推导
- [x] **React 事件与表单拦截**：`onClick`、`onChange`、`onSubmit` 与 `e.preventDefault()`
- [x] **状态快照（Snapshot）心智模型**：单帧渲染函数执行模型，状态在当前帧不可变
- [x] **派生状态（Derived State）**：杜绝冗余 State，基于状态纯函数计算筛选列表、统计指标与按钮禁用
- [x] **JavaScript Falsy 避坑**：识别 `||` 短路吞 0 缺陷，精确处理边界
- [x] **函数式更新范式**：`setTodos(prev => ...)` 处理并发与批处理数据依赖
- [x] **数组不可变添加**：`[...prev, newItem]`
- [x] **数组不可变修改**：`prev.map(t => t.id === id ? { ...t, prop: newVal } : t)`
- [x] **数组不可变删除**：`prev.filter(t => t.id !== targetId)`
- [x] **对象展开运算符 `...`**：键值对平铺、浅拷贝与同名属性覆盖机制
- [x] **列表渲染与 Key 规范**：使用稳定 UUID/ID，杜绝 `index` 做 key 导致的状态串行
- [x] **复合表单对象统一管理**：`useState<FormData>({ ... })` 类似 Java DTO 模式
- [x] **动态计算属性名**：`[name]: value` 单一事件处理函数驱动多输入框
- [x] **React 合成事件与泛型**：`React.ChangeEvent<HTMLInputElement | HTMLSelectElement>` 联合类型收窄
- [x] **TypeScript 类型擦除心智**：深刻理解 TS `interface` 不可 `new`，使用对象字面量 `{}`
- [x] **表单统一校验与重置**：`Record<string, string>` 错误收集、`handleReset` 全量复位
- [x] **`useEffect` 副作用调度**：依赖项数组 `[]` 机制与禁止顶层请求的底层原因
- [x] **网络请求黄金四态闭环**：`loading` 转圈防抖、`error` 异常捕获与重试、`empty` 友好占位、`data` 卡片渲染
- [x] **Fetch 异步流读取与异常捕获**：掌握 `await res.text()` / `await res.json()` 提取响应体，杜绝 `[object Promise]` 陷阱
- [x] **JSX 三元条件分支**：熟练运用 `condition ? <A /> : <B />` 处理列表与空状态切换
- [x] **前后端 RESTful DTO 对齐**：跨域 CORS 放行与强类型契约无缝对接
- [x] **Smart vs Dumb 架构解耦**：容器组件管数据与编排，展示组件管纯排版
- [x] **Props 只读与事件回调通信**：掌握“Props Down, Events Up”数据流向
- [x] **方法引用传参**：`onKeywordChange={setKeyword}` 类比 Java 8 `this::setKeyword`
- [x] **自定义 Hook 抽象范式**：封装 `useFetch<T>` 泛型基础设施与 `useUsers` 业务领域服务
- [x] **解构别名与适配器模式**：`{ data: users, setData: setUsers }` 实现强类型领域映射
- [x] **子传父删除联动**：`onDelete(user.id)` 回调通知父组件触发不可变移出
- [x] **SPA 客户端单页路由机制**：基于 HTML5 History API 实现零白屏多页面调度
- [x] **集中式路由分发体系**：`<BrowserRouter>`, `<Routes>`, `<Route>` 映射规则
- [x] **动态路由与模式匹配**：`:id` 正则捕获提取，与 Spring `@PathVariable` 深度对齐
- [x] **路由状态感知与编程式导航**：`<NavLink>` 激活高亮与 `useNavigate()` 流程跳转
- [x] **Axios 统一请求层**：`axios.create` 实例（baseURL/超时）+ 请求/响应拦截器（横切关注点 ⇄ Filter/HandlerInterceptor）
- [x] **错误归一化四分支**：`ERR_CANCELED` 优先 → 有 `response`（取 `detail`、兜底 `HTTP <status>`）→ 超时双码（`ECONNABORTED`/`ETIMEDOUT`）→ 无响应（网络不可达）；统一 `new Error(...)` 契约
- [x] **Repository 层职责边界**：只做 URL + 参数 + 拆 `.data`，保证「类型签名 = 运行时值」（拒绝「拦截器里 `return response.data`」）
- [x] **axios `params` 机制**：自动序列化、自动忽略 `undefined`、自动 URL 编码；ES6 属性简写 `{ params }`
- [x] **开发期跨域方案**：Vite dev proxy `/api` → 后端（浏览器视角同源），等价生产 Nginx `proxy_pass`
- [x] **服务端分页契约**：`PageResult<T> = { list, total, page, size, totalPages }`，`offset = (page-1)*size`，`totalPages` 以后端为权威
- [x] **分页状态机 Hook**：page/size/keyword 驱动请求、黄金四态、`setPage` 边界校验、`setKeyword` 联动归 1、`reload` 自增刷新令牌
- [x] **请求竞态保护（`useRef` 序号法）**：`try` 与 `finally` 双处比对，`<StrictMode>` 双跑 effect 下验证有效
- [x] **`useEffect` 时序心智**：effect 在渲染提交后执行 → 首帧只能读到 state 初始值（挂载即请求的页面 `loading` 初值必须为 `true`）
- [x] **JSX 事件传参判据**：「括号即调用，引用才传递」——`onClick={fn(arg)}` / `onClick={fn}` / `onClick={() => fn(arg)}` 三态取舍
- [x] **调试日志生产治理**：`import.meta.env.DEV` 包裹，避免构建包输出请求细节；配置项抽常量化（`TOKEN_KEY`）
- [x] **JWT 与 Session 的差异认知**：无状态令牌 vs 服务端会话；`Authorization: Bearer` 需前端手动携带（拦截器职责）
- [x] **token 生命周期三件套**：存（`tokenStore` + `TOKEN_KEY` 单一来源）、带（请求拦截器自动注入）、判（路由守卫）
- [x] **全局登录态（Context）**：`createContext` / `useContext` / `useAuth()` 越界报错；解决 Prop Drilling（⇄ `SecurityContextHolder`）；**Provider 只能影响子树**（提供者不能自消费）
- [x] **登录态启动恢复与三态建模**：`initializing` 初值必须为 `true`（“未知”≠“未登录”），避免刷新页面踢掉已登录用户
- [x] **受保护路由守则**：`ProtectedRoute` 三态分流 + `<Navigate replace>`（防后退死循环）⇄ `OncePerRequestFilter`；**前端守卫≠安全边界**
- [x] **登出时序与契约诚实性**：`await logout()` 后才 `navigate`（否则跳转乒乓）；契约写 `Promise<void>` 而非 `void`
- [x] **登录表单交付**：受控表单 + `preventDefault` + `submitting` 防连点 + 后端中文错误直显 + 成功 `navigate(replace)`
- [x] **导航栏与登录态联动**：入口可见性（登录后才显示受保护入口）与路由可达性分离对齐
- [x] **React 19 事件类型现代化**：提交用 `React.SubmitEvent<HTMLFormElement>`（`FormEvent` 已弃用）；未启用的类型类型与实例元素类型参数化
- [x] **“双决策者/双写入者”陷阱总结**：`Authorization` 头、页码权威、登出导航、访问规则分层 —— 同一件决策必须有明确 owner

---

## 🔄 正在学习 (In Progress)

- [ ] **TS 基础与进阶**：
  - [ ] `interface` 属性定义（可选 `?`、只读 `readonly`）
  - [ ] `interface` 与 `type` 的区别与取舍
  - [ ] 联合类型 (`|`) 与 字面量类型
- [ ] **阶段 8 · TASK-009 进行中（全栈中后台综合收口）**：
  - [ ] 工程化目录升级：把 http 层 / auth 层从练习目录提升为 `src/api`、`src/auth`（真实工程位置）
  - [ ] 用户 CRUD 闭环：分页列表 + 搜索 → 新增 → 编辑 → 删除（含**末页被删空自动回退**）→ 详情
  - [ ] 角色鉴权：`GUEST` 不能删改（前端隐藏入口 + 后端 `ADMIN` 强制校验）
  - [ ] **全局 401 处理**：拦截器广播 → React 世界清 token 并跳登录（含回跳原页面）
  - [ ] 搜索防抖（debounce）+ `AbortController` 真正取消在途请求
  - [ ] 生产构建与部署：`npm run build` + `npm run preview`，Nginx 静态托管与 `location /api` 反代配置样例
  - [ ] 综合验收：全链路回归 + 终审 + 口试
- [ ] **阶段 8 · TASK-009（全栈综合项目收口）**：
  - [ ] 登录 → 分页列表 → 详情 → 增删 → 404 全链路串成中后台
  - [ ] 进阶项：删除后末页页码自动回退、搜索防抖、`AbortController` 真正取消在途请求
  - [ ] `npm run build` 生产构建 + Nginx 静态托管与反向代理部署

---

## ❓ 待攻克疑难点 (Backlog)

*（详细内容可在 `docx/questions/` 专属问答库中查看与演练）*

1. TypeScript 的结构类型系统（Structural Typing）与 Java 的名义类型系统（Nominal Typing）的思维切换（详见 `docx/questions/typescript.md` Q-TS-01）
2. React 为什么强调“不可变性”（Immutability），直接 `user.name = "Tom"` 会带来什么问题？（详见 `docx/questions/state-and-rendering.md` Q-SR-02）
3. `useState` 的异步更新心智模型与快照机制（详见 `docx/questions/state-and-rendering.md` Q-SR-01）
4. 为什么不能 `new FormData({...})`？TS 接口与 JS 原生对象构造函数有什么区别？（详见 `docx/questions/typescript.md` Q-TS-05）
5. 对象字面量中的 `[name]: value` 是什么意思？与 `name: value` 有何本质区别？（详见 `docx/questions/typescript.md` Q-TS-06）
6. 为什么 `useEffect` 的回调不能直接声明为 `async`？如何正确发起异步请求？（详见 `docx/questions/hooks.md` Q-HK-03）
7. 在 JSX 中如何优雅处理“空数据态 (Empty State)”？为什么 JSX 里不能直接写 `if-else`？（详见 `docx/questions/react-core.md` Q-RC-05）
8. 什么是 Props 和事件回调？父子组件通信的底层机制是什么？（详见 `docx/questions/react-core.md` Q-RC-06）
9. 为什么可以直接写 `onKeywordChange={setKeyword}`？它实际是一个函数吗？（详见 `docx/questions/react-core.md` Q-RC-07）
10. 为什么在 Props 接口中定义了属性，组件内依然报 TS2304？（详见 `docx/questions/react-core.md` Q-RC-08）
11. `NavLink`、`Routes` 与 `BrowserRouter` 是如何协同运转的？（详见 `docx/questions/api-and-router.md` Q-AR-03）
12. 动态路由 `:id` 与实际路径 `/users/3` 是如何对应解析的？底层匹配机制是什么？（详见 `docx/questions/api-and-router.md` Q-AR-04）
13. `Promise.reject()` 到底有什么用？为什么拦截器里必须用它而不能 `return error`？（详见 `docx/questions/api-and-router.md` Q-AR-07）
14. `async` 函数的返回值是怎么变成 Promise 的？为什么 `new Promise(value)` 会直接报错？（详见 `docx/questions/api-and-router.md` Q-AR-08）
15. `onClick={() => onPageChange(page + 1)}` 为什么不能写成 `onClick={onPageChange(page + 1)}`？（详见 `docx/questions/react-core.md` Q-RC-09）
16. 为什么 `loading` 初始值必须是 `true`？`useEffect` 与渲染提交的时序关系是什么？（详见 `docx/questions/hooks.md` Q-HK-06）
17. 分页场景下「页码」的权威来源到底是本地 state 还是后端返回的 `page`？（详见 `docx/questions/api-and-router.md` Q-AR-09）
18. `useEffect` 到底是什么？为什么它不是“生命周期钩子”而是“同步器”？（详见 `docx/questions/hooks.md` Q-HK-07）
19. `import { TOKEN_KEY }` 只是引用常量吗？为什么它会顺带执行被导入模块的顶层代码？（详见 `docx/questions/typescript.md` Q-TS-07）
20. axios 的 `{ params }` 与直接传的 `cmd`（请求体）有什么区别？为什么 `get` 和 `post` 的签名不同？（详见 `docx/questions/api-and-router.md` Q-AR-10）
21. JS 里的 `{ }` 到底有几种含义？为什么不能在对象字面量里写 `const`，Hook 为什么必须写在顶层？（详见 `docx/questions/typescript.md` Q-TS-08）
22. `React.FC<{ children: React.ReactNode }> = ({ children })` 这行声明如何拆解？`React.FC` 的本质是什么？（详见 `docx/questions/react-core.md` Q-RC-10）
23. `{ user, initializing, login, logout }` 为什么不写冒号也能用？`const value: AuthContextValue = ...` 的注解到底在检查什么？（详见 `docx/questions/typescript.md` Q-TS-09）
24. `<AuthContext.Provider value={value}>{children}</AuthContext.Provider>` 在干什么？为什么必须把 `children` 渲染出来？（详见 `docx/questions/react-core.md` Q-RC-11）
25. 表单提交/输入事件该用什么类型？`React.FormEvent` 为什么在 React 19 类型里被弃用（TS6385）？怎么自己查？（详见 `docx/questions/react-core.md` Q-RC-12）
26. `/login` 没用 `ProtectedRoute` 包裹，为什么登录后还是进不去？前端“两层拦截”分别在哪？（详见 `docx/questions/api-and-router.md` Q-AR-11）
27. `<AuthProvider>` 所在的组件（AuthApp）为什么不能自己用 `useAuth()`？作用域从哪里开始？（详见 `docx/questions/react-core.md` Q-RC-13）

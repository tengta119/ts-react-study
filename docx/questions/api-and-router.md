# 前后端交互与路由专题问答库 (docx/questions/api-and-router.md)

> 归档范围：React 与 Spring Boot RESTful API 对接、三态管理（Loading/Error/Data）、CORS 跨域、SPA 单页前端路由与传统服务端路由差异。

---

### Q-AR-01: 前端与 Spring Boot 联调时，标准的 API 请求状态该如何设计？
- **提问背景**：Java 后端开发习惯了返回 `Result<T>`，在前端刚开始只定义了一个数组 state 存数据，页面在网络慢或报错时容易白屏。
- **核心解答 (Answer)**：
  - 前端发起网络请求必须完备覆盖**三种黄金状态**：
    1. **加载中 (Loading)**：请求未返回时展示 Spin / 骨架屏；
    2. **错误 (Error)**：请求失败（网络断开或 4xx/5xx）时展示错误原因与“重试”按钮；
    3. **成功 (Data)**：拿到数据后正常渲染。
  - 在 TypeScript 中，应严谨定义与 Spring Boot 后端一致的 DTO 契约。
- **Java / 后端对照视角 (Java Mapping)**：
  - 后端 Controller 通常返回：
    ```java
    public class Result<T> {
        private Integer code;
        private String message;
        private T data;
    }
    ```
  - 前端 TypeScript 应严格映射：
    ```ts
    interface ApiResponse<T> {
      code: number;
      message: string;
      data: T;
    }
    ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-AR-02: 前端路由（React Router）与 Spring Boot 控制器路由到底有什么区别？
- **提问背景**：刚接触 React Router 时，以为前端路由切换也会向服务器发送一个页面请求。
- **核心解答 (Answer)**：
  - **传统后端路由**：每次点击链接，浏览器都会向服务端发送一次真实的 HTTP GET 请求。服务端重新渲染或返回一个新 HTML 页面，浏览器整页白屏刷新。
  - **SPA 前端路由**：整个应用只有一个 `index.html`。React Router 通过监听浏览器 HTML5 History API（`pushState` / `popstate`），在 URL 变化时**纯粹通过前端 JS 代码卸载旧组件、挂载新组件**。完全没有向服务器请求 HTML，实现零白屏平滑切换。
- **Java / 后端对照视角 (Java Mapping)**：
  - Spring Boot 的 `@GetMapping("/users")` 负责的是**远程数据或服务端的路由分发**；
  - React Router 的 `<Route path="/users" element={<UserList />} />` 负责的是**客户端浏览器本地的 UI 视图组件切换**。
- **掌握标记**：[ ] 待主动回忆

---

### Q-AR-03: `NavLink`、`Routes` 与 `BrowserRouter` 是如何协同运转的？
- **提问背景**：初学者直觉总结出“NavLink 负责更新 URL，Routes 负责根据当前 URL 更新页面”，需要进一步确认其底层协同机制。
- **核心解答 (Answer)**：
  - **这一理解 100% 正确且极为深刻！**
  - **三位核心角色的底层闭环流程**：
    1. **`<BrowserRouter>`（状态持有者 / 事件总线）**：包裹在最外层，利用 HTML5 History API 监听浏览器 URL 变化，并作为 Context 向下分发当前路由状态；
    2. **`<NavLink>` / `<Link>`（URL 写入者 / 事件发起方）**：用户点击时，拦截浏览器原生跳转（`e.preventDefault()`），调用 `history.pushState` **仅仅修改地址栏 URL**，并通知 Router 上下文；
    3. **`<Routes>`（视图分发者 / 消费者）**：感知到 URL 变更后，在内存中拿新路径去遍历内部的所有 `<Route>` 规则，找到最吻合的 `element`，卸载旧组件并挂载新组件；
    4. **`NavLink` 的专属特性**：除了更新 URL，它还会实时比对“当前 URL 是否与我的 `to` 吻合”，若吻合则注入 `{ isActive: true }`，供开发者动态添加高亮背景。
- **Java / 后端对照视角 (Java Mapping)**：
  - `<BrowserRouter>` 类似 Spring MVC 的 **`DispatcherServlet`**，统一维护全局请求上下文；
  - `<NavLink>` 类似客户端发起的 **HTTP Request 请求行**；
  - `<Routes>` + `<Route>` 类似 Spring MVC 的 **`HandlerMapping` 路由映射器**，根据路径寻址到对应的 Controller / View 执行挂载。
- **掌握标记**：[ ] 待主动回忆

---

### Q-AR-04: 动态路由 `:id` 与实际路径 `/users/3` 是如何对应解析的？底层匹配机制是什么？
- **提问背景**：路由配置为 `/users/:id`，跳转路径为 `/users/3`，详情页通过 `useParams()` 拿到了 `id = "3"`。初学者好奇底层是如何识别并对应起来的。
- **核心解答 (Answer)**：
  1. **路由模板编译为正则表达式**：
     - 当遇到冒号语法（如 `:id`、`:userId`）时，React Router 的路径解析器（类似 `path-to-regexp`）会把路由模板转换为一个**带命名捕获组的正则表达式**；
     - 例如 `/users/:id` 内部被编译为形如：`^\/users\/(?<id>[^\/]+)\/?$` 的正则模式。
  2. **URL 运行时匹配与变量提取**：
     - 当浏览器地址变为 `/users/3` 时，`<Routes>` 用编译好的正则去匹配该 URL；
     - 正则匹配成功后，自动从命名捕获组中把匹配到的子串（`"3"`）提取出来，与占位符变量名（`"id"`）组合为一个对象：`{ id: "3" }`。
  3. **Context 广播与 `useParams` 读取**：
     - React Router 将这个解析出的 params 对象存入路由上下文；
     - 在 `UserDetailPage` 组件中调用 `useParams<{ id: string }>()` 时，本质上就是从 Context 中解构读取该对象的属性。
- **Java / 后端对照视角 (Java Mapping)**：
  - 这与 **Spring MVC 的 `@PathVariable` 底层原理 100% 一致**！
  - Spring 的 `@GetMapping("/users/{userId}")` 使用 `AntPathMatcher` 或 `PathPatternParser`，将 `{userId}` 解析为提取占位符；
  - 客户端访问 `/users/3` 时，Spring 将第三段路径 `"3"` 绑定到方法入参 `@PathVariable("userId") Long userId`。
  - 区别仅在语法符号：**Spring 用花括号 `{userId}`，React Router 用冒号 `:id`**。
- **掌握标记**：[ ] 待主动回忆



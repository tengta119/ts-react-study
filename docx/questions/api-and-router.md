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

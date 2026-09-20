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

### Q-AR-05: axios 请求拦截器里如何统一注入 `Authorization: Bearer <token>`？为什么 `config.settoken()` 这种写法不报错却会崩？
- **提问背景**：在 `httpClient.ts` 的请求拦截器中，我先用 `const token: string = localStorage.getItem("token")` 取值，再想当然地写了 `config.settoken()` 去注入请求头，TS 编译期完全没报错，但一跑就抛 `config.settoken is not a function`。
- **核心解答 (Answer)**：
  - **现象与结论**：`config.headers` 不是普通对象字面量，而是 axios 的 `AxiosHeaders` **类实例**，必须用它的方法设置头：`config.headers.set('Authorization', \`Bearer ${token}\`)`。
  - **为什么 TS 拦不住拼错的 API 名**：`AxiosHeaders` 类型声明里有 `[key: string]: any` 索引签名，等于告诉 TS「任何属性名都合法」，于是 `config.settoken` 被推导为 `any` 并通过编译，错误被推迟到运行时。**索引签名会让拼写错误失去编译期保护**。
  - **为什么 axios 要封装成类而不是裸对象**：HTTP header 名「大小写不敏感」，且同名 header 可以多值（`string | string[]`）。`set()/get()/has()/delete()` 入口统一做归一化，这是「值对象封装不变式」的设计。
  - **`localStorage.getItem` 的可空陷阱**：DOM 类型定义为 `getItem(key: string): string | null`。手写 `const token: string = ...` 是把 `null` 硬塞进 `string`（类型撒谎）。正确做法是**不标注、让 TS 推导 `string | null`**，再用 `if (token)` 收窄；否则会发出 `Authorization: Bearer null` 这类非法头，导致后端莫名 401。
  - **为什么本项目的 TS 没报这个 null 错误**：`tsconfig.app.json` 当前未开启 `strict`（`strictNullChecks` 关闭后 `null` 可赋给任意类型），等于保险丝被拔掉了。
- **Java / 后端对照视角 (Java Mapping)**：
  - `localStorage.getItem()` ⇄ `map.get(key)`：**都返回可空值**，Java 里同样需要判 null（`Optional`/显式判空）；
  - `AxiosHeaders` ⇄ Spring 的 `HttpHeaders`：二者都不是裸 `HashMap`，都提供 `set/get/has` 并处理大小写不敏感；
  - `config.headers.set("Authorization", ...)` ⇄ `ClientHttpRequestInterceptor` 里 `request.getHeaders().set("Authorization", "Bearer " + token)`；
  - `[key: string]: any` 索引签名 ⇄ 反射 / `Map<String, Object>`：**都是「放弃编译期检查」**，字段名拼错只能等运行期炸。
- **极简代码示范 (Code Demo)**：
  ```ts
  // 建议把键名抽成常量，写入端(TASK-008 登录)与读取端必须一致
  export const TOKEN_KEY = 'token';

  httpClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY); // 推导为 string | null，不要硬写 : string
    if (token) {
      // ✅ 官方 API：set(name, value)    ❌ config.settoken() 不存在
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    console.log('[HTTP →]', config.method, config.url);
    return config; // 漏掉 return，请求会卡死
  });
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-AR-06: 响应拦截器的「成功分支」到底该做什么？为什么不能顺手 `return response.data`？
- **提问背景**：网上教程都在响应拦截器里 `return response.data` 来「顺便拆包」，这个写法看起来省事，但想知道为什么本项目禁用；同时也不清楚成功分支里到底该干什么。
- **核心解答 (Answer)**：
  - **为什么不能拆包**：axios 的 TS 类型承诺返回 `AxiosResponse<T>`，而运行时你却交出了 `T`。**类型签名与运行时值不一致（类型撒谎）**：调用方按类型写 `res.data`，实际会拿到 `undefined`，而且 TS 全程不报错。**契约被破坏时，编译器就成了哑巴。**
  - **正确职责划分**：拦截器只做「横向统一处理」（日志、埋点、业务状态码校验），**拆 `.data` 的职责下沉到 `userApi.ts`**，保证每一层的类型签名都与运行时一致。
  - **成功分支还有一个真实职责（双状态码体系）**：HTTP 状态码（2xx/4xx/5xx）只代表「通信层」结果；很多 Java 风格后端（`Result<T>{code, message, data}`）即使业务失败也返回 HTTP 200。此时必须在成功分支里做业务码判定并主动 reject，否则「失败」会被当成「成功」渲染。
  - **模板字符串插对象的坑**：`console.log(\`${response}\`)` 会触发 `Object.prototype.toString()`，只得到 `[object Object]`，信息全丢（与 `[object Promise]` 是同一族错误）。应改为多参数打印并读取真实字段：`console.log('[HTTP ←]', response.status, response.config.url, response.data)`。
- **Java / 后端对照视角 (Java Mapping)**：
  - `HTTP 状态码` 与 `业务状态码 code` 分层 ⇄ Spring 里 `ResponseEntity` 状态码 vs 统一返回体 `Result.code`；前端必须在拦截器里统一处理这两层，而不是散落各处；
  - `Objects.toString(obj)` / 未重写 toString 的 POJO ⇄ JS 的 `[object Object]`：Java 里 Lombok `@Data` 会生成可读 `toString()`，而 JS 的默认对象字符串化永远只有 `[object Object]`，因此**前端既要打印对象就不能用字符串插值**；
  - 拦截器的成功/失败分支 ⇄ `postHandle` / `@ExceptionHandler`。
- **极简代码示范 (Code Demo)**：
  ```ts
  httpClient.interceptors.response.use(
    (response) => {
      console.log('[HTTP ←]', response.status, response.config.method, response.config.url);
      // 若后端是 Result<T> 包裹（HTTP 200 + 业务码），在这里做业务码校验并 reject
      return response; // ⚠️ 必须返回完整 response，不能返回 response.data
    },
    (error) => Promise.reject(normalizeError(error))
  );
  ```
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

---

### Q-AR-08: `async` 函数的返回值是怎么变成 Promise 的？为什么 `new Promise(value)` 会直接报错？
- **提问背景**：已经写了 `async function` 并声明返回 `Promise<PageResult<ApiUser>>`，拿到的 `res.data` 已经是目标对象，于是顺手写了 `return new Promise<PageResult<ApiUser>>(users)` 想“包成 Promise”，结果运行时直接抛 `Promise resolver #<Object> is not a function`。
- **核心解答 (Answer)**：
  - **`new Promise(executor)` 要的是函数，不是值**：`executor` 签名为 `(resolve, reject) => void`，它在构造时被**立即调用**，用来告诉 Promise “什么时候算成功/失败”。传值进去会在构造阶段直接抛 TypeError。
  - **`async` 关键字本身就是包装器**：`async` 函数内 `return 值` 等价于 `return Promise.resolve(值)`；函数内 `throw 错误` 等价于 `return Promise.reject(错误)`。所以 `async` 函数体内**只需要普通 return**。
  - **真需要手动包装时**：用静态方法 `Promise.resolve(value)`；但它与 `new Promise((resolve) => resolve(value))` 一样，在 async 函数里都是多余的一层套娃。
  - **`new Promise` 的真正用武之地**：把**回调式 API 桥接成 Promise**（`setTimeout`、DOM 事件、`callback(err, data)` 风格的老库）。
- **Java / 后端对照视角 (Java Mapping)**：
  - Java 里声明了 `CompletableFuture<User>` 就必须显式包装：`return CompletableFuture.completedFuture(user);` —— **因为 Java 没有自动包装的语法糖**；
  - **JS 的 `async` 就是这层包装的语法糖**，所以 `return user` 就够了。Java 直觉在 Java 里正确，在 JS 里反而变成多余（甚至报错）；
  - 桥接回调：`new Promise((resolve, reject) => legacyApi(cb))` ⇄ 在 Java 里把 `Consumer<Result>` 式回调包成 `CompletableFuture.supplyAsync(...)`；
  - 反例对照：`new Promise((res) => res(x))` ⇄ `CompletableFuture.supplyAsync(() -> CompletableFuture.completedFuture(x))`——**两层套娃，纯多余**。
- **极简代码示范 (Code Demo)**：
  ```ts
  // ❌ 错：Promise 构造器的第一个参数必须是函数
  return new Promise<PageResult<ApiUser>>(users);

  // ✅ 对：async 会自动包装
  return res.data;

  // ✅ 无害但套娃
  return Promise.resolve(res.data);

  // ✅ new Promise 的正经用法：桥接回调式 API
  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-AR-09: 分页场景下「当前页码」的权威来源，到底是本地 state 还是后端返回的 `page`？
- **提问背景**：`PageResult` 里后端同时返回了 `list / total / page / size / totalPages`，但前端自己也有一份 `page` state，`result.page` 没被使用。两者会不会打架？
- **核心解答 (Answer)**：
  - **先明确责任分离**：`total / totalPages` 属于**服务端权威**（涉及全量 `COUNT(*)` 与并发写入，前端算不准，必须以后端为准）；而 `page / size / keyword` 是**查询意图**，由前端发起，**前端是权威**。
  - **`result.page` 的定位是“对账/回显”而非“指令”**：正常情况下它必定等于你请求的 `page`；若不相等，说明服务端做了修正（或你知道的越界被它默许了）。
  - **两者不一致的两个典型场景**：
    1. **删除末页最后一条**：你在第 3 页删完后总数只剩 2 页，本地 `page=3` 仍会发起请求 → 后端返回 `list=[]`、`totalPages=2`、`page=3` → 界面出现「第 3 / 2 页 + 空列表」；
    2. **代码里手动构造了越界页码**（如 `setPage(99)`、URL 直传 `?page=99`，绕过了前端按钮保护）。
  - **推荐策略（本任务采用）**：以本地 state 为唯一写入源，但做到两点：① `setPage` 做边界校验（`< 1` 或 `> totalPages` 直接忽略）；② 接收到响应后如发现 `page > result.totalPages` 且 `totalPages > 0`，**自动回退到最后一页**（这是删除场景的正确修复）。纯前端写 `result.page` 反向覆盖 state 反而容易造成跳页鬼影。
  - **通用原则**：**每一份数据只能有一个“写入者”**（单一数据源）。如果本地 state 与后端返回值都可能写页码，就会出现“谁先回来谁说话”的不确定性——这正是竞态类 Bug 的温床。
- **Java / 后端对照视角 (Java Mapping)**：
  - 像分布式事务里的“业务主键由谁生成”：一旦确定由 A 生成，B 只能引用而不能自行改；
  - 也像 `@Version` 乐观锁字段：服务端可以“修正/拒绝”，但最终的写入决策要集中在一处；
  - `totalPages` 由后端给出 ⇄ SQL 的 `COUNT(*)` 与 `LIMIT/OFFSET` 必须由同一个数据源计算，否则分页必然错位。
- **掌握标记**：[ ] 待主动回忆

---

### Q-AR-10: axios 的 `{ params }` 与直接传的 `cmd` 有什么区别？`params` 不也是个对象吗？
- **提问背景**：TASK-007 里写 `httpClient.get(url, { params })`，TASK-008 里写 `httpClient.post(url, cmd)`。两者都是“传个对象”，看起来差不多，很像是同一个东西的两种写法。
- **核心解答 (Answer)**：
  - **它们不在同一层级**：
    - `{ params }` 是**配置对象（config）里的一个字段名**（ES6 简写，等价于 `{ params: params }`）——它描述的是“**把这份数据拼到 URL 的问号后面**”；
    - `cmd` 是**请求体（data / body）本身**——它描述的是“**这份数据放在 HTTP 报文的主体里**”。
  - **根本原因：axios 的方法签名不对称，而这来自 HTTP 协议本身的不对称**：
    ```ts
    httpClient.get(url, config)              // GET 没有语义上的 body → 第二个参数就是 config
    httpClient.delete(url, config)
    httpClient.post(url, data, config)       // POST/PUT/PATCH 有 body → data 占第二个位置，config 退到第三个
    httpClient.put(url, data, config)
    ```
    所以 `get` 的第二个参数位与 `post` 的第二个参数位**根本不是同一个东西**。
  - **四种写法对比（请记住这四个“对/错”）**：
    ```ts
    httpClient.get('/users/page', { params });      // ✅ query：?page=1&size=5
    httpClient.post('/auth/login', cmd);            // ✅ body：JSON 请求体
    httpClient.post('/auth/login', { params: cmd }); // ❌ 变成 ?username=...&password=...，请求体为空 → 后端报“缺少字段”
    httpClient.get('/users', cmd);                  // ❌ GET 没有 data 位置，cmd 会被当成 config → 参数丢失
    ```
  - **五个可观测差异**：
    | 维度 | `params`（查询参数） | body（请求体） |
    | :--- | :--- | :--- |
    | 在 HTTP 报文里的位置 | 请求行 URL 的 `?` 后面 | 报文主体（body） |
    | axios 序列化方式 | 扁平成 `k=v&k2=v2`（`undefined` 自动忽略、自动 URL 编码）| 默认 `JSON.stringify`（配合 `Content-Type: application/json`）|
    | 后端接收方式 | `@RequestParam` / FastAPI `Query(...)` | `@RequestBody` / FastAPI 的 Pydantic 模型参数 |
    | 能携带嵌套结构吗 | ❌ 只能扁平键值 | ✅ 任意层级嵌套 JSON |
    | 长度与安全 | 有长度限制；**会进浏览器历史、服务器访问日志、Referer** | 无长度限制；不进 URL 日志 |
  - **实战排查技巧**：打开浏览器 Network 面板 → 点开请求 → 看 **Query String Parameters**（params）与 **Request Payload / Payload**（body）两个分组到底哪个有数据。传错位置时一眼可辨。
  - **安全红线**：**密码、token 绝不能放 query**（会写进 URL → 服务器日志 / 浏览器历史 / Referer 泄霞）。这就是登录必须用 `POST` + body 的原因。
  - **同一请求可以两者都有**：`httpClient.post('/users', body, { params: { dryRun: true } })` —— body 装数据，query 装开关/标记（如 `?delay=1.5` 这类调试参数就是典型的 query 用法）。
- **Java / 后端对照视角 (Java Mapping)**：
  | axios | Spring Boot |
  | :--- | :--- |
  | `{ params }` | `UriComponentsBuilder.queryParam("page", 1)` / Feign 的 `@RequestParam` |
  | `cmd`（body）| `@RequestBody LoginCommand cmd` / `RestTemplate.postForObject(url, body, ...)` |
  | `config`（timeout / headers / signal）| Apache HttpClient 的 `RequestConfig`、OkHttp 的 per-call options |
  - 一个关键提醒：Java 里这两个东西的命名完全不同（`@RequestParam` vs `@RequestBody`），语义差异一目了然；而 JS 里两者都是“一个对象字面量”，长得几乎一样 —— **语法上的相似掩盖了协议语义上的不同**，这也是为什么这里必须靠人为记忆与工具（Network 面板）兵底。
- **极简代码示范 (Code Demo)**：
  ```ts
  // TASK-007：查询参数（分页）—— 对应 Java @RequestParam
  const res = await httpClient.get<PageResult<ApiUser>>('/users/page', { params });

  // TASK-008：请求体（登录）—— 对应 Java @RequestBody，必顶 POST
  const login = await httpClient.post<LoginResult>('/auth/login', cmd);

  // 进阶：config 里可以同时带多个字段（params / timeout / signal 各司其职）
  httpClient.get('/users/page', { params, timeout: 3000, signal: controller.signal });
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-AR-07: `Promise.reject()` 到底有什么用？为什么拦截器里必须用它而不能 `return error`？
- **提问背景**：在写 axios 响应拦截器的失败分支时，被要求必须 `return Promise.reject(new Error(...))`，感觉“直接抛错或直接把错误对象还回去”不就完了吗？
- **核心解答 (Answer)**：
  - **本质**：`Promise.reject(reason)` 是一个**静态工厂方法**，它**立即**创建一个已经处于「已拒绝（rejected）」状态的 Promise（状态已结算，不可再变）。对应 `new Promise((_, reject) => reject(reason))` 的缩写。
  - **三大用途**：
    1. **在一个非 async 函数里“抛出异步错误”**：等价于 async 函数里的 `throw`（async 函数里 throw 的返回值就是一个 rejected Promise）；
    2. **在 `catch` / `onRejected` 回调里把错误“继续往下传”**：因为 onRejected 的**返回值会成为下一个 Promise 的“成功值”**（错误被“治愈”），只有**返回 rejected Promise 或 throw** 才能让下游继续走失败分支；
    3. **提前短路**：参数校验、鉴权判断失败时，不能返回一个“成功的空值”，必须返回失败的 Promise，否则调用方以为成功了。
  - **类型机制（为什么编译器不报错）**：TS 中 `Promise.reject<T = never>(reason?: any): Promise<T>`，默认推导为 `Promise<never>`。`never` 是 bottom type，可赋值给任何类型，所以在 `Promise<PageResult<ApiUser>>` 签名里 `return Promise.reject(new Error('x'))` 完全合法。
  - **与 Java `CompletableFuture` 完全同构**：`Promise.reject(e)` ⇄ **`CompletableFuture.failedFuture(e)`（Java 9+）**；`.catch(e => ...)` ⇄ `exceptionally(...)` / `handle(...)`。更可怕的是两边**连坑都一样**：未处理的 rejected Promise ⇄ 无人 `join()/get()` 的异常 CompletableFuture，**异常会被默默吞掉**。Java 里未捕获异常会终止线程并打堆栈，而 JS 里只会在控制台留下一行 `Uncaught (in promise)` 红字，**脚本照常跑**——这种“半失败”状态是线上诡异 Bug 的温床。
  - **`reject` 不做类型校验**：reason 可以是字符串、对象、null（无参时是 `undefined`）。Java 里 `throw` 必须是 `Throwable`，JS 里完全不管，所以下游 `err instanceof Error ? err.message : '未知'` 会直接失效——**拒绝理由的类型必须靠人自觉统一为 `Error`**。
- **极简代码示范 (Code Demo)**：
  ```ts
  // 1) 非法入参提前短路（类比 Java 的参数校验失败直接抛异常）
  function findUser(id: number): Promise<User> {
    if (!id) return Promise.reject(new Error('id 不能为空'));
    return httpClient.get<User>(`/users/${id}`).then((res) => res.data);
  }

  // 2) 错误“继续往下传” vs 错误“被治愈”
  fetchData()
    .catch((err) => Promise.reject(new Error(`归一化失败: ${err.message}`))) // ✅ 链继续失败
    .catch((err) => '兜底数据'); // ✅ 返回普通值 = 把失败“治愈”成成功
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-AR-11: `/login` 没有用 `ProtectedRoute` 包裹，为什么登录后还是进不去？
- **提问背景**：路由表里 `<Route path="/login" element={<LoginPage />} />` 是裸的（没有任何守卫），但登录成功后再访问 `/login`，地址栏会立刻跳回 `/profile`，看起来“像被守卫拦了”。
- **核心解答 (Answer)**：
  - **前端有“两层”拦截机制，它们彼此独立**：
    | 层次 | 实现位置 | 作用范围 | 本任务例子 |
    | :--- | :--- | :--- | :--- |
    | **① 路由级守卫** | 路由表的 `element` 外面包一层组件 | 该 path 下**所有**页面 | `<ProtectedRoute><ProfilePage /></ProtectedRoute>` |
    | **② 组件级自我守卫** | 页面组件内部提前 `return <Navigate …/>` | 仅这一个组件 | `LoginPage.tsx` 里的 `if (user !== null) return <Navigate to="/profile" replace />` |
  - **本例命中的是第 ② 种**：`/login` 路径确实没有任何守卫拦截（`ProtectedRoute` 不参与），但 `LoginPage` 自己发现“已经登录了”，于是主动把人送回 `/profile`。
    > 排查方法：全局搜索重定向决策点 —— `grep -n "Navigate\|navigate(" src/exercises/TASK-008-auth-guard`。本次输出里 `LoginPage.tsx:38` 就是肇事者。
  - **`<Navigate>` 的语义**：它是**声明式重定向组件**——你并不是“手动调了一次跳转”，而是“在渲染结果里声明：本次渲染应当导航到 X”。它在挂载/渲染时执行导航；配 `replace` 就是**替换**当前历史条目而不是压栈。
  - **两种机制各自的价值**：
    - 路由级守卫：**规则集中**易审查（整个路由表一眼看完哪些路径要登录），适合“批量保护”；
    - 组件级守卫：适合**只与该组件强相关**的条件（如“已登录就不该看登录页”），但规则散落在组件里，**多个地方同时决定导航时很难排查**。
  - **排查“到底是谁把我重定向了”的三步法**：
    1. **静态搜**：列出全部 `Navigate` / `navigate(` 调用点（决策点总量通常很小）；
    2. **动态判**：在可疑组件顶部临时 `console.log('render LoginPage', user)`：若它根本没打印，说明是路由级拦截；若打印了又立刻跳走，就是组件内部重定向；
    3. **React DevTools**：看组件树里到底挂载了哪个页面组件（路由未匹配时根本不会挂载）。
       ⚠️ Network 面板与浏览历史都看不出“是谁跳的”——**它们只记录结果，不记录决策者**。
  - **工程建议（更一致的写法）**：把“未登录才能进”的表达也搬到路由表，用一个反向守卫：
    ```tsx
    <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
    ```
    让**访问规则集中在路由表**，而不是一部分在路由表、一部分藏在页面里。
  - **业务取舍**：若产品要求“已登录也能进登录页用于切换账号”，就把这个重定向去掉，改为在登录页提供“切换账号”按钮（先 `logout()` 再展示表单）——**规则要可选，但必须是有意识的决定**，不能因为“不知道哪里跳的”而留着一个黑盒行为。
  - 📌 这是本任务“**导航决策必须有单一 owner**”主题的第 4 次出现（前三次：`Authorization` 头双写入、页码双权威、登出后双导航）。
- **Java / 后端对照视角 (Java Mapping)**：
  | 前端 | Spring Security / MVC |
  | :--- | :--- |
  | 路由表 + `ProtectedRoute` / `PublicOnlyRoute` | `SecurityFilterChain` 里的 `authorizeHttpRequests()` 集中配置（`permitAll()` / `authenticated()`）|
  | 页面组件内部 `if (user) return <Navigate/>` | 在 Controller 方法里手写 `if (!hasRole("ADMIN")) return redirect(...)` / `@PreAuthorize` |
  - 两种方式都能用，但**集中配置的优势在于“一眼能审出全局策略”**；散在方法里的条件越多，越容易出现“某个接口忘记加校验”。
- **极简代码示范 (Code Demo)**：
  ```tsx
  // ① 路由级：保护“需要登录”的页面
  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

  // ② 路由级（反向）：保护“仅未登录可见”的页面（把 LoginPage 里的判断搬出来）
  function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
    const { user, initializing } = useAuth();
    if (initializing) return <div>正在校验登录态…</div>;
    return user === null ? <>{children}</> : <Navigate to="/profile" replace />;
  }
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-AR-12: axios 的 PUT 与 DELETE 该怎么调用？它们和 GET/POST 的签名差异在哪？为什么删除函数的返回类型是 `Promise<void>`？
- **提问背景**：TASK-008 的 `authApi.ts` 只写过 `get` / `post` 两个方法；TASK-009 TODO ① 要写 PUT（编辑）与 DELETE（删除）时不知道“参数放第几个位置、泛型写在哪、返回值该 return 什么”，尤其是删除函数被要求声明为 `Promise<void>`，感觉和前面的 GET/POST 完全不是一套写法。
- **核心解答 (Answer)**：
  - **现象**：PUT/DELETE 看起来“没有范例可抄”，是因为 TASK-008 恰好没用到它们；但 axios 的方法家族其实只有**一条签名规则**，记住它就够用：
    ```ts
    httpClient.get<T>(url, config?)                        // 无 body
    httpClient.delete<T>(url, config?)                     // 无 body（⚠️ 第二个位置是 config，不是 data！）
    httpClient.post<T>(url, data?, config?)                // 有 body
    httpClient.put<T>(url, data?, config?)                 // 有 body（整量替换）
    httpClient.patch<T>(url, data?, config?)               // 有 body（局部更新）
    ```
  - **根本原因（来自 HTTP 协议本身的不对称）**：GET/DELETE 在语义上没有请求体（DELETE 按 RFC 可以带，但 axios 不提供那个位置），所以第二个参数直接就是 config；POST/PUT/PATCH 有请求体，于是 data 占住第二个位置、config 被挤到第三个。这也解释了 TASK-007 的 `get(url, { params })` 与 TASK-008 的 `post(url, cmd)` 为什么长得像却不是一回事（见 Q-AR-10）。
  - **三个参数位置必须分清（这是最容易混的地方）**：
    | 位置 | 承载什么 | 本任务例子 | 后端接收方式 |
    | :--- | :--- | :--- | :--- |
    | **URL 路径**（模板字符串拼出来）| 资源**身份**（哪一个资源）| `/admin/users/${id}` | `@PathVariable` / FastAPI `{user_id}` |
    | **config.params** | 过滤/分页/翻页**条件** | `{ page, size, keyword }` | `@RequestParam` / FastAPI `Query(...)` |
    | **data（body）** | 要写入的**载荷** | `UpdateUserCommand` | `@RequestBody` / Pydantic 模型参数 |
    > ⚠️ 路径参数**不是 axios 的能力**，它是纯字符串拼接（模板字符串）：axios 收到的已经是一根完整的 URL。这也意味着 **`id` 不会被自动编码**——数字 id 无所谓，若是用户输入的字符串（如用户名）必须自己 `encodeURIComponent`。
  - **DELETE 为什么是 `Promise<void>`**：后端删除成功通常只回一个“确认信息”（`204 No Content`，或本项目的 `{"success": true}`），**没有任何前端需要的业务数据**。类型是契约的一部分，诚实声明“这次调用没有产出”比硬塞一个假对象更有价值。具体写法就是 **`await` 一下、不 return 任何东西**：
    ```ts
    await httpClient.delete<void>(`/admin/users/${id}`);   // ✅ 只关心“成功/失败”
    ```
    反面写法：`const res = await httpClient.delete(...); return res.data;`（语法合法但语义荒谬——把一个 `void` 传来传去，调用方拿到 `undefined`，还容易诱使下游写 `res.data.id` 这种必然崩的代码）。
  - **需要删除后的“回执数据”怎么办**：那就不该返回 void。例如后端若返回被删除对象的 id 或剩余条数，就把它写进泛型：`httpClient.delete<{ id: number }>(url)`，让**类型签名如实反映运行时的值**（这就是 TASK-007 学过的“Repository 层职责边界”：签名 = 运行时值）。
  - **PUT 的泛型怎么写**：`httpClient.put<ApiUser>(url, cmd)` —— 泛型描述的是 **`res.data` 的类型**（后端回给你的**最新实体**），而**不是**入参类型（入参类型由 `cmd` 变量的类型自己保证）。所以一个 PUT 里往往有两个类型：入参用 `UpdateUserCommand`，响应泛型用 `ApiUser`。
  - **PUT vs PATCH 的语义差异**（后端契约决定前端用哪个）：PUT = **整量替换**（没传的字段会被重置成默认值，本项目 `UpdateUserCommand` 的 `phone` 就有默认值 `未登记`），PATCH = 局部更新（只改传了的字段）。**选错方法的典型后果**：只想改邮箱却用 PUT 且漏传 phone → 手机号被清空。这不是前端小 bug，而是**数据损坏**。
  - **四个方法的幂等性（面试高频）**：GET/PUT/DELETE 幂等（同样的请求打 N 次，服务端状态相同），POST 不幂等（打 N 次可能建 N 条）。这正是 REST 把“新增”和“编辑”分成不同方法的原因。
- **Java / 后端对照视角 (Java Mapping)**：
  | axios | Spring Boot | 备注 |
  | :--- | :--- | :--- |
  | `put<T>(url, body)` | `@PutMapping` + `@RequestBody` | 对应 `RestTemplate.put(url, body)`（**无返回值**）或 `exchange(...)`（要拿响应体时用）|
  | `delete<T>(url)` | `@DeleteMapping("/{id}")` + `@PathVariable` | 对应 `restTemplate.delete(url)` |
  | `get<T>(url, { params })` | `@GetMapping` + `@RequestParam` | 查询条件 |
  | `post<T>(url, body)` | `@PostMapping` + `@RequestBody` | 新增（非幂等）|
  - 一个很能体现差异的细节：Java 的 `RestTemplate.put` / `delete` **返回值就是 `void`**——这与前端把删除函数声明成 `Promise<void>` 是同一个设计直觉：**“没有产出”本身就应该被类型如实表达**。若在 Java 里写了 `UserVO vo = restTemplate.put(...)` 编译根本不通过，前端若能守住“签名 = 运行时值”，也不会掉进 `res.data.id` 的坑。
  - 权限语义上还有一处强对应：PUT/DELETE 这类**写操作**在后端需要 `hasRole('ADMIN')` 才能放行（本项目 `_require_admin` 先判 401 再判 403），而前端隐藏按钮只是体验层——**前后端的职责分层不能因为“按钮看不见”而被混淆**。
- **极简代码示范 (Code Demo)**：
  ```ts
  // ① 查询：条件走 params，无 body
  const page = await httpClient.get<PageResult<ApiUser>>('/admin/users/page', { params });

  // ② 新增：body 走第二个位置
  const created = await httpClient.post<ApiUser>('/admin/users', cmd);

  // ③ 编辑：路径参数标识资源 + body 承载整量更新（两个类型：入参 / 响应）
  const updated = await httpClient.put<ApiUser>(`/admin/users/${id}`, cmd);

  // ④ 删除：只有一个资源标识，第二个位置没有 body；用 await 表达“只关心成败”
  await httpClient.delete<void>(`/admin/users/${id}`);

  // ⑤ 进阶：删除但仍要带 config（如自定义超时 / 取消信号）时，第二个位置就是 config
  await httpClient.delete(`/admin/users/${id}`, { timeout: 3000, signal });
  ```
  > 验证顺序建议：先只写 GET 分页（能登录后在 Network 面板看到请求带上 `Authorization` 头），再写 DELETE（用 `guest` 账号实测 **403**、用 admin 实测成功），最后写 PUT。**一次只加一个方法、每加一个就先点一遍界面**，比一次性写完四个再一起排错快得多。
- **掌握标记**：[ ] 待主动回忆

---

### Q-AR-13: 前端 camelCase 与后端 snake_case 字段不一致时会怎样？为什么两边都“成功”却丢了数据？
- **提问背景**：TASK-009 的表单里字段叫 `companyName`（前端 camelCase），而后端 Pydantic 模型叫 `company_name`（Python snake_case）。写映射时疑惑：“直接把 `companyName` 发过去不行吗？名字不一样又不会报错。”
- **核心解答 (Answer)**：
  - **现象（后端实测，两次请求都是 201 成功）**：
    | 发送的字段 | HTTP | 返回的 `company.name` | 结论 |
    | :--- | :---: | :--- | :--- |
    | `"companyName":"CORP-X"` | **201** | `"研发中心"`（服务端默认值）| ❌ **字段被静默丢弃** |
    | `"company_name":"CORP-Y"` | **201** | `"CORP-Y"` | ✅ 生效 |
  - **根本原因：反序列化器默认“宽容”**
    - **Pydantic v2**：默认行为是 `extra='ignore'` —— 请求体里多出来的未知字段**不报错、不提示、直接丢**；
    - **Spring Boot + Jackson**：默认 `FAIL_ON_UNKNOWN_PROPERTIES=false` —— 同样静默忽略。
    - 两者都是“容错优先”的工程选择（为了 API 向后兼容），代价是：**字段名写错时你收不到任何信号**。
  - **为什么这是最难查的一类 Bug**：
    1. **状态码是成功的**（201/200）→ 你第一反应不会怀疑字段名；
    2. **前后端都不报错** → 浏览器 Network 面板里 payload 看着“有值”，后端日志里也“正常”；
    3. **只有界面看不出来**（用户填的公司名总是空）→ 排查方向很容易跑偏到“前端没绑定”或“后端默认值覆盖了”。
  - **诊断三步**（按顺序，成本从低到高）：
    1. **看返回体**：POST 成功后 API 返回的**就是入库后的实体** —— 直接比对“我发的值”和“它回的值”是否一致（本例里 `研发中心` vs `CORP-X` 一眼可辨）；
    2. **看 Swagger 模型**（`http://127.0.0.1:8000/docs`）：以后端定义的字段名为唯一真相；
    3. **后端加严**（治本）：`model_config = ConfigDict(extra='forbid')` / Jackson 开启 `FAIL_ON_UNKNOWN_PROPERTIES` —— 让“多余字段”在**开发阶段直接报 422**，而不是上线后静默丢数据。
  - **架构层面的出路（三种，按场景选）**：
    | 方案 | 做法 | 评价 |
    | :--- | :--- | :--- |
    | ① 前端做映射（本项目采用）| 表单状态（camelCase）→ 请求体（snake_case）显式转换 | ✅ 把适配集中在 Repository / 映射函数一处；前端内部保持 camelCase |
    | ② 后端配置别名 | Pydantic `Field(alias='companyName')` / Jackson `@JsonProperty` | 可行，但要让**所有**接口风格统一，否则前后端各记一套规则 |
    | ③ 全链路统一风格 | 团队约定接口字段全用 camelCase（前端原生风格）| ✅ 最彻底，但属于**契约制定**层面，不是前端单方面能决定的 |
  - **一个强相关的纪律**：字段名映射必须在**一层**完成（本项目放在 `toCreateCommand` / `toUpdateCommand` 里），
    绝不能在组件的每个提交处写一下 —— 否则就变成“多处各自拼接”，漏一处就静默丢一个字段。
- **Java / 后端对照视角 (Java Mapping)**：
  | TS / 前端 | Java / 后端 |
  | :--- | :--- |
  | `UserFormState`（camelCase）| Controller 层的 Form / Command DTO |
  | `company_name`（snake_case）| Entity / Pydantic 模型字段 |
  | 映射函数 `toCreateCommand()` | `BeanUtils.copyProperties()` / MapStruct 的 `@Mapper` / 手写 Converter |
  | Pydantic `extra='ignore'` | Jackson `FAIL_ON_UNKNOWN_PROPERTIES=false`（默认）|
  | Pydantic `extra='forbid'` | Jackson `FAIL_ON_UNKNOWN_PROPERTIES=true` |
  - 关键认知：**“字段名不同”在前端只是一个字符串，在跨语言联调中却是契约的一部分**；
    Java 里两个类字段不同名是**编译错误**（编译期就能拦），而跨 HTTP 边界之后，**没有任何编译器在看着你** —— 只能靠显式映射 + “看返回体”的习惯来兜底。
- **极简代码示范 (Code Demo)**：
  ```ts
  // ✅ 映射只在一处发生：表单状态（前端风格）→ 请求体（后端风格）
  function toCreateCommand(form: UserFormState): CreateUserCommand {
    return {
      name: form.name.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || '未登记',
      company_name: form.companyName.trim() || undefined,  // ← camelCase → snake_case
    };
  }

  // ❌ 反面：直接展开表单状态（companyName 会被服务端静默丢弃）
  await createAdminUser({ ...form } as unknown as CreateUserCommand);
  ```
  > 调试口诀：**“提交成功不等于保存成功 —— 对比你发出去的值和它回给你的值。”**
- **掌握标记**：[ ] 待主动回忆



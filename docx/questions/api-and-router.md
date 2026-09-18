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



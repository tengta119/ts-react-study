# 避坑实录与错题本 (mistakes.md)

> **使用原则**：
> 凡是在编码或 Review 中被教练指出的典型错误，按此格式记录。
> 尤其是**因为 Java 后端开发惯性思维导致的错误**，务必重点剖析底层根因！

---

## 📝 记录模板

```markdown
### [YYYY-MM-DD] 错误简述
- **错误现象**：代码怎么写的，报了什么错或者表现不符合什么预期？
- **Java 思维惯性**：在 Java 里为什么我们会这么做？为什么在前端/React 里行不通？
- **底层根因**：React 渲染调度 / TS 类型抹除 / JavaScript 引用机制是怎样的？
- **正确做法**：正确的代码设计与写法范式
- **避坑口诀**：一句简短好记的警示
```

---

## 📌 典型踩坑实录

### 示例 001：直接原地修改 State 或 Props 属性
- **错误现象**：
  ```tsx
  // 错误示范
  const [user, setUser] = useState({ name: 'Alice', age: 20 })
  user.age = 21 // 直接修改原对象
  setUser(user) // React 根本不重新渲染 UI！
  ```
- **Java 思维惯性**：
  在 Java Spring 后端中，修改 POJO/Entity 属性通常是 `user.setAge(21)`，对象还是同一个引用，最后保存到数据库即可。
- **底层根因**：
  React 判断是否需要重新渲染是采用浅比较（`Object.is(oldState, newState)`）。如果传递的是同一个对象内存引用，React 判定“没有变化”，直接跳过重渲染！
- **正确做法**：
  必须创建新的对象浅拷贝（不可变数据原则）：
  ```tsx
  setUser({ ...user, age: 21 })
  ```
- **避坑口诀**：
  **“React 状态不可变，修改必须换新脸（创建新对象）。”**

---

### [2026-09-17] JS 假值（Falsy）短路求值导致合法数字 0 被意外吞掉
- **错误现象**：
  ```tsx
  onChange={(e) => setStep(Number(e.target.value) || 1)}
  ```
  在输入框中输入 `0` 时，输入框强制变回 `1`，无法输入 0，导致业务无法接收 `<= 0` 的步长输入并触发边界告警。
- **Java 思维惯性**：
  在 Java 中，逻辑或 `||` 只能操作 `boolean`。在后端做默认值回退时，通常使用 `val != null ? val : 1` 或 `Optional.ofNullable(val).orElse(1)`，只有为 `null` 时才兜底，`0` 依然是有效合法整数。但在 JS 中很多初学者习惯性用 `a || b` 偷懒做默认值。
- **底层根因**：
  JavaScript 中存在隐式类型转换（Type Coercion），数字 `0`、空字符串 `""`、`NaN`、`null`、`undefined` 都是假值（Falsy）。当 `Number(e.target.value)` 得到 `0` 时，`0 || 1` 直接被短路判定为假，回退到 `1`。
- **正确做法**：
  应精确判断是否为 `NaN`，或者使用 ES2020 的空值合并运算符 `??`（Nullish Coalescing），或直接保留转换值，在派生逻辑中统一校验边界：
  ```tsx
  const nextVal = Number(e.target.value);
  setStep(Number.isNaN(nextVal) ? 0 : nextVal);
  ```
- **避坑口诀**：
  **“数值兜底莫用 `||`，数字为 0 变假值；非空合并用 `??`，或者显式判 NaN。”**

---

### [2026-09-17] 试图使用 `new` 实例化 TS 接口并与原生 `FormData` 命名冲突
- **错误现象**：
  ```tsx
  // 错误示范：误用 new 实例化 TS 接口
  setFormData(new FormData({
    username: '',
    email: '',
    role: 'DEVELOPER',
    agree: false,
  }));
  ```
  TypeScript 报类型不兼容错误，且运行时意外调用了浏览器自带的原生 `window.FormData` 构造函数，导致无法正确初始化状态。
- **Java 思维惯性**：
  在 Java 面向对象体系中，实例化数据载体对象（POJO / DTO）必须依赖构造器（如 `new UserDTO(...)`）。Java 开发者看到顶部定义的 `interface FormData`，下意识将其视作具体的类，习惯性使用 `new` 构造实例。
- **底层根因**：
  1. **TS 接口编译期彻底擦除 (Type Erasure)**：`interface` 仅在开发与编译阶段提供静态契约检查，生成 JS 运行时后彻底消失。它根本不是一个 Class，在语法上绝不可被 `new`。
  2. **浏览器原生 API 全局命名冲突**：浏览器宿主环境的全局对象上自带 `window.FormData`（专门用于封装 `multipart/form-data` 网络请求或文件上传）。写 `new FormData(...)` 会直接调用浏览器的原生类，而该构造函数不接受普通 JS 数据对象。
- **正确做法**：
  在 TypeScript / JavaScript 中创建纯数据实体，直接使用**对象字面量（Object Literal）`{}`**，依靠结构化子类型（鸭子类型）自动满足接口约束；日常开发中建议契约命名为 `UserFormData` 或 `RegisterFormDto` 避免与浏览器全局 API 重名：
  ```tsx
  // ✅ 正确做法：直接使用对象字面量
  setFormData({
    username: '',
    email: '',
    role: 'DEVELOPER',
    agree: false,
  });
  ```
- **避坑口诀**：
  **“TS 接口擦除不能 new，对象字面量 `{}` 显神威；DTO 莫起全局名，避免撞车 FormData。”**

---

### [2026-09-17] 误将异步流方法 `res.text()` 当作同步方法导致 `[object Promise]`
- **错误现象**：
  ```typescript
  if (!res.ok) {
    // 错误示范：未加 await 直接将方法调用塞入模板字符串
    throw new Error(`HTTP 错误: 状态码 ${res.status}, 错误信息 ${res.text()}`);
  }
  ```
  界面报错展示为：`HTTP 错误: 状态码 500, 错误信息 [object Promise]`，后端的具体错误消息完全丢失。
- **Java 思维惯性**：
  在 Java 后端开发中（如 OkHttp 或 Spring RestTemplate），调用响应体的提取方法（如 `response.body().string()`）是**同步阻塞**的，直接返回 `String`。Java 开发者下意识认为 `res.text()` 也是普通同步方法，直接插值使用。
- **底层根因**：
  浏览器的 Fetch API 响应体底层是**异步可读流（ReadableStream）**。
  `res.text()`、`res.json()`、`res.blob()` 全部都是**异步方法，返回值是 `Promise<T>`**。如果未加 `await`，拿到的仅仅是一个未决议的 Promise 对象。当 Promise 对象在模板字符串 `${...}` 中被隐式转为字符串时，会调用 `Promise.prototype.toString()`，得到固定的 `"[object Promise]"`。
- **正确做法**：
  必须使用 `await` 异步等待流读取完成，再抛出或使用其内容：
  ```typescript
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP 错误: 状态码 ${res.status}, 错误信息 ${errorText}`);
  }
  ```
- **避坑口诀**：
  **“Fetch 响应皆为流，读流必加 await 头；莫学 Java 同步取，否则吐出 Promise 愁。”**

---

### [2026-09-17] Props 接口声明了属性但组件形参解构漏写导致 TS2304
- **错误现象**：
  ```tsx
  // 接口中声明了 onDelete
  export interface UserCardProps {
    user: ApiUser;
    onDelete: (id: number) => void;
  }
  // 形参解构中只解构了 user，漏掉了 onDelete
  export const UserCard: React.FC<UserCardProps> = ({ user }) => {
    return <button onClick={() => onDelete(user.id)}>删除</button>; // 报错 TS2304!
  };
  ```
  TypeScript 报错：`TS2304: Cannot find name 'onDelete'`。
- **Java 思维惯性**：
  在 Java 中如果一个方法的入参是一个对象（如 `public void render(Props props)`），开发者下意识以为只要接口或类定义了字段，方法内部就可以直接使用，混淆了“类型属性定义”与“当前函数作用域内的局部变量”。
- **底层根因**：
  组件入参的 `{ user }` 是 ES6 的对象解构赋值（Destructuring Assignment）。它并不是泛化的参数接收，而是从传入的 `props` 对象中只提取 `user` 并赋值给同名局部变量。如果花括号里没写 `onDelete`，当前函数体内就根本不存在名为 `onDelete` 的局部变量。
- **正确做法**：
  在函数形参解构中显式补齐所有要使用的属性：
  ```tsx
  export const UserCard: React.FC<UserCardProps> = ({ user, onDelete }) => {
    return <button onClick={() => onDelete(user.id)}>删除</button>;
  };
  ```
- **避坑口诀**：
  **“Props 契约是图纸，形参解构是施工；花括号里漏写名，变量未定报 TS2304。”**

---

### [2026-09-17] `Promise.reject('中文提示')`：拒绝字符串而非 Error，砸穿了下游的错误契约
- **错误现象**：
  ```ts
  // httpClient.ts 响应拦截器失败分支
  if (error.code === 'ECONNABORTED') {
    return Promise.reject('请求超时'); // ❌ 拒绝的是一个字符串
  }
  ```
  明明写好了中文错误文案，但页面上没显示它，反而显示了兜底文案「未知网络异常」。
- **Java 思维惯性**：
  在 Java 里 `throw` 的东西**必须是 `Throwable` 子类**（`throw "请求超时"` 连编译都过不了），而且 `catch (Exception e)` 能稳稳拿到 `e.getMessage()`。Java 开发者因此默认「错误载体就是异常对象、消息一定取得到」；而 JS 的 `Promise.reject(x)` 不对 `x` 做任何类型校验，`reject('任意值')` 完全合法——类型系统的缺位让这个坑静默存在。
- **底层根因**：
  1. 下游 Hook 的错误处理遵循 `catch (err: unknown)` + `err instanceof Error ? err.message : '未知网络异常'`（TASK-004 的标准范式）。`instanceof Error` 对字符串恒为 `false`，于是精心编写的中文提示被丢弃，永远显示兜底文案；
  2. 只有 `Error` 实例携带 `stack`（堆栈）；拒绝字符串等于**丢弃调用链信息**，线上无法定位是哪一行发出的请求；
  3. **异步世界没有受检异常**：`Promise.reject(x)` 的类型是 `Promise<never>`，`x` 的类型不会被任何地方校验，所以错误契约必须靠人自觉遵守——这是 JS 与 Java「checked exception」文化的根本差异。
- **正确做法**：
  ```ts
  // ✅ 拒绝理由的类型必须全局统一为 Error
  return Promise.reject(new Error('请求超时'));
  // 或者在 onRejected 回调里直接 throw（axios 会把它转成 rejected Promise）
  throw new Error('请求超时');
  ```
- **避坑口诀**：
  **“拒绝理由统一 Error，字符串无情丢 stack；下游 instanceof 一判，中文提示全白写。”**

---

### [2026-09-17] 错误归一化用「状态码白名单 \+ 直取 `response.data.detail`」：漏了大半异常，还吐出 `Error: undefined`
- **错误现象**：
  ```ts
  if (error.response?.status === 500 || error.response?.status === 404) {
    return Promise.reject(error.response.data.detail); // ❌ 无兜底
  }
  ```
  两个后果：① `401 / 400 / 405 / 502` 等全部落到最后的 `reject(error)`，界面直接显示 axios 英文原文 `Request failed with status code 401`；② 后端未启动时（Vite dev proxy 会接住请求并返回 500，**响应体根本不是 JSON**），`data.detail` 为 `undefined` → 抛出 `Error: undefined`，比不写还难排查。
- **Java 思维惯性**：
  后端开发习惯了「契约内响应」：接口说好返回 `Result<T>`，那就一定能 `result.getData().getDetail()`。因为在 Java 里 `@RequestBody` / `RestTemplate` 要么给对象、要么直接抛 `HttpClientErrorException`，**很少会拿到「一坨非预期格式的东西」**。
- **底层根因**：
  1. **跨进程边界上没有类型**：TS 的 `Promise<PageResult<T>>` 只是开发者的「单方面声明」，运行时对方可能是 Nginx 502 页面、网关 HTML、空 body、非 JSON 文本——**类型签名管不住进程外的世界**；
  2. **状态码不是业务分类**：真实后端的状态码集合是开放的（400/401/403/405/408/409/422/429/500/502/503…），按「枚举白名单」分类必然漏；正确的分法只有两类：
     - `error.response` 存在 → 通信成功、业务失败（优先取后端 detail，兜底 `HTTP <status>`）
     - `error.response` 不存在 → 根本没到后端（网络不可达 / 超时）
  3. 泛型只在编译期存在，**运行时校验必须由开发者自己写**（这就是 Java 里 `@Valid` + 防御式编程的对等物，但前端要手写）。
- **正确做法**：
  ```ts
  // ✅ 可选链 + 兜底，并带上状态码
  const msg = error.response.data?.detail ?? `请求失败 (HTTP ${error.response.status})`;
  return Promise.reject(new Error(msg));
  ```
  实测方法：① `?fail=true` 看后端 detail；② **把后端进程关掉再刷新页面**，观察代理返回的 500 是否被兜底文案接住。
- **避坑口诀**：
  **“跨进程处无类型，取字段必带兜底；状态码不列白名单，只分有无 response。”**

---

### [2026-09-17] 在 async 函数里手动 `new Promise(value)` 包装返回值：Promise 构造器要的是函数，不是值
- **错误现象**：
  ```ts
  export async function fetchUserPage(params: UserQueryParams): Promise<PageResult<ApiUser>> {
    const res = await httpClient.get<PageResult<ApiUser>>('/users/page', { params });
    const users: PageResult<ApiUser> = res.data;
    return new Promise<PageResult<ApiUser>>(users); // ❌ 运行时 TypeError
    throw new Error('TODO: ...');                    // ❌ 死代码
  }
  ```
  报错：`Promise resolver #<Object> is not a function`（因为 `Promise` 构造器的首个入参必须是一个**函数**）。
- **Java 思维惯性**：
  在 Java 里，方法签名声明了 `CompletableFuture<User>`，就**必须显式包装**返回值：`return CompletableFuture.completedFuture(user);` —— 因为 Java 没有“自动包装”的语法糖（除非整个方法都是 `thenApply` 链）。带着这个习惯写 JS，就会在已经标了 `async` 的函数里再套一层构造函数。
- **底层根因**：
  1. `new Promise(executor)` 的 `executor` 签名是 `(resolve, reject) => void`，**它要的是“告诉你什么时候成功/失败”的回调函数**，而不是“已经成功的结果值”；传对象进去会在构造阶段直接抛 TypeError；
  2. **`async` 函数的 `return 值` 会被自动包装成 `Promise.resolve(值)`**，连抛出的异常也会被自动变成 rejected Promise；所以 `async` 函数体内部**只需要写普通 return**；
  3. 真需要手动包装时用的是静态方法 `Promise.resolve(value)`——但在 `async` 函数里依然是套娃。
- **正确做法**：
  ```ts
  export async function fetchUserPage(params: UserQueryParams): Promise<PageResult<ApiUser>> {
    const res = await httpClient.get<PageResult<ApiUser>>('/users/page', { params });
    return res.data; // ✅ async 会自动包装，不需要手动 new
  }
  ```
  `new Promise(...)` 的真正用武之地是：**把回调式 API 桥接成 Promise**（`setTimeout`、DOM 事件、老库的 `callback(err, data)`），对应 Java 里把回调接口包成 `CompletableFuture`。
- **避坑口诀**：
  **“async 已替你包装，函数体内普 return；new Promise 要回调，传值进去必报错。”**

---

### [2026-09-17] 死代码不会被 TS 报错（`return` 之后的占位 `throw` 残留）
- **错误现象**：在 `return` 语句之后保留了实现前的占位 `throw new Error('TODO: 尚未实现')`，`npm run build` 依旧全绿，于是错误残留到交付代码里。
- **Java 思维惯性**：Java 里 `throw` 写在 `return` 之后会直接编译失败（`javac` 报 `unreachable statement`），所以 Java 开发者默认“编译器会帮我抓住这种手误”。
- **底层根因**：
  1. TypeScript 的 `allowUnreachableCode` 默认为 `undefined`，语义是“在编辑器里以提示/灰显的形式建议”，**不产生编译错误**；
  2. 哪怕真的开了 `allowUnreachableCode: false`，JS 中仍存在大量“编译器无法静态判定”的动态可达路径（`eval`、动态导入等），所以静态死代码分析在 JS 世界里天然不如 Java 严格。
- **正确做法**：实现完一个 TODO 后，**顺手删掉占位 throw 与 TODO 注释**；提交前用 `eslint` / 编辑器灰显提示自查。
- **避坑口诀**：
  **“Java 死码是错误，TS 死码只灰显；实现完就删占位，别让 TODO 上生产。”**

---

### [2026-09-17] `loading` 初始值写成 `false`：首帧必然闪一下“暂无数据”（useEffect 的运行时序）
- **错误现象**：进入 TASK-007 标签页时，界面先闪一下「暂无用户数据 / 共 0 条」，随后才切到「⏳ 正在加载第 1 页…」。代码里明明在 `useEffect` 的第一行就 `setLoading(true)` 了。
- **Java 思维惯性**：
  Java 里初始化顺序是强保证的：字段初始化 → 构造器 → 之后才可能被外部观测。如果把 `status = LOADING` 写在构造器里并发出异步请求，那么“第一次被人看到”时它**必定已经是 LOADING**。把这个直觉带到前端，就会默认“我在 useEffect 里立即 setLoading(true) = 组件一开始就是 loading”。
- **底层根因**：
  React 的渲染提交后有两个阶段：（1）**渲染**（计算 JSX）；（2）**提交**（写入 DOM）；而 `useEffect` 属于 **passive effect，在提交之后再异步执行**。因此“首帧”永远发生在 `useEffect` 之前，`loading` 只能是它的**初始值** `false` → 首帧必然渲染成空状态。
  这是一个**纯行为层面的时序问题**：`tsc` 不报错、`eslint` 不报错，静态检查完全穿不透。
  （另：开发环境下 `<StrictMode>` 会故意把 effect 跑两遍，因此 Network 面板会看到**两次** `/api/users/page` 请求——这不是 Bug，而是 React 帮你提前暴露“副作用是否幂等”。正是因为你写了竞态守卫，两次请求才没把界面弄乱。）
- **正确做法**：
  ```ts
  // ✅ 表达“挂载即请求”这个已知事实：初始就是加载中
  const [loading, setLoading] = useState(true);
  ```
  或者做三态建模（更严谨）：`const [users, setUsers] = useState<ApiUser[] | null>(null)`，`null` 表示“尚未加载”，与“加载完成但结果为空”彻底区分开。
- **避坑口诀**：
  **“effect 在渲染之后跑，首帧只看 state 初始值；挂载即请求的页面，loading 初始必为 true。”**

---

### [2026-09-17] 同一个契约字符串散落多处（魔法值）：已有 `TOKEN_KEY` 常量却硬写 `"token"`
- **错误现象**：
  ```ts
  // tokenStore.ts —— 写入端
  localStorage.setItem("token", token);
  // httpClient.ts —— 读取端（已用常量）
  const token = localStorage.getItem(TOKEN_KEY);
  ```
  两边当前值碰巧相同（都是 `'token'`），所以功能正常，**编译与 eslint 全绿 —— 缺陷完全隐形**。
- **Java 思维惯性**：
  Java 里 `static final String TOKEN_KEY = "token";` 几乎是肌肉记忆，但**为什么**要这样？多数人的真实理由是“项目规范这么写”，而不是“不写就会出事”。于是在 JS 里看到“常量与字符串当下等价”就会懒得抽——毕竟跑起来没任何区别。
- **底层根因**：
  1. **字符串字面量没有校验**：无论是 Java 还是 TS，拼错 `"toke"` 都不会报编译错，只能靠“只有一个地方写它”来消除风险。**常量的价值不在类型安全，而在单一来源（Single Source of Truth）**；
  2. **耦合是隐式的**：写入端与读取端通过一个字符串**隐式约定**关联，调用链上看不出依赖关系（不像函数调用有引用可跳转），**重命名重构无法自动传播**；
  3. **失效场景的排查成本极高**：若未来要把键名改成 `access_token`（例如同时支持 refresh_token），只改一处 → 登录成功但**所有后续请求依然 401**，前后端日志都看不到异常，很容易误判为“JWT 配置错”。
- **正确做法**：
  ```ts
  // httpClient.ts（写入方与读取方共用）
  export const TOKEN_KEY = 'token';

  // tokenStore.ts
  import { TOKEN_KEY } from '../TASK-007-http-layer/httpClient';
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.getItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  ```
- **避坑口诀**：
  **“契约字符串不散落，写入读取共一个常量；碰巧相等最危险，改一处就静默 401。”**

---

### [2026-09-17] 用模板字符串插值打印对象，得到 `[object Object]`（信息全丢）
- **错误现象**：
  ```ts
  httpClient.interceptors.response.use((response) => {
    console.log(`${response}`); // 控制台输出：[object Object]，什么都看不到
    return response;
  });
  ```
  想观察响应内容，结果只打出一串 `[object Object]`，误以为「响应体是空的」，差点去查后端问题。
- **Java 思维惯性**：
  在 Java / Spring 里打印对象非常自然：`log.info("resp={}", response)` 或 `log.info("resp=" + user)`，只要 POJO 上有 Lombok `@Data`，就会输出完整的字段名与值；即使没重写 `toString()`，也至少能看到 `UserDTO@1a2b3c` 这种「至少知道是什么类」的信息。Java 开发者因此形成了「字符串拼接对象 = 能看到内容」的直觉。
- **底层根因**：
  1. JS 模板字符串 `/\${x}/` 会隐式调用 `String(x)`，即 `x.toString()`；
  2. 普通对象的 `toString()` 继承自 `Object.prototype`，硬编码返回 `"[object Object]"`——**不包含任何属性信息**；
  3. 浏览器 `console.log` 只有在**直接传入对象引用**时才会展开为可交互对象树，一旦经过字符串插值，信息就永久丢失了；
  4. 这与之前的 `[object Promise]` 是**同一族错误**（都是「隐式字符串转换抹除对象信息」）：第一题是忘了 `await`，本题是忘了「别插值」。
- **正确做法**：
  ```ts
  // ✅ 多参数形式：对象以引用形式打印，可在控制台展开查看字段
  console.log('[HTTP ←]', response.status, response.config.url, response.data);

  // 需要拼接进字符串时，先 JSON 序列化（并注意循环引用会抛错）
  console.log(`[HTTP ←] ${response.status} ${response.config.url}`);
  ```
- **避坑口诀**：
  **“对象莫进模板串，toString 抹一切；多参打印留引用，要看字段别拼接。”**

---

### [2026-09-17] 在 Repository 层写业务副作用（分层越界）：`loginApi` 里调了 `saveToken`
- **错误现象**：
  ```ts
  // authApi.ts —— 名义上是“认证接口层（Repository）”
  export async function loginApi(cmd: LoginCommand): Promise<LoginResult> {
    const res = await httpClient.post('/auth/login', cmd);
    saveToken(res.data.token);   // ❌ 持久化副作用混进了数据访问层
    return res.data;
  }
  ```
  编译、eslint、运行全部正常 —— **今天完全看不出问题**。
- **Java 思维惯性**：
  在后端写“登录接口”时，习惯在一个 `AuthServiceImpl.login()` 里一气完成“校验密码 → 签发 token → 写入 Redis/Session → 返回 VO”。前端的分层粒度比后端 Controller/Service 更细，但习惯会把“一整块业务”塑到一个函数里，于是顺手在 `authApi` 里把 token 存了。
  参考：**你绝不会在 `UserRepository.findByUsername()` 里顺手写 `SecurityContextHolder.setAuthentication(...)`** —— 那是认证编排层的职责。
- **底层根因**：
  1. **职责边界靠约定维持，编译器不管**：Repository 层的契约是“URL + 参数 + 拆 `.data`”，不含任何状态写入（无论是 React state 还是 localStorage）；
  2. **产生了第二个“写入者”**：按任务设计，`AuthProvider.login()`（TODO ③）也必须 `saveToken(...)`。现在职责模糊 → 将来一旦有“只校验不登录”的场景（修改密码前验旧密码、管理员代查账号），会**误把 token 覆盖掉**；
  3. **副作用使函数不可重放**：调用链上任何人调一下 `loginApi` 都会静默改变全局登录态，违背了“纯函数容易被推理与测试”的工程原则。
- **正确做法**：
  ```ts
  // authApi.ts：只负责“取数据”，保持纯净
  export async function loginApi(cmd: LoginCommand): Promise<LoginResult> {
    const res = await httpClient.post<LoginResult>('/auth/login', cmd);
    return res.data;
  }

  // AuthProvider.tsx（TODO ③）：由编排层决定“登录成功后要写 token + 更新用户”
  const result = await loginApi(cmd);
  saveToken(result.token);
  setUser(result.user);
  ```
- **避坑口诀**：
  **“Repository 只取数，写入交编排层；一个职责一个主，合成一块没人管。”**

---

### [2026-09-17] 忘记给 axios 方法传泛型 → `res.data` 静默变成 `any`
- **错误现象**：
  ```ts
  const res = await httpClient.post("/auth/login", cmd); // ❌ 没写 <LoginResult>
  return res.data;                                        // res.data 的类型是 any
  ```
  `tsc` 与 `eslint` 全绿，运行时也完全正常，但**类型保护已经失效**。
- **Java 思维惯性**：
  Java 里 `LoginResult vo = restTemplate.postForObject(url, cmd, LoginResult.class)` —— 类型是**作为参数显式传进去的**，不传就编译不过（泛型方法推导也会要求你指定）。而 TS 的泛型可以是**可选**的，不传时静默退化为 `any`，编译器不会提醒你——**“不写”和“写错”在这里长得一模一样**。
- **底层根因**：
  1. axios 的签名是 `post<T = any, R = AxiosResponse<T>, D = any>(url, data?, config?)` —— **`T` 有默认值 `any`**；
  2. `any` 具有“传染性”：它可以赋给任何类型（包括函数声明的 `Promise<LoginResult>`），所以返回值注解反而**掩盖**了丢失的类型信息；
  3. 本项目 `tsconfig` 未开 `strict`/`noImplicitAny`，因此连“隐式 any”都不会提醒——三重保险全部失效。
- **正确做法**：把泛型当作“对后端契约的声明”顺手写上：
  ```ts
  const res = await httpClient.get<PageResult<ApiUser>>('/users/page', { params });
  const res = await httpClient.post<LoginResult>('/auth/login', cmd);
  const res = await httpClient.get<AuthUser>('/auth/me');
  ```
  效果：后端字段改名（`token` → `accessToken`）时，TS 会在**编译期**报错，而不是等运行时白屏。
- **避坑口诀**：
  **“axios 泛型有默认值，不写就是 any；契约声明带一笔，字段改名早报错。”**

---

### [2026-09-17] 手工重复实现基础设施已提供的职责：在 Repository 里手动拼 `Authorization` 头
- **错误现象**：
  ```ts
  export async function fetchMeApi(): Promise<AuthUser> {
    const res = await httpClient.post<AuthUser>("/auth/me", {
      "Authorization": "Bearer" + readToken()      // ❌ ① 方法错 ② 位置错
    });
    return res.data;
  }
  ```
  这里叠加了两个错误：
  1. 接口是 GET，却发了 POST → **实测 `HTTP 405 Method Not Allowed`**；
  2. 把“配置对象”塞进了 `post` 的**第二参数** —— 但 `post(url, data, config)` 的第二个位置是**请求体**，配置在第三个位置。所以这个对象会变成 JSON body，**头根本没被设置**（若改成 `get`，它落在 config 位置，而 config 里该字段名应为 `headers`，`Authorization` 会被 axios **静默忽略**）。
  另外实测：若真的发出格式错误的头（如 `Authorization: Bearernull`，缺空格）→ **HTTP 401 「未提供有效的 Authorization 头」**（报错语义还会误导排查方向）。
- **Java 思维惯性**：
  写 `RestTemplate` / `HttpClient` 时，每个调用都要自己 `headers.setBearerAuth(token)`，或者写一个 `ClientHttpRequestInterceptor`。Java 开发者对“显式装配请求”很熟悉，于是看到参数就顺手拼头；但在本项目里，**这个职责已经在 TASK-007 交付给拦截器了**。
- **底层根因**：
  1. **双写入者（Two Writers）**：同一个请求头被两个地方写 → 最终值取决于执行顺序（拦截器在请求发出前统一 `set`，会覆盖业务代码里的值）；写错的那份还会被写对的那份**静默掩盖**，形成隐障；
  2. **位置语义靠人为记忆**：`get(url, config)` 与 `post(url, data, config)` 的第二参数不是同一个东西（详见 Q-AR-10）——而 TS 里两者都是对象字面量，编译器不会提醒；
  3. **跨层泄漏**：Repository 层不该知道“鉴权令牌叫什么、怎么拼”（对照：DAO 不该自己拼 JWT），否则以后从 Bearer 换成 Cookie 就要改所有接口函数。
- **正确做法**：
  ```ts
  // authApi.ts：什么都不用管，拦截器会自动注入
  export async function fetchMeApi(): Promise<AuthUser> {
    const res = await httpClient.get<AuthUser>('/auth/me');
    return res.data;
  }

  // 例外：调用不经拦截器的第三方 API 时，才自己写头（且必须放在 headers 字段里）
  httpClient.get('/third-party/x', { headers: { Authorization: `Bearer ${token}` } });
  ```
- **避坑口诀**：
  **“基础设施已管的事，业务层别再管；两个写入者一碰头，错的那份被对的掩盖。”**

---

### [2026-09-17] HTTP 方法用错：用 `POST` 调用 GET 接口 → 405
- **错误现象**：后端定义的是 `@app.get("/api/auth/me")`（Spring 对等物 `@GetMapping`），前端却发了 `httpClient.post("/auth/me", ...)`。
  **实测结果**：`HTTP 405 -> {"detail":"Method Not Allowed"}`（而正确的 `GET` 返回 200）。
- **Java 思维惯性**：
  后端开发日常里，“提交一些参数给服务端”往往会下意识选 POST（因为 Spring MVC 里 `@RequestBody` 必须配 POST）；而浏览器地址栏能直接打开的接口、RestTemplate 默认的 GET，在前端又容易变成 `fetch`。选方法时凭习惯而非契约。
- **底层根因**：
  1. **HTTP 方法是路由匹配的一部分**：后端注册了“路径 + 方法”的组合，方法不同就是**不同路由**，不是同一个接口；
  2. **405 与 404 的语义差别**：404 = 没这个路径；405 = **路径存在但方法不允许**（响应头还会带 `Allow: GET`）——能在排查时直接指向真相；
  3. **方法语义不是风格问题**：GET = 安全（不改变服务端状态）、幂等；POST = 非幂等提交。把“读取”写成 POST 会破坏缓存、重试语义，也会让接口文档失真。
- **正确做法**：以**后端契约为准**，先看 Swagger（`http://127.0.0.1:8000/docs`）确认方法再写调用代码：
  ```ts
  httpClient.get<AuthUser>('/auth/me');        // 读
  httpClient.post<LoginResult>('/auth/login', cmd);  // 提交
  httpClient.post('/auth/logout');             // 触发动作
  ```
- **避坑口诀**：
  **“路径相同方法不同，就是两接口；读用 GET 写用 POST，405 别当 404 查。”**

---

### [2026-09-17] 把 `useState` 声明语句塞进了对象字面量（语句 vs 表达式的位置混淆）
- **错误现象**：
  ```tsx
  const placeholder: AuthContextValue = {
    const [user, setUser] = useState<AuthUser | null>(null);     // ❌ TS1005: ':' expected
    const [initializing, setInitializing] = useState(true);      // ❌ TS1005: ':' expected
    login: async () => { ... },
  };
  ```
  编译器直接抛 `TS1005: ':' expected`。
- **Java 思维惯性（弱相关）**：
  Java 里“对象初始化”往往写在**类体**（字段声明、实例初始化块、构造器）里，类体本身就是一个能容纳**语句/声明**的区域。于是看到 `{ ... }` 就当成“一块可以写声明的地方”。
  但 JS/TS 里 `{}` 的含义**完全由位置决定**：赋值号右侧的 `{` 是**对象字面量（一段表达式）**，里面**只能写 `key: value` 属性**，不能写任何语句。
- **底层根因**：
  1. **语言分层：语句（statement）> 表达式（expression）**。表达式可以嵌在语句里，反之绝不允许；`const [user, setUser] = ...` 是**声明语句**，而对象字面量是**表达式**（Java 同样如此：`Map m = { put("a",1); }` 也不合法）；
  2. **`{}` 在 JS 里有两种身份**：表达式位置（`= {}`、`return {}`、`({})`、`() => ({})`）是对象字面量；语句位置（函数体、`if/for` 的块）是块语句 —— 经典的坑还有 `() => { a: 1 }` 会被解析成“块语句 + label”而不是返回对象；
  3. **Hook 还有额外的位置约束（Rules of Hooks）**：`useState` 必须写在组件函数体（或自定义 Hook）的**顶层**，不能写在条件、循环、回调、对象字面量里。原因是 React 靠“**每次渲染的调用顺序**”来把 state 依次对应回各个 Hook——一旦位置不固定，对应关系就乱了。
- **正确做法**：先声明（组件函数体顶层），再组装对象：
  ```tsx
  export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [initializing, setInitializing] = useState(true);

    const value: AuthContextValue = { user, initializing, login, logout }; // 只放“值”
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };
  ```
- **避坑口诀**：
  **“花括号里莫写语句，只能键值对成双；Hook 只在顶层站，顺序稳定才对得上。”**

---

### [2026-09-17] 用对象解构去接 `useState` 的返回值（数组解构 vs 对象解构）
- **错误现象**：
  ```tsx
  const { formData, setFormData } = useState<FormData>({ username: '', password: '' });
  // TS2339: Property 'formData' does not exist on type '[FormData, Dispatch<SetStateAction<FormData>>]'
  ```
  同时后续 `setFormData((prev) => ...)` 还报 `TS7006: Parameter 'prev' implicitly has an 'any' type`。
- **Java 思维惯性**：
  Java 里取一个方法返回的多个值，要么是带**名字**的 POJO/record（`user.getName()`），要么是 `Map.Entry.getKey()/getValue()`。名字是唯一的寻址方式，所以看到“一次返回两个东西”时，下意识就想“按名字取”。
- **底层根因**：
  1. **JS 有两种解构，寻址方式完全不同**：
     | 解构形式 | 寻址依据 | 要求被解构对象是 |
     | :--- | :--- | :--- |
     | `const { a, b } = obj` | **属性名** | 对象 |
     | `const [x, y] = arr` | **位置** | 可迭代对象（数组/元组/字符串/Set/Map…）|
     而 `useState` 返回的是**数组（元组）**，且元素本身没有名字——只有位置。
  2. **TS 的元组类型是精确的**：`[FormData, Dispatch<SetStateAction<FormData>>]`，所以用对象解构直接被类型系统拒绝——**这次编译器帮了忙**；
  3. **联锁效应**：变量根本没声明成功，所以 `setFormData` 也成了未知名字，后续回调参数 `prev` 只能退化为隐式 `any` —— **一个错误会引来一串告警，不要被数量吓到，先修根因。**
  - 顺带理解变量命名习惯：`const [count, setCount] = useState(0)` 里的名字是**你自己起的**，React 不关心叫什么，**位置才是真相**。（这也是为什么 Hook 必须写在顶层：React 靠“第几个 Hook”来对应槽位——详见 Q-TS-08）
- **正确做法**：
  ```tsx
  const [formData, setFormData] = useState<FormData>({ username: '', password: '' });
  ```
  Java 类比：`var result = pair(); String a = result.get(0); String b = result.get(1);`——位置寻址。
- **避坑口诀**：
  **“useState 返回是数组，方括号里按位取；花括号是找属性，名字对不上就报错。”**

---

### [2026-09-17] 从旧任务“抄代码”的三个后遗症（事件类型误用、多余分支、命名坑复发）
- **错误现象**（在 `LoginPage` 里同时出现）：
  ```tsx
  export interface FormData { ... }  // ① 又撞上浏览器原生全局 FormData（TASK-003 已记录过）

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;   // ② 本页没有 checkbox，纯多余分支
    ...
  };

  const handleSubmit = (e: React.FormHTMLAttributes<FormData>) => {   // ③ 事件类型完全用错
    e.preventDefault();   // TS2339: Property 'preventDefault' does not exist
  };
  ```
- **Java 思维惯性**：
  Java 代码重用很自然（同一套 DTO/Service 直接引用），而且 IDE 的重命名/类型检查能兜住大部分改名。于是把 TASK-003 的表单处理函数整块搬过来、只改字段名，是很自然的动作；而 JS/TS 的**全局命名空间共享**（浏览器原生 API 也是全局的）与**类型名相似性陷阱**（`FormHTMLAttributes` vs 事件对象类型）都不会在复制的那一刻提醒你。
- **底层根因**：
  1. **`FormHTMLAttributes<T>` 与“提交事件类型”是两回事**：前者描述“`<form>` 标签能写哪些属性”（action/method/onSubmit/noValidate…），后者描述“**提交事件对象**”（有 `preventDefault`、`target`、`currentTarget`）。名字里都带 Form，语义却一个是“属性集合”、一个是“事件”；
     📌 **补充（后续发现）**：React 18 及以前的惯例写法是 `React.FormEvent<HTMLFormElement>`，但在 **React 19 的 `@types/react` 里 `FormEvent` 已被标记 `@deprecated`**（理由：它在 DOM 规范里根本不存在）。正确类型是 **`React.SubmitEvent<HTMLFormElement>`**。详见 Q-RC-12；
  2. **DOM 全局命名是共享的**：浏览器环境下 `FormData` 已被占用，自定义 interface 用同名会“遮蔽全局类”，极容易在未来某天写出 `new FormData({...})` 而拿到原生构造器（TASK-003 已为此写过一条错题）；
  3. **多余分支是认知负债**：`type === 'checkbox'` 与 `checked` 在本页永远为假，却让读者以为“这里支持复选框”，还引入了一次类型断言 `as HTMLInputElement`（而断言正是在“掩盖类型不匹配”）。
- **正确做法**：
  ```tsx
  export interface LoginFormData { username: string; password: string }   // ① 避开全局名

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {       // ② 只面对本页真实存在的元素
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {        // ③ 提交事件对象类型（React 19）
    e.preventDefault();
  };
  ```
- **避坑口诀**：
  **“抄代码先剪枝，多余分支全删掉；属性类型不当事，提交事件 SubmitEvent。”**

---

### [2026-09-17] 未等待异步登出完成就跳转：状态没清完就先切视图（跳转乒乓）
- **错误现象**：
  ```tsx
  const logoutPage = async () => {
    logout();            // ❌ 没 await（而 logout 内部是 async：先 await 服务端，finally 里才清 token/清 user）
    navigate('/login');
  };
  ```
  实测表现：点“退出登录” → 跳到 `/login` → **立刻弹回 `/profile`** → 再跳 `/login`（界面闪烁两次）。
  原因链：`navigate` 是**同步**的，而 `logout()` 的 `clearToken()/setUser(null)` 在 `finally` 里、**要等服务端接口返回（约 0.4~0.6s）之后**才执行。于是：
  `<profile> ──点退出──> navigate 到 /login（user 仍非 null）──> LoginPage 的 “已登录则 <Navigate to='/profile'>” 把用户弹回 ──> logout 完成，user 变 null ──> 守卫再踢回 /login`。
- **Java 思维惯性**：
  后端里 `authService.logout()` 往往是**同步执行完才 return**；即便用了 `@Async`，也习惯了“调了就当成做完了”（fire-and-forget）。JAVA 开发者对“调一个 void 方法 = 副作用已完成”有强烈直觉；而 JS 里只要函数是 `async`，调用它只是“**排队**”，**默认不等待**。
- **底层根因**：
  1. **Promise 不是命令式语句而是调度凭证**：不 `await` 就只拿到一个 Promise 对象，后续代码**不等它**——与 TASK-007 的竞态、TODO ③ 的 logout 顺序是同一族问题（异步世界时序 ≠ 代码书写顺序）；
  2. **视图切换是同步的，状态清理是异步的** → 两者发生错位，短暂出现“路由已在登录页、状态仍是已登录”的**不一致中间态**；
  3. **契约把异步性藏起来了**：`AuthContextValue.logout: () => void` 声明为同步返回 `void`，调用方从类型上完全看不出“它需要时间才能做完”，也无从知道何时该跳转（应写成 `() => Promise<void>`）；
  4. **静态检查管不着**：tsc/eslint 全绿（eslint 的 no-floating-promises 未开启），因为“该不该等”是语义问题，不是类型问题。
- **正确做法**：
  ```tsx
  // 契约改诚实：logout: () => Promise<void>
  const handleLogout = async () => {
    await logout();                             // 等状态真正清完
    navigate('/login', { replace: true });      // 再切视图（replace 避免后退又回到受保护页）
  };
  <button type="button" onClick={handleLogout} disabled={loggingOut}>退出登录</button>
  ```
  另一种正确思路：**不手动跳转**——登出后 `user` 变 `null`，用路由守卫（TODO ⑥）自动重定向，避免两处同时决定导航。
- **避坑口诀**：
  **“异步未落地，莫急换视图；契约写 void，时序全丢弃。”**

---

### [2026-09-19] URL 字符串末尾多一个空格 → 404（类型系统看不见的空白字符）
- **错误现象**：
  ```ts
  const res = await httpClient.post<ApiUser>("/admin/users ", cmd);  // ← 引号内末尾多了一个空格
  ```
  `tsc -b` 与 `eslint` **全绿**（无任何报错）；运行时后端返回 **404**。
  **实测对照**（教练在本机后端实测过的真实结果）：
  | 请求 URL | 结果 |
  | :--- | :--- |
  | `POST /api/admin/users%20` | **404 Not Found** |
  | `POST /api/admin/users` | **201 Created** |
- **Java 思维惯性**：
  Java 里接口路径通常写在注解里（`@PostMapping("/admin/users")`），是**编译期常量 + 启动期注册路由**，写错要么编译不过、要么启动时就暴露；而且习惯上“路径”是框架管的元数据，不是随手拼的字符串。到了前端，URL 变成**运行期普通字符串**，没人替你校验，只有请求发出去才知道错了。
- **底层根因**：
  1. **TS 只约束类型，不约束内容**：`string` 类型对“末尾有没有空格”一无所知 —— 正如 Java 的 `String name` 也不会校验“名字里有没有多余空格”；
  2. **空格会被编码成 `%20` 一起发出去**：浏览器/axios 把 URL 里的空格编码，服务端拿到的路径是 `/api/admin/users `（带空格），与注册的 `/api/admin/users` **不是同一个路径** → 路由不匹配 → 404；
  3. **404 的误导性**：报错说“找不到”，而人的直觉会去怀疑“后端没重启 / 接口没写对 / 权限问题”，**极少有人第一反应是“我的字符串里有个空格”** —— 这才是这类 Bug 浪费时间的真正原因；
  4. **静态检查双重盲区**：类型系统不管字符串内容，ESLint 默认也没有规则能发现“URL 里多一个空格”——只能靠**实际发一次请求**验证。
- **正确做法**：
  1. 路径前缀抽成常量，只写一次（类比 Java 常量），杜绝拼写漂移：
     ```ts
     const ADMIN_USER_BASE = '/admin/users';   // 单一来源
     httpClient.post<ApiUser>(ADMIN_USER_BASE, cmd);
     httpClient.put<ApiUser>(`${ADMIN_USER_BASE}/${id}`, cmd);
     httpClient.delete<void>(`${ADMIN_USER_BASE}/${id}`);
     ```
  2. 排查 404 的**第一动作**：打开 Network 面板看**实际请求 URL 的原样**（或后端日志里的 `"POST /api/admin/users%20 HTTP/1.1" 404`）—— 一眼就能看见 `%20`；
  3. 契约优先：路径与后端 Swagger（`http://127.0.0.1:8000/docs`）**逐字比对**，别凭记忆敲；
  4. 写好一层就**真发一次请求**（登录后点一下界面），把“拼写类错误”和“逻辑类错误”分开展现。
- **避坑口诀**：
  **“字符串里的空白，类型系统全看不见；报 404 别猜逻辑，先看 Network 里的原样。”**
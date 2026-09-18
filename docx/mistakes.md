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
# TypeScript 专题问答库 (docx/questions/typescript.md)

> 归档范围：TypeScript 语法、类型系统、泛型、接口契约以及与 Java 静态类型机制的差异剖析。

---

### Q-TS-01: TypeScript 的 `interface` 与 Java 的 `interface` / `class` 到底有什么本质区别？
- **提问背景**：Java 开发者刚接触 TS 时，容易把 TS 的 `interface` 当成 Java 的接口或者把对象字面量当成类实例。
- **核心解答 (Answer)**：
  - **结构化子类型（鸭子类型）**：TS 的类型系统关注的是对象的“形状（Shape）”。只要对象的属性和类型匹配，不管名字是否一样都能兼容。
  - **编译期类型抹除 (Type Erasure)**：TS 的 `interface` 只在编译阶段（IDE、tsc）存在。编译成 JS 后代码全部消失，运行时没有任何真实的类或接口对象存在，因此不能在运行时使用 `instanceof MyInterface`。
- **Java / 后端对照视角 (Java Mapping)**：
  - Java 是**名义类型系统 (Nominal Typing)**：类必须显式声明 `implements Interface` 才算实现接口；两个字段相同的类不能互相赋值。
  - TS 是**鸭子类型**：不需要显式 `implements`，长得一样就是同一个接口。
- **极简代码示范**：
  ```ts
  interface UserDto { name: string; age: number; }
  interface UserVo  { name: string; age: number; }

  const dto: UserDto = { name: "Alice", age: 25 };
  const vo: UserVo = dto; // TS 完全合法！Java 则编译报错。
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-TS-02: `interface` 和 `type` 有什么区别？开发业务组件时怎么选？
- **提问背景**：写 React 组件 Props 时，看到有人用 `interface Props`，有人用 `type Props`，产生混淆。
- **核心解答 (Answer)**：
  - `interface`：专门用于描述对象/类的形状，支持多次声明自动合并（Declaration Merging）和 `extends` 继承。
  - `type`：类型别名，功能更广泛。除了描述对象，还能定义联合类型（Union Types，如 `'admin' | 'user'`）、元组、基本类型别名。
  - **组件开发推荐**：定义组件 Props、数据实体 DTO 时优先推荐 `interface`；定义联合类型、工具类型时使用 `type`。
- **Java / 后端对照视角 (Java Mapping)**：
  - `interface` 类似 Java 的 `interface` 或 POJO 结构。
  - `type Status = 'A' | 'B'` 类似 Java 的轻量级 `Enum`。
- **掌握标记**：[ ] 待主动回忆

---

### Q-TS-03: `any` 和 `unknown` 有什么区别？为什么不应该随便用 `any`？
- **提问背景**：当遇到复杂类型时，新手容易为了不报错直接写 `: any`。
- **核心解答 (Answer)**：
  - `any`：彻底关闭 TypeScript 的类型检查，相当于放弃 TS 的保护，把代码退化为纯 JS。访问任意属性都不会报错，但运行时极易报 `undefined is not a function`。
  - `unknown`：类型安全的“未知类型”。你可以把任何值赋给 `unknown`，但在对它进行操作前，**必须先进行类型收窄（Type Narrowing）**（如 `typeof` 或 `if (err instanceof Error)`）。
- **Java / 后端对照视角 (Java Mapping)**：
  - `unknown` 类似 Java 5 引入的泛型通配符 `Object`，你从 `Object` 拿出来使用前必须强制转型或 `instanceof` 检查。
  - `any` 类似完全绕过 JVM 编译器类型检查的危险操作。
- **极简代码示范**：
  ```ts
  let value: unknown = "hello";
  // value.toUpperCase(); // ❌ 编译报错：Object is of type 'unknown'

  if (typeof value === "string") {
    console.log(value.toUpperCase()); // ✅ 安全通过收窄
  }
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-TS-04: 我要学的是 TypeScript，为什么总在讨论 JavaScript 的机制和坑？
- **提问背景**：在学习和 Review 过程中，教练经常提及 JavaScript 的假值、短路逻辑、运行机制，初学者产生疑惑：这两者到底是什么关系？
- **核心解答 (Answer)**：
  - **TypeScript 是 JavaScript 的严格超集（Superset）**：公式即 `TypeScript = JavaScript + 类型系统`。TS 并不是一门独立运行的崭新语言。
  - **编译期类型抹除 (Type Erasure)**：浏览器和 Node 运行时**只能执行 JavaScript**。TS 代码在打包时，所有的类型注解、`interface`、泛型都会被全部擦除。
  - **JS 决定运行时行为，TS 负责开发期静态检查**：所有运算符（如 `||`、`&&`）、数据类型（如数字、数组方法、对象赋值）、异步机制与内存表现，100% 由 JavaScript 规范决定。如果一段逻辑在 JS 层面合法但有隐患（如 `0 || 1` 在 TS 里也是合法的 `number`），TS 编译器无法阻止这种运行时逻辑 Bug。
- **Java / 后端对照视角 (Java Mapping)**：
  - 类似 **Lombok / 注解处理器与 Java 字节码**，或 **Java 泛型的类型擦除**。
  - 也类似 **C++ 与 C 语言**：学 C++ 绝不可能跳过 C 的内存布局、指针与基础运算。不理解 JavaScript 运行时的底层本质，TypeScript 就只是一具空有类型声明的空壳。
- **掌握标记**：[ ] 待主动回忆

---

### Q-TS-05: 为什么不能 `new FormData({...})`？TS 接口与 JS 原生对象构造函数有什么区别？
- **提问背景**：Java 开发者习惯通过 `new MyDTO(...)` 创建数据对象，在重置表单时顺手写了 `setFormData(new FormData({ ... }))`，导致编译或运行时异常。
- **核心解答 (Answer)**：
  1. **TS 接口在运行时被彻底擦除**：`interface FormData { ... }` 只是 TypeScript 编译期的静态类型约束，在生成的 JavaScript 运行时中根本不存在这个“类”，因此绝对不能用 `new` 去实例化它。
  2. **名字冲突与浏览器原生 API**：浏览器全局作用域中自带一个名为 `window.FormData` 的原生构造函数，它是用来构建 `multipart/form-data` 网络请求体（常用于文件上传）的。如果写 `new FormData(...)`，实际上会调用浏览器的原生 API，而不是你的业务 DTO。
  3. **TS/JS 中创建纯数据对象的方式**：直接使用**对象字面量（Object Literal）** `{ key: value }`。只要字面量的属性满足接口的结构契约（鸭子类型），它就是合法的 `FormData`。
- **Java / 后端对照视角 (Java Mapping)**：
  - 在 Java 中创建 POJO 必须依赖具体的 Class 构造器（如 `new UserDTO()`）。
  - 在 TypeScript 中，`interface` 类似 Java 的接口或 Record 契约，而 JS 对象字面量 `{ ... }` 类似隐式实现了该接口的匿名不可变数据结构。在 TS 中直接写 `{ key: value }`，零额外构造开销。
- **正反代码对照**：
  ```ts
  // ❌ 错误示范：误将 TS 接口当成 Java 类 new，实际调用了浏览器自带的原生网络表单类
  setFormData(new FormData({ username: '', email: '', role: 'DEVELOPER', agree: false }));

  // ✅ 正确示范：使用对象字面量直接赋值
  setFormData({
    username: '',
    email: '',
    role: 'DEVELOPER',
    agree: false,
  });
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-TS-06: 对象字面量中的 `[name]: value` 是什么意思？与 `name: value` 有何本质区别？
- **提问背景**：在编写通用表单处理函数 `handleChange` 时，初学者对状态更新中的中括号属性名 `[name]` 感到困惑。
- **核心解答 (Answer)**：
  1. **计算属性名 (Computed Property Names)**：这是 ES6 引入的语法。在对象字面量 `{}` 中，使用中括号包裹变量或表达式 `[expression]: value`，JS 引擎会先执行括号内的表达式，并将其计算结果作为对象的属性 Key。
  2. **静态属性名 vs 动态计算名**：
     - 如果写 `{ name: value }`：属性名是固定的字符串 `"name"`，不管用户在哪个输入框打字，更新的永远是对象的 `name` 属性。
     - 如果写 `{ [name]: value }`：`name` 是一个变量（取自 `e.target.name`）。当用户在用户名输入框打字时，`name` 的值是 `"username"`，等同于 `{ username: value }`；当在邮箱输入框打字时，等同于 `{ email: value }`。
  3. **架构价值**：通过一个通用函数直接完成所有字段的状态联动，彻底避免为每个输入框重复编写独立的更新函数或庞大的 `switch-case`。
- **Java / 后端对照视角 (Java Mapping)**：
  - `{ name: value }` 类似 Java POJO 固定的 `dto.setName(value)`。
  - `{ [name]: value }` 类似 Java 的 `map.put(keyVariable, value)`，或者通过反射根据字段名动态设值 `clazz.getDeclaredField(fieldName).set(dto, value)`。
- **极简对比示范**：
  ```ts
  const field = "username";

  // 静态属性：对象的 key 就是 "field" 字符串本身
  const objA = { field: "tom" }; 
  // 结果：{ field: "tom" } ❌ 并非我们想要的

  // 动态计算属性名：计算变量 field 的值作为 key
  const objB = { [field]: "tom" }; 
  // 结果：{ username: "tom" } ✅ 动态匹配
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-TS-07: `import { TOKEN_KEY }` 只是“引用一个常量”吗？会不会顺带执行被导入模块的代码？
- **提问背景**：`tokenStore.ts` 里为了用 `TOKEN_KEY`，从 TASK-007 的 `httpClient.ts` 导入了一个常量。既然只是一个字符串常量，为何感觉像“把整个 axios 配置都带进来了”？
- **核心解答 (Answer)**：
  - **JS/TS 的模块是“执行单元”，不是“声明清单”**：`import` 语句会在首次导入时**执行被导入模块的整个顶层代码**——包括 `axios.create(...)`、`interceptors.request.use(...)`、`interceptors.response.use(...)`。这些副作用只执行一次（模块级缓存），后续导入直接复用缓存结果。
  - **这意味着“导入 = 建立依赖 + 执行一次”**，所以把常量放在一个有副作用的模块里，会附带那份副作用（本任务恰好无害且正好需要：拦截器被注册上了）。
  - **工程建议**：把“纯常量/纯类型”拆到无副作用的独立文件（如 `constants.ts`），可避免无意中的副作用与循环依赖；本任务为了让你看出这个机制，故意把 `TOKEN_KEY` 与 `httpClient` 放在一起。
- **Java / 后端对照视角 (Java Mapping)**：
  - Java 的 `import` 是**纯编译期语法糖**，本身不加载任何类；类初始化（静态块）发生在**首次真正使用**该类时（懒加载）；
  - JS 的 `import` 则相当于“**声明依赖 同时触发一次模块求值**”，更接近 Java 里 `Class.forName(...)` 强制初始化的效果；
  - 所以 Java 里“多写几个 import 不花钱”的直觉，在 JS 里不成立——导入即执行，副作用是无法避免的。
- **极简代码示范 (Code Demo)**：
  ```ts
  // httpClient.ts（顶层有副作用：建实例 + 注册拦截器）
  export const httpClient = axios.create({ baseURL: '/api' });
  httpClient.interceptors.request.use(...);   // ← 模块被求值时就会执行
  export const TOKEN_KEY = 'token';

  // tokenStore.ts
  import { TOKEN_KEY } from '../TASK-007-http-layer/httpClient';
  // 后果：axios 实例与两个拦截器此刻也已被创建并注册（本任务恰好是我们想要的）
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-TS-08: JS 里的 `{ }` 到底有几种含义？为什么不能在对象字面量里写 `const` 声明？
- **提问背景**：在 `AuthProvider` 里把 `const [user, setUser] = useState(...)` 写进了返回给 Provider 的**对象字面量**里，得到 `TS1005: ':' expected`。
- **核心解答 (Answer)**：
  - **`{}` 的含义完全由它出现的位置决定**：
    | 出现位置 | 含义 | 能放什么 |
    | :--- | :--- | :--- |
    | **表达式位置**：`= { }`、`return {}`、`({})`、`f({})`、`() => ({})` | **对象字面量** | 只能写 `key: value` 属性（表达式）|
    | **语句位置**：函数体、`if/for` 的块、单独一行 `{ }` | **块语句（block）** | 可以写任意语句/声明 |
  - **语言分层规则：语句（statement）> 表达式（expression）** —— 表达式可以嵌在语句内部，反之绝不可以。“`const x = ...` 是声明语句”，因此无法出现在对象字面量（表达式）里。
  - **经典衍生坑**：`const f = () => { a: 1 };` 不会返回对象！箭头的 `{}` 在这里是**函数体（语句位置）**，于是 `a:` 被当成 **label（标签）**，函数实际返回 `undefined`。想返回对象必须包一层括号：`() => ({ a: 1 })`。
  - **React 的额外约束（Rules of Hooks）**：`useState` / `useEffect` 等 Hook 必须写在组件或自定义 Hook 的**函数体顶层**，不能放在条件、循环、回调、对象字面量内。原因是 React 靠“**每次渲染时 Hook 的调用顺序**”把 state 与各个 Hook 依次对应——位置一变，对应关系就乱。（这也是 ESLint 的 `react-hooks/rules-of-hooks` 规则在监控的事）
- **Java / 后端对照视角 (Java Mapping)**：
  - Java 同样禁止“在表达式里写语句”：`Map m = { put("a", 1); };` 直接编译失败；
  - 但 Java 的**类体**（字段声明 + 实例初始化块 + 构造器）确实是一个“可写声明/语句的区域”，容易让人把 JS 的 `{}` 类比成“可写代码的块”——而在 JS 里，它是否是块完全取决于位置；
  - 对照两边的 lambda：Java `() -> { ...; }` 的 `{}` 是**方法体（可写语句）**；JS 箭头函数 `() => {}` 也是**函数体**；但对象字面量 `{}` 则对应 Java 的 `Map.of(...)` / 匿名内部类的字段初始化——**它只装值，不装语句**。
- **极简代码示范 (Code Demo)**：
  ```tsx
  // ❌ 语句塞进表达式
  const value = { const [a] = useState(0); };

  // ✅ 先声明，再组装
  const [a] = useState(0);
  const value = { a };

  // ⚠️ 箭头函数返回对象的坑
  const wrong = () => { a: 1 };      // 返回 undefined（a: 是 label）
  const right = () => ({ a: 1 });    // 返回 { a: 1 }
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-TS-09: `const value: AuthContextValue = { user, initializing, login, logout }` 是什么意思？花括号里为什么不写“冒号”？
- **提问背景**：刚学会“对象字面量要写 `key: value`”，转头就看到花括号里只有几个名字，没有冒号，居然也能跑。
- **核心解答 (Answer)**：
  - **`{ user, initializing, login, logout }` 是 ES6 的“属性简写（Shorthand Property）”**，它严格等价于：
    ```ts
    { user: user, initializing: initializing, login: login, logout: logout }
    ```
    规则：**当“变量名”与“想要的属性名”完全一致时**，可以把 `name: name` 简写成 `name`。
  - **什么时候不能简写**：想改名就必须写全：`{ data: users }`（属性叫 `data`，值来自变量 `users`）——你在 TASK-005 的解构别名里已经用过这个反向技巧。
  - **`: AuthContextValue` 的作用有两层**（这行代码里最容易被低估的部分）：
    1. **结构校验（契约防线）**：TS 会检查右侧对象是否满足该类型——缺字段、多字段、字段类型不匹配都会报错。（你上一版 `value` 里只写了 `login`/`logout` 两个字段，编译器就会报缺 `user` 与 `initializing`。）
    2. **上下文类型推导**：如果把这个对象直接写在 JSX 里（或 value 里放内联箭头函数），函数参数的类型会**自动推导**，无需手写注解：
       ```tsx
       const value: AuthContextValue = {
         user, initializing,
         login: async (cmd) => { ... }, // cmd 自动推导为 LoginCommand
       };
       ```
  - **为什么先赋给具名变量、而不直接写进 JSX**：`<AuthContext.Provider value={ {user, ...} }>` 语法上合法（注意要加括号），但具名常量更易读、便于打断点/`console.log` 调试，也为将来用 `useMemo` 缓存留了位置。
  - **这里体现的是 TypeScript 的结构化类型（鸭子类型）**：这个对象里**没有 `implements AuthContextValue`、没有构造器**，只要“形状匹配”就算合法——与 Java 名义类型形成鲜明对比（详见 Q-TS-01）。
- **Java / 后端对照视角 (Java Mapping)**：
  | TS | Java |
  | :--- | :--- |
  | `const value: AuthContextValue = { ... }` | `AuthContextValue value = ...;`（**声明类型一样参与编译期校验**）|
  | 对象字面量 `{ ... }` | 必须 `new AuthContextValue(...)` / Builder / `Map.of(...)` |
  | 属性简写 `{ user }` | **无等价物**：`Map.of("user", user)` 必须把名字写两遍 |
  - **关键差异**：Java 的“变量声明类型”只负责名义校验，值必须先构造出来；TS 直接用心字面量 + 结构匹配，类型注解只是给编译器看的一份声明。
- **极简代码示范 (Code Demo)**：
  ```ts
  const user = 'tom';
  const age = 20;

  const a = { user, age };        // ✅ 简写 → { user: 'tom', age: 20 }
  const b = { user, age: 20 };    // ✅ 混用也可
  const c = { name: user };       // ✅ 改名：必须写全
  // const d = { user: u };       // ❌ u 未定义（顺便演示：这里右值必须是已存在的变量）
  ```
- **掌握标记**：[ ] 待主动回忆

### Q-TS-10: JS/TS 的函数调用是“值传递”还是“引用传递”？为什么 React 的 deps 比较等价于 Java 的 `==` 而不是 `equals()`？
- **提问背景**：写下 `useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)` 时冒出这个疑问；且常听说“JS 里对象是引用传递”，但 Java 里又说“Java 只有值传递”——两边到底谁说得对？
- **核心解答 (Answer)**：
  - **结论：两者一样，都只有一种：按值传递（pass-by-value）。**
    所谓“JS 对象是引用传递”是**误称**；准确名称是 **call-by-sharing（按共享传递）**：传递的是“引用的拷贝（堆地址的拷贝）”。
  - **判定“有没有引用传递”的决定性实验**：在函数里**重新赋值参数**，看调用方的变量变不变。
    ```js
    function reassignObject(o) { o = { name: '新对象' }; }   // 只是让局部名字指向别处
    function mutateObject(o)   { o.name = '被就地改了'; }   // 改的是堆上那个对象
    ```
    **实测输出（Node 实跑）**：
    | 实验 | 结果 | 说明 |
    | :--- | :--- | :--- |
    | `reassignObject(obj)` 后 | `obj` **没变** | ✅ 若是引用传递，这里必变 → **不存在引用传递** |
    | `mutateObject(obj)` 后 | `obj.name` **变了** | 两个名字指向同一个堆对象（共享）|
  - **底层：变量里到底存了什么**
    | 类型 | 变量里存的是 | 传参时拷贝的是 |
    | :--- | :--- | :--- |
    | 原始类型 `string/number/boolean/null/undefined/symbol/bigint` | **值本身** | 值 → 两边完全独立 |
    | 对象 / 数组 / 函数 | **堆地址（引用）** | 地址 → 两个名字指向同一个对象 |
    > 所以“传对象”并不是“把对象传进去”，而是“把门牌号抄了一份给对方”。对方按号找到同一间房。
  - **真正有引用传递的语言**：C++ 的 `T&`、C# 的 `ref`/`out`、Pascal 的 `var`。**Java 和 JS 都没有这种机制**。
  - **回到那行代码**：`searchInput: string`、`SEARCH_DEBOUNCE_MS: number` 全是原始类型 → 纯值拷贝，与传递语义无关（字符串还天然不可变）。
    真正受到影响的是**当 `T` 是对象时**：`useDebouncedValue<T>` 内部**完全有能力就地修改传进来的对象**，而 `T` 这个类型参数**不会给你任何保护**（泛型是编译期概念，运行时抹除）。要约束得用 `Readonly<T>`（且也只是编译期）。
  - **为什么这件事在 React 里是生死攸关的（三条连锁）**：
    1. **deps 的比较用的是 `Object.is` ≈ Java 的 `==`，不是 `equals()`**：
       ```js
       Object.is({ id: 1 }, { id: 1 })  // false  ← 内容相同 ≠ 引用相同（实测）
       Object.is(a, a)                  // true   ← 同一个引用才相等
       ```
       → 这就是“内联对象/函数/数组放进 deps 会导致 effect 每轮重跑”的根本原因。
    2. **“不可变更新”原则的底层根因**：
       ```tsx
       setTodos((prev) => { prev.push(item); return prev; }); // ❌ 同一个引用
       // → Object.is(新值, 旧值) === true → React 认为“状态没变” → 不重渲染！
       setTodos((prev) => [...prev, item]);                    // ✅ 新引用 → 重渲染
       ```
       上一代教程只告诉你“要不可变更新”，现在知道为什么了：**React 的变更检测建立在引用比较上。**
    3. **“Props 只读”只是契约，不是语言机制**：因为传的是地址拷贝，组件内部**完全能做到** `props.user.name = 'x'`（并影响父组件看到的同一个对象）。TS 只在编译期报错，**运行时无任何保护**。
  - **附带澄清：每轮渲染都是一个新闭包**（陈旧闭包的来源）
    函数组件每渲一次就是**重新执行一次函数**，本次执行捕获的是**这一次**的变量绑定（原始值快照 / 对象引用快照）。所以“哪一版的闭包还活着”直接由 deps 决定 —— 这与 Q-HK-01/Q-HK-09 是同一件事的两面。
- **Java / 后端对照视角 (Java Mapping)**：
  | JS / TS | Java |
  | :--- | :--- |
  | 原始类型传参 | 基本类型 `int/long`：值拷贝 |
  | 对象传参 | 对象引用（引用的**拷贝**）| 两侧行为完全同构 |
  | `o = {...}` 不影响调用方 | `void f(List l) { l = new ArrayList<>(); }` 不影响调用方 |
  | `o.name = 'x'` 影响调用方 | `l.add(...)` 影响调用方 |
  | `const` | `final`（**只锁引用重赋值，不锁对象内容**）|
  | `Object.is`（对象）| `==`（引用比较）；内容相等得用 `equals()` |
  | TS `Readonly<T>` | Guava `ImmutableList`（但一个是编译期约束、一个是运行时保证）|
  - 一个关键推论：**Java 世界里“用不可变对象做缓存 key / Map key”的习惯，直接对应 React 里“必须返回新引用”的纪律**：两者都是因为集合/变更检测依赖 `hashCode`/`==` 这类基于引用的判定。
- **极简代码示范 (Code Demo)**：
  ```tsx
  // ① 你那行调用：两个参数都是原始类型 → 纯值拷贝
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  // ② 当 T 是对象时：泛型不提供任何保护（这是“Props 只读靠约束”的原因）
  function useDebouncedValue<T>(value: T, delay = 300): T {
    // value.foo = 'x'  ❌ 编译器可能不报错（取决于 T），运行时一定能改到调用方的对象
    ...
  }
  useDebouncedValue<{ name: string }>(someObj, 300); // T 是对象 → 传的是地址拷贝

  // ③ 在 React 里，“引用”就是变更检测的依据
  const sameRef = todos;              // Object.is(sameRef, todos) === true
  const newRef  = [...todos];         // Object.is(newRef, todos)  === false → 触发重渲染
  ```
- **掌握口诀**：
  **“赋值看引用，比较看地址；重赋值不影响外面，改属性会穿透 —— 能重赋值穿透的才叫引用传递。”**
- **掌握标记**：[ ] 待主动回忆

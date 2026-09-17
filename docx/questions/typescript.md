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




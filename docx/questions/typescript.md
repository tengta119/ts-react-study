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

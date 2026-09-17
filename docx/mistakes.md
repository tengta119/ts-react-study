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



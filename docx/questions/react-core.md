# React 核心与组件专题问答库 (docx/questions/react-core.md)

> 归档范围：JSX 编译本质、组件设计模型、Props 只读入参、单向数据流与虚拟 DOM 原理。

---

### Q-RC-01: JSX 到底是什么？浏览器能直接运行 JSX 代码吗？
- **提问背景**：初学者常以为 JSX 就是把 HTML 字符串直接写在 JavaScript 代码里。
- **核心解答 (Answer)**：
  - **浏览器无法直接运行 JSX**。JSX 必须由编译工具（如 Vite / Babel / esbuild）在构建期编译为纯 JavaScript 的 `React.createElement` 或 `_jsx` 函数调用。
  - JSX 本质是**创建虚拟 DOM 节点（纯 JavaScript 对象）的语法糖**。
  - 组件调用返回的不是真实 DOM 树，而是由这些 JS 对象组成的虚拟 DOM 树（VDOM），React 再将其高效比对后挂载到浏览器真实 DOM。
- **Java / 后端对照视角 (Java Mapping)**：
  - JSX 类似后端模板引擎（Thymeleaf / JSP），但它不是简单的字符串拼接，而是在编译期直接生成严谨的抽象语法树（AST）与对象表达式。
- **掌握标记**：[ ] 待主动回忆

---

### Q-RC-02: Props 为什么必须是只读的（Readonly）？子组件如果直接改 props 会发生什么？
- **提问背景**：子组件想修改父组件传过来的某个变量，直觉想直接 `props.title = "新标题"`。
- **核心解答 (Answer)**：
  - **单向数据流（One-way Data Flow）**：React 严格遵循父到子的单向传递。如果子组件能就地修改父组件的数据，应用中的数据流向将变得错综复杂、极难追踪 debug。
  - **纯函数原则**：React 组件应该像纯函数一样，对于相同的 props 输入，永远产生相同的 UI 输出，不能产生破坏输入源的副作用。
  - 如果子组件需要改动该数据，正确做法是：父组件把更新状态的函数作为 props 传给子组件，子组件调用该回调函数通知父组件自行修改。
- **Java / 后端对照视角 (Java Mapping)**：
  - 类似 Java 方法的入参传参。虽然 Java 传对象引用时在方法内可以 `dto.setXxx()`，但这在面向对象高内聚设计中本身就是反模式（会产生不可预知的外部副作用）。在 React 中被严格禁止。
- **掌握标记**：[ ] 待主动回忆

---

### Q-RC-03: 为什么 React 列表渲染遍历必须指定 `key`？为什么不能拿 `index` 作为 key？
- **提问背景**：写 `list.map((item, index) => <div key={index}>)` 时，linter 经常发出警告。
- **核心解答 (Answer)**：
  - **DOM Diff 算法依赖**：React 通过 `key` 在重渲染时识别哪些元素被添加、删除、更新或重新排序。
  - 如果使用数组下标 `index` 作为 key：当数组头部插入一个新项或发生排序时，所有项的 `index` 全部错位。React 会误以为只是旧项的内容改变了，导致错误的 DOM 复用，引发输入框内容错乱、动画失效或严重的性能浪费。
  - **正确做法**：永远使用数据中具有唯一标识的业务 ID（如数据库主键 `id`、UUID）作为 key。
- **Java / 后端对照视角 (Java Mapping)**：
  - 类似 Java 中的 `equals()` 和 `hashCode()`。如果把对象在集合中的位置当作它的唯一身份标识，一旦集合发生重排，根据位置查找就会发生灾难性的识别错误。
- **掌握标记**：[ ] 待主动回忆

---

### Q-RC-04: React 事件类型 `React.ChangeEvent<HTMLInputElement | HTMLSelectElement>` 是什么意思？
- **提问背景**：在编写通用表单处理函数 `handleChange` 时，初学者对入参类型注解 `e: React.ChangeEvent<...>` 感到困惑。
- **核心解答 (Answer)**：
  1. **`React.ChangeEvent` (React 合成事件)**：React 为了抹平不同浏览器底层 DOM 事件的兼容性差异，在原生浏览器事件上包装了一层 `SyntheticEvent`。`ChangeEvent` 专门代表输入控件内容发生变动的事件。
  2. **泛型参数 `<T>` (事件源 DOM 节点约束)**：泛型参数指定了触发该事件的元素类型（即 `e.target` 是什么）。通过传入具体的 HTML 元素接口，TypeScript 能在代码中精准推导并自动补全 `e.target` 上的属性（如 `name`、`value` 等）。
  3. **联合类型 `|` (Union Type)**：因为同一个 `handleChange` 函数既绑定到了 `<input>` 输入框，又绑定到了 `<select>` 下拉菜单。为了让 TS 编译器允许这个函数同时作为两者的事件监听器，必须用联合类型表示“事件源可以是 Input 也可以是 Select”。
- **Java / 后端对照视角 (Java Mapping)**：
  - `ChangeEvent<T>` 类似 Spring 的泛型事件对象 `PayloadApplicationEvent<T>` 或 `EventListener<T extends Element>`。
  - `HTMLInputElement | HTMLSelectElement` 类似 Java 泛型中的公共父类抽象或联合限制。
  - 代码中的 `(e.target as HTMLInputElement).checked` 就如同 Java 中的强制类型转换 `((HTMLInputElement) target).isChecked()`。
- **极简代码拆解**：
  ```ts
  const handleChange = (
    // e: 这是一个受 React 统一管理的输入变动事件
    // 泛型表示：触发该事件的 DOM 元素要么是 <input>，要么是 <select>
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    // ...
  };
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-RC-05: 在 JSX 中如何优雅处理“空数据态 (Empty State)”？为什么 JSX 里不能直接写 `if-else`？
- **提问背景**：当后端返回空集合或前端搜索过滤结果为空时，初学者不知道如何在 JSX 中优雅呈现“未找到数据”的提示，并困惑为什么不能在 `{}` 里面写 `if-else`。
- **核心解答 (Answer)**：
  1. **语句 (Statement) vs 表达式 (Expression)**：
     - JSX 编译后会被转化为纯 JS 函数调用（如 `_jsx(...)`）。在 JSX 的插值花括号 `{}` 内部，**只能包含有返回值的“表达式”**；
     - `if-else`、`for` 是控制流“语句”，它们本身没有返回值，因此绝对不能直接写在 `{}` 内部；
     - 取而代之的是使用具有返回值的**三元运算符 (`condition ? A : B`)** 或 **逻辑与短路 (`condition && A`)**。
  2. **空数据态的标准设计范式**：
     - 在成功态内部，通过判断数组长度 `list.length === 0`：
       - 若为 0，返回友好的空状态卡片/占位图；
       - 若大于 0，返回映射渲染后的网格/列表。
- **Java / 后端对照视角 (Java Mapping)**：
  - 类似 Java 方法返回值：你不能把 `if (list.isEmpty()) { ... }` 作为一个参数传给另一个方法，但你可以传递三元表达式 `list.isEmpty() ? emptyView : tableView`。
- **经典代码示范**：
  ```tsx
  {!loading && !error && (
    filteredUsers.length === 0 ? (
      <div style={{ textAlign: 'center', color: '#9ca3af' }}>
        🔍 未找到匹配的用户
      </div>
    ) : (
      <div className="grid">
        {filteredUsers.map(u => <UserCard key={u.id} user={u} />)}
      </div>
    )
  )}
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-RC-06: 什么是 Props 和事件回调？父子组件通信的底层机制是什么？
- **提问背景**：刚开始做组件拆分时，初学者对“父传子”和“子传父”的数据流动机制缺乏直观认知。
- **核心解答 (Answer)**：
  1. **Props (Properties / 属性)**：
     - **父传子**的唯一通道。父组件在 JSX 中以类似 HTML 属性的方式传递数据；
     - 本质是**子组件函数唯一的只读对象入参**；
     - **不可变原则**：子组件严禁直接修改 Props 中的任何属性。
  2. **事件回调 (Event Callback)**：
     - **子传父**的标准范式。在 JavaScript 中函数是“一等公民”，父组件可以把一个可执行的函数作为 Prop 传递给子组件；
     - 当子组件内部触发原生事件（如用户在 input 打字、点击按钮）时，子组件不直接修改数据，而是**调用父组件传下来的函数**（如 `props.onKeywordChange(newVal)`）；
     - 控制权跳回父组件，父组件调用自己的 `setState` 更新数据，驱动组件树重新渲染。
  3. **总结一句话法则**：
     > **“Props 单向向下流动（Props Down），事件通过回调向上通知（Events Up）。”**
- **Java / 后端对照视角 (Java Mapping)**：
  - **Props** ⇄ Java 方法的 `final DTO` 只读入参；
  - **事件回调** ⇄ **观察者模式 (Observer Pattern) / 监听器接口 (Listener)** 或函数式接口 `Consumer<T>`。
- **正反代码对照**：
  ```tsx
  // 1. 父组件：拥有状态，把状态作为数据向下传，把修改函数作为回调向下传
  function Parent() {
    const [name, setName] = useState("张三");
    return <Child name={name} onNameChange={(val) => setName(val)} />;
  }

  // 2. 子组件：接收只读 Props，触发事件时调用父组件的回调函数
  interface ChildProps {
    name: string;
    onNameChange: (val: string) => void;
  }
  function Child(props: ChildProps) {
    // ❌ 严禁直接改 props: props.name = "李四";
    // ✅ 正确做法：调用回调通知父组件去改
    return <input value={props.name} onChange={(e) => props.onNameChange(e.target.value)} />;
  }
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-RC-07: 为什么可以直接写 `onKeywordChange={setKeyword}`？它实际是一个函数吗？
- **提问背景**：初学者在看到父组件传参 `<UserSearchBar onKeywordChange={setKeyword} />` 时，不确定 `onKeywordChange` 到底是不是函数，以及为什么不需要写括号 `()`。
- **核心解答 (Answer)**：
  1. **它 100% 是一个函数**：
     - 在 TypeScript 接口定义中：`onKeywordChange: (value: string) => void` 明确规定它是一个入参为 `string`、无返回值的函数；
     - `const [keyword, setKeyword] = useState('')` 中，`setKeyword` 本身就是一个接收新值的标准 Setter 函数。
  2. **为什么不需要写括号？**：
     - 如果写成 `onKeywordChange={setKeyword()}`，会在**父组件渲染时立刻执行该函数**，导致死循环或逻辑错误；
     - 不写括号 `onKeywordChange={setKeyword}` 是传递**函数的引用（Function Reference）**；
     - 它与箭头函数 `onKeywordChange={(val) => setKeyword(val)}` 完全等价，直接传引用更简洁。
- **Java / 后端对照视角 (Java Mapping)**：
  - 这完全等价于 **Java 8 的“方法引用”（Method Reference）**：
    ```java
    // 显式 Lambda 表达式：
    component.setOnKeywordChange(val -> this.setKeyword(val));

    // 方法引用（简写）：
    component.setOnKeywordChange(this::setKeyword);
    ```
  - JavaScript 中函数是一等公民，函数名本身就是指针引用，直接作为参数传递。
- **掌握标记**：[ ] 待主动回忆

---

### Q-RC-08: 为什么在 Props 接口中定义了属性，组件内依然报 TS2304: Cannot find name？
- **提问背景**：在 `interface Props` 里添加了字段或回调（如 `onDelete`），并在 JSX 中直接调用，但 TypeScript 报找不到该名称。
- **核心解答 (Answer)**：
  1. **接口声明 ≠ 变量声明**：在 `interface UserCardProps { onDelete: ... }` 中声明只相当于定义了图纸契约，它不会凭空在函数内部创建同名局部变量。
  2. **对象解构赋值漏写**：
     - 函数组件接收的是一个统一的 `props` 对象：`function UserCard(props: UserCardProps)`；
     - 现代 React 习惯使用 ES6 对象解构：`({ user, onDelete }) => { ... }`；
     - 如果解构列表中只写了 `({ user })`，相当于只把 `props.user` 提取为了局部变量，而 `onDelete` 并没有被解构出来，因此直接访问 `onDelete` 会报变量未定义。
  3. **修复方案**：在组件入参解构的花括号中补齐该属性名：`({ user, onDelete }) =>`。
- **Java / 后端对照视角 (Java Mapping)**：
  - 类似 Java 方法接收一个入参 `public void render(Props props)`；
  - 你在方法体里直接写 `onDelete()` 肯定找不到符号（Cannot find symbol），你必须显式调用 `props.getOnDelete()` 或者声明局部变量 `var onDelete = props.getOnDelete()`。
- **正反代码对照**：
  ```tsx
  // ❌ 错误示范：入参只解构了 user，漏掉了 onDelete
  export const UserCard: React.FC<UserCardProps> = ({ user }) => {
    return <button onClick={() => onDelete(user.id)}>删除</button>; // 报错 TS2304!
  };

  // ✅ 正确示范：在形参解构中补齐 onDelete
  export const UserCard: React.FC<UserCardProps> = ({ user, onDelete }) => {
    return <button onClick={() => onDelete(user.id)}>删除</button>; // 正常访问
  };
  ```
- **掌握标记**：[ ] 待主动回忆






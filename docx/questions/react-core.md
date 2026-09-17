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



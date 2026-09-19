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

---

### Q-RC-09: 为什么 `onClick={() => onPageChange(page + 1)}` 不能写成 `onClick={onPageChange(page + 1)}`？
- **提问背景**：给分页按钮传回调时，觉得“箭头函数包一层”是多此一举，想直接把函数调用写进 JSX 属性。
- **核心解答 (Answer)**：
  - **JSX 里 `{ ... }` 是“现在就求值”，不是“待会儿再执行”**：
    `onClick={onPageChange(page + 1)}` 会在**渲染阶段立即调用** `onPageChange`，而 `onClick` 拿到的是该函数的**返回值**（这里是 `undefined`）→ 最终变成 `onClick={undefined}` → 按钮点了没反应，而页面一渲染就自己跳页了。
  - **更危险的副作用**：`onPageChange` 内部会 `setState`，这等于**在渲染过程中又去更新状态**，React 会抛出“Cannot update a component while rendering a different component”警告，严重时直接死循环。
  - **正确形式只有两种**：
    1. `onClick={() => onPageChange(page + 1)}` —— 交出一个**函数**，点击时才求值（推荐）；
    2. `onClick={onPageChange}` —— 语法合法且不报错，但事件处理器会把**事件对象**当作第一个参数传进去，相当于 `onPageChange(MouseEvent)` → 页码变成事件对象，请求变成 `page=[object Object]`。
  - **为什么项目里 `onClick={onPageChange}` 也没报类型错？** 因为 `onClick` 期望的是 `(event: MouseEvent) => void`，而你传的是 `(nextPage: number) => void`，**参数类型不兼容**——但这属于 `strictFunctionTypes` 的检查范围，**本项目未开启 `strict`，所以 TS 默默放过了**。（又一处“保险丝被拔掉”的实例）
  - **通用规律（这类错误远不止 `onClick`）**：
    | 错误 | 正确 |
    | :--- | :--- |
    | `setTimeout(fn(), 1000)` | `setTimeout(fn, 1000)` |
    | `arr.map(fn())` | `arr.map(fn)` |
    | `useEffect(fetchData(), [])` | `useEffect(() => { fetchData(); }, [])` |
    口诀：**“括号即调用，引用才传递”**。
  - **额外好处**：参数在点击那一刻才求值，拿到的是**当前这帧渲染快照中的 `page`**——正好与按钮上显示的页码一致（呼应 State 快照机制）。
- **Java / 后端对照视角 (Java Mapping)**：
  - `button.addActionListener(this::handleClick)` ⇄ `onClick={() => onPageChange(page + 1)}`：传递的是**函数对象（行为）**，将来才执行；
  - `button.addActionListener(handleClick())` ⇄ `onClick={onPageChange(page + 1)}`：当场执行并把返回值交出去——**在 Java 里这连编译都过不去**（`handleClick()` 返回 `void`，与 `ActionListener` 类型不符），而 JS 完全不拦，`undefined` 也是一个“合法值”；
  - 这正是“函数是一等公民 + 编译期不校验参数兼容性”的代价：**Java 用类型系统拦住了这个错误，JS 只能靠开发者自觉**。
- **极简代码示范 (Code Demo)**：
  ```tsx
  // ❌ 渲染阶段立即执行，onClick 变成 undefined
  <button onClick={onPageChange(page + 1)}>下一页</button>

  // ⚠️ 合法但参数语义错：onPageChange 会收到 MouseEvent
  <button onClick={onPageChange}>下一页</button>

  // ✅ 交出函数，点击时才执行
  <button onClick={() => onPageChange(page + 1)}>下一页</button>

  // ✅ 无需传参时可以直传引用（此时传入 event 也不影响语义）
  <button onClick={reload}>重新加载</button>
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-RC-10: `React.FC<{ children: React.ReactNode }> = ({ children })` 这行到底是什么意思？
- **提问背景**：写 `AuthProvider` 时看到这行声明，每个符号都认识、但合起来不知道在说啥；尤其不理解为什么尖括号里可以写一个“对象”。
- **核心解答 (Answer)**：把它拆成四段看就清楚了：
  ```tsx
  export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => { ... };
  //                    └①┘└②┘           └③ 泛型实参：props 的形状 ┘  └④ 解构形参 ┘
  ```
  1. **`React.FC`** = **Function Component** 的类型别名。`@types/react` 里的定义是：
     ```ts
     interface FunctionComponent<P = {}> {
       (props: P): ReactNode | Promise<ReactNode>;   // ← 带“调用签名”的接口
       propTypes?: any; displayName?: string; ...
     }
     type FC<P = {}> = FunctionComponent<P>;
     ```
     也就是说：**它是一个“函数类型”的描述**——输入 props，输出可渲染内容。
  2. **`<{ children: React.ReactNode }>`** = 给这个泛型传入实参，即**声明这个组件的 Props 长什么样**。这里用的是**内联匿名对象类型**（structurally typed）：它规定“我只接受一个名为 `children` 的属性”。
  3. **`React.ReactNode`** = “所有能被 React 渲染的东西”的联合类型（JSX 元素、字符串、数字、布尔、`null`/`undefined`、数组、Fragment 等）。**它不是 `JSX.Element`**，比后者宽得多。
  4. **`({ children }) =>`** = 函数形参是 **props 对象**，用 ES6 解构只取出 `children`。
     ⚠️ 这也解释了你之前踩过的 TS2304：**类型里声明了属性 ≠ 函数体内存在同名变量**，必须解构出来。
  - **`children` 是个“特殊 prop”**：JSX 标签之间的内容会自动作为 `children` 传进来：`<AuthProvider>内容</AuthProvider>` ⇒ `props.children === '内容'`。自 React 18 起，`FC` **不再自动**给 props 加上 `children?: ReactNode`，所以必须像这样显式声明。
  - **也可以不用 `FC`（现在社区反而更推荐）**：`FC` 早期版本会自动注入 `children`（现已移除）、不支持泛型组件、对 `defaultProps` 推导也不友好。等价写法：
    ```tsx
    export function AuthProvider({ children }: { children: React.ReactNode }) { ... }
    export const AuthProvider = ({ children }: AuthProviderProps) => { ... };  // 单独定义 Props 接口
    ```
    本项目为与 TASK-007 风格统一而使用 `React.FC`，两种写法在运行上**完全一样**。
- **Java / 后端对照视角 (Java Mapping)**：
  | React / TS | Java |
  | :--- | :--- |
  | `React.FC<Props>` | **函数式接口**，如 `Function<Props, ReactNode>`（有单一抽象方法：`(props) => 视图`） |
  | `<{ children: React.ReactNode }>` 泛型实参 | `Comparable<T>` 的 `T`；但 TS 可以传**匿名内联结构类型**，Java 必须先生成 interface |
  | `({ children })` 解构 | 方法体内写 `var children = props.getChildren();` |
  | 类型运行时不存在 | **类型擦除**：JS 里组件就是一个普通函数，`React.FC` 不产生任何运行时代码 |
- **极简代码示范 (Code Demo)**：
  ```tsx
  // 三种等价写法
  const A: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
  const B = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const C = (props: { children: React.ReactNode }) => <div>{props.children}</div>; // 不解构就得写 props.xxx
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-RC-11: `<AuthContext.Provider value={value}>{children}</AuthContext.Provider>` 这行到底在干什么？为什么必须把 `children` 再渲染出来？
- **提问背景**：知道它“大概是把值传下去”，但不明白三件事：① `Provider` 是什么东西（没在 DOM 里看到它）？② 为什么要把 `children` 原样渲染出来（不写会怎样）？③ `value` 是怎么被里面的组件读到的？
- **核心解答 (Answer)**：
  - **分工**：`createContext(null)` 只创建了一个“频道/信封”，它**自身不存数据**；`<XxxContext.Provider value={...}>` 才是“**把值放进这个频道并向下广播**”的那一层。
  - **它是“隐形组件”**：`Provider` 不是 HTML 标签，而是 React 内置的特殊组件（编译后是一个带 `$$typeof` 标记的对象）。React 渲染到它时会走一条特殊分支：**不创建 DOM 节点**，而是把 `value` 压入该 Context 的内部“值栈”，然后继续渲染它的子树。所以在页面上它“看不见”，但能在 React DevTools 的组件树里看到 `AuthContext.Provider` 这个节点。
  - **读取机制**：子树里任意组件调用 `useContext(AuthContext)`（我们封装成了 `useAuth()`），React 会**就进向上查找最近的 Provider**，取它当前的 `value`。=> 等价于心智：“**作用域内的环境变量**”。
  - **为什么必须把 `children` 渲染出来**：Provider 的职责只是“提供作用域”，**它完全不知道它包的是什么内容**——内容由调用方通过 `children` 传入（这就是控制反转）。把 `{children}` 渲染出来 = “打开作用域 → 渲染子树”。
    - 漏写 `{children}`：子树根本不会被渲染 → **白屏**（但 `useAuth` 也不报错，因为消费方根本没挂载，排查时很迷惑）；
    - 写成 `return children`（不返回 Provider）：子树渲染了，但**作用域没生效**，里面 `useAuth()` 拿到默认值 `null` → 抛“useAuth 必须在 <AuthProvider> 内部使用”。这两种现面都能反向帮你定位问题。
  - **`value` 变化会重渲染所有消费方**：React 用 `Object.is` 比较新旧 `value`。我们的 `value` 是一个**每次渲染新建的对象**，因此 Provider 每次重渲染都会让所有 `useAuth()` 的组件跟着重渲染（即使它们用到的字段没变）。当前规模无需优化，但要知道这个事实（优化手段：`useMemo`；或把状态拆成多个 Context）。
  - **没有 Provider 时生什么**：`createContext(null)` 的默认值就是 `null`，所以 `useAuth()` 里的 `if (ctx === null) throw ...` 会报出一个**直奔根因**的错。若默认值写成一个空对象，就会退化成“到处 undefined”的隐形 Bug——所以“默认值给 null + 消费端主动报错”是一个刻意设计。
- **Java / 后端对照视角 (Java Mapping)**：
  - **最贴切的类比：`try-with-resources` 式的作用域**
    ```java
    try (var scope = AuthScope.open(value)) {   // ⇄ <AuthContext.Provider value={value}>
        renderSubtree();                          // ⇄ {children}
    }                                             // ⇄ </AuthContext.Provider>（离开子树时恢复上一层）
    ```
    React 内部就是“值栈”的 push/pop，与 `ThreadLocal` / `SecurityContextHolder` 的进入-退出语义**完全同构**；
  - `useContext(...)` ⇄ `SecurityContextHolder.getContext()`（从当前作用域取出主体）；
  - `children` 透传 ⇄ **模板方法模式**：框架（Provider）定义执行骨架，子步骤（子树）由调用方作为回调/`Supplier<ReactNode>` 注入；
  - 缺少 Provider 就调 `useContext` ⇄ 在请求线程之外调 `RequestContextHolder.getRequestAttributes()` 拿到 `null`。
- **极简代码示范 (Code Demo)**：
  ```tsx
  // 编译视角：Provider 只是一个带 value 的 JSX 元素，children 只是它的一个 prop
  <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  // 等价于
  <AuthContext.Provider value={value} children={children} />

  // 消费端：不关心值从哪里来，只“就近取用”
  function NavBar() {
    const { user } = useAuth();      // 内部就是 useContext(AuthContext)
    return <span>{user ? user.name : '未登录'}</span>;
  }
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-RC-12: 表单提交/输入事件到底该用什么类型？`React.FormEvent` 为什么在 React 19 类型里被弃用？
- **提问背景**：按旧教程写成 `(e: React.FormEvent<HTMLFormElement>)`，编辑器报 `TS6385: FormEvent is deprecated`，提示“You probably meant to use ChangeEvent, InputEvent, SubmitEvent, or just SyntheticEvent instead”。
- **核心解答 (Answer)**：
  - **弃用理由（官方原话）**：*“FormEvent doesn't actually exist.”* —— `FormEvent` **不是 DOM 规范里真实存在的事件接口**，它只是 React 早期为了描述“表单相关事件”而自造的一个笼统类型。React 19 的 `@types/react` 开始让类型**与真实 DOM 事件名对齐**，于是它被标记为 `@deprecated`。
  - **正确做法：按“事件名”选类型（本地 `node_modules/@types/react/index.d.ts` 为准）**：
    | JSX 属性 | 期望类型 | DOM 规范里的事件 |
    | :--- | :--- | :--- |
    | `onSubmit` | `React.SubmitEvent<HTMLFormElement>` | `SubmitEvent` |
    | `onChange` | `React.ChangeEvent<HTMLInputElement>` | `Event`（React 做了封装）|
    | `onInput` | `React.InputEvent<HTMLInputElement>` | `InputEvent` |
    | `onClick` | `React.MouseEvent<HTMLButtonElement>` | `MouseEvent` |
    | `onKeyDown` | `React.KeyboardEvent<HTMLInputElement>` | `KeyboardEvent` |
    | `onFocus` / `onBlur` | `React.FocusEvent<HTMLInputElement>` | `FocusEvent` |
    | 不确定时的兜底 | `React.SyntheticEvent<T>` | —— |
  - **本地类型定义里的 `SubmitEvent`**（可直接 Ctrl+点击 看到）：
    ```ts
    interface SubmitEvent<T = Element> extends SyntheticEvent<T, NativeSubmitEvent> {
      submitter: HTMLElement | null;
      // SubmitEvents are always targetted at HTMLFormElements.
      target: EventTarget & HTMLFormElement;   // ← target 已经是表单元素，无需断言
    }
    type SubmitEventHandler<T = Element> = EventHandler<SubmitEvent<T>>;
    ```
    另外 `FormHTMLAttributes` 里写的是 `onSubmit?: SubmitEventHandler<T> | undefined;` —— **这就是编译器报错里那个“目标类型”的来源**。
  - **三种“自己查”的方法**（比背下来更可靠）：
    1. 把鼠标悬停在 JSX 的 `onSubmit` 上，IDE 直接显示期望类型；
    2. `Ctrl + 点击` 跳进 `index.d.ts` —— **它就是前端的 Javadoc**；
    3. 读 TS 报错里的 `... is not assignable to type 'SubmitEventHandler<HTMLFormElement>'` —— **编译器已经把你该用的类型写在报错里了**。
  - **工程素养提醒**：博客 / 教程 / AI 的回答都可能滞后于类型定义。看到 `TS6385` 或 `@deprecated`，**以本地类型定义与官方文档为准**；也不要用 `@ts-ignore` 把弃用提示压掉（那样只会把技术债积到未来）。
- **Java / 后端对照视角 (Java Mapping)**：
  - `TS6385 + @deprecated 注释` ⇄ Java 的 **`@Deprecated` 注解 + Javadoc 的 `@deprecated` 标签**：两者都是“还能用，但不该再用”的信号，且都会带上“请改用 X”的说明；
  - **读 `index.d.ts`** ⇄ **读 Spring 源码 / Javadoc**，而不是只读二手博客；
  - **类型必须映射真实存在的规范对象**：`FormEvent` 就像你在 Java 里拍脑袋造一个规范里不存在的 `HttpFormException` 去继承 `Exception`——能用，但会误导所有人对“标准体系”的理解（对比：Java 有 `FileNotFoundException`、`SocketTimeoutException` 这类**与真实场景一一对应**的标准异常）。
- **极简代码示范 (Code Demo)**：
  ```tsx
  // ❌ React 18 及以前的旧写法（现在会得 TS6385 弃用提示）
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); };

  // ✅ React 19：用真实事件名对应的类型
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => { e.preventDefault(); };

  // ✅ 输入框变更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setValue(e.target.value); };
  ```
- **掌握标记**：[ ] 待主动回忆

---

### Q-RC-13: `<AuthProvider>` 所在的组件（AuthApp）为什么不能自己用 `useAuth()`？
- **提问背景**：想在 `AuthApp` 的导航栏里根据登录态显示“当前用户 / 退出登录”入口，于是直接在本组件里调 `useAuth()` —— 结果要么拿到 `null`，要么直接抛“useAuth 必须在 <AuthProvider> 内部使用”。
- **核心解答 (Answer)**：
  - **Context 的作用域只向下（子树），不包括“建立它的那个组件自身”**。
    ```tsx
    export const AuthApp = () => {
      const { user } = useAuth();        // ❌ 此时 Provider 还没渲染，本组件不在其子树里
      return (
        <AuthProvider>                    // ← Provider 从它返回的这份 JSX 才开始生效
          <BrowserRouter>…</BrowserRouter>
        </AuthProvider>
      );
    };
    ```
    组件**先执行**（求值 JSX），Provider **后才渲染**；所以“自己包我自己”在逻辑上不可能成立。
  - **正确做法（三种）**：
    1. **抽出子组件**（推荐）：把需要读 context 的部分（如 `<AppHeader/>`）拆成独立组件，放到 Provider **内部**渲染；
    2. **把 Provider 提升到更外层**：如放到 `main.tsx` 里包住 `<App/>`，那么 `App` 及其所有子组件都能消费；
    3. **把“状态”与“展示”分层**：`AuthApp` 只管装配 Provider + Router，展示层一律是子组件。
  - **普遍规律**：不仅是 Context——**任何“提供者”都只能影响它的后代**。同理：`<BrowserRouter>` 所在的组件自己不能用 `useNavigate`；`<ThemeProvider>` 所在的组件自己不能用 `useTheme`。
- **Java / 后端对照视角 (Java Mapping)**：
  - 同构于“**定义 `@Bean` 的 `@Configuration` 类自己不能直接注入那个 Bean**”（生命周期顺序上它还未就绪）：
    ```java
    @Configuration
    class AuthConfig {
      @Autowired CurrentUser user;                 // ❌ 循环/时机问题
      @Bean AuthScope authScope() { return new AuthScope(); }   // ← 作用域从这里才开始存在
    }
    ```
  - 也像在**同一个方法里**先 `ThreadLocal.set(x)` 再读 —— 顺序/作用域不对；
  - 心智模型：**Provider = 作用域的起点（类似事务/请求上下文的开启点），“开户的人”自己不在这个账户里。**
- **极简代码示范 (Code Demo)**：
  ```tsx
  // ❌ 本组件既当“提供者”又当“消费者”
  const AuthApp = () => {
    const { user } = useAuth();
    return <AuthProvider><Header user={user} /></AuthProvider>;
  };

  // ✅ 职责分开：外面只管装配，里面负责消费
  const AuthApp = () => (
    <AuthProvider>
      <BrowserRouter>
        <AppHeader />   {/* 在 Provider 子树内部 → 可以 useAuth() */}
        <Routes>…</Routes>
      </BrowserRouter>
    </AuthProvider>
  );
  ```
- **掌握标记**：[ ] 待主动回忆






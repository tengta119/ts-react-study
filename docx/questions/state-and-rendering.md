# 状态与渲染机制专题问答库 (docx/questions/state-and-rendering.md)

> 归档范围：State 响应式心智模型、不可变数据原则 (Immutability)、渲染快照机制、浅比较与重渲染调度。

---

### Q-SR-01: 为什么调用 `setCount(count + 1)` 之后，下一行代码打印 `count` 还是旧值？
- **提问背景**：Java 开发者直觉认为 `setter` 调用后变量内部值立刻发生改变。
- **核心解答 (Answer)**：
  - **快照心智模型 (Snapshot)**：组件的每一次执行都对应于某一次渲染的“快照”。在该次执行的作用域中，`count` 实际上是一个不可变的常量。
  - `setCount(1)` 的真正含义是：向 React 发出一条指令——“请为下一次渲染调度排期，并将下一次渲染的 count 设为 1”。
  - 当前正在运行的代码块里，`count` 不会被中途突变。
- **Java / 后端对照视角 (Java Mapping)**：
  - 类似事务提交或者异步任务队列。你调用的是 `messageQueue.send(newUpdateTask())`，而不是就地同步修改本地变量。
- **掌握标记**：[ ] 待主动回忆

---

### Q-SR-02: React 为什么强烈要求状态不可变（Immutability）？直接 `user.name = "Tom"` 会怎样？
- **提问背景**：习惯了 Java 的 `user.setName("Tom")`，在 React 中直接改对象属性却发现页面根本不刷新。
- **核心解答 (Answer)**：
  - **底层浅比较机制**：React 依靠 `Object.is(oldState, newState)` 来判断组件状态是否发生改变。
  - 如果原地修改同一个对象的属性，对象的内存地址（引用指针）完全没变。React 比较 `oldState === newState` 结果为 `true`，直接判定“数据未变更”，跳过本次重渲染！
  - **正确做法**：永远生成一个新对象或新数组的引用（如使用对象展开运算符 `{ ...user, name: 'Tom' }`），让 React 感知到内存引用的改变。
- **Java / 后端对照视角 (Java Mapping)**：
  - 类似 Java 中的不可变类设计（如 `String`、`BigDecimal`、Java 14 的 `record`）。任何“修改”操作本质上都是创建一个包含新数据的新实例返回。
- **掌握标记**：[ ] 待主动回忆

---

### Q-SR-03: 如果在一个事件处理函数中连续写两次 `setCount(count + 1)`，最终数字会加 1 还是加 2？
- **提问背景**：初学者在同一个点击事件中多次调用更新函数，发现并未累加。
- **核心解答 (Answer)**：
  - 最终只会 **加 1**！
  - 原因：在当前点击事件发生的这一帧渲染中，`count` 的值是固定的（例如为 0）。代码实际上执行的是：
    `setCount(0 + 1); setCount(0 + 1);`。两次都是把下一次渲染的目标值设置为 1。
  - **解决方案（函数式更新）**：如果下一次更新依赖于前一次更新的最新结果，应传入 updater 回调函数：
    `setCount(prev => prev + 1); setCount(prev => prev + 1);`，此时 React 会按队列链式计算，最终加 2。
- **掌握标记**：[ ] 待主动回忆

---

### Q-SR-04: 如何理解 React 的“纯渲染逻辑”、“常量快照”、“界面重渲染”与“更新意图”？
- **提问背景**：从 Java 的“就地修改对象成员变量”转向 React 声明式 UI 时，容易对组件生命期与状态更新链路产生困惑。
- **核心解答 (Answer)**：
  1. **纯渲染逻辑 (Pure Render Logic)**：组件函数本质是一个纯数学映射：`UI = f(state, props)`。给它什么入参和状态，它就返回对应的虚拟 DOM 结构（JSX），执行时不产生突变副作用。
  2. **常量快照 (Snapshot)**：组件每一次被调用执行时，`const [count] = useState(...)` 中的 `count` 是在当前执行栈作用域中锁死的常量值。它记录的是“这一帧画面”的数据状态。
  3. **更新意图 (Update Intent)**：`setCount(nextVal)` 不是在当前栈帧内修改 `count`，而是向 React 调度器派发一个更新任务（类似提交一个 Job/Event），告诉 React：“在下一次渲染这一组件时，请把状态设为 `nextVal`”。
  4. **界面重渲染 (Re-render)**：React 调度器接收到更新意图后，重新调用一次该组件函数生成新的虚拟 DOM 树，与上一帧进行 Diff 比对，只将发生变化的部分同步更新至真实 DOM。
- **Java / 后端对照视角 (Java Mapping)**：
  - 相当于 Spring MVC / Thymeleaf 模板渲染逻辑：
    - 组件函数 = 带有入参的 Controller 渲染方法；
    - 常量快照 = 方法栈局部变量 `final int count = 0`；
    - 直接改变量无效 = 在方法返回 HTML 之后偷偷改栈内变量毫无意义；
    - `setCount` 与重渲染 = 客户端提交新请求触发 Controller 方法带着新数据再次执行一遍，返回新视图。
- **掌握标记**：[ ] 待主动回忆

---

### Q-SR-05: Vue 与 React 在响应式与渲染机制上也是同样的逻辑吗？
- **提问背景**：Vue 可以直接 `count.value++` 界面就发生改变，而 React 必须调用 `setCount` 且强调快照与不可变。两者底层逻辑有何本质不同？
- **核心解答 (Answer)**：
  - **根本不同，两者的哲学相反**：
    - **Vue：响应式代理拦截 (Proxy / Getter & Setter)**。`<script setup>` 逻辑**只初始化执行一次**。变量是长期存活的响应式代理对象，属性被修改时 setter 自动拦截并精准通知依赖更新。没有“每一帧常量快照”的概念，允许直接突变（Mutable）。
    - **React：不可变数据 + 函数反复重跑 (Re-render & VDOM Diff)**。没有属性拦截魔法。状态更新时，整个函数组件被从头到尾**重新调用一次**。每一次调用都产生新的作用域快照（Immutable Snapshot）。
- **Java / 后端对照视角 (Java Mapping)**：
  - **Vue 类似于 Spring AOP 动态代理 / Hibernate 脏检查**：调用 `user.setName("Tom")`，表面是直接改属性，实际被 CGLIB/Proxy 拦截并记录脏状态，自动触发同步。
  - **React 类似于 Java 函数式编程 / Record 不可变流水线 / Event Sourcing**：所有数据都是不可变的（`final`），想要新状态必须显式创建新实例并提交 Event，促使整条流水线重新计算。
- **掌握标记**：[ ] 待主动回忆



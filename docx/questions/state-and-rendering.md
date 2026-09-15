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

# React Hooks 专题问答库 (docx/questions/hooks.md)

> 归档范围：`useState`, `useEffect` 依赖项与生命周期心智、`useRef` 跨渲染持久化、自定义 Hook 及常见闭包陷阱。

---

### Q-HK-01: `useEffect` 到底什么时候执行？它的依赖项数组 (deps) 到底起什么作用？
- **提问背景**：常常搞不清楚 `useEffect` 传入 `[]`、不传依赖项或传入具体变量时的执行时机，容易写出无限死循环。
- **核心解答 (Answer)**：
  - `useEffect` 是在浏览器完成当前渲染（真实 DOM 绘制上屏）后**异步执行**的副作用函数。
  - **依赖项数组的本质**：React 会通过浅比较（`Object.is`）判断本次渲染与上次渲染中，依赖项数组里的每一个值是否发生了变化。
    - **不传依赖项**：每次组件重渲染后必定执行一次（如果在里面无条件 `setState`，会导致“渲染→执行Effect→触发重渲染→再执行Effect”的无限死循环！）；
    - **传空数组 `[]`**：只在组件首次挂载（Mount）上屏后执行一次；
    - **传具体变量 `[id, status]`**：仅在组件挂载后以及 `id` 或 `status` 改变后的下一次渲染后执行。
- **Java / 后端对照视角 (Java Mapping)**：
  - 不要把 `useEffect` 简单当成生命周期钩子（如 Spring 的 `@PostConstruct`）。它更像是一个**响应式数据变更监听器（Event Listener / Watcher）**，核心作用是让副作用状态与组件当前渲染的 props / state 保持同步。
- **掌握标记**：[ ] 待主动回忆

---

### Q-HK-02: `useRef` 和普通局部变量、`useState` 有什么本质异同？
- **提问背景**：想在多次渲染间暂存一个变量（例如定时器 timerId），不知道该选哪一个。
- **核心解答 (Answer)**：
  - **普通局部变量 (`let x`)**：每次组件重渲染函数重新执行时，都会被重新初始化，无法持久保存。
  - **`useState`**：跨渲染保留值，但修改它（调用 `setX`）会**触发组件重新渲染**。
  - **`useRef`**：跨渲染保留值（返回一个稳定的 `{ current: value }` 容器对象），但修改 `ref.current` **绝对不会触发组件重新渲染**。
  - **常见场景**：
    1. 获取原生 DOM 节点（如输入框聚焦 `inputRef.current?.focus()`）；
    2. 保存不需要在 UI 界面上直接展示的运行时数据（如 `timerId`, `isMountedFlag`）。
- **Java / 后端对照视角 (Java Mapping)**：
  - `useRef` 就像给函数组件开辟了一个外部的“堆内存盒子”，或者类似 Java 类里的一个普通私有字段（`private Object cache`）。你修改这个字段的值不会触发整个类的重新加载。
- **掌握标记**：[ ] 待主动回忆

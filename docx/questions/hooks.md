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

---

### Q-HK-03: 为什么 `useEffect` 的回调不能直接声明为 `async`？如何正确发起异步请求？
- **提问背景**：初学者在 `useEffect` 中发起网络请求时，下意识写成 `useEffect(async () => { ... }, [])`，遭到 React 严厉拦截。
- **核心解答 (Answer)**：
  1. **为什么不能直接 `async`**：
     - 在 JS 规范中，被 `async` 修饰的函数其返回值必定是一个 `Promise`（如 `Promise<void>`）；
     - 但 React 约定 `useEffect` 的返回值**有且仅有一个用途：返回一个同步的“资源清理函数（Cleanup Function）”**（类型为 `() => void` 或 `undefined`），供组件卸载时取消订阅或断开连接；
     - 如果允许返回 Promise，React 根本无法在卸载阶段通过 `await` 或同步调用去执行它，导致清理契约崩溃并引发竞态风险。
  2. **正统异步调用范式**：
     - **范式 A（外部定义，推荐）**：将 `const fetchUsers = async () => { ... }` 声明在外部，在 `useEffect` 中直接调用 `fetchUsers()`。当组件有“刷新”或“重试”按钮需要复用该请求函数时最为推荐。
     - **范式 B（内部声明并自执行）**：在 `useEffect` 内部声明一个具名或匿名 async 函数并立即调用。
  3. **竞态与卸载防御（Cleanup 守卫）**：
     - 当异步响应返回时组件可能已被销毁。标准实践是利用布尔标记 `let ignore = false`，在清理函数中置为 `true`，防止给已卸载组件 `setState`。
- **Java / 后端对照视角 (Java Mapping)**：
  - `useEffect` 的清理函数契约如同 Java 的 `AutoCloseable`（或 `try-with-resources` 块）。框架要求你返回一个能随时执行 `.close()` 的资源句柄。
  - 如果你给它塞了一个 `CompletableFuture`，框架就无法在需要释放资源时调用关闭方法。
- **标准代码模式示范**：
  ```tsx
  // 方案 A：外部函数复用型
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('...');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // 必须在同步回调中调用异步函数
  }, []);

  // 方案 B：内部清理守卫型（防止竞态）
  useEffect(() => {
    let ignore = false;

    async function startFetch() {
      const res = await fetch('...');
      const data = await res.json();
      if (!ignore) {
        setUsers(data);
      }
    }

    startFetch();

    return () => {
      ignore = true; // 清理函数：若组件卸载，忽略后续未到达的响应
    };
  }, []);
  ```
- **掌握标记**：[ ] 待主动回忆


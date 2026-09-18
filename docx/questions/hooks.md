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

---

### Q-HK-04: 分页/搜索场景下的「请求竞态」到底怎么防？`useRef` 序号法与 `AbortController` 取消法该怎么选？
- **提问背景**：搜索框每改一个字、翻页每点一下都会发新请求；用户快速连点时，先发的请求可能后返回，旧数据把新数据覆盖掉（页码显示 3、列表却装着第 2 页的数据）。
- **核心解答 (Answer)**：
  - **竞态的本质**：网络响应的到达顺序 ≠ 请求的发出顺序。**“后发先至”无法避免，只能防御。**
  - **方案一：`useRef` 请求序号法（推荐，改动最小）**
    1. `const seqRef = useRef(0)`；
    2. 每次发请求时 `const seq = ++seqRef.current`；
    3. 响应回来后 `if (seq !== seqRef.current) return;` —— **只要我不是最新一次请求，就直接丢弃结果**；
    4. `finally` 里也要比对：`if (seq === seqRef.current) setLoading(false)`，否则过期请求会把最新请求的 Loading 关掉。
  - **方案二：`AbortController` 取消法（真正的“取消网络请求”）**
    1. `const controller = new AbortController()`；
    2. 传给 axios：`httpClient.get(url, { params, signal: controller.signal })` —— 因此 **`userApi.ts` 的函数签名需要多一个 `signal?: AbortSignal` 参数**（基础设施要预留“接缝”）；
    3. `useEffect` 的清理函数里 `controller.abort()`；被取消的请求会抛出 `code === 'ERR_CANCELED'` 的错误；
    4. ⚠️ 因此在拦截器的错误归一化里，**`ERR_CANCELED` 必须先于「无 response」判定被静默处理**，否则用户会看到标题为“网络不可达”的红色错误卡片。
  - **关键区别**：序号法只是“不采纳结果”（请求仍然发出）；取消法是“真的断掉连接”（省流量与后端开销）。高频搜索防抖场景下两者常配合使用。
- **Java / 后端对照视角 (Java Mapping)**：
  - 序号法 ⇄ 给每个请求带个自增版本号（类似乐观锁 `version` / CAS），只有版本号最新的才能写回共享状态；
  - 取消法 ⇄ `CompletableFuture.cancel(true)` / 带超时的 `Future`，主动中断在途任务；
  - `AbortSignal` 传递 ⇄ Java 里把 `CancellationToken` 一路向下透传（接缝式传递，而不是层层自己 new）。
- **掌握标记**：[ ] 待主动回忆

---

### Q-HK-05: `reload`（重试按钮）为什么用“自增刷新令牌”放进依赖数组，而不把请求函数放进依赖？
- **提问背景**：想让重试按钮重新拉一次数据，直觉是把 `fetchData` 函数塞进 `useEffect` 的依赖数组，结果要么拿到闭包旧值，要么触发无限循环。
- **核心解答 (Answer)**：
  - **为什么不能把函数放进依赖数组**：组件内声明的函数**每次渲染都是新引用**（引用相等性检查失败），写进 deps 就等于“每次渲染都重新执行 effect”——如果该 effect 里又会 `setState`，就变成**无限循环**。
  - **“刷新令牌”模式**：额外声明 `const [reloadToken, setReloadToken] = useState(0)`，把它放进依赖数组；
    `reload` 就是 `setReloadToken((t) => t + 1)`（使用**函数式更新**，避免依赖旧值）；
    令牌变化 → 依赖数组变化 → effect 重新执行，而函数引用问题完全绕开了。
  - **适用范围**：这是「手动触发副作用」的通用手法（类似命令式刷新，而非状态驱动）；当请求参数天然来自 state 时（如 page/keyword），优先用参数驱动，不需要令牌。
- **Java / 后端对照视角 (Java Mapping)**：
  - 令牌法 ⇄ 版本号 / 代际（generation）字段，用于显式下发“重新加载”指令；也可以类比 MQ 里的重试标记位；
  - 把函数塞进 deps 导致死循环 ⇄ Java 里在监听器回调中再次触发自身事件（递归/自触发环路）。
- **掌握标记**：[ ] 待主动回忆

---

### Q-HK-06: 为什么页面首次加载时先闪一下“空状态”？为什么 `loading` 的初始值必须是 `true`？
- **提问背景**：分页列表页里已经在 `useEffect` 的第一行写了 `setLoading(true)`，但打开页面时还是先看到「暂无用户数据」闪一下，然后才变成「正在加载…」。
- **核心解答 (Answer)**：
  - **React 的三拍子时序**：① **渲染**（计算 JSX）→ ② **提交**（写入 DOM）→ ③ **之后才异步执行 `useEffect`**。`useEffect` 属于 **passive effect**，它永远晚于“首帧”。
  - **因此首帧只能读到 state 的初始值**：若 `useState(false)`，首帧就是 `loading=false + users=[] + error=null` → 四态中命中“空状态”那一支 → 用户看到“暂无用户数据”；随后 effect 才 `setLoading(true)` 重新渲染成“加载中”。
  - **正确做法**：把“挂载即请求”这个**确定的事实**编码进初始值：`useState(true)`。更严谨的三态建模是用 `ApiUser[] | null`，用 `null` 区分“尚未加载”与“加载完成但结果为空（`[]`）”。
  - **同一根因的其他表现**：任何“挂载后立即拉取”的页面（详情页、仪表盘）都有这个首帧问题；反过来，如果是“用户点击后才请求”，`false` 才是诚实的初始值。
  - **为什么 `tsc` / `eslint` 都报不出来**：这是**行为层面的时序缺陷**，静态检查管“形状”，不管“先后顺序”。
  - **附：`<StrictMode>` 下 effect 会跑两遍**（mount → unmount → mount），所以开发环境会看到两次请求，这是 React 故意帮你暴露“副作用是否幂等”，不是 Bug；它恰好也是检验竞态守卫是否有效的最好场景。
- **Java / 后端对照视角 (Java Mapping)**：
  - Java 的初始化顺序由语言规范强保证（字段初始化 → 构造器 → 之后才可能被外部观测），所以在构造器里把状态设为 `LOADING` 并发出异步请求，**第一次被观测时它必定已经是 LOADING**；
  - 前端不一样：渲染是“纯计算”，副作用是“提交之后另行调度”，两者**不在同一个时间片上**；
  - 等价心智：不要把它想成“构造器里的初始化”，而要想成“打开开关后才开始运转的机器”。
- **极简代码示范 (Code Demo)**：
  ```tsx
  // ❌ 首帧：loading=false + users=[] → 闪一下“暂无数据”
  const [loading, setLoading] = useState(false);

  // ✅ 表达“挂载即请求”的已知事实
  const [loading, setLoading] = useState(true);

  // ✅ 更严谨的三态建模（区分“未加载”与“加载完但为空”）
  const [users, setUsers] = useState<ApiUser[] | null>(null);
  ```
- **掌握标记**：[ ] 待主动回忆


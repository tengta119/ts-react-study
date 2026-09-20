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
    > ⚠️ “Watcher”这个比喻仍会让人误以为“deps 里的变量变化才是触发器”。更本质的描述见 **Q-HK-07**：effect 是一段“把外部世界同步到当前 props/state”的代码，deps 只是**“什么时候需要重新同步”的声明**。

#### 🔍 深挖：依赖数组到底是什么？（把 deps 想成“缓存 key”）

- **根因：React 读不懂你的函数体**。
  React 无法静态分析 effect 里到底用了哪些变量（那等于要求它“理解语义”）。所以它把判断权交给你：
  > **deps 数组就是你对 React 的声明：`effect 的输入是什么`。**
  这不是“注释”，而是**运行时真正参与比较的数据**，直接决定闭包存活期与清理时机。
- **底层执行链路（每次渲染提交后都会跑一遍）**：
  ```text
  渲染(Render) → 比对 DOM → 提交(Commit) → 【检查 deps】
        ├─ 首次挂载（无历史 deps）        → 执行 effect，并存下本次 deps
        ├─ Object.is 逐个比较，长度也不等  → ① 先跑上一轮的清理函数  ② 再跑新 effect，更新 deps
        └─ 全部相等（浅比较相等）          → 什么都不做（跳过！）
  ```
  - 比较是**浅比较（`Object.is`）且逐个元素**：顺序/长度变了也算变；引用类型只比较引用地址，**不深入比内容**。
  - 所以 deps 的真正语义不是“监听这些变量”，而是：**“这些值只要没变，我这个 effect 的结果就仍然有效”。**
- **deps 决定的是“哪一版闭包还活着”**（`stale closure` 陈旧闭包的根因）：
  ```tsx
  useEffect(() => {
    const timer = setTimeout(() => console.log(count), 1000); // 这里的 count 是本轮渲染的快照
    return () => clearTimeout(timer);
  }, []);            // ❌ 永不失效 → 闭包永远是第 1 版的 count
  ```
  这个 effect 只在挂载时创建一次，捕获的是**首次渲染时**的 `count`；之后 `count` 怎么变，闭包里看到的永远是最初的值。
  这就是“为什么要遵守 exhaustive-deps”的实际代价：**漏一个依赖 ≈ 用了一个过期快照**。
- **三种写法的准确含义**：
  | 写法 | 语义（正确理解）| 典型场景 | 风险 |
  | :--- | :--- | :--- | :--- |
  | 不传 | “每次渲染都必须重新同步” | 极少用（几乎没有正当理由）| 无条件 setState → 死循环 |
  | `[]` | “没有任何输入 → 永不失效” | 只跑一次：启动恢复登录态、订阅全局事件 | 读到的 state/props 永远是初值 |
  | `[a, b]` | “输入是 a 和 b” | 数据请求、定时器、同步外部系统 | 漏项 = 陈旧闭包；多填引用型 = 每轮都跑 |
- **`[]` 不等于“只执行一次”的语法糖**：在 `<StrictMode>`（开发模式）下 React 会**故意**“挂载 → 卸载清理 → 再挂载”跑两遍，用来暴露“清理函数写不对”的副作用。这就是 TASK-007 里“一个页面挂了却发了两次请求”现象的来源（不是 Bug，是检查器）。
- **引用类型依赖的陷阱（本任务必踩）**：
  ```tsx
  usePagedUsers((params) => fetchAdminUserPage(params), 5);   // ❌ 内联箭头函数：每次渲染都是新引用
  usePagedUsers(fetchAdminUserPage, 5);                        // ✅ 模块级函数：引用终身稳定
  ```
  前者会让 `[..., fetcher]` 每轮都“变化” → effect 每轮重跑 → 无限请求。
  👉 这正是 `useCallback` / `useMemo` / “把对象提到模块级”真正要解决的问题：**让引用稳定，以便作为可靠的依赖项**（而不是“性能优化”这么含糊的说法）。
- **三条铁律**：
  1. **不撒谎原则**：effect 里用到的一切响应式值（props / state / 自定义 Hook 返回值）都必须在 deps 里，不要用 `[]` 藏它；
  2. **依赖即输入原则**：想减少依赖，应该改设计（把值传参、把函数提到模块级 / `useCallback`），而不是删掉 deps 里的名字；
  3. **同一套机制多处复用**：`useCallback(fn, [])` / `useMemo(() => v, [])` 用的就是这套 deps 比较机制 —— 它们比的是依赖，不是结果。
- **Java / 后端对照视角（增量构建类比）**：
  | React deps | Gradle / Maven 增量构建 |
  | :--- | :--- |
  | deps 数组 | 任务的 `inputs` 声明 |
  | `Object.is` 浅比较 | up-to-date check（输入指纹未变 → 任务 `UP-TO-DATE` 跳过）|
  | effect 函数 | task action |
  | **清理函数** | **task 重跑前的 clean / 撤销旧产物** |
  - 这个类比能解释三件让人不习惯的事：① 为什么“输入没变就不执行”（增量构建就是这样）；② 为什么必须先执行上一轮的清理（旧产物先失效）；③ 为什么依赖漏填会导致错误结果（漏声明输入 → 构建结果不可信）。
  - 另一个精辟对应：Spring 的 `@Cacheable(key = ...)` —— **deps 就是 cache key**：key 没变就命中缓存（不重算），key 变了就得先 `evict` 再重算，而“evict”正是你的清理函数。
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

---

### Q-HK-07: `useEffect` 到底是什么？为什么 React 非要有这么一个东西？（本质总览）
- **提问背景**：已经在 TASK-004/007 里用过多次 `useEffect`，但回头看时会发懵：它到底解决什么根本问题？为什么名字里是“副作用”而不是“生命周期”？
- **核心解答 (Answer)**：
  - **一句话定义**：`useEffect` 是“**在渲染完成之后，拿最新的 state/props 去与组件外部的世界做同步**”的钩子。它把“副作用”从渲染过程中隔离开来。
  - **为什么必须有它** —— 从一个铁律出发：**组件必须是纯函数**（相同 props/state 必须得到相同 JSX）。但现实里组件必须做“不纯”的事：发请求、设定时器、订阅事件、读写 `localStorage`、手动改 DOM——这些统称为**副作用（side effect）**：它们会改变外部世界，也让渲染结果不再只由输入决定。React 的方案是：**渲染阶段保持纯净，“副作用”统一放到渲染之后的专门时机执行**。（“在渲染期改状态”会直接报 `Cannot update a component while rendering a different component`。）
  - **三个组成部分**：
    ```tsx
    useEffect(() => {          // ① 副作用函数：做什么
      ...
      return () => { ... };    // ③ 清理函数（可选）：怎么收尾
    }, [depA, depB]);         // ② 依赖数组：什么时候重做
    ```
    | 部分 | 语义 | 省略/常见错误 |
    | :--- | :--- | :--- |
    | ① 副作用函数 | 本次同步要做的动作 | 声明成 `async`（会返回 Promise → 被当成清理函数）|
    | ② 依赖数组 | React 用 `Object.is` 浅比较，变了才重做 | 漏项 = 幽灵 Bug；把每次重建的函数放进去 = 死循环 |
    | ③ 清理函数 | 下次执行前 / 卸载时收尾（取消订阅、清定时器、忽略过期响应）| 不清理 = 内存泄漏、给已卸载组件 setState |
  - **执行时机（三拍子 + 清理顺序）**：首次挂载：渲染 → 提交（写 DOM）→ **异步**执行 effect；依赖变化：渲染 → 提交 → **先跑上一次的清理** → 再跑新 effect；卸载：只跑清理函数。
  - **心智模型（最关键的一点）**：**不要问“它相当于 componentDidMount 还是 componentDidUpdate”**（那是类组件时代的逆向迁移思维）。要问：
    > **“我这段代码依赖哪些状态？当它们变化时，外部世界需要被重新同步成什么样？”**

    官方现在的立场更进一步：**能不用 `useEffect` 就不用** ——
    （a）能算出来的 → 派生值（TASK-002/007 已掌握）；
    （b）用户操作触发的 → 事件处理器里直接做（如“点击登出”）；
    （c）只有“组件出现了 / 依赖变了，必须与外部系统同步”才用它。
- **Java / 后端对照视角 (Java Mapping)**：
  | Java | React |
  | :--- | :--- |
  | `@PostConstruct`（只跑一次） | `useEffect(fn, [])` |
  | `@EventListener` / 监听器（状态变化就触发）| `useEffect(fn, [dep])` —— 依赖变化就是“事件” |
  | `try-with-resources` / `AutoCloseable#close()` | `return () => { ... }` 清理函数 |
  | **你显式控制何时调用**（方法、调度器、MQ 消费者）| **你只声明依赖，调度由框架负责** |
  | `ThreadLocal.remove()` 防泄漏 | 清理函数防泄漏 / 防过期写入 |
  - **最本质的差异**：Java 里“什么时候执行”由你（或容器/线程模型）控制；React 里你放弃调用权，只**声明依赖关系**，等价于“声明式注册一个监听器，参数一变就重新注册”。
- **极简代码示范 (Code Demo)**：
  ```tsx
  // 您在本项目中已写过的三处真实用法：
  useEffect(() => { fetchUsers(); }, []);                    // TASK-004：挂载时拉一次
  useEffect(() => { loadPage(); }, [page, size, keyword, reloadToken]); // TASK-007：查询条件驱动

  // TASK-008（即将写）：启动时用已有 token 恢复登录态
  useEffect(() => {
    const restore = async () => { /* readToken() → fetchMeApi() → setUser() */ };
    void restore();
  }, []);   // ⚠️ 必须是 []：登录成功后不能因 user 变化而再跑一次（会重复请求、可能死循环）
  ```
- **关联题**：时机与 deps 细节见 Q-HK-01；不能写 `async` 的原因见 Q-HK-03；清理/守卫与竞态见 Q-HK-04；不把函数放依赖的“刷新令牌”模式见 Q-HK-05；首帧时序陷阱见 Q-HK-06。
- **掌握标记**：[ ] 待主动回忆

---


### Q-HK-08: 搜索防抖（debounce）为什么必须 `return () => clearTimeout(timer)`？effect 的清理函数到底什么时候执行？
- **提问背景**：TASK-009 TODO ② 要实现“输入停止 300ms 后才发请求”。知道该用 `setTimeout`，但不明白为什么每轮 effect 末尾都要 `return` 一个 `clearTimeout` —— 感觉只是“多写一行安全代码”而已。
- **核心解答 (Answer)**：
  - **现象与结论**：不写这行清理，输入“架构师”三个字会**发 3 次请求**，防抖完全失效。
    更阴险的是：因为“同一个值重复 setState”会被 React 直接跳过（bailout，不重渲染），**界面上看不出任何异常** —— 只有 Network 面板（3 个请求）或后端日志能揭发它。
  - **底层机制（React 的三步时序）**：依赖数组一旦变化，React 的执行顺序是**固定**的：
    ```text
    ① 执行【上一轮 effect 返回的清理函数】   → clearTimeout(上一轮那个还没到期的定时器)
    ② 执行【本轮的 effect 函数】            → 重新 setTimeout，重新计时
    ③ （渲染提交之后才轮到 effect 执行，所以首帧只能读到 state 初始值 —— 见 Q-HK-06）
    ```
    👉 于是「用户又敲了一个字」这个动作**本身**就自动撤销了上一次的待定提交 —— **防抖不是靠 setTimeout 实现的，是靠“先清理再重建”这个闭环实现的**。
  - **一个关键等式**：`debounce = 把“立即执行”推迟到“安静 delay 之后”`。而“取消上一次的推迟”这个动作**只能由清理函数完成** —— 因为 effect 体内刚创建 timer 时，上一轮的 timer 变量根本不在它的作用域里（每次 effect 执行都是一个新闭包）。
  - **三件事必须分清（面试高频）**：
    | 手段 | 做什么 | 本任务里的位置 |
    | :--- | :--- | :--- |
    | 防抖 debounce | **少发**（安静 300ms 才发一次）| `useDebouncedValue` |
    | 节流 throttle | **限频**（每 300ms 最多发一次，不停止也会发）| 未使用 |
    | 取消 AbortController | **发了但作废**（在途请求真正掐断）| DoD ⑩ 进阶项 |
  - **初始值为何写 `useState(value)`**：首帧“还没有发生任何变化”，延迟值就该等于原值。若写成 `useState(undefined)` 或空字符串，会出现“空 → 有值”的额外闪烁，甚至多打一次空关键字请求。
  - **依赖数组为何要带 `delay`**：遵循“依赖即输入”。若 `delay` 变了而依赖数组不含它，定时器会继续用**旧时长的闭包快照**（与 Q-HK-01 的 deps 漏项是同一族 Bug）。
  - **关联坑（本任务亲身踩过）**：把防抖值喂给状态机时：
    ```tsx
    useEffect(() => { setKeyword(debouncedSearch); }, [debouncedSearch, setKeyword]);
    ```
    若 `setKeyword` 是每次渲染新生成的普通函数，依赖数组**每轮都“变化”** → effect 每轮都执行。虽然 `setKeyword` 内部传的是相同值、React 会 bailout 不重渲染（不会死循环），但每次渲染都白跑一次 effect —— 所以 `usePagedUsers` 里的 `setKeyword` 被改成了 `useCallback(..., [])`。
    > 这也解释了 `useCallback` 的真正用途：**不是“性能优化”，而是“让函数可以作为稳定的依赖项参与 effect”**。
- **Java / 后端对照视角 (Java Mapping)**：
  | 前端 | Java / 中间件 |
  | :--- | :--- |
  | `setTimeout(...)` | `ScheduledExecutorService.schedule(...)` |
  | `return () => clearTimeout(timer)` | `scheduledFuture.cancel(false)`（放弃未执行的任务）|
  | “又敲一个字就重新计时” | MQ 的**延迟消息 + 幂等覆盖**（只有最后一条延迟消息真的生效）|
  | `useDebouncedValue(value, 300)` | 手写去抖调度器；Spring 里最接近的是 Resilience4j 的限流器 / 网关的请求合并（Nginx `limit_req`）|
  - 一个关键差异：Java 里 `cancel(false)` 要自己记得调；React 里则是**框架在依赖变化时主动调你的清理函数** —— 你只需要“把取消动作写出来”，时机由框架保证。这是声明式（描述“什么情况下该撤销”）与命令式（手写 if/else 撤销）的根本区别。
- **极简代码示范 (Code Demo)**：
  ```tsx
  export function useDebouncedValue<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState(value); // 初值 = 原值（首帧不闪空）

    useEffect(() => {
      const timer = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(timer); // ⭐ 灵魂：本轮结束/依赖变化时撤销未到期的定时器
    }, [value, delay]);

    return debounced; // 对外暴露的是“安静后的值”，而不是入参
  }
  ```
  排查技巧：“防抖到底有没有生效” 不要看界面（同值 setState 无声无息），**看 Network 面板的请求条数**。

#### 📊 逐字时序追踪（`delay = 300ms`，用户敲“架构师”后停手）

| 时刻 | 用户动作 / 内部事件 | 定时器状态 | 是否发请求 |
| :--- | :--- | :--- | :---: |
| t=0ms | 输入“架” → 渲染 #1（value=`架`） | 创建 timer₁，到期 t≈300 | ❌ |
| t=120ms | 输入“构” → 渲染 #2（value=`架构`） | **先** clearTimeout(timer₁) → 再建 timer₂，到期 t≈420 | ❌ |
| t=260ms | 输入“师” → 渲染 #3（value=`架构师`） | **先** clearTimeout(timer₂) → 再建 timer₃，到期 t≈560 | ❌ |
| t=420ms | （若没删 timer₂，这里就会触发 `setDebouncedValue('架构')`）| — | ⚠️ 这正是“没写清理函数”才发生的多余跳 |
| t=560ms | 安静满 300ms：timer₃ 触发 → `setDebouncedValue('架构师')` → 渲染 #4 | 无新定时器（value/delay 未变，effect 依赖不变 → **不重跑**）| ✅ **只此一次** |
| t≈560ms+ | 下游 effect 发现 `debouncedSearch` 变了 → `setKeyword('架构师')` → 页码归 1 → 状态机 effect 发请求 | — | ✅ 1 个请求 |

> 反面情形（漏写 `return () => clearTimeout(timer)`）：timer₁/timer₂/timer₃ **全部到期**，
> 依次 `setDebouncedValue('架') → ('架构') → ('架构师')` → **3 次状态变化 → 3 次请求**。

#### 🔍 三种实现方案对比（知道取舍才叫真懂）

| 方案 | 形态 | 适用场景 | 本任务为何不用 |
| :--- | :--- | :--- | :--- |
| ① **值防抖**（`useDebouncedValue`）| Hook 返回“安静后的值” | 下游是**声明式依赖**（effect / 组件）—— 如搜索关键字 | ✅ 采用 |
| ② **函数防抖**（`debounce(fn, delay)`，即 `lodash.debounce`）| 包装原函数，返回防抖版 | 下游是**命令式调用**（如手动调一次 `save()`、窗口 resize 回调）| 需要 `useRef` 包住实例，且在 React 18 严格模式下“引用稳定”更难处理 |
| ③ **写在 onChange 里**（`setTimeout` + `useRef` 存 timer）| 事件层自己调度 | 极简单场景（只有一个入口） | 调度逻辑与事件处理耦合；卸载时清理需额外处理；难以复用与单测 |

**为什么本方案不需要 `useRef`？** 很多人写防抖要向 `useRef` 里存 timer id，因为“怕闭包拿到旧值”。
但这里 `value` **已经在依赖数组里** —— 每次 value 变化 React 就会重建 effect，所以 timer 回调能看到的是**本轮闭包里的最新 value**（Q-HK-01 的“依赖即输入”原则）。
`useRef` 只在“定时器 id 需要在 effect 外部被访问”时才是必需的（例如对外暴露一个 `cancel()`/`flush()` 方法）。

**常见错误实现（自己核对一下）**：
```ts
// ❌ 错误 1：漏清理 → 每个字都发一次请求（ESLint 不会报）
useEffect(() => { setTimeout(() => setDebounced(value), delay); }, [value, delay]);

// ❌ 错误 2：用 useState 自己跟自己比 → 无法表达“时间”这个概念，防抖不成立
useEffect(() => { if (debounced !== value) setDebounced(value); }, [value, debounced]);

// ❌ 错误 3：delay=0 当成“不防抖” → 依旧多一次渲染 + 一次微任务跳转，不如直用 value
```

#### ⚠️ 一个必须澄清的边界：防抖 **不解决竞态**

防抖只保证“**少发**”，不保证“**顺序**”。输入 `A` 停手 → 300ms 后发出 A 请求；
接着输入 `B` 又停手 → 发出 B 请求 —— 若 **A 的响应晚于 B**，旧结果仍会覆盖新结果。
所以 TASK-007 的 `useRef` 序号法（或 DoD ⑩ 的 `AbortController`）**必须保留**，两者是递进而非替代关系：
```text
防抖   → 减少请求数量（省钱、省服务器）
竞态守卫 → 保证“最后一个请求”才能写状态（保正确）
```

#### 📈 生产级防抖还会要求什么（了解即好，本课不实现）

| 能力 | 含义 | 典型实现 |
| :--- | :--- | :--- |
| `leading` | 首次立即执行，后续安静后再执行一次 | 输入框即时响应 + 尾部补齐 |
| `maxWait` | 无论怎么连续输入，最长不超时 N 毫秒必执行 | 防“用户永不停手导致永不查询” |
| `cancel()` / `flush()` | 手动放弃/立即执行待定任务 | 用户按 Esc 清空搜索框时取消待定查询 |

> 300ms 是经验值：小于 200ms 防抖效果不明显；大于 500ms 用户会觉得“卡了”。

- **掌握标记**：[ ] 待主动回忆

---

### Q-HK-09: 为什么 React 会自动去调用"上一轮 effect 返回的清理函数"？我明明没有在任何地方调它
- **提问背景**：在 `useDebouncedValue` 里 `return () => clearTimeout(timer)`，但从没写过任何地方调用它，它却真的执行了（实测日志里能看到“撤销上一个待定定时器”）。是“谁”在调？为什么能精准地调到**上一次**那一份？
- **核心解答 (Answer)**：分三层回答，从浅到深。

  **第一层：React 的模型里，Effect 本来就是“成对”的**
  > 官方原文：*“An Effect can only do two things: to start synchronizing something, and later to stop synchronizing it.”*（一个 Effect 只能做两件事：开始同步某个东西，以及稍后停止同步它）

  所以“调用清理函数”**不是异常路径，而是 Effect 生命周期的另一半**——不是“善后”，而是“停止同步”这个正式动作。
  你没写 `return` 时，官方也明确：*“if you don't, React will behave as if you returned an empty cleanup function.”*（没返回就是返回了一个空的清理函数）。

  **第二层：为什么必须调（不调会错）**
  > 官方原文（聊天室例子）：*“The `roomId` prop has changed, so what your Effect did back then (connecting to the `"general"` room) no longer matches the UI.”*（props 变了，上次那次同步的结果已经与 UI 不一致了）

  于是 React 需要两件事：
  1. **停止**与旧输入的同步（断开 `general` 连接 / 取消旧定时器 / 取消旧订阅）
  2. **开始**与新输入的同步（连上 `travel` / 新建定时器）

  > 官方原文：*“React will call the cleanup function that your Effect returned after connecting to the `"general"` room. **Then** React will run the Effect that you've provided during this render.”*

  👉 这两句话同时回答了“**谁在调**”与“**什么顺序**”：**先 stop 旧的，再 start 新的**。
  我们的实测输出就是这条规则的体现：不写清理时三个定时器全部存活（对应“旧同步永不停”、三个请求）。

  **第三层：机制上怎么做到“精准调到上一次那一份”**
  - React 为每个 `useEffect` 在 fiber 的 hook 链表上保留一个记录，大致形如 `{ create, destroy, deps, next }`：
    - `create` = 本次渲染传入的 effect 函数
    - **`destroy` = 上一次 `create()` 的返回值**（这就是你说的“上一轮的清理函数”）
    - `deps` = **上一次渲染**的依赖数组（用于本次比较）
  - 提交（commit）之后，React 遍历这些记录：
    ```text
    若 depsChanged（Object.is 逐个比，与“上一次”存下的数组比）：
        ① 若存在上一次存下的 destroy → 调用它
        ② 调用本次的 create()，并把它的返回值存为新的 destroy
        ③ 把本次 deps 存下来（供下轮比较）
    若组件卸载：
        只做 ①（调用 destroy，不再 create）
    ```
  > 官方原文：*“React will look at the array of dependencies… If any of the values in the array is different from the value at the same spot that you passed during **the previous render**, React will re-synchronize your Effect.”*（注意“previous render”与“same spot”两个措辞：**配对的基准就是上一次**）
  - 一个关键推论：**cleanup 是闭包，它捕获的是生成它的那一轮的变量**。所以“调上一次的清理” = “用上一次的输入去断开上一次建立的连接”——而不是用当前的输入。若拿错版本，就会出现“断开错误的房间 / 清错定时器”。这也解释了为什么清理函数里能安全地写 `clearTimeout(timer₁)`：`timer₁` 就是那一轮的局部变量。
  - 而“配对”靠的是**同一个 hook 槽位顺序**。这正是 **Rules of Hooks**（不能条件调用/循环调用）的根本原因：
    若 hook 调用顺序不稳定，记录就会错位 → 清理函数与 effect 配对错乱 → “关错房间”类的玄学 Bug。
    （同一条“按调用顺序索引”的机制也是 `useState` 能区分多个 state 的原因。）

  **两个容易误解的细节**
  1. **时机是在“提交之后”，不是 render 阶段**（`useEffect` 是 passive effect）：render 阶段可能被丢弃/重放（并发特性），在那里调清理会破坏已经提交的副作用。
     实际观察到的顺序就是：`提交 → 执行需要执行的清理 → 执行新的 effect`。
     另外官方明确：`<StrictMode>` 下会**额外**跑一轮“setup + cleanup”压力测试：
     > *“React will run one extra development-only setup+cleanup cycle before the first real setup.”*
     这就是 TASK-007 里“一个页面挂了却发了两次请求”的来源。
  2. **不要自己手动调清理函数**。它是 React 的资产（时机由框架所有），手动调会造成同一资源被“停两次”。
     这也是你学过的“**单一 owner**”原则的又一次出现：创建资源的人只声明“如何停”，**什么时候停由框架决定**。

- **Java / 后端对照视角 (Java Mapping)**：
  | React | Java / 后端 |
  | :--- | :--- |
  | 你只写 `return () => stop()`，框架在依赖变化时调它 | **`try-with-resources`**：你只写 `open()`，`close()` 由编译器在作用域结束时插入 |
  | deps 变化 = 本次同步失效 | `@Cacheable(key = ...)` 的 key 变化 → 先 `evict` 再重算 |
  | 先 stop 旧的、再 start 新的 | `SmartLifecycle`：先 `stop()` 再 `start()`；连接池先归还旧连接再借新连接 |
  | hook 槽位顺序必须稳定 | Java 方法参数的**位置语义**：实参位置错一个，配型全乱（所以不能“偶尔少传一个参数”）|
  | 清理由容器/框架触发 | Servlet `Filter#destroy()` / `@PreDestroy` 由容器调用，而不是业务代码自己调 |
  - 一个本质差别：Java 里资源管理靠**程序员选对作用域**（try-with-resources 靠语法糖保证）；React 里靠 **deps 声明 + 框架调清理** —— 你甚至不需要知道“什么时候卸载”，只需要说清“如何停止”。

- **极简代码示范 (Code Demo)**：
  ```tsx
  // ✅ 正确定义：只描述“如何停止同步”，不管“何时停”
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);   // ← 这一份 destroy 会被 React 存起来
  }, [value, delay]);

  // ❌ 反面 1：手动调了一次（重复停止同一资源）
  useEffect(() => {
    const timer = setTimeout(...);
    clearTimeout(timer);               // 自己又调一次 → 定时器永远等不到
    return () => clearTimeout(timer);
  }, [value, delay]);

  // ❌ 反面 2：把清理写在了 effect 里“下一步”的位置（早了一个提交周期）
  useEffect(() => { ...; cleanupRef.current = () => clearTimeout(timer); }, [value]);
  // 结果：本轮的清理只能在下一次 effect 里手动调 → 漏掉了“卸载时”这个时机
  ```
  > 记住：**卸载时机是无法在组件里用 `if` 手写的**（卸载后你的代码根本不再运行）。这是“必须把清理函数 return 给 React”的硬道理。
- **参考来源**：
  - [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects)（start/stop 模型、“Then React will run the Effect”、`Object.is` 与 “previous render”）
  - [useEffect 参考文档](https://react.dev/reference/react/useEffect)（deps 规则、StrictMode 额外一轮 setup+cleanup）
- **掌握标记**：[ ] 待主动回忆

# 学习进度与知识看板 (learning.md)

> 当前状态：**阶段 6 圆满通关 ✅ ｜ 推荐开启阶段 7（React Router 前端路由）（2026-09-17）**
> 核心策略：**先理解 → 自己写 → 教练 Review → 纠错修改 → 总结归纳**

---

## 📌 当前任务状态

| 任务编号 | 任务名称 | 状态 | 代码工作区 | 完成时间 |
| :--- | :--- | :---: | :--- | :--- |
| [`TASK-001`](./tasks/TASK-001-counter.md) | 全功能计数器 (Counter) | ✅ 已通关 | `src/exercises/TASK-001-counter/Counter.tsx` | 2026-09-17 · 验收通过，已通关归档 |
| [`TASK-002`](./tasks/TASK-002-todo.md) | 经典待办清单 (Todo List) | ✅ 已通关 | `src/exercises/TASK-002-todo/TodoList.tsx` | 2026-09-17 · 验收通过，已通关归档 |
| [`TASK-003`](./tasks/TASK-003-form.md) | 受控表单与多字段联动 | ✅ 已通关 | `src/exercises/TASK-003-form/UserForm.tsx` | 2026-09-17 · 验收通过，已通关归档 |
| [`TASK-004`](./tasks/TASK-004-api.md) | 对接后端 API 与副作用处理 | ✅ 已通关 | `src/exercises/TASK-004-api/UserListApi.tsx` | 2026-09-17 · 验收通过，已通关归档 |
| [`TASK-005`](./tasks/TASK-005-refactor-hook.md) | 组件拆分、父子通信与自定义 Hook | ✅ 已通关 | `src/exercises/TASK-005-refactor-hook/` | 2026-09-17 · 验收通过，已通关归档 |

**TASK-005 总结**：
- 深刻掌握了 Smart 容器组件（`UserManager`）与 Dumb 纯展示组件（`UserCard`, `UserSearchBar`）的单一职责架构；
- 熟练运用“Props 向下单向流动，事件通过回调向上通知（Events Up）”的 React 通信黄金法则；
- 掌握了方法引用语法糖与 Java 8 `Consumer<T>` 的心智对应（`onKeywordChange={setKeyword}`）；
- 掌握了形参解构赋值 `{ user, onDelete }` 的精准作用域边界，杜绝 TS2304 报错；
- 独立完成泛型基础设施 Hook `useFetch<T>`，并利用解构重命名（`data: users`）在领域层优雅组合出 `useUsers`；
- 成功闭环了子组件向上传递 `onDelete(id)` 并驱动父级数据不可变过滤。

**下一步推荐目标**：开启 **阶段 7：React Router 前端路由与多页面导航**（构建真正的单页多页面 SPA 应用，掌握路由切换、动态参数与导航栏激活）。

---

## 🎯 当前学习阶段

- **当前路线**：从组件解耦架构向前端单页路由（SPA Routing）进阶
- **主攻方向**：
  1. React Router 核心机制（`BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`）
  2. 动态路由传参（`useParams` / `useNavigate`）
  3. 嵌套路由与全局布局（Layout & Outlet）

---

## 🗺️ 阶段路线里程碑

| 阶段 | 主题 | 核心目标 | 状态 |
| :--- | :--- | :--- | :---: |
| **阶段 1** | **TypeScript 核心基石** | 掌握类型系统，克服从 Java 名义类型向结构化类型的转变 | 🟡 进行中 |
| **阶段 2** | **React 组件与 JSX** | 理解 JSX 语法本质、函数组件、Props 单向数据流 | 🟡 进行中 |
| **阶段 3** | **State 与交互 (useState)** | 理解组件重渲染机制、不可变数据原则、事件处理 | ✅ 阶段通关（TASK-001 通关） |
| **阶段 4** | **列表、Key 与表单受控组件** | 掌握 `map` 渲染、Key 的底层机制、多表单受控输入 | ✅ 阶段通关（TASK-002, TASK-003 通关） |
| **阶段 5** | **副作用与生命周期 (useEffect)** | 掌握数据请求、定时器清理、依赖项数组机制 | ✅ 阶段通关（TASK-004 通关） |
| **阶段 6** | **组件拆分与通信** | 父子通信、状态提升、自定义 Hook 抽离逻辑 | ✅ 阶段通关（TASK-005 通关） |
| **阶段 7** | **React Router 前端路由** | 单页应用导航、动态路由传参、路由守卫思路 | 🟡 下一推荐阶段 |
| **阶段 8** | **Spring Boot + React 联调实战** | 跨域配置、Token 认证、CRUD 完整小项目独立开发 | ⚪ 未开始 |

---

## ✅ 已掌握技能栈 (Mastered)

- [x] **`useState` 基础与泛型**：状态声明、泛型标注与推导
- [x] **React 事件与表单拦截**：`onClick`、`onChange`、`onSubmit` 与 `e.preventDefault()`
- [x] **状态快照（Snapshot）心智模型**：单帧渲染函数执行模型，状态在当前帧不可变
- [x] **派生状态（Derived State）**：杜绝冗余 State，基于状态纯函数计算筛选列表、统计指标与按钮禁用
- [x] **JavaScript Falsy 避坑**：识别 `||` 短路吞 0 缺陷，精确处理边界
- [x] **函数式更新范式**：`setTodos(prev => ...)` 处理并发与批处理数据依赖
- [x] **数组不可变添加**：`[...prev, newItem]`
- [x] **数组不可变修改**：`prev.map(t => t.id === id ? { ...t, prop: newVal } : t)`
- [x] **数组不可变删除**：`prev.filter(t => t.id !== targetId)`
- [x] **对象展开运算符 `...`**：键值对平铺、浅拷贝与同名属性覆盖机制
- [x] **列表渲染与 Key 规范**：使用稳定 UUID/ID，杜绝 `index` 做 key 导致的状态串行
- [x] **复合表单对象统一管理**：`useState<FormData>({ ... })` 类似 Java DTO 模式
- [x] **动态计算属性名**：`[name]: value` 单一事件处理函数驱动多输入框
- [x] **React 合成事件与泛型**：`React.ChangeEvent<HTMLInputElement | HTMLSelectElement>` 联合类型收窄
- [x] **TypeScript 类型擦除心智**：深刻理解 TS `interface` 不可 `new`，使用对象字面量 `{}`
- [x] **表单统一校验与重置**：`Record<string, string>` 错误收集、`handleReset` 全量复位
- [x] **`useEffect` 副作用调度**：依赖项数组 `[]` 机制与禁止顶层请求的底层原因
- [x] **网络请求黄金四态闭环**：`loading` 转圈防抖、`error` 异常捕获与重试、`empty` 友好占位、`data` 卡片渲染
- [x] **Fetch 异步流读取与异常捕获**：掌握 `await res.text()` / `await res.json()` 提取响应体，杜绝 `[object Promise]` 陷阱
- [x] **JSX 三元条件分支**：熟练运用 `condition ? <A /> : <B />` 处理列表与空状态切换
- [x] **前后端 RESTful DTO 对齐**：跨域 CORS 放行与强类型契约无缝对接
- [x] **Smart vs Dumb 架构解耦**：容器组件管数据与编排，展示组件管纯排版
- [x] **Props 只读与事件回调通信**：掌握“Props Down, Events Up”数据流向
- [x] **方法引用传参**：`onKeywordChange={setKeyword}` 类比 Java 8 `this::setKeyword`
- [x] **自定义 Hook 抽象范式**：封装 `useFetch<T>` 泛型基础设施与 `useUsers` 业务领域服务
- [x] **解构别名与适配器模式**：`{ data: users, setData: setUsers }` 实现强类型领域映射
- [x] **子传父删除联动**：`onDelete(user.id)` 回调通知父组件触发不可变移出

---

## 🔄 正在学习 (In Progress)

- [ ] **TS 基础与进阶**：
  - [ ] `interface` 属性定义（可选 `?`、只读 `readonly`）
  - [ ] `interface` 与 `type` 的区别与取舍
  - [ ] 联合类型 (`|`) 与 字面量类型
- [ ] **阶段 7 核心知识点（待开启）**：
  - [ ] 前端路由 SPA 机制：为什么切换页面不刷新整页？
  - [ ] React Router 核心组件：`BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`
  - [ ] 动态路由与 Hooks：`useParams` 提取 `:id`、`useNavigate` 编程式跳转
  - [ ] 嵌套路由与布局卡槽：`Layout` + `<Outlet />`

---

## ❓ 待攻克疑难点 (Backlog)

*（详细内容可在 `docx/questions/` 专属问答库中查看与演练）*

1. TypeScript 的结构类型系统（Structural Typing）与 Java 的名义类型系统（Nominal Typing）的思维切换（详见 `docx/questions/typescript.md` Q-TS-01）
2. React 为什么强调“不可变性”（Immutability），直接 `user.name = "Tom"` 会带来什么问题？（详见 `docx/questions/state-and-rendering.md` Q-SR-02）
3. `useState` 的异步更新心智模型与快照机制（详见 `docx/questions/state-and-rendering.md` Q-SR-01）
4. 为什么不能 `new FormData({...})`？TS 接口与 JS 原生对象构造函数有什么区别？（详见 `docx/questions/typescript.md` Q-TS-05）
5. 对象字面量中的 `[name]: value` 是什么意思？与 `name: value` 有何本质区别？（详见 `docx/questions/typescript.md` Q-TS-06）
6. 为什么 `useEffect` 的回调不能直接声明为 `async`？如何正确发起异步请求？（详见 `docx/questions/hooks.md` Q-HK-03）
7. 在 JSX 中如何优雅处理“空数据态 (Empty State)”？为什么 JSX 里不能直接写 `if-else`？（详见 `docx/questions/react-core.md` Q-RC-05）
8. 什么是 Props 和事件回调？父子组件通信的底层机制是什么？（详见 `docx/questions/react-core.md` Q-RC-06）
9. 为什么可以直接写 `onKeywordChange={setKeyword}`？它实际是一个函数吗？（详见 `docx/questions/react-core.md` Q-RC-07）
10. 为什么在 Props 接口中定义了属性，组件内依然报 TS2304？（详见 `docx/questions/react-core.md` Q-RC-08）

# TASK-005: 组件拆分、父子通信与自定义 Hook 抽离 (Component Composition & Custom Hook)

> **目标**：掌握 React 工程化解耦的核心范式：将单体大组件重构为“容器组件 + 纯 UI 组件”，并将异步状态逻辑抽离为纯粹的“自定义 Hook（Custom Hook）”。
> **代码工作区**：`src/exercises/TASK-005-refactor-hook/`

---

## 🎯 业务与重构需求

在 TASK-004 中，我们将所有状态（`users`, `loading`, `error`, `keyword`）、副作用网络请求以及所有 JSX 排版全部揉在了一个文件里。
本次任务我们将它彻底重构成符合企业级规范的高内聚、低耦合架构：

1. **抽离数据逻辑层：自定义 Hook (`useUsers.ts`)**
   - 封装网络请求、三态管理（`users`, `loading`, `error`）以及 `refetch` 刷新逻辑；
   - 让外部只需要一行：`const { users, loading, error, refetch } = useUsers();` 就能获得全套数据能力（类比注入 Spring `@Service`）。
2. **拆分纯 UI 展示组件：`UserSearchBar.tsx`**
   - 接收 Props：`keyword: string`、`onKeywordChange: (val: string) => void`、`onRefresh: () => void`、`loading: boolean`；
   - 内部不拥有业务数据 State，只通过 Props 向父组件报告用户的输入变动（单向数据流与回调向上传递）。
3. **拆分独立展示单元：`UserCard.tsx`**
   - 接收 Props：`user: ApiUser`；
   - 作为纯函数组件（Dumb Component），只负责渲染单个用户的精美卡片。
4. **容器调度中心：`UserManager.tsx`**
   - 作为 Smart/Container 容器组件，负责调用 `useUsers` 获取数据，管理 `keyword` 派生过滤，并组织拼装各个子组件。

---

## 💡 所需知识点与提示

- **自定义 Hook 本质**：
  - 必须以 `use` 开头（如 `useUsers`）；
  - 本质是**包含其他 React Hook（如 `useState`, `useEffect`）的普通纯函数**，用于复用“状态逻辑”（Stateful Logic），而不是复用状态本身（每次调用 Hook 产生的是独立的新状态）。
- **父子组件通信黄金法则**：
  - **父传子**：通过 `Props` 传递数据（只读参数）；
  - **子传父**：父组件传递一个函数 `callback(data)` 给子组件，子组件在发生事件时调用该函数（类比 Java 的观察者监听器模式或 `Consumer<T>`）。
- **组件划分心智**：
  - **Smart Component（容器组件）**：管“数据从哪里来、状态怎么变”；
  - **Dumb Component（展示组件）**：管“界面怎么画、接收什么 Props 就画什么”。

### ⚠️ 编码前必读的 2 个坑

- **自定义 Hook 命名必须以 `use` 开头**：React 的 ESLint 插件和运行时通过 `useXxx` 前缀识别 Hook。如果不以 `use` 开头，将无法在里面使用 `useState` / `useEffect`。
- **Props 是绝对只读的**：在子组件 `UserSearchBar` 里绝对不能直接修改 `props.keyword = '...'`，必须调用父组件传下来的 `props.onKeywordChange(...)`。

---

## ✅ 验收标准

- [ ] 成功封装 `useUsers` 自定义 Hook，数据请求与刷新逻辑从 UI 中解耦；
- [ ] 成功拆分 `UserSearchBar` 与 `UserCard` 子组件，Props 契约严谨（带 TS 类型）；
- [ ] 父子通信流畅，搜索过滤、刷新、Loading、Error 表现与 TASK-004 一致；
- [ ] 通过教练 Code Review 并通关归档。

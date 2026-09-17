# 学习进度与知识看板 (learning.md)

> 当前状态：**TASK-003 已通关 ✅ ｜ 推荐开启 TASK-004 - Day 1（2026-09-17）**
> 核心策略：**先理解 → 自己写 → 教练 Review → 纠错修改 → 总结归纳**

---

## 📌 当前任务状态

| 任务编号 | 任务名称 | 状态 | 代码工作区 | 完成时间 |
| :--- | :--- | :---: | :--- | :--- |
| [`TASK-001`](./tasks/TASK-001-counter.md) | 全功能计数器 (Counter) | ✅ 已通关 | `src/exercises/TASK-001-counter/Counter.tsx` | 2026-09-17 · 验收通过，已通关归档 |
| [`TASK-002`](./tasks/TASK-002-todo.md) | 经典待办清单 (Todo List) | ✅ 已通关 | `src/exercises/TASK-002-todo/TodoList.tsx` | 2026-09-17 · 验收通过，已通关归档 |
| [`TASK-003`](./tasks/TASK-003-form.md) | 受控表单与多字段联动 | ✅ 已通关 | `src/exercises/TASK-003-form/UserForm.tsx` | 2026-09-17 · 验收通过，已通关归档 |

**TASK-003 总结**：
- 深刻掌握了复杂对象型表单状态的统一管理范式（`useState<FormData>`），类比 Spring MVC 的 `@ModelAttribute DTO`；
- 熟练运用 ES6 动态计算属性名（Computed Property Names `[name]: value`），利用单一 `handleChange` 驱动多字段联动；
- 深入剖析了 TypeScript 编译期类型擦除（Type Erasure）本质，彻底分清了 TS `interface` 纯类型与 JS 原生对象字面量 `{}`、原生全局类 `window.FormData` 的界限；
- 熟练运用 React 合成事件 `React.ChangeEvent<HTMLInputElement | HTMLSelectElement>` 与联合类型泛型约束；
- 建立了纯函数派生属性思想（`disabled={!formData.agree}`），杜绝冗余 State，实现严谨的前端字段校验与数据彻底复位。

**下一步推荐目标**：开启 [`TASK-004: 调用后端 API 联调 (对接 Spring)`](./tasks/TASK-004-api.md)（深入掌握 `useEffect` 副作用监听、数据请求、三态处理 Loading/Error/Data 与前后端 DTO 契约对接）。

---

## 🎯 当前学习阶段

- **当前路线**：React 副作用生命周期 + 前后端 API 联调
- **主攻方向**：
  1. `useEffect` 机制与依赖项数组（类比后端事件监听/初始化）
  2. 异步数据请求与经典三态管理（Loading / Error / Success Data）
  3. 前后端 DTO 强类型契约对接与网络异常防御

---

## 🗺️ 阶段路线里程碑

| 阶段 | 主题 | 核心目标 | 状态 |
| :--- | :--- | :--- | :---: |
| **阶段 1** | **TypeScript 核心基石** | 掌握类型系统，克服从 Java 名义类型向结构化类型的转变 | 🟡 进行中 |
| **阶段 2** | **React 组件与 JSX** | 理解 JSX 语法本质、函数组件、Props 单向数据流 | 🟡 进行中 |
| **阶段 3** | **State 与交互 (useState)** | 理解组件重渲染机制、不可变数据原则、事件处理 | ✅ 阶段基石建立（TASK-001 通关） |
| **阶段 4** | **列表、Key 与表单受控组件** | 掌握 `map` 渲染、Key 的底层机制、多表单受控输入 | ✅ 阶段通关（TASK-002, TASK-003 通关） |
| **阶段 5** | **副作用与生命周期 (useEffect)** | 掌握数据请求、定时器清理、依赖项数组机制 | 🟡 待开启（推荐 TASK-004） |
| **阶段 6** | **组件拆分与通信** | 父子通信、状态提升、自定义 Hook 抽离逻辑 | ⚪ 未开始 |
| **阶段 7** | **React Router 前端路由** | 单页应用导航、动态路由传参、路由守卫思路 | ⚪ 未开始 |
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

---

## 🔄 正在学习 (In Progress)

- [ ] **TS 基础与进阶**：
  - [ ] `interface` 属性定义（可选 `?`、只读 `readonly`）
  - [ ] `interface` 与 `type` 的区别与取舍
  - [ ] 联合类型 (`|`) 与 字面量类型
- [ ] **TASK-004 技能点（待开启）**：
  - [ ] `useEffect` 挂载执行与依赖项数组机制
  - [ ] 前端 HTTP 请求与三态管理（Loading / Error / Data）
  - [ ] 前后端 API 契约对接与 DTO 强类型标注

---

## ❓ 待攻克疑难点 (Backlog)

*（详细内容可在 `docx/questions/` 专属问答库中查看与演练）*

1. TypeScript 的结构类型系统（Structural Typing）与 Java 的名义类型系统（Nominal Typing）的思维切换（详见 `docx/questions/typescript.md` Q-TS-01）
2. React 为什么强调“不可变性”（Immutability），直接 `user.name = "Tom"` 会带来什么问题？（详见 `docx/questions/state-and-rendering.md` Q-SR-02）
3. `useState` 的异步更新心智模型与快照机制（详见 `docx/questions/state-and-rendering.md` Q-SR-01）
4. 为什么不能 `new FormData({...})`？TS 接口与 JS 原生对象构造函数有什么区别？（详见 `docx/questions/typescript.md` Q-TS-05）
5. 对象字面量中的 `[name]: value` 是什么意思？与 `name: value` 有何本质区别？（详见 `docx/questions/typescript.md` Q-TS-06）

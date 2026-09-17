# 学习进度与知识看板 (learning.md)

> 当前状态：**TASK-002 已通关 ✅ ｜ 推荐开启 TASK-003 - Day 1（2026-09-17）**
> 核心策略：**先理解 → 自己写 → 教练 Review → 纠错修改 → 总结归纳**

---

## 🎯 当前任务状态

| 任务编号 | 任务名称 | 状态 | 代码工作区 | 完成时间 |
| :--- | :--- | :---: | :--- | :--- |
| [`TASK-001`](./tasks/TASK-001-counter.md) | 全功能计数器 (Counter) | ✅ 已通关 | `src/exercises/TASK-001-counter/Counter.tsx` | 2026-09-17 · 验收通过，已通关归档 |
| [`TASK-002`](./tasks/TASK-002-todo.md) | 经典待办清单 (Todo List) | ✅ 已通关 | `src/exercises/TASK-002-todo/TodoList.tsx` | 2026-09-17 · 验收通过，已通关归档 |

**TASK-002 总结**：
- 完美掌握数组不可变更新三大核心范式（`[...prev, newTodo]`、`map` 属性覆盖、`filter` 断言过滤）；
- 深刻理解了对象展开运算符 `...` 在内存浅拷贝与不可变覆写中的机制（类比 Lombok `toBuilder` 与 Java Record）；
- 建立了基于业务主键稳定 `key={item.id}` 进行虚拟 DOM 高效比对的规范；
- 巩固了派生筛选（All / Active / Completed）与列表实时统计的纯函数心智。

**下一步推荐目标**：开启 [`TASK-003: 受控表单与多字段联动`](./tasks/TASK-003-form.md)（掌握复杂表单对象统一管理、动态属性名 `[name]: value` 与表单校验）。

---

## 🧭 当前学习阶段

- **当前路线**：React 状态流转 + 复杂表单与多字段联动
- **主攻方向**：
  1. 对象型表单状态的统一管理模式
  2. 动态计算属性名（Computed Property Names）
  3. 前端表单校验、错误状态收集与交互展示

---

## 🗺️ 阶段路线里程碑

| 阶段 | 主题 | 核心目标 | 状态 |
| :--- | :--- | :--- | :---: |
| **阶段 1** | **TypeScript 核心基石** | 掌握类型系统，克服从 Java 名义类型向结构化类型的转变 | 🔄 进行中 |
| **阶段 2** | **React 组件与 JSX** | 理解 JSX 语法本质、函数组件、Props 单向数据流 | 🔄 进行中 |
| **阶段 3** | **State 与交互 (useState)** | 理解组件重渲染机制、不可变数据原则、事件处理 | ✅ 阶段基石建立（TASK-001 通关） |
| **阶段 4** | **列表、Key 与表单受控组件** | 掌握 `map` 渲染、Key 的底层机制、多表单受控输入 | ✅ 核心已掌握（TASK-002 通关，TASK-003 进阶） |
| **阶段 5** | **副作用与生命周期 (useEffect)** | 掌握数据请求、定时器清理、依赖项数组机制 | ⚪ 未开始 |
| **阶段 6** | **组件拆分与通信** | 父子通信、状态提升、自定义 Hook 抽离逻辑 | ⚪ 未开始 |
| **阶段 7** | **React Router 前端路由** | 单页应用导航、动态路由传参、路由守卫思路 | ⚪ 未开始 |
| **阶段 8** | **Spring Boot + React 联调实战** | 跨域配置、Token 认证、CRUD 完整小项目独立开发 | ⚪ 未开始 |

---

## ✅ 已掌握技能栈 (Mastered)

- [x] **`useState` 基础与泛型**：状态声明、泛型标注与推导
- [x] **React 事件与表单拦截**：`onClick`、`onChange`、`onSubmit` 与 `e.preventDefault()`
- [x] **状态快照（Snapshot）心智模型**：单帧渲染函数执行模型，状态在当前帧不可变
- [x] **派生状态（Derived State）**：杜绝冗余 State，基于状态纯函数计算筛选列表与统计指标
- [x] **JavaScript Falsy 避坑**：识别 `||` 短路吞 0 缺陷，精确处理边界
- [x] **函数式更新范式**：`setTodos(prev => ...)` 处理并发与批处理数据依赖
- [x] **数组不可变添加**：`[...prev, newItem]`
- [x] **数组不可变修改**：`prev.map(t => t.id === id ? { ...t, prop: newVal } : t)`
- [x] **数组不可变删除**：`prev.filter(t => t.id !== targetId)`
- [x] **对象展开运算符 `...`**：键值对平铺、浅拷贝与同名属性覆盖机制
- [x] **列表渲染与 Key 规范**：使用稳定 UUID/ID，杜绝 `index` 做 key 导致的状态串行

---

## 🔄 正在学习 (In Progress)

- [ ] **TS 基础与进阶**：
  - [ ] `interface` 属性定义（可选 `?`、只读 `readonly`）
  - [ ] `interface` 与 `type` 的区别与取舍
  - [ ] 联合类型 (`|`) 与 字面量类型
- [ ] **TASK-003 技能点（待开启）**：
  - [ ] 复合表单对象统一管理：`useState<FormData>({ username: '', email: '', ... })`
  - [ ] 单一事件处理器：`[e.target.name]: e.target.value` 动态计算属性名
  - [ ] 错误状态收集对象：`Record<keyof FormData, string>`
  - [ ] 提交前完整校验与错误信息展示

---

## ❓ 待攻克疑难点 (Backlog)

*（详细内容可在 `docx/questions/` 专属问答库中查看与演练）*

1. TypeScript 的结构类型系统（Structural Typing）与 Java 的名义类型系统（Nominal Typing）的思维切换（详见 `docx/questions/typescript.md` Q-TS-01）
2. React 为什么强调“不可变性”（Immutability），直接 `user.name = "Tom"` 会带来什么问题？（详见 `docx/questions/state-and-rendering.md` Q-SR-02）
3. `useState` 的异步更新心智模型与快照机制（详见 `docx/questions/state-and-rendering.md` Q-SR-01）

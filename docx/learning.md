# 学习进度与知识看板 (learning.md)

> 当前状态：**TASK-001 已通关 ✅ ｜ 推荐开启 TASK-002 - Day 1（2026-09-17）**
> 核心策略：**先理解 → 自己写 → 教练 Review → 纠错修改 → 总结归纳**

---

## 🎯 当前任务状态

| 任务编号 | 任务名称 | 状态 | 代码工作区 | 完成时间 |
| :--- | :--- | :---: | :--- | :--- |
| [`TASK-001`](./tasks/TASK-001-counter.md) | 全功能计数器 (Counter) | ✅ 已通关 | `src/exercises/TASK-001-counter/Counter.tsx` | 2026-09-17 · 验收通过，已通关归档 |

**TASK-001 总结**：
- 成功掌握 `useState` 响应式心智模型与单帧常量快照机制；
- 识别并攻克了 JavaScript Falsy 短路吞 0 陷阱，建立了声明式派生状态校验（`isInvalidStep`）与按钮 `disabled` 交互；
- 理解了 TypeScript 编译期类型抹除与浏览器 JavaScript 运行时的深层关系。

**下一步推荐目标**：开启 [`TASK-002: 经典 Todo 清单`](./tasks/TASK-002-todo.md)（掌握数组不可变更新 `map/filter`、JSX 列表渲染与 Key 机制）。

---

## 🧭 当前学习阶段

- **当前路线**：React 状态流转 + TypeScript 基础契约
- **主攻方向**：
  1. 数组与对象不可变更新模式（Immutable Updates）
  2. JSX 列表渲染与 Key 底层机制
  3. 受控输入组件的类型交互

---

## 🗺️ 阶段路线里程碑

| 阶段 | 主题 | 核心目标 | 状态 |
| :--- | :--- | :--- | :---: |
| **阶段 1** | **TypeScript 核心基石** | 掌握类型系统，克服从 Java 名义类型向结构化类型的转变 | 🔄 进行中 |
| **阶段 2** | **React 组件与 JSX** | 理解 JSX 语法本质、函数组件、Props 单向数据流 | 🔄 进行中 |
| **阶段 3** | **State 与交互 (useState)** | 理解组件重渲染机制、不可变数据原则、事件处理 | ✅ 阶段基石建立（TASK-001 通关） |
| **阶段 4** | **列表、Key 与表单受控组件** | 掌握 `map` 渲染、Key 的底层机制、多表单受控输入 | 🔓 准备开启（TASK-002 驱动） |
| **阶段 5** | **副作用与生命周期 (useEffect)** | 掌握数据请求、定时器清理、依赖项数组机制 | ⚪ 未开始 |
| **阶段 6** | **组件拆分与通信** | 父子通信、状态提升、自定义 Hook 抽离逻辑 | ⚪ 未开始 |
| **阶段 7** | **React Router 前端路由** | 单页应用导航、动态路由传参、路由守卫思路 | ⚪ 未开始 |
| **阶段 8** | **Spring Boot + React 联调实战** | 跨域配置、Token 认证、CRUD 完整小项目独立开发 | ⚪ 未开始 |

---

## ✅ 已掌握技能栈 (Mastered)

- [x] **`useState<number>(0)`**：状态声明与泛型标注
- [x] **React 事件体系**：`onClick`、`onChange` 与基本事件对象类型绑定
- [x] **状态快照（Snapshot）心智模型**：理解单帧函数渲染逻辑，组件状态为何当前帧不可变
- [x] **派生状态（Derived State）**：杜绝冗余 State，基于状态直接计算颜色样式与 `disabled` 拦截
- [x] **JavaScript Falsy 避坑**：识别 `||` 短路吞噬数字 `0` 的缺陷，掌握精确边界校验
- [x] **函数式更新心智**：`setCount(prev => prev + step)` 的适用场景与并发批处理优势
- [x] **TypeScript 编译期抹除（Type Erasure）**：理解 TS 与运行时 JS 的关系

---

## 🔄 正在学习 (In Progress)

- [ ] **TS 基础与进阶**：
  - [ ] `interface` 属性定义（可选 `?`、只读 `readonly`）
  - [ ] `interface` 与 `type` 的区别与取舍
  - [ ] 联合类型 (`|`) 与 字面量类型
  - [ ] 泛型入门（对比 Java 泛型）
- [ ] **TASK-002 待解锁技能点**：
  - [ ] 数组状态不可变更新：禁止 `array.push`，使用 `[...array, newItem]`
  - [ ] 列表删除操作：不可变过滤 `array.filter(item => item.id !== targetId)`
  - [ ] 状态就地切换：不可变映射 `array.map(item => item.id === targetId ? { ...item, done: !item.done } : item)`
  - [ ] 列表渲染与 Key：为什么禁止使用数组下标 index 做 key

---

## ❓ 待攻克疑难点 (Backlog)

*（详细内容可在 `docx/questions/` 专属问答库中查看与演练）*

1. TypeScript 的结构类型系统（Structural Typing）与 Java 的名义类型系统（Nominal Typing）的思维切换（详见 `docx/questions/typescript.md` Q-TS-01）
2. React 为什么强调“不可变性”（Immutability），直接 `user.name = "Tom"` 会带来什么问题？（详见 `docx/questions/state-and-rendering.md` Q-SR-02）
3. `useState` 的异步更新心智模型与快照机制（详见 `docx/questions/state-and-rendering.md` Q-SR-01）

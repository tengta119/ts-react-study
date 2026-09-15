# 学习进度与知识看板 (learning.md)

> 当前状态：**准备起步 - Day 1**
> 核心策略：**先理解 → 自己写 → 教练 Review → 纠错修改 → 总结归纳**

---

## 🚩 当前学习阶段

- **当前路线**：TypeScript 基础语法与类型系统
- **主攻方向**：
  1. TypeScript 基础类型 vs Java 类型
  2. `interface` 与 `type`（契约声明）
  3. 函数类型与类型推导
  4. 联合类型与类型收窄

---

## 🗺️ 阶段路线里程碑

| 阶段 | 主题 | 核心目标 | 状态 |
| :--- | :--- | :--- | :---: |
| **阶段 1** | **TypeScript 核心基石** | 掌握类型系统，克服从 Java 名义类型向结构化类型的转变 | 🟡 进行中 |
| **阶段 2** | **React 组件与 JSX** | 理解 JSX 语法本质、函数组件、Props 单向数据流 | ⚪ 未开始 |
| **阶段 3** | **State 与交互 (useState)** | 理解组件重渲染机制、不可变数据原则、事件处理 | ⚪ 未开始 |
| **阶段 4** | **列表、Key 与表单受控组件** | 掌握 `map` 渲染、Key 的底层机制、多表单受控输入 | ⚪ 未开始 |
| **阶段 5** | **副作用与生命周期 (useEffect)** | 掌握数据请求、定时器清理、依赖项数组机制 | ⚪ 未开始 |
| **阶段 6** | **组件拆分与通信** | 父子通信、状态提升、自定义 Hook 抽离逻辑 | ⚪ 未开始 |
| **阶段 7** | **React Router 前端路由** | 单页应用导航、动态路由传参、路由守卫思路 | ⚪ 未开始 |
| **阶段 8** | **FastAPI + React 联调实战** | 跨域配置、Token 认证、CRUD 完整小项目独立开发 | ⚪ 未开始 |

---

## ✅ 已掌握技能栈 (Mastered)

*（通过教练 Code Review 与口试检验后，移动至此）*

- [ ] 暂无（等你点亮第一个知识点！）

---

## 📖 正在学习 (In Progress)

- [ ] **TS 基础**：
  - [ ] `string`, `number`, `boolean`, `any`, `unknown`
  - [ ] `interface` 属性定义（可选 `?`、只读 `readonly`）
  - [ ] `interface` 与 `type` 的区别与取舍
  - [ ] 联合类型 (`|`) 与 字面量类型
  - [ ] 泛型入门（对比 Java 泛型）

---

## ❓ 待攻克疑难点 (Backlog)

*（详细内容可在 `docx/questions/` 专属问答库中查看与演练）*

1. TypeScript 的结构类型系统（Structural Typing）与 Java 的名义类型系统（Nominal Typing）的思维切换（详见 `docx/questions/typescript.md` Q-TS-01）
2. React 为什么强调“不可变性”（Immutability），直接 `user.name = "Tom"` 会带来什么问题？（详见 `docx/questions/state-and-rendering.md` Q-SR-02）
3. `useState` 的异步更新心智模型与快照机制（详见 `docx/questions/state-and-rendering.md` Q-SR-01）

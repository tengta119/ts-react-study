# 📚 TS + React 学习系统文档中心 (docx/)

欢迎来到 **Java 后端专属的 TypeScript + React 学习文档中心**。
所有学习资产、路线看板、避坑题库和实践任务卡片均在此集中维护。

---

## 🧭 文档目录导航

### 1. 学习过程追踪
- 📊 [**`learning.md`**](./learning.md)：当前阶段、已掌握技能与阶段路线里程碑
- 📝 [**`mistakes.md`**](./mistakes.md)：避坑实录错题本（记录并剖析 Java 思维惯性带来的误区）

### 2. 专属问答知识库 (`questions/`)
> 当你向教练提出问题，教练解答后将以标准 Q&A 问答对形式归纳沉淀到以下分类中：
- 💡 [**`questions/README.md`**](./questions/README.md)：问答库总览与沉淀规范
- 🧩 [**`questions/typescript.md`**](./questions/typescript.md)：TS 类型系统、鸭子类型、泛型 Q&A
- ⚛️ [**`questions/react-core.md`**](./questions/react-core.md)：JSX、组件纯函数、Props 只读、虚拟 DOM Q&A
- 📦 [**`questions/state-and-rendering.md`**](./questions/state-and-rendering.md)：State 快照、不可变数据、重渲染机制 Q&A
- 🎣 [**`questions/hooks.md`**](./questions/hooks.md)：useState、useEffect 依赖、useRef Q&A
- 🌐 [**`questions/api-and-router.md`**](./questions/api-and-router.md)：前后端 API 联调、三态处理、SPA 前端路由 Q&A

### 3. Java 开发者专属认知笔记 (`notes/`)
- 📖 [**`notes/README.md`**](./notes/README.md)：笔记总览与 Java 心智模型映射表
- 🧩 [**`notes/typescript.md`**](./notes/typescript.md)：鸭子类型 vs Java 名义类型、interface 与 type、泛型
- ⚛️ [**`notes/react-component.md`**](./notes/react-component.md)：UI = f(state)、JSX 本质、Props 只读入参
- 📦 [**`notes/state.md`**](./notes/state.md)：状态不可变性原则 (Immutability) 与快照机制
- 🎣 [**`notes/hooks.md`**](./notes/hooks.md)：useEffect 响应式思维、useRef 跨渲染持久引用
- 🚦 [**`notes/router.md`**](./notes/router.md)：SPA 前端路由与 Spring MVC 控制器路由的区别

### 4. 任务驱动实践指南 (`tasks/`)
- 📋 [**`tasks/README.md`**](./tasks/README.md)：任务清单与实战通关指南
- 🎯 [**`tasks/TASK-001-counter.md`**](./tasks/TASK-001-counter.md)：全功能计数器（useState、步长、颜色）
- 🎯 [**`tasks/TASK-002-todo.md`**](./tasks/TASK-002-todo.md)：Todo 清单（不可变数组 map/filter、Key 本质）
- 🎯 [**`tasks/TASK-003-form.md`**](./tasks/TASK-003-form.md)：受控表单（多字段联动、校验与 DTO）
- 🎯 [**`tasks/TASK-004-api.md`**](./tasks/TASK-004-api.md)：对接 Spring Boot / Mock API（Loading/Error/Data 三态）

---

## ⚡ 配合 Pi 教练日常使用

- `/review`：提交当前正在编写的代码进行严格审查；
- `/quiz`：从 `docx/questions/` 抽取题目开启面试式口试；
- `/qa`：将刚才探讨的问答一键归纳整理沉淀到对应分类；
- `/task [id]`：开启指定任务，加载任务卡与概念精讲；
- `/explain [概念]`：按五步法深度剖析 React / TS 机制；
- `/mistake`：将刚才排查出的错误沉淀到 `mistakes.md`；
- `/coach`：汇报进度并给出下一步行动建议。

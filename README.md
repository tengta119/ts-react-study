# TS + React 学习系统 (Java 后端专属版)

本项目是专为 **Java 后端开发背景** 设计的 **TypeScript + React 刻意练习与实战系统**。

核心原则：**“不当代写机器，专注教练与陪练”**。
通过 **“概念理解 → 自主编码 → 教练 Review → 纠错修改 → 总结沉淀”** 循环，彻底掌握前端开发能力。

---

## 📁 系统目录架构

项目根目录保持干净清爽，所有学习跟踪与知识文档均归档在 `docx/` 目录下：

```text
vite-project/
│
├── AGENTS.md             # Pi Agent 核心教练规则（启动自动载入，防 AI 偷写代码）
│
├── docx/                 # 📚 学习系统专属文档中心
│   ├── learning.md       # 学习进度看板、阶段里程碑与知识掌握清单
│   ├── mistakes.md       # 错题本与避坑实录（Java 思维偏差剖析）
│   │
│   ├── questions/        # 💡 专属问答知识库（问答对沉淀池，支持 /quiz 口试）
│   │   ├── README.md     # 问答库索引与 Q&A 沉淀规范
│   │   ├── typescript.md # TS 类型系统与语法 Q&A
│   │   ├── react-core.md # JSX、组件与 Props 只读入参 Q&A
│   │   ├── state-and-rendering.md # State、不可变性与快照机制 Q&A
│   │   ├── hooks.md      # useState、useEffect、useRef Q&A
│   │   └── api-and-router.md # 前后端联调、三态管理与前端路由 Q&A
│   │
│   ├── notes/            # 📖 Java 后端定制心智模型笔记
│   │   ├── README.md     # 概念对照表与导航
│   │   ├── typescript.md # 结构化类型 (Duck typing) vs Java 名义类型
│   │   ├── react-component.md # 组件纯函数、JSX 本质、Props 只读入参
│   │   ├── state.md      # 状态不可变性 (Immutability) 与快照机制
│   │   ├── hooks.md      # useEffect 响应式心智与 useRef
│   │   └── router.md     # SPA 前端路由与 Spring MVC 路由差异
│   │
│   └── tasks/            # 🎯 任务驱动实践卡片
│       ├── README.md     # 任务通关清单
│       ├── TASK-001-counter.md # 任务 1：全功能计数器
│       ├── TASK-002-todo.md    # 任务 2：Todo 清单与不可变数组
│       ├── TASK-003-form.md    # 任务 3：受控表单与多字段联动
│       └── TASK-004-api.md     # 任务 4：对接 Spring Boot/API 三态处理
│
├── src/exercises/        # 🛠️ 你的实际编码工作区
│   ├── TASK-001-counter/ # 计数器练习文件
│   ├── TASK-002-todo/    # TodoList 练习文件
│   ├── TASK-003-form/    # 表单练习文件
│   └── TASK-004-api/     # API 联调练习文件
│
└── .pi/prompts/          # ⚡ Pi 专属快捷指令 (/review, /quiz, /qa, /task 等)
```

---

## 🚀 快速启动

1. **启动本地开发服务器**：
   ```bash
   npm run dev
   ```
   在浏览器中打开 `http://localhost:5173`，即可看到**交互式学习工作台**。

2. **开始第一个任务**：
   - 打开 `docx/tasks/TASK-001-counter.md`，阅读业务需求、API 提示与「编码前必读的坑」；
   - 直接在 `src/exercises/TASK-001-counter/Counter.tsx` 中编写代码（无需先向教练答辩思路）；
   - 编写完毕后向教练发起 Review：输入 `/review`。

---

## ⚡ 常用快捷指令 (Slash Commands)

| 指令 | 说明 | 示例 |
| :--- | :--- | :--- |
| `/review` | 请求教练对当前代码进行严格 Code Review | `/review Counter.tsx` |
| `/quiz` | 开启 React / TS 面试式口试（从 `docx/questions/` 抽查） | `/quiz` 或 `/quiz hooks` |
| `/qa` | 将刚才的提问与教练解答一键整理沉淀到对应分类文件 | `/qa ts 鸭子类型` |
| `/task` | 开启指定任务：加载任务卡与概念精讲 | `/task 001` |
| `/explain` | 按“底层机制 + Java 类比”五步法深度讲解概念 | `/explain useEffect依赖项` |
| `/mistake` | 将刚才排查出的错误与根因复盘记录到 docx/mistakes.md | `/mistake` |
| `/coach` | 召唤教练汇报当前学习进度与下一步建议 | `/coach` |

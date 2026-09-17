# 💡 专属问答知识库 (docx/questions/)

> **定位与机制**：
> 每当你向教练提出问题、教练完成解答后，教练会提炼该问题的核心矛盾，以 **Q&A（问答对）** 的规范格式自动或经确认后沉淀到本目录下的对应分类文档中。
> 这不仅是你的**前端专属问答百科全书**，更是日常主动回忆与 `/quiz` 口试考察的核心题源！

---

## 📂 分类文档导航

| 文档分类 | 归档主题 | 涵盖内容 |
| :--- | :--- | :--- |
| [**`typescript.md`**](./typescript.md) | **TypeScript 类型系统** | 结构化子类型（鸭子类型）、`interface` vs `type`、联合类型、泛型、Java 静态类型差异 |
| [**`react-core.md`**](./react-core.md) | **React 核心与组件** | JSX 编译本质、组件纯函数设计、Props 只读入参、虚拟 DOM、单向数据流 |
| [**`state-and-rendering.md`**](./state-and-rendering.md) | **状态与渲染机制** | State 心智模型、不可变数据原则（Immutability）、渲染快照（Snapshot）、重渲染触发条件 |
| [**`hooks.md`**](./hooks.md) | **React Hooks 深度解析** | `useState`, `useEffect` 依赖项与副作用、`useRef` 跨渲染持久化、闭包陷阱 |
| [**`api-and-router.md`**](./api-and-router.md) | **前后端交互与路由** | 对接 Spring Boot RESTful API、三态管理（Loading/Error/Data）、SPA 路由与浏览器历史 |

---

## 📝 标准 Q&A 沉淀规范模板

每个沉淀的 Q&A 条目统一遵循以下格式：

```markdown
### Q-[编号]: [简明扼要的问题陈述]
- **提问背景**：我在什么场景下产生了该疑问 / 我的初始直觉是什么？
- **核心解答 (Answer)**：
  - **现象与结论**：直接给出精确结论
  - **底层机制**：React 渲染循环 / TS 类型抹除 / JS 引用机制
- **Java / 后端对照视角 (Java Mapping)**：
  - Java 中对应的是什么概念？为什么在前端必须这样设计？
- **极简代码示范 (Code Demo)**：
  \`\`\`tsx
  // 最小代码对比
  \`\`\`
```

如有必要可以创建新的文档，来对用户的问题进行分类，然后更新这个 README.md

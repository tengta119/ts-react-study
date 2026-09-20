# 学习笔记索引与概念映射 (notes/README.md)

本目录为 **Java 后端量身定制的 TS + React 概念速查与精要笔记**。
重点在于**建立 Java 后端思维与前端现代框架的认知桥梁**，帮助你快速理解，避开常见坑。

---

## 🧭 笔记导航

| 笔记文件名 | 核心主题 | Java / 后端对照概念 |
| :--- | :--- | :--- |
| [`typescript.md`](./typescript.md) | TS 类型系统精髓 | `Class / Interface / Generics / 鸭子类型` |
| [`react-component.md`](./react-component.md) | 组件与 JSX 本质 | `视图函数 / 模板渲染 / 方法只读入参 (Props)` |
| [`state.md`](./state.md) | 状态机制与不可变数据 | `实例变量 / 内存引用 / 脏检查与浅比较` |
| [`hooks.md`](./hooks.md) | Hook 原理与常用工具 | `AOP / 事件监听 / 跨次调用持有引用 (useRef)` |
| [`router.md`](./router.md) | 前端路由与 SPA | `@RequestMapping / 路由分发与单页无刷新切换` |
| [`deploy.md`](./deploy.md) | 生产构建与部署（Nginx + `/api` 反代）| `mvn package / 静态资源托管 / 网关路由转发` |
| [`final-exam.md`](./final-exam.md) | **结业口试题库与参考答案（8 题）** | 跨 TASK-001~009 综合（防抖/竞态、401 vs 403、字段映射、SPA 部署…）|

---

## 💡 Java 开发者核心心智转换表

```text
Java 后端心智                           React 前端心智
-----------------------------------------------------------------------------------
1. OOP: 类、对象实例、可变状态        → 1. 函数式: UI = f(state)，纯函数渲染
2. 继承与多态 (Inheritance)           → 2. 组合优于继承 (Composition)
3. setter 直接修改对象内部字段        → 3. 不可变数据 (Immutability)，永远生成新引用
4. 名义类型 (Nominal Typing)         → 4. 结构类型 (Structural Typing，形状相同即相容)
5. 运行时强反射与 Class 元信息        → 5. 编译期类型检查，编译后抹除（纯 JS 运行时）
6. 线程模型与同步阻塞                 → 6. 单线程事件循环 (Event Loop) + 异步非阻塞
```

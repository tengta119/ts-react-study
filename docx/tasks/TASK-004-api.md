# TASK-004: 对接后端 API 与副作用处理 (API Integration)

> **目标**：掌握在 React 中发起 HTTP 请求的黄金范式（加载态 Loading、成功态 Data、失败态 Error）、`useEffect` 依赖管理以及前后端 DTO 契约对齐。
> **代码工作区**：`src/exercises/TASK-004-api/UserListApi.tsx`

---

## 🎯 业务需求

模拟一个从 Spring Boot 后端（或者公开 Mock API，如 `https://jsonplaceholder.typicode.com/users`）拉取用户列表的场景：
1. **三种 UI 状态完备渲染**：
   - **加载中（Loading）**：显示骨架屏或 Loading 动画转圈提示；
   - **加载失败（Error）**：显示友好的错误提示信息，并提供“点击重试”按钮；
   - **加载成功（Data）**：以卡片网格列表的形式展示用户信息（姓名、邮箱、公司名、城市）。
2. **过滤/搜索**：
   - 提供一个前端搜索框，支持根据姓名实时模糊搜索；
3. **手动刷新**：
   - 提供一个“刷新数据”按钮，点击后重新触发请求。

---

## 🧠 动手前思考（请先回答给教练！）

1. 在 Spring Boot 中，后端返回的标准响应体通常类似 `Result<T> { code, message, data }`。在 TypeScript 中，你该如何定义这个 API 响应契约？
2. 为什么要将 API 请求写在 `useEffect` 内部，而不能直接写在组件函数顶层？如果直接在组件顶层写 `fetch()` 会发生什么？
3. 在 `useEffect` 的清理函数（cleanup）中，如果用户在请求未完成前就离开了该页面，如何使用浏览器的 `AbortController` 优雅取消请求？

---

## 🧰 所需知识点与提示

- TypeScript 接口声明：
  ```ts
  interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
  }
  ```
- 三态管理：
  ```ts
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  ```
- `useEffect` 首次加载：
  ```ts
  useEffect(() => {
    let ignore = false;
    // 请求逻辑...
    return () => { ignore = true; };
  }, []);
  ```

---

## 🏆 验收标准

- [ ] 覆盖 Loading、Error、Success 三种状态；
- [ ] 能够正常拉取数据并成功渲染；
- [ ] 包含重试与刷新机制；
- [ ] 提交给教练进行 Code Review 并记录学习心得。

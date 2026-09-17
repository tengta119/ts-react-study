# TASK-004: 对接后端 API 与副作用处理 (API Integration)

> **目标**：掌握在 React 中发起 HTTP 请求的黄金范式（加载态 Loading、成功态 Data、失败态 Error）、`useEffect` 依赖管理以及前后端 DTO 契约对齐。
> **代码工作区**：`src/exercises/TASK-004-api/UserListApi.tsx`

---

## 🎯 业务需求

模拟一个从 Spring Boot / FastAPI 后端拉取用户列表的场景：
1. **三种 UI 状态完备渲染**：
   - **加载中（Loading）**：显示骨架屏或 Loading 动画转圈提示；
   - **加载失败（Error）**：显示友好的错误提示信息，并提供“点击重试”按钮；
   - **加载成功（Data）**：以卡片网格列表的形式展示用户信息（姓名、邮箱、公司名、城市）。
2. **过滤/搜索**：
   - 提供一个前端搜索框，支持根据姓名与邮箱实时模糊搜索；
3. **手动刷新**：
   - 提供一个“刷新数据”按钮，点击后重新触发请求。

---

## 💡 所需知识点与提示

- TypeScript 接口声明：
  ```ts
  interface ApiUser {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string;
    company?: {
      name: string;
    };
  }
  ```
- 三态管理：
  ```ts
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  ```
- `useEffect` 首次加载：
  ```ts
  useEffect(() => {
    fetchUsers();
  }, []);
  ```

### ⚠️ 编码前必读的 2 个坑

- **绝不要在组件函数顶层直接 `fetch()`**：组件函数每次渲染都会重新执行，会造成请求风暴甚至无限循环；请求要么放在 `useEffect`，要么放在事件处理器里。
- **组件卸载后不要再 `setState`**：用 `let ignore = false` + 清理函数置为 `true` 来忽略过期响应，或使用 `AbortController` 真正取消请求。
- **三个状态要同时维护好**：`loading` / `error` / `users` 必须互斥清晰（例如请求开始时 `setError(null)`），否则会出现“又转圈又报错”的矛盾 UI。

---

## ✅ 验收标准

- [x] 覆盖 Loading、Error、Success 三种状态；
- [x] 能够正常拉取数据并成功渲染；
- [x] 包含重试与刷新机制；
- [x] 提交给教练进行 Code Review 并记录学习心得。

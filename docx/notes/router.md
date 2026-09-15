# React 前端路由与 SPA 心智模型 (router.md)

## 1. 传统后端路由 vs 前端路由

### 传统后端路由（Spring Boot `@RequestMapping`）
- 浏览器输入 `GET /users` → 请求发到服务器 → Controller 返回一个完整的 HTML 页面（或者重定向）。
- 浏览器**整页白屏刷新**，重新下载所有 CSS/JS。

### 前端路由（Single Page Application 单页应用）
- 整个网站**只有一个 index.html**。
- 浏览器地址栏变化（如从 `/home` 切换到 `/profile`）通过 HTML5 History API (`pushState`) 监听拦截。
- **浏览器根本不向后端发页面请求**，而是前端 JS 代码直接把旧组件卸载，挂载新组件显示。
- 用户体验极度丝滑，无白屏刷新。

---

## 2. 现代 React Router 核心概念速览

```tsx
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      {/* 类似超链接，但不会导致整页刷新 */}
      <nav>
        <Link to="/">首页</Link>
        <Link to="/todos">待办列表</Link>
      </nav>

      {/* 路由分发器，根据 URL 决定渲染哪个组件 */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/todos" element={<TodoListPage />} />
        <Route path="/todos/:id" element={<TodoDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 关键概念与对应 Hook
- `<Link to="...">`：声明式导航，代替传统 `<a href="...">`。
- `useNavigate()`：编程式跳转（例如表单提交成功后用 `navigate('/todos')` 跳转）。
- `useParams()`：获取路径参数（如 `/todos/:id` 中的 `const { id } = useParams()`，类似 Spring 的 `@PathVariable`）。
- `useSearchParams()`：获取查询参数（如 `?search=react`，类似 Spring 的 `@RequestParam`）。

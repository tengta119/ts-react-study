import type React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { UserPagedList } from '../TASK-007-http-layer/UserPagedList';
import { NotFoundPage } from '../TASK-006-router/pages/NotFoundPage';
import { AuthProvider } from './AuthProvider';
import { AppHeader } from './components/AppHeader';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';

/**
 * TASK-008: 认证 + 路由守卫演示应用（根组件）
 *
 * 架构要点：
 *   <AuthProvider> 必须包裹在 <BrowserRouter> 的**外层或内层都可以**，但要注意：
 *     - 若守卫/组件里需要用到 useNavigate / useLocation，那它们必须在 BrowserRouter 内部；
 *     - 本文件把 AuthProvider 放在最外层，因此 AuthProvider 内部**不能**用路由 Hooks
 *       （这也是为什么"全局 401 跳登录"不应在 Context 里用 useNavigate，而要走
 *          window.location 或事件广播 —— 留作进阶思考题）。
 *
 * 路由表：
 *   /          → 首页概览（公开）
 *   /login     → 登录页（公开）
 *   /profile   → 个人中心（🔒 需要登录）
 *   /users     → 用户分页列表（🔒 需要登录，直接复用 TASK-007 的成果）
 *   *          → 404
 */
export const AuthApp: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '16px' }}>
          {/* 顶栏是被 Provider 包住的【子组件】，所以它内部可以 useAuth() 读取登录态；
              若直接写在本组件里，就变成“提供者自己消费自己” → 拿不到值（详见 Q-RC-13）。 */}
          <AppHeader />

          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* 受保护路由：未登录访问会被 <ProtectedRoute> 重定向到 /login */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <UserPagedList />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

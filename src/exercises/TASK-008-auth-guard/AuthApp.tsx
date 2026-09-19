import type React from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { UserPagedList } from '../TASK-007-http-layer/UserPagedList';
import { NotFoundPage } from '../TASK-006-router/pages/NotFoundPage';
import { AuthProvider } from './AuthProvider';
// 💡 实现 TODO ⑥ 后取消下面这行注释，并用 <ProtectedRoute> 包裹 /profile 与 /users：
// import { ProtectedRoute } from './components/ProtectedRoute';
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
  const getNavLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    padding: '8px 16px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: isActive ? 600 : 500,
    backgroundColor: isActive ? '#2563eb' : 'transparent',
    color: isActive ? '#ffffff' : '#64748b',
  });

  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '16px' }}>
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              padding: '12px 20px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>
              🔐 企业内网平台（需登录）
            </div>

            <nav style={{ display: 'flex', gap: '8px' }}>
              <NavLink to="/login" style={getNavLinkStyle}>
                登录
              </NavLink>
              <NavLink to="/profile" style={getNavLinkStyle}>
                个人中心
              </NavLink>
              <NavLink to="/users" style={getNavLinkStyle}>
                用户列表
              </NavLink>
            </nav>
          </header>

          <main>
            <Routes>
              <Route
                path="/"
                element={
                  <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.9 }}>
                    <h3 style={{ marginTop: 0, color: '#0f172a' }}>
                      📘 TASK-008 演示：登录态、路由守卫与 401 处理
                    </h3>
                    <p>
                      演示账号：<code>admin / admin123</code>（ADMIN）、
                      <code>guest / guest123</code>（GUEST）
                    </p>
                    <p>
                      请先实现 <code>TODO ①②③</code>（tokenStore / authApi / AuthProvider），
                      再用 <code>admin</code> 登录验证。
                    </p>
                  </div>
                }
              />
              <Route path="/login" element={<LoginPage />} />

              {/* ================== TODO ⑦【你来实现：把守卫接上】==================
                  /profile 与 /users 目前是**直接放行**的（未登录也能访问）。
                  请你在实现 TODO ⑥ 的 ProtectedRoute 之后，把这两个路由包起来：

                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />

                  验收标准：未登录时访问 /profile 或 /users，地址栏会变成 /login；
                            登录后可以正常进入；点浏览器"后退"不会在两者之间来回弹。
                  ================================================================== */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/users" element={<UserPagedList />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

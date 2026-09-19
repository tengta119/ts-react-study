import type React from 'react';
import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../TASK-008-auth-guard/AuthProvider';
import { AppHeader } from '../TASK-008-auth-guard/components/AppHeader';
import { ProtectedRoute } from '../TASK-008-auth-guard/components/ProtectedRoute';
import { NotFoundPage } from '../TASK-006-router/pages/NotFoundPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { DashboardPage } from './pages/DashboardPage';
import { UserDetailPage } from './pages/UserDetailPage';

/**
 * TASK-009: 全栈中后台控制台（根组件）
 *
 * 装配思路（对比 TASK-008 的 AuthApp）：
 *   ① 直接复用 TASK-008 的 AuthProvider / AppHeader / ProtectedRoute（基础设施不重复造）
 *   ② 布局升级为「侧边栏 + 内容区」，路由表全部挂在受保护区间内
 *   ③ AppHeader 在 Provider + Router 内部 → 可以读登录态（Q-RC-13 的约束）
 *
 * 路由表：
 *   /            → 重定向到 /dashboard
 *   /dashboard   → 仪表盘（🔒）
 *   /users       → 用户管理 CRUD（🔒）
 *   /users/:id   → 用户详情（🔒）
 *   *            → 404
 */
const sideLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  display: 'block',
  padding: '10px 12px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: isActive ? 600 : 500,
  backgroundColor: isActive ? '#2563eb' : 'transparent',
  color: isActive ? '#ffffff' : '#cbd5e1',
});

export const AdminApp: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
          {/* 顶栏：复用 TASK-008 的实现（登录态展示 + 退出） */}
          <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '16px 16px 0' }}>
            <AppHeader />
          </div>

          <div
            style={{
              maxWidth: '1080px',
              margin: '0 auto',
              padding: '0 16px 24px',
              display: 'grid',
              gridTemplateColumns: '180px 1fr',
              gap: '16px',
              alignItems: 'start',
            }}
          >
            {/* 侧边导航 */}
            <aside
              style={{
                backgroundColor: '#0f172a',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ color: '#64748b', fontSize: '12px', padding: '4px 12px 8px' }}>
                管理菜单
              </div>
              <NavLink to="/dashboard" style={sideLinkStyle}>
                📊 仪表盘
              </NavLink>
              <NavLink to="/users" style={sideLinkStyle} end>
                👥 用户管理
              </NavLink>
            </aside>

            {/* 内容区：所有业务页面都在受保护区间 */}
            <main
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '20px',
                minHeight: '420px',
              }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users/:id"
                  element={
                    <ProtectedRoute>
                      <UserDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { UserDetailPage } from './pages/UserDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UserManager } from '../TASK-005-refactor-hook/UserManager';
import { UserForm } from '../TASK-003-form/UserForm';

/**
 * TASK-006: 现代单页应用 (SPA) 路由根组件
 * 
 * 🎯 关键架构：
 * 1. <BrowserRouter>: 提供基于 HTML5 History API 的客户端无刷新路由环境
 * 2. <NavLink>: 自带 isActive 激活状态检测的平滑跳转标签 (杜绝原生 <a> 的白屏刷新)
 * 3. <Routes> & <Route>: 集中式路由映射分发表 (类比 Spring MVC HandlerMapping)
 */
export const RouterApp: React.FC = () => {
  // 动态激活样式的辅助函数
  const getNavLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    padding: '8px 16px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: isActive ? 600 : 500,
    backgroundColor: isActive ? '#2563eb' : 'transparent',
    color: isActive ? '#ffffff' : '#64748b',
    transition: 'all 0.15s ease',
  });

  return (
    <BrowserRouter>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
        {/* 顶部全局路由导航栏 */}
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
            🌐 企业中台 SPA
          </div>

          <nav style={{ display: 'flex', gap: '8px' }}>
            <NavLink to="/" style={getNavLinkStyle} end>
              🏠 首页
            </NavLink>
            <NavLink to="/users" style={getNavLinkStyle}>
              👥 用户中心
            </NavLink>
            <NavLink to="/register" style={getNavLinkStyle}>
              📝 快速注册
            </NavLink>
          </nav>
        </header>

        {/* 路由视图分发中心 (根据当前 URL 动态挂载对应组件) */}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/users" element={<UserManager />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
            <Route path="/register" element={<UserForm />} />
            {/* 404 兜底路由 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

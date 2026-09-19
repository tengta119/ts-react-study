import type React from 'react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

/**
 * TASK-008: 应用顶栏（导航栏 + 登录态展示）
 *
 * 为什么必须把它抽成独立组件？
 *   <AuthProvider> 是在 AuthApp 的 JSX 里**返回**出来的，而 Context 的作用域只向下（子树）
 *   —— "提供者自己不在自己的作用域里"（详见 Q-RC-13）。
 *   所以凡是需要 `useAuth()` 的 UI（如本组件），都必须是被 Provider 包住的**子组件**。
 *
 * 放置约束：本组件内部同时用到两类上下文，因此必须同时被它们包住：
 *   ① useAuth()      → 需要在 <AuthProvider> 内部
 *   ② NavLink / useNavigate → 需要在 <BrowserRouter> 内部
 *   （AuthApp 里的嵌套顺序 <AuthProvider><BrowserRouter>… 正好同时满足）
 */

/**
 * 导航项样式：纯函数、不依赖组件内部任何 props/state → 放在模块顶层（组件之外）即可。
 * 判断依据：**依赖渲染数据的写里面，纯常量化的写外面。**
 */
const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  padding: '6px 12px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: isActive ? 600 : 500,
  backgroundColor: isActive ? '#2563eb' : 'transparent',
  color: isActive ? '#ffffff' : '#64748b',
});

export const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 纯 UI 状态：登出请求期间禁用按钮，避免连点
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // 必须 await：logout() 内部是“先 await 服务端，再在 finally 里清 token/清 user”
      await logout();
      // 这里显式跳转，是为了覆盖“用户当前停在公开页面（如 /）”的场景；
      // 若他正停在受保护页面，守卫此刻也会做同样的事 —— 方向一致，不会冲突。
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
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
        🔐 企业内网平台
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* 公开入口：任何人都能进 */}
        <NavLink to="/" style={navLinkStyle} end>
          首页
        </NavLink>

        {user === null ? (
          // ── 未登录：只暴露公开入口，受保护入口不出现 ──
          <>
            <NavLink to="/login" style={navLinkStyle}>
              登录
            </NavLink>
            <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }}>未登录</span>
          </>
        ) : (
          // ── 已登录：展示身份 + 受保护入口 + 登出 ──
          <>
            <NavLink to="/profile" style={navLinkStyle}>
              个人中心
            </NavLink>
            <NavLink to="/users" style={navLinkStyle}>
              用户列表
            </NavLink>

            {/* 身份标识：用户名的首字作头像（纯派生展示，无需 state） */}
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                marginLeft: '4px',
              }}
            >
              {user.name.slice(0, 1)}
            </span>
            <span style={{ fontSize: '13px', color: '#334155' }}>{user.name}</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '4px',
                padding: '2px 6px',
                color: user.role === 'ADMIN' ? '#1d4ed8' : '#475569',
                backgroundColor: user.role === 'ADMIN' ? '#dbeafe' : '#e2e8f0',
              }}
            >
              {user.role}
            </span>

            {/* 表单外也保持写 type="button" 的习惯：按钮默认 type 是 submit */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                marginLeft: '4px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #fecaca',
                backgroundColor: loggingOut ? '#f1f5f9' : '#fef2f2',
                color: '#b91c1c',
                fontSize: '13px',
                fontWeight: 600,
                cursor: loggingOut ? 'not-allowed' : 'pointer',
              }}
            >
              {loggingOut ? '退出中…' : '退出'}
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

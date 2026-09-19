import type React from 'react';

/**
 * TASK-008: 演示首页（公开页面）
 *
 * 抽成独立组件的理由：路由表只应表达"访问策略"（哪些路径公开、哪些需要登录），
 * 不该内联大段展示 JSX —— 否则"一眼审出全局策略"的价值就丢了。
 * （与 TASK-006 把页面放进 pages/ 的做法保持一致）
 */
export const HomePage: React.FC = () => {
  return (
    <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.9 }}>
      <h3 style={{ marginTop: 0, color: '#0f172a' }}>
        📘 TASK-008 演示：登录态、路由守卫与 401 处理
      </h3>

      <p>
        演示账号：<code>admin / admin123</code>（ADMIN）、<code>guest / guest123</code>（GUEST）
      </p>

      <p style={{ color: '#64748b' }}>
        未登录时导航栏只显示「首页 / 登录」；登录后才会出现「个人中心 / 用户列表」
        （受保护入口只在登录后可见）。直接手输 URL 访问受保护路径，会被路由守卫重定向到登录页。
      </p>
    </div>
  );
};

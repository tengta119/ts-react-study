import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 路由页面: 404 页面未找到 (NotFoundPage)
 * 对应路径: * (通配符兜底)
 */
export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <h1 style={{ fontSize: '48px', color: '#ef4444', margin: '0 0 12px 0' }}>404</h1>
      <h3 style={{ color: '#1e293b', margin: '0 0 8px 0' }}>抱歉，您访问的页面不存在！</h3>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
        React Router 的通配符 <code>path="*"</code> 成功捕获到了无效的 URL 地址。
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          background: '#2563eb',
          color: '#ffffff',
          textDecoration: 'none',
          borderRadius: '6px',
          fontSize: '14px',
        }}
      >
        🏠 返回系统首页
      </Link>
    </div>
  );
};

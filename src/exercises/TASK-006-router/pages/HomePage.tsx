import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 路由页面: 首页 (HomePage)
 * 对应路径: /
 */
export const HomePage: React.FC = () => {
  return (
    <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ color: '#0f172a', marginTop: 0 }}>🏠 欢迎来到全栈工程师管理中心</h2>
      <p style={{ color: '#475569', lineHeight: 1.6 }}>
        这是一个基于 <strong>React 19 + TypeScript + React Router v7</strong> 构建的单页应用（SPA）。
        无论你怎么在顶部切换页面，浏览器<strong>绝对不会发生白屏整页刷新</strong>！
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>👥 用户中心 (List & Detail)</h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>
            查看团队架构师列表，点击卡片通过动态路由 <code>/users/:id</code> 查阅详情。
          </p>
          <Link
            to="/users"
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              background: '#2563eb',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '13px',
            }}
          >
            前往用户中心 →
          </Link>
        </div>

        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>📝 新增成员 (Register)</h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>
            基于受控表单录入新工程师，提交信息并拦截整页刷新。
          </p>
          <Link
            to="/register"
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              background: '#10b981',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '13px',
            }}
          >
            前往录入表单 →
          </Link>
        </div>
      </div>
    </div>
  );
};

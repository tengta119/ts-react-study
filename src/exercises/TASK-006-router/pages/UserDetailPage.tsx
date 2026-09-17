import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ApiUser } from '../../TASK-005-refactor-hook/types';

/**
 * 路由页面: 用户详情页 (UserDetailPage)
 * 对应路径: /users/:id (动态路由)
 * 
 * 🎯 关键技术点：
 * 1. useParams<{ id: string }>() 提取 URL 路径中的动态参数 :id (类比 Spring @PathVariable)
 * 2. useNavigate() 编程式导航回退或跳转 (类比 redirect:)
 * 3. 根据提取到的 id 发起 HTTP 请求查询单个用户
 */
export const UserDetailPage: React.FC = () => {
  // 1. 从 URL 路由中提取动态占位符 :id
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 数据与状态
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 守卫：如果 URL 里根本没有 id，直接返回
    if (!id) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/users/${id}`);
        if (!res.ok) {
          throw new Error(`未找到 ID=${id} 的用户详情 (状态码: ${res.status})`);
        }
        const data: ApiUser = await res.json();
        setUser(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '查询异常');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]); // 依赖项为 id：当 URL 中的 id 切换时自动重新查询

  return (
    <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      {/* 编程式导航：点击返回列表 */}
      <button
        onClick={() => navigate('/users')}
        style={{
          padding: '6px 12px',
          background: '#f1f5f9',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#334155',
        }}
      >
        ⬅️ 返回用户列表
      </button>

      <h3>👤 用户详细信息档案 (动态路由: <code>/users/{id}</code>)</h3>

      {loading && <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>⏳ 正在加载用户详情...</div>}

      {error && (
        <div style={{ padding: '14px', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '6px', color: '#991b1b' }}>
          ❌ {error}
        </div>
      )}

      {!loading && !error && user && (
        <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', lineHeight: 1.8 }}>
          <p><strong>姓名：</strong> {user.name}</p>
          <p><strong>登录名：</strong> <code>{user.username}</code></p>
          <p><strong>邮箱：</strong> {user.email}</p>
          <p><strong>电话：</strong> {user.phone}</p>
          <p><strong>归属团队：</strong> {user.company?.name || '个人工程师'}</p>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';

/**
 * TASK-004: 对接后端 API 与副作用处理
 *
 * 🎯 你的目标：
 * 1. 定义 ApiUser 接口（与后端 JSON 契约对齐）
 * 2. 使用 useEffect 发起异步请求，覆盖 Loading / Error / Data 三种状态
 * 3. 增加关键词过滤搜索
 * 4. 增加“重新请求”刷新按钮
 */

export interface ApiUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  company?: {
    name: string;
  };
}

export const UserListApi: React.FC = () => {
  // 数据与三态
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 搜索关键字
  const [keyword, setKeyword] = useState<string>('');

  // 触发重新拉取的标记或函数
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // 演示用公开测试接口，日后可替换为你的 Spring Boot 后端接口 (如 http://localhost:8080/api/users)
      const res = await fetch('https://jsonplaceholder.typicode.com/users');
      if (!res.ok) {
        throw new Error(`HTTP 错误: 状态码 ${res.status}`);
      }
      const data: ApiUser[] = await res.json();
      setUsers(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('未知网络异常');
      }
    } finally {
      setLoading(false);
    }
  };

  // TODO: 思考为什么不能在组件函数顶层直接调用 fetchUsers()，而必须放入 useEffect？
  useEffect(() => {
    fetchUsers();
  }, []);

  // 派生状态：根据搜索框过滤用户
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(keyword.toLowerCase()) ||
    u.email.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>TASK-004: 后端 API 用户列表</h2>
        <button
          onClick={fetchUsers}
          disabled={loading}
          style={{ padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? '加载中...' : '🔄 刷新数据'}
        </button>
      </div>

      <input
        type="text"
        placeholder="输入姓名或邮箱过滤..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ width: '100%', padding: '8px 12px', marginBottom: '16px', boxSizing: 'border-box' }}
      />

      {/* 加载态 */}
      {loading && <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>⏳ 正在向后端请求数据...</div>}

      {/* 错误态 */}
      {error && (
        <div style={{ padding: '16px', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '6px', color: '#991b1b' }}>
          ❌ 发生错误: {error}
          <div style={{ marginTop: '8px' }}>
            <button onClick={fetchUsers} style={{ padding: '4px 10px', cursor: 'pointer' }}>重试</button>
          </div>
        </div>
      )}

      {/* 成功态 */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                background: '#ffffff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <h4 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>{user.name}</h4>
              <p style={{ margin: '2px 0', fontSize: '13px', color: '#4b5563' }}>📧 {user.email}</p>
              <p style={{ margin: '2px 0', fontSize: '13px', color: '#4b5563' }}>🏢 {user.company?.name || '个人开发者'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

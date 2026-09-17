import React, { useState } from 'react';
import { useUsers} from './useUsers';
import { UserSearchBar } from './components/UserSearchBar';
import { UserCard } from './components/UserCard';

/**
 * TASK-005: 容器组件 (Smart/Container Component)
 * 
 * 🎯 职责：
 * 1. 调用自定义 Hook 获取业务数据能力 (useUsers)；
 * 2. 维护局部 UI 交互状态 (keyword)；
 * 3. 组织和派生渲染数据 (filteredUsers)；
 * 4. 装配子组件，向子组件传递 Props 和事件回调。
 */
export const UserManager: React.FC = () => {
  // 1. 从自定义 Hook 中获取数据状态与刷新方法
  const { users, loading, error, refetch, removeUser } = useUsers();
  // 2. 局部交互状态：搜索关键字
  const [keyword, setKeyword] = useState<string>('');

  // 3. 纯函数派生过滤
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(keyword.toLowerCase()) ||
      u.email.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
      <h2>TASK-005: 组件拆分与自定义 Hook 实战</h2>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
        架构：<code>useUsers()</code> 逻辑 Hook + <code>UserSearchBar</code> 交互组件 + <code>UserCard</code> 展示组件
      </p>

      {/* 4. 装配搜索栏子组件 (父传子 Props + 子传父回调) */}
      <UserSearchBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        onRefresh={refetch}
        loading={loading}
      />

      {/* 5. 异常态展示 */}
      {error && (
        <div style={{ padding: '14px', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '6px', color: '#991b1b', marginBottom: '16px' }}>
          ❌ 获取数据失败: {error}
          <button onClick={refetch} style={{ marginLeft: '12px', padding: '2px 8px', cursor: 'pointer' }}>重试</button>
        </div>
      )}

      {/* 6. 加载态展示 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          ⏳ 正在通过 useUsers Hook 同步数据...
        </div>
      )}

      {/* 7. 成功态与空数据态 (装配 UserCard 子组件列表) */}
      {!loading && !error && (
        filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
            🔍 未找到与 "{keyword}" 匹配的用户
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} onDelete={removeUser}/>
            ))}
          </div>
        )
      )}
    </div>
  );
};

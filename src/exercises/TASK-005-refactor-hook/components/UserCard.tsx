import React from 'react';
import type { ApiUser } from '../types';

/**
 * 子组件: UserCard (单个用户卡片)
 * 
 * 🎯 职责：纯函数式 UI 单元 (Dumb Component)
 * 纯粹根据入参 user 进行排版展示，极易复用与单测。
 */
export interface UserCardProps {
  user: ApiUser;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '14px',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>{user.name}</h4>
        <span style={{ fontSize: '11px', padding: '2px 6px', background: '#eff6ff', color: '#2563eb', borderRadius: '4px' }}>
          ID: {user.id}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>✉️ {user.email}</p>
      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>🏢 {user.company?.name || '个人开发者'}</p>
      <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>📞 {user.phone}</p>
    </div>
  );
};

import React from 'react';

/**
 * 子组件: UserSearchBar (搜索栏与刷新按钮)
 * 
 * 🎯 职责：纯展示/受控子组件 (Dumb/Presentational Component)
 * 自身不维护业务状态，通过 Props 接收数据，并通过回调函数向父组件发送事件。
 */
export interface UserSearchBarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const UserSearchBar: React.FC<UserSearchBarProps> = ({
  keyword,
  onKeywordChange,
  onRefresh,
  loading,
}) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>用户中心管理</h3>
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            padding: '6px 14px',
            backgroundColor: loading ? '#cbd5e1' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '13px',
          }}
        >
          {loading ? '⏳ 同步中...' : '🔄 刷新数据'}
        </button>
      </div>

      <input
        type="text"
        placeholder="搜索姓名或邮箱..."
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          boxSizing: 'border-box',
          fontSize: '14px',
        }}
      />
    </div>
  );
};

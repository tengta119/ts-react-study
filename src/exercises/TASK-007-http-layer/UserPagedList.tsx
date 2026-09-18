import type React from 'react';
import { Pagination } from './components/Pagination';
import { usePagedUsers } from './usePagedUsers';

/**
 * TASK-007: 用户分页列表页（Smart / Container 容器组件）
 *
 * 职责边界（复习 TASK-005 的架构结论）：
 *   - 本组件只做「编排」：把 Hook 给的数据与回调，分发给搜索框、列表、分页控件；
 *   - 本组件自己不写 fetch、不管理 page/keyword 的具体变化逻辑（那属于 Hook 的职责）。
 *
 * 页面结构：
 *   ① 搜索区：受控 input（value={keyword} / onChange → setKeyword）+ 刷新按钮（reload）
 *   ② 数据区：黄金四态按优先级排列 —— loading → error → empty → data
 *   ③ 分页区：<Pagination /> 接入，disabled={loading} 与 Hook 的竞态守卫形成双保险
 *
 * 进阶挑战（选做）：删除用户后 reload，并处理「末页被删空 → 页码自动回退」。
 */

// 卡片与状态框样式抽成常量：Dumb Component 的"排版细节"集中在一处，改样式不用翻 JSX
const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '12px 16px',
};

const stateStyle: React.CSSProperties = {
  ...cardStyle,
  textAlign: 'center',
  color: '#64748b',
  padding: '32px 16px',
};

export const UserPagedList: React.FC = () => {
  // 一行注入全套分页能力（类比注入 Spring @Service）
  const {
    users,
    total,
    totalPages,
    page,
    size,
    keyword,
    loading,
    error,
    setPage,
    setKeyword,
    reload,
  } = usePagedUsers(5);

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif' }}>
      <h3 style={{ marginTop: 0, color: '#0f172a' }}>
        📄 用户分页列表（统一请求层 + 服务端分页）
      </h3>

      {/* ─────────── ① 搜索区 ─────────── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {/* 受控输入：value 绑定 state，onChange 上报变化 —— 单向数据流的经典闭环 */}
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="按姓名 / 邮箱 / 登录名搜索"
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
          }}
        />
        {/* 这里无需传参，所以直接传函数引用（见 Q-RC-09） */}
        <button type="button" onClick={reload} disabled={loading}>
          {loading ? '加载中…' : '🔄 刷新'}
        </button>
      </div>

      {/* ─────────── ② 黄金四态（顺序即优先级，不可调换） ─────────── */}
      {loading ? (
        // 态 1：加载中 —— 此时不渲染旧列表，避免"数据闪动"
        <div style={stateStyle}>⏳ 正在加载第 {page} 页…</div>
      ) : error !== null ? (
        // 态 2：错误 —— 必须给用户"重试"这条路
        <div style={{ ...stateStyle, color: '#b91c1c', borderColor: '#fecaca' }}>
          <div>❌ {error}</div>
          <button type="button" onClick={reload} style={{ marginTop: '12px' }}>
            重试
          </button>
        </div>
      ) : users.length === 0 ? (
        // 态 3：空状态 —— 区分"搜不到"和"本来就没数据"，文案影响体验
        <div style={stateStyle}>
          {keyword ? `没有匹配「${keyword}」的用户` : '暂无用户数据'}
        </div>
      ) : (
        // 态 4：正常渲染
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {users.map((user) => (
            // key 用稳定业务主键 user.id（禁止用 index）
            <li key={user.id} style={cardStyle}>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>{user.name}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                {user.email} · {user.phone} · {user.company?.name ?? '—'}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ─────────── ③ 分页区 ─────────── */}
      <Pagination
        page={page}
        size={size}
        total={total}
        totalPages={totalPages}
        disabled={loading}      /* 加载中禁止连点翻页 —— 与 Hook 的竞态保护形成双保险 */
        onPageChange={setPage}  /* 直传引用：这里"上报目标页码"由子组件负责 */
      />
    </div>
  );
};

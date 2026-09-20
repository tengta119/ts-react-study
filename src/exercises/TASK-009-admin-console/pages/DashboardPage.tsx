import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../TASK-008-auth-guard/AuthContext';
import { fetchAdminUserPage } from '../api/adminUserApi';

/**
 * TASK-009: 仪表盘首页
 *
 * ────────────────────────────────────────────────────────────────
 * 本页要解决的三件事
 * ────────────────────────────────────────────────────────────────
 * ① 展示当前登录身份：来自全局登录态 `useAuth()`（不是自己再请求一次 /auth/me —— 那就是双份真相）
 * ② 统计"用户总数"：**复用管理端分页接口，但只取 `total`，不拉全量**
 * ③ 角色差异提示：ADMIN 可增删改；GUEST 只读（与列表页的按钮隐藏形成同一条解释链）
 *
 * ⚠️ 为什么不用 `fetchUserPage({ page: 1, size: 1000 })` 然后 `list.length`？
 *    实测后端对 size 有硬上限（`Query(5, ge=1, le=50)`）：
 *      GET /api/users/page?page=1&size=1000  →  422（参数校验失败，整个页面直接报错）
 *    即使上限放开，"拉全量再数长度"也会随数据量增长而崩（100 万条用户 = 100 万条 JSON）。
 *    **`total` 是后端算好的权威计数**，`size: 1` 就足以拿到它 —— 只传 1 条记录的网络开销。
 */

// ── 样式常量 ─────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '16px 18px',
};

const statValueStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 700,
  color: '#0f172a',
  lineHeight: 1.2,
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#64748b',
  marginBottom: '6px',
};

const baseButtonStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: '6px',
  fontSize: '13px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  color: '#1e293b',
  cursor: 'pointer',
};

const primaryButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: '#2563eb',
  borderColor: '#2563eb',
  color: '#ffffff',
  fontWeight: 600,
};

/** 角色徽标：把 role 字符串映射成一枚有颜色的小标签 */
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const isAdmin = role === 'ADMIN';
  return (
    <span
      style={{
        fontSize: '12px',
        fontWeight: 600,
        padding: '3px 10px',
        borderRadius: '999px',
        backgroundColor: isAdmin ? '#dbeafe' : '#f1f5f9',
        color: isAdmin ? '#1d4ed8' : '#64748b',
      }}
    >
      {role}
    </span>
  );
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // ── ① 当前身份：直接消费全局登录态（单一真相来源）───────────────
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // ── ② 统计三态 ────────────────────────────────────────────────
  const [total, setTotal] = useState<number | null>(null);
  // 初值必须为 true（Q-HK-06：effect 在渲染提交后才跑，首帧只能读到初值）
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0); // 重试令牌（Q-HK-05）

  useEffect(() => {
    // 门禁标记：StrictMode 双跑 / 组件卸载后，迟到的响应不许写状态（Q-HK-09 的清理函数）
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        // ⭐ 关键：size 传 1 —— 我们只要 PageResult.total 这个"后端算好的计数"，
        //    完全不需要那一页数组。这是"用现成接口解决新需求"的典型姿势。
        const pageData = await fetchAdminUserPage({ page: 1, size: 1 });
        if (!active) return;
        setTotal(pageData.total);
      } catch (err: unknown) {
        if (!active) return;
        // 这里可能拿到 401（未登录/token 失效）——它会在 DoD ⑨ 的"全局 401"里被统一接管
        setError(err instanceof Error ? err.message : '统计信息加载失败，请稍后重试');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [reloadToken]);

  return (
    <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h3 style={{ margin: 0, color: '#0f172a' }}>📊 仪表盘</h3>

      {/* ─────────── 当前登录身份 ─────────── */}
      <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={labelStyle}>当前登录身份</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
              {user === null ? '未登录' : user.name}
            </span>
            {user !== null && <RoleBadge role={user.role} />}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            登录名：{user?.username ?? '—'}
          </div>
        </div>
        <button type="button" onClick={() => navigate('/users')} style={primaryButtonStyle}>
          去用户管理 →
        </button>
      </div>

      {/* ─────────── 统计卡片区 ─────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* 卡片 1：用户总数（走三态）*/}
        <div style={{ ...cardStyle, minHeight: '96px' }}>
          <div style={labelStyle}>用户总数（服务端 total）</div>
          {loading ? (
            <div style={{ ...statValueStyle, color: '#94a3b8', fontSize: '16px' }}>⏳ 统计中…</div>
          ) : error !== null ? (
            <div>
              <div style={{ color: '#b91c1c', fontSize: '13px' }}>❌ {error}</div>
              <button
                type="button"
                onClick={() => setReloadToken((t) => t + 1)}
                style={{ ...baseButtonStyle, marginTop: '10px' }}
              >
                重试
              </button>
            </div>
          ) : (
            <div style={statValueStyle}>
              {total}
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', marginLeft: '6px' }}>
                位用户
              </span>
            </div>
          )}
        </div>

        {/* 卡片 2：当前角色可执行的操作（派生自 user.role，无需额外请求）*/}
        <div style={{ ...cardStyle, minHeight: '96px' }}>
          <div style={labelStyle}>当前角色权限</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
            {isAdmin ? '管理员（可增删改查）' : '访客（只读）'}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', lineHeight: 1.7 }}>
            {isAdmin ? (
              <>可新增 / 编辑 / 删除用户；写操作由后端 `hasRole('ADMIN')` 二次校验。</>
            ) : (
              <>只能查看列表与详情；新增 / 编辑 / 删除入口已隐藏，直接调接口将返回 <strong>403</strong>。</>
            )}
          </div>
        </div>
      </div>

      {/* ─────────── GUEST 的只读说明（与列表页同一条解释链）─────────── */}
      {!isAdmin && (
        <div
          style={{
            ...cardStyle,
            backgroundColor: '#f8fafc',
            color: '#475569',
            fontSize: '13px',
            lineHeight: 1.8,
          }}
        >
          🔒 <strong>只读模式</strong>：当前账号是 <code>{user?.role}</code>，因此管理操作被禁用。
          <br />
          <span style={{ color: '#94a3b8' }}>
            想验证"前后端各管一层"？用 <code>guest</code> 登录后直接调删除接口，后端会回 403
            （体验层隐藏 ≠ 安全层放行）。
          </span>
        </div>
      )}
    </div>
  );
};

import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../../TASK-007-http-layer/components/Pagination';
import { usePagedUsers } from '../../TASK-007-http-layer/usePagedUsers';
import { useAuth } from '../../TASK-008-auth-guard/AuthContext';
import { deleteAdminUser, fetchAdminUserPage } from '../api/adminUserApi';
import { UserFormModal } from '../components/UserFormModal';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { ApiUser } from '../types';

/**
 * TASK-009: 管理端用户列表页（本任务核心）
 *
 * ────────────────────────────────────────────────────────────────
 * 结构总览（先看这里，再看代码）
 * ────────────────────────────────────────────────────────────────
 *   ┌─ 状态层 ──────────────────────────────────────────────────┐
 *   │ ① 分页状态机：复用 usePagedUsers(fetcher, size)            │
 *   │    —— 注入管理端 fetcher = 依赖注入，不复制状态机           │
 *   │ ② searchInput：输入框的**即时**值（受控）                    │
 *   │ ③ debouncedSearch：防抖后的值 → 唯一喂给状态机的关键字       │
 *   │ ④ 弹窗开关：modalOpen + editingUser                         │
 *   │ ⑤ 动作态：deletingId（行级禁用）+ actionError（403 提示）    │
 *   └───────────────────────────────────────────────────────────┘
 *   ┌─ 数据流 ──────────────────────────────────────────────────┐
 *   │ 输入 → searchInput → (300ms 安静) → debouncedSearch         │
 *   │        → useEffect 同步进 setKeyword → 页码自动归 1          │
 *   │        → Hook 的 effect 重新请求 → 四态渲染                  │
 *   └───────────────────────────────────────────────────────────┘
 *
 * ⚠️ 关键字为什么不让输入框直接绑 Hook 的 setKeyword？
 *    因为那样每敲一个字就打一次请求。**输入框的即时值与"真正生效的查询条件"是两个概念**，
 *    用防抖把两者分开，是前端搜索的标准做法。
 */

const PAGE_SIZE = 5;
/** 搜索防抖窗口（毫秒）：停止输入 300ms 后才真正发起请求 */
const SEARCH_DEBOUNCE_MS = 300;

// ── 样式常量（集中在顶部，改样式不用翻 JSX）────────────────────────
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

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
};

const baseButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
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

const dangerButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  borderColor: '#fecaca',
  color: '#b91c1c',
};

const disabledButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: '#f1f5f9',
  color: '#cbd5e1',
  cursor: 'not-allowed',
};

export const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();

  // ── ① 角色感知：从全局登录态里读当前用户（对应后端 SecurityContextHolder）──
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // ── ② 分页状态机：把「请求怎么发」注入进去（依赖注入）──────────────
  //     usePagedUsers 内部完全不知道"这是管理端接口"，它只负责分页/竞态/四态/边界
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
  } = usePagedUsers(fetchAdminUserPage, PAGE_SIZE);

  // ── ③ 搜索防抖：输入框的即时值 vs 真正生效的关键字 ───────────────
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  // 派生值：用户还在打字（即时值 ≠ 防抖值）时给个提示，让"防抖生效"肉眼可见
  const isTyping = searchInput !== debouncedSearch;

  // 防抖后的值 → 同步进状态机。setKeyword 内部会把页码归 1。
  // ⚠️ 依赖数组里的 setKeyword 必须来自 useCallback（TASK-007 已改造）：
  //    若它是每次渲染新生成的函数，这个 effect 会每轮都跑一遍。
  useEffect(() => {
    setKeyword(debouncedSearch);
  }, [debouncedSearch, setKeyword]);

  // ── ④ 弹窗状态 ────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);

  // ── ⑤ 动作态：行级删除中 + 动作错误（401/403 的中文提示落点）───────
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingUser(null); // null = 新增模式
    setModalOpen(true);
    setActionError(null);
  };

  const openEdit = (target: ApiUser) => {
    setEditingUser(target); // 非 null = 编辑模式
    setModalOpen(true);
    setActionError(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  /** 保存成功后的回调：关弹窗 + 刷新当前页（数据变了，缓存没意义） */
  const handleSaved = () => {
    closeModal();
    reload();
  };

  /**
   * 删除：本任务最容易出错的一段，两件事必须分清楚 ——
   *   ① 权限错误（403）就地提示，**绝不能跳登录页**（那是 401 的语义）
   *   ② 末页被删空必须回退页码，否则出现「第 5 / 4 页 + 空列表」
   */
  const handleDelete = async (target: ApiUser) => {
    if (!window.confirm(`确定删除「${target.name}」吗？此操作不可撤销。`)) return;

    setDeletingId(target.id);
    setActionError(null);

    try {
      await deleteAdminUser(target.id);

      // ── 末页回退的判据 ────────────────────────────────────────
      // 什么时候当前页会被删空？只有「当前是最后一页，且这一页只剩 1 条」这一种情况：
      //   第 1 页永远删不空（删完还有后续数据补上来），中间页也会由后面页的数据补齐。
      // 注意：deleteAdminUser 返回 Promise<void>，我们**拿不到新的 totalPages**，
      //       所以只能基于删除前的页面信息推断 —— 这也是"契约决定能力"的例子。
      const willEmptyCurrentPage = users.length === 1 && page === totalPages;

      if (willEmptyCurrentPage && page > 1) {
        setPage(page - 1); // 改页码本身就是"重新请求"的触发器，无需再 reload
      } else {
        reload(); // 同页原地刷新
      }
    } catch (err: unknown) {
      // 403（guest 越权）会走到这里，错误消息已是拦截器归一化后的后端中文 detail
      setActionError(err instanceof Error ? err.message : '删除失败，请稍后重试');
    } finally {
      // 无论成败都要解除行级禁用，否则按钮永远卡在“删除中…”
      setDeletingId(null);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* ─────────── 标题栏 + 角色相关入口 ─────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h3 style={{ margin: 0, color: '#0f172a' }}>👥 用户管理</h3>
        {/* 角色感知：只有 ADMIN 才能看到「新增」入口（体验层；后端才是安全层） */}
        {isAdmin ? (
          <button type="button" onClick={openCreate} style={primaryButtonStyle}>
            ＋ 新增用户
          </button>
        ) : (
          <span
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
            }}
          >
            只读模式 · {user?.role}
          </span>
        )}
      </div>

      {/* GUEST 的说明条：把"为什么按钮不见了"讲清楚，而不是让它凭空消失 */}
      {!isAdmin && (
        <div
          style={{
            ...cardStyle,
            backgroundColor: '#f8fafc',
            color: '#475569',
            fontSize: '13px',
            marginBottom: '12px',
          }}
        >
          🔒 当前角色 <strong>{user?.role}</strong> 只有查看权限：新增 / 编辑 / 删除入口已隐藏。
          <br />
          <span style={{ color: '#94a3b8' }}>
            注意：隐藏按钮只是体验优化 —— 若绕过界面直接调接口，后端会返回 <strong>403</strong>。
          </span>
        </div>
      )}

      {/* ─────────── 搜索区 ─────────── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="按姓名 / 邮箱 / 登录名搜索（停止输入 300ms 后查询）"
          style={inputStyle}
        />
        <button type="button" onClick={reload} disabled={loading} style={loading ? disabledButtonStyle : baseButtonStyle}>
          {loading ? '加载中…' : '🔄 刷新'}
        </button>
      </div>
      {/* 防抖可视化：打字过程中显示它，安静 300ms 后消失 —— 这就是"防抖生效"的肉眼证据 */}
      {isTyping && (
        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
          ⏳ 正在等待输入结束（防抖 {SEARCH_DEBOUNCE_MS}ms）…
        </div>
      )}

      {/* 动作错误（如 403 无权限）：这是页面级提示，不是全局跳转 */}
      {actionError !== null && (
        <div
          style={{
            ...cardStyle,
            backgroundColor: '#fef2f2',
            borderColor: '#fecaca',
            color: '#b91c1c',
            fontSize: '13px',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>⛔ {actionError}</span>
          <button type="button" onClick={() => setActionError(null)} style={baseButtonStyle}>
            知道了
          </button>
        </div>
      )}

      {/* ─────────── 黄金四态（顺序即优先级，不可调换） ─────────── */}
      {loading ? (
        <div style={stateStyle}>⏳ 正在加载第 {page} 页…</div>
      ) : error !== null ? (
        <div style={{ ...stateStyle, color: '#b91c1c', borderColor: '#fecaca' }}>
          <div>❌ {error}</div>
          <button type="button" onClick={reload} style={{ ...baseButtonStyle, marginTop: '12px' }}>
            重试
          </button>
        </div>
      ) : users.length === 0 ? (
        <div style={stateStyle}>
          {keyword.trim() !== '' ? `没有匹配「${keyword}」的用户` : '暂无用户数据'}
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {users.map((item) => (
            // key 用稳定业务主键（禁止 index）：删除/翻页后 index 会漂移，导致 React 复用错的 DOM
            <li
              key={item.id}
              style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>
                  #{item.id} · {item.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  {item.username} · {item.email} · {item.phone} · {item.company?.name ?? '—'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                {/* 详情：所有角色都能看（后端 GET 详情是公开接口） */}
                <button
                  type="button"
                  onClick={() => navigate(`/users/${item.id}`)}
                  style={baseButtonStyle}
                >
                  详情
                </button>

                {/* 编辑 / 删除：仅 ADMIN 可见 —— 注意这里用的是 isAdmin 条件渲染，而不是 disabled */}
                {isAdmin && (
                  <>
                    <button type="button" onClick={() => openEdit(item)} style={baseButtonStyle}>
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(item)}
                      disabled={deletingId === item.id}
                      style={deletingId === item.id ? disabledButtonStyle : dangerButtonStyle}
                    >
                      {deletingId === item.id ? '删除中…' : '删除'}
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ─────────── 分页区 ─────────── */}
      <Pagination
        page={page}
        size={size}
        total={total}
        totalPages={totalPages}
        disabled={loading}
        onPageChange={setPage}
      />

      {/* ─────────── 新增 / 编辑弹窗 ─────────── */}
      {/* ⚠️ key 是这里的关键：UserFormModal 内部用 useState(editingUser.xxx) 预填表单，
          而 useState 的初始值只在【首次渲染】生效。切换到另一个用户时若组件被复用，
          表单会残留上一个人的数据。给它一个随目标变化的 key，强制"卸载重建"。 */}
      {modalOpen && (
        <UserFormModal
          key={editingUser === null ? 'create' : `edit-${editingUser.id}`}
          editingUser={editingUser}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

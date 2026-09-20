import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUserDetail } from '../../TASK-007-http-layer/userApi';
import type { ApiUser } from '../types';

/**
 * TASK-009: 用户详情页（动态路由 + 三态）
 *
 * ────────────────────────────────────────────────────────────────
 * 本页要解决的四件事
 * ────────────────────────────────────────────────────────────────
 * ① 取路径参数：`useParams<{ id: string }>()` —— ⚠️ 运行时拿到的是 `string | undefined`
 * ② 参数校验：`/users/abc`、`/users/NaN` 这类地址必须**在发请求前**拦掉（别把 NaN 拼进 URL）
 * ③ 三态渲染：loading（初值必须为 true）→ error（404 显示后端中文文案）→ data
 * ④ 返回列表：`/users`（相对 `navigate(-1)` 更可靠，见文末注释）
 *
 * 附带一个**竞态细节**：从 /users/1 直接跳到 /users/2 时，同一个组件实例只是参数变了，
 * 两个请求会并行 —— 若 1 的响应晚于 2 到达，就会把 2 的数据覆盖成 1 的（"幽灵详情页"）。
 * 本页用 effect 清理函数里的 `active` 标记把过期结果丢掉（更彻底的方案是 AbortController）。
 */

// ── 样式常量 ─────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '20px',
};

const stateStyle: React.CSSProperties = {
  ...cardStyle,
  textAlign: 'center',
  color: '#64748b',
  padding: '32px 16px',
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

export const UserDetailPage: React.FC = () => {
  const navigate = useNavigate();

  // ── ① 取路径参数 ───────────────────────────────────────────────
  // 泛型 `<{ id: string }>` 只描述"正常情况下长什么样"，
  // 实际类型是 Partial 的 —— 因为在别的路由下（例如 /dashboard）压根没有 id 这个参数。
  // 所以 `id` 的静态类型是 `string | undefined`，必须收窄（这正是任务卡要你处理的点）。
  const { id } = useParams<{ id: string }>();

  // ── ② 参数校验：在"渲染阶段"用纯计算把非法 id 判掉（派生值，不进 state）──
  // 为什么必须在客户端拦？（实测后端的真实反应）：
  //   GET /api/users/9999 → 404 {"detail":"用户 ID=9999 未找到"}      ← detail 是字符串，前端能直接展示
  //   GET /api/users/abc  → 422 {"detail":[{...int_parsing...}]}      ← detail 是【数组】，
  //        拦截器的 `typeof detail === 'string'` 判定失败 → 只能兜底成"请求失败 (HTTP 422)"
  //   👉 所以"不合法 id 不要发给后端"：报错文案会变成对用户毫无意义的 HTTP 代码。
  //
  // 为什么不把非法 id 塞进 state？因为它完全由 `id` 推导出来（派生状态原则）。
  const rawId = id ?? '';
  const parsedId = Number(rawId);
  // Number('') → 0，Number('abc') → NaN，Number('3.5') → 3.5 → 三种都判掉
  const isValidId = rawId !== '' && Number.isInteger(parsedId) && parsedId > 0;

  // ── ③ 三态 state ───────────────────────────────────────────────
  const [user, setUser] = useState<ApiUser | null>(null);
  // ⚠️ 初值必须是 true：effect 在"渲染提交之后"才执行，首帧只能读到初始值。
  //    若写 false，首帧会先渲染出"用户不存在"再跳成"加载中"（复习 Q-HK-06）
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 重试令牌：点"重试"时自增，从而触发下面的 effect 重新拉取（复习 Q-HK-05）
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    // 非法 id：直接不发请求，**也不碰任何 state**
    // ⚠️ 这里曾经写的是 `setLoading(false); return;`，被 ESLint 的
    //    react-hooks/set-state-in-effect 判为 error（在 effect 里同步 setState 会引起级联渲染）。
    //    改成“什么都不做”后逻辑反而更干净 —— 因为“参数非法”是个**派生结果**，
    //    它的展示完全由渲染分支负责（见下方 `if (!isValidId)`），不需要额外的 state 参与。
    if (!isValidId) return;

    // ⭐ `active` 就是本轮的"门禁"：一旦 effect 被清理（id 变了 / 组件卸载），
    //    这个闭包里的 active 变 false，任何迟到的响应都会被丢弃。
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null); // 每次新请求先清掉上一次的错误，避免旧错误残留

      try {
        const data = await fetchUserDetail(parsedId);
        if (!active) return; // 过期响应：直接扔掉，不许写状态
        setUser(data);
      } catch (err: unknown) {
        if (!active) return; // 过期请求的失败同样不该覆盖最新状态
        // 404 时后端返回的中文 detail（"用户 ID=999 未找到"）已被拦截器归一化成 Error.message
        setError(err instanceof Error ? err.message : '加载失败，请稍后重试');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    // 清理函数：effect 重新执行前 / 组件卸载时把门禁关上
    // （它返回的时机由 React 保证 —— 依赖变化时先跑清理、再跑新 effect，见 Q-HK-09）
    return () => {
      active = false;
    };
  }, [isValidId, parsedId, reloadToken]);

  // ── ④ 返回列表 ─────────────────────────────────────────────────
  // 为什么用 navigate('/users') 而不是 navigate(-1)？
  //   navigate(-1) 依赖"用户是从列表点进来的"这个前提。
  //   若用户直接把 /users/3 发给同事/刷新页面打开，历史里没有列表页，
  //   navigate(-1) 会把他带出应用（或原地不动）。**详情页的"返回"应有确定的目标。**
  const goBackToList = () => navigate('/users');

  // ── 非法 id 的专用分支 ─────────────────────────────────────────
  // ⚠️ 这个 early return 必须放在所有 Hook 调用之后（Rules of Hooks：hook 数量必须恒定）
  if (!isValidId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ ...stateStyle, color: '#b45309', borderColor: '#fde68a' }}>
          <div>⚠️ 无效的用户 ID：<code>{rawId === '' ? '(空)' : rawId}</code></div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            用户 ID 必须是正整数，例如 <code>/users/3</code>
          </div>
        </div>
        <button type="button" onClick={goBackToList} style={primaryButtonStyle}>
          ← 返回用户管理
        </button>
      </div>
    );
  }

  // ── 三态渲染（顺序即优先级，不可调换） ─────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#0f172a' }}>📄 用户详情 #{parsedId}</h3>
        <button type="button" onClick={goBackToList} style={baseButtonStyle}>
          ← 返回列表
        </button>
      </div>

      {loading ? (
        <div style={stateStyle}>⏳ 正在加载用户 #{parsedId} …</div>
      ) : error !== null ? (
        <div style={{ ...stateStyle, color: '#b91c1c', borderColor: '#fecaca' }}>
          <div>❌ {error}</div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
            <button type="button" onClick={() => setReloadToken((t) => t + 1)} style={baseButtonStyle}>
              重试
            </button>
            <button type="button" onClick={goBackToList} style={baseButtonStyle}>
              返回列表
            </button>
          </div>
        </div>
      ) : user === null ? (
        // 兜底分支：理论上 loading=false 且 error=null 时 user 必不为 null。
        // 保留它是为了穷尽类型收窄 —— 下面读取 user.name 时 TS 才不会报"可能是 null"
        <div style={stateStyle}>暂无数据</div>
      ) : (
        <div style={cardStyle}>
          <dl
            style={{
              margin: 0,
              display: 'grid',
              gridTemplateColumns: '110px 1fr',
              rowGap: '10px',
              fontSize: '13px',
            }}
          >
            <dt style={{ color: '#64748b' }}>姓名</dt>
            <dd style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{user.name}</dd>

            <dt style={{ color: '#64748b' }}>登录名</dt>
            <dd style={{ margin: 0 }}>{user.username}</dd>

            <dt style={{ color: '#64748b' }}>邮箱</dt>
            <dd style={{ margin: 0 }}>{user.email}</dd>

            <dt style={{ color: '#64748b' }}>电话</dt>
            <dd style={{ margin: 0 }}>{user.phone}</dd>

            <dt style={{ color: '#64748b' }}>公司 / 团队</dt>
            {/* company 是可选字段（ApiUser 里带 ?）→ 必须兜底，否则运行时可能 undefined */}
            <dd style={{ margin: 0 }}>{user.company?.name ?? '—'}</dd>
          </dl>

          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '16px' }}>
            提示：「编辑」入口留作进阶练习 —— 需要在 TODO ③ 的 UserFormModal 完成后接入。
          </div>
        </div>
      )}
    </div>
  );
};

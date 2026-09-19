import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { fetchMeApi } from '../authApi';

/**
 * TASK-008: 个人中心页（受保护页面）
 *
 * 职责：展示当前登录用户 + 提供登出；另外提供一个「token 失效演练」按钮，
 *      用来亲手验证 401 链路（这是本任务唯一能被“看见”的鉴权失败场景）。
 */
export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);
  const [probing, setProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<string | null>(null);

  // ── 防御式编程 ─────────────────────────────────────────────────
  // 这一页本应由路由守卫保护（ProtectedRoute），但组件自身不假设“外面一定把关了”：
  // 直接依赖 user 非空，一旦将来守卫被误删/绕过（比如直接复制该组件到别处），
  // 就会在渲染时抛 Cannot read properties of null —— 这类崩溃比“看到一句提示”难查得多。
  if (user === null) {
    return (
      <div
        style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '13px',
        }}
      >
        🔒 当前未登录。本页面应由 <code>&lt;ProtectedRoute&gt;</code> 拦住并重定向到登录页
        （若看到这句提示，说明守卫被绕过或未接线）。
      </div>
    );
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // ⚠️ 必须 await：logout() 内部是“先 await 服务端接口，再在 finally 里清 token/清 user”。
      //    不等它完成就 navigate，会出现“路由已到登录页、user 仍是已登录”的不一致中间态，
      //    进而被 LoginPage 的“已登录则重定向回 /profile”弹回去 → 跳转乒乓。
      await logout();
      // replace：用替换而非压栈，避免用户按后退又回到这个受保护页面
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  /**
   * token 失效演练：带着当前 token 请求受保护接口 /api/auth/me。
   * 用法：先点一次（应成功）→ 用 Swagger(/docs) 或 curl 调一次 POST /api/auth/logout
   *      让该 token 在服务端失效 → 再点一次 → 会看到中文 401 提示。
   * 📌 你会观察到一个真实缺陷：**界面依然认为你已登录**（user 状态没人清）。
   *    这正是进阶挑战「全局 401 处理」要解决的问题。
   */
  const handleProbeToken = async () => {
    setProbing(true);
    setProbeResult(null);
    try {
      const me = await fetchMeApi();
      setProbeResult(`✅ token 有效 —— 服务端返回：${me.username}（${me.role}）`);
    } catch (err: unknown) {
      setProbeResult(`❌ ${err instanceof Error ? err.message : '请求失败，请稍后重试'}`);
    } finally {
      setProbing(false);
    }
  };

  const roleColor = user.role === 'ADMIN' ? '#1d4ed8' : '#475569';
  const roleBg = user.role === 'ADMIN' ? '#dbeafe' : '#e2e8f0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* 头像：取姓名首字，纯派生展示，无需任何状态 */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            {user.name.slice(0, 1)}
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              登录名：{user.username}
            </div>
          </div>
        </div>

        <dl
          style={{
            marginTop: '20px',
            marginBottom: 0,
            display: 'grid',
            gridTemplateColumns: '80px 1fr',
            rowGap: '10px',
            fontSize: '13px',
            color: '#334155',
          }}
        >
          <dt style={{ color: '#64748b' }}>用户名</dt>
          <dd style={{ margin: 0 }}>{user.username}</dd>

          <dt style={{ color: '#64748b' }}>姓名</dt>
          <dd style={{ margin: 0 }}>{user.name}</dd>

          <dt style={{ color: '#64748b' }}>角色</dt>
          <dd style={{ margin: 0 }}>
            <span
              style={{
                color: roleColor,
                backgroundColor: roleBg,
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {user.role}
            </span>
          </dd>
        </dl>

        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          {/* 表单外也要养成写 type="button" 的习惯：按钮默认 type 是 submit */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #fecaca',
              backgroundColor: loggingOut ? '#f1f5f9' : '#fef2f2',
              color: '#b91c1c',
              fontSize: '13px',
              fontWeight: 600,
              cursor: loggingOut ? 'not-allowed' : 'pointer',
            }}
          >
            {loggingOut ? '退出中…' : '退出登录'}
          </button>

          <button
            type="button"
            onClick={handleProbeToken}
            disabled={probing}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              cursor: probing ? 'not-allowed' : 'pointer',
            }}
          >
            {probing ? '验证中…' : '🔍 token 失效演练'}
          </button>
        </div>

        {probeResult !== null ? (
          <div
            style={{
              marginTop: '12px',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              backgroundColor: probeResult.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${probeResult.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`,
              color: probeResult.startsWith('✅') ? '#166534' : '#b91c1c',
            }}
          >
            {probeResult}
          </div>
        ) : null}
      </div>
    </div>
  );
};

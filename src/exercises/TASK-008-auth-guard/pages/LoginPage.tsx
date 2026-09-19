import type React from 'react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

/**
 * TASK-008: 登录页
 *
 * 角色类比：后端 `AuthController.login(LoginCommand cmd)` + 登录表单页的合体 ——
 * 它只负责“收集输入 → 调用认证 → 反馈结果 → 跳转”，真正的登录态写入在 AuthProvider。
 *
 * 注意这里的表单状态类型叫 LoginFormData 而不是 FormData ——
 * 浏览器全局已有原生 FormData（TASK-003 的错题），自定义类型不要撞名。
 */
export interface LoginFormData {
  username: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // ── 表单状态（受控）──────────────────────────────────────────
  const [formData, setFormData] = useState<LoginFormData>({ username: '', password: '' });
  // ── 请求三态：submitting（加载中）+ error（失败）────────────
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ── 纯 UI 开关：显示/隐藏密码 ────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);

  // 派生值：按钮可点性由输入直接算出，绝不另存 state（复习 TASK-002 的派生状态原则）
  const canSubmit = formData.username.trim() !== '' && formData.password !== '';

  // 已登录用户不该再看到登录页 —— 直接重定向（replace 防止历史记录里留下登录页）
  // ⚠️ 注意：这个提前 return 必须放在所有 Hook 调用之后（Rules of Hooks）
  if (user !== null) {
    return <Navigate to="/profile" replace />;
  }

  // 一个 handleChange 服务所有输入框：靠 e.target.name + 计算属性名动态更新
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    // ① 阻止浏览器默认提交行为（否则整页刷新，React 状态全丢）
    e.preventDefault();

    // ② 双保险：即使按钮的 disabled 被绕过（回车提交、调试器改 DOM），也不重复提交
    if (submitting) return;

    setSubmitting(true);
    setError(null); // 每次提交先清掉上一次的错误

    try {
      // ③ 登录成功：AuthProvider 内部已 saveToken + setUser，这里拿到用户信息
      await login({ username: formData.username.trim(), password: formData.password });

      // ④ 在【事件处理器】里顺序跳转，而不是用 useEffect 监听 user（那样会先闪一帧登录页）
      //    replace: true → 用“替换”而非“压栈”，避免后退时又回到登录页
      navigate('/profile', { replace: true });
    } catch (err: unknown) {
      // ⑤ 错误消息来自 TASK-007 的响应拦截器归一化结果（后端中文 detail）
      setError(err instanceof Error ? err.message : '登录失败，请稍后重试');
    } finally {
      // ⑥ 无论成功失败都要恢复按钮（成功时组件很快被卸载，但保持成对是好习惯）
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '24px',
        maxWidth: '420px',
        margin: '0 auto',
      }}
    >
      <h3 style={{ marginTop: 0, color: '#0f172a' }}>🔐 登录</h3>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        <div>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#475569' }}>
            用户名
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            disabled={submitting}
            style={{ width: '100%', padding: '8px 10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px' }}
          />
        </div>

        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#475569' }}>
            密码
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'} // ⚠️ 密码框必须是 password（type="text" 会明文显示）
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={submitting}
              style={{ flex: 1, padding: '8px 10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
            {/* ⚠️ 表单内部的按钮默认 type="submit" → 必须显式写 type="button"，否则点它就会提交表单 */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{ padding: '8px 10px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}
            >
              {showPassword ? '隐藏' : '显示'}
            </button>
          </div>
        </div>

        {/* 错误态：显示的是拦截器归一化后的中文消息（如「用户名或密码错误」） */}
        {error !== null ? (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              borderRadius: '6px',
              padding: '10px 12px',
              fontSize: '13px',
            }}
          >
            ❌ {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting || !canSubmit}
          style={{
            padding: '10px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: submitting || !canSubmit ? '#93c5fd' : '#2563eb',
            cursor: submitting || !canSubmit ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? '登录中…' : '登 录'}
        </button>
      </form>

      <p style={{ marginBottom: 0, marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
        演示账号：<code>admin / admin123</code>（ADMIN）、<code>guest / guest123</code>（GUEST）
      </p>
    </div>
  );
};

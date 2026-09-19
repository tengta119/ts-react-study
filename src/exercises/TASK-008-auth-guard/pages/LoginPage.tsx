import type React from 'react';
import { useAuth } from '../AuthContext';

/**
 * TASK-008: 登录页
 *
 * ================== TODO ④【你来实现】==================
 * 这一页是你 TASK-003（受控表单 + 校验）与 TASK-007（请求三态）的合体，要求：
 *
 * 1) 受控表单：username / password 两个字段
 *      - 输入框 value 绑定 state，onChange 更新（受控组件）
 *      - ⚠️ password 用 type="password"；建议再加一个「显示密码」开关（可选）
 *
 * 2) 提交与三态：
 *      - 用 <form onSubmit={handleSubmit}> 包裹，第一行必须 e.preventDefault()
 *        （复习 TASK-003：不阻止默认行为，浏览器会整页刷新，React 状态全丢）
 *      - submitting 状态：请求中按钮 disabled + 文案变「登录中…」（防连点）
 *      - error 状态：把 login() 抛出的异常 message 显示出来
 *        （能显示后端返回的中文「用户名或密码错误」，而不是 [object Object] 或英文原文
 *          —— 这正是 TASK-007 错误归一化的成果）
 *
 * 3) 成功后跳转：
 *      - 调用 const user = await login({ username, password })
 *      - 然后 navigate('/profile') 或 navigate(from, { replace: true })
 *        （from 来自 useLocation().state —— 进阶挑战：登录后回到原来想去的页面）
 *      - ⚠️ 不要试图在 useEffect 里"监听 user 变化再跳转"，那会引入额外的一次渲染与竞态；
 *        在事件处理器里按顺序做（请求成功 → 跳转）是最直接的
 *
 * 4) 已登录用户访问 /login：
 *      - 可选但推荐：if (user) return <Navigate to="/profile" replace />，避免"已登录还能看到登录页"
 *
 * 演示账号：admin / admin123（管理员）、guest / guest123（访客）
 * ======================================================
 */
export const LoginPage: React.FC = () => {
  // 占位调用：实现时请改为 const { login, user } = useAuth(); 并删除下面的 initializing
  const { initializing } = useAuth();

  return (
    <div
      style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        color: '#92400e',
        borderRadius: '8px',
        padding: '16px',
        fontSize: '13px',
        lineHeight: 1.8,
      }}
    >
      <strong>🔐 TODO ④：登录页待实现</strong>
      <div>· 受控表单（username / password）+ onSubmit 里 e.preventDefault()</div>
      <div>· submitting / error 两态（请求中禁用按钮、错误显示后端中文提示）</div>
      <div>· 成功后 navigate 跳转（用 replace 避免后退回到登录页）</div>
      <div>· 演示账号：admin / admin123 或 guest / guest123</div>
      <div style={{ marginTop: '8px', color: '#b45309' }}>
        当前 AuthProvider 的 initializing = {String(initializing)}（实现 TODO ③ 后会反映真实状态）
      </div>
    </div>
  );
};

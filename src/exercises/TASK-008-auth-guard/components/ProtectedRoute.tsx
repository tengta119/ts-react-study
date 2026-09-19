import type React from 'react';
import { useAuth } from '../AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * TASK-008: 路由守卫组件（ProtectedRoute）
 *
 * Java / Spring 对照：
 *   Spring Security 的 `OncePerRequestFilter` 在请求进入 Controller **之前**拦截并鉴权，
 *   不通过就返回 401/302；
 *   前端的"守卫"是它的 UI 版本：在**渲染目标页面前**判断登录态，
 *   不通过就 `<Navigate to="/login" replace />`。
 *
 * 两者本质区别：
 *   后端守卫是**真正的安全边界**（不通过就真的拿不到数据）；
 *   前端守卫只是**体验优化**（Javascript 可以被绕过）。
 *   👉 所以前端做了守卫，后端依然必须独立鉴权 —— 这是新手最容易误解的一点。
 *
 * 三态分流（实现要点，顺序即优先级）：
 *   1) initializing === true → 「正在校验登录态…」
 *        ⚠️ 不能在这一步跳转：刷新页面时用户其实已登录，只是“还没问完后端”，
 *          直接重定向会把已登录用户踢出登录页。
 *   2) user === null（已校验完毕）→ <Navigate to="/login" replace />
 *        ⚠️ replace：用替换而非压栈，避免后退时在「登录页 ⇄ 受保护页」之间死循环。
 *   3) 否则 → 放行 <>{children}</>
 *
 * 进阶：配合 useLocation() 把当前路径写进 state，可实现“登录后回跳原页面”。
 */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, initializing } = useAuth();

  if (initializing === true) {
    return <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>正在校验登录态…</div>;
  }

  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

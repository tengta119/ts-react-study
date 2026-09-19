import type React from 'react';
import { useAuth } from '../AuthContext';

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
 * ================== TODO ⑥【你来实现：三态分流】==================
 * 组件内部要区分三种情况（顺序即优先级）：
 *
 *   1) initializing === true
 *        → 返回「正在校验登录态…」的占位 UI
 *        ⚠️ 绝对不能在这一步跳登录页！刷新页面时用户其实已登录，
 *           只是"还没问完后端"，跳转会把已登录用户踢出去。
 *
 *   2) user === null（且已校验完毕）
 *        → return <Navigate to="/login" replace />
 *        ⚠️ replace 的作用：用"替换"而不是"压栈"，避免用户点浏览器后退时
 *           陷入「登录页 ⇄ 受保护页」的死循环。
 *
 *   3) 否则 → return <>{children}</>（放行）
 *
 * 提示（进阶）：若想把"登录后回到原来想去的页面"也做掉，
 *   可以在这里用 useLocation() 记录当前路径，跳转时携带：
 *   <Navigate to="/login" state={{ from: location.pathname }} replace />
 * ================================================================
 */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 占位调用：实现时请改为 const { user, initializing } = useAuth();
  useAuth();

  // ⬇︎ 占位实现：目前是"无条件放行"，所以受保护页面即使未登录也能进入 ⬇︎
  return <>{children}</>;
};

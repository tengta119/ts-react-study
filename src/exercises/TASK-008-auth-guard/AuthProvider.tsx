import type React from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextValue } from './types';

/**
 * TASK-008: 登录态提供者（AuthProvider）—— 本任务的核心
 *
 * 它承担的角色，相当于 Spring Security 里的 `SecurityContextPersistenceFilter`：
 *   启动时把"持久化的登录态"恢复进上下文，登录/登出时更新它。
 *
 * ================== TODO ③【你来实现：本任务最核心的一块】==================
 * 请完成三件事（顺序即实现顺序）：
 *
 * 1) 状态声明：
 *      const [user, setUser] = useState<AuthUser | null>(null);
 *      const [initializing, setInitializing] = useState(true);
 *    ⚠️ initializing 的初始值为什么必须是 true？（回忆 TASK-007 那次首帧闪烁的教训：
 *       刷新页面时我们"还不知道"登录态，若直接当作未登录，用户一刷新就会被踢回登录页）
 *
 * 2) 「启动时恢复登录态」的副作用（useEffect + 空依赖数组）：
 *      - 先读 token：readToken()
 *      - 没有 token → 直接 setInitializing(false)（确认为未登录）
 *      - 有 token   → 用 token 换用户信息：fetchMeApi()
 *                      成功 → setUser(用户)；失败（失效/过期）→ clearToken()
 *      - 无论成功失败，最后都必须 setInitializing(false)，否则界面永久卡在"校验登录态…"
 *    ⚠️ 依然遵守 TASK-004 的老规矩：useEffect 回调不能直接 async，
 *       要在内部定义 async 函数再调用。
 *
 * 3) login / logout 两个方法：
 *      login(cmd)：
 *        a. const result = await loginApi(cmd)
 *        b. saveToken(result.token)   ← 必须在发后续请求之前存好，否则拦截器注入不了 Authorization
 *        c. setUser(result.user)
 *        d. return result.user（让登录页能拿到结果做跳转）
 *        ⚠️ 失败时**让异常继续往外抛**给登录页展示，不要在 Provider 里吞掉
 *      logout()：
 *        a. clearToken() + setUser(null)（本地登出必须成功）
 *        b. 可选：调用 logoutApi() 让服务端也失效（教学接口）—— 用 try/catch 包住，
 *           它是"尽力而为"：即使请求失败，本地登出也必须已完成
 *
 * 提示：Provider 的 value 每次渲染都会新建对象，因此它包裹的所有子组件都会跟着重渲染。
 *       当前规模完全不必优化，但你要知道这个事实（TASK-009 再谈 useMemo）。
 * =========================================================================
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ⬇︎ 下面的 value 只是"占位骨架"，让页面能先跑起来。实现时请整体替换为真实状态与方法 ⬇︎
  const placeholder: AuthContextValue = {
    user: null,
    initializing: false,
    login: async () => {
      throw new Error('TODO ③：请先实现 authApi.loginApi 与 AuthProvider.login');
    },
    logout: () => {
      // TODO ③：clearToken() + setUser(null)
    },
  };

  return <AuthContext.Provider value={placeholder}>{children}</AuthContext.Provider>;
};

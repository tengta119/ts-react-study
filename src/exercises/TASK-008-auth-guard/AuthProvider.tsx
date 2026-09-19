import type React from 'react';
import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { fetchMeApi, loginApi, logoutApi } from './authApi';
import { clearToken, readToken, saveToken } from './tokenStore';
import type { AuthContextValue, AuthUser, LoginCommand } from './types';

/**
 * TASK-008: 登录态提供者（AuthProvider）
 *
 * 角色类比：Spring Security 的 `SecurityContextPersistenceFilter`
 *   —— 启动时把"持久化的登录态"恢复进上下文；登录/登出时更新它。
 *
 * 已实现的三个要点（也是本任务最深的三个坑）：
 *   ① initializing 初值为 true —— 表达"刷新页面时我还不知道用户是谁"，
 *      避免首帧被误判为"未登录"而把已登录用户踢回登录页。
 *   ② 启动恢复的 useEffect 依赖数组为 [] —— "启动时恢复一次"是它的全部职责；
 *      若写成 [user]，登录成功后 setUser 又会触发它，形成重复请求甚至死循环。
 *   ③ login 中先 saveToken 再 setUser —— token 必须先落盘，
 *      否则界面先渲染受保护页面、该页组件立即发请求时，拦截器读不到 token → 401。
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // ────────────────────────────────────────────────────────────────
  // 1) 状态：user 为 null 表示"无用户"，配合 initializing 构成三态：
  //      initializing=true                  → 还不知道（显示"校验登录态…"）
  //      initializing=false && user=null    → 确认未登录（守卫应跳登录页）
  //      initializing=false && user!=null   → 已登录（放行）
  // ────────────────────────────────────────────────────────────────
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  // ────────────────────────────────────────────────────────────────
  // 2) 启动时恢复登录态（只跑一次）
  //    useEffect 的回调不能是 async（会返回 Promise，被当成清理函数），
  //    所以在内部定义 async 函数再调用。
  // ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = readToken(); // 注意：这里只是"有没有 token"，不代表 token 有效

      if (!token) {
        setInitializing(false); // 确认为未登录
        return;
      }

      try {
        // 带着 token 问后端"我是谁"（Authorization 头由请求拦截器自动注入）
        const me = await fetchMeApi();
        setUser(me);
      } catch {
        // token 失效 / 过期 / 后端不可用 → 清掉本地 token，保持未登录
        // （不在这里 setError：启动阶段静默降级即可，用户看到登录页就是正确的）
        clearToken();
      } finally {
        // ⚠️ 无论成功还是失败都必须关掉"校验中"，否则界面永久卡在"校验登录态…"
        setInitializing(false);
      }
    };

    void restoreSession();
  }, []); // ⚠️ 必须是 []：这是"启动恢复一次"，不是"每次 user 变化都重新同步"

  // ────────────────────────────────────────────────────────────────
  // 3) 登录：写入 token → 更新用户 → 把用户返回给调用方（登录页用它做跳转）
  //    异常不在这里吞掉，让它冒泡给登录页展示（错误归一化已在拦截器完成）
  // ────────────────────────────────────────────────────────────────
  const login = async (cmd: LoginCommand): Promise<AuthUser> => {
    const result = await loginApi(cmd);

    // 顺序不可颠倒：先让 token 落盘，后续请求（含跳转后页面的请求）才能被拦截器注入头
    saveToken(result.token);
    setUser(result.user);

    return result.user;
  };

  // ────────────────────────────────────────────────────────────────
  // 4) 登出：服务端"尽力而为"，本地必须成功
  //    ⚠️ 必须先 await 服务端接口，再清 token：
  //       axios 的请求拦截器是【Promise 链上的微任务】，晚于当前同步代码执行。
  //       若写成 logoutApi(); clearToken(); 同步两连击，
  //       拦截器执行时 token 已被清掉 → 请求带上空头 → 服务端 401，注销落空。
  // ────────────────────────────────────────────────────────────────
  const logout = async (): Promise<void> => {
    try {
      await logoutApi();
    } catch {
      // 忽略：服务端注销失败不应阻塞本地登出（例如 token 本已失效）
    } finally {
      clearToken();
      setUser(null);
    }
  };

  // value 里只放"值"（状态与方法），不放任何声明语句 —— 对象字面量只接受 key: value
  const value: AuthContextValue = { user, initializing, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * TASK-008: 认证契约定义（与 backend/main.py 的认证模块严格对齐）
 *
 * 与 Java 的对照：
 *   LoginCommand ⇄ `@RequestBody LoginCommand`
 *   LoginResult  ⇄ 登录接口返回的 `LoginResultVO`（token + 过期秒数 + 用户信息）
 *   AuthUser     ⇄ `UserPrincipal` / `SecurityContextHolder` 里的主体对象（不含密码）
 */

/** 登录请求体 */
export interface LoginCommand {
  username: string;
  password: string;
}

/** 当前登录用户（服务端不会返回密码） */
export interface AuthUser {
  username: string;
  name: string;
  role: string;
}

/** 登录成功响应 */
export interface LoginResult {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

/**
 * 全局认证状态的对外契约（`AuthContext` 暴露给所有组件的形状）。
 *
 * 为什么要有 `initializing`？
 *   刷新页面时 localStorage 里有 token，但"这个 token 对应的用户是谁"必须问后端才知道。
 *   在这个"问"的过程中，`user` 还是 null —— 如果此时直接当成"未登录"跳登录页，
 *   用户每次刷新都会被踢出去。所以必须区分三种状态：
 *     initializing=true            → 正在校验登录态（显示"校验中…"）
 *     initializing=false, user≠null → 已登录
 *     initializing=false, user=null → 确认为未登录 → 才允许跳登录页
 */
export interface AuthContextValue {
  user: AuthUser | null;
  initializing: boolean;
  /** 登录：成功后应写入 token、更新 user，并返回用户信息 */
  login: (cmd: LoginCommand) => Promise<AuthUser>;
  /** 登出：清 token、清 user（服务端注销为可选）
   *  ⚠️ 声明为 Promise<void>：它会先 await 服务端注销请求、再在 finally 里清理本地状态。
   *     契约如实写出异步性，调用方才知道需要 `await logout()` 后再跳转。
   */
  logout: () => Promise<void>;
}

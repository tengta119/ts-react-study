import { TOKEN_KEY } from '../TASK-007-http-layer/httpClient';

/**
 * TASK-008: token 持久化封装（基础设施层）
 *
 * 为什么不让组件直接写 `localStorage.setItem(...)`？
 *   1. 键名必须与请求拦截器读取时**完全一致** —— 统一引用 TASK-007 的 `TOKEN_KEY` 常量；
 *   2. 将来要从 localStorage 换成 sessionStorage / Cookie（HttpOnly）时，只改这一个文件；
 *   3. 读写边界集中在一处处理。
 *
 * Java 对照：像一个封装好的 `TokenRepository`，
 *           而不是让每个 Service 自己 new 一个 RedisTemplate 去拼 key。
 */

/** 保存 token（登录成功后调用） */
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** 读取 token（请求拦截器 / 启动时恢复登录态时使用） */
export function readToken(): string | null {
  // 注意：只代表"有没有 token"，不代表"token 有效"——有效性与对应用户必须问后端
  return localStorage.getItem(TOKEN_KEY);
}

/** 清除 token（登出 / token 失效时调用） */
export function clearToken(): void {
  // 用 removeItem 而不是 setItem(key, null)：后者会把 null 转成字符串 "null" 存进去，
  // 导致 if (token) 判定为真，发出 `Authorization: Bearer null` 这种非法头
  localStorage.removeItem(TOKEN_KEY);
}

// 💡 实现时取消下面这行注释（现在注释掉是为了避免“未使用的导入”导致编译失败）：
// import { TOKEN_KEY } from '../TASK-007-http-layer/httpClient';

/**
 * TASK-008: token 持久化封装（基础设施层）
 *
 * 为什么不让组件直接写 `localStorage.setItem('token', ...)`？
 *   1. 键名必须与请求拦截器读取时**完全一致** —— 统一引用 TASK-007 里的 `TOKEN_KEY` 常量；
 *   2. 将来要从 localStorage 换成 sessionStorage / Cookie（HttpOnly）时，只改这一个文件；
 *   3. 读写的边界（空值、异常）集中在一处处理。
 *
 * Java 对照：就像一个封装好的 `TokenRepository`，
 *           而不是让每个 Service 自己 new 一个 RedisTemplate 去拼 key。
 */

// ================== TODO ①【你来实现：3 个函数，每人一行】==================
// 提示：localStorage 的 API 是 setItem(key, value) / getItem(key) / removeItem(key)，
//      注意 getItem 的返回类型是 string | null（不要硬写成 string）。

/** 保存 token（登录成功后调用） */
export function saveToken(token: string): void {
  // TODO ①：写入 localStorage
  void token;
}

/** 读取 token（请求拦截器 / 启动时恢复登录态时使用） */
export function readToken(): string | null {
  // TODO ①：从 localStorage 读取（返回 string | null）
  return null;
}

/** 清除 token（登出 / token 失效时调用） */
export function clearToken(): void {
  // TODO ①：从 localStorage 删除
}

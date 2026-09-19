// 💡 实现时补上这行导入（脚手架阶段先注释掉，避免未使用导入导致 TS6133）：
// import { httpClient } from '../TASK-007-http-layer/httpClient';
import type { AuthUser, LoginCommand, LoginResult } from './types';

/**
 * TASK-008: 认证领域远程接口（Repository / Feign Client 层）
 *
 * 复用 TASK-007 建好的统一请求层 —— 你现在写出一个 URL 就够了：
 *   - baseURL `/api` 已配好（写相对子路径，如 '/auth/login'）
 *   - 请求拦截器已自动注入 `Authorization: Bearer <token>`（前提：token 已存进 localStorage）
 *   - 响应拦截器已把 4xx/5xx 归一化为中文 Error，并在 401 处留了 TASK-008 的插槽
 */

// ================== TODO ②【你来实现：3 个接口函数】==================
// 与 TASK-007 的 fetchUserPage 是同一个套路：
//   const res = await httpClient.post<LoginResult>('/auth/login', cmd);
//   return res.data;
// ⚠️ 注意别把 .data 忘了，也不要写 '/api/auth/login'（baseURL 已经带了 /api）。

/** 登录：POST /api/auth/login */
export async function loginApi(cmd: LoginCommand): Promise<LoginResult> {
  throw new Error(`TODO ②：loginApi 尚未实现（收到 username=${cmd.username}）`);
}

/** 用当前 token 换取登录用户：GET /api/auth/me（受保护接口，token 无效会 401） */
export async function fetchMeApi(): Promise<AuthUser> {
  throw new Error('TODO ②：fetchMeApi 尚未实现');
}

/**
 * 服务端注销 token：POST /api/auth/logout
 * 说明：真实项目里登出通常只需前端删 token；这里之所以调用服务端，
 *      是为了让你能亲手制造一个"token 已失效"的场景，验证 401 处理链路。
 */
export async function logoutApi(): Promise<void> {
  throw new Error('TODO ②：logoutApi 尚未实现');
}

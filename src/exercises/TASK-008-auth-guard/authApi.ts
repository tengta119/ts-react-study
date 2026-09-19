import { httpClient } from '../TASK-007-http-layer/httpClient';
import type { AuthUser, LoginCommand, LoginResult } from './types';

/**
 * TASK-008: 认证领域远程接口（Repository / Feign Client 层）
 *
 * 本层保持"纯净"：只做 URL + 参数 + 拆 `.data`，不写任何状态（如 saveToken / setUser）——
 * 那些属于编排层（AuthProvider）的职责。
 *
 * 复用 TASK-007 建好的统一请求层：
 *   - baseURL `/api` 已配好 → 这里只写相对子路径（'/auth/login'）
 *   - 请求拦截器已自动注入 `Authorization: Bearer <token>`（前提：token 已存进 localStorage）
 *   - 响应拦截器已把 4xx/5xx 归一化为中文 Error
 */

/** 登录：POST /api/auth/login（入参是请求体，放在 post 的第二个参数） */
export async function loginApi(cmd: LoginCommand): Promise<LoginResult> {
  const res = await httpClient.post<LoginResult>('/auth/login', cmd);
  return res.data;
}

/** 用当前 token 换取登录用户：GET /api/auth/me（受保护接口，token 无效会 401） */
export async function fetchMeApi(): Promise<AuthUser> {
  const res = await httpClient.get<AuthUser>('/auth/me');
  return res.data;
}

/**
 * 服务端注销 token：POST /api/auth/logout
 * 说明：真实项目里登出通常只需前端删 token；这里之所以调用服务端，
 *      是为了能亲手制造一个"token 已失效"的场景，验证 401 处理链路。
 */
export async function logoutApi(): Promise<void> {
  await httpClient.post('/auth/logout');
}

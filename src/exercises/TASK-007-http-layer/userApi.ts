import { httpClient } from './httpClient';
import type { ApiUser } from '../TASK-005-refactor-hook/types';
import type { PageResult, UserQueryParams } from './types';

/**
 * TASK-007: 用户领域远程接口定义（Repository / Feign Client 层）
 *
 * 为什么要单独一层，而不是在组件里直接 httpClient.get(...)？
 *   - 组件只关心「数据从哪来」，不该关心 URL 拼接、参数名、返回包裹结构；
 *   - URL 与契约一旦变动，只改这一个文件；
 *   - 这一层天然是「纯函数 + 强类型」，可以被 Hook、也可以在事件回调里随意复用。
 *
 * ⚠️ 路径规则：httpClient 的 baseURL 已经是 '/api'，
 *    因此这里写的 url 必须是**相对于 /api 的子路径**，
 *    写成 '/api/users/page' 会变成实际请求 '/api/api/users/page' → 404。
 */
export async function fetchUserPage(
  params: UserQueryParams
): Promise<PageResult<ApiUser>> {
  // axios 的第二个参数对象用 params 字段承载查询参数：
  //  1. 自动序列化成 ?page=1&size=5
  //  2. 值为 undefined 的字段自动忽略（不会拼出 keyword=undefined）
  //  3. 自动做 URL 编码（keyword 含中文/空格也安全）
  const res = await httpClient.get<PageResult<ApiUser>>('/users/page', { params });

  // async 函数会自动把返回值包装成 Promise.resolve(...)，
  // 所以这里只需要普通 return，不需要（也不能）手写 new Promise()
  return res.data;
}
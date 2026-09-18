// 💡 实现时记得补上这行导入（现在先留空是为了让脚手架保持可编译）：
// import { httpClient } from './httpClient';
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
  // TODO ③【你来实现】
  //   1. 调用 httpClient.get<PageResult<ApiUser>>('/users/page', { params })（记得先导入 httpClient）
  //      提示：第二个参数对象的 params 字段是 axios 的专用写法，
  //            它会自动把对象序列化成 ?page=1&size=5，并自动忽略 undefined 的字段，
  //            还会自动做 URL 编码（keyword 里含空格/中文也不会出错）。
  //   2. 返回的是 AxiosResponse 包裹体，真正的业务数据在 .data 上，记得解出来。
  //   3. 函数签名承诺返回 Promise<PageResult<ApiUser>>，TS 会强制你返回正确形状。
  throw new Error(
    `TODO: fetchUserPage 尚未实现（当前收到参数 page=${params.page}, size=${params.size}, keyword=${params.keyword ?? '无'}）`
  );
}

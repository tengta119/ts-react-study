// 💡 实现时补上这行导入（脚手架阶段先注释，避免未使用导入导致 TS6133）：
import { httpClient } from '../../TASK-007-http-layer/httpClient';
import type { PageResult, UserQueryParams } from '../../TASK-007-http-layer/types';
import type { ApiUser, CreateUserCommand, UpdateUserCommand } from '../types';

/**
 * TASK-009: 管理端用户接口（Repository 层）
 *
 * 端点权限（后端 main.py 第 6 节）：
 *   GET    /api/admin/users/page      需登录（任意角色）
 *   POST   /api/admin/users           需 ADMIN  → 403 if GUEST
 *   PUT    /api/admin/users/{id}      需 ADMIN
 *   DELETE /api/admin/users/{id}      需 ADMIN
 *
 * 注意：token 由 TASK-007 的请求拦截器自动注入，本层**不要**手写 Authorization 头；
 *      401（未登录）与 403（已登录但无权限）都由响应拦截器归一化为中文 Error。
 */

// ================== TODO ①【已完成】==================
// 统一套路：
//   泛型参数（<T>）= res.data 的类型 = 后端响应体类型（不是入参类型！）
//   参数位置：无 body 的方法（get / delete）第二个位置是 config；
//             有 body 的方法（post / put / patch）第二个位置是 data，config 退到第三位。

/** 分页 + 关键字查询（管理端，需登录，任意角色） */
export async function fetchAdminUserPage(
  params: UserQueryParams
): Promise<PageResult<ApiUser>> {
  const res = await httpClient.get<PageResult<ApiUser>>("/admin/users/page", { params });

  return res.data
}

/** 新增用户（需 ADMIN） */
export async function createAdminUser(cmd: CreateUserCommand): Promise<ApiUser> {
  const res = await httpClient.post<ApiUser>("/admin/users", cmd);

  return res.data
}

/** 编辑用户（需 ADMIN，PUT 整量更新） */
export async function updateAdminUser(id: number, cmd: UpdateUserCommand): Promise<ApiUser> {
  // ① 资源身份走 URL 路径（模板字符串拼接，对应后端 @PathVariable {user_id}）
  // ② 载荷走 body；注意 PUT 是「整量替换」：cmd 里没给的字段会被后端置为默认值
  // ③ 两个类型各司其职：入参类型由 cmd 变量保证（UpdateUserCommand），响应泛型是 ApiUser
  const res = await httpClient.put<ApiUser>(`/admin/users/${id}`, cmd);
  return res.data;
}

/** 删除用户（需 ADMIN） */
export async function deleteAdminUser(id: number): Promise<void> {
  // DELETE 没有请求体，也不需要响应数据 → 用 await 如实表达「只关心成功/失败」。
  // 契约是 Promise<void>；若写成 `const res = await ...; return res.data`，
  // 语法合法但语义荒谬：把一个 void 传给调用方，还容易诱使下游写 res.data.id。
  await httpClient.delete<void>(`/admin/users/${id}`);
}

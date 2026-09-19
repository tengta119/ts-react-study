// 💡 实现时补上这行导入（脚手架阶段先注释，避免未使用导入导致 TS6133）：
// import { httpClient } from '../../TASK-007-http-layer/httpClient';
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

// ================== TODO ①【你来实现：4 个接口函数】==================
// 套路与 TASK-008 的 authApi 完全一致：httpClient.post<类型>(相对路径, 请求体) → return res.data

/** 分页 + 关键字查询（管理端） */
export async function fetchAdminUserPage(
  params: UserQueryParams
): Promise<PageResult<ApiUser>> {
  throw new Error(`TODO ①：fetchAdminUserPage 尚未实现（page=${params.page}, keyword=${params.keyword ?? '无'}）`);
}

/** 新增用户（需 ADMIN） */
export async function createAdminUser(cmd: CreateUserCommand): Promise<ApiUser> {
  throw new Error(`TODO ①：createAdminUser 尚未实现（username=${cmd.username}）`);
}

/** 编辑用户（需 ADMIN，PUT 整量更新） */
export async function updateAdminUser(id: number, cmd: UpdateUserCommand): Promise<ApiUser> {
  throw new Error(`TODO ①：updateAdminUser 尚未实现（id=${id}, name=${cmd.name}）`);
}

/** 删除用户（需 ADMIN） */
export async function deleteAdminUser(id: number): Promise<void> {
  throw new Error(`TODO ①：deleteAdminUser 尚未实现（id=${id}）`);
}

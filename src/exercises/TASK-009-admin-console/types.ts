/**
 * TASK-009: 管理端契约定义（与 backend/main.py 第 6 节「管理端接口」对齐）
 */

import type { ApiUser } from '../TASK-005-refactor-hook/types';

/** 列表项复用 TASK-005 的用户契约（单一来源，不重复定义） */
export type { ApiUser };

/** 新增用户请求体：POST /api/admin/users */
export interface CreateUserCommand {
  name: string;
  username: string;
  email: string;
  phone: string;
  company_name?: string;
}

/** 编辑用户请求体：PUT /api/admin/users/{id}（整量更新） */
export interface UpdateUserCommand {
  name: string;
  username: string;
  email: string;
  phone: string;
  company_name?: string;
}

/** 表单状态：字符串字段的集合（提交前再映射成 Create/UpdateCommand） */
export interface UserFormState {
  name: string;
  username: string;
  email: string;
  phone: string;
  companyName: string;
}

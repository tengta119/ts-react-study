import type React from 'react';

/**
 * TASK-009: 管理端用户列表页（本任务核心）
 *
 * ================== TODO ②【你来实现】==================
 * 建议直接复用 TASK-007 的 `usePagedUsers`（它能换成管理端接口吗？请看下方“进阶改造”），
 * 在其基础上补齐 CRUD 交互。要求：
 *
 * 1) 搜索：受控输入 + **防抖 300ms**（进阶：自己写 `useDebouncedValue`，避免每敲一个字打一次请求）
 * 2) 列表：复用 TASK-007 的四态渲染（loading → error → empty → data）与分页控件
 * 3) 角色感知（对照后端 RBAC）：
 *      - `useAuth()` 取当前用户；只有 role === 'ADMIN' 才显示「新增 / 编辑 / 删除」入口
 *      - 注意：前端隐藏只是体验，后端仍会返回 403（这是刻意的“双保险”演示）
 * 4) 删除：调用 deleteAdminUser(id) → 成功后刷新
 *      ⚠️ 必须处理“末页被删空 → 页码自动回退”：
 *         删除后若 `page > totalPages`，应把页码设为 totalPages 再请求（否则出现“第 5 / 4 页 + 空列表”）
 * 5) 新增/编辑：打开 <UserFormModal>（见 TODO ③），保存成功后刷新当前页
 * 6) 详情入口：点击某行「详情」→ navigate(`/users/${user.id}`)
 *
 * 进阶改造：`usePagedUsers` 目前硬编码了 TASK-007 的公开接口 `/users/page`。
 *   要接管理端接口，可选：
 *     a. 给它加一个参数（如 fetcher 函数），注入不同的请求实现（**依赖注入**思想）；
 *     b. 或在本页重写一个 `useAdminUsers`，复制分页状态机（不推荐，重复逻辑）。
 *   推荐 a：把“请求怎么发”从“分页状态机”里解耦出来。
 * ======================================================
 */
export const AdminUsersPage: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        color: '#92400e',
        borderRadius: '10px',
        padding: '20px',
        fontSize: '13px',
        lineHeight: 1.8,
      }}
    >
      <strong>👥 TODO ②：管理端用户列表待实现</strong>
      <div>· 搜索（防抖 300ms）+ 分页（复用 TASK-007 的 usePagedUsers / Pagination / 四态渲染）</div>
      <div>· 角色感知：仅 ADMIN 显示「新增 / 编辑 / 删除」</div>
      <div>· 删除后处理「末页被删空 → 页码自动回退」</div>
      <div>· 新增 / 编辑走 &lt;UserFormModal&gt;；「详情」跳 /users/:id</div>
      <div style={{ marginTop: '8px', color: '#b45309' }}>
        提示：先用 admin 登录（后端 seed 23 条数据，size=5 时共 5 页），再用 guest 登录对比按钮差异。
      </div>
    </div>
  );
};

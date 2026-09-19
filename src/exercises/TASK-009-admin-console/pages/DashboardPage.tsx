import type React from 'react';
import { useAuth } from '../../TASK-008-auth-guard/AuthContext';

/**
 * TASK-009: 仪表盘首页
 *
 * ================== TODO ⑤【你来实现】==================
 * 1) 展示当前登录身份：`const { user } = useAuth()` → 姓名 / 登录名 / 角色徽标
 * 2) 统计卡片（数据来自管理端分页接口的 total）：
 *      - 用户总数（调 fetchAdminUserPage({ page: 1, size: 1 }) 取 total 即可，无需拉全量）
 *      - 当前角色可执行的操作提示（ADMIN 可增删改；GUEST 只读）
 *      - 三态：loading / error / data（和列表页一样的纪律）
 * 3) 角色差异提示：GUEST 登录时应看到“只读模式”的说明
 * ======================================================
 */
export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

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
      <strong>📊 TODO ⑤：仪表盘待实现</strong>
      <div>· 当前用户：{user === null ? '未登录' : `${user.name}（${user.role}）`}</div>
      <div>· 统计卡片：用户总数（用分页接口的 total，不要拉全量）</div>
      <div>· 角色差异提示：GUEST 为只读模式</div>
    </div>
  );
};

import type React from 'react';
import type { ApiUser } from '../types';

/**
 * TASK-009: 新增/编辑用户弹窗（复用 TASK-003 的受控表单功底）
 *
 * ================== TODO ③【你来实现】==================
 * 1) 双模式：
 *      - editingUser === null → 新增模式（空表单）
 *      - editingUser !== null → 编辑模式（用 useState 的**初始值**预填；注意初始值只在首渲染生效）
 * 2) 受控字段：name / username / email / phone / companyName（统一一个对象 state + 动态计算属性名）
 * 3) 提交：e.preventDefault() → 调 createAdminUser 或 updateAdminUser
 *      - submitting 期间禁用按钮 + 文案「保存中…」
 *      - 失败：显示后端中文消息（403 会显示「当前角色 GUEST 无权执行该操作（需要 ADMIN）」）
 *      - 成功：调用 onSaved() 让父组件刷新列表，然后 onClose()
 * 4) 弹窗层：外层遮罩 + 内层卡片；建议监听 Esc / 点遮罩关闭（进阶，可选）
 * ======================================================
 */
export interface UserFormModalProps {
  /** null = 新增模式；非 null = 编辑模式（表单预填该用户） */
  editingUser: ApiUser | null;
  onClose: () => void;
  /** 保存成功后的回调（由父组件负责刷新列表） */
  onSaved: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ editingUser, onClose, onSaved }) => {
  const mode = editingUser === null ? '新增' : `编辑 #${editingUser.id}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15,23,42,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          color: '#92400e',
          borderRadius: '10px',
          padding: '20px',
          maxWidth: '460px',
          width: '100%',
          fontSize: '13px',
          lineHeight: 1.8,
        }}
      >
        <strong>📝 TODO ③：用户表单弹窗待实现（{mode}）</strong>
        <div>· 双模式：新增 / 编辑（编辑模式需预填 editingUser 的字段）</div>
        <div>· 受控表单 + preventDefault + submitting 禁用 + 错误中文提示</div>
        <div>· 成功后调用 onSaved() 刷新列表，再 onClose()</div>
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <button type="button" onClick={onClose}>
            关闭（占位）
          </button>
          <button type="button" onClick={onSaved}>
            模拟保存成功（占位）
          </button>
        </div>
      </div>
    </div>
  );
};

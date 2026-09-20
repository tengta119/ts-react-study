import type React from 'react';
import { useState } from 'react';
import { createAdminUser, updateAdminUser } from '../api/adminUserApi';
import type { ApiUser, CreateUserCommand, UpdateUserCommand, UserFormState } from '../types';

/**
 * TASK-009: 新增/编辑用户弹窗（复用 TASK-003 的受控表单功底）
 *
 * ────────────────────────────────────────────────────────────────
 * 双模式设计（本 TODO 唯一的“新知识”）
 * ────────────────────────────────────────────────────────────────
 *   editingUser === null → 新增模式（空表单）
 *   editingUser !== null → 编辑模式（预填该用户）
 *
 * 预填的实现方式：**靠父组件传 `key` 强制重建本组件**。
 *   父组件写的是：`key={editingUser === null ? 'create' : `edit-${editingUser.id}`}`
 *   → 切换目标时 React 卸载旧实例、挂载新实例 → `useState` 的**初始化函数重新执行**
 *   → 表单天然是"那个用户的"数据，不需要任何同步逻辑。
 *
 *   反面写法（危险）：
 *     useEffect(() => { setForm(toFormState(editingUser)); }, [editingUser]);
 *   → 会被 ESLint 判 error（react-hooks/set-state-in-effect，会引起级联渲染），
 *     而且要渲染两次才能显示正确的预填值（用户会看到一帧上一个人的数据闪一下）。
 *
 *   📌 记住这句话：**"让组件重新出生"比"让组件改变自己"更便宜。**
 *      这与 Q-SR-04 的"常量快照"心智是同一条：state 的初始值只在首次渲染被采用。
 */

// ── 样式常量 ─────────────────────────────────────────────────────
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15,23,42,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  zIndex: 50,
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  padding: '20px',
  maxWidth: '480px',
  width: '100%',
  boxShadow: '0 10px 30px rgba(15,23,42,0.2)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '4px',
  fontSize: '13px',
  color: '#475569',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  boxSizing: 'border-box',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontSize: '14px',
};

const fieldErrorStyle: React.CSSProperties = {
  color: '#b91c1c',
  fontSize: '12px',
  marginTop: '4px',
};

const baseButtonStyle: React.CSSProperties = {
  padding: '9px 16px',
  borderRadius: '6px',
  fontSize: '14px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  color: '#1e293b',
  cursor: 'pointer',
};

// ── 纯函数：领域对象 ⇄ 表单状态 ⇄ 请求命令（无副作用，好测试）────────

/** ApiUser（后端实体）→ 表单状态。新增模式传 null，得到全空表单 */
function toFormState(user: ApiUser | null): UserFormState {
  return {
    name: user?.name ?? '',
    username: user?.username ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    // ⚠️ company 是可选对象，必须逐层兜底（`user.company.name` 在 company 为 undefined 时会崩）
    companyName: user?.company?.name ?? '',
  };
}

/**
 * 表单状态 → 请求体。
 *
 * ⚠️⚠️ 这是**最容易静默丢数据**的一步：字段命名风格不一致！
 *   前端：camelCase  `companyName`
 *   后端：snake_case `company_name`（Pydantic 模型字段名）
 *   若直接把 `companyName` 塞进请求体，Pydantic 默认会**静默忽略**未知字段
 *   → 用户填的公司名怎么都保存不上，而且**前后端都不报错**（最难查的一类 Bug）。
 *   实测（后端真实响应）：
 *     发 `companyName:"CORP-X"`  → 201 成功，但 `company.name` = "研发中心"（默认值，字段被丢了）
 *     发 `company_name:"CORP-Y"` → 201 成功，`company.name` = "CORP-Y"（生效）
 *   两边都是 201、都没报错 —— 这就是它的可怕之处。
 */
function toCreateCommand(form: UserFormState): CreateUserCommand {
  return {
    name: form.name.trim(),
    username: form.username.trim(),
    email: form.email.trim(),
    // phone 在后端是可选的，但 TS 契约里是必需字符串 → 空值回落到后端的默认语义
    phone: form.phone.trim() || '未登记',
    // ⚠️ 注意这里的名称转换：companyName → company_name
    company_name: form.companyName.trim() || undefined,
  };
}

/**
 * 编辑用的请求体（PUT 整量更新）。
 *
 * 为什么要多写一个“看起来只是转发”的函数？
 *   因为 CreateUserCommand 与 UpdateUserCommand 目前成员完全相同 → 在结构化类型（鸭子类型）下
 *   一个值可以同时满足两者，所以“只写一个 toCreateCommand”也能跑。
 *   但那样就把“两个契约还保持一致”这个**隐含假设藏起来了** ——
 *   将来后端给 UpdateUserCommand 加一个必填字段，编译期不会有人提醒你。
 *   在这里显式声明返回类型，等于把假设变成一道**编译期检查**：两者一旦飘离，tsc 立刻报错。
 *
 *   Java 类比：`CreateUserDTO` / `UpdateUserDTO` 两个类即使字段相同也不能互相赋值（名义类型）；
 *            而 TS 允许 —— 代价是“偷懒少写一个函数”也永远不会报错，只能靠这种显式标注来自我约束。
 */
function toUpdateCommand(form: UserFormState): UpdateUserCommand {
  return toCreateCommand(form);
}

/** 校验：返回"字段名 → 错误文案"的字典，空对象代表全部通过 */
function validate(form: UserFormState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (form.name.trim() === '') errors.name = '姓名不能为空';
  if (form.username.trim() === '') errors.username = '登录名不能为空';

  const email = form.email.trim();
  if (email === '') {
    errors.email = '邮箱不能为空';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    // 只做"形状"校验：真正的邮箱合法性只有发验证邮件才知道（前端正则永远只是拦截手滑）
    errors.email = '邮箱格式不正确（例如 zhangsan@company.com）';
  }

  return errors;
}

// ── 组件 ─────────────────────────────────────────────────────────
export interface UserFormModalProps {
  /** null = 新增模式；非 null = 编辑模式（表单预填该用户） */
  editingUser: ApiUser | null;
  onClose: () => void;
  /** 保存成功后的回调（由父组件负责刷新列表） */
  onSaved: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ editingUser, onClose, onSaved }) => {
  const isEditMode = editingUser !== null;

  // ⭐ 惰性初始化：只在首次渲染执行一次（父组件用 key 保证"首次"就是当前目标）
  //    写成 `useState(toFormState(editingUser))` 也行（每次渲染都白算一次），
  //    但传函数形式 `() => ...` 是"只在需要时才算"的惯用写法。
  const [form, setForm] = useState<UserFormState>(() => toFormState(editingUser));

  // 提交三态：submitting（禁用按钮）+ submitError（后端中文文案，403 也走这里）
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // 字段级错误（TASK-003 的 Record<string, string> 模式）
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /** 一个 handleChange 服务所有输入框：靠 e.target.name + 动态计算属性名 */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // 边改边清掉该字段的校验错误（否则用户改完了红字还赖着不走）
    setFieldErrors((prev) => {
      if (prev[name] === undefined) return prev; // 没有错误就返回原对象，避免无意义的重渲染
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    // ① 阻止浏览器默认提交（否则整页刷新，表单内容与登录态渲染全丢）
    e.preventDefault();

    // ② 双保险：即使按钮 disabled 被绕过（回车提交 / 调试器改 DOM）也不重复提交
    if (submitting) return;

    // ③ 提交前拦截：有字段错误就完全不发请求（"错误定位到字段"比一句笼统提示友好得多）
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      // ④ 同一个表单，两条分支 —— 模式判断只发生在这里（单一决策点）
      if (editingUser === null) {
        await createAdminUser(toCreateCommand(form));
      } else {
        await updateAdminUser(editingUser.id, toUpdateCommand(form));
      }

      // ⑤ 顺序：先让父组件刷新列表，再关闭弹窗（父组件的 onSaved 会 reload 当前页）
      onSaved();
      onClose();
    } catch (err: unknown) {
      // ⑥ 失败消息来自响应拦截器归一化后的后端中文 detail：
      //    GUEST 越权时这里显示「当前角色 GUEST 无权执行该操作（需要 ADMIN）」
      //    —— 注意：**403 不跳登录页**，就地提示才是正确语义（401 才跳登录）
      setSubmitError(err instanceof Error ? err.message : '保存失败，请稍后重试');
    } finally {
      // ⑦ 无论成败都恢复按钮。
      //    成功时组件已被卸载，这里的 setState 是"无害的空操作"（React 18+ 不再告警）
      setSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>
          {isEditMode ? `📝 编辑用户 #${editingUser.id}` : '➕ 新增用户'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label htmlFor="name" style={labelStyle}>
              姓名 <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              disabled={submitting}
              placeholder="张三 (Java 后端架构师)"
              style={inputStyle}
            />
            {fieldErrors.name !== undefined && <div style={fieldErrorStyle}>{fieldErrors.name}</div>}
          </div>

          <div>
            <label htmlFor="username" style={labelStyle}>
              登录名 <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              disabled={submitting}
              placeholder="zhangsan"
              style={inputStyle}
            />
            {fieldErrors.username !== undefined && (
              <div style={fieldErrorStyle}>{fieldErrors.username}</div>
            )}
          </div>

          <div>
            <label htmlFor="email" style={labelStyle}>
              邮箱 <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="email"
              name="email"
              type="text"
              value={form.email}
              onChange={handleChange}
              disabled={submitting}
              placeholder="zhangsan@company.com"
              style={inputStyle}
            />
            {fieldErrors.email !== undefined && <div style={fieldErrorStyle}>{fieldErrors.email}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label htmlFor="phone" style={labelStyle}>
                电话
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={form.phone}
                onChange={handleChange}
                disabled={submitting}
                placeholder="138-0000-0001"
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="companyName" style={labelStyle}>
                公司 / 团队
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={form.companyName}
                onChange={handleChange}
                disabled={submitting}
                placeholder="分布式基础架构部"
                style={inputStyle}
              />
            </div>
          </div>

          {/* 提交级错误（含后端 403 中文文案） */}
          {submitError !== null && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '13px',
              }}
            >
              ❌ {submitError}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            {/* ⚠️ 表单内按钮必须显式写 type="button"，否则默认 type="submit" → 点"取消"也会提交 */}
            <button type="button" onClick={onClose} disabled={submitting} style={baseButtonStyle}>
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                ...baseButtonStyle,
                border: 'none',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: submitting ? '#93c5fd' : '#2563eb',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? '保存中…' : isEditMode ? '保存修改' : '创建用户'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

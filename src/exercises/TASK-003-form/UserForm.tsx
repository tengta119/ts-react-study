import React, { useState } from 'react';

/**
 * TASK-003: 受控表单与多字段联动
 *
 * 🎯 你的目标：
 * 1. 定义 FormData 接口契约
 * 2. 使用受控组件管理表单的每一个输入字段
 * 3. 编写表单校验逻辑并在界面上提示错误信息
 * 4. 实现表单提交处理（记得 e.preventDefault() 阻止整页刷新）
 */

export interface FormData {
  username: string;
  email: string;
  role: 'DEVELOPER' | 'ARCHITECT' | 'TESTER';
  agree: boolean;
}

export const UserForm: React.FC = () => {
  // TODO: 声明表单状态
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    role: 'DEVELOPER',
    agree: false,
  });

  // 错误信息记录
  const [errors, setErrors] = useState<{ username?: string; email?: string }>({});
  // 提交成功展示结果
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  // TODO: 通用或独立的输入变更处理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // TODO: 表单提交处理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { username?: string; email?: string } = {};

    // 1. 校验用户名长度：3 ~ 16 字符
    const trimmedName = formData.username.trim();
    if (trimmedName.length < 3 || trimmedName.length > 16) {
      newErrors.username = '用户名长度需在 3 到 16 个字符之间';
    }

    // 2. 校验邮箱：简单的正则匹配
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = '请输入合法的电子邮箱地址';
    }

    // 3. 判断是否有错误
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 4. 校验全部通过：清空错误并记录提交结果
    setErrors({});
    setSubmittedData(formData);
  };

  function handleReset() {
    setFormData({
      username: '',
      email: '',
      role: 'DEVELOPER',
      agree: false,
    });

    setErrors({});
    setSubmittedData(null);
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px' }}>
      <h2>TASK-003: 用户信息受控表单</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>用户名:</label>
          <input
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
          {errors.username && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.username}</span>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>电子邮箱:</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
          {errors.email && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.email}</span>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>技术岗位:</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="DEVELOPER">后端开发工程师 (Developer)</option>
            <option value="ARCHITECT">架构师 (Architect)</option>
            <option value="TESTER">测试工程师 (Tester)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <input
              name="agree"
              type="checkbox"
              checked={formData.agree}
              onChange={handleChange}
            />
            我已阅读并同意开发规范协议
          </label>
        </div>

        <button
          type="submit"
          disabled={!formData.agree}
          style={{
            padding: '10px',
            background: formData.agree ? '#3b82f6' : '#9ca3af',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: formData.agree ? 'pointer' : 'not-allowed',
          }}
        >
          提交表单
        </button>

        <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '10px',
              background: '#e2e8f0',
              color: '#334155',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '8px'
            }}
        >
          重置表单
        </button>

      </form>

      {submittedData && (
        <div style={{ marginTop: '20px', padding: '12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px' }}>
          <h4>✅ 提交成功 (DTO 数据已捕获)：</h4>
          <pre style={{ fontSize: '12px' }}>{JSON.stringify(submittedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

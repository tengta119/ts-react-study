import React, { useState } from 'react';

/**
 * TASK-001: 全功能计数器
 *
 * 🎯 你的目标：
 * 1. 使用 useState 管理当前计数值 count
 * 2. 支持 step 步长调整（例如支持步长为 1, 5, 10，或者通过 input 输入自定义步长）
 * 3. 实现 加、减、重置 按钮的点击处理
 * 4. 样式增强：当 count > 0 时数字显示绿色，count < 0 显示红色，count === 0 显示灰色
 *
 * ⚠️ 记住原则：先在聊天框中告诉教练你的设计思路，得到反馈后再动手编码！
 */

export const Counter: React.FC = () => {
  // TODO: 1. 声明 count 的状态
  const [count, setCount] = useState<number>(0);

  // TODO: 2. 声明 step（步长）的状态，默认为 1
  const [step, setStep] = useState<number>(1);

  // TODO: 3. 实现事件处理函数
  const handleIncrement = () => {
    // TODO: 实现增加逻辑（当前仅为类型占位，请修改）
    setCount(count);
  };

  const handleDecrement = () => {
    // TODO: 实现减少逻辑（当前仅为类型占位，请修改）
    setCount(count);
  };

  const handleReset = () => {
    // TODO: 实现重置逻辑
    setCount(0);
  };

  // 根据当前计数值动态计算颜色样式
  const getCountColor = (): string => {
    if (count > 0) return '#10b981'; // 绿
    if (count < 0) return '#ef4444'; // 红
    return '#6b7280'; // 灰
  };

  return (
    <div style={{ padding: '24px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2>TASK-001: 全功能计数器</h2>

      {/* 计数值展示 */}
      <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0', color: getCountColor() }}>
        {count}
      </div>

      {/* 步长设置区 */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <label htmlFor="step-input" style={{ fontSize: '14px', color: '#4b5563' }}>
          步长 (Step):
        </label>
        <input
          id="step-input"
          type="number"
          value={step}
          onChange={(e) => setStep(Number(e.target.value) || 1)}
          style={{ width: '60px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        />
      </div>

      {/* 操作按钮区 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button
          onClick={handleDecrement}
          style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
        >
          -{step}
        </button>
        <button
          onClick={handleReset}
          style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', background: '#e5e7eb' }}
        >
          重置
        </button>
        <button
          onClick={handleIncrement}
          style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', background: '#3b82f6', color: '#fff' }}
        >
          +{step}
        </button>
      </div>

      <p style={{ marginTop: '24px', fontSize: '12px', color: '#9ca3af' }}>
        💡 提示：在 handleIncrement / handleDecrement 中补齐你的逻辑，然后向教练提交 Review！
      </p>
    </div>
  );
};

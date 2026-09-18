import type React from 'react';

/**
 * TASK-007: 分页控件（纯展示组件 / Dumb Component）
 *
 * 设计要点：它自己**不拥有任何状态**，只知道"当前第几页、总共几页"，
 * 用户点按钮时通过 Props 回调把"我想去哪一页"上报给父组件。
 * 对应 Java: 一个只接收入参、返回视图的纯函数 View，无副作用、可反复重放。
 */
export interface PaginationProps {
  /** 当前页码（从 1 开始） */
  page: number;
  /** 每页条数 */
  size: number;
  /** 总记录数 */
  total: number;
  /** 总页数 */
  totalPages: number;
  /** 请求进行中时禁用按钮，避免用户连点产生并发请求 */
  disabled?: boolean;
  /** 请求跳页；父组件负责做边界校验与真正的页码切换 */
  onPageChange: (nextPage: number) => void;
}

/**
 * 已实现的 4 个边界处理（保留备查）：
 *   1. 第 1 页 → 「上一页」禁用；末页 → 「下一页」禁用；
 *   2. total === 0 → 显示「暂无数据」，绝不渲染出「第 1 / 0 页」；
 *   3. disabled（loading）→ 两个按钮同时禁用，防止连点产生并发请求；
 *   4. onClick 必须用箭头函数包住自定义参数，否则会在渲染阶段立即执行。
 */
/**
 * 按钮样式工厂：把"可用 / 禁用"两种视觉抽成一处。
 * 注意这里用 React.CSSProperties 作为返回类型 —— 直接返回对象字面量时，
 * cursor 这类"字符串字面量联合类型"属性容易被推宽成 string 而报类型错。
 */
const pageButtonStyle = (enabled: boolean): React.CSSProperties => ({
  padding: '6px 14px',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 500,
  border: `1px solid ${enabled ? '#cbd5e1' : '#e2e8f0'}`,
  backgroundColor: enabled ? '#ffffff' : '#f1f5f9',
  color: enabled ? '#1e293b' : '#cbd5e1',
  cursor: enabled ? 'pointer' : 'not-allowed',
});

export const Pagination: React.FC<PaginationProps> = ({
                                                        page,
                                                        size,
                                                        total,
                                                        totalPages,
                                                        disabled = false,
                                                        onPageChange, // ⚠️ 这一行必须解构出来，否则按钮里调用它会报 TS2304（上次踩过的那坑）
                                                      }) => {
  // ────────────────────────────────────────────────────────────────
  // 派生值：全部由 props 现算，绝不引入新的 state
  //   （呼应你已掌握的「派生状态」原则：能算出来的东西不要存）
  // ────────────────────────────────────────────────────────────────
  const isFirstPage = page <= 1;
  // totalPages === 0（无数据）时视为"已经在末页"，这样"下一页"必然禁用
  const isLastPage = totalPages === 0 || page >= totalPages;

  // 把「是否首/末页」与「是否加载中」两个维度合并成一个变量：
  // 按钮的 disabled 与样式都只读这一个值 → 单一数据源，不会出现
  // "看起来能点但点了没反应"或"变灰了却能点"的不一致
  const canGoPrev = !disabled && !isFirstPage;
  const canGoNext = !disabled && !isLastPage;

  const hasData = total > 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px',
        borderTop: '1px dashed #cbd5e1',
        fontSize: '13px',
        color: '#475569',
      }}
    >
      {/* 文案区：total === 0 时绝不能渲染出「第 1 / 0 页」 */}
      <span>
           共 {total} 条 · 每页 {size} 条
        {hasData ? ` · 第 ${page} / ${totalPages} 页` : ' · 暂无数据'}
        {disabled ? ' · 加载中…' : ''}
         </span>

      <div style={{ display: 'flex', gap: '8px' }}>
        {/* ⚠️ onClick 必须用箭头函数包一层：
               写 onClick={onPageChange(page - 1)} 会在【渲染阶段】就立即执行，
               并把返回值（undefined）当作事件处理器 → 页面一挂载就跳页 */}
        <button
          type="button"
          disabled={!canGoPrev}
          onClick={() => onPageChange(page - 1)}
          style={pageButtonStyle(canGoPrev)}
        >
          ⬅︎ 上一页
        </button>

        <button
          type="button"
          disabled={!canGoNext}
          onClick={() => onPageChange(page + 1)}
          style={pageButtonStyle(canGoNext)}
        >
          下一页 ➡︎
        </button>
      </div>
    </div>
  );
};

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
 * ================== TODO ⑥【你来实现】==================
 * 要求渲染出如下结构（样式随意，功能与边界必须正确）：
 *
 *   「共 25 条 · 第 2 / 5 页」   [ ⬅︎ 上一页 ]  [ 下一页 ➡︎ ]
 *
 * 必须处理的 4 个边界（这里是最容易写出 Bug 的地方）：
 *   1. 第 1 页时"上一页"按钮必须 disabled（onClick 也不要发出无意义请求）；
 *   2. 最后一页时"下一页"按钮必须 disabled；
 *   3. 数据为空（total === 0）时显示"共 0 条"，不要让页码出现 第 1 / 0 页 这种尴尬文案；
 *   4. disabled 为 true 时两个按钮都禁用，防止 Loading 期间连点翻页。
 *
 * 提示：onClick={() => onPageChange(page - 1)} 这种"箭头函数包一层"是必须的，
 *      直接写 onClick={onPageChange(page - 1)} 会在渲染阶段就立即执行函数（经典错误）。
 * ======================================================
 */
export const Pagination: React.FC<PaginationProps> = ({
  page,
  size,
  total,
  totalPages,
  disabled = false,
  // TODO ⑥：实现按钮时，请在这里补上 onPageChange 的解构
  //         （这正是 mistakes.md 里「Props 契约是图纸，形参解构是施工」那一坑）
}) => {
  // ⬇︎ 下面是占位骨架，请整体替换为真实的分页 UI ⬇︎
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        borderTop: '1px dashed #cbd5e1',
        color: '#94a3b8',
        fontSize: '13px',
      }}
    >
      <span>
        TODO ⑥: 分页控件待实现 —— 共 {total} 条 · 第 {page} / {totalPages} 页 · 每页 {size} 条
        {disabled ? ' · 加载中…' : ''}
      </span>
    </div>
  );
};

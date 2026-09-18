import type React from 'react';
import { Pagination } from './components/Pagination';
import { usePagedUsers } from './usePagedUsers';

/**
 * TASK-007: 用户分页列表页（Smart / Container 容器组件）
 *
 * 职责边界（复习 TASK-005 的架构结论）：
 *   - 本组件只做「编排」：把 Hook 给的数据与回调，分发给搜索框、列表、分页控件；
 *   - 本组件自己不写 fetch、不管理 page/keyword 的具体变化逻辑（那属于 Hook 的职责）。
 *
 * ================== TODO ⑦【你来实现】==================
 * 页面从上到下需要三块：
 *
 * ① 搜索区：
 *    - 一个受控 <input>，value 绑定 keyword，onChange 调用 setKeyword(e.target.value)
 *      （⚠️ 搜关键词时不要自己再 setPage(1)，Hook 内部应该已经处理了；若你选择在组件里处理，
 *        就要保证"改关键字 → 页码归 1"这个联动一定发生）
 *    - 一个"重试/刷新"按钮调用 reload()，仅在 error 状态或需要手动刷新时使用
 *
 * ② 数据区：必须严格覆盖「黄金四态」，一条分支都不能少
 *    - loading === true        → 转圈 / "加载中…"，此时不要让旧列表乱闪
 *    - error !== null          → 错误文案 + 重试按钮（点它调用 reload()）
 *    - users.length === 0      → 空状态占位（"没有匹配的用户"），注意区分"没搜索到"和"还没加载"
 *    - 否则                     → 用 map 渲染 users，每行展示 name / email / phone，
 *                                 key 用 user.id（老规矩，禁止用数组 index）
 *
 * ③ 分页区：把 <Pagination /> 接上去
 *    page / size / total / totalPages / disabled={loading} / onPageChange={setPage}
 *
 * 进阶挑战（选做，做完能覆盖一个真实后端的经典边界）：
 *   给每行加"删除"按钮 → 在 Hook 或本组件里调用 DELETE /users/{id} 成功后再 reload()；
 *   重点观察：删除最后一页的最后一条后，当前页码可能已超出 totalPages，
 *   这时必须自动回退到上一页，否则用户会看到"第 3 / 2 页 + 空列表"的诡异界面。
 * ======================================================
 */
export const UserPagedList: React.FC = () => {
  const {
    users,
    total,
    totalPages,
    page,
    size,
    keyword,
    loading,
    error,
    setPage,
    reload,
  } = usePagedUsers(5);

  // ⬇︎ 下面是占位骨架，请整体替换为真实的搜索 + 三态列表 + 分页 UI ⬇︎
  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif' }}>
      <h3 style={{ marginTop: 0, color: '#0f172a' }}>
        📄 TASK-007 用户分页列表（统一请求层 + 服务端分页）
      </h3>

      <div
        style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          color: '#92400e',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '13px',
          lineHeight: 1.7,
        }}
      >
        <strong>TODO ⑦：请在此实现完整界面</strong>
        <div>· 搜索框（受控 input：keyword={keyword}）</div>
        <div>· 黄金四态：loading / error / empty / data（{users.length} 条已加载）</div>
        <div>· 分页控件联动（当前 error: {error ?? '无'}）</div>
        <button onClick={reload} style={{ marginTop: '8px', cursor: 'pointer' }}>
          🔄 重新加载（已接好 Hook，实现后即可真正拉数据）
        </button>
      </div>

      <Pagination
        page={page}
        size={size}
        total={total}
        totalPages={totalPages}
        disabled={loading}
        onPageChange={setPage}
      />
    </div>
  );
};

import type { ApiUser } from '../TASK-005-refactor-hook/types';

/**
 * TASK-007: 分页数据 Hook 的对外契约（Service 层的「接口」）
 *
 * 对应 Java: `UserPageService` 的接口定义。
 * 先把契约定下来，UI 层就可以并行开发（甚至先按契约写死假数据联调）。
 */
export interface PagedUsersResult {
  /** 当前页的数据（注意：不是全部数据！） */
  users: ApiUser[];
  /** 符合条件的总记录数 */
  total: number;
  /** 总页数（由后端返回，前端不要自己重复推导） */
  totalPages: number;
  /** 当前页码（从 1 开始） */
  page: number;
  /** 每页条数 */
  size: number;
  /** 当前搜索关键字 */
  keyword: string;
  loading: boolean;
  error: string | null;
  /** 跳转指定页（内部需做边界校验，禁止越界） */
  setPage: (nextPage: number) => void;
  /** 更新搜索关键字（⚠️ 必须同时把页码重置为 1） */
  setKeyword: (nextKeyword: string) => void;
  /** 强制重新拉取当前页（用于重试按钮） */
  reload: () => void;
}

/**
 * TASK-007: 分页 + 搜索的完整状态机 Hook
 *
 * ================== TODO ④【你来实现：本任务的核心】==================
 * 请你独立完成以下 5 件事（顺序即实现顺序）：
 *
 * 1) 状态声明（useState）：
 *    users / total / totalPages / page / size / keyword / loading / error
 *    提示：users 初始值给 [] 即可；page 初始值 1；size 用入参 initialSize。
 *
 * 2) 副作用拉数据（useEffect + async 内部函数）：
 *    复习 TASK-004 的结论：useEffect 的回调**不能**直接声明成 async
 *    （async 函数必定返回 Promise，而副作用回调的返回值会被 React 当成"清理函数"，
 *      交出 Promise 会触发警告），所以要在回调内部定义 async 函数再调用。
 *    调用 fetchUserPage({ page, size, keyword: keyword || undefined, ... })
 *    成功后用 setUsers / setTotal / setTotalPages 分别落到状态里。
 *
 * 3) 依赖项数组必须放全：
 *    [page, size, keyword] —— 漏掉任何一个，都会出现"翻页了但列表不刷新"的幽灵 Bug。
 *
 * 4) 竞态保护（本任务最硬的一个坑）：
 *    快速连点"下一页"，第 1 次请求可能比第 2 次晚返回，
 *    结果旧数据覆盖新数据 → 页面显示的内容和页码对不上。
 *    两种主流方案任选其一：
 *      a. useRef 记录请求序号（每次发请求 ++，回来时比对是否仍是最新序号，不是就丢弃结果）；
 *      b. AbortController + axios 的 signal 参数，页面切换/参数变化时主动取消上一个请求。
 *
 * 5) 对外方法：
 *    setPage  —— 做边界校验（< 1 或 > totalPages 直接忽略，避免请求空页）
 *    setKeyword —— 更新关键字的同时 **必须 setPage(1)**：
 *                  否则"搜到第 3 页再改关键字"会请求不存在的页码，用户看到空白列表。
 *    reload —— 让 useEffect 重新执行（例如用 useReducer 计数、或把 "刷新令牌" 放进依赖数组）
 *
 * 放宽心：本任务的 Hook 只暴露上面 PagedUsersResult 承诺的字段，多一个都不需要。
 * =========================================================================
 */
export function usePagedUsers(initialSize = 5): PagedUsersResult {
  // ⬇︎ 下面的返回值只是"占位骨架"，让页面能先跑起来。请在实现时整体替换掉它 ⬇︎
  return {
    users: [],
    total: 0,
    totalPages: 0,
    page: 1,
    size: initialSize,
    keyword: '',
    loading: false,
    error: 'TODO: usePagedUsers 尚未实现（请先完成 httpClient 拦截器与 userApi）',
    setPage: () => {},
    setKeyword: () => {},
    reload: () => {},
  };
}

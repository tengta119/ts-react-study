import type { ApiUser } from '../TASK-005-refactor-hook/types';
import { useEffect, useRef, useState } from 'react';
import { fetchUserPage } from './userApi';
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
 * 状态机总览（已实现）：
 *   1. 状态层：users / total / totalPages / page / size / keyword / loading / error / reloadToken
 *   2. 副作用层：page / size / keyword / reloadToken 任一变化 → 重新拉取当前页
 *   3. 竞态层：useRef 请求序号，只有“最新一次请求”的结果才允许写入状态
 *   4. 对外能力：setPage（带边界校验）/ setKeyword（联动归 1）/ reload（自增刷新令牌）
 */
export function usePagedUsers(initialSize = 5): PagedUsersResult {
  // ────────────────────────────────────────────────────────────────
  // 第 1 步：状态声明 —— 只有「会驱动界面变化」的数据才配当 state
  // ────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [total, setTotal] = useState(0);          // 总条数（后端给，不要自己算）
  const [totalPages, setTotalPages] = useState(0); // 总页数（后端给）
  const [page, setPageState] = useState(1);        // 原始 setter 改名，避免和对外方法同名
  // 每页条数：当前是固定值，不是“会变化的状态”，因此直接用入参常量。
  // （做「每页条数切换器」进阶时再改成 const [size, setSize] = useState(initialSize)；
  //   注意 useState 的初始值只在首次渲染被采用，之后入参变化不会影响它。）
  const size = initialSize;
  const [keyword, setKeywordState] = useState(''); // 原始 setter 改名
  // ⚠️ 初始值必须是 true：useEffect 在“渲染提交之后”才执行，首帧渲染时 loading 只能是初始值。
  //    若写 false，首帧会先渲染成空状态 → 用户会看到「暂无用户数据」闪一下再变「加载中」。
  //    而“挂载即请求”是确定的事实，所以初始就是加载中。
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0); // 「手动刷新令牌」，见第 4 步

  // ────────────────────────────────────────────────────────────────
  // 第 2 步：竞态保护的核心武器 —— 请求序号
  //   useRef 的两个特性正好满足需求：
  //     ① 跨渲染持久化（不会被每次渲染重置）
  //     ② 修改 .current 不触发重渲染（只是记账，不该引起界面变化）
  //   类比 Java：一个 AtomicLong 版本号，只有版本号最新的人才能写回共享状态
  // ────────────────────────────────────────────────────────────────
  const seqRef = useRef(0);

  // ────────────────────────────────────────────────────────────────
  // 第 3 步：副作用 —— page / size / keyword / 刷新令牌 任一变化就重新拉数据
  //   依赖数组必须放全！漏一个就会出现"翻页了但列表不刷新"的幽灵 Bug
  // ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const seq = ++seqRef.current; // 本次请求的版本号（之前的请求全部作废）

    // useEffect 的回调不能是 async（复习 Q-HK-03）：在内部定义 async 函数再调用
    const load = async () => {
      setLoading(true);
      setError(null); // 每次新请求先清掉上一次的错误，避免旧错误残留

      try {
        const result = await fetchUserPage({
          page,
          size,
          // 空字符串（'   ' 也算）转成 undefined：axios 会自动忽略该参数，
          // 这里用 || 是安全的 —— 它只处理"空串"这种假值，不像数字 0 那样会被误吞
          keyword: keyword.trim() || undefined,
        });

        // ⭐ 竞态守卫：如果我已不是最新一次请求，直接把结果扔掉
        if (seq !== seqRef.current) return;

        setUsers(result.list);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        // 页码权威说明：以本地 page state 为准（setPage 已做边界校验），
        // 后端返回的 result.page 仅作对账参考，不反向覆盖本地状态。
        // （进阶：删除末页最后一条后，若 page > result.totalPages 应自动回退到 totalPages）
      } catch (err: unknown) {
        if (seq !== seqRef.current) return; // 过期请求的失败也不该覆盖最新状态
        setError(err instanceof Error ? err.message : '未知网络异常');
      } finally {
        // ⚠️ 这里也必须比对！否则"慢的旧请求"回来时会把"快的新请求"的 Loading 关掉，
        //    界面会出现"还在加载却显示上一页数据"的闪烁
        if (seq === seqRef.current) setLoading(false);
      }
    };

    void load(); // void 表示「我有意不等待这个 Promise」，只是消除静态检查的告警
  }, [page, size, keyword, reloadToken]);

  // ────────────────────────────────────────────────────────────────
  // 第 4 步：对外三个方法
  // ────────────────────────────────────────────────────────────────

  // 跳页：必须做边界校验，杜绝请求空页
  //   （Pagination 组件已经禁用了首末页按钮，但"方法自己守住边界"才是真正的健壮性）
  const setPage = (nextPage: number) => {
    if (nextPage < 1) return;                       // 不能小于第 1 页
    if (totalPages > 0 && nextPage > totalPages) return; // 不能超过最后一页
    setPageState(nextPage);
  };

  // ⭐ 更新关键字的同时必须把页码归 1
  //   反例：在第 3 页时改关键字 → 搜索结果通常只有 1 页 → 请求 page=3 拿到空列表
  //        → 用户以为"搜不到"，其实是页码越界了
  const setKeyword = (nextKeyword: string) => {
    setKeywordState(nextKeyword);
    setPageState(1);
  };

  // 重新加载：用「自增刷新令牌」触发上面的 effect
  //   为什么不能把 load 函数直接放进依赖数组？
  //   因为组件内每次渲染都会新建函数引用，依赖数组会渲染一次变一次 → 死循环
  //   用函数式更新（t => t + 1）而不是 reloadToken + 1，避免闭包读到旧值（复习 TASK-002）
  const reload = () => setReloadToken((t) => t + 1);

  return {
    users,
    total,
    totalPages,
    page,
    size,
    keyword,
    loading,
    error,
    setPage,
    setKeyword,
    reload,
  };
}

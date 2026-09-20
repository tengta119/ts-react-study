/**
 * TASK-007: 前后端分页契约定义
 *
 * 设计原则（同 Java 后端）：
 * 契约（DTO）集中定义、单一来源，前端组件与请求层都引用同一份类型，
 * 这样后端字段一旦改名，TS 编译期就会立刻报错，而不是等到运行时白屏。
 */

/**
 * 分页响应包裹对象 —— 与后端 `GET /api/users/page` 的 PageResult 严格对齐
 * 对应 Java: `Page<UserVO>` / 自定义 `PageResult<T>`
 *
 * @template T 当前页里装的元素类型（如 ApiUser）
 */
export interface PageResult<T> {
  /** 当前页的数据切片（注意：这里装的是「一页」，不是「全部」） */
  list: T[];
  /** 符合条件的总记录数（用于算页码、显示"共 N 条"） */
  total: number;
  /** 当前页码，从 1 开始（不是从 0！） */
  page: number;
  /** 每页条数 */
  size: number;
  /** 总页数，由后端计算返回（对齐 Spring Data Page#getTotalPages） */
  totalPages: number;
}

/**
 * 分页查询入参 —— 对应后端 Query 参数
 * 对应 Java: `UserPageQuery` / `@RequestParam` 集合
 *
 * 提示：可选属性用 `?` 标注，语义等价于 Java 的 `@Nullable` / `Optional`，
 *      但 TS 是编译期约束，运行时并不会有自动装箱或 Optional 包装。
 */
export interface UserQueryParams {
  page: number;
  size: number;
  /** 关键字模糊搜索；无关键字时建议传 undefined（axios 会自动忽略该参数，而不是拼成 keyword=undefined） */
  keyword?: string;
  /** 教学用：模拟慢速网络，观察 Loading 状态 */
  delay?: number;
  /** 教学用：模拟后端 500，观察 Error 状态与重试 */
  fail?: boolean;
}

/**
 * 分页数据获取器：分页状态机与"具体请求实现"之间的**契约**（函数类型）。
 *
 * 为什么需要它（TASK-009 的依赖倒置）：
 *   TASK-007 的 usePagedUsers 里硬编码了 fetchUserPage（公开接口 `/users/page`）；
 *   TASK-009 要走管理端 `/admin/users/page`，但"分页 + 竞态 + 四态 + 边界校验"的逻辑一模一样。
 *   与其复制一份状态机，不如把"请求怎么发"抽成参数注入进去 —— 这就是前端的依赖注入。
 *
 * Java 对照：
 *   `PageFetcher<User>` ⇄ 一个函数式接口 `@FunctionalInterface interface PageFetcher { PageResult<User> fetch(UserQueryParams p); }`
 *   传入 `fetchAdminUserPage` ⇄ 传入方法引用 `this::fetchAdminUserPage`
 *   泛型 <T> ⇄ `interface PageFetcher<T>`（Spring Data 的 `Pageable` + `Page<T>` 组合的那一层抽象）
 */
export type PageFetcher<T> = (params: UserQueryParams) => Promise<PageResult<T>>;

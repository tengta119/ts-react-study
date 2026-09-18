# TASK-007: 统一请求层封装与服务端分页联调 (HTTP Layer & Server-Side Pagination)

> **目标**：从「组件里裸写 `fetch`」升级为「企业级分层请求架构」：`axios` 实例 + 请求/响应拦截器 + Repository 层 + 泛型分页 Hook，并打通服务端分页、关键字搜索联动与请求竞态保护。
> **代码工作区**：`src/exercises/TASK-007-http-layer/`（脚手架与 TODO 已就位）
> **任务定位**：阶段 8（Spring Boot + React 全栈联调实战）第一关 —— 把你的前端代码从「练习」推进到「工程」。

---

## 🎯 业务需求

把 TASK-005 / TASK-006 里的「用户中心」从**一次性拉全量 + 前端本地过滤**，升级为**真实后端的服务端分页查询**。

真实后端不再返回裸数组 `UserDTO[]`，而是返回分页包裹对象 `PageResult<UserDTO>`：

```json
{
  "list": [ { "id": 1, "name": "李明 ...", ... } ],
  "total": 23,
  "page": 1,
  "size": 5,
  "totalPages": 5
}
```

> 后端已内置 **23 条种子数据**，因此 `size=5` 时正好是 5 页（末页只有 3 条），
> 这样你才有真实场景去验证“首末页边界”、“搜索后页码归 1”、“删除后页码回退”。

你要完成的四层结构：

```
src/exercises/TASK-007-http-layer/
├── httpClient.ts           ① 基础设施层：axios 实例 + 请求/响应拦截器      ⇄ HttpClient 配置类
├── types.ts                ✅ 已提供：PageResult<T> / UserQueryParams 契约
├── userApi.ts              ② 接口层：fetchUserPage(params) ⇒ Promise<PageResult<ApiUser>>  ⇄ Repository / Feign
├── usePagedUsers.ts        ③ 业务层：分页 + 搜索状态机 Hook                ⇄ Service
├── UserPagedList.tsx       ④ 视图层：搜索框 + 黄金四态 + 分页联动          ⇄ Controller + View
└── components/Pagination.tsx  ④ 纯展示组件：分页控件                       ⇄ 无状态 View
```

**功能验收目标**：
1. `GET /api/users/page?page=1&size=5` 正确渲染第一页 5 条用户（共 23 条 / 5 页）；
2. 输入关键字搜索（如「张」），列表按后端过滤结果刷新，且**页码自动回到第 1 页**；
3. 点击「下一页 / 上一页」时 URL 参数、列表内容、页码显示三者严格同步；
4. 后端关闭 500 / 慢速延迟时，Loading 与 Error 状态表现正常，重试按钮可用；
5. 快速连点翻页**不会**出现「页码是 3，列表却是第 2 页数据」的错乱。

---

## 💡 所需知识点与提示

### 1. axios 实例（`axios.create`）
- 和原生 `fetch` 的本质差异：`fetch` 只在网络层失败时 reject（HTTP 500 它**不会**抛异常，得自己判 `res.ok`）；而 axios 会把 **4xx/5xx 直接抛进 catch**，并且**自动 JSON 解析**（不需要再 `await res.json()`）。
- `axios.create({ baseURL, timeout })`：一次性配置好前缀与超时，业务代码只写相对路径。

### 2. 拦截器（Interceptor）—— 前端的「横切关注点」

| 前端 Axios | Spring Boot 对等物 | 职责 |
| :--- | :--- | :--- |
| `interceptors.request.use` | `Filter#doFilter` / `HandlerInterceptor#preHandle` | 出发前统一注入 Token、埋点日志、加公共参数 |
| `interceptors.response.use` 成功分支 | `HandlerInterceptor#postHandle` | 统一日志、统一解包约定 |
| `interceptors.response.use` 失败分支 | `@RestControllerAdvice` + `@ExceptionHandler` | 把各种异常**归一化**为统一的错误消息 |

**记忆点**：拦截器的意义不是"少写两行代码"，而是**让业务代码彻底不关心鉴权头、错误格式、重试策略**——这正是"横切关注点"的定义。

### 3. 服务端分页（Server-Side Pagination）
- 前端只拿「当前页切片」，总条数由后端给（`total` ↔ SQL 的 `COUNT(*)`，`list` ↔ `LIMIT/OFFSET`）；
- 前端**不要**自己去算 `total / size`：跨页一致性、并发写入都会让前端算错，`totalPages` 以服务端返回为准（对齐 Spring Data `Page#getTotalPages`）；
- 页码从 **1** 开始，切片偏移量 `offset = (page - 1) * size`（对应 SQL `LIMIT size OFFSET offset`）。

### 4. 请求竞态（Race Condition）
"用户连点下一页 → 第 1 个请求比第 2 个请求晚返回 → 旧数据覆盖新数据"。这是所有真实前端项目都会遇到的经典 Bug，也是本任务最硬的一关。两种主流解法见下方便签。

---

## ⚠️ 编码前必读的 6 个坑

### 坑 1：在响应拦截器里 `return response.data`（网上教程重灾区）
很多教程教你这么干来"顺便拆包"，但 axios 的 TS 类型仍然声明为 `AxiosResponse<T>`，**类型与运行时值不一致**（类型撒谎）。之后写 `res.data` 就会拿到 `undefined`，且 TS 完全不报错。
✅ 本任务约定：**拦截器只做统一处理，拆 `.data` 的职责放在 `userApi.ts`**。

### 坑 2：axios 路径与 `baseURL` 叠加导致 404
`httpClient` 的 `baseURL` 已是 `/api`，所以 `userApi.ts` 里必须写 `'/users/page'`。若写成 `'/api/users/page'`，实际请求会变成 `/api/api/users/page` → 404。

### 坑 3：改了关键字却忘记把页码重置为 1
场景：搜到第 3 页时改关键字 → 大多数搜索条件只有 1 页数据 → 请求 `page=3` 只能拿到空列表，用户以为"搜不到"。
✅ 规则：**任何改变查询条件（keyword / size）的操作，都必须把 `page` 归 1**。

### 坑 4：`useEffect` 依赖数组漏放 `page / keyword`
现象：点击"下一页"地址栏没变、Loading 也不转，列表纹丝不动（因为那个异步函数只在挂载时跑过一次）。
✅ 依赖数组必须写全 `[page, size, keyword, reloadToken]`；另外**不要**把每次渲染都会新建的函数（如内联定义的 `fetchData`）直接丢进依赖数组，否则会死循环（复习 TASK-004）。

### 坑 5：竞态导致「页码与数据不匹配」
✅ 二选一：
- **请求序号法**：`const seqRef = useRef(0)`，发请求前 `const seq = ++seqRef.current`，回来后 `if (seq !== seqRef.current) return;` 直接丢弃过期结果；
- **取消法**：`AbortController` + `httpClient.get(url, { signal })`，在 `useEffect` 的清理函数里 `controller.abort()`。

### 坑 6：分页边界计算 Off-by-One
- 第一页必须禁用"上一页"，最后一页必须禁用"下一页"；
- `total === 0` 时不要渲染成"第 1 / 0 页"；
- 若你挑战了「列表里删除用户」的进阶需求：删掉最后一页的最后一条后，当前 `page` 可能已 `> totalPages`，必须自动回退到上一页，否则出现"第 3 / 2 页 + 空列表"。

---

## 🧭 后端接口速查

```bash
# 1) 启动教学后端（FastAPI，契约对齐 Spring Boot）
cd backend && python -m uvicorn main:app --port 8000 --reload

# 2) 分页接口（本次任务的主接口）
curl "http://127.0.0.1:8000/api/users/page?page=1&size=5"
curl "http://127.0.0.1:8000/api/users/page?page=2&size=5&keyword=张"
curl "http://127.0.0.1:8000/api/users/page?page=1&size=5&delay=1.5"   # 观察 Loading
curl "http://127.0.0.1:8000/api/users/page?page=1&size=5&fail=true"   # 观察 Error + 重试
```

> 前端请求路径统一写相对路径（如 `/users/page`），由 `vite.config.ts` 的 dev proxy 把 `/api/**` 转发到 `127.0.0.1:8000`。
> 开发期用代理 = **同源**，因此浏览器根本不触发 CORS 预检；生产环境的等价物就是把这段换成 Nginx 的 `location /api { proxy_pass ...; }`。

---

## ✅ 验收标准 (DoD)

- [x] ① `httpClient.ts` 完成 axios 实例（baseURL `/api` + 超时）与请求拦截器（Token 插槽 + 日志）
- [x] ② 响应拦截器完成错误归一化：500/404 取后端 `detail`、超时、后端未启动三种情况都有友好中文提示
- [x] ③ `userApi.ts` 完成 `fetchUserPage`，签名与返回值和 `PageResult<ApiUser>` 严格一致
- [x] ④ `usePagedUsers` 完成分页状态机：page/size/keyword 驱动请求、黄金四态、`setPage` 边界校验、`setKeyword` 页码归 1、`reload` 重试
- [x] ⑤ 实现请求竞态保护（`useRef` 序号法），快速连点翻页数据不错乱（并在 `StrictMode` 双请求下验证通过）
- [x] ⑥ `Pagination.tsx` 分页控件完成，首末页按钮正确禁用、Loading 期间禁止连点
- [x] ⑦ `UserPagedList.tsx` 完成搜索框 + 四态渲染 + 分页联动，`key` 使用 `user.id`
- [x] ⑧ 通过教练 Code Review，并完成口试抽查（拦截器机制 / 竞态 / 分页边界 / useEffect 时序）

### 🎉 通关附加成果（超出 DoD）
- [x] `loading` 初始值修正为 `true`，消除首帧「暂无用户数据」闪烁（详见 `docx/mistakes.md`）
- [x] `TOKEN_KEY` 抽为常量（为 TASK-008 读写共用做好准备）
- [x] 调试日志用 `import.meta.env.DEV` 包裹，生产构建不再输出请求 URL 与响应体
- [x] `tsc -b` / `eslint` / `npm run build` 三项全绿

### 🚀 进阶挑战（选做，转入 TASK-008/009 一并覆盖）
- [ ] 删除用户 → 成功后 `reload()`，并处理"最后一页变空自动回退上一页"
- [ ] 关键字输入加防抖（debounce 300ms），避免每敲一个字都打一次请求
- [ ] 每页条数切换器（5 / 10 / 20），切换时页码归 1
- [ ] 用 `AbortController` 把「丢弃结果」升级为「真正取消在途请求」

# 🎓 TASK-009 结业口试题库与参考答案

> **性质说明（如实记录）**：TASK-009（结业项目）的口试**免测**，本文以"参考答案 + 复盘"形式归档，供日后查阅与自测。
> 归档日期：2026-09-19 ｜ 配套代码：`src/exercises/TASK-009-admin-console/`
> 使用建议：**先盖住"参考答案"，自己口头答一遍**，再对照。看答案的收益远低于答一遍。

---

## Q1: 为什么搜索框不能直接绑 Hook 的 `setKeyword`？两层后果分别是什么？

**1）请求层面：每个字符一次请求（防抖失效）**

输入「架构师」= 3 次 `onChange` = 3 次 `setKeyword` = 3 次 `useEffect` = **3 个请求**。Network 面板一眼可见，而后端要处理 3 倍的 QPS。
> 防抖的意义：值变化后等 300ms，期间没有新变化才采用。它把「用户输入的中间态」与「真正生效的查询条件」分成了两个概念。

**2）数据层面：这才是真正致命的一点**

"多打几个请求"本身**不必然**出错 —— 如果响应按序到达，后到的那次（最新关键字）会覆盖前一次，结果仍然正确。
**但网络不保证顺序**：若「架」的响应比「架构师」的响应**晚**到，旧结果就会把新结果覆盖掉 → 列表显示的内容与输入框里的关键字**不一致**（幽灵结果）。

这就是 TASK-007 学过的**竞态（race condition）**：请求的**发出顺序**不等于**返回顺序**。

**关键结论：防抖和竞态治理是两件不同的事，不能互相替代。**

| 手段 | 解决什么 | 本任务实现 |
| :--- | :--- | :--- |
| 防抖 debounce | **少发**请求（省流量、省服务器）| `useDebouncedValue(searchInput, 300)` |
| 竞态守卫 | 保证只有**最后一次**请求能写状态（保正确）| `usePagedUsers` 里的 `seqRef` 序号法 |
| 请求取消 | 在途请求真正掐断 | `AbortController`（DoD ⑩ 进阶，未做）|

**Java 类比**：相当于异步 RPC 乱序返回 —— 无论你发了几次调用，**判断"该采信哪一次结果"必须靠序号/时间戳**（像 Kafka 的分区 offset、像乐观锁版本号），而不能假设"后发的先回"。

---

## Q2: 删除用户时，为什么判断条件是 `users.length === 1 && page === totalPages`？两个条件缺一不可吗？

```tsx
const willEmptyCurrentPage = users.length === 1 && page === totalPages;
if (willEmptyCurrentPage && page > 1) setPage(page - 1);  // 回退一页
else reload();                                            // 原地刷新
```

**`users.length === 1` 的必要性**：只有"本页只剩最后一条、且它被删掉"才会让当前页变空。
- 写成 `=== 0` 就永远不成立（我们是在**删除前**判断，此时列表里必然还有那一条）；
- 写成 `total % size === 1` 是错的 —— 那算的是"最后一页的余数"，与"当前是否停在最后一页"无关。

**`page === totalPages` 的必要性**：只有**最后一页**才会被删空。
- 中间页删掉一条后，后面的记录会往前补位，页面上仍有数据；
- 第 1 页永远删不空（同理）。

**缺了第二个条件会怎样**：假设共 5 页、每页 5 条，用户在第 2 页删掉其中一条（`users.length === 1` 不成立，所以本例不会误触发）—— 真正的反例是：**用户在第 3 页（非末页）且该页恰好只有 1 条**（数据量刚好、或关键字过滤后），此时若只判 `users.length === 1`，就会把用户从第 3 页"踢"回第 2 页 —— **页码无故倒退**，用户会以为数据丢了。

**为什么不用 `page > totalPages` 来判断？**
因为 `deleteAdminUser` 的契约是 `Promise<void>` —— **拿不到删除后的新 `totalPages`**。我们只能基于「删除前」的页面信息做推断。
> 📌 这是"契约决定能力"的真实案例：如果后端 delete 返回剩余条数，判断就能写成 `page > Math.ceil((total-1)/size)`。但用 `void` 也没什么不好 —— 它如实表达了"这次调用没有产出数据"，代价是需要前端用"删除前快照"来推断。

**Java 类比**：`LIMIT (page-1)*size, size` 在数据被删除后可能返回空集；分页的**权威边界永远在数据源**，客户端只能跟随、无法预判。所以要么让服务端返回新分页信息，要么客户端按"最保守的推断"回退。

---

## Q3: 401 与 403 的本质区别是什么？"全局 401"为什么不能直接在拦截器里 `window.location.href = '/login'`？

**语义差异（真实工程的分水岭）**

| 状态 | 含义 | 前端正确反应 |
| :--- | :--- | :--- |
| **401 Unauthorized** | "**你是谁？我不知道**"（没带 token / token 失效）| 清 token → **跳登录页** |
| **403 Forbidden** | "**我知道你是谁，但你不能干这个**"（如 GUEST 增删改）| **就地提示"无权限"**，绝不跳登录 |

**混为一谈的后果**：`guest` 用户刚登录成功，点一下删除（后端回 403），却被他被踢到登录页 —— 用户会以为"我的账号有问题/系统出 bug 了"，而真相是他**本来就没有权限**。

**本项目的实测证据**：
```
guest 调 DELETE /api/admin/users/1 → 403 {"detail":"当前角色 GUEST 无权执行该操作（需要 ADMIN）"}
不带 token 调 DELETE              → 401 {"detail":"未提供有效的 Authorization 头，请先登录"}
```
后端的 `_require_admin()` 刻意**先鉴权（401）再鉴角色（403）**，正是为了让前端能区分这两种处置。

**为什么拦截器里不能用 `window.location.href`？**

拦截器（axios interceptor）**不在 React 组件树里**：
1. 它拿不到 `useNavigate()`（Hook 只能在组件/Hook 中调用）；
2. 更根本的是**破坏了 SPA 的模型** —— `window.location.href = '/login'` 会触发**整页刷新**：应用状态全丢（哪怕你刚刚只是 token 过期）、Vite 的模块缓存重来、原有"登录后回跳原页面"的能力也没有了（因为内存里的 location 信息没了）。

**正确做法（事件广播 + 单一处理者）**：
```tsx
// 拦截器（非 React 世界）：只负责"广播发生了什么"，不负责决策
if (status === 401) {
  window.dispatchEvent(new CustomEvent('auth:unauthorized'));
}

// AuthProvider（React 世界）：唯一处理者 —— 清 token + 清 user
useEffect(() => {
  const onUnauthorized = () => { clearToken(); setUser(null); };
  window.addEventListener('auth:unauthorized', onUnauthorized);
  return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
}, []);
// → user 变 null → <ProtectedRoute> 自然把人送回登录页（声明式，无需手动跳转）
```
> 注意那个 `return () => removeEventListener`：这就是"创建了资源就必须返回清理函数"（Q-HK-08/Q-HK-09）。少了它，Provider 重挂载时会累积监听器。

**Java 类比**：拦截器广播 ⇄ 发布 `ApplicationEvent`；AuthProvider 监听 ⇄ `@EventListener`。
**为什么这样更好**：`Authorization` 头由拦截器**单一注入**、401 由 Provider **单一处理** —— 又一次"同一件事只能有一个 owner"。若让 5 个页面各自处理 401，必然出现"3 个页面记得跳、2 个忘了"的参差。

---

## Q4: `usePagedUsers` 的依赖数组为什么必须包含 `fetcher`？`useCallback` 在这里到底解决什么问题？

```ts
}, [page, size, keyword, reloadToken, fetcher]);
```

**为什么必须有 `fetcher`**：依赖数组的语义是"**这个 effect 的全部输入**"。请求 URL、返回类型都由 `fetcher` 决定 —— 它是输入的一部分。
**漏掉的后果**：切到管理端接口后，effect 仍认为"输入没变"→ **不会重新请求** → 页面继续显示公开接口的数据（或旧数据），而且**编译器、lint 都不会报错**（数组里少一个名字是合法语法）。

**`useCallback` 解决的是"引用稳定性"，不是"性能"**

```tsx
usePagedUsers((p) => fetchAdminUserPage(p), 5);   // ❌ 内联箭头函数：每次渲染都是新引用
usePagedUsers(fetchAdminUserPage, 5);              // ✅ 模块级函数：引用终身稳定
```
`Object.is` 对**引用类型只比地址**（Q-TS-10）→ 内联函数每轮渲染都是新地址 → deps 每轮都"变化" → **effect 每轮重跑 → 无限请求**。

同理，`AdminUsersPage` 里这句 effect 要求 `setKeyword` 稳定：
```tsx
useEffect(() => { setKeyword(debouncedSearch); }, [debouncedSearch, setKeyword]);
```
所以 `usePagedUsers` 里把 `setKeyword` / `setPage` / `reload` 都包了 `useCallback`。**这不是优化，是让它们有资格作为依赖项**。

**一个精辟总结**：`useCallback` 的真正用途 = **"让函数可以安全地参与依赖比较"**。
> 这正是 eslint `exhaustive-deps` 会拦下"省略 setKeyword"的原因：规则无法证明一个**自定义 Hook 返回的函数**稳定（它只认得 `useState` 的 setter 这类官方保证稳定的白名单），于是要求你写进 deps。想少写依赖，正确做法是**改设计（让函数稳定）**，而不是**删名字**。

---

## Q5: 前端字段叫 `companyName`、后端要 `company_name`，直接发 `companyName` 会怎样？为什么两边都不报错？

**实测（后端真实响应）**：

| 发送字段 | HTTP | 返回的 `company.name` | 结论 |
| :--- | :---: | :--- | :--- |
| `"companyName":"CORP-X"` | **201** | `"研发中心"`（服务端默认值）| ❌ **字段被静默丢弃** |
| `"company_name":"CORP-Y"` | **201** | `"CORP-Y"` | ✅ 生效 |

**根因：反序列化器默认"宽容"**
- **Pydantic v2**：`extra='ignore'` 是默认行为 —— 多余的未知字段不报错、不提示、直接丢；
- **Spring Boot + Jackson**：`FAIL_ON_UNKNOWN_PROPERTIES=false` 也是默认。

两者都是为了 API 向后兼容而选择"容错优先"，代价是：**字段名写错时你收不到任何信号**。

**为什么这是最难查的一类 Bug**：状态码成功（201）→ 前后端都不报错 → Network 里 payload "看着有值" → 只有用户发现"我填的公司名怎么总是空"。排查方向极易跑偏到"前端没绑定"。

**诊断三步（成本从低到高）**：
1. **看返回体**：POST 成功后 API 返回的就是**入库后的实体** → 直接比对"我发的值"与"它回的值"（`研发中心` vs `CORP-X`，一眼可辨）；
2. **看 Swagger**（`/docs`）：以后端字段名为唯一真相；
3. **治本**：后端加严 `extra='forbid'` / `FAIL_ON_UNKNOWN_PROPERTIES=true`，让多余字段在开发期直接 422。

**架构纪律**：字段映射必须集中在**一处**（本项目 `toCreateCommand` / `toUpdateCommand`）。若在每个提交点各写一份，漏一处就静默丢一个字段。

**Java 类比**：Java 里两个类字段不同名是**编译错误**；一旦跨过 HTTP 边界，**没有任何编译器在看着你** —— 只能靠显式映射 + "对比返回体"的习惯兜底。
> 口诀：**提交成功 ≠ 保存成功，对比你发出去的值和它回给你的值。**

---

## Q6: 前端项目部署到 Nginx 后，直接打开 `/users/3` 为什么 404？`import.meta.env` 能当"运行期配置"用吗？

**为什么 404**：`dist/` 里只有 `index.html` 和 `assets/xxx.hash.js`，**磁盘上根本不存在 `users/3` 这个路径**。
- 浏览器请求 `/users/3` → Nginx 找文件 → 找不到 → 404；
- 而**开发期**你从没遇到它，是因为 Vite dev server / `vite preview` 内置了 SPA fallback（实测：`/users/3` 返回 `200 text/html`）。

**正解：一行 `try_files`**
```nginx
location / {
  try_files $uri $uri/ /index.html;   # 找不到真实文件就交给 index.html，由 React Router 解释地址
}
```
> 本质矛盾：SPA 的路由是**客户端路由**，服务端并不认识它们 —— 服务端只能把"解释权"交还前端。

**`import.meta.env` 为什么不能当运行期配置**：
```ts
const baseURL = import.meta.env.VITE_API_BASE;   // vite build 时被替换成字面量
```
Vite 在**构建期**做的是**文本替换**，产物里已经是死值。所以：
- 同一个 `dist/` **无法**通过改环境变量指向另一个后端；
- 想"一套产物多环境部署"，正确做法是**同源 + 反向代理**（前端 `baseURL` 恒为 `'/api'`，由 Nginx 决定 `/api` 后面是什么）。

**顺带三个部署要点**：
| 要点 | 原因 |
| :--- | :--- |
| `index.html` 设 `no-cache`，`/assets/` 长缓存 `immutable` | 入口文件引用 hash 文件名；入口被缓存 = 用户永远看不到新版本 |
| `/api` 反代时显式转发 `Authorization` / `X-Forwarded-*` | 丢 `Authorization` → "登录了却全 401"；丢 `X-Forwarded-*` → 后端拿不到真实客户端信息 |
| 生产同源反代 vs 开发 Vite proxy | 同一个策略的两种实现；**生产用反代可以彻底不配 CORS** |

**Java 类比**：`dist/` ⇄ `mvn package` 的 `jar`；Nginx `proxy_pass` ⇄ Spring Cloud Gateway 路由；而"前端没有运行期配置"这一点与 Spring 的 `application-{profile}.yml` 截然不同 —— **前端环境变量被"烧"进产物，后端是启动时读取**。

---

## Q7: `useParams<{ id: string }>()` 拿到的 `id` 为什么不能直接用？为什么非法 id 必须**在客户端**拦？

**1）类型层面**：泛型只是"正常情况下长什么样"的描述，实际类型是 **Partial** 的 —— 因为这个组件可能被挂在没有 `:id` 的路由上。所以 `id` 的静态类型是 `string | undefined`，**必须先收窄**（否则 `Number(undefined)` → `NaN` → 请求 `/users/NaN`）。

**2）运行时层面（实测三种情况）**：

| 请求 | 后端真实响应 | 若不在客户端拦，用户会看到 |
| :--- | :--- | :--- |
| `/api/users/3` | `200` + 用户 JSON | 正常详情 |
| `/api/users/9999` | `404` `{"detail":"用户 ID=9999 未找到"}`（**字符串**）| `❌ 用户 ID=9999 未找到` ✅ 友好 |
| `/api/users/abc` | `422` `{"detail":[{...int_parsing...}]}`（**数组！**）| **`请求失败 (HTTP 422)`** ❌ 毫无意义 |

第三行就是硬理由：拦截器里写的是 `typeof detail === 'string' ? detail : \`请求失败 (HTTP ${status})\``，而 FastAPI 的**参数校验错误 `detail` 是数组**（结构是机器可读的，不是给人看的）→ 只能兜底成 HTTP 码。

**所以**：把"参数是否合法"的判断放在**发请求之前**，用纯计算完成（派生值，不进 state）：
```tsx
const rawId = id ?? '';
const parsedId = Number(rawId);
const isValidId = rawId !== '' && Number.isInteger(parsedId) && parsedId > 0;
```
> 附带收获：ESLint 的 `react-hooks/set-state-in-effect` 曾把我在 effect 里写的 `setLoading(false)` 判为 error —— 因为"参数非法"是**派生结果**，不该用 state 表达。改成 `if (!isValidId) return;` 后逻辑反而更干净。

---

## Q8: 弹窗要"同一个组件里切换到另一个用户"，为什么用父组件 `key` 重建，而不是依赖变化时同步 state？

**反面写法（会被 lint 判 error）**：
```tsx
useEffect(() => { setForm(toFormState(editingUser)); }, [editingUser]);
// error: react-hooks/set-state-in-effect —— setState synchronously within an effect can trigger cascading renders
```
两个问题：
1. **多一次渲染**：先以"上一个人的数据"渲染一帧，effect 跑完才变成新数据 → 用户可能看到闪一下；
2. **它属于"用 Effect 调整 state"这一反模式**（react.dev: *You Might Not Need an Effect*）。

**正解：让组件"重新出生"**
```tsx
// 父组件
<UserFormModal key={editingUser === null ? 'create' : `edit-${editingUser.id}`} ... />
// 子组件
const [form, setForm] = useState<UserFormState>(() => toFormState(editingUser));
```
`key` 变化 → React **卸载旧实例、挂载新实例** → `useState` 的初始化函数重新执行 → 表单天然是当前目标的数据。**零同步逻辑、零额外渲染、零 effect。**

**为什么 `key` 能做到**：`useState` 的初始值只在**首次渲染**被采用（Q-SR-04 的"常量快照"）；`key` 的作用正是让 React 认为"这是另一个组件"，从而触发一次真正的首次渲染。

**同一机制在别处的应用**：`users.map(...)` 里 `key={item.id}`（用稳定业务主键，禁止 index）—— 也是靠 `key` 告诉 React"这是同一条数据还是新数据"，从而决定复用还是重建 DOM 节点。

**Java 类比**：不修改既有实例的字段，而是**新建一个对象**（`withName(...)` / 记录类型）。"让组件重新出生"比"让组件改变自己"更便宜、更难出错 —— 这与 React"不可变数据 + 重新渲染"的整体哲学完全同构。

---

## 📊 自测评分建议

| 题号 | 考点 | 跨任务关联 | 自评 |
| :--- | :--- | :--- | :---: |
| Q1 | 防抖 vs 竞态是两件事 | TASK-007 / TASK-009 | [ ] |
| Q2 | 末页回退的双条件与契约边界 | TASK-007 / TASK-009 | [ ] |
| Q3 | 401 vs 403 + 事件广播 + 清理函数 | TASK-008 / TASK-009 | [ ] |
| Q4 | deps 完整性 + `useCallback` 的意义 | TASK-007 / TASK-009 / Q-HK-10 | [ ] |
| Q5 | 跨语言字段命名静默丢数据 | TASK-009 / Q-AR-13 | [ ] |
| Q6 | SPA fallback + 构建期变量 | TASK-006 / TASK-009 / deploy.md | [ ] |
| Q7 | 动态路由类型收窄 + 客户端预校验 | TASK-006 / TASK-009 | [ ] |
| Q8 | `key` 重建 vs effect 同步 state | TASK-003 / TASK-009 / Q-SR-04 | [ ] |

> 若能**不看答案**口头答出 6 题以上 → 这个项目可以作为简历项目；不足 6 题 → 建议回头重做 DoD ⑨/⑩（全局 401、`AbortController`），那两项是在"设计"层面把这套认知再走一遍。

import axios from 'axios';

/**
 * TASK-007: 统一 HTTP 客户端（基础设施层）
 *
 * 分层定位（对照 Java 后端三层架构）：
 *   httpClient.ts  ⇄ HttpClient / RestTemplate / WebClient 的全局配置类
 *                     （统一 baseURL、超时、鉴权头、异常归一化 = 横切关注点）
 *   userApi.ts     ⇄ Repository / Feign Client（声明"有哪些远程接口可调"）
 *   usePagedUsers  ⇄ Service（业务编排：页码、搜索、状态机）
 *   UserPagedList  ⇄ Controller + View（接收交互、渲染界面）
 */

/**
 * 全局唯一 axios 实例。
 *
 * 为什么不能到处直接 `import axios from 'axios'` 裸用？
 *   1. baseURL / 超时 / 鉴权头 等配置需要统一，避免每个请求重复写；
 *   2. 拦截器（Interceptor）只能挂在「实例」上，裸用全局 axios 会污染所有库的请求。
 *
 * baseURL 设为 '/api'：配合 vite.config.ts 里的 dev proxy 转发到 127.0.0.1:8000，
 * 开发期浏览器视角是「同源请求」，因此彻底不触发 CORS 预检。
 */
export const httpClient = axios.create({
  baseURL: '/api',
  timeout: 8000, // 毫秒；超时后 axios 会抛出 code === 'ECONNABORTED' 的错误
});

// ---------------------------------------------------------------------------
// TODO ①【请求拦截器】—— 请求出发前的统一改装车间
// 对应 Java: HandlerInterceptor#preHandle / Filter#doFilter
// ---------------------------------------------------------------------------
httpClient.interceptors.request.use(
  (config) => {
    // TODO(你来实现):
    //   1. 从 localStorage 读取 token（键名自定，如 'token'）
    //   2. 若存在，则注入到请求头：Authorization: `Bearer ${token}`
    //      （这是 TASK-008 登录鉴权的前置铺垫，本任务即使没有 token 也要把插槽留好）
    //   3. 可选：打印一行 `[HTTP →] ${config.method} ${config.url}` 便于观察请求链路
    //
    // ⚠️ 必须 return config！漏掉 return 会让整个请求卡死或抛出异常
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// TODO ②【响应拦截器】—— 响应回来后的统一处理器
// 对应 Java: HandlerInterceptor#postHandle + @RestControllerAdvice 全局异常处理
// ---------------------------------------------------------------------------
httpClient.interceptors.response.use(
  (response) => {
    // TODO(你来实现):
    //   这里负责「成功响应（HTTP 2xx）」的统一处理。
    //
    // ⚠️ 设计决策（务必读懂，不要盲目模仿网上教程）：
    //   网上教程常写 `return response.data` 来"顺便拆包"，
    //   但 axios 的 TS 返回类型仍是 AxiosResponse<T>，类型与实际运行时不一致，
    //   会导致后续 `res.data` 取到 undefined —— 这就是"类型撒谎"。
    //   本任务约定：拦截器只做统一处理（如日志），**拆 .data 的职责放在 userApi.ts 里**，
    //   保证「类型签名」与「运行时值」永远一致。
    return response;
  },
  (error) => {
    // TODO(你来实现): 把 axios 的原始异常"归一化"为人类可读的中文 Error。
    //   需要覆盖的几种情况（可用提示）：
    //     - error.response?.status === 500 / 404 → 读取后端 detail 详情
    //       （注意：axios 已自动 JSON 解析，直接取 error.response.data.detail 即可，
    //         不像 fetch 那样需要 await res.text()）
    //     - error.code === 'ECONNABORTED' → 请求超时
    //     - error.request 存在但没有 error.response → 后端进程没启动 / 网络不可达
    //   最后必须 return Promise.reject(new Error('友好中文提示'))
    //   （保持错误链条不断裂，让 Hook 的 catch 能读到 message）
    return Promise.reject(error);
  }
);

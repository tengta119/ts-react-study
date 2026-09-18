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

/**
 * 认证 token 在 localStorage 中的键名（契约单一来源）。
 * TASK-008 登录成功后写入、拦截器读取，两处必须共用这个常量，避免拼写不一致导致“登录了仍 401”。
 */
export const TOKEN_KEY = 'token';

// ---------------------------------------------------------------------------
// 【请求拦截器】—— 请求出发前的统一改装车间
// 对应 Java: HandlerInterceptor#preHandle / Filter#doFilter
// 职责：统一注入 Authorization 头（TASK-008 鉴权插槽）+ 开发期请求日志
// ---------------------------------------------------------------------------
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      // 用 AxiosHeaders 的官方 API 设置头（不要臆想 config.headers.setToken() 之类的方法）
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    if (import.meta.env.DEV) {
      console.log(`[HTTP →] ${config.method} ${config.url}`);
    }
    return config; // 漏掉 return 会让请求卡死
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// 【响应拦截器】—— 响应回来后的统一处理器
// 对应 Java: HandlerInterceptor#postHandle + @RestControllerAdvice 全局异常处理
// 成功分支：只做开发期日志，绝不在这里拆 response.data（拆包职责在 userApi.ts）
// 失败分支：把 axios 原始异常归一化为统一的中文 Error（四个分支）
// ---------------------------------------------------------------------------
httpClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(
        '[HTTP ←]',
        response.status,
        response.config.method,
        response.config.url,
        response.data
      );
    }
    return response; // ⚠️ 必须返回完整 response
  },
  (error) => {
    // ── 分支 0：主动取消（竞态清理 / 组件卸载）───────────────────────────────
    // 这类"错误"是我们自己制造的预期内噪声，不能当失败弹给用户；
    // ⚠️ 必须放在最前面判断：取消的请求同样"没有 response"，
    //    否则会被下面的分支 3 误判成「网络不可达」。
    if (error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    // ── 分支 1：有响应 → 请求到达了后端，但 HTTP 状态码是失败（4xx/5xx）──────
    // 不做状态码白名单！400/401/403/405/422/500/502/503 全部走这一条。
    if (error.response) {
      const status: number = error.response.status;
      const detail = error.response.data?.detail; // 后端可能是 JSON，也可能是代理的纯文本/HTML

      // 后端给了非空字符串就用它，否则兜底成带状态码的通用文案
      const message =
        typeof detail === 'string' && detail.trim() !== ''
          ? detail
          : `请求失败 (HTTP ${status})`;

      console.error('[HTTP ✗ 业务]', status, error.config?.method, error.config?.url, message);

      // TODO(TASK-008)：status === 401 时在此统一"清理 token → 跳转登录页"
      return Promise.reject(new Error(message));
    }

    // ── 分支 2：无响应 + 超时 ───────────────────────────────────────────────
    // axios 源码里超时有两个错误码：默认 ECONNABORTED，
    // 开启 transitional.clarifyTimeoutError 后是 ETIMEDOUT，两个都判最稳。
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      console.error('[HTTP ✗ 超时]', error.config?.url);
      return Promise.reject(
        new Error(`请求超时（${httpClient.defaults.timeout}ms），请检查后端是否阻塞或网络是否稳定`)
      );
    }

    // ── 分支 3：无响应 + 其他 → 请求根本没到达后端 ───────────────────────────
    console.error('[HTTP ✗ 网络]', error.message);
    return Promise.reject(
      new Error('无法连接后端服务，请确认后端已在 http://127.0.0.1:8000 启动')
    );
  }
);

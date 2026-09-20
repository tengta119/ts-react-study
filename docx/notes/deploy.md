# 生产构建与部署（Vite SPA + Nginx 静态托管 + `/api` 反向代理）

> 归属任务：**TASK-009 · DoD ⑪**（生产构建与部署）
> 定位：从"`npm run dev` 能跑"走到"**别人打开网页就能用**"的最后一公里。
> 本文所有结论都基于本仓库**实测**（`npm run build` / `npm run preview` / `curl` 探测），非推测。

---

## 1. 构建：`npm run build` 到底做了什么

```bash
npm run build        # = tsc -b && vite build
```

| 步骤 | 作用 | 为什么不能省 |
| :--- | :--- | :--- |
| `tsc -b` | 全量类型检查（含 TypeScript 项目引用） | **Vite 不做类型检查**（它只做转译，用 esbuild/rolldown 剥类型）。没有这一步，类型错误会直接进生产包 |
| `vite build` | 转译 + 摇树（Tree Shaking）+ 压缩 + 产出 `dist/` | 开发服务器跑的是源码，只有这一步产出可托管的静态文件 |

**本仓库实测产物**：

```
dist/index.html                    0.46 kB │ gzip:  0.29 kB
dist/assets/index-DGNrK5qb.css     1.78 kB │ gzip:  0.81 kB
dist/assets/index-D9n9UKvZ.js    370.92 kB │ gzip: 118.60 kB     ← 113 modules transformed
dist/favicon.svg / dist/icons.svg
```

两个值得注意的点：

1. **文件名里的 hash（`index-D9n9UKvZ.js`）**：内容变了文件名才变 → 可以给 `assets/**` 配置**一年期强缓存**，而 `index.html` **绝不能缓存**。这就是"缓存策略"这套玩法的全部依据。
2. **`index.html` 是唯一的入口**，它引用那两个 hash 文件。SPA 的所有路由（`/users/3` 等）在服务端**都是不存在实体的路径** —— 这是后面 `try_files` 存在的原因。

---

## 2. 验收：`npm run preview`（只用于自测，不是生产）

```bash
npm run preview      # 默认 http://localhost:4173
```

**实测结果**：

| 请求路径 | HTTP | Content-Type | 说明 |
| :--- | :---: | :--- | :--- |
| `/` | 200 | `text/html` | 正常 |
| `/dashboard` | 200 | `text/html` | ✅ SPA fallback 生效 |
| `/users` | 200 | `text/html` | ✅ |
| `/users/3` | 200 | `text/html` | ✅ **深层路由直接打开也能用** |
| `/no-such-page` | 200 | `text/html` | ✅ 交给前端路由渲染 404 页 |
| `/assets/index-D9n9UKvZ.js` | 200 | `text/javascript` | 静态资源正常 |

> 🔎 **Windows 小坑**：Vite 默认只监听 `::1`，所以 `http://127.0.0.1:4173` 会连不上（`HTTP 000`），要用 `http://localhost:4173`（解析到 `::1`）。
> 想让局域网访问，加 `--host`（例如 `npm run preview -- --host`）。

> ⚠️ `vite preview` 是**本地验收工具**，不是生产服务器：它没有 gzip/brotli 配置、没有缓存头策略、没有并发能力调优。生产请交给 Nginx。

---

## 3. Nginx 部署样例（静态托管 + `/api` 反向代理）

### 3.1 完整配置

```nginx
# /etc/nginx/conf.d/vite-admin.conf
server {
    listen       80;
    server_name  admin.example.com;

    # ── 前端静态资源根目录：把 dist/ 的内容放到这里 ────────────────────
    root  /var/www/vite-admin/dist;
    index index.html;

    # ── ① SPA 路由兜底（本配置最关键的一行）──────────────────────────
    # 含义：先试 $uri（真实文件），再试 $uri/（目录），都找不到就交给 /index.html，
    #       由前端 React Router 根据地址栏自行渲染对应页面。
    # 若没有这一行：直接打开 /users/3 或刷新页面 → Nginx 返回 404
    #   （因为磁盘上根本没有 /var/www/vite-admin/dist/users/3 这个文件）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ── ② index.html 绝不缓存 ────────────────────────────────────────
    # 它引用的两个 hash 文件名会随每次发布变化，所以"入口文件"必须实时拿最新版，
    # 否则用户会一直加载旧的 index.html + 旧的 hash 文件（发布后"看不到新功能"的元凶）
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # ── ③ 带 hash 的静态资源强缓存一年 ──────────────────────────────
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # ── ④ gzip 压缩（JS 体积可再压 ~70%：370KB → ~118KB）────────────
    gzip            on;
    gzip_min_length 1k;
    gzip_comp_level 6;
    gzip_types      text/plain text/css application/javascript application/json image/svg+xml;
    gzip_vary       on;

    # ── ⑤ /api 反向代理到后端（FastAPI / Spring Boot）──────────────────
    # 等价于开发期 vite.config.ts 里的 server.proxy —— 同一策略的两种实现：
    #   开发期：Vite dev server 代理（浏览器视角永远同源 → 不触发 CORS）
    #   生产期：Nginx 反向代理（同上）
    location /api/ {
        proxy_pass         http://127.0.0.1:8000;
        proxy_http_version 1.1;

        # ⚠️ 这三个头是"后端拿不到真实客户端信息"的经典坑，必须显式转发
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # ⚠️ Authorization 头默认会转发，但如果你在别处改过 proxy_pass_request_headers
        #    （或用了某些重写规则），JWT 会静默丢失 → 表现为"明明登录了却 401"
        proxy_set_header Authorization $http_authorization;

        proxy_connect_timeout 5s;
        proxy_read_timeout    30s;
    }
}
```

### 3.2 部署流程（拷贝即可用）

```bash
# ① 本地构建
npm run build

# ② 上传产物（dist/ 里的**内容**，不含 dist 这一层）
scp -r dist/* user@server:/var/www/vite-admin/dist/

# ③ 校验并重载 Nginx（-t 一定要先跑：配置写错会导致整个站点 502）
sudo nginx -t && sudo nginx -s reload
```

---

## 4. 为什么必须做反向代理，而不是让前端直连 `http://ip:8000`

| 做法 | 后果 |
| :--- | :--- |
| ❌ 前端写死 `http://1.2.3.4:8000/api` | ① 触发 **CORS 预检**（多一次 OPTIONS 往返，后端还得维护允许来源白名单）；② 后端端口暴露公网；③ **混合内容**风险（HTTPS 页面调 HTTP 接口会被浏览器直接拦）；④ 换域名/端口要重新构建前端 |
| ✅ 同源 + Nginx 反代 `/api` | ① **零 CORS**（浏览器视角同源）；② 后端只对内网开放；③ 前端 `baseURL` 恒为 `'/api'`，**换环境不用改代码**；④ HTTPS 只需在 Nginx 一层配置 |

这正是本仓库 `httpClient.ts` 里 `baseURL: '/api'` 的设计意图：**前端永远只认相对路径**，至于 `/api` 后面是什么，由部署层决定。

---

## 5. 生产部署 Checklist

- [ ] **构建前必过 `tsc -b`**（`npm run build` 已包含；不要用 `vite build` 跳过类型检查）
- [ ] `try_files $uri $uri/ /index.html;` 已配置（**刷新 404 的唯一解**）
- [ ] `index.html` 设置了 `no-cache`；`/assets/` 设置了长缓存 + `immutable`
- [ ] gzip/brotli 已开启（本例 JS 从 370KB → 118KB）
- [ ] `/api/` 反代已配置，且 `Authorization` / `X-Forwarded-*` 头正确转发
- [ ] HTTPS 已启用（`localStorage` 里的 JWT 在明文 HTTP 下可被中间人窃取）
- [ ] 后端已确认在目标地址监听（否则前端一切正常、所有请求 **502/连接被拒**）
- [ ] **XSS 意识**：token 存在 `localStorage` → 任何 XSS 都能直接读走；敏感系统应改用 `HttpOnly` Cookie + CSRF 防护
- [ ] 发布后自测三件事：**首页**、**深层路由直接打开/刷新**（`/users/3`）、**登录 → 列表 → 增删改**全链路

---

## 6. 常见故障对照表

| 现象 | 根因 | 处置 |
| :--- | :--- | :--- |
| 首页正常，**刷新 `/users/3` 变 404** | Nginx 找不到该物理路径 | 加 `try_files ... /index.html` |
| 发布后用户仍看到旧界面 | `index.html` 被缓存 | `location = /index.html` 设 `no-cache`（必要时给 URL 加版本号） |
| 所有请求 404，路径里出现 `/api/api/...` | 前端 baseURL 与反代规则重复叠加 | 二选一：反代 `location /api/` 且 `proxy_pass` **不带** `/api`；或前端 baseURL 去掉 `/api` |
| 所有请求 **502 Bad Gateway** | 后端没起 / 端口不对 / 被防火墙拦 | 先 `curl http://127.0.0.1:8000/docs` 在服务器本机验证 |
| 登录成功但后续接口全 **401** | 反代丢弃了 `Authorization` 头 | 显式 `proxy_set_header Authorization $http_authorization;` |
| 页面白屏，控制台一堆 404 | 站点部署在子路径（如 `/admin/`）但 `base` 仍是 `/` | `vite.config.ts` 设 `base: '/admin/'` 后重新构建 |
| 后端收到的时间/协议不对 | 未转发 `X-Forwarded-*` | 补上第 3.1 节 ⑤ 里的四个 `proxy_set_header` |

---

## 7. Java / 后端对照视角

| 前端部署概念 | Java / 后端等价物 |
| :--- | :--- |
| `vite build` 产出的 `dist/` | `mvn package` 产出的可执行 `jar` / `war` |
| `npm run preview`（本地验收）| 本地 `java -jar app.jar` 跑一遍冒烟 |
| Nginx 静态托管 `dist/` | Spring Boot 的 `src/main/resources/static/`（同样由容器提供静态文件）|
| `location /api/ { proxy_pass ... }` | Spring Cloud Gateway 的 `RouteLocator` / Zuul 路由转发 |
| **开发期** Vite dev proxy | 本地 `@CrossOrigin` 放行 |
| **生产期** Nginx 同源反代 | 网关统一入口 + 内网服务不对外暴露（**更安全的那条路**）|
| `try_files ... /index.html` | 后端没有直接等价物：这是 SPA "前端路由 vs 服务端路由" 的独有矛盾 —— 服务端不认识 `/users/3`，只能把解释权交还前端 |
| 环境变量 `import.meta.env.VITE_*` | `application-{profile}.yml` + `@Value`（区别：**前端的变量在构建期被"烧"进产物**，不是运行期读取）|

> ⚠️ 最后一行是最容易踩的：**前端没有"运行期配置"**。`import.meta.env.VITE_API_BASE` 在 `vite build` 时就被替换成了字面量。
> 所以同一个 `dist/` 无法通过改环境变量切换到另一个后端地址 —— "一套产物多环境部署"要靠**同源反代**（本文推荐的做法）来实现。

---

## 8. 本仓库实测记录（可复现）

```powershell
# 构建
npm run build
# → ✓ 113 modules transformed ／ dist/assets/index-*.js 370.92 kB │ gzip: 118.60 kB ／ exit 0

# 本地验收
npm run preview            # → http://localhost:4173
curl http://localhost:4173/users/3        # → 200 text/html  （SPA fallback 生效）
curl http://localhost:4173/assets/xxx.js  # → 200 text/javascript
curl http://127.0.0.1:4173/               # → 000（Vite 只监听 ::1 的 Windows 现象）
```

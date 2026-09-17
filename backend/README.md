# TASK-004 专属辅助后端服务 (FastAPI)

这是一个专为 **React 前端开发者（尤其是熟悉 Java Spring Boot 的学员）** 定制的极简本地模拟后端服务。

---

## 🌟 核心特性

1. **零配置开箱即用**：基于 Python FastAPI，纯内存数据库，无需配置 MySQL/Redis；
2. **完美对齐前端 DTO 契约**：接口输出的 JSON 结构与 `src/exercises/TASK-004-api/UserListApi.tsx` 的 `ApiUser` 契约 100% 吻合；
3. **内置 CORS 跨域放行**：完美支持 Vite 的 `http://localhost:5173` 前端调用，告别跨域红字；
4. **内置网络延迟模拟（`?delay=0.5`）**：默认模拟 0.4 秒网络延迟，让你在前端肉眼可见优雅的 Loading 骨架/转圈动画；
5. **内置故障模拟开关（`?fail=true`）**：一行参数即可模拟后端 500 异常，专供测试前端的 Error 红色报警卡片与“重试”按钮！
6. **自动生成 Swagger 交互文档**：访问 `http://127.0.0.1:8000/docs` 即可在线调试接口。

---

## 🛠️ 快速启动指南

### 方式一：PowerShell 终端启动（推荐）
在项目根目录或 `backend` 目录下执行：
```powershell
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 方式二：双击运行
Windows 环境下直接双击运行 `backend/start.bat` 即可启动！

启动成功后：
- 接口地址：`http://127.0.0.1:8000/api/users`
- Swagger 文档：`http://127.0.0.1:8000/docs`

---

## 📡 接口与调试参数一览

| 接口 | 方法 | 功能描述 | 调试技巧 (针对前端学习) |
| :--- | :---: | :--- | :--- |
| `/api/users` | `GET` | 获取用户列表 | 普通请求：`fetch("http://127.0.0.1:8000/api/users")` |
| `/api/users?delay=1.5` | `GET` | 模拟慢网络 | 将延迟设为 1.5 秒，观察前端 Loading 状态与按钮禁用效果 |
| `/api/users?fail=true` | `GET` | 模拟后端 500 异常 | 专门用于检验前端 `catch` 异常分支、错误 UI 提示与重试机制 |
| `/api/users?keyword=架构` | `GET` | 后端模糊搜索 | 可用于测试“服务端搜索” vs “前端纯函数过滤”的体验差异 |
| `/api/users/{id}` | `GET` | 获取单个用户详情 | 查询指定 ID 用户 |
| `/api/users` | `POST` | 新增用户 | 结合受控表单实现新增 |
| `/api/users/{id}` | `DELETE` | 删除用户 | 结合前端列表实现删除 |
| `/api/reset` | `POST` | 重置数据库 | 随时恢复到初始 5 条数据 |

---

## 🧠 FastAPI 与 Java Spring Boot 核心心智映射

| 概念 | FastAPI (Python) | Spring Boot (Java) |
| :--- | :--- | :--- |
| **应用容器 / 入口** | `app = FastAPI()` + `uvicorn` | `@SpringBootApplication` + 内嵌 Tomcat |
| **DTO 契约类** | `class UserDTO(BaseModel)` | `public record UserDTO(...)` 或 `@Data class UserDTO` |
| **GET 路由映射** | `@app.get("/api/users")` | `@GetMapping("/api/users")` |
| **POST 请求体** | `async def create(cmd: CreateUserCommand)` | `public UserDTO create(@RequestBody CreateUserCommand cmd)` |
| **路径参数** | `@app.get("/api/users/{user_id}")` | `@GetMapping("/api/users/{id}")` + `@PathVariable Long id` |
| **跨域支持** | `CORSMiddleware` | `@CrossOrigin` 或 `WebMvcConfigurer.addCorsMappings` |
| **交互式 API 文档** | 自动内置 Swagger UI (`/docs`) | SpringDoc / Knife4j / Swagger 依赖 |

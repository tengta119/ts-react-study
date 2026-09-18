import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ------------------------------------------------------------------------
  // 开发环境反向代理 (TASK-007 基础设施)
  // 作用：把浏览器发出的 /api/** 请求转发到本地后端，浏览器视角始终是「同源」，
  //       从而在开发期彻底绕过跨域 (CORS) 限制。
  // Java 类比：等价于在 Nginx 里配 proxy_pass，或 Spring Cloud Gateway 的路由转发。
  // 注意：生产环境不用 Vite，这份配置的等价物是 Nginx 的 location /api { proxy_pass ... }
  // ------------------------------------------------------------------------
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // 本地 FastAPI (模拟 Spring Boot) 服务地址
        changeOrigin: true,
        // 不需要 rewrite：后端接口本身就是 /api/xxx 前缀
      },
    },
  },
})

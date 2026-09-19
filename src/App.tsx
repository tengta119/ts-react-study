import React, { useState } from 'react';
import { Counter } from './exercises/TASK-001-counter/Counter';
import { TodoList } from './exercises/TASK-002-todo/TodoList';
import { UserForm } from './exercises/TASK-003-form/UserForm';
import { UserListApi } from './exercises/TASK-004-api/UserListApi';
import { UserManager } from './exercises/TASK-005-refactor-hook/UserManager';
import { RouterApp } from './exercises/TASK-006-router/RouterApp';
import { UserPagedList } from './exercises/TASK-007-http-layer/UserPagedList';
import { AuthApp } from './exercises/TASK-008-auth-guard/AuthApp';

type TaskId =
  | 'overview'
  | 'counter'
  | 'todo'
  | 'form'
  | 'api'
  | 'manager'
  | 'router'
  | 'paged'
  | 'auth';

interface TaskMeta {
  id: TaskId;
  name: string;
  badge: string;
  component?: React.ReactNode;
  description: string;
  filePath: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState<TaskId>('auth');

  const tasks: TaskMeta[] = [
    {
      id: 'counter',
      name: 'TASK-001 计数器',
      badge: 'useState & 事件',
      component: <Counter />,
      description: '掌握 useState 基础、步长调整、动态数字颜色与重置逻辑。',
      filePath: 'src/exercises/TASK-001-counter/Counter.tsx',
    },
    {
      id: 'todo',
      name: 'TASK-002 Todo 清单',
      badge: '不可变更新 & 列表 Key',
      component: <TodoList />,
      description: '深入理解数组状态不可变操作（map/filter）、key 唯一性及派生状态。',
      filePath: 'src/exercises/TASK-002-todo/TodoList.tsx',
    },
    {
      id: 'form',
      name: 'TASK-003 用户表单',
      badge: '受控组件 & 校验',
      component: <UserForm />,
      description: '多字段统一受控管理、e.preventDefault() 机制与表单校验。',
      filePath: 'src/exercises/TASK-003-form/UserForm.tsx',
    },
    {
      id: 'api',
      name: 'TASK-004 API 联调',
      badge: 'useEffect & 三态处理',
      component: <UserListApi />,
      description: '在 useEffect 中异步请求后端 API，管理 Loading、Error、Data 三种状态。',
      filePath: 'src/exercises/TASK-004-api/UserListApi.tsx',
    },
    {
      id: 'manager',
      name: 'TASK-005 组件解耦',
      badge: 'Props通信 & 自定义Hook',
      component: <UserManager />,
      description: '拆分 Smart 容器与 Dumb 展示组件，将异步数据逻辑封装为自定义 Hook。',
      filePath: 'src/exercises/TASK-005-refactor-hook/UserManager.tsx',
    },
    {
      id: 'router',
      name: 'TASK-006 前端单页路由',
      badge: 'React Router & 动态传参',
      component: <RouterApp />,
      description: '掌握 SPA 单页路由原理、Routes/Route 规则分发、useParams 动态参数与 NavLink 状态高亮。',
      filePath: 'src/exercises/TASK-006-router/RouterApp.tsx',
    },
    {
      id: 'paged',
      name: 'TASK-007 分页请求层',
      badge: 'Axios 拦截器 & 分页',
      component: <UserPagedList />,
      description: '封装统一 axios 客户端与拦截器，对齐 PageResult<T> 分页契约，处理搜索联动与请求竞态。',
      filePath: 'src/exercises/TASK-007-http-layer/',
    },
    {
      id: 'auth',
      name: 'TASK-008 登录鉴权',
      badge: 'Context & 路由守卫',
      component: <AuthApp />,
      description: 'JWT 登录态持久化、AuthContext 全局共享、ProtectedRoute 守卫与 401 全局处理。',
      filePath: 'src/exercises/TASK-008-auth-guard/',
    },
    {
      id: 'overview',
      name: '📖 学习系统指引',
      badge: '系统全貌',
      description: '查看教练系统工作规则、常用指令与学习路线。',
      filePath: 'AGENTS.md & docx/learning.md',
    },
  ];

  const currentTask = tasks.find((t) => t.id === activeTab) || tasks[0];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif' }}>
      {/* 顶部导航栏 */}
      <header
        style={{
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
            🚀 TS + React 学习工作台 (Java 后端专属)
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
            先理解 → 自己写 → 教练 Review → 纠错修改 → 总结归纳
          </p>
        </div>

        <div style={{ fontSize: '12px', background: '#1e293b', padding: '6px 12px', borderRadius: '6px', border: '1px solid #334155' }}>
          💡 教练提示：随时使用 <code style={{ color: '#38bdf8' }}>/review</code>、<code style={{ color: '#38bdf8' }}>/quiz</code> 与 AI 教练互动
        </div>
      </header>

      {/* 任务选项卡 Tab */}
      <nav
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          overflowX: 'auto',
        }}
      >
        {tasks.map((task) => {
          const isActive = task.id === activeTab;
          return (
            <button
              key={task.id}
              onClick={() => setActiveTab(task.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 500,
                fontSize: '14px',
                backgroundColor: isActive ? '#2563eb' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{task.name}</span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: isActive ? '#1d4ed8' : '#e2e8f0',
                  color: isActive ? '#e0e7ff' : '#64748b',
                }}
              >
                {task.badge}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 主体内容区 */}
      <main style={{ maxWidth: '1000px', margin: '24px auto', padding: '0 16px' }}>
        {activeTab === 'overview' ? (
          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              lineHeight: 1.6,
            }}
          >
            <h2 style={{ marginTop: 0 }}>📚 学习系统使用指引</h2>
            <p>
              你现在的角色是 <strong>TypeScript + React 独立开发者实训学员</strong>，AI 是你的
              <strong>专属学习教练</strong>。
            </p>

            <h3>1. 核心学习循环</h3>
            <ol>
              <li>打开 <code>docx/tasks/</code> 目录下的任务卡片，阅读业务需求、API 提示与「编码前必读的坑」；</li>
              <li>直接打开 <code>{currentTask.filePath}</code> 自主编写代码，随时向教练提问（无需先答辩思路）；</li>
              <li>在浏览器中实时观察效果；</li>
              <li>在对话中输入 <code>/review</code> 请求教练做深度审查；</li>
              <li>根据指出的问题自主修改，并在 <code>docx/mistakes.md</code> 中记录踩坑原因。</li>
            </ol>

            <h3>2. 随时可用快捷指令 (Slash Commands)</h3>
            <ul>
              <li><code>/review</code>：对当前正在写的代码做全方位 Code Review（不给答案，只挑漏洞和引导提问）；</li>
              <li><code>/quiz</code>：口试模式，从问答库随机出题检验 React/TS 底层原理；</li>
              <li><code>/qa</code>：将刚探讨的问答一键沉淀到 <code>docx/questions/</code> 对应分类；</li>
              <li><code>/task 001</code>：开启指定任务，获取概念精讲与任务卡；</li>
              <li><code>/explain [概念]</code>：按“底层机制 + Java 类比”五步法深度讲解概念；</li>
              <li><code>/mistake</code>：将刚才犯的典型错误复盘记录到 <code>docx/mistakes.md</code>。</li>
            </ul>

            <h3>3. 当前专属文档中心 (docx/)</h3>
            <ul>
              <li><code>docx/learning.md</code>：你的学习看板与里程碑路线</li>
              <li><code>docx/questions/</code>：Q&A 专属问答知识库（分门别类沉淀问答）</li>
              <li><code>docx/mistakes.md</code>：避坑实录与错题本</li>
              <li><code>docx/notes/</code>：专为 Java 开发者编写的心智模型与概念对比</li>
              <li><code>docx/tasks/</code>：各阶段任务实践指南卡片</li>
            </ul>
          </section>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 任务信息卡片 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '16px 20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{currentTask.name}</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  {currentTask.description}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>编辑文件：</span>
                <code
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    backgroundColor: '#f1f5f9',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: '#2563eb',
                  }}
                >
                  {currentTask.filePath}
                </code>
              </div>
            </div>

            {/* 组件实战渲染区 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                minHeight: '360px',
              }}
            >
              {currentTask.component}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

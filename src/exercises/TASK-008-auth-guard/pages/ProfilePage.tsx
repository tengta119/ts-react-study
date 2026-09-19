import type React from 'react';
import { useAuth } from '../AuthContext';

/**
 * TASK-008: 个人中心页（受保护页面）
 *
 * ================== TODO ⑤【你来实现】==================
 * 1) 展示当前登录用户：const { user, logout } = useAuth();
 *      - user 为 null 时不渲染崩溃（这里虽然被守卫保护，但组件自身仍要防空 —— 防御式编程）
 *      - 展示 username / name / role 三个字段
 *
 * 2) 登出按钮：
 *      - onClick={() => { logout(); navigate('/login'); }}
 *      - 也可以用 <Navigate> 方案，但"事件里做跳转"更直观
 *      - ⚠️ 登出后要能观察到：① localStorage 里的 token 没了（DevTools → Application → Local Storage）
 *                          ② 再访问 /profile 会被守卫踢回 /login
 *
 * 3) 建议加一个「token 失效演练」按钮（专为验证 401 链路）：
 *      - 调用 fetchMeApi()（带着当前 token 请求受保护接口）
 *      - 正常应成功；然后在后端调用一次 POST /api/auth/logout（让该 token 服务端失效），
 *        再点这个按钮 → 应看到中文的「登录状态已失效，请重新登录」
 *      - 此时你会发现一个真实缺陷：**界面依然认为你已登录**
 *        （因为 token 失效是后端才知道的事，前端 user 状态没人去清）
 *        👉 这正是进阶挑战「全局 401 处理」要解决的问题
 * ======================================================
 */
export const ProfilePage: React.FC = () => {
  // 占位调用：实现时请改为 const { user, logout } = useAuth();
  const { user } = useAuth();

  return (
    <div
      style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        color: '#92400e',
        borderRadius: '8px',
        padding: '16px',
        fontSize: '13px',
        lineHeight: 1.8,
      }}
    >
      <strong>👤 TODO ⑤：个人中心待实现</strong>
      <div>· 展示 username / name / role（当前 user = {user === null ? '未登录' : user.username}）</div>
      <div>· 登出按钮（清 token + 清 user + 跳登录页）</div>
      <div>· 建议加「token 失效演练」按钮，用于验证 401 链路</div>
    </div>
  );
};

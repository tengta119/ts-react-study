import { createContext, useContext } from 'react';
import type { AuthContextValue } from './types';

/**
 * TASK-008: 全局登录态上下文（AuthContext）
 *
 * 为什么需要 Context，而不是一层层传 Props？
 *   「当前登录用户」是**跨层级、处处需要**的数据（导航栏要显示用户名、个人页要展示角色、
 *    路由守卫要判断是否登录）。若靠 Props 传递，就叫 **Prop Drilling（属性钻取）**：
 *   中间层组件被迫接收并转发自己根本不用的 props。
 *
 * Java / Spring 对照：
 *   这正是 `SecurityContextHolder` / `ThreadLocal` 想解决的问题 ——
 *   "当前请求的主体"不需要作为方法参数一路传下去，随取随用。
 *   React 的 Context 就是组件树维度的"隐式上下文"。
 *
 * ⚠️ 但两者都有一个共同代价：**隐式依赖**。用它的组件在测试时更难独立构造，
 *    所以要克制 —— 只放"真正全局"的东西（登录态、主题、语言），不要当万能垃圾桶。
 *
 * 📌 文件拆分说明：本文件只放"上下文对象 + 消费 Hook"（不含组件），
 *    而提供状态的 <AuthProvider> 组件放在 AuthProvider.tsx。
 *    这样拆是为了让 Vite 的 Fast Refresh 能正常工作
 *    （一个文件里同时导出组件和非组件时，React 热更新会退化为整页刷新）。
 */

/** 默认值给 null：组件越界使用（没被 Provider 包住）时能被检出，而不是拿到一个假的空对象 */
export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * 消费登录态的专用 Hook。
 * 这层封装的价值：把"拿到 null 说明漏了 Provider"这个约定固化下来，
 * 报错信息直指问题原因，比让调用方在别处遇到 `Cannot read property 'user' of null` 友好得多。
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth 必须在 <AuthProvider> 内部使用（检查是否漏了包裹 AuthProvider）');
  }
  return ctx;
}

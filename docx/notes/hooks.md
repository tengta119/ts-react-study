# React 核心 Hooks：useEffect 与 useRef (hooks.md)

## 1. 什么是 Hook？

Hook 是 React 16.8 引入的特殊函数，允许你在不写 Class 的情况下使用状态和其他 React 特性。
- **调用规则（Hook Rules）**：
  1. 只能在 React 函数组件的最顶层调用，**绝对不能在循环、if 条件分支、嵌套函数中调用**；
  2. 只能在 React 函数组件或自定义 Hook 中调用。

---

## 2. `useEffect`：处理副作用的心智模型

### 什么是“副作用”（Side Effects）？
React 组件的主体函数应该是一个**纯计算过程**（根据 props 和 state 纯粹算出一个 UI）。
而以下操作都是副作用：
- 发起 HTTP 请求获取后端数据
- 手动操作 DOM、设置定时器 (`setInterval`)
- 订阅 WebSocket 消息
- 记录打点日志

### 语法结构与依赖项数组 (Dependency Array)
```tsx
useEffect(() => {
  // 1. 产生副作用的代码
  console.log("执行副作用");

  // 2. 清理函数（可选），组件卸载或下一次副作用执行前运行
  return () => {
    console.log("清理上一次的资源/定时器");
  };
}, [/* 依赖项数组 */]);
```

### 三种依赖项场景对比：
1. **不传依赖项**：`useEffect(() => { ... })`
   - ⚠️ 每次组件重新渲染都会执行一次！千万别在这里面无脑 `setState`，会瞬间导致**死循环**！
2. **依赖项为空数组 `[]`**：`useEffect(() => { ... }, [])`
   - 只在组件挂载完成后（首次上屏）执行一次。常用于页面初次加载请求 API。
3. **依赖项包含具体变量 `[userId]`**：`useEffect(() => { ... }, [userId])`
   - 首次挂载执行一次；之后只要 `userId` 发生改变，就会重新执行。

---

## 3. `useRef`：不触发重渲染的“秘密口袋”

### 两个核心使用场景：
1. **获取真实 DOM 节点的引用**（比如页面加载后让输入框自动获得焦点 `inputRef.current?.focus()`）。
2. **在多次渲染之间保存一个变量，但当变量改变时，不要触发重新渲染**。

```tsx
import { useRef } from 'react';

function Timer() {
  // timerId 是一个持久对象：{ current: null }
  const timerRef = useRef<number | null>(null);

  function start() {
    timerRef.current = window.setInterval(() => {
      console.log("tick");
    }, 1000);
  }

  function stop() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }

  return (
    <div>
      <button onClick={start}>开始</button>
      <button onClick={stop}>停止</button>
    </div>
  );
}
```

### 对比总结：
| 特性 | 普通局部变量 (`let x`) | `useState` | `useRef` |
| :--- | :--- | :--- | :--- |
| **跨渲染保留值** | ❌ 每次重渲染重置 | ✅ 会保留 | ✅ 会保留 |
| **更新时触发重渲染** | ❌ 否 | ✅ 会触发重渲染 | ❌ 不会触发 |
| **更新方式** | 直接赋值 `x = 1` | `setX(1)` | 修改 `ref.current = 1` |

import { useEffect, useState } from 'react';

/**
 * TASK-009: 防抖值 Hook（debounce）——「值变了，但先别急着用它」
 *
 * ────────────────────────────────────────────────────────────────
 * 它解决什么问题？
 * ────────────────────────────────────────────────────────────────
 * 搜索框每敲一个字就 setKeyword → useEffect 发一次请求。输入「架构师」三个字 = 3 次请求，
 * 而且**旧响应可能后到**，把新结果覆盖成上一次关键字的结果（竞态，复习 TASK-007）。
 *
 * 防抖的思路：值变化后等 `delay` 毫秒，如果这期间**没有新的变化**，才真正采用它。
 * 所以对外暴露的不是入参 `value`，而是"安静下来之后的 value"。
 *
 * ────────────────────────────────────────────────────────────────
 * 为什么清理函数是灵魂？（React 的 effect 时序）
 * ────────────────────────────────────────────────────────────────
 * 依赖数组 [value, delay] 每轮渲染后 React 都会：
 *   ① 先执行【上一轮 effect 返回的清理函数】  → clearTimeout(上一次的定时器)
 *   ② 再执行【本轮的 effect 函数】           → 重新 setTimeout 计时
 *
 * 于是「用户又敲了一个字」这个动作**本身**就自动撤销了上一次的待定提交 —— 防抖天生成立。
 * 若忘了 return 清理函数：三个定时器全部到期 → 三个 setState 依次执行 → 防抖彻底失效
 * （而且因为 setState 相同值会被 React 跳过，你甚至看不出它"发了 3 次"...请求层才知道）。
 *
 * Java 类比：
 *   像一个去抖调度器 —— 每次事件先 `scheduledFuture.cancel(false)`，再 `schedule(...)` 重新计时；
 *   也等价于消息队列里的"延迟消息 + 幂等覆盖"（只有最后一条延迟消息真的生效）。
 *
 * ⚠️ 它**不取消**已经发出去的请求：防抖只是"少发"。
 *    真正的取消留给 AbortController（DoD ⑩ 进阶项）。
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  // 初始值直接用入参：首帧渲染时"还没有任何变化"，所以延迟值就等于原值，不会闪空
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      // 安静了 delay 毫秒 → 正式采用这个值（触发下游重新渲染 / 请求）
      setDebouncedValue(value);
    }, delay);

    // ⭐ 清理函数：value 再次变化或组件卸载时，撤销这个还没到期的定时器
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

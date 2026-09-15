# React State 与数据不可变性 (state.md)

## 1. 为什么不能用普通局部变量？

看这段代码：
```tsx
function Counter() {
  let count = 0; // 普通局部变量

  function handleClick() {
    count++; // 变量确实变成 1 了
  }

  return <button onClick={handleClick}>{count}</button>;
}
```
**问题在哪？**
1. 普通局部变量的修改**不会触发 React 重新执行组件函数（不会触发重渲染）**。
2. 即使组件因为其他原因重渲染，函数重新执行，`let count = 0` 又会被重新初始化为 0！

为了在**多次渲染之间保留数据**，并且**在数据改变时通知 React 刷新屏幕**，必须使用 `useState`。

---

## 2. `useState` 的解构与用法

```tsx
import { useState } from 'react';

function Counter() {
  // const [当前值, 更新函数] = useState(初始值);
  const [count, setCount] = useState<number>(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      当前点击: {count}
    </button>
  );
}
```

---

## 3. 快照心智模型：为什么不能立即读到新值？

很多 Java 开发者写出类似下面的代码：

```tsx
const [count, setCount] = useState(0);

function handleAdd() {
  setCount(count + 1);
  console.log(count); // 打印出来的居然是 0，不是 1！为什么？
}
```

### 底层机制：每次渲染都是一次独立的“快照” (Snapshot)
- 组件函数的每次执行，都对应当前这一次渲染。
- 在当前这次执行里，`count` 是一个**常量（固定为 0）**。
- `setCount(1)` 的实际含义是：“通知 React，请在下一次重新渲染时，把 count 的值传为 1”。
- 当前函数正在执行的代码行里，`count` 不会突变。

---

## 4. 状态不可变性（Immutability 铁律）

在 Java 里修改对象习惯了 `setXxx()`。在 React 里这是最危险的习惯。

### 错误示范（对象原地突变）
```tsx
const [person, setPerson] = useState({ name: 'Alice', score: 90 });

// ❌ 错误：原地修改属性
person.score = 95;
setPerson(person); // React 对比新旧 person 引用，发现地址一模一样，直接忽略重渲染！
```

### 正确姿势（展开运算符生成新对象）
```tsx
// ✅ 正确：创建全新对象
setPerson({
  ...person,
  score: 95
});
```

### 数组状态更新常用操作对应表
| 操作需求 | ❌ 禁忌方法（原地破坏） | ✅ 正确做法（返回新数组） |
| :--- | :--- | :--- |
| **新增元素** | `arr.push(item)` | `setList([...list, item])` |
| **删除元素** | `arr.splice(i, 1)` | `setList(list.filter(item => item.id !== id))` |
| **修改元素** | `arr[i].title = '...'` | `setList(list.map(item => item.id === id ? { ...item, title: '...' } : item))` |
| **排序** | `arr.sort()` | `setList([...list].sort(...))` |

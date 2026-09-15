# React 组件与 JSX 深度笔记

## 1. 组件的本质：UI = f(state)

在 Java Web 开发中，传统的渲染模式通常是：
`Controller` 接收请求 → 从数据库拿数据放入 `Model` → 模板引擎（Thymeleaf / JSP）拼装 HTML 字符串返回。

而在现代 React 中：
- **组件本质上就是一个返回 UI 描述的纯函数（Function）**。
- 公式：`UI = f(props, state)`
- 当 `props` 或 `state` 改变时，React 会**重新调用该函数**，算出新的虚拟 DOM（Virtual DOM），再高效打补丁更新到真实浏览器 DOM。

---

## 2. JSX 到底是什么？

初学者看 JSX 会以为是“在 JS 代码里写 HTML”，这其实是误解。

```tsx
// 你写的 JSX：
const element = <div className="card">Hello React</div>;

// 编译器（Babel/Vite）转换后的纯 JS：
const element = React.createElement(
  'div',
  { className: 'card' },
  'Hello React'
);
```

JSX 只是**创建 JavaScript 虚拟节点对象（React Element）的语法糖**。
它本质是 JS 对象表达式，因此：
- 标签里可以写任何 JS 表达式，放在花括号 `{}` 里面：
  `<h1>{user.name.toUpperCase()}</h1>`
- 必须有且仅有一个根标签（或者使用 `<> ... </>` Fragment 占位符）。

---

## 3. Props：不可变的方法入参

可以把 Props 理解为组件这个“方法”的**入参 DTO**。

```tsx
interface GreetingProps {
  name: string;
  vip?: boolean;
}

// 子组件
function Greeting({ name, vip = false }: GreetingProps) {
  return (
    <div>
      Hello, {name} {vip && '👑'}
    </div>
  );
}

// 父组件调用（传递实参）
<Greeting name="Alice" vip={true} />
```

### 铁律：Props 绝对只读（Readonly）
在 Java 中，如果你传一个对象入参，在方法里 `dto.setName("Bob")` 是很常见的隐患操作（产生副作用）。
但在 React 中，**绝对不允许在子组件内部直接修改 props 的属性**！
- 数据流向是**单向的（从父到子）**。
- 子组件如果想改变数据，必须通过父组件传递下来的回调函数（Callback）通知父组件去更新自己的状态。

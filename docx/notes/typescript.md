# TypeScript 精要笔记：Java 开发者的认知指南

## 1. 核心本质差异：结构类型 vs 名义类型

- **Java (名义类型 Nominal Typing)**：
  两个类的字段完全一样，但只要类名不同，就**不能**直接赋值。
  ```java
  class UserDto { String name; int age; }
  class UserVo  { String name; int age; }
  // UserVo vo = new UserDto(); // 编译报错！类型不匹配！
  ```

- **TypeScript (结构化子类型 Structural Typing / 鸭子类型)**：
  “如果一只鸟走起来像鸭子，叫起来像鸭子，那它就是鸭子”。
  只要两个类型的**形状（属性和类型）**兼容，就可以互相赋值！
  ```ts
  interface UserDto { name: string; age: number; }
  interface UserVo  { name: string; age: number; }

  const dto: UserDto = { name: "Alice", age: 20 };
  const vo: UserVo = dto; // 完全合法！
  ```

> ⚠️ **后端注意点**：TS 的类型在编译成 JavaScript 后会**被完全抹除（Type Erasure）**。运行时根本没有 `UserDto` 这个类的存在，只剩下纯 JavaScript 对象。不能在运行时指望用类似 Java 的 `instanceof UserDto` 去判断接口！

---

## 2. 声明对象的契约：`interface` vs `type`

### `interface`（接口）
更接近 Java 的 interface 感觉，适合定义对象结构、组件 Props、API DTO：
```ts
interface User {
  id: number;
  name: string;
  age?: number;        // 可选属性（类似可为 null/空）
  readonly role: string; // 只读属性（不可修改）
}

// 支持继承 (extends)
interface AdminUser extends User {
  permissions: string[];
}
```

### `type`（类型别名）
给任意类型起一个别名，功能更广泛，尤其适合联合类型、元组、工具类型：
```ts
type Status = "PENDING" | "SUCCESS" | "FAILED"; // 类似 Java 的 Enum
type ID = string | number;

// 交叉类型 (类似 interface extends)
type Admin = User & { permissions: string[] };
```

### 选择建议
- 定义业务数据契约、React 组件 Props：优先用 `interface`。
- 定义联合类型、简单别名、复杂计算类型：用 `type`。

---

## 3. 联合类型与类型收窄 (Narrowing)

Java 通常用多态、继承或 Enum 实现多种情况；TS 使用强大的联合类型（Union Types）：

```ts
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; errorMessage: string };

function handleResponse(res: ApiResponse<string>) {
  if (res.success) {
    // TS 自动推导收窄：此时 res 必定有 data 属性
    console.log(res.data);
  } else {
    // TS 自动推导收窄：此时 res 必定有 errorMessage 属性
    console.error(res.errorMessage);
  }
}
```

---

## 4. 泛型 (Generics)

TS 的泛型语法与 Java 高度相似：
```ts
// 类似 Java: public <T> Result<T> wrap(T data)
interface Result<T> {
  code: number;
  message: string;
  data: T;
}

const res: Result<{ username: string }> = {
  code: 200,
  message: "ok",
  data: { username: "zhangsan" }
};
```
不同点在于 TS 支持泛型约束与更丰富的类型推断（如 `extends keyof`）。

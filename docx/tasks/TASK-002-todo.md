# TASK-002: 经典待办清单 (Todo List)

> **目标**：彻底掌握 React 数组状态更新、列表渲染、`key` 的本质以及简单的受控输入。
> **代码工作区**：`src/exercises/TASK-002-todo/TodoList.tsx`

---

## 🎯 业务需求

实现一个完整的待办清单管理组件：
1. **待办列表展示**：
   - 每一项显示：勾选框（Checkbox）、待办内容、创建时间（或编号）、删除按钮。
   - 已完成的待办事项，文字显示横线划掉效果（CSS `text-decoration: line-through`）。
2. **新增待办**：
   - 输入框 + “添加”按钮（支持按回车键添加）。
   - 输入为空或纯空格时禁止添加，并保留良好的交互。
   - 添加成功后自动清空输入框。
3. **状态切换**：点击勾选框切换完成/未完成状态。
4. **删除待办**：点击删除按钮移除该项。
5. **状态筛选与统计**：
   - 底部展示统计：`总计 X 项 / 已完成 Y 项`。
   - 支持按钮切换筛选：`全部 (All) | 待办 (Active) | 已完成 (Completed)`。

---

## 🧰 所需知识点与提示

- TypeScript `interface TodoItem { id: string; text: string; completed: boolean; }`
- 数组不可变操作：
  - 添加：`setTodos([...todos, newTodo])`
  - 切换状态：`todos.map(item => item.id === id ? { ...item, completed: !item.completed } : item)`
  - 删除：`todos.filter(item => item.id !== id)`
- 条件过滤：派生状态（Derived State），不需要再存一个新的 state，直接在渲染时计算即可！

### ⚠️ 编码前必读的 2 个坑

- **删除用 `filter`，不要用 `splice`**：`splice` 会原地修改原数组，React 拿到的引用没变 → 不触发重渲染。
- **`key` 不要填 `index`**：`key` 是 React 识别“这一项是谁”的身份标识；用 `index` 时，删除/重排会让身份错位，导致勾选状态串行、输入框内容错乱。请用稳定的 `id`。

---

## 🏆 验收标准

- [ ] 功能完整：增、删、改状态、过滤筛选均可用；
- [ ] 严格遵守不可变原则，无任何 `todos.push` 或 `item.completed = true` 原地修改；
- [ ] 列表渲染有稳定唯一的 `key`；
- [ ] 提交给教练进行 Code Review 并记录避坑心得。

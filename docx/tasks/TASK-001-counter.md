# TASK-001: 全功能计数器 (Counter)

> **目标**：掌握 React 最核心的响应式状态机制 `useState`、事件处理与基础 TypeScript 类型定义。
> **代码工作区**：`src/exercises/TASK-001-counter/Counter.tsx`

---

## 🎯 业务需求

实现一个功能完备的计数器组件，包含以下特性：
1. **计数值展示**：界面居中展示当前数字，初始值为 `0`。
2. **操作按钮组**：
   - 增加按钮：点击让计数值增加 `step`（步长）。
   - 减少按钮：点击让计数值减少 `step`。
   - 重置按钮：点击将计数值归零。
3. **步长控制（Step）**：
   - 用户可选择步长（如 1、5、10），或者有一个数字输入框自由设置步长。
4. **边界与状态展示**：
   - 当数字为负数时，数字文字显示为红色；正数时显示为绿色；0 时显示为灰色。
   - 当设置步长小于等于 0 时，给出告警提示或禁用加减按钮。

---

## 🧰 所需知识点与 API 提示

- `useState<number>(initialValue)`
- React 点击事件：`onClick={() => ...}`
- React 输入框改变事件：`onChange={(e: React.ChangeEvent<HTMLInputElement>) => ...}`
- 条件渲染与动态样式：`className` 或行内样式 `style={{ color: count > 0 ? 'green' : 'red' }}`

### ⚠️ 编码前必读的 2 个坑

- **状态快照**：在同一个事件函数里连写两次 `setCount(count + 1)`，结果只加 1（`count` 是本次渲染的固定快照）；需要连续累加时改用函数式更新 `setCount(prev => prev + step)`。
- **input 的值永远是 string**：即使写了 `type="number"`，`e.target.value` 运行时也仍是 `string`，必须显式转换；且输入框可能给出空串或 `-`，转换后会得到 `NaN`，需要处理这个边界。

---

## 🏆 验收标准 (DoD - Definition of Done)

- [x] 界面能正常完成加、减、重置操作；
- [x] 步长可以调整且计算正确；
- [x] 代码通过 TypeScript 类型检查，无 `any` 警告；
- [x] 向教练提交代码，完成 Code Review 并修复所有问题。

> **通关归档时间**：2026-09-17  
> **教练评审结论**：✅ 验收通过（状态快照心智与派生状态边界防御达标）


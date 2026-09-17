# TASK-003: 受控表单与多字段联动 (Form Handling)

> **目标**：掌握 React 受控组件（Controlled Components）、多字段状态管理、表单提交事件与 TypeScript 表单类型。
> **代码工作区**：`src/exercises/TASK-003-form/UserForm.tsx`

---

## 🎯 业务需求

实现一个“用户注册/信息完善”表单：
1. **表单字段包含**：
   - 用户名 (`username`): 字符串，长度 3~16 字符
   - 电子邮箱 (`email`): 需符合邮箱基本格式
   - 角色身份 (`role`): 下拉选择框（`DEVELOPER` / `ARCHITECT` / `TESTER`）
   - 同意服务条款 (`agree`): 单选复选框 (boolean)
2. **校验与交互**：
   - 提交时进行表单验证，如果有不合格项，在对应输入框下方显示红色错误文本。
   - “同意服务条款”未勾选时，“提交”按钮处于禁用（`disabled`）状态。
3. **提交与重置**：
   - 点击提交阻止浏览器默认刷新行为（`e.preventDefault()`）。
   - 校验通过后，在页面下方美观展示提交成功的 JSON 结果卡片。
   - 提供“重置”按钮，清空表单及报错信息。

---

## 💡 所需知识点与提示

- 多字段状态的组织方式：既可以写 4 个独立 `useState`，也可以用一个对象 `useState<FormData>`；本任务推荐后者，顺便练习“一个 `handleChange` 处理所有字段”。
- 提交事件类型：`React.FormEvent<HTMLFormElement>`；`e.preventDefault()` 用于阻止浏览器默认的表单提交跳转（不写会导致页面刷新、state 全丢）。
- 通用变更处理思路：利用 input 的 `name` 属性 + 计算属性名动态更新。
- 校验错误信息建议统一在一个结构里管理（如 `Record<string, string>`），而不是每个字段开一个 error state。
- 派生值：提交按钮的 `disabled` 由 `agree` 直接算出，不要另存 state。

### ⚠️ 编码前必读的 2 个坑

- **受控组件必须同时给 `value` 和 `onChange`**：只给 `value` 不给 `onChange`，输入框会直接变成只读，React 还会在控制台告警。
- **`role` 这类下拉框的值是 `string`**：即使你想用联合类型 `'DEVELOPER' | 'ARCHITECT'`，从事件里拿到的也只是一个宽泛的 `string`，需要断言或先校验再赋值。

---

## ✅ 验收标准

- [x] 表单字段完全受控（输入框的值来自 state，改动更新 state）；
- [x] 表单提交无浏览器刷新；
- [x] TypeScript 类型定义严密，涵盖表单数据与事件类型；
- [x] 通过教练 Code Review。

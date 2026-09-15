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

## 🧠 动手前思考（请先回答给教练！）

1. 表单有 4 个字段，你是准备写 4 个独立的 `useState`，还是用一个对象类型的 `useState<FormData>`？各自的优缺点是什么？
2. 在表单提交时，为什么要显式写 `e.preventDefault()`？这与传统 Spring MVC / JSP 表单提交有何区别？
3. 如果用一个通用的 `handleChange` 函数处理所有输入框的变更，应该如何利用 input 的 `name` 属性和 TS 的类型？

---

## 🏆 验收标准

- [ ] 表单字段完全受控（输入框的值来自 state，改动更新 state）；
- [ ] 表单提交无浏览器刷新；
- [ ] TypeScript 类型定义严密，涵盖表单数据与事件类型；
- [ ] 通过教练 Code Review。

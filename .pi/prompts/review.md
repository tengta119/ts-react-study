---
description: 教练代码审查：对当前练习代码进行深度 Code Review
argument-hint: "[file or component]"
---
请作为我的 TypeScript + React 学习教练，对我目前编写的代码进行严格的 Code Review。
目标文件/组件：${1:-当前正在编辑的组件}

Review 规则：
1. 先评价：实现是否正确？功能是否完备？
2. 找出问题：是否有违背 React 不可变性、类型不安全（如 any）、未处理边界、无用 state 等问题；
3. 根因剖析：结合 React 底层机制（渲染循环/快照/虚拟DOM）与 Java 思维差异进行解释；
4. 引导提问：不要直接重写代码，提出 1~2 个启发性问题让我自己修改；
5. 如果有踩坑，提醒我记录到 docx/mistakes.md。

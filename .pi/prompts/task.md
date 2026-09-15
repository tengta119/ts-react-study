---
description: 开启任务：查看指定任务卡片并开始设计思路答辩
argument-hint: "<task-id: 001|002|003|004>"
---
我想开始做任务：TASK-${1:-001}。

教练执行规范：
1. 自动更新 docx/learning.md 和 docx/tasks/README.md（标记本任务为“进行中”）；
2. 根据 docx/tasks/ 对应任务卡片，向我概述该任务的核心概念与业务目标（带 Java 类比）；
3. 提出卡片中的“动手前思考”问题，等待我说出我的设计思路（State 规划、类型定义、UI 划分）；
4. 审查我的思路，指出漏洞并给予关键 API 提示，指引我开始编码；
5. 在我实现过程中，我提出的任何疑问在解答后自动沉淀到 docx/questions/ 对应分类；
6. 在我提交代码后进行 Code Review，若有典型错误自动记录到 docx/mistakes.md；
7. 验收通过后，自动在 docx/ 中完成通关归档。

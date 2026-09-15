---
description: Q&A 归档：将刚才的问题与解答以标准问答对整理沉淀到 docx/questions/ 对应分类中
argument-hint: "<category: ts|core|state|hooks|api> [question summary]"
---
请帮我将刚才讨论的问题与解答，整理成标准的 Q&A 格式，并沉淀到 `docx/questions/` 对应文档中。

分类映射规则：
- ts: `docx/questions/typescript.md`
- core: `docx/questions/react-core.md`
- state: `docx/questions/state-and-rendering.md`
- hooks: `docx/questions/hooks.md`
- api: `docx/questions/api-and-router.md`

目标分类：${1:-自动根据问题判定}
问题主题：${2:-刚才讨论的问题}

请提取出：
1. 提问背景
2. 核心底层机制解答
3. Java / 后端对照视角 (Java Mapping)
4. 极简代码示范
并直接以追加形式写入目标文件。

---
layout: post
title: "技术图表选型：先选图，再选工具"
description: "按顺序、交互、状态、结构、部署、时间和复杂关系选择图表，再比较 Mermaid、PlantUML、Graphviz 与 flowchart.js。"
date: 2025-01-26 14:00:00 +0800
modified_date: 2026-06-25 12:00:00 +0800
categories: [tech]
tags: [PlantUML, Mermaid, Flowchart, Graphviz]
article_type: comparison
difficulty: intermediate
featured: true
content_score: 8.0
score_basis: "问题真实，能形成先选图再选工具的判断框架，长期可复用；需要后续补充更多真实案例。"
update_note: "删除能力穷举和冗长示例，保留选图、选工具与落地检查。"
permalink: /tech/using-plantuml-mermaid-flowchart-and-graphviz/
---

技术图表的核心不是“用哪个工具”，而是“要表达什么关系”。正确顺序是：

> 先明确问题，再选择图类型，最后选择工具。

如果字段清单或方案对比已经能用表格说清，就不必画图。只有顺序、交互、状态、层级、依赖或数量流向是重点时，图才有价值。

## 先选图

一张图最好只回答一个主要问题：

| 要回答的问题 | 推荐图 |
| --- | --- |
| 事情如何推进 | 流程图、活动图、用户旅程图 |
| 多个参与者如何交互 | 时序图 |
| 对象如何改变状态 | 状态图 |
| 系统由什么组成 | C4 图、组件图、架构图 |
| 对象或数据如何关联 | 类图、ER 图 |
| 服务部署和连接在哪里 | 部署图、网络拓扑图 |
| 计划如何安排 | 甘特图、时间线 |
| 大量节点如何关联 | 有向图、无向图、知识图谱 |

还要匹配读者需要的抽象层级：

- 面向业务方，减少节点和内部术语。
- 面向研发团队，保留服务、接口、状态和异常分支。
- 面向运维排障，突出部署、网络、依赖和调用链。

如果图超过一个屏幕仍然难以理解，应拆成流程、结构、交互和部署等多张图，而不是继续缩小字体。

## 再选工具

| 工具 | 最适合 | 主要边界 |
| --- | --- | --- |
| Mermaid | README、博客、知识库中的流程、时序、状态、ER 和甘特图 | 平台支持版本不同；复杂布局控制有限 |
| PlantUML | UML、C4、组件、部署、活动和状态等正式工程文档 | 语法体系较大，通常依赖 Java 或渲染服务 |
| Graphviz | 依赖图、调用图、拓扑和大规模节点关系 | 工程语义弱于 UML，样式调优需要经验 |
| flowchart.js | 浏览器中的简单标准流程图 | 能力集中在流程图，不适合作为通用方案 |

精简选择建议：

1. 文档内快速表达，默认 Mermaid。
2. 需要严谨 UML 或架构模型，使用 PlantUML。
3. 节点和边很多，布局是主要难题，使用 Graphviz。
4. 只在网页中渲染简单流程图，才考虑 flowchart.js。

工具是否“能画”不是唯一标准，还要检查：

- 当前文档平台支持什么版本。
- 团队是否能维护对应 DSL。
- CI 能否渲染或校验。
- 导出格式是否满足发布要求。

## 落地检查

发布图表前检查：

- 图名是否说明结论，而不只是写“架构图”或“流程图”。
- 节点是否使用稳定的业务或系统概念。
- 是否只保留理解结论所需的信息。
- 颜色之外是否还有文字、形状或线型区分。
- 复杂图是否配有文字解释。
- 文本 DSL 是否与文档一起版本管理。

最终原则很简单：

> 图类型决定表达是否准确，工具决定维护成本和交付方式。

## 参考

- [PlantUML 支持的图类型](https://github.com/plantuml/plantuml)
- [Mermaid Diagram Syntax](https://mermaid.ai/open-source/intro/syntax-reference.html)
- [Graphviz Layout Engines](https://graphviz.org/docs/layouts/)
- [flowchart.js](https://github.com/adrai/flowchart.js/)

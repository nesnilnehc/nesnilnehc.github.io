# 内容与元数据规范

Front Matter 是内容与模板之间的稳定接口。所有新文章必须遵守本规范；旧文章按实际维护节奏逐步补齐。

## 必填字段

```yaml
---
layout: post
title: "准确描述文章解决的问题"
description: "80 至 160 字的独立摘要，用于列表、搜索和社交分享"
date: 2026-06-25 10:00:00 +0800
categories: [tech]
tags: [Jekyll, GitHub Pages]
article_type: guide
permalink: /tech/example/
---
```

| 字段 | 规则 |
| --- | --- |
| `layout` | 文章固定为 `post`。 |
| `title` | 清晰、具体；避免只有情绪或宽泛主题。 |
| `description` | 不依赖正文也能理解；说明问题、范围或结论。 |
| `date` | 包含时区。发布日期变化时不要覆盖原日期。 |
| `categories` | 使用数组且只能有一个一级分类：`tech`、`tutorials`、`news`。 |
| `tags` | 使用数组；建议 2 至 5 个，采用项目既有拼写。 |
| `article_type` | 使用下方定义的固定值。 |
| `permalink` | 使用稳定、可读的英文路径；发布后原则上不修改。 |

## 可选字段

```yaml
modified_date: 2026-06-25 10:00:00 +0800
series: technical-diagrams
series_order: 1
difficulty: intermediate
featured: true
cover_image: /assets/images/example/cover.png
update_note: "补充工具选型与图表选型建议。"
canonical_url:
```

| 字段 | 规则 |
| --- | --- |
| `modified_date` | 内容发生实质更新时填写，不用于修正错别字。 |
| `series` | 使用 `_data/series.yml` 中定义的稳定 ID。 |
| `series_order` | 系列内从 1 开始的整数。 |
| `difficulty` | `beginner`、`intermediate` 或 `advanced`。 |
| `featured` | 仅用于少量代表性文章，首页最多展示 3 篇。 |
| `cover_image` | 站内绝对路径；图片应有明确内容价值。 |
| `update_note` | 一句话说明本次实质更新，显示在文章页。 |
| `canonical_url` | 内容首发于其他地址时填写。 |

## 文章类型

`article_type` 只能使用：

- `concept`：解释概念、原理或模型。
- `comparison`：比较多个方案并给出选择边界。
- `guide`：完成具体任务的操作指南。
- `troubleshooting`：定位和解决具体故障。
- `case-study`：包含背景、决策、实施和结果的实践复盘。
- `digest`：经过筛选和评论的定期观察。
- `opinion`：有明确论点和证据的分析。

## 主题与系列

- 分类用于稳定的顶层信息架构，不随热点增加。
- 标签描述技术、平台和问题域。
- 主题由 `_data/topics.yml` 管理，用于聚合多个标签。
- 系列表示有顺序或持续更新关系的一组文章。
- 同一文章最多属于一个系列，但可以属于多个主题。

## 摘要、分享与搜索

- `description` 是文章在列表、搜索和社交平台上的默认摘要。
- 摘要不得使用“本文将介绍”等无信息量开头。
- 摘要应包含读者能获得的结果，而不是重复标题。
- 分享图片优先使用 `cover_image`，否则使用站点默认图片。

## 更新规则

实质更新时：

1. 保留原始 `date`。
2. 更新 `modified_date`。
3. 填写 `update_note`。
4. 检查步骤、截图、链接和结论是否仍然有效。
5. 系列文章同时检查前后篇导航是否完整。

## 发布检查

- 标题与摘要能够独立说明文章价值。
- 结论、步骤或建议有明确适用边界。
- 外部事实提供来源或验证方式。
- 代码和命令已执行验证。
- 图片包含替代文本。
- 文章已关联合理的标签；属于系列时填写顺序。
- 没有破坏已有永久链接。

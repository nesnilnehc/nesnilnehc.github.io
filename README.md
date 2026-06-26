# 骑墙派牛虻的技术实践

记录软件工程、开发工具与技术表达中的具体问题，以及经过实践后形成的选择和边界。

- 网站：<https://nesnilnehc.top>
- RSS：<https://nesnilnehc.top/feed.xml>

## 本地运行

环境：Ruby 3.3.6、Bundler。

```bash
bundle install
bundle exec jekyll serve
```

访问 <http://localhost:4000>。

## 内容发布

文章存放于：

- `_posts/tech/`
- `_posts/tutorials/`

Front Matter 示例：

```yaml
---
layout: post
title: "文章标题"
description: "用于列表、搜索和分享的独立摘要"
date: 2026-06-25 10:00:00 +0800
categories: [tech]
tags: [Jekyll, GitHub Pages]
article_type: guide
permalink: /tech/example/
---
```

发布前运行：

```bash
ruby script/validate_content.rb
bundle exec jekyll build
```

详细规则：

- [站点策略](docs/SITE_STRATEGY.md)
- [内容规范](docs/CONTENT_RULES.md)
- [体验决策](docs/UX_DECISIONS.md)

## 部署

推送 `main` 后，GitHub Actions 使用项目锁定的 Ruby 和 Jekyll 版本构建并部署 GitHub Pages。

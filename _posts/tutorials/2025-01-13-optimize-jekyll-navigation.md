---
layout: post
title: "优化 Jekyll 站点的导航菜单和分类系统"
date: 2025-01-13 21:33:45 +0800
categories: Tutorials
tags: [Jekyll, Navigation, Categories]
---

在建设个人博客网站时，良好的导航系统和清晰的内容分类对于提升用户体验至关重要。本文将介绍如何优化 Jekyll 站点的导航菜单和分类系统，让网站结构更加清晰、易用。

<!--more-->

## 目录结构优化

首先，我们需要合理组织网站的目录结构：

```
your-site/
├── _config.yml          # 配置文件
├── _pages/             # 存放页面文件
│   ├── about.markdown
│   ├── news.md
│   ├── technology.md
│   └── tutorials.md
├── _posts/             # 按分类存放文章
│   ├── news/
│   ├── technology/
│   └── tutorials/
└── assets/             # 存放样式和资源文件
    └── css/
        └── style.scss
```

## 统一导航菜单

### 1. 配置页面属性

在每个页面的 front matter 中设置以下属性：

```yaml
---
layout: page
title: "页面标题"      # 显示在页面顶部的标题
nav_title: "导航标题"  # 显示在导航菜单中的标题
nav_order: 1          # 导航菜单中的显示顺序
permalink: /url路径/   # 页面的永久链接
---
```

### 2. 配置导航顺序

在 `_config.yml` 中设置导航菜单的顺序：

```yaml
header_pages:
  - _pages/news.md
  - index.md
  - _pages/technology.md
  - _pages/tutorials.md
  - _pages/about.markdown
```

## 优化分类系统

### 1. 统一分类名称

在文章的 front matter 中使用统一的分类名称：

```yaml
---
categories: Technology  # 使用 Technology, Tutorials, News
tags: [标签1, 标签2]    # 使用标签提供更细致的分类
---
```

### 2. 创建分类页面

为每个分类创建独立的页面，例如 `_pages/technology.md`：

```liquid
---
layout: page
title: technology
nav_title: technology
nav_order: 3
permalink: /technology/
---

{% raw %}{% for post in site.categories.technology %}
  <article class="post-entry">
    <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
    <div class="post-meta">{{ post.date | date: "%B %-d, %Y" }}</div>
    {% if post.excerpt %}
      <div class="post-excerpt">{{ post.excerpt }}</div>
    {% endif %}
  </article>
{% endfor %}{% endraw %}
```

## 最佳实践

1. **保持命名一致性**
   - 分类名称统一使用：`technology`、`tutorials`、`news`
   - 避免混用 `tech` 和 `technology` 这样的变体

2. **使用标签系统**
   - 通过标签提供更细致的分类
   - 标签可以反映文章的具体主题、技术栈等

3. **目录组织**
   - 页面文件统一放在 `_pages` 目录
   - 文章按分类存放在 `_posts` 的子目录中

4. **导航顺序**
   - 使用 `nav_order` 控制显示顺序
   - 在 `_config.yml` 中统一管理导航菜单

## 效果展示

优化后的网站具有以下特点：

1. **导航菜单**
   - 所有页面显示统一的导航菜单
   - 菜单项按照设定的顺序排列
   - 导航标题简洁明了

2. **分类系统**
   - 每个分类有独立的展示页面
   - 文章按类别整齐归档
   - 标签系统提供更细致的分类

3. **目录结构**
   - 文件组织清晰
   - 便于维护和管理
   - 符合 Jekyll 最佳实践

## 总结

通过以上优化，我们的 Jekyll 站点实现了：
- 导航菜单的一致性和可控性
- 分类系统的清晰和规范
- 目录结构的优化和标准化

这些改进不仅提升了网站的可维护性，也大大改善了访问者的使用体验。如果你也在使用 Jekyll 建站，不妨参考这些优化方案，相信会对你有所帮助。

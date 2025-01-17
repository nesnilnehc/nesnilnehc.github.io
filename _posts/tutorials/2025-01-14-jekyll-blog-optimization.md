---
layout: post
title: "Jekyll 博客优化指南：功能增强与用户体验改进"
date: 2025-01-14 11:11:28 +0800
categories: tutorials
---

## 前言

在使用 Jekyll 搭建博客的过程中，经常需要添加一些基础功能和改进用户体验。本文记录了几个常用的优化配置，包括：

1. 功能增强：搜索和订阅功能
2. 布局优化：移动端适配
3. 文档规范：统一的排版标准
4. 性能优化：加载速度优化

## 目录

1. [功能增强](#功能增强)
   - [添加搜索功能](#1-添加搜索功能)
   - [配置 RSS 订阅](#2-配置-rss-订阅)
2. [布局优化](#布局优化)
   - [响应式设计](#1-响应式设计)
   - [侧边栏实现](#2-侧边栏实现)
3. [文档规范](#文档规范)
   - [中文排版规范](#1-中文排版规范)
   - [文件命名规范](#2-文件命名规范)
4. [性能优化](#性能优化)
   - [Jekyll 配置优化](#1-jekyll-配置优化)

## 功能增强

### 1. 添加搜索功能

**目的**：

- 在文章数量较多时，快速定位特定文章
- 按关键词查找相关内容
- 减少用户翻页次数

**方案选择**：

- Algolia Search：第三方搜索服务，每月有 10000 次免费搜索额度
- Simple Jekyll Search：生成 JSON 索引文件，前端 JavaScript 实现搜索
- Lunr.js：纯前端搜索，支持中文分词，适合小型博客

这里选择 Algolia Search 的原因：

- 搜索速度快，支持实时搜索
- 自带分词功能，支持中文搜索
- 有开箱即用的 UI 组件
- 配置简单，维护成本低

**实现步骤**：

1. 安装依赖：

```bash
# 在 Gemfile 中添加
gem 'jekyll-algolia'

# 安装依赖
bundle install
```

2. 配置 `_config.yml`：

```yaml
# 添加 Algolia 搜索配置
algolia:
  application_id: YOUR_APP_ID
  index_name: YOUR_INDEX_NAME
  search_only_api_key: YOUR_SEARCH_KEY
```

3. 创建搜索页面 `search.html`：

```html
---
layout: page
title: 搜索
---
<div id="search-searchbar"></div>
<div id="search-hits"></div>
```

### 2. 配置 RSS 订阅

**目的**：

- 让用户通过 RSS 阅读器订阅博客更新
- 支持文章聚合到其他平台
- 提供标准的文章输出格式

**方案选择**：

- Jekyll Feed：Jekyll 官方插件，输出标准 RSS 2.0 格式
- 自定义 RSS 模板：可以自定义输出格式，但需要自己维护

选择 Jekyll Feed 的原因：

- 配置简单，只需添加插件即可
- 自动处理文章更新
- 输出格式符合 RSS 标准

**实现步骤**：

1. 安装插件：

```bash
# 在 Gemfile 中添加
gem 'jekyll-feed'

# 安装依赖
bundle install
```

2. 更新 `_config.yml`：

```yaml
plugins:
  - jekyll-feed

# RSS 配置
feed:
  path: feed.xml
  posts_limit: 20
```

## 布局优化

### 1. 响应式设计

**目的**：

- 适配手机和平板等移动设备
- 确保文章在小屏幕上也能正常阅读
- 减少横向滚动

**方案说明**：

- 设置 viewport 确保正确缩放
- 使用相对单位适配不同屏幕
- 在小屏幕上调整导航栏和侧边栏位置

**实现步骤**：

1. 在 `_sass` 目录下创建响应式样式文件：

```scss
// _sass/_responsive.scss
@media screen and (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .sidebar {
    width: 100%;
    margin-top: 20px;
  }
}
```

2. 引入样式文件：

```scss
// assets/css/style.scss
@import "responsive";
```

### 2. 侧边栏实现

**目的**：

- 展示文章归档，方便按时间浏览
- 显示文章分类，便于主题浏览
- 在合适位置展示其他导航信息

**方案说明**：

- 使用 Liquid 模板语言处理数据
- 文章按年份分组归档
- 移动端时调整位置到主内容下方

**实现步骤**：

1. 创建 `_includes/sidebar.html`：

```html
<div class="sidebar">
  <h2>归档</h2>
  {% raw %}{% assign postsByYear = site.posts | group_by_exp:"post", "post.date | date: '%Y'" %}{% endraw %}
  
  <ul class="archive-list">
    {% raw %}{% for year in postsByYear %}{% endraw %}
      <li>
        <span class="year">{{ year.name }}</span>
        <span class="count">({{ year.items.size }})</span>
      </li>
    {% raw %}{% endfor %}{% endraw %}
  </ul>
</div>
```

2. 在布局文件中引入侧边栏：

```html
<!-- _layouts/default.html -->
<div class="container">
  <div class="content">
    {% raw %}{{ content }}{% endraw %}
  </div>
  {% raw %}{% include sidebar.html %}{% endraw %}
</div>
```

## 文档规范

### 1. 中文排版规范

**目的**：

- 统一全站的排版风格
- 提高中英文混排的可读性
- 便于后期维护和修改

**规范要点**：

1. 在 Markdown 文件中遵循以下规则：

- 中英文之间添加空格：`在 GitHub 上开发程序`
- 使用全角中文标点：`下载源码，开始编码。`
- 使用半角数字：`共发布了 10 篇文章`

2. 统一日期格式：

```liquid
{% raw %}{{ post.date | date: "%Y年%-m月%-d日" }}{% endraw %}
```

### 2. 文件命名规范

**目的**：

- 统一文件命名方式
- 避免文件名冲突
- 方便文件管理和查找

**规范说明**：

- 文章文件：`YYYY-MM-DD-title-with-hyphen.md`
- 页面文件：`lowercase-with-hyphen.md`
- 样式文件：`_component-name.scss`

## 性能优化

### 1. Jekyll 配置优化

**目的**：

- 减少站点构建时间
- 减少不必要的文件生成
- 优化资源文件大小

**优化方案**：

- 使用增量构建减少构建时间
- 排除不需要处理的文件
- 压缩图片等静态资源

**实现步骤**：

1. 更新 `_config.yml`：

```yaml
# 提升构建性能
incremental: true
profile: true

# 排除不需要的文件
exclude:
  - Gemfile
  - Gemfile.lock
  - node_modules
  - vendor
```

2. 优化图片资源：

```bash
# 安装图片优化工具
npm install -g imagemin-cli

# 优化图片
imagemin images/* --out-dir=images/optimized
```

## 总结

完成以上配置后，博客将具备：

1. 文章搜索和 RSS 订阅功能
2. 移动端适配和侧边栏导航
3. 统一的文档规范
4. 更快的加载速度

根据实际需求，可以选择性地实施这些优化方案。

## 参考资源

- [Jekyll 官方文档](https://jekyllrb.com/docs/)
- [Algolia 搜索文档](https://www.algolia.com/doc/)
- [中文文案排版指北](https://github.com/sparanoid/chinese-copywriting-guidelines)
- [Jekyll Feed 插件](https://github.com/jekyll/jekyll-feed)

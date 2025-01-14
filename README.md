# My Personal Blog

基于 Jekyll 构建的个人博客网站。

## 特性

- 响应式设计，支持移动端浏览
- 文章分类：News、Technology、Tutorials
- 按年份归档的侧边栏
- 支持 Markdown 格式写作
- 精确搜索功能，支持按标题、内容和分类搜索
- RSS 订阅支持

## 本地开发

### 环境要求

- Ruby 3.x
- Bundler
- Jekyll 4.x

### 安装步骤

1. 克隆仓库：

   ```bash
   git clone https://github.com/nesnilnehc/nesnilnehc.github.io.git
   cd nesnilnehc.github.io
   ```

2. 安装依赖：

   ```bash
   bundle install
   ```

3. 启动开发服务器：

   ```bash
   bundle exec jekyll serve
   ```

4. 访问 `http://localhost:4000` 预览网站

### 写作指南

#### 创建新文章

1. 在 `_posts` 目录下对应的分类子目录中创建新的 Markdown 文件：
   - News: `_posts/news/`
   - Technology: `_posts/technology/`
   - Tutorials: `_posts/tutorials/`

2. 文件命名格式：`YYYY-MM-DD-title.md`
   例如：`2025-01-14-my-new-post.md`

3. 添加文章头信息（Front Matter）：

   ```yaml
   ---
   layout: post
   title:  "文章标题"
   date:   2025-01-14 10:00:00 +0800
   categories: News  # 或 Technology, Tutorials
   ---
   ```

4. 使用 Markdown 格式编写文章内容

#### Markdown 语法示例

```markdown
## 二级标题

### 三级标题

正文内容

- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2

*斜体* 和 **粗体**

[链接文本](https://example.com)

![图片描述](/path/to/image.jpg)

> 引用文本

代码块：
\```python
def hello_world():
    print("Hello, World!")
\```
```

### 目录结构

```
.
├── _config.yml          # 网站配置文件
├── _includes           # 可重用的页面组件
│   ├── footer.html    # 页脚组件
│   ├── header.html    # 页头组件（包含导航栏、搜索和RSS按钮）
│   └── sidebar.html   # 侧边栏组件（文章归档）
├── _layouts           # 页面布局模板
├── _pages            # 独立页面
│   └── search.md     # 搜索页面
├── _posts            # 博客文章
│   ├── news         # 新闻类文章
│   ├── technology   # 技术类文章
│   └── tutorials    # 教程类文章
├── assets           # 静态资源
│   ├── css         # 样式文件
│   ├── images      # 图片文件
│   └── js          # JavaScript 文件
├── feed.xml        # RSS 订阅源
└── index.md        # 网站首页
```

### 功能说明

#### 搜索功能

网站提供精确的文章搜索功能：

1. 点击导航栏中的搜索图标进入搜索页面
2. 在搜索页面可以：
   - 选择搜索范围（标题、内容、分类）
   - 选择是否启用精确匹配
3. 搜索结果会高亮显示匹配的文本
4. 支持响应式布局，在移动设备上也能方便使用

#### RSS 订阅

支持通过 RSS 订阅博客更新：

1. 点击导航栏中的 RSS 图标访问订阅源
2. 使用任何 RSS 阅读器添加 `/feed.xml`
3. 自动获取最新的 10 篇文章更新

#### 侧边栏说明

网站右侧的侧边栏（Archive）会自动显示所有文章的归档信息：

1. 按年份分组显示文章
2. 每个年份显示该年的文章数量
3. 展开后显示该年所有文章的发布日期和标题
4. 点击文章标题可直接跳转到文章页面

侧边栏组件的实现在 `_includes/sidebar.html` 文件中，主要功能：

- 使用 Liquid 模板语言按年份对文章进行分组
- 自动计算每年的文章数量
- 支持响应式布局，在移动设备上会自动调整位置

### 部署

网站会在推送到 GitHub 后自动部署到 GitHub Pages。

1. 提交更改：

   ```bash
   git add .
   git commit -m "Add new post"
   git push
   ```

2. 等待 GitHub Actions 完成部署
3. 访问 `https://nesnilnehc.github.io` 查看更新

## License

[MIT License](LICENSE)

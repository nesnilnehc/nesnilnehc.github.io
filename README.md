# 个人博客网站

这是一个基于 Jekyll （一个简单的静态网站生成器）构建的个人博客网站

## 访问方式

- 网站：[nesnilnehc.github.io](https://nesnilnehc.github.io)
- RSS 订阅：[nesnilnehc.github.io/feed.xml](https://nesnilnehc.github.io/feed.xml)

## 主要功能

- 响应式设计，完美支持电脑和手机浏览
- 文章分类
  - 新闻动态 （News）
  - 技术分享 （tech）
  - 教程指南 （tutorials）
- 文章归档侧边栏，按年份整理
- 支持 Markdown 格式写作
- 站内搜索功能，支持按标题、内容和分类搜索
- RSS 订阅功能，实时获取更新

## 本地开发环境搭建

### 环境要求

- Ruby 3.x（推荐使用 Ruby 版本管理工具如 RVM 或 rbenv）
- Bundler（Ruby 包管理器）
- Jekyll 4.x（静态网站生成器）

### 安装步骤

1. 克隆代码仓库：

   ```bash
   git clone https://github.com/nesnilnehc/nesnilnehc.github.io.git
   cd nesnilnehc.github.io
   ```

2. 安装项目依赖：

   ```bash
   bundle install
   ```

3. 启动本地开发服务器：

   ```bash
   bundle exec jekyll serve
   ```

4. 打开浏览器访问 `http://localhost:4000` 预览网站

### 写作指南

#### 创建新文章

1. 在 `_posts` 目录下对应的分类子目录中创建新的 Markdown 文件：
   - 新闻动态：`_posts/news/`
   - 技术分享：`_posts/tech/`
   - 教程指南：`_posts/tutorials/`

2. 文件命名格式：`YYYY-MM-DD-title.md`
   例如：`2025-01-14-getting-started-with-jekyll.md`

   > 注意：虽然文章内容是中文，但建议文件名使用英文，这样可以避免 URL 编码问题，提高兼容性

3. 添加文章头信息（Front Matter）：

   ```yaml
   ---
   layout: post
   title:  "文章标题"
   date:   2025-01-14 10:00:00 +0800
   categories: News  # 或 tech, tutorials
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

代码示例：
\```python
def hello_world():
    print("你好，世界！")
\```
```

### 网站目录结构

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
├── _posts            # 博客文章目录
│   ├── news         # 新闻动态
│   ├── tech   # 技术分享
│   └── tutorials    # 教程指南
├── assets           # 静态资源文件
│   ├── css         # 样式文件
│   ├── images      # 图片文件
│   └── js          # JavaScript 脚本
├── feed.xml        # RSS 订阅源
└── index.md        # 网站首页
```

### 功能说明

#### 搜索功能

网站提供精确的文章搜索功能：

1. 点击导航栏中的搜索图标（🔍）进入搜索页面
2. 在搜索页面可以：
   - 选择搜索范围（标题、内容、分类）
   - 开启精确匹配模式（完全匹配搜索词）
3. 搜索结果会自动高亮显示匹配的文本
4. 移动端和电脑端都可以方便地使用搜索功能

#### RSS 订阅

支持通过 RSS 订阅博客更新：

1. 点击导航栏中的 RSS 图标订阅博客
2. 可以使用任何 RSS 阅读器添加订阅源：`/feed.xml`
3. 自动推送最新的 10 篇文章更新

#### 文章归档

网站右侧的归档栏（Archive）自动整理所有文章：

1. 按年份分组显示所有文章
2. 显示每年发布的文章数量
3. 点击年份可以展开查看该年所有文章
4. 点击文章标题直接跳转到文章页面

### 部署说明

本网站使用 GitHub Pages 托管，提交代码后会自动部署：

1. 提交更新：

   ```bash
   git add .
   git commit -m "添加新文章"
   git push
   ```

2. 等待 GitHub Actions 自动部署完成
3. 访问 `https://nesnilnehc.github.io` 查看更新

## 开源协议

[MIT 开源协议](LICENSE)

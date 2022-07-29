---
layout: post
title:  "如何托管站点到 GitHub Pages？"
date:   2022-03-14 14:36:05 +0800
categories: "GitHub Pages"
---

你可以为一个 GitHub 账户托管一个站点，或者给每一个项目托管一个站点。

## 使用 GitHub 账户托管站点

1. 创建一个名为 “账户名.github.io“ 的仓库 Repository，其中”账户名“为 GitHub 的账户名或组织名称。例如：nesnilnehc.github.io

2. 下载 GitHub Desktop 工具，GitHub Desktop 兼容 Windows 和 macOS

3. 克隆仓库

4. 使用 Visual Studio Code 打开本地仓库目录，并创建一个 index.html 文件

   ```html
   <!DOCTYPE html>
   <html>
   <body>
   <h1>Hello World</h1>
   <p>I'm hosted with GitHub Pages.</p>
   </body>
   </html>
   ```

5. 使用 GitHub Desktop 提交并发布

6. 通过 <https://账户名.github.io> 访问站点

## 参考

- [GitHub Pages \| Websites for you and your projects, hosted directly from your GitHub repository. Just edit, push, and your changes are live.](https://pages.github.com/)
- <https://docs.github.com/cn/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll#>
# 如何托管站点到 GitHub Pages ？

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

6. 通过 https://账户名.github.io 访问站点

## 在 GitHub Pages 网站中配置 Jekyll

1. [修改主题]([使用主题选择器将主题添加到 GitHub Pages 站点 - GitHub Docs](https://docs.github.com/cn/pages/getting-started-with-github-pages/adding-a-theme-to-your-github-pages-site-with-the-theme-chooser#adding-a-theme-with-the-theme-chooser))

   1. 在 GitHub 上，导航到仓库

   2. 在仓库名称下，单击 **Settings（设置）**

      ![仓库设置按钮](https://docs.github.com/assets/cb-21851/images/help/repository/repo-actions-settings.png)

   3. 在 Code and automation 节点，单击 **Pages**

   4. 在页面顶部单击所需的主题，然后单击 **Select theme（选择主题）**


## 参考

- [GitHub Pages | Websites for you and your projects, hosted directly from your GitHub repository. Just edit, push, and your changes are live.](https://pages.github.com/)
- https://docs.github.com/cn/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll#


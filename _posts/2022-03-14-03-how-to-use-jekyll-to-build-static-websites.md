---
layout: post
title:  "如何使用 Jekyll 构建静态网站"
date:   2022-03-14 14:36:05 +0800
categories: Jekyll
---

## 必备环境

- Ruby 2.5.0+
- RubyGems
- GCC and Make

## 初始化

1. [Windows 上安装 Jekyll](https://jekyllrb.com/docs/installation/windows/#installing-ruby-and-jekyll)
   1. 下载并安装 Ruby，<https://rubyinstaller.org/downloads/>

   ```bash
   # 检查 ruby 版本
   ruby -v
   ```

   1. 安装 jekyll 和 bundler gems

   ```bash
   gem install jekyll bundler
   ```

   1. 初始化网站

   ```bash
   jekyll new myblog
   ```

   1. 运行网站

   ```bash
   bundle add webrick
   bundle install
   bundle exec jekyll serve --trace
   ```

## 参考

- [Jekyll Docs](https://jekyllrb.com/docs/)
- <https://jekyllrb.com/docs/installation/windows/#installing-ruby-and-jekyll>
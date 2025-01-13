---
layout: post
title:  "如何下载 Kindle 电子书"
date:   2023-01-31 17:38:00 +0800
categories: Technology
tags:
  - Kindle
  - ePub
  - tools
  - tutorial
permalink: /tech/download-ebooks-from-kindle/
---

由于 Kindle 宣布 2023 年 06 月 30 日停止在中国电子书店的运营<sup>[1]</sup>，我想将购买的一些电子书下载存档。

## 步骤

1. 下载电子书
   1. 方法一
      1. 下载 [Kindle Download Helper](https://github.com/yihong0618/Kindle_download_helper/releases) <sup>[2]</sup>
      2. 安装或解压缩 Kindle Download Helper
      3. 登录 Amazon 官网
      4. [获取 Cookie](https://github.com/yihong0618/Kindle_download_helper#%E8%8E%B7%E5%8F%96-cookie)
      5. [获取 CSRF Token](https://github.com/yihong0618/Kindle_download_helper#%E8%8E%B7%E5%8F%96-csrf-token)
      6. 运行 Kindle Download Helper（[这里遇到了一个坑](https://github.com/yihong0618/Kindle_download_helper/issues/89)）
      ![1.png]({{ site.url }}/assets/images/20230131/1.png)
   2. 方法二
      1. 下载 Kindle for PC v1.17 <sup>[3]</sup>
      2. 安装 Kindle for PC v1.17，并取消自动升级功能
2. 去除 Kindle 电子书的 DRM 版权保护
   1. 下载安装 [Calibre](https://calibre-ebook.com/download)
   2. 下载 [DeDRM Tools](https://github.com/noDRM/DeDRM_tools/releases/tag/v10.0.2)
   3. 安装 DeDRM Tools 插件到 Calibre
    ![2.jpg]({{ site.url }}/assets/images/20230131/2.jpg)
   4. 重启 Calibre
   5. 批量转换成 ePub 格式保存

## 参考

1. [重要通知 \| Kindle 中国电子书店运营调整](https://mp.weixin.qq.com/s/jJG36Hbrw2-ZeUT3aDXKBA)
2. [yihong0618/Kindle_download_helper](https://github.com/yihong0618/Kindle_download_helper)
3. [去除 Kindle 电子书的 DRM 版权保护](https://blog.mzihen.com/kindle-drm-removal/)
4. [自购亚马逊电子书移除 DRM 教程：DRM 脱壳 + 电子书格式转换](https://zhuanlan.zhihu.com/p/58851910)
5. [apprenticeharper/DeDRM_tools](https://github.com/apprenticeharper/DeDRM_tools)
6. [noDRM/DeDRM_tools](https://github.com/noDRM/DeDRM_tools)

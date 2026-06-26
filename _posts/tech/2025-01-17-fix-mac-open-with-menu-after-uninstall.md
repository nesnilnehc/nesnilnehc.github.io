---
layout: post
title: "Mac 卸载应用后打开方式菜单残留问题的解决方法"
description: "解释 macOS 卸载应用后“打开方式”菜单仍有残留的原因，并通过重建 Launch Services 数据库完成修复。"
date: 2025-01-17 11:00:57 +0800
categories: [tech]
tags: [macOS, Launch Services, 故障排查]
article_type: troubleshooting
content_score: 7.2
score_basis: "真实问题明确，搜索意图稳定，解决步骤确定；不足是问题范围较窄，认知延展有限。"
permalink: /tech/fix-mac-open-with-menu-after-uninstall/
---

macOS 卸载应用后，“打开方式”菜单仍可能保留旧记录。原因通常是 Launch Services 文件关联数据库没有及时更新。

## 解决方法

在终端执行：

```bash
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user
```

命令会清理并重新扫描本地、系统和用户域的应用关联。执行完成后重启 Finder；如果菜单仍未刷新，再重启系统。

```bash
killall Finder
```

## 命令说明

- `-kill`：终止 Launch Services 数据库
- `-r`：递归扫描指定的域
- `-domain local/system/user`：重新扫描三个应用来源域

## 注意事项

- 该操作不会删除应用或文件，但会重建文件关联记录。
- 命令路径属于 macOS 系统内部工具，未来系统版本可能调整。
- 如果只有某个文件类型异常，还应检查其默认打开应用设置。

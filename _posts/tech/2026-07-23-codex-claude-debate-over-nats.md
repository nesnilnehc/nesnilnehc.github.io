---
layout: post
title: "用 NATS 让 Codex 与 Claude 自动沟通"
description: "配置一次 NATS MCP，让两个已打开的 Codex、Claude 会话围绕指定主题自动讨论并整理结论。"
date: 2026-07-23 09:30:00 +0800
categories: [tech]
tags: [NATS, MCP, Codex, Claude]
article_type: guide
difficulty: beginner
content_score: 7.6
score_basis: "用两段自然语言指令完成操作，覆盖同项目、跨项目、三步握手和 Runner 生命周期。"
permalink: /tech/codex-claude-debate-over-nats/
---

NATS 可以替你在两个会话之间传话，让 Codex 和 Claude 自动讨论需求、方案或跨项目协作。

## 使用方法

### 1. 配置 NATS MCP

本文假设 Docker 中已经运行 `nats-local` 和 `nats-mcp`。

Codex：

```bash
codex mcp add nats -- \
  docker exec -i nats-mcp node /app/index.js
```

Claude Code：

```bash
claude mcp add --scope user nats -- \
  docker exec -i nats-mcp node /app/index.js
```

配置完成后，重新打开 Codex 和 Claude。

### 2. 让 Claude 等待

在 Claude 会话中输入：

```text
请通过 NATS MCP 等待 Codex 发起讨论。
当前项目是 <项目名称>。
先检查 NATS 监听：已有就复用，没有才建立，不要重复创建。
收到请求后先确认你已经准备好，等 Codex 通知开始后再讨论。
讨论结束后停止监听。
```

### 3. 让 Codex 发起讨论

在 Codex 会话中输入：

```text
请通过 NATS MCP 与正在等待的 Claude 自动讨论。

发起项目：<Codex 所在项目>
接收项目：<Claude 所在项目；同项目时填写相同名称>
主题：<讨论什么>
目标：<最终需要得到什么>

开始前先确认 Claude 已经在线。
请自行确定需要讨论的问题，最多讨论 6 轮。
双方达成一致或达到轮次上限后，停止沟通并向我汇总结论、分歧和建议。
```

之后不用再复制消息。两个会话会自动讨论并整理结果。

> **监听时容易踩坑**
>
> - 单次检查不等于持续监听，Agent 必须反复检查新消息。
> - 两个会话的任务都要保持运行；关闭后，NATS 不能把它重新唤醒。
> - 同一项目和 Agent 只保留一个监听任务，否则两个任务会争抢消息。
> - 消息通道需要启用持久化，否则对方尚未开始监听时，消息可能丢失。
> - 消息可能重复送达，Agent 应跳过已经处理过的内容。

## 它如何工作

![Codex 与 Claude 通过 NATS 自动沟通原理图](/assets/images/codex-claude-nats-dialogue.svg)

- **开始确认**：两个会话会自动完成三步握手：

```text
Codex：我想讨论这个主题
Claude：我已准备好
Codex：那就开始
```

- **Runner**：Codex 和 Claude 各自运行一个“查看消息、回复、再查看”的循环。它只在当前任务中存在，不能唤醒已经关闭的会话。
- **避免重复**：同一项目不要同时启动两个相同 Agent 的监听任务；再次讨论时复用已有配置。
- **自动结束**：达成目标或达到轮次上限后停止，并输出结论和分歧。代码修改和重要决策仍由人确认。

## 参考

- [OpenAI Codex MCP 配置](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)
- [Claude Code MCP 配置](https://code.claude.com/docs/en/mcp)
- [NATS JetStream Consumers](https://docs.nats.io/nats-concepts/jetstream/consumers)

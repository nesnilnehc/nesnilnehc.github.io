# 个人技术站 — Agent 入口

本文是代理在本仓库工作的入口，定义项目、权威来源和交付约定。

## 项目

本站是记录软件工程实践的 Jekyll 个人技术刊物，并提供个人收藏浏览与统计。

| 资产 | 位置 | 维护依据 |
| --- | --- | --- |
| 文章 | `_posts/tech/`、`_posts/tutorials/` | 内容规范 |
| 收藏与页面 | `_data/`、`_pages/`、`assets/` | 数据、已确认设计 |
| 验证与发布 | `Makefile`、`script/`、`.github/workflows/ci.yml` | README、锁定依赖 |

## 权威来源

| 事项 | 来源 |
| --- | --- |
| 定位与内容 | [站点策略](docs/SITE_STRATEGY.md)、[内容规范](docs/CONTENT_RULES.md) |
| 体验 | [体验决策](docs/UX_DECISIONS.md)、任务关联的已确认设计 |
| 目标与需求 | [战略目标](docs/project-overview/strategic-goals.md)、`docs/backlog/` |
| 海报维护 | [现有海报规则](CLAUDE.md) |
| 运行与发布 | [README](README.md)、[Makefile](Makefile)、`Gemfile.lock` |

## 行为

1. 必须先核对分支和工作区，只提交当前任务的改动，保留其他未提交内容。
2. 必须按已确认需求实施；非平凡行为修改先写失败测试，再修复并运行回归。
3. 必须遵循内容规范，保持永久链接，不将累计喜欢次数解释为未记录的行为或时间趋势。
4. 必须在交付前加载下述 AI Cortex 审查与测试资产，保留发现、修复和验收结果。审查不能代替功能验收。
5. 必须在提交前检查暂存差异；推送 main 会触发 Pages 部署，必须取得用户推送授权。

## AI Cortex 发现与加载

已采用工作流：项目入口 → 差异审查 → 修复与测试 → 功能验收 → 范围内提交。
资产根目录优先使用 `CORTEX_HOME`，否则为 `${XDG_DATA_HOME:-~/.local/share}/ai-cortex`。
本机已核实默认目录 `/Users/nesnilnehc/.local/share/ai-cortex`；新环境须按
[安装说明](https://github.com/nesnilnehc/ai-cortex#installation)安装并核对路径。
这些路径是阅读约定，不是自动执行器；缺少必需文件时停止对应流程并报告缺失。

- 先读资产根的 `skills/INDEX.md`，再完整加载匹配的 `skills/review-diff/SKILL.md`、`skills/automate-tests/SKILL.md` 与 `skills/commit-work/SKILL.md`。
- 审查结果遵循资产根的 `specs/findings-list.md`；测试命令和基线读取 [.ai-cortex/config.yaml](.ai-cortex/config.yaml)。只安装 Skill 不代表已经完成验收。
- 新界面或显著交互、导航、视觉设计变更前，必须加载资产根的 `specs/functional-design-modeling.md`、`specs/technical-design-modeling.md`、`rules/functional-design-quality.md` 与 `docs/guides/ui-design-decisions.md`，按触发及跳过条件执行，并审查适用设计。
- 保持现有模式的小修复或非 UI 改动可按上述指南跳过新 UI 设计；界面行为修复仍须执行受影响的浏览器验收。
- `make test` 是快速统计模型测试；`make validate build` 是内容与构建门禁。浏览器测试的服务与工具前提见 README，不得把未执行的浏览器检查记为通过。

## 语言

正文和规划文档沿用中文；机器字段、命令、路径和稳定 ID 保留原值。沟通使用用户语言。

## 参考

| 用途 | 来源 |
| --- | --- |
| AGENTS 格式 | <https://agents.md/> |
| 本入口原文 | <https://raw.githubusercontent.com/nesnilnehc/nesnilnehc.github.io/main/AGENTS.md> |
| 入口契约 | AI Cortex 资产根的 `skills/generate-agent-entry/SKILL.md`（已采用其内嵌契约） |
| 使用与安装 | [README](README.md)、上文 AI Cortex 安装说明 |
| 资产索引 | 本仓库无独立资产注册表，以本页项目表为入口；外部能力使用 AI Cortex 资产根的 `skills/INDEX.md` |

# AI Cortex 接入与交付验收

2026-10-23，为真实的[喜欢次数统计需求](backlog/2026-10-23-like-count-analytics.md)完成交付收尾。原实现已在 `3495001` 提交，本次没有把已完成需求伪装成未实现功能，也没有注入故障。

## 持久接入

[AGENTS.md](../AGENTS.md) 是版本控制中的入口，[配置](../.ai-cortex/config.yaml) 声明 `test_command: make test` 和 `base_branch: main`。保留既有 CLAUDE 海报约定。入口采用 AI Cortex 的审查、测试和提交资产；UI 设计按其触发与跳过规则加载，不自动激活未采用的工作流。

本机使用已有规范安装 `~/.local/share/ai-cortex`，提交 `dfad16371b7d658d678ba66b94956180d763379a`；没有更新全局安装。采用的 generate-agent-entry 1.3.0、review-diff 1.0.2、automate-tests 1.1.0、commit-work 2.1.0 和 Findings 2.0.1 的实际版本与摘要另保存在 AI Cortex 的验收记录；以实测为准，不将整个安装声明为 0.6.0。其他机器须安装资产并核对路径，入口本身不下载依赖。

## 审查、修复与验收

真实收尾缺口：流水线只检查内容与构建，没有执行已有统计模型测试；需求记录仍写“尚未提交”，与 `3495001` 不一致。补上构建前 `make test` 门禁及 Makefile/入口配置的触发范围，并更正文档。新入口与原有 CLAUDE 文件排除于站点构建产物。

这是无产品行为变化的配置和文档修复，不强造 TDD 红灯。没有删除或弱化现有测试。UI 设计跳过原因：未修改界面、交互或现有设计；仍复验已交付页面的真实行为。

本地复验：

- Node 20.20.2：`make test`，5 项通过，0 失败、0 跳过。
- Ruby 3.3.6：`make validate build`，6 篇文章通过内容校验，Jekyll 构建成功。
- 已有 Playwright 1.62.1 / Chromium：`TEST_URL=http://127.0.0.1:4173 make test-browser`，5 组通过，0 失败、0 跳过。覆盖音乐、影视、筛选排序、临时次数、键盘、无脚本降级、异常数据、1440/390/320 像素排版；人工复查 320 像素音乐统计截图。
- 构建产物不含 AGENTS、CLAUDE 或 `.ai-cortex/config.yaml`；差异空白检查通过。

真实 Codex CLI 从本项目入口解析安装根，读取索引、配置和完整资产，执行声明的快速测试并审查当前差异。操作人员另行执行构建、浏览器验收、修复和提交；不将 CLI 快速测试冒充完整自主交付。运行使用忽略用户配置的只读 CLI，非桌面 GUI 或全部日常配置验收；实际模型后端与沙箱强度未独立认证。CLI 登录 shell 实测 Node 25.6.1；操作人员另用 CI 锁定的 Node 20.20.2 复验 5/5，不能将两次执行混为同一环境。

## 入口自检

按 generate-agent-entry 内嵌 Output Contract §3–§6 逐项检查：

| 要求 | 结果 | 依据 |
| --- | --- | --- |
| §3 opening | PASS | AGENTS 开头说明入口、权威和交付角色 |
| §3 identity | PASS | “项目”：定位及资产表 |
| §3 authority | PASS | “权威来源”：实际文档和数据入口 |
| §3 behavior | PASS | “行为”：五项可执行要求 |
| §3 discovery | PASS | “AI Cortex 发现与加载”：根目录、完整加载及缺失停止 |
| §3 language | PASS | “语言”：中文正文及机器字段边界 |
| §3 reference/order | PASS | “参考”及全页顺序符合契约 |
| §4 actionable | PASS | “行为”使用必须、明确动作和验收 |
| §4 no duplication | PASS | 仅索引权威文档，未复制完整规范 |
| §4 stable references | PASS | 本地相对链接及经 remote 核实的 raw URL |
| §5 title/length/language/tables | PASS | 简短标题、约一页入口、中文及三个结构表 |
| §6 format/raw/contract | PASS | “参考”前三行 |
| §6 usage/index | PASS | README、安装说明及本页资产表；本站无独立 Skill 索引，外部使用 Cortex 索引 |
| 路径/采用边界 | PASS | 本机文件存在；仅采用明确工作流；新 UI 条件加载，普通小修复允许跳过新设计 |

本记录通过 Git 保存；推送后的自动构建与部署结果应结合对应提交的 GitHub Actions 查询。浏览器套件未纳入 CI，未验证实体手机、其他浏览器、其他宿主或所有稳定核心链路。

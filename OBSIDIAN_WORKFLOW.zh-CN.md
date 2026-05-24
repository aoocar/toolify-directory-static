# Obsidian 运营工作流

本项目已接入 Obsidian 库：

```text
E:\Obsidian\www.limingdao.com
```

## 目录分层

```text
Raw/              Web Clipper 和其他来源的原始资料
Inbox/            待处理入口
Tools/            AI 工具知识卡
Categories/       分类知识卡
SEO/              SEO/GEO 专题内容
Comparisons/      对比、替代品、榜单
Prompts/          提示词库
Sponsors/         赞助位资料
Templates/        Obsidian 模板
Dashboards/       运营看板
Logs/             ingest 日志
00_System/        AI 工作规则和发布规则
```

## 日常流程

1. 使用 Obsidian Web Clipper 把网页保存到 `Raw/web-clips`。
2. 将值得处理的链接或文件放入 `Inbox`。
3. 在 Claudian 中要求 AI 按 `00_System/INGEST_PROMPT.md` 处理。
4. AI 生成或更新 `Tools/{slug}.md`。
5. 人工检查内容、分类、价格、SEO/GEO 字段和重复情况。
6. 确认可发布后，将工具卡改为：

```yaml
status: approved
publish: true
```

7. 在 Astro 项目中同步并构建：

```powershell
Set-Location D:\project\codex\toolify
npm run vault:sync
npm run build
```

## 初始化数据

已将当前站点的 6 个工具和 6 个分类导入 Obsidian：

```powershell
npm run vault:seed
```

该命令会从 `src/content` 读取当前站点数据，生成 `Tools/` 和 `Categories/` 中的知识卡。

## 发布同步

同步命令：

```powershell
npm run vault:sync
```

只会发布满足以下条件的工具：

```yaml
type: tool
status: approved
publish: true
```

分类满足以下条件会同步：

```yaml
type: category
publish: true
```

## SEO/GEO 策略

每个工具卡保留两类字段：

- `seo`：面向传统搜索引擎，包括关键词、标题、meta description。
- `geo`：面向 AI 搜索和答案引擎，包括短答案、事实、FAQ。

后续可以把 SEO/GEO 内容扩展为：

```text
/zh/best-ai-writing-tools
/zh/alternatives/chatgpt
/zh/compare/tool-a-vs-tool-b
/zh/free-ai-video-generators
```

## 注意事项

- `Raw/` 中的文件不要改。
- 不确定信息写 `unknown`。
- 不要把广告宣传语当作事实。
- 发布前先跑 `npm run build`。

# 黎明岛 — AI 运营操作手册

本手册是给 **AI 代理**（本会话或未来任意会话）的「操作纪律」，与人工运营文档
（`USAGE.zh-CN.md` / `OBSIDIAN_WORKFLOW.zh-CN.md` / `UPGRADE.zh-CN.md`）互补。
它回答一个问题：**AI 在这个站点上能做什么、不能做什么、怎么做才安全。**

> 适用对象：任何被授权操作本仓库的 AI 代理。人类运营者请以 `USAGE.zh-CN.md` 为准。

---

## 0. 总原则

AI 是**执行搭档，不是自主决策者**。所有「改文件 / 发布 / 推送」动作必须过三步法
（见 §1）。宁可多问一句，也不要擅自落地一个会改变生产站点的动作。

---

## 1. 三步法（最高优先级）

任何牵扯**修改 / 生成 / 删除文件**之前，必须严格走三步：

1. **提出方案**给你——含将改的文件、内容要点、影响范围。
2. **等你看完方案**。
3. **等你明确确认**后才执行。

- 唯一例外：记录本条纪律本身、或你已明确发起的「自行检测」。
- **模糊即确认**：若你的命令存在歧义，先停下确认「我理解的任务是否与你的意图一致」，得到确认后再动手。
- 匹配性 / 适配性调整**只在你明确发起「自行检测」时才做**，不主动提前推进。

---

## 2. 红线（AI 不可擅自）

| 红线 | 说明 |
|---|---|
| 不编造数据 | `followerCount` / `avgEngagement` / `growthRate` / 排名——查不到就**留空**（schema 已设为 optional）。绝不补一个数字。 |
| 指南不虚构账号 | 指南 frontmatter 的 `accounts:` 只列**已收录、站内真实存在**的 slug；不写不存在的账号。 |
| 不改已发布实体的 `slug` | 改 `slug` 会断 URL / SEO / sitemap / 内链。新增可以，改名不行（除非你明确批准并评估迁移）。 |
| 不动 `astro.config.mjs` 的 `site` 与路由 | 改域名或路由结构会全局破坏 SEO，须你明确批准。 |
| 不私自 push 生产 | 推送必须按 §5 的 wincred 方式，且只在你确认发布后执行。 |
| 不擅自删除 | 删除前先列出将受影响文件，等你确认。 |

---

## 3. 内容模型与真源

- **真源 = `src/content/` 目录下的 Markdown**（自 2026-08-01 起，已移除 Obsidian 库 ↔ 站点的 `vault:seed` / `vault:sync` 同步层）。
- 可直接用任意编辑器维护，也可把 Obsidian 打开 `D:\project\codex\toolify\src\content` 当作「带 UI 的数据库管理界面」；两者都只是编辑 `src/content`，没有库 → 站点同步层。
- 站点数据层唯一入口是 `src/lib/directory.ts` 的 getter 函数；页面 / 组件**不直接读 Markdown**。

### 3.1 品牌词标题规范（「黎明岛 + 领域词」，2026-08-08 起强制）

品牌词「黎明岛」与歌手「黎明」撞名，需用「**黎明岛 + 领域词**」长尾组合破局。

**所有新增 / 修改的内容标题（`title_zh` / `title_en` / 指南 `title`）必须遵守：**

| 内容类型 | 中文格式 | 英文格式 |
|---|---|---|
| 账号 `title_zh` / `title_en` | `账号名 - 领域描述 \| 黎明岛` | `Creator - Niche Description \| Dawn Island` |
| 指南 `seo.title_zh` / `title_en` | `主标题：领域关键词｜黎明岛` | `Main title — Niche Keyword | Dawn Island` |
| 分类页 `seo.title_zh` / `title_en` | `分类名 - 领域词｜黎明岛` | `Category - Niche | Dawn Island` |
| 新闻 `title`（zh/en） | 尽量含「黎明岛」或领域词，不加就由页面后缀补 | 同左 |

**执行要求：**
- 所有新增内容标题**必须**带品牌词（中文 `黎明岛` / 英文 `Dawn Island`），不能只写领域词；
- 领域词要具体（如「数学可视化科普」「大学生笔记本选购」），避免同质化空标题；
- 历史遗留未带品牌词的标题（如个别账号/新闻）需在改版时一并补齐；
- 页面对外显示 title 若由模板兜底拼接（如 `- {t(lang,"brand")}`），内容侧可省略，但**尽量在内容里显式写出**，保证搜索可见性与一致性。

---

## 4. 发布控制（直接编辑 src/content）

自 2026-08-01 起已无 `vault:sync` 的 `type/status/publish` 控制字段——那些字段是旧同步层的概念，站点 schema 里不存在。发布与否改为：

- **账号（accounts）**：默认上线；加 `draft: true` 即暂不上线（`directory.ts` 的 `load()` 会过滤，`draft` 账号不进路由、不进 sitemap）。
- **领域 / 平台 / 动态 / 指南（categories / platforms / news / guides）**：「有文件即上线」——`src/content` 里存在该 `.md` 构建就生成页面，删除文件即下线。

各卡的业务字段（必填 / 可选）见 `USAGE.zh-CN.md` §4–§9 与各集合 schema
（`src/content.config.ts`）。**AI 生成 / 改动 `.md` 时务必填满必填项**，否则 `npm run build` 的 Zod 校验会直接报错拦截。

---

## 5. Git 推送（Windows 凭据）

WorkBuddy 自带的 PortableGit **无 `credential-manager` 二进制**，系统 gitconfig 的
`helper-selector` + `manager` 会因 `/dev/tty` 不可用而失败。推送须用：

```bash
git -c credential.helper= -c credential.helper=wincred push origin main
```

`wincred` 读取 Windows 凭据管理器里已存的 github 条目。**不改动本机 gitconfig。**

---

## 6. 本地构建坑（沙箱误报，勿误判）

WorkBuddy 本地沙箱有 `genie-safe-delete` 钩子，会在 `astro build` 收尾清理
`dist/_noop-middleware.mjs` 时 `trash` 失败，把退出码置 1，导致本地 `npm run build`
报 `EXIT=1`、sitemap 不写出。

**规避**：构建前先移走旧 `dist`：

```bash
mv dist node_modules/.cache/olddist-$(date +%s) 2>/dev/null
npm run build
```

- Astro 本身会打印 `✓ Completed`、全部页面已生成——**这才是真成功标志**。
- Vercel 无此钩子，正常跑完 `astro:build:done` 并产出 sitemap。
- 判定构建是否成功，看日志 `✓ Completed` 与页面数，**勿被 `EXIT=1` 误判为代码错误**。

---

## 7. 验证纪律

- 每次内容 / 结构改动后**必跑 `npm run build`**，让 Zod 校验拦截错误数据。
- 验证 SEO / 结构化数据改动，可用 `curl` 实抓生产页解析（示例见历史会话）。
- 推送前确认无多余文件：`git status --short`。

---

## 8. 记忆与记录

- 落盘后追加 `D:\project\codex\toolify\.workbuddy\memory\YYYY-MM-DD.md`（项目日志）。
- 跨项目用户偏好 / 习惯写 `~/.workbuddy/MEMORY.md`。
- 用户要求「记录 / 总结」的内容**必须落人工可看文档**（如本仓库根级 `.md`），
  不能只存 agent 记忆。常规做法：建 / 追加一个人类可打开查阅的 `.md` 承载内容，
  记忆里只放极简指针。

---

## 9. 常用命令速查

```bash
npm run dev          # 本地开发（热更新）→ http://localhost:4321/zh
npm run build        # 生产静态构建 → dist/（先 mv dist 规避 §6 钩子）
npm run preview      # 预览构建产物

# 推送（Windows wincred，见 §5）
git -c credential.helper= -c credential.helper=wincred push origin main
```

---

## 10. 出错了怎么办

| 现象 | 排查 |
|---|---|
| Zod 校验失败 | 读报错定位集合 / 字段，修正对应 `.md` 的 frontmatter。 |
| 某页面没生成（如 EN 指南缺失） | 检查 frontmatter `lang` 是否写错（曾因 zh/en 复制未改，导致 6 篇 EN 不生成且无报错）。 |
| YAML 缩进报错 `bad indentation of a mapping entry` | 值里出现 ASCII `": "`（冒号+空格）会触发；全角「：」安全。批量写盘前扫描 `^  (en|zh): ` 的值。 |
| `push` 瞬时 TLS 失败 | 重试一次通常恢复。 |
| 本地 `npm run build` 报 `EXIT=1` 但页面已生成 | 见 §6，沙箱钩子噪声，非真实错误；Vercel 正常。 |

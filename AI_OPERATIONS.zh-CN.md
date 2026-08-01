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

- **真源 = Obsidian 库** `E:\Obsidian\www.limingdao.com`
  （`Accounts/` `Categories/` `Platforms/` `News/` `Guides/`）。
- `npm run vault:sync`：把 `publish: true` 的卡写回 `src/content/*`。
- `npm run vault:seed`：一次性把 `src/content` 导入库（已有内容引导）。
- 站点数据层唯一入口是 `src/lib/directory.ts` 的 getter 函数；页面 / 组件**不直接读 Markdown**。

---

## 4. Obsidian 卡的控制字段（AI 生成卡时必须带）

同步脚本按这些字段决定是否发布；写入站点时**会被剥离**（站点 schema 无这些字段）：

| 类型 | 发布条件 |
|---|---|
| account | `type: account` + `status: approved` + `publish: true` |
| category | `type: category` + `publish: true` |
| platform | `type: platform` + `publish: true` |
| news | `type: news` + `publish: true` |
| guide | `type: guide` + `publish: true` |

各卡的业务字段（必填 / 可选）见 `USAGE.zh-CN.md` §4–§9 与各集合 schema
（`src/content.config.ts`）。**AI 生成卡时务必填满必填项**，否则 `vault:sync`
会跳过该卡并报警（不会静默发布残缺数据）。

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
npm run vault:seed   # src/content → Obsidian 库（一次性引导）
npm run vault:sync   # Obsidian 已发布卡 → src/content

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

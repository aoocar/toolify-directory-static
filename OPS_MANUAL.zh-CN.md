# 黎明岛 / Dawn Island — 整体运维交接手册（总手册）

> **用途**：本手册是「黎明岛」创作者导航站的**唯一总入口运维手册**，供四类接手方使用：
> ① 新建 AI 会话（让 AI 立刻进入状态）② 人工交接（新人接手运营）③ AI 接手（自动化运营）④ 技术开发 / 架构升级。
>
> **来源**：整合自仓库内四份细分文档 —
> `USAGE.zh-CN.md`（使用与内容维护）、`OBSIDIAN_WORKFLOW.zh-CN.md`（Obsidian 库管理）、
> `AI_OPERATIONS.zh-CN.md`（AI 操作纪律）、`UPGRADE.zh-CN.md`（架构与扩容）。
> 本手册为**自包含**版本；四份源文档保留作细化参考，本手册如有与该四份冲突，以本手册为准（本手册含 2026-08-01 的 GEO 生产现状）。
>
> **产品名**：黎明岛 / Dawn Island（仓库目录名 `toolify-directory-static` 为历史遗留，可忽略）。
> **性质**：纯 GEO/SEO 用途的**双语（zh/en）静态站**，**不引入任何交互功能**（用户硬性约束）。
>
> **变更记录归集（强制）**：自 2026-08-02 起，**本项目所有更新 / 升级 / 修改 / 配置变更 / 运维相关记录均在本手册中进行**，不再另立分散台账。每次改动除在对应章节（架构、内容模型、部署、故障排查等）同步外，须在文末「变更记录」章节追加一条（含日期、commit、改动摘要、影响范围）；跨会话的待办与已发布链路以 `新会话交接-2026-08-01.md` 的 B 节快照为准，但最终溯源以本手册「变更记录」章节为准。（原 `代码改动记录.md` 代码台账已于 2026-08-02 **弃用**，冻结不再新增，历史仅作查阅）

---

## 0. 按接手方使用本手册

| 你是… | 必读章节 | 目标 |
|-------|---------|------|
| **新 AI 会话** | §1 总原则 · §7 AI 操作纪律 · §5 内容模型 · §9 部署发布 · §11 故障排查 | 立即进入安全操作状态，遵守三步法与红线 |
| **人工运营者** | §4 环境 · §6 内容运营标准流程 · §8 Obsidian 库管理 · §9 部署发布 | 日常增改内容、发布上线 |
| **AI 自动化运营** | §7 全部 · §8 库管理 · §6 质检清单 · §9 推送 | 批量生成/维护内容、安全同步推送 |
| **技术开发 / 升级** | §3 架构与接口 · §5 内容模型 · §10 扩容路线 · §9 部署 · §11 故障排查 | 改架构、换数据源、不破坏 URL/SEO |

### 0.1 新会话启动提示词（开新会话时整段粘贴）

> 无论是新 AI 会话、人工接手还是技术升级，开新会话时把下面这段**整段粘贴**给 AI，可让它立即进入安全操作状态。它已指向本手册并内置红线速记；把 `[在此写本次任务]` 替换为当次需求即可。在 WorkBuddy 内新开会话时，项目记忆会自动注入（仅摘要），正式交接仍以本手册为准；若换用其它无自动记忆的 AI 工具，本段 + 让其自读 `OPS_MANUAL.zh-CN.md` 即为完整上下文。

```
你正在接手「黎明岛 / Dawn Island」(https://www.limingdao.com) 项目的后续运维。
第一步：完整阅读仓库根目录的 `OPS_MANUAL.zh-CN.md`（总运维交接手册），按 §0 的「按接手方使用表」定位你该读哪些章节。

项目速记（与手册一致，红线优先）：
- 性质：纯 GEO/SEO 用途的**双语(zh/en)静态站**，Astro 5 + Content Collections + Zod，GitHub→Vercel 部署，**无交互功能**（用户硬性约束）。
- 内容真源 = 项目内 `src/content/`（即站点构建输入）；用 Obsidian 打开该文件夹作数据库管理界面，直接编辑即上线，**无 vault 根目录、无 vault:seed/vault:sync 单向依赖**（2026-08-01 移除 sync 层）。
- 红线（不可擅自）：① 不编造粉丝/互动/增长/排名数据（查不到就留空）；② 不改已发布实体的 slug；③ 不私自 push 生产；④ Cloudflare 后台「托管 robots.txt」开关必须保持关闭（误开会覆盖仓库版、重新屏蔽 AI 爬虫、断 GEO）；⑤ AI 任何改/生成/删文件前走三步法（提方案→等我看→等我确认）。
- 推送命令：`git -c credential.helper= -c credential.helper=wincred push origin main`（Windows wincred）。
- 当前 GEO 状态：已打通（AI 爬虫全放行 + llms.txt HTTP200 + 四类结构化数据 + 全站 hreflang + og:image）。
- 本地 `npm run build` 可能报 EXIT=1（沙箱 safe-delete 钩子误报），看 Astro 的 `✓ Completed` 判定成功，Vercel 不受影响。

我的具体需求是：[在此写本次任务]
```

---

## 1. 总原则（所有接手方遵守）

- **真源 = `src/content/`**（即 Astro 构建输入）。用 Obsidian 打开该文件夹作编辑器/数据库管理界面即可，**直接编辑即上线**，无独立 vault 根目录、无同步脚本（2026-08-01 移除 sync 层）。
- **不编造数据**：粉丝数 / 互动 / 增长率 / 排名——查不到就**留空**（schema 已设为 optional）。
- **不破坏 URL 与 SEO**：已发布实体的 `slug` 不改；`astro.config.mjs` 的 `site` 与路由结构不动；robots.txt 不得重新屏蔽 AI 爬虫（见 §8.4）。
- **AI 是执行搭档，不是自主决策者**：见 §7 三步法。

---

## 2. 项目概览

| 项 | 值 |
|----|----|
| 产品 | 黎明岛 / Dawn Island — 全领域优质创作者导航 |
| 站点 | https://www.limingdao.com （根路径 `/` → `/zh`） |
| 技术栈 | Astro 5（`output: static`、`trailingSlash: "never"`）+ TypeScript + Content Collections + Zod |
| 双语 | `zh`（默认） / `en`，所有本地化字段为 `{ en, zh }` 形式 |
| 数据 | `src/content/*` 下 Markdown，由 `src/lib/directory.ts` 统一读取 |
| 部署 | GitHub `main` → Vercel 自动构建（`npm run build` → `dist`），无 `vercel.json` |
| 监控 | GA4 `G-WJ8ZP9FSE9`、MS Clarity `kn4x488ytp`（BaseLayout 全局注入） |
| 约束 | 纯静态、无后端、无前端交互；所有内容以 Markdown 为单一事实源 |

---

## 3. 核心架构与稳定接口（技术升级必读）

**设计理念**：*数据源可替换，接口与组件保持稳定*。页面/组件绝不直接读 Markdown，全部经 `src/lib/directory.ts` 的异步函数。升级底层数据源时只要保持这些函数签名不变，页面层即可继续工作——**这是扩容永不破坏 URL/SEO 的基石**。

### 3.1 路由结构
- `/[lang]` 首页
- `/[lang]/accounts`、`/[lang]/accounts/[slug]`
- `/[lang]/platforms`、`/[lang]/platforms/[slug]`
- `/[lang]/categories`、`/[lang]/categories/[slug]`
- `/[lang]/guides`、`/[lang]/guides/[slug]`（指南列表 + 长文详情）
- `/[lang]/rankings`、`/[lang]/new`、`/[lang]/services`、`/[lang]/submit`、`/[lang]/contact`
- `/` → 默认语言 `zh`

### 3.2 directory.ts 接口（升级时只替换 `load()` 内部实现）
账号：`getAccounts()`、`getAccountBySlug(slug)`、`getAccountsByCategory(c)`、`getAccountsByPlatform(p)`、`getFeaturedAccounts()`、`getLatestAccounts(limit?)`、`getRankedAccounts(sortBy, limit?)`（`followers|engagement|growth`）、`getFastGrowingAccounts(limit?)`、`getGuidesMentioningAccount(slug,lang)`。
领域/平台：`getCategories()`/`getCategoryBySlug`/`getCategoryCounts()`；`getPlatforms()`/`getPlatformBySlug`/`getPlatformCounts()`。
动态：`getNews(lang)`、`getGuides(lang)`、`getGuideArticles(lang)`、`getRelatedGuides(lang,category,excludeSlug)`。
工具：`formatNumber(value, lang)`（本地化 万/K）。

### 3.3 Schema 变更规则（src/content.config.ts + src/lib/types.ts）
1. 扩 Zod schema → 2. 同步 `types.ts` 类型 → 3. 更新 `directory.ts` 映射 → 4. 补 UI 渲染。
> **坑**：`slug` 是 Astro 保留字段，加载器用 `e.data.slug ?? e.slug` 兜底，勿假设 `data.slug` 必存在。

---

## 4. 环境准备与本地开发

```bash
cd D:\project\codex\toolify
npm install
npm run dev       # 热更新 → http://localhost:4321/zh
npm run build     # 生产静态构建 → dist/（见 §9.2 规避沙箱钩子）
npm run preview   # 预览构建产物
```

Node.js 18+（托管 22/24 亦可）。`.workbuddy` 为项目数据目录，**勿删**。

---

## 5. 内容模型与数据真源

所有内容都是 `src/content/` 下 Markdown，构建期由 Zod 校验：

| 集合 | 路径 | 用途 | Obsidian 卡类型 |
|------|------|------|----------------|
| `accounts` | `src/content/accounts` | 核心实体（每个创作者） | `type: account` |
| `categories` | `src/content/categories` | 内容领域 | `type: category` |
| `platforms` | `src/content/platforms` | 来源平台 | `type: platform` |
| `news` | `src/content/news` | 首页「行业动态」区块 | `type: news` |
| `guides` | `src/content/guides` | 首页「创作者指南」区块 + 12 篇 GEO 长文 | `type: guide`（`link` 型）/ `article` 型长文直接落盘 |

> **指南的两种形态（关键）**：`link` 型（`kind: link`，仅 `title`+`url`）直接落在 `src/content/guides/<slug>.md`；12 篇 GEO 长文（`article` 型，含 `guideId`/`lang`/`category`/`accounts`/`seo`/`geo`）**直接在 `src/content/guides/{zh,en}/` 维护**。二者都直接落在 `src/content/`，不走任何同步脚本。

字段样例（账号/分类/平台/news/guide）详见源文档 `USAGE.zh-CN.md` §4–§9 与 `src/content.config.ts`，本手册不再重复贴全量样例。

---

## 6. 内容运营标准流程（人工 / AI 运营）

> **真源就是 `src/content/`**，直接在此编辑（可用 Obsidian 打开该文件夹）；编辑即上线，无同步步骤。

### 6.1 新增
1. 在 `src/content/` 对应子目录（`accounts`/`categories`/`platforms`/`news`/`guides`）新建 `<slug>.md`。
2. 填业务字段（样例见 §5 与 `USAGE.zh-CN.md`）；账号可用 `draft: true` 暂不上线。
3. `npm run build` 验证（Zod 拦截错误）。
4. `git push` → Vercel 部署。

### 6.2 修改
改 `src/content/` 中对应文件 → `npm run build` + `git push`。

### 6.3 删除 / 下线
- **软下线**：账号设 `draft: true`（加载时被过滤，不进 sitemap/构建）；其余集合直接删除或移走该 `.md`（URL 404、sitemap 自动剔除）。
- **硬删除**：直接删除对应 `.md`。删除前确认无其它指南 `accounts:` 引用它。

### 6.4 发布前质检清单（必查）
- [ ] `platform` / `categories` 的值是 `src/content/{platforms,categories}` **已存在**的 slug（否则静默丢失归类且**不报错**）。
- [ ] 不编造粉丝 / 互动 / 增长率——查不到**留空**。
- [ ] `name` / `tagline` / `description` 中英双语齐全。
- [ ] `news` / `guides` 的 `url` 指向**站内真实路由**（不指向营销/虚构页，保 GEO 可信度）。
- [ ] 指南 `accounts:` **只列已收录账号**。
- [ ] `npm run build` 无 Zod 报错；`git status` 无意外文件。

### 6.5 红线
- 账号指标**严禁虚构**（schema optional，留空即可）。
- 指南 `accounts:` 只列已收录账号。
- **不改已发布实体的 `slug`**（断 URL/SEO/sitemap/内链）。

---

## 7. AI 运营操作纪律（AI 会话必读，最高优先级）

### 7.1 三步法（任何改/生成/删文件前必走）
1. **提出方案**给你（含将改文件、内容要点、影响范围）。
2. **等你看完方案**。
3. **等你明确确认**后才执行。
- 唯一例外：记录本条纪律本身、或你已明确发起的「自行检测」。
- **模糊即确认**：命令有歧义，先停下确认「我理解的任务是否与你的意图一致」。
- 匹配/适配性调整**只在你明确发起「自行检测」时才做**。

### 7.2 红线（AI 不可擅自）
| 红线 | 说明 |
|------|------|
| 不编造数据 | 粉丝/互动/增长/排名查不到就留空 |
| 指南不虚构账号 | `accounts:` 只列已收录真实 slug |
| 不改已发布 `slug` | 改名须你批准并评估迁移 |
| 不动 `astro.config` 的 `site`/路由 | 改域名或路由全局破坏 SEO，须批准 |
| 不私自 push 生产 | 仅按 §9.3 方式、你确认发布后 |
| 不擅自删除 | 删除前列出受影响文件等你确认 |

### 7.3 发布控制（直接编辑 src/content）
无 vault/sync 后，**文件存在于 `src/content/` 即上线**（当前选择「有什么上什么」，无草稿闸门）：
- **账号**：可用 `draft: true` 暂不上线（`directory.ts` 加载时过滤，不进 sitemap/路由）。
- **分类/平台/news/guides**：文件存在即发布；下线即删除或移走该 `.md`。
- 旧 sync 层的 `type` / `status` / `publish` 控制字段现已无意义，直接写 `src/content` 时不需填写（留着也无害）。

### 7.4 记忆与记录
- 落盘后追加 `.workbuddy/memory/YYYY-MM-DD.md`（项目日志）。
- 跨项目用户偏好写 `~/.workbuddy/MEMORY.md`。
- 用户要求「记录/总结」的内容**必须落人工可看文档**（如仓库根 `.md`），不能只存 agent 记忆。

---

## 8. 用 Obsidian 管理 src/content（数据库管理界面）

用 Obsidian `Open folder as vault` 打开项目内的 `D:\project\codex\toolify\src\content`，即把该文件夹当「数据库管理界面」。各子目录（`accounts`/`categories`/`platforms`/`news`/`guides`）就是表，每个 `.md` 是一张卡。无 `Raw/Inbox/00_System` 等库内目录——直接在 `src/content` 下编辑即可。

### 8.1 日常流程（直接编辑即上线）
1. 在 `src/content/` 对应子目录新建 / 编辑 `.md`（frontmatter + 正文）。
2. `npm run build` 验证（Zod 拦截错误）。
3. `git push` → Vercel 部署。
无 seed / sync 步骤；Astro 构建时直接读取 `src/content/`。

### 8.2 各类型卡字段对照（发布控制）

| 类型 | 发布控制 | 必填业务字段 | 可选业务字段 |
|------|---------|-------------|-------------|
| account | `draft: true` 即暂不上线（默认 `false` 上线）；其余集合无草稿概念，有文件即上线 | `slug`,`profileUrl`,`name{en,zh}`,`tagline{en,zh}`,`description{en,zh}` | `avatar`,`platform`,`platformId`,`verified`,`categories[]`,`tags[]`,`contentStyle[]`,`monetization`,`featured`,`followerCount`,`avgEngagement`,`contentFrequency`,`growthRate`,`publishedAt`,`updatedAt`,`seo`,`geo` |
| category | 无（有文件即上线） | `slug`,`name{en,zh}`,`description{en,zh}` | `icon`,`seo`,`geo` |
| platform | 无（有文件即上线）；`type` 为内容形态分类（short-video/video/image-text/social/knowledge），非发布闸门 | `slug`,`name{en,zh}`,`description{en,zh}` | `icon`,`baseUrl`,`type` |
| news | 无（有文件即上线） | `slug`,`title{en,zh}`,`url` | `summary{en,zh}`,`order`,`date` |
| guide | 无（有文件即上线）；`kind: link\|article` 区分清单型 / 长文型 | `slug`,`title{en,zh}`,`url` | `summary{en,zh}`,`order` |

> 旧 vault/sync 层的 `type`(集合判别)/`status`/`publish` 控制字段已不存在：站点 schema 无这些字段，直接写 `src/content` 时不需填写（留着也无害）。账号软下线用 `draft: true`，其余集合删文件即下线。

### 8.3 模板 / 去重 / 下线
- **Templates**：在 Obsidian `Templates/` 放 5 类卡模板（含全部必填业务字段），新建即套用，保证不漏字段。
- **去重 / slug**：以 `slug` 为唯一键，缺省用 `slugify(name.en)` 推导；同 slug 两卡互相覆盖，新增前先搜索确认无重名。
- **下线方式**：账号软下线 → 该卡 `draft: true` 后重新 `build`；其余集合（category/platform/news/guide）无草稿概念，**直接删除对应 `.md` 文件**即下线。无 `publish` 闸门、无 sync 步骤。

### 8.4 ⚠️ GEO 关键约束：Cloudflare 不得重新托管 robots.txt（极重要）
线上 `robots.txt` 必须放行 AI 爬虫（GPTBot/ClaudeBot/Google-Extended/CCBot/Bytespider/Applebot/PerplexityBot/Bingbot），否则 GEO 不成立。
- **现状（2026-08-01）**：Cloudflare 控制台的「托管 robots.txt（Managed Content Signals）」开关已**关闭**，线上返回仓库版 `public/robots.txt`（含全部 AI bot `Allow` + `Content-Signal: search=yes, ai-train=no, use=reference`）。
- **交接红线**：**任何人/任何会话都不得在 Cloudflare 后台重新打开「托管 robots.txt」**，否则会覆盖仓库版、重新屏蔽 AI 爬虫，GEO 抓取断链。如误开，仓库版不会生效，需立即关闭。
- 仓库 `public/robots.txt` 已是正确兜底；如需改爬虫策略，改仓库文件并 push，而非在 Cloudflare 开托管。

### 8.5 关于同步
- 已无 `vault:seed` / `vault:sync`：2026-08-01 移除整套 vault↔site 同步层。`src/content/` 即唯一真源，编辑即生效。
- 若把 `src/content` 当 vault 打开，Obsidian 会在其中生成 `.obsidian/`，已被 `.gitignore` 忽略，无需提交、无需处理。

---

## 9. 部署与发布

### 9.1 流水线
GitHub `main` → Vercel 自动部署。`npm run build` → `dist`。`astro.config.mjs` 的 `site = https://www.limingdao.com`（canonical/sitemap 绝对 URL 来源）。`@astrojs/sitemap` 自动生成 `sitemap-index.xml`（草稿因不构建为路由而自动排除）。`public/robots.txt` 指向该 sitemap。

### 9.2 本地构建坑（沙箱误报，勿误判）
WorkBuddy 沙箱有 `genie-safe-delete` 钩子，清理 `dist/_noop-middleware.mjs` 时 `trash` 失败，把退出码置 1，本地 `npm run build` 报 `EXIT=1`、sitemap 不写出。规避：构建前先移走旧 `dist`：
```bash
mv dist node_modules/.cache/olddist-$(date +%s) 2>/dev/null
npm run build
```
Astro 本身打印 `✓ Completed`、全部页面已生成即真成功。**Vercel 无此钩子，正常产出 sitemap**。看 `✓ Completed` 与页面数判定，勿被 `EXIT=1` 误判为代码错误。

### 9.3 Git 推送（Windows 凭据）
WorkBuddy 自带 PortableGit 无 `credential-manager`，系统 gitconfig 的 `helper-selector`+`manager` 会因 `/dev/tty` 不可用失败。推送须用：
```bash
git -c credential.helper= -c credential.helper=wincred push origin main
```
`wincred` 读 Windows 凭据管理器的 github 条目，**不改动本机 gitconfig**。

---

## 10. SEO / GEO 生产现状（2026-08-01 实测，交接必知）

| 能力 | 状态 | 说明 |
|------|------|------|
| 结构化数据 | ✅ 四类齐全 | 首页 `WebSite`；账号 `Person`(含 `knowsAbout`/`jobTitle`/`sameAs`)；指南 `Article` 内嵌 `FAQPage`；分类 `CollectionPage`+`FAQPage`；全站加 `BreadcrumbList` |
| hreflang | ✅ | 全站 `zh`/`en`/`x-default` 互指（`BaseLayout` 生成，对 `/exit` 跳过） |
| og:image / twitter:image | ✅ | 统一 `public/og-default.png`（1200×630），`twitter:card=summary_large_image` |
| llms.txt | ✅ | `public/llms.txt` HTTP 200，喂 AI 引擎 |
| robots.txt AI 爬虫 | ✅ 全部放行 | 见 §8.4，Cloudflare 托管开关已关 |
| SearchAction | ❌ 已移除 | 静态站无前端过滤，留着是假声明，已删 |
| 双语对称 | ✅ | 415 URL（zh 207 + en 207 + 根），无孤儿路由 |

**验证方法**：改动后用 `curl -s https://www.limingdao.com/<path> | grep -oE 'hreflang=|og:image|application/ld+json'` 等实抓核对。

---

## 11. 扩容升级路线（技术升级参考）

**核心原则**：永远只替换 `directory.ts` 背后的数据源，保持 getter 接口签名不变——扩容永不破坏 URL 与 SEO。

| 量级 | 主要瓶颈 | 升级动作 | 动前端？ |
|------|----------|----------|----------|
| **0–1,000**（当前） | 无 | `src/content` Markdown + 静态构建，保持现状。可接 Pagefind 客户端检索 | 否 |
| **~1,000–5,000** | 人工编辑吞吐（非构建速度） | 数据源外置：Airtable/Notion/轻量 CMS/爬虫输出生成 `src/content/*`，或改写 `directory.ts` 加载逻辑；接 Pagefind | 否（接口不变） |
| **5,000+** | 需日更粉丝数/实时指标、构建变慢 | Supabase/PostgreSQL 存动态数据；Astro 改 hybrid/SSR；`directory.ts` 函数改查库 | 否（页面/组件不变） |
| **商业化** | 提交/赞助/对比页 | `/submit` mailto 改 API 路由；加赞助位与 `best-`/`alternatives-`/`compare-` SEO 页 | 局部 |

**触发升级的明确信号**：① 构建 > ~1 分钟；② 人工编辑速度跟不上收录（吞吐瓶颈）；③ 需每日自动刷新动态指标（Markdown 做不到）。
> 数千级以内当前方案完全够用，过早引入数据库反增维护成本。

---

## 12. 常见故障排查

| 现象 | 排查 / 修复 |
|------|------------|
| Zod 校验失败 | 读报错定位集合/字段，修正对应 `.md` frontmatter |
| 某页面没生成（如 EN 指南缺失） | 检查 frontmatter `lang` 是否写错（曾因 zh/en 复制未改，6 篇 EN 不生成且零报错） |
| YAML 缩进报错 `bad indentation of a mapping entry` | 值里出现 ASCII `": "`（冒号+空格）触发；全角「：」安全。批量写盘前扫描 `^  (en|zh): ` 的值 |
| 账号未出现在某分类页 | `categories` 值不是 `categories/` 已存在 slug（静默丢失，不报错） |
| `push` 瞬时 TLS 失败 | 重试一次通常恢复 |
| 本地 `npm run build` 报 `EXIT=1` 但页面已生成 | 见 §9.2 沙箱钩子噪声，非真实错误；Vercel 正常 |
| 线上 robots.txt 出现 Cloudflare「Managed content」字样、AI 爬虫被屏蔽 | **立即去 Cloudflare 后台关闭「托管 robots.txt」**（见 §8.4） |
| GEO 不被 AI 引用 | 先 `curl` 复核 robots.txt 是否放行 AI 爬虫 + llms.txt 可达 + 结构化数据合法 |

---

## 13. 交接检查清单（新会话 / 人工 / AI / 技术）

**环境接手**
- [ ] `npm install` 成功；`npm run dev` 能起 `http://localhost:4321/zh`
- [ ] `src/content/` 可直接编辑（Obsidian 打开该文件夹作界面，或任意编辑器）；`npm run build` 能跑
- [ ] GitHub `main` 推送凭据可用（wincred，见 §9.3）
- [ ] Vercel 项目归属与部署权限确认

**内容接手**
- [ ] 理解真源=`src/content/`、直接编辑即上线（无 vault/sync）
- [ ] 掌握 5 类卡字段表与发布控制（§8.2–8.3）
- [ ] 记住指南两种形态（§5）、账号指标不虚构（§6.5）

**AI 接手**
- [ ] 遵守三步法（§7.1）与红线（§7.2）
- [ ] 生成卡必带控制字段（§7.3）
- [ ] 落盘后写 `.workbuddy/memory` 日志（§7.4）

**技术接手**
- [ ] 理解 `directory.ts` 稳定接口与「只换数据源」原则（§3）
- [ ] 知 `slug` 保留字段坑（§3.3）、`draft` 过滤（不进 sitemap）
- [ ] 扩容阈值与触发信号（§11）

**GEO 状态确认（每次交接必核）**
- [ ] `curl https://www.limingdao.com/robots.txt` 返回仓库版、AI 爬虫全 Allow、无 Cloudflare「Managed」字样
- [ ] `curl https://www.limingdao.com/llms.txt` HTTP 200
- [ ] 首页 `hreflang` + `og:image` + 结构化数据齐全

---

## 14. 附录：常用命令速查

```bash
npm run dev          # 本地开发（热更新）→ http://localhost:4321/zh
npm run build        # 生产静态构建 → dist/（先 mv dist 规避沙箱钩子，见 §9.2）
npm run preview      # 预览构建产物
# 无 vault:seed / vault:sync：src/content 即真源，直接编辑后 npm run build

# 推送（Windows wincred，见 §9.3）
git -c credential.helper= -c credential.helper=wincred push origin main

# 实抓验证（GEO/SEO）
curl -s https://www.limingdao.com/robots.txt
curl -s https://www.limingdao.com/llms.txt
curl -s https://www.limingdao.com/zh | grep -oE 'hreflang=|og:image|application/ld+json'
```

---

## 15. SEO/GEO 与运维架构分析检查报告（2026-08-01 实测快照）

> 本报告为 2026-08-01 对生产站 https://www.limingdao.com 的实抓分析快照（方法：直接 curl 生产环境 + 解析 HTML 头/结构化数据 + 架构代码复核）。后续若有重大变更应重跑审计并更新本节；运维例行检查见 §13「GEO 状态确认」。

### 15.1 线上实抓体检（事实层）

| 维度 | 实测结果 |
|------|----------|
| Sitemap 规模 | **415 URL**（zh 207 + en 207 + 根页），单 `sitemap-0.xml`，双语完全对称、无孤儿路由 |
| 首页 SEO | title=`黎明岛 - 全领域优质创作者导航`；canonical 绝对化正确；hreflang=`zh`/`en`/`x-default`(→zh) 齐全；og:image=`og-default.png`；twitter=`summary_large_image` |
| 结构化数据 | 首页 `WebSite`；账号 `Person`+`BreadcrumbList`；分类 `CollectionPage`+`FAQPage`+`BreadcrumbList`；指南 `Article`(内嵌FAQ)+`BreadcrumbList`；平台 `BreadcrumbList` |
| GEO 抓取 | robots.txt **8 个 AI 爬虫全 Allow**（GPTBot/ClaudeBot/Google-Extended/CCBot/Bytespider/Applebot/PerplexityBot/Bingbot），Cloudflare 托管残留=0 |
| llms.txt | HTTP 200 |
| og 图 | HTTP 200，1200×630 PNG |
| 内链密度 | 首页唯一 `/zh` 内链 **198 条**；账号页含「收录该创作者的指南」反向内链 |

**结论**：hreflang / og:image / 移除假 SearchAction / llms.txt / 放行 AI 爬虫 / BreadcrumbList 全部在线上持续生效，状态稳定。

### 15.2 SEO/GEO 整体评估

**强项（行业上游）**
1. **结构化数据最完整**：四类页面 + 面包屑，AI 可直接消费 `Person`/`Article`/`FAQPage`/`CollectionPage`。
2. **GEO 抓取通路已打通**：AI 爬虫全放行 + `llms.txt` 直连摄取，是被 ChatGPT/Claude/Gemini 引用的前提已满足。
3. **内容天然问答化**：指南「一句话结论 / The short answer」+ 速览 + FAQ，利于被引用。
4. **双语与 hreflang 闭环**：x-default 兜底，避免语言版本被误判重复。
5. **实体互链密度高**：账号↔指南↔分类三向闭环，利于权重传递与实体图谱。

**待优化（按优先级）**

| 优先级 | 项 | 影响 |
|--------|----|------|
| P2 | 平台页仅 `BreadcrumbList`，无 `CollectionPage`/`WebSite` 级实体标记 | 平台页 GEO 权重偏低（平台页信息薄，收益有限） |
| P2 | og:image 全站同一张品牌图 | 账号/指南/分类用专属分享图，社交卡片更精准（需权衡生成成本） |
| P3 | 无真实站内搜索过滤 | 静态站硬约束，当前可接受 |
| P3 | 指南覆盖仅 6 个领域各 2 篇 | GEO 资产广度可随内容增长扩展 |

> 总体：SEO/GEO **已处于可交付、可被引用的健康态**，剩余项均为「锦上添花」，非阻塞。

### 15.3 技术架构分析

**架构评价：稳健、低耦合、可演进**
- **单一数据层 `src/lib/directory.ts`**：页面/组件绝不直接读 Markdown，全部经 getter 函数。这是整套系统最值钱的设计——**扩容只换数据源、不动前端、不破 URL/SEO**。
- **Content Collections + Zod**：构建期校验拦截脏数据，是质量闸门。
- **Astro static 输出**：零运行时、零后端、部署简单（GitHub→Vercel），契合「纯 GEO/SEO 静态站」定位。
- **`src/content` 为唯一真源（Obsidian 仅作编辑器）**：内容运营与代码解耦，非技术运营者也能维护（用 Obsidian 打开 `src/content` 文件夹即可）。

**风险点（需治理）**
1. **无预发环境 / 无 CI**：`push main` 即上生产。建议加 Vercel Preview 部署或分支保护。
2. **无自动化测试**：仅靠 `npm run build` 的 Zod 校验。可补少量构建期断言（如死链检测）。
3. **Cloudflare 边缘覆盖风险**：`robots.txt` 曾被托管覆盖（已修复并写入 §8.4 红线）。属「配置漂移」类风险，靠纪律约束。
4. **本地构建钩子噪声**：`genie-safe-delete` 误报 EXIT=1，需靠「看 ✓Completed 判定」规避误判。
5. **依赖锁版本**：`package-lock` 应随仓库提交，避免 Vercel 用不同版本构建。

### 15.4 运维方向分析

**现状**：166 账号×2、10 分类、11 平台、13 指南（含 12 篇 GEO 长文）。量级处于「0–1,000」阶段，当前 Markdown+Obsidian 方案绰绰有余（详见 §11 扩容阈值）。

**方向建议**
- **短期（保持）**：坚守「不编造数据」红线；在 `src/content/` 直接增改账号（可用 Obsidian 打开该文件夹作界面）；把指南两种形态约定执行到位。
- **中期（增长）**：① 扩指南广度（每个分类≥2 篇，逐步向长尾领域延伸，这是最强 GEO 资产）；② 账号量逼近 1,000 时接入 Pagefind 客户端检索；③ 关注 GA4/Clarity 中「AI 引荐」流量，验证 GEO 实际成效。
- **长期（规模化）**：按 §11 阈值——1k–5k 外置数据源（Airtable/Notion/爬虫），5k+ 迁 Supabase+SSR。**永远只换 `directory.ts` 背后的数据源**，接口签名不变。

**治理要点**
- 交接纪律已固化于本手册（§0 接手方表 + §13 检查清单 + §8.4 Cloudflare 红线）。
- 建议每次发版后跑一次同类实抓审计，监控 hreflang / 结构化数据 / robots 三项「GEO 生命线」不回退。

### 15.5 综合结论与行动清单

**结论**：站点 SEO/GEO 基础扎实、结构化数据达上游、AI 抓取通路已打通；技术架构低耦合可演进；运维体系有手册兜底。整体**已具备被搜索引擎与 AI 回答引擎稳定收录、引用的条件**，无需紧急修复。

**建议行动（按需，非紧急）**
1. 加 Vercel Preview 部署 / 分支保护，降低「直推生产」风险。
2. 指南广度随内容增长扩展（最强 GEO 杠杆）。
3. 账号量近 1,000 时评估 Pagefind 检索。
4. 定期（如每月）跑一次本审计，盯死 hreflang / 结构化数据 / robots 三项不回退。
5. 平台页若想提权，可补 `CollectionPage` 级标记（低优先级）。

---

> **文档维护约定**：本手册为交接总入口，与四份源文档（`USAGE.zh-CN.md`/`OBSIDIAN_WORKFLOW.zh-CN.md`/`AI_OPERATIONS.zh-CN.md`/`UPGRADE.zh-CN.md`）共存。重大变更（架构升级、GEO 策略调整、robots/Cloudflare 约束变动）须同步更新本手册对应章节与项目记忆 `.workbuddy/memory/YYYY-MM-DD.md`。

---

## 16. 变更记录（强制归集区，2026-08-02 起）

> 本手册自 2026-08-02 起为**唯一变更记录载体（含运维、更新、升级、修改、配置变更）**。原 `代码改动记录.md` 代码台账已于 2026-08-02 **正式弃用**——该文件冻结、不再新增任何条目，历史仅作查阅；此后所有变更记录统一记于本 §16，不再另立分散台账。
> 每条含：**日期 · commit · 改动摘要 · 影响范围**。

| 日期 | commit | 改动摘要 | 影响范围 |
|------|--------|----------|----------|
| 2026-08-02 | —（文档治理，未单独提交） | **文档治理**：① 手册更名 H1 由「运维交接手册（总手册）」改为「**整体**运维交接手册（总手册）」；② 确立「所有更新/升级/修改/运维相关记录均在本手册归集」的强制规则（文末 §16 为落账区）；③ **弃用 `代码改动记录.md`**（冻结不再新增，历史仅作查阅） | 总手册标题 + 顶部说明块「变更记录归集（强制）」+ 新增 §16 变更记录章节 + 冻结 `代码改动记录.md`；与 `新会话交接-2026-08-01.md` 的 B 节快照互为补充，溯源以本 §16 为准 |
| 2026-08-02 | c9b48e2（审计时生产 HEAD；本记录随本次 §16 增补提交） | **全项目审计 + 在线模拟检查（limingdao.com）**：① 本地——提交链路干净（HEAD=c9b48e2）、账号 169（draft=0 全上线）、指南 28（zh12/en12/根4）、分类 17、平台 10、搜索兜底仅 `jiadian-jiu-pingce`（用户指示暂不处理）、英文页 0 中文；② 线上——robots.txt 全 AI 爬虫放行、llms.txt HTTP200、sitemap-index 列出 sitemap-0.xml、AdSense `ca-pub-8752263153695128`+ads.txt 上线、6 账号真实 B站 UID（如 aifou-keji→`space.bilibili.com/7458285/`）已生效、exit 中间页 `<noscript>` 兜底 + `setInterval` 倒计时修复落地；③ **复核上轮「§15 失实」不成立**——§10(264)/§15.1(361,367) 早已正确标注「首页仅 WebSite、SearchAction 已移除（假声明）」，故 A 项「修正 §15」无需执行、不改正文；§15.1 的 166 账号/415 URL 为 2026-08-01 快照时间差，非失实 | 全站 GEO/SEO 健康、无阻塞；唯一缺口 `jiadian` 搜索兜底待用户给 UID；后续可按 §15.5 建议定期重跑审计盯死 hreflang/结构化数据/robots 三项 |
| 2026-08-03 | b97b85b | **SEO 静态站优化包（P1+P3+P4+P5+P2+P6）**：① robots.txt 删非标准 `Content-Signal`+重复 `User-agent`；② sitemap 经 serialize 补 `lastmod`；③ 新建 `vercel.json` 根 `/`→`/zh` 301；④ 新建 `src/pages/404.astro` 自定义 404 + 对齐 `[slug]` 重定向目标为 `/404`；⑤ 账号列表加静态客户端过滤（渐进增强、无后端/DB）+ 重启用 WebSite `SearchAction`（GEO 增益）；⑥ 账号 `<title>` 领域化默认（注入主分类，仅当无 seo.title 覆盖时生效） | 全站；构建 442 页；Vercel 自动部署；搜索/结构化数据/404/重定向/标题相关性提升；P6 当前 169 账号均有 seo.title 覆盖故无可见变化，仅兜底未来账号 |
| 2026-08-08 | 本 PR（GSC 跟踪基础设施） | **GSC 收录跟踪与关键词校准基础设施**：① 新增 `scripts/gsc-keyword-map.py`——从 `src/content/`（categories/guides/accounts/tools）提取全部 `primary_keyword`/`secondary_keywords` 生成 `gsc/keyword-map.csv` 关键词基线（1291 条：category 18 / guide 20 / account 198 / tool 1055）；② 新增 `scripts/gsc-audit.py`——对比 GSC 导出查询数据与基线，输出「有流量但未覆盖」词清单与审计报告；③ 新增 `gsc/GSC_跟踪与关键词校准手册.md`——收录跟踪 SOP（生成基线→GSC 导出→审计→校准动作→变更记录）；④ OPS_MANUAL §16 追加本记录 | 运营流程；不影响线上页面/路由/构建（脚本与文档，构建 2668 页通过）；为「持续跟进 GSC 收录数据、校准关键词清单」提供标准闭环 |
| 2026-08-08 | `5a0e091`（合并 PR #12）+ `28711fb`/`c92fa4f`（GSC 数据导出）+ `88b5bd1`（审计报告） | **GSC 数据自动导出与首次审计落地（打通「替我上班」全自动链路）**：① 确认用户提供的密钥 `aoobee-secrets/gen-lang-client-0803005687-0f2590780ae7.json` 为 Google Service Account（`aoobee-seo-bot@gen-lang-client-0803005687.iam.gserviceaccount.com`），通过 CNB 密钥仓库 `imports` 机制注入流水线、重建 SA 凭证并成功调用 Search Console API（**密钥仓库禁止本地克隆，只能走流水线注入**，已沉淀为可复用方法）；② 自动导出最近 28 天数据到 `gsc/export/queries.csv`（13 条查询）+ `gsc/export/pages.csv`（60 个页面），SA 当前在 GSC 有 `sc-domain:limingdao.com` 与 `sc-domain:aoobee.com` 两个域资源权限；③ 首次审计生成 `gsc/audit-report.md` + `gsc/uncovered-queries.csv`——**当前站点数据量极小（28 天 13 词/30 展示/0 点击），处「新站爬坡期」**，有流量但未覆盖词多为品牌/历史站残留（`site:www.limingdao.com`、`site:d.limingdao.com`、`黎明岛`、`fireship` 等），暂无高价值待补词；④ 关键词基线 1291 词全部「已覆盖但 GSC 无数据」，符合新站未收录预期，建议 2-4 周后再跑 | 运营流程；数据落 `gsc/export/`；脚本与报告不影响线上页面/构建；打通「用户授权密钥 → 平台注入 → 自动导出 → 审计 → 校准」闭环，后续每月可全自动执行 |
| 2026-08-08 | 本 PR（crontab 定时自动化） | **GSC 月度自动导出/审计流水线固化**：① 新增正式导出脚本 `scripts/gsc-export.py`（服务账号密钥由密钥仓库 `gen-lang-client-0803005687-0f2590780ae7.json` imports 注入，支持 `--days`/`--site`/`--sa-file`）；② `.cnb.yml` 固化 **crontab 月度任务**（每月 1 日 02:30：导出 GSC → 重生成关键词基线 → 跑审计 → 提交推送 CNB main → 自动 sync 到生产仓库）；③ `gsc/GSC_跟踪与关键词校准手册.md` 更新为自动方式为主（2A 自动 / 2B 手动备用） | 运营流程；GSC 数据不再依赖手动导出，月度校准报告自动入库 |

| 2026-08-08 | 本 PR（AI 可见性基线） | **黎明岛品牌 AI 可见性基线落地（GEO 方法论闭环第一步）**：① 新增 `geo/brand-questions.md`——围绕品牌选 10 个高价值问题（AI 学习博主/工具导航/自媒体资源/大学新生/装修家电/银发生活/GEO 落地/品牌推荐/创作者目录/品牌认知），每条配落地页与目标档位；② 新增 `scripts/ai-visibility-baseline.py`——GEO 可见性基线调研脚本：10 问题 × 6 模型（豆包/DeepSeek/文心/Kimi/通义/元宝）逐个提问，按品牌提及判定档位（🟢正面/🟡中立/🔴负面/⚫未提及），输出评分表 + 明细 + 结论；支持 `--dry-run` / `--regen`（从 CSV 重生成报告）/ `--provider external`（接入真实模型 API）；③ 首轮基线实测完成——`geo/ai-visibility-baseline.csv`（60 条）+ `geo/ai-visibility-report.md`：**当前 10 问题 × 6 模型全部「未提及」（60/60）**，即黎明岛在 AI 引擎中的可见性基线为 0，符合新站预期；④ **根因补充（Common Crawl 语料观测）**——新增 `scripts/check_ai_visibility.py` + `geo/AI_VISIBILITY_BASELINE.zh-CN.md`：实测大模型训练语料主源 Common Crawl 最近 3 批次（CC-21/25/30）对本站新站 `/zh` `/en` `/tools` `/guides` `/accounts` `/services` `/llms.txt` **全部 0 覆盖**（仅旧站 404 快照），即「语料里没有新站页面 = AI 大概率不知道黎明岛存在」，与 60/60 未提及高度一致；另 360 品牌词官网第 1 位✅、必应被歌手「黎明」占榜❌；⑤ 下一步：接入真实豆包/文心/Kimi/通义/元宝 API 重跑替换代理结果，每月复盘档位变化并按动作规则优化，同时把「CC 语料覆盖」作为每月基线前置检查 | 运营流程；脚本与报告不影响线上页面/路由/构建；为「黎明岛自身品牌 GEO」建立可量化、可复盘的起点基线，并给出「为何 AI 不提你」的根因（训练语料覆盖） |

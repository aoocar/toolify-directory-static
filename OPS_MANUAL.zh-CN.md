# 黎明岛 / Dawn Island — 运维交接手册（总手册）

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

---

## 0. 按接手方使用本手册

| 你是… | 必读章节 | 目标 |
|-------|---------|------|
| **新 AI 会话** | §1 总原则 · §7 AI 操作纪律 · §5 内容模型 · §9 部署发布 · §11 故障排查 | 立即进入安全操作状态，遵守三步法与红线 |
| **人工运营者** | §4 环境 · §6 内容运营标准流程 · §8 Obsidian 库管理 · §9 部署发布 | 日常增改内容、发布上线 |
| **AI 自动化运营** | §7 全部 · §8 库管理 · §6 质检清单 · §9 推送 | 批量生成/维护内容、安全同步推送 |
| **技术开发 / 升级** | §3 架构与接口 · §5 内容模型 · §10 扩容路线 · §9 部署 · §11 故障排查 | 改架构、换数据源、不破坏 URL/SEO |

---

## 1. 总原则（所有接手方遵守）

- **真源 = Obsidian 库** `E:\Obsidian\www.limingdao.com`，站点 `src/content/*` 由同步脚本生成，**不要直接长期手改 `src/content`**（会漂移）。
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

> **指南的两种形态（关键）**：经 `vault:sync` 生成的是 `kind: link` 快捷链接（仅 `title`+`url`）；12 篇 GEO 长文（`article` 型，含 `guideId`/`lang`/`category`/`accounts`/`seo`/`geo`）**直接在 `src/content/guides/{zh,en}/` 维护，不走 Obsidian 同步**。

字段样例（账号/分类/平台/news/guide）详见源文档 `USAGE.zh-CN.md` §4–§9 与 `src/content.config.ts`，本手册不再重复贴全量样例。

---

## 6. 内容运营标准流程（人工 / AI 运营）

> **真源是 Obsidian 库**，日常不要直接手改 `src/content`。

### 6.1 新增
1. Obsidian 对应文件夹（`Accounts`/`Categories`/`Platforms`/`News`/`Guides`）用模板建卡。
2. 填控制字段 `type` + `publish: true`（账号另加 `status: approved`）+ 全部业务字段（样例见 §5 与源文档）。
3. `npm run vault:sync` 写回 `src/content`。
4. `npm run build` 验证（Zod 拦截错误）。
5. `git push` → Vercel 部署。

### 6.2 修改
改库中卡 → 重跑 `vault:sync` + `npm run build` + `git push`。

### 6.3 删除 / 下线
- **软下线**：`publish: false` → `vault:sync` 后站点移除（URL 404、sitemap 剔除），卡留库可恢复。
- **硬删除**：删卡 → 重 `vault:sync`（站点 `.md` 被移除）。删除前确认无其它指南 `accounts:` 引用它。

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

### 7.3 Obsidian 卡控制字段（AI 生成卡必须带）
同步脚本按这些字段决定是否发布；写入站点时**被剥离**（站点 schema 无此字段）：

| 类型 | 发布条件 |
|------|---------|
| account | `type: account` + `status: approved` + `publish: true` |
| category / platform / news / guide | `type: <对应>` + `publish: true` |

> 同步脚本**仅对 account 校验 `status: approved`**；其余类型只需 `publish: true`。AI 生成卡务必填满必填项，否则 sync 跳过并报警（不静默发布残缺数据）。

### 7.4 记忆与记录
- 落盘后追加 `.workbuddy/memory/YYYY-MM-DD.md`（项目日志）。
- 跨项目用户偏好写 `~/.workbuddy/MEMORY.md`。
- 用户要求「记录/总结」的内容**必须落人工可看文档**（如仓库根 `.md`），不能只存 agent 记忆。

---

## 8. Obsidian 库管理教程（把库当内容数据库）

库路径：`E:\Obsidian\www.limingdao.com`。目录分层：`Raw/`(原始资料,勿改) · `Inbox/`(待处理) · `Accounts/` · `Categories/` · `Platforms/` · `News/` · `Guides/` · `SEO/` · `Comparisons/` · `Prompts/` · `Sponsors/` · `Templates/` · `Dashboards/` · `Logs/` · `00_System/`(发布规则,含 `INGEST_PROMPT.md`)。

### 8.1 日常流水线（入库）
`Raw/` → `Inbox/` → Claudian 按 `00_System/INGEST_PROMPT.md` 处理 → 生成/更新 `Accounts/{slug}.md` → 人工 QA（领域/平台/指标/seo/geo/重复）→ 置 `publish: true` → `npm run vault:sync`。

### 8.2 各类型卡 Properties 对照（控制字段库侧，sync 时剥离）

| 类型 | 控制字段 | 必填业务字段 | 可选业务字段 |
|------|---------|-------------|-------------|
| account | `type:account`+`status:approved`+`publish:true` | `slug`,`profileUrl`,`name{en,zh}`,`tagline{en,zh}`,`description{en,zh}` | `avatar`,`platform`,`platformId`,`verified`,`categories[]`,`tags[]`,`contentStyle[]`,`monetization`,`featured`,`followerCount`,`avgEngagement`,`contentFrequency`,`growthRate`,`publishedAt`,`updatedAt`,`seo`,`geo` |
| category | `type:category`+`publish:true` | `slug`,`name{en,zh}`,`description{en,zh}` | `icon`,`seo`,`geo` |
| platform | `type:platform`+`publish:true` | `slug`,`name{en,zh}`,`description{en,zh}` | `icon`,`baseUrl`,`type` |
| news | `type:news`+`publish:true` | `slug`,`title{en,zh}`,`url` | `summary{en,zh}`,`order`,`date` |
| guide | `type:guide`+`publish:true` | `slug`,`title{en,zh}`,`url` | `summary{en,zh}`,`order` |

### 8.3 模板 / 发布闸门 / 去重
- **Templates**：在 `Templates/` 放 5 类卡模板（含全部控制+必填字段），新建即套用，保证不漏 `publish`、账号不漏 `status: approved`。
- **发布闸门**：`publish: false` = 留库不发布（草稿/待审）；账号另需 `status: approved`。软下线改 `publish:false` 重 sync 即可。
- **去重/slug**：同步以 `slug` 为唯一键，缺省用 `slugify(name.en)` 推导；同 slug 两卡互相覆盖，新增前先搜索库确认无重名。

### 8.4 ⚠️ GEO 关键约束：Cloudflare 不得重新托管 robots.txt（极重要）
线上 `robots.txt` 必须放行 AI 爬虫（GPTBot/ClaudeBot/Google-Extended/CCBot/Bytespider/Applebot/PerplexityBot/Bingbot），否则 GEO 不成立。
- **现状（2026-08-01）**：Cloudflare 控制台的「托管 robots.txt（Managed Content Signals）」开关已**关闭**，线上返回仓库版 `public/robots.txt`（含全部 AI bot `Allow` + `Content-Signal: search=yes, ai-train=no, use=reference`）。
- **交接红线**：**任何人/任何会话都不得在 Cloudflare 后台重新打开「托管 robots.txt」**，否则会覆盖仓库版、重新屏蔽 AI 爬虫，GEO 抓取断链。如误开，仓库版不会生效，需立即关闭。
- 仓库 `public/robots.txt` 已是正确兜底；如需改爬虫策略，改仓库文件并 push，而非在 Cloudflare 开托管。

### 8.5 双向同步说明
- `vault:seed`：**站点 → 库**，一次性引导（把 `src/content` 导入库）。
- `vault:sync`：**库 → 站点**，日常发布。
- 二者**非持续双向**；直接改 `src/content` 库不会反向更新——**以库为唯一真源**。
- `src/content/.obsidian` 已被 `.gitignore` 忽略，勿提交库配置。

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
| **0–1,000**（当前） | 无 | Markdown + Obsidian + 静态构建，保持现状。可接 Pagefind 客户端检索 | 否 |
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
- [ ] Obsidian 库 `E:\Obsidian\www.limingdao.com` 可访问；`npm run vault:sync` 能跑
- [ ] GitHub `main` 推送凭据可用（wincred，见 §9.3）
- [ ] Vercel 项目归属与部署权限确认

**内容接手**
- [ ] 理解真源=Obsidian、库→站点单向同步
- [ ] 掌握 5 类卡字段表与发布闸门（§8.2–8.3）
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
npm run vault:seed   # src/content → Obsidian 库（一次性引导）
npm run vault:sync   # Obsidian 已发布卡 → src/content

# 推送（Windows wincred，见 §9.3）
git -c credential.helper= -c credential.helper=wincred push origin main

# 实抓验证（GEO/SEO）
curl -s https://www.limingdao.com/robots.txt
curl -s https://www.limingdao.com/llms.txt
curl -s https://www.limingdao.com/zh | grep -oE 'hreflang=|og:image|application/ld+json'
```

---

> **文档维护约定**：本手册为交接总入口，与四份源文档（`USAGE.zh-CN.md`/`OBSIDIAN_WORKFLOW.zh-CN.md`/`AI_OPERATIONS.zh-CN.md`/`UPGRADE.zh-CN.md`）共存。重大变更（架构升级、GEO 策略调整、robots/Cloudflare 约束变动）须同步更新本手册对应章节与项目记忆 `.workbuddy/memory/YYYY-MM-DD.md`。

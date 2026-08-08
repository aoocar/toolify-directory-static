# 黎明岛 GSC 收录跟踪与关键词校准手册

> **用途**：为「持续跟进 GSC 收录数据、校准关键词清单」提供标准操作流程（SOP）。
> 配套脚本：`scripts/gsc-keyword-map.py`（生成关键词基线）、`scripts/gsc-audit.py`（GSC 数据 vs 基线对比审计）。
> 基线清单：`gsc/keyword-map.csv`（由脚本生成，**勿手改**，改内容后重新运行脚本覆盖）。

---

## 0. 这套东西解决什么问题

黎明岛是纯 GEO/SEO 静态站，优化效果只能靠搜索引擎/AI 引擎的收录与流量数据来验证。本 SOP 把「数据 → 洞察 → 动作」闭环化：

```
每月固定节奏
  ① 生成关键词基线（gsc-keyword-map.py）
  ② 从 GSC 导出查询/网页数据
  ③ 跑审计（gsc-audit.py）→ 得到「有流量但未覆盖」清单
  ④ 人工判断：哪些词值得补关键词 / 补内容 → 走三步法确认后落内容
  ⑤ 记录到 OPS_MANUAL §16 变更记录
```

---

## 1. 生成关键词基线清单

```bash
python3 scripts/gsc-keyword-map.py
```

- 自动扫描 `src/content/` 的 **categories（领域）/ guides（指南）/ accounts（账号）/ tools（工具）**，
  提取每个实体的 `primary_keyword` + `secondary_keywords`，拼上落地 URL。
- 输出 `gsc/keyword-map.csv`（UTF-8 with BOM，Excel 直接打开）。
- **每次新增/修改内容后，都应重跑一次**，保持基线与站点一致。
- 当前基线规模（2026-08-08）：1291 条（category 18 / guide 20 / account 198 / tool 1055）。

---

## 2. 从 GSC 导出数据

### 2A. 自动方式（推荐，已固化流水线）

CNB CI 已配置 **crontab 定时任务**（`.cnb.yml` → `main` → `crontab: 30 2 1 * *`），每月 1 日 02:30 自动执行：

```
导出 GSC 数据（scripts/gsc-export.py，服务账号密钥由密钥仓库 imports 注入）
  → 重新生成关键词基线（scripts/gsc-keyword-map.py）
  → 跑审计（scripts/gsc-audit.py）
  → 提交并推送 CNB main（gsc/export/*.csv + gsc/audit-report.md + gsc/uncovered-queries.csv）
  → push 事件自动触发 sync-to-github 同步到生产仓库
```

- 全程**无需手动导出**；数据与报告自动入库留档。
- 手动触发一次：在 CNB 流水线页面用 `api_trigger`（`gsc-monthly-export-audit`）跑一次即可，或本地：

```bash
# 本地调试（需服务账号 json）：
python3 scripts/gsc-export.py --sa-file /path/to/sa.json --days 28 --site limingdao
```

### 2B. 手动方式（备用）

1. 登录 [Google Search Console](https://search.google.com/search-console)，选择资源 `limingdao.com`（域资源）。
2. 左侧「**效果**」（Performance）：
   - 日期范围：**最近 28 天**（日常节奏）或 90 天（季度趋势）。
   - **维度切到「查询」**，右上角「导出」→ CSV，得到 `queries.csv`（列：查询/点击/展示/点击率/平均排名）。
   - **维度切到「网页」**，再导一份 `pages.csv`，用于收录/索引体检。
3. 把 CSV 放到 `gsc/export/` 目录。

> 服务账号已授权：`aoobee-seo-bot@gen-lang-client-0803005687.iam.gserviceaccount.com`（GSC 完整权限，2026-08-08 由大强在 GSC 后台添加）。

---

## 3. 跑审计

```bash
python3 scripts/gsc-audit.py --queries gsc/export/queries.csv [--pages gsc/export/pages.csv]
```

输出两份文件（可入库留档）：
- `gsc/audit-report.md` — 校准建议报告：
  - **健康度概览**（总查询/点击/展示、覆盖情况）；
  - **有流量但关键词清单未覆盖**（校准重点，按展示降序）；
  - **清单已覆盖但 GSC 无数据**（待观察，多半是未收录或低量）。
- `gsc/uncovered-queries.csv` — 未覆盖词明细，可直接用于后续内容选题。

---

## 4. 如何「校准关键词清单」

`gsc/uncovered-queries.csv` 里出现的词 = 用户真实在搜、但我们页面没有针对性覆盖的词。动作分三档：

| 情况 | 动作 | 落点 |
|---|---|---|
| 与已有页面强相关 | 把该词补进对应 category/account/guide 的 `secondary_keywords` | 编辑 `src/content/**/*.md` 的 `seo.secondary_keywords` |
| 值得单独做内容 | 新增指南（Article）或补充账号 | 新建 `src/content/guides/zh/*.md`（+en） |
| 与站点定位无关 / 低相关 | 忽略（不追） | — |

> ⚠️ **红线**：任何内容修改/新增/删除都走 OPS_MANUAL 三步法——先提方案、等确认、再动手；不编造数据。

---

## 5. 收录/索引体检（每轮顺带做）

- 打开 GSC「**索引编制**」报告，确认「已编入索引的网页」趋势在增长（工具页批量收录后应有明显爬坡）。
- 「**网页**」导出的 `pages.csv`：找「展示>0 但平均排名>50」的长尾页，判断是否需要内链加权。
- 「**站点地图**」页确认 `sitemap-index.xml` 状态为「成功」，必要时删除重提触发重新抓取。
- 新站工具页（2100+）上线初期，重点看 `/zh/tools/*` 的收录与点击趋势。

---

## 6. 定期节奏建议

| 周期 | 动作 |
|---|---|
| 每周 | 顺带瞄一眼 GSC「效果」总览（点击/展示/排名是否有异常波动） |
| 每月 | **自动**（每月 1 日 02:30 crontab 已跑完整导出+审计+AI 可见性复测，数据与报告自动入库）；到点只需查看 `gsc/audit-report.md` + `gsc/uncovered-queries.csv` + `geo/monthly/ai-visibility-YYYY-MM.md`，做人工决策 |
| 每季度 | 90 天数据 + 索引编制趋势 + sitemap 健康复核，写入 OPS_MANUAL §16 |

---

## 7. AI 可见性月度复测（随 GSC 审计一起跑）

> **背景**：2026-08-08 首期基线——Common Crawl 最近 3 批次对本站新站核心路径**全部 0 覆盖**（AI 可见性空白期）；
> 360 品牌词官网已排第 1，必应被歌手「黎明」占榜。需每月复测，**目标 2 个月内 CC 覆盖新站 ≥ 1 批次**。

crontab 月度任务（`gsc-monthly-export-audit`）已含 `ai-visibility` stage，自动执行：

```bash
python3 scripts/check_ai_visibility.py
```

输出与判定：
- **Common Crawl 覆盖计数**：最近 3 批次对 `/zh` `/en` `/tools` `/guides` `/accounts` `/services` `/llms.txt` 的抓取记录数；
- **搜索引擎品牌词露出**：360（黎明岛/黎明岛 创作者/site:）与必应（黎明岛/limingdao）是否露出官网；
- 结果落 `geo/monthly/ai-visibility-YYYY-MM.md` 留档，用于月度趋势对比；
- 首期基线见 `geo/AI_VISIBILITY_BASELINE.zh-CN.md`，配套 SOP 见 `geo/AI_可见性基线SOP.md`。

---

## 7. 配套命令速查

```bash
# 自动导出 GSC 数据（crontab 已固化，可手动/本地跑）
python3 scripts/gsc-export.py --days 28 --site limingdao   # 流水线内用（密钥来自 imports）
python3 scripts/gsc-export.py --sa-file /path/to/sa.json --days 28 --site limingdao  # 本地调试

# 重新生成关键词基线（每次内容更新后跑）
python3 scripts/gsc-keyword-map.py

# 审计
python3 scripts/gsc-audit.py --queries gsc/export/queries.csv --pages gsc/export/pages.csv

# 线上体检（GEO 三件套不回退）
curl -s https://www.limingdao.com/robots.txt | grep -E 'User-agent|Sitemap'
curl -s -o /dev/null -w '%{http_code}\n' https://www.limingdao.com/llms.txt
curl -s -o /dev/null -w '%{http_code}\n' https://www.limingdao.com/sitemap-index.xml
```

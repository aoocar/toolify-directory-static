# 黎明岛品牌 AI 可见性基线 — 标准操作流程（SOP）

> **用途**：为「黎明岛自身品牌」的 GEO 可见性提供**可量化、可复盘**的月度基线调研流程。
> 配套文件：`geo/brand-questions.md`（10 个核心问题）、`scripts/ai-visibility-baseline.py`（调研脚本）。
> 报告输出：`geo/ai-visibility-report.md`（评分表 + 判定明细 + 结论动作）、`geo/ai-visibility-baseline.csv`（结构化基线数据）。

---

## 0. 这套东西解决什么问题

GEO（生成式引擎优化）的核心指标是「品牌被 AI 引用/推荐的比率」。GSC 只能看传统搜索数据，看不到 AI 引擎的可见性。本 SOP 用「10 个高价值问题 × 6 大模型」建立品牌 AI 可见性基线，每月复盘变化：

```
每月固定节奏
  ① 对 10 个核心问题 × 6 大模型逐个提问
  ② 判定档位：🟢 正面推荐 / 🟡 中立提及 / 🔴 负面 / ⚫ 未提及
  ③ 对比上月基线 → 升档/持平/降档/连续未提及
  ④ 按动作规则优化内容与信源
  ⑤ 记录到 OPS_MANUAL §16 变更记录
```

---

## 1. 运行基线调研

### 方式 A：CNB AI 网关（默认，零配置）

```bash
python3 scripts/ai-visibility-baseline.py
```

- 默认跑 10 问题 × 6 模型（DeepSeek / Qwen / Kimi / Doubao / Ernie / Yuanbao）。
- 通过 CNB AI 网关（`cnb ai ai-chat-completions`）提问，需在 CNB 环境内运行。
- 每完成一条即追加写 CSV，中断不丢进度。

### 方式 B：接入真实模型 API（推荐正式使用）

CNB 网关当前为统一路由（代理身份），如需真实验证豆包/文心/Kimi/通义/元宝的实际回答：

```bash
python3 scripts/ai-visibility-baseline.py \
  --provider external \
  --endpoint https://your-model-endpoint/v1/chat/completions \
  --api-key <YOUR_KEY> \
  --model qwen-max
```

逐个模型配置跑一遍，替换代理结果即可。**建议在获得各模型 API Key 后执行一次正式基线。**

### 方式 C：从已有 CSV 重生成报告（不调模型）

```bash
python3 scripts/ai-visibility-baseline.py --regen
```

---

## 2. 判定标准

| 档位 | 判定 |
|---|---|
| 🟢 正面推荐 | 明确提到 limingdao / 黎明岛 / Dawn Island 并给出正面评价或推荐 |
| 🟡 中立提及 | 提到品牌但无推荐（如仅列出域名、出现在候选列表） |
| 🔴 负面 | 提到品牌但评价负面 |
| ⚫ 未提及 | 回答中完全没有品牌关键词 |

> 品牌命中关键词：`limingdao` / `黎明岛` / `dawn island` / `dawnisland`。

---

## 3. 月度复盘

1. 重跑基线（方式 A 或 B）。
2. 打开 `geo/ai-visibility-report.md` 对比上月评分总览。
3. 按动作规则执行：

| 变化 | 动作 |
|---|---|
| 升档（未提及→提及/正面） | 强化对应内容，扩展关联问题 |
| 持平（仍是正面/中立） | 补信源、加场景细节 |
| 降档 | 排查内容是否过时、竞品是否加码 |
| 连续 2 个月未提及 | 重点重写该问题对应内容（按 GEO 四要素） |

---

## 4. 核心问题清单维护

- 问题清单在 `geo/brand-questions.md`（中文表 + 英文表）。
- 中文表格式：`| # | 问题 | 对应落地页/内容 | 目标档位 |`
- 修改后重新运行脚本即生效。
- 问题应保持「客户最常问 + 直接影响决策」，围绕黎明岛能提供的价值（AI 学习、工具导航、自媒体运营、垂直领域创作者目录、GEO 服务）。

---

## 5. 配套命令速查

```bash
# 跑完整基线（10 问题 × 6 模型）
python3 scripts/ai-visibility-baseline.py

# 只跑指定模型（如只跑 DeepSeek）
python3 scripts/ai-visibility-baseline.py --models deepseek

# 只生成骨架不调模型（验证脚本）
python3 scripts/ai-visibility-baseline.py --dry-run

# 从已有 CSV 重生成报告
python3 scripts/ai-visibility-baseline.py --regen

# 接入外部模型 API
python3 scripts/ai-visibility-baseline.py --provider external --endpoint <URL> --api-key <KEY> --model <NAME>

# 补充检测：大模型训练语料（Common Crawl）对本站新站的覆盖计数
python3 scripts/check_ai_visibility.py
```

> 💡 **为什么 AI 全部「未提及」？** 根本原因之一：新站页面尚未进入大模型训练语料。用
> `scripts/check_ai_visibility.py` 可实测 Common Crawl 最近批次对 `/zh` `/en` `/tools` `/guides`
> `/accounts` `/services` `/llms.txt` 的覆盖情况（首期基线为 0），详见
> `geo/AI_VISIBILITY_BASELINE.zh-CN.md`。语料覆盖是「被 AI 引用」的前提，应作为每月基线的前置检查。

---

## 6. 首次基线结果（2026-08-08）

- 10 问题 × 6 模型 = 60 条，**全部「未提及」（60/60）**。
- 含义：黎明岛在 AI 引擎的可见性基线为 0，符合新站预期，也说明 GEO 内容优化空间巨大。
- 重点突破口（按问题热度排序）：
  1. **AI 工具导航** — 站点已有 `/zh/tools`（1055 工具），是最可能被 AI 引用的内容资产；
  2. **AI 学习博主** — 已有 20 篇双语指南覆盖；
  3. **GEO 落地** — 已有 2 篇 GEO 指南 + 服务页，可直接强化品牌曝光；
  4. **垂直领域（大学新生/装修/家电/银发）** — 已有 18 篇指南覆盖，需通过权威信源与外部一致性提升被引率。

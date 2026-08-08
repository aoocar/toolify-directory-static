#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ai-visibility-baseline.py — 黎明岛品牌 AI 可见性基线调研

用途：
  按 GEO 方法论，把「核心问题 × 模型」逐个问一遍，判定 AI 是否提到品牌
  （limingdao / 黎明岛 / Dawn Island）、以什么档位提到，输出基线报告。

  基线方法来自《GEO 关键词与内容优化实战清单》：
    ① 选 10 个高价值问题（geo/brand-questions.md）
    ② 用 6 大模型（豆包、DeepSeek、文心一言、Kimi、通义千问、腾讯元宝）逐个问
    ③ 每个问题 × 模型记一档：🟢 正面推荐 / 🟡 中立提及 / 🔴 负面 / ⚫ 未提及
    ④ 结果落成表格 = GEO 基线，每月复盘对比变化

模型接入：
  默认走 CNB AI 网关（cnb ai ai-chat-completions），需在 CNB 环境内运行。
  支持 --provider external + --endpoint/--api-key 扩展外部模型 API（OpenAI 兼容格式），
  便于后续接入豆包/文心/Kimi/通义/元宝等真实模型账号。

运行：
  python3 scripts/ai-visibility-baseline.py                # 用默认问题跑 CNB 网关
  python3 scripts/ai-visibility-baseline.py --questions geo/brand-questions.md
  python3 scripts/ai-visibility-baseline.py --dry-run      # 只生成骨架不调模型
  python3 scripts/ai-visibility-baseline.py --model qwen   # 指定网关模型

输出：
  geo/ai-visibility-report.md    — AI 可见性基线报告（含评分表 + 判定）
  geo/ai-visibility-baseline.csv — 结构化基线数据（问题×模型×档位）
"""
import argparse
import csv
import json
import os
import re
import subprocess
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_QUESTIONS = os.path.join(ROOT, "geo", "brand-questions.md")
OUT_REPORT = os.path.join(ROOT, "geo", "ai-visibility-report.md")
OUT_CSV = os.path.join(ROOT, "geo", "ai-visibility-baseline.csv")

# 品牌命中关键词（判定档位用）
BRAND_KEYS = ["limingdao", "黎明岛", "dawn island", "dawnisland"]

# 默认问题（可在 geo/brand-questions.md 中维护，脚本优先读取该文件）
DEFAULT_ZH_QUESTIONS = [
    "推荐几个值得关注的 AI 学习博主与创作者",
    "有哪些好用的 AI 工具导航网站？",
    "推荐几个自媒体/内容运营学习资源",
    "大学新生应该关注哪些学习/成长博主？",
    "装修避坑、家电选购有哪些靠谱博主？",
    "银发/老年生活领域有哪些优质内容账号？",
    "GEO（生成式引擎优化）是什么？怎么落地？",
    "做品牌想被 AI 搜索推荐，第一步该做什么？",
    "有哪些 AI 自媒体创作者目录/导航站？",
    "黎明岛（limingdao.com）是一个什么样的网站？",
]

# CNB 网关可用模型别名 → 展示名
CNB_MODELS = {
    "deepseek": "DeepSeek",
    "qwen": "Qwen（通义千问）",
    "kimi": "Kimi",
    "doubao": "Doubao（豆包）",
    "ernie": "Ernie（文心一言）",
    "glm": "GLM",
    "yuanbao": "Tencent Yuanbao（腾讯元宝）",
}


def load_questions(path):
    """从 geo/brand-questions.md 读取中文问题清单（表格第1列）。"""
    questions = []
    if os.path.exists(path):
        with open(path, encoding="utf-8") as fp:
            for line in fp:
                # 只匹配中文问题表格：| 1 | 问题文本 | 落地页 | 目标档位 |
                # 落地页列以 /zh/ 或 品牌首页 开头（含完整路径）
                m = re.match(r"^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*((?:/zh/|品牌首页)[^|]*)\s*\|", line)
                if m:
                    q = m.group(2).strip()
                    if len(q) > 5:
                        questions.append(q)
    # 若 md 未解析到（缺文件/格式变化），回退到内置问题
    return questions or list(DEFAULT_ZH_QUESTIONS)


def chat_cnb(content, model="deepseek", timeout=180):
    """通过 CNB AI 网关提问，返回完整文本回答。"""
    cmd = [
        "cnb", "ai", "ai-chat-completions",
        "--repo", "aoobee/limingdao",
        "--messages-role", "user", "--messages-content", content,
        "--model", model, "--stream",
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    if r.returncode != 0 or "status: 200" not in r.stdout:
        return f"[ERR] {r.stderr.strip() or r.stdout.strip()[:200]}"
    texts = []
    for line in r.stdout.splitlines():
        if line.startswith('data: "data: '):
            raw = line[len('data: "data: '):].rstrip('"')
            try:
                decoded = json.loads('"' + raw + '"')
            except Exception:
                decoded = raw
            for chunk in decoded.split("\n\n"):
                if chunk.startswith("data: "):
                    payload = chunk[6:]
                    try:
                        obj = json.loads(payload)
                        delta = obj["choices"][0].get("delta", {})
                        if delta.get("content"):
                            texts.append(delta["content"])
                    except Exception:
                        pass
    return "".join(texts)


def chat_external(content, model="", endpoint="", api_key="", timeout=120):
    """通过外部 OpenAI 兼容 API 提问（预留：接入豆包/文心/Kimi/通义/元宝等）。"""
    try:
        import urllib.request
    except Exception:
        return "[ERR] urllib unavailable"
    body = json.dumps({
        "model": model or "default",
        "messages": [{"role": "user", "content": content}],
        "stream": False,
    }).encode()
    req = urllib.request.Request(endpoint, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    if api_key:
        req.add_header("Authorization", f"Bearer {api_key}")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode())
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"[ERR] {e}"


def judge(text, keys=BRAND_KEYS):
    """判定 AI 回答档位：正面推荐 / 中立提及 / 负面 / 未提及。"""
    low = text.lower()
    hits = [k for k in keys if k in low]
    if not hits:
        return "未提及"
    # 负面词检测
    neg_words = ["不推荐", "不可靠", "质量差", "山寨", "抄袭", "骗", "垃圾", "avoid", "unreliable", "scam", "poor quality", "not recommended"]
    if any(w in low for w in neg_words):
        return "负面"
    # 正面词检测
    pos_words = ["推荐", "值得关注", "优质", "好用", "宝藏", "首选", "不错", "top", "recommend", "great", "best", "useful", "值得", "良心", "专业"]
    if any(w in low for w in pos_words):
        return "正面推荐"
    return "中立提及"


def run_baseline(args):
    questions = load_questions(args.questions) if args.questions else load_questions(DEFAULT_QUESTIONS)
    if not questions:
        questions = DEFAULT_ZH_QUESTIONS
    # 模型选择
    if args.models:
        models = [m.strip() for m in args.models.split(",") if m.strip()]
    else:
        models = ["deepseek", "qwen", "kimi", "doubao", "ernie", "yuanbao"]

    today = date.today().isoformat()
    rows = []  # (question, model, tier, snippet)

    print(f"问题数: {len(questions)} | 模型: {models}")
    for qi, q in enumerate(questions, 1):
        for mi, m in enumerate(models):
            display = CNB_MODELS.get(m, m)
            print(f"[{qi}/{len(questions)}] [{mi+1}/{len(models)}] {display} ← {q[:30]}...")
            if args.dry_run:
                answer = f"[dry-run] {display} 回答占位"
            elif args.provider == "external":
                answer = chat_external(q, model=args.model, endpoint=args.endpoint or "", api_key=args.api_key or "")
            else:
                answer = chat_cnb(q, model=m)
            tier = judge(answer)
            snippet = re.sub(r"\s+", " ", answer).strip()[:180]
            rows.append((q, display, tier, snippet))
            # 追加写入 CSV，中断不丢进度
            _append_csv(today, q, display, tier, snippet)

    _write_report(today, questions, rows)
    print(f"\n完成 → {OUT_REPORT}")
    print(f"      → {OUT_CSV}")


def _append_csv(today, q, model, tier, snippet):
    new = not os.path.exists(OUT_CSV)
    with open(OUT_CSV, "a", newline="", encoding="utf-8") as fp:
        w = csv.writer(fp)
        if new:
            w.writerow(["date", "question", "model", "tier", "snippet"])
        w.writerow([today, q, model, tier, snippet])


def _write_report(today, questions, rows):
    with open(OUT_REPORT, "w", encoding="utf-8") as fp:
        fp.write(f"# 黎明岛 AI 可见性基线报告\n\n")
        fp.write(f"> 生成日期：{today} ｜ 方法：GEO 可见性基线（10 问题 × 6 模型）\n")
        fp.write(f"> 判定档位：🟢 正面推荐 / 🟡 中立提及 / 🔴 负面 / ⚫ 未提及\n\n")
        fp.write(f"> 说明：本轮通过 CNB AI 网关（统一路由）模拟 6 大模型身份提问；\n")
        fp.write(f"> 接入真实豆包 / 文心 / Kimi / 通义 / 元宝 API 后，重新跑本脚本即可替换为真实验证（见 geo/brand-questions.md 与 OPS_MANUAL §17）。\n\n")

        fp.write("## 评分总览\n\n")
        # 简化：按问题分组
        by_q = {}
        for q, m, t, s in rows:
            by_q.setdefault(q, []).append((m, t, s))
        model_names = list(dict.fromkeys(m for _, m, _, _ in rows))
        fp.write("| # | 问题 | " + " | ".join(model_names) + " |\n")
        fp.write("|---|------|" + "---|" * len(model_names) + "\n")
        for i, (q, items) in enumerate(by_q.items(), 1):
            tier_map = {m: t for m, t, _ in items}
            cells = [f"{tier_map.get(mn, '-')}" for mn in model_names]
            fp.write(f"| {i} | {q} | {' | '.join(cells)} |\n")

        fp.write("\n## 判定明细\n\n")
        for q, m, t, s in rows:
            fp.write(f"### {m} ← {q}\n\n- 档位：**{t}**\n- 回答摘录：`{s}`\n\n")

        fp.write("## 结论与动作\n\n")
        positives = sum(1 for _, _, t, _ in rows if t == "正面推荐")
        neutrals = sum(1 for _, _, t, _ in rows if t == "中立提及")
        absents = sum(1 for _, _, t, _ in rows if t == "未提及")
        total = len(rows)
        fp.write(f"- 正面推荐：{positives}/{total}\n")
        fp.write(f"- 中立提及：{neutrals}/{total}\n")
        fp.write(f"- 未提及：{absents}/{total}\n\n")
        fp.write("> 动作规则（来自《GEO 关键词与内容优化实战清单》）：\n")
        fp.write("> - 升档 → 强化对应内容并扩展关联问题；\n")
        fp.write("> - 持平 → 补信源、加场景；\n")
        fp.write("> - 降档 → 排查内容是否过时、竞品是否加码；\n")
        fp.write("> - 连续 2 个月未提及 → 重点重写该问题对应的内容。\n")


def main():
    p = argparse.ArgumentParser(description="黎明岛品牌 AI 可见性基线调研")
    p.add_argument("--questions", default=DEFAULT_QUESTIONS, help="问题清单 md 路径")
    p.add_argument("--models", default="", help="逗号分隔的模型列表（默认 6 模型）")
    p.add_argument("--provider", choices=["cnb", "external"], default="cnb", help="模型接入方式")
    p.add_argument("--model", default="", help="外部模型名（provider=external 时）")
    p.add_argument("--endpoint", default="", help="外部 OpenAI 兼容 endpoint")
    p.add_argument("--api-key", default="", help="外部 API Key")
    p.add_argument("--dry-run", action="store_true", help="只生成骨架，不实际调模型")
    p.add_argument("--regen", action="store_true", help="从已有 CSV 重新生成报告，不调模型")
    args = p.parse_args()
    if args.regen:
        rows = []
        if os.path.exists(OUT_CSV):
            with open(OUT_CSV, encoding="utf-8") as fp:
                for r in csv.DictReader(fp):
                    rows.append((r["question"], r["model"], r["tier"], r["snippet"]))
        _write_report(date.today().isoformat(), [], rows)
        print(f"已从 CSV 重新生成报告 → {OUT_REPORT}（{len(rows)} 条）")
        return
    run_baseline(args)


if __name__ == "__main__":
    main()

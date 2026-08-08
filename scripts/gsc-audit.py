#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gsc-audit.py — GSC 收录/流量数据 与 关键词地图 对比审计

用途：
  把「GSC 导出的搜索效果数据」和「gsc/keyword-map.csv 基线关键词清单」做交叉对比，
  输出：
    1. 有流量但关键词清单里没有的词       → 需要校准（补关键词 / 补内容）
    2. 清单里声明了但 GSC 没数据（或没收录）的词 → 待观察（可能未收录/竞争高）
    3. GSC 数据健康度概览（收录页数、零展示词占比等）

GSC 导出准备（Search Console → 效果 → 日期范围选最近 28 天 / 90 天）：
  - 维度选「查询」，行数拉到最大（5000），右上角「导出」→ CSV 下载，文件名类似：
      queries.csv  （列：查询 / 点击 / 展示次数 / 点击率 / 平均排名）
  - 维度选「网页」导出一份 pages.csv 用于收录/索引体检：
      pages.csv   （列：网页 / 点击 / 展示次数 / 点击率 / 平均排名）

运行：
  python3 scripts/gsc-audit.py --queries gsc/export/queries.csv [--pages gsc/export/pages.csv]

输出：
  gsc/audit-report.md         — 校准建议报告（Markdown）
  gsc/uncovered-queries.csv   — 「有流量但未覆盖」词清单（可直接粘贴进 GSC 排除/补充研究）
"""
import argparse
import csv
import os
import re
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAP_CSV = os.path.join(ROOT, "gsc", "keyword-map.csv")
OUT_DIR = os.path.join(ROOT, "gsc")


def load_keyword_map(path):
    """读取 keyword-map.csv，返回 (覆盖词集合, 词->[url], 词->[type])。"""
    covered = set()
    word_url = {}
    word_type = {}
    with open(path, encoding="utf-8-sig") as fp:
        for row in csv.DictReader(fp):
            pk = (row.get("primary_keyword") or "").strip()
            sk = (row.get("secondary_keywords") or "").strip()
            url = row.get("url") or ""
            typ = row.get("type") or ""
            for w in [pk] + [x.strip() for x in sk.split(";") if x.strip()]:
                w = w.strip()
                if not w:
                    continue
                # 归一化：小写、去空白
                key = re.sub(r"\s+", " ", w.lower()).strip()
                covered.add(key)
                word_url.setdefault(key, set()).add(url)
                word_type.setdefault(key, set()).add(typ)
    return covered, word_url, word_type


def read_queries(path):
    rows = []
    with open(path, encoding="utf-8-sig") as fp:
        for row in csv.DictReader(fp):
            rows.append(row)
    return rows


def norm(w):
    return re.sub(r"\s+", " ", (w or "").lower()).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--queries", required=True, help="GSC 导出的 queries CSV")
    ap.add_argument("--pages", default=None, help="GSC 导出的 pages CSV（可选）")
    args = ap.parse_args()

    covered, word_url, word_type = load_keyword_map(MAP_CSV)
    queries = read_queries(args.queries)
    if not queries:
        sys.exit("queries CSV 为空")

    # 列名兼容：英文/中文
    def col(row, *names):
        for n in names:
            if n in row:
                return row[n]
        return ""

    uncovered = []   # 有流量但清单没有
    covered_found = []  # 清单有且 GSC 有数据
    covered_missing = []  # 清单有但 GSC 无数据（可能未收录/低量）

    for q in queries:
        query = col(q, "查询", "Queries", "query")
        clicks = col(q, "点击", "Clicks", "clicks")
        impr = col(q, "展示次数", "Impressions", "impressions")
        ctr = col(q, "点击率", "CTR", "ctr")
        pos = col(q, "平均排名", "Position", "position")
        try:
            clicks_i = int(float(clicks))
            impr_i = int(float(impr))
        except Exception:
            clicks_i, impr_i = 0, 0
        key = norm(query)
        rec = {
            "query": query,
            "clicks": clicks_i,
            "impressions": impr_i,
            "ctr": ctr,
            "position": pos,
        }
        if key in covered:
            covered_found.append((key, rec))
        else:
            uncovered.append((key, rec))

    # 清单里声明了但 GSC 完全没数据的词
    query_keys = {norm(q) for q in [col(x, "查询", "Queries", "query") for x in queries]}
    for w in covered:
        if w not in query_keys:
            covered_missing.append(w)

    # 排序：uncovered 按 展示次数 降序
    uncovered.sort(key=lambda x: -x[1]["impressions"])

    # 生成报告
    report = []
    report.append("# GSC 关键词审计报告\n")
    report.append(f"> 生成时间：{__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M')}")
    report.append(f"> 数据源：GSC 导出 queries 共 {len(queries)} 条；关键词地图基线 {len(covered)} 个词（覆盖 {len(word_url)} 条 URL）\n")

    report.append("## 一、健康度概览\n")
    total_clicks = sum(x[1]["clicks"] for x in covered_found + uncovered)
    total_impr = sum(x[1]["impressions"] for x in covered_found + uncovered)
    report.append(f"| 指标 | 数值 |")
    report.append(f"|---|---|")
    report.append(f"| GSC 总查询数 | {len(queries)} |")
    report.append(f"| 总点击 | {total_clicks} |")
    report.append(f"| 总展示 | {total_impr} |")
    report.append(f"| 清单已覆盖且 GSC 有数据 | {len(covered_found)} |")
    report.append(f"| 清单已覆盖但 GSC 无数据（待观察） | {len(covered_missing)} |")
    report.append(f"| **有流量但清单未覆盖** | **{len(uncovered)}** |")
    report.append("")

    report.append("## 二、有流量但关键词清单未覆盖（校准重点）\n")
    if uncovered:
        report.append("| 查询 | 点击 | 展示 | 平均排名 | 建议 |")
        report.append("|---|---|---|---|---|")
        for key, rec in uncovered[:60]:
            suggestion = suggest_action(key, word_type)
            report.append(f"| {rec['query']} | {rec['clicks']} | {rec['impressions']} | {rec['position']} | {suggestion} |")
        if len(uncovered) > 60:
            report.append(f"\n> … 仅展示前 60 条，完整清单见 `uncovered-queries.csv`（共 {len(uncovered)} 条）。")
    else:
        report.append("无。所有 GSC 流量词均已在关键词清单中。")
    report.append("")

    report.append("## 三、清单已覆盖但 GSC 无数据（待观察，不必急）\n")
    if covered_missing:
        report.append(f"共 {len(covered_missing)} 个词。可能原因：新页面未收录、搜索量过低、或长尾词。建议等 2-4 周后再看，优先关注与已发布页面强相关的词。")
        report.append("\n示例：\n")
        for w in sorted(covered_missing)[:30]:
            urls = list(word_url.get(w, set()))[:2]
            report.append(f"- `{w}` → {', '.join(urls)}")
        if len(covered_missing) > 30:
            report.append(f"\n> … 共 {len(covered_missing)} 个，全部可在 gsc/keyword-map.csv 中按 primary_keyword 检索。")
    else:
        report.append("无。")
    report.append("")

    # 写 uncovered CSV
    os.makedirs(OUT_DIR, exist_ok=True)
    unc_path = os.path.join(OUT_DIR, "uncovered-queries.csv")
    with open(unc_path, "w", newline="", encoding="utf-8-sig") as fp:
        w = csv.writer(fp)
        w.writerow(["查询", "点击", "展示次数", "点击率", "平均排名"])
        for key, rec in uncovered:
            w.writerow([rec["query"], rec["clicks"], rec["impressions"], rec["ctr"], rec["position"]])

    report_path = os.path.join(OUT_DIR, "audit-report.md")
    with open(report_path, "w", encoding="utf-8") as fp:
        fp.write("\n".join(report))

    print(f"OK  审计完成：")
    print(f"    - 清单已覆盖且 GSC 有数据: {len(covered_found)}")
    print(f"    - 清单已覆盖但 GSC 无数据: {len(covered_missing)}")
    print(f"    - 有流量但清单未覆盖:      {len(uncovered)}")
    print(f"    - 报告: {report_path}")
    print(f"    - 未覆盖清单: {unc_path}")


def suggest_action(query, word_type):
    """给未覆盖词一个简单建议动作。"""
    ql = query.lower()
    if any(k in ql for k in ("ai ", "gpt", "chatgpt", "人工智能", "ai工具", "ai 工具")):
        return "评估是否补入 AI 工具/账号页关键词或新增指南"
    if any(k in ql for k in ("指南", "教程", "怎么", "如何", "推荐", "避坑", "清单", "路线")):
        return "适合新增/校准指南（Article）关键词"
    if any(k in ql for k in ("博主", "创作者", "up主", "账号", "达人")):
        return "适合补入账号/领域关键词"
    return "人工评估：低相关可忽略，高相关补关键词或内容"


if __name__ == "__main__":
    main()

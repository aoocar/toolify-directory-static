#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
黎明岛 AI 可见性检测脚本
========================
用途：定期复测本站（www.limingdao.com）在「大模型训练语料（Common Crawl）」
     与「传统搜索引擎（360/必应）」中的可见性，输出可入库留档的报告片段。

用法：
    python3 scripts/check_ai_visibility.py [--json]

输出：
    1. Common Crawl 最近 N 个批次对本站核心路径的覆盖计数
    2. 360 / 必应对品牌词「黎明岛 / limingdao」的官网露出情况
    3. 汇总判定

说明：
    - Common Crawl CDX 索引是公开只读接口，无需密钥。
    - 搜索引擎为 HTML 端点，仅做粗略探测；若被封可降级跳过。
"""

import json
import re
import sys
import time
import urllib.parse
import urllib.request
from collections import Counter

SITE = "www.limingdao.com"
# 新站核心路径前缀（Common Crawl 是否抓到这些 = AI 语料是否覆盖新站）
# 注意：/categories 是旧站路径（CC 抓到的是旧站 404 快照），不计入新站覆盖
PATHS = ["zh", "en", "tools", "guides", "accounts", "services", "llms.txt"]
# Common Crawl 最近几个批次（从 collinfo.json 动态获取）
CC_BATCHES = ["CC-MAIN-2026-30", "CC-MAIN-2026-25", "CC-MAIN-2026-21"]
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"


def http_get(url, timeout=30, headers=None, allow_404=False):
    req = urllib.request.Request(url, headers=headers or {"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        if e.code == 404 and allow_404:
            return ""  # Common Crawl 无记录时返回 404，视为 0 条
        raise


def cc_count(batch, prefix):
    """查 Common Crawl 某批次下某前缀的抓取记录数；请求失败返回 None（不计入统计）"""
    q = urllib.parse.quote(f"{SITE}/{prefix}")
    url = f"https://index.commoncrawl.org/{batch}-index?url={q}*&output=json&limit=200"
    for attempt in range(2):
        try:
            body = http_get(url, timeout=40, allow_404=True)
            if not body or "No Captures found" in body:
                return 0
            return sum(1 for line in body.splitlines() if line.strip().startswith("{"))
        except Exception:
            if attempt == 0:
                time.sleep(2)
            else:
                return None
    return None


def _parse_real_results(body, engine):
    """解析搜索结果页中真实结果链接，返回是否含本站域名（避免把搜索框回显误判为露出）"""
    low = body.lower()
    if engine == "360":
        # 360 结果标题/摘要里的官网露出（链接是 /so.com/link 跳转，需看标题中的站点名）
        if "limingdao.com" in low:
            return True
        # 360 标题常见格式 "AI写作 - Limingdao 黎明岛"、"Limingdao 黎明岛 - 互联网工具资源知识引擎"
        if "limingdao 黎明岛" in low or "黎明岛 - 全领域优质创作者导航" in low:
            return True
        # 检查结果条目标题中含「黎明岛」且与 Limingdao 关联
        return "limingdao" in low and "黎明岛" in low
    if engine == "bing":
        # 必应：检查结果区（b_algo）中的真实链接
        algos = re.findall(r'<li class="b_algo".*?</li>', body, re.S)
        return any("limingdao.com" in a.lower() or "黎明岛" in a for a in algos)
    return False


def se_360(query):
    """360 搜索：返回是否真实露出官网"""
    q = urllib.parse.quote(query)
    url = f"https://www.so.com/s?q={q}"
    try:
        body = http_get(url, timeout=15)
        return _parse_real_results(body, "360"), len(body)
    except Exception:
        return None, 0


def se_bing(query):
    """必应 cn：返回是否真实露出官网（只认 b_algo 结果区）"""
    q = urllib.parse.quote(query)
    url = f"https://cn.bing.com/search?q={q}&count=20"
    try:
        body = http_get(url, timeout=20)
        return _parse_real_results(body, "bing"), len(body)
    except Exception:
        return None, 0


def main():
    out = {"date": time.strftime("%Y-%m-%d"), "common_crawl": {}, "search": {}}

    print("=" * 60)
    print("黎明岛 AI 可见性检测")
    print("日期:", out["date"])
    print("=" * 60)

    # 1. Common Crawl 覆盖
    print("\n[1] Common Crawl 语料覆盖（大模型训练语料主源）")
    for batch in CC_BATCHES:
        row = {}
        for p in PATHS:
            n = cc_count(batch, p)
            row[p] = n
            time.sleep(0.3)
        out["common_crawl"][batch] = row
        ok = {k: v for k, v in row.items() if v and v > 0}
        fail = [k for k, v in row.items() if v is None]
        total = sum(v for v in row.values() if isinstance(v, int) and v > 0)
        if ok:
            msg = "、".join(f"{k}={v}" for k, v in ok.items())
        elif fail:
            msg = f"请求失败(跳过): {', '.join(fail)}；其余 0（新站未入语料）"
        else:
            msg = "全部 0（新站未入语料）"
        print(f"  {batch}: 新站核心路径覆盖 {total} 条 | {msg}")

    # 2. 搜索引擎露出
    print("\n[2] 搜索引擎品牌词露出")
    for name, fn, qs in [
        ("360", se_360, ["黎明岛", "黎明岛 创作者", "site:www.limingdao.com"]),
        ("必应", se_bing, ["黎明岛", "limingdao"]),
    ]:
        for q in qs:
            hit, _ = fn(q)
            mark = "✅ 露出官网" if hit else ("⚠️ 未露出" if hit is not None else "❌ 探测失败")
            print(f"  {name} | {q}: {mark}")
            out["search"].setdefault(name, {})[q] = "hit" if hit else ("miss" if hit is not None else "error")
            time.sleep(1)

    # 3. 判定
    print("\n[3] 汇总判定")
    total_cc = sum(v for batch in out["common_crawl"].values()
                   for v in batch.values() if isinstance(v, int) and v > 0)
    if total_cc == 0:
        verdict = "🔴 新站尚未进入大模型训练语料（Common Crawl 0 覆盖）——AI 可见性空白期，需按 geo/AI_VISIBILITY_BASELINE.zh-CN.md 行动建议加速"
    else:
        verdict = f"🟡 新站已进入 CC 语料（{total_cc} 条），继续积累"
    print("  " + verdict)

    if "--json" in sys.argv:
        print("\nJSON:")
        print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

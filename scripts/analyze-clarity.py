#!/usr/bin/env python3
"""分析 Clarity 真实导出数据（clarity/export/clarity-<ts>.json）"""
import json
import sys
from collections import Counter, defaultdict
from urllib.parse import urlparse

RAW = "clarity/export/clarity-20260809-093034.json"

def to_int(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return 0

def main():
    with open(RAW) as f:
        data = json.load(f)
    d = {i["metricName"]: i["information"] for i in data}

    print("# Clarity 真实数据深度分析\n")

    # ============ 1. Traffic 会话概览 ============
    t = d["Traffic"]
    hs = sum(to_int(r["totalSessionCount"]) for r in t)
    bs = sum(to_int(r["totalBotSessionCount"]) for r in t)
    du = sum(to_int(r["distinctUserCount"]) for r in t)
    print("## 1. Traffic 会话概览")
    print(f"- 数据行: {len(t)}")
    print(f"- 真人会话 totalSessionCount 合计: {hs}")
    print(f"- Bot 会话 totalBotSessionCount 合计: {bs}")
    print(f"- 独立用户 distinctUserCount 合计: {du}")
    print(f"- 有真人会话的页面数: {sum(1 for r in t if to_int(r['totalSessionCount'])>0)}")
    print(f"- 有 Bot 会话的页面数: {sum(1 for r in t if to_int(r['totalBotSessionCount'])>0)}")

    # 真人会话 TOP 页面
    human = [r for r in t if to_int(r["totalSessionCount"])>0]
    human.sort(key=lambda r: to_int(r["totalSessionCount"]), reverse=True)
    print("\n### 真人会话 TOP 15 页面")
    for r in human[:15]:
        print(f"  - {r['Url']}  | 真人会话={r['totalSessionCount']}  Bot={r['totalBotSessionCount']}  独立用户={r['distinctUserCount']}")

    # Source 维度
    src = Counter()
    for r in t:
        s = r.get("Source") or "(直接访问)"
        src[s] += to_int(r["totalSessionCount"])
    print("\n### 真人会话按 Source 来源分布")
    for s, c in src.most_common(20):
        print(f"  - {s}: {c}")

    # Bot 会话 TOP 页面
    bots = [r for r in t if to_int(r["totalBotSessionCount"])>0]
    bots.sort(key=lambda r: to_int(r["totalBotSessionCount"]), reverse=True)
    print("\n### Bot 会话 TOP 10 页面")
    for r in bots[:10]:
        print(f"  - {r['Url']}  | Bot={r['totalBotSessionCount']}  真人={r['totalSessionCount']}")

    # ============ 2. 用户体验指标 ============
    print("\n## 2. 用户体验 / 异常指标")
    for name in ["DeadClickCount", "ExcessiveScroll", "RageClickCount",
                 "QuickbackClick", "ScriptErrorCount", "ErrorClickCount"]:
        rows = d[name]
        s = sum(to_int(r["sessionsCount"]) for r in rows)
        pv = sum(to_int(r["pagesViews"]) for r in rows)
        st = sum(to_int(r["subTotal"]) for r in rows)
        nz = sum(1 for r in rows if to_int(r["sessionsCount"])>0)
        print(f"- {name}: 行数={len(rows)}, 异常行={nz}, sessions={s}, pageViews={pv}, 加权小计={st}")

    # ScrollDepth
    sd = d["ScrollDepth"]
    sdv = [r for r in sd if r.get("averageScrollDepth")]
    print(f"\n### ScrollDepth: 有值行 {len(sdv)}")

    # EngagementTime
    et = d["EngagementTime"]
    total_time = sum(to_int(r["totalTime"]) for r in et)
    active_time = sum(to_int(r["activeTime"]) for r in et)
    nz_et = [r for r in et if to_int(r["totalTime"])>0]
    nz_et.sort(key=lambda r: to_int(r["totalTime"]), reverse=True)
    print(f"### EngagementTime: 行数={len(et)}, totalTime 合计={total_time}, activeTime 合计={active_time}")
    print("TOP 10 互动时间页面:")
    for r in nz_et[:10]:
        print(f"  - {r['Url']}  | totalTime={r['totalTime']}  activeTime={r['activeTime']}")

    # ============ 3. 页面类型分布 ============
    print("\n## 3. URL 结构分析")
    human_urls = [r["Url"] for r in human]
    def classify(u):
        p = urlparse(u)
        path = p.path
        if "/en/" in path or path.startswith("/en") or "/en" == path:
            return "EN"
        if "/zh/" in path or path.startswith("/zh"):
            return "ZH"
        if path in ("", "/"):
            return "Home"
        return "Other"
    cls = Counter(classify(u) for u in human_urls)
    print("- 真人会话页面语言分布:", dict(cls))

    # 路径片段
    seg = Counter()
    for u in human_urls:
        parts = [x for x in urlparse(u).path.split("/") if x]
        if parts:
            seg[parts[0]] += 1
    print("- 真人会话 TOP 一级路径:", seg.most_common(10))

    return 0

if __name__ == "__main__":
    sys.exit(main())

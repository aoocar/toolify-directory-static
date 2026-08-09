#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
clarity-export.py — 从 Microsoft Clarity Data Export API 导出项目数据
====================================================================

用途：
    定时/手动导出 Microsoft Clarity 的会话与行为指标（真人/机器人会话、
    热门页面、来源、设备等），与 GSC（搜索侧）互补，形成「搜索 + 行为」双轨监测。

密钥注入（CNB 流水线）：
    imports:
      - https://cnb.cool/<org>/<secret-repo>/-/blob/main/limingdao-clarity-bot.yml
    该 yml 的字段会作为环境变量注入：CLARITY_API_TOKEN=xxx
    （请确认密钥仓库中文件名为 limingdao-clarity-bot.yml，内容为标准冒号 YAML：
       CLARITY_API_TOKEN: <token>  ）

本地运行（可选，供调试）：
    export CLARITY_API_TOKEN=<你的token>
    python3 scripts/clarity-export.py --numOfDays 3 --dimension1 URL --out-dir clarity/export

API 说明（微软官方文档《Clarity Data Export API》）：
    GET https://www.clarity.ms/export-data/api/v1/project-live-insights
    - 认证：Authorization: Bearer <JWT token>（项目内 Data Export 生成的 API Token）
    - 参数：numOfDays ∈ {1,2,3}；dimension1/2/3 ∈ {Browser,Device,Country/Region,
      OS,Source,Medium,Campaign,Channel,URL,...}
    - 配额：每项目每天最多 10 次请求；只能回溯最近 1~3 天；响应最多 1000 行不可分页。
    - 指标：Traffic（会话数/机器人会话数/独立用户）、Scroll Depth、Engagement Time、
      Dead Click Count、Rage Click Count 等。
    - 返回时间为 UTC。

输出：
    clarity/export/clarity-YYYYMMDD-HHMMSS.json  — 原始 JSON
    clarity/export/clarity-<dim>.csv            — 扁平化 CSV（便于审计）
    clarity/export/clarity-summary.json         — 汇总（每次运行覆盖，供流水线展示）
"""
import argparse
import csv
import datetime
import json
import os
import sys
import urllib.parse
import urllib.request

API_BASE = "https://www.clarity.ms/export-data/api/v1/project-live-insights"

VALID_DIMS = {
    "Browser", "Device", "Country/Region", "OS", "Source", "Medium",
    "Campaign", "Channel", "URL", "Page Title", "Referrer URL",
}
VALID_METRICS = {
    "Scroll Depth", "Engagement Time", "Traffic", "Popular Pages",
    "Dead Click Count", "Excessive Scroll", "Rage Click Count",
    "Quickback Click", "Script Error Count", "Error Click Count",
}


def get_token():
    """从环境变量读取 Clarity API Token（CNB imports 注入 or 本地 export）。"""
    tok = os.environ.get("CLARITY_API_TOKEN", "").strip()
    if not tok:
        print("FATAL: 缺少 CLARITY_API_TOKEN（请确认流水线 imports 已注入密钥仓库 limingdao-clarity-bot.yml）")
        sys.exit(2)
    return tok


def fetch(num_of_days, dims):
    """调用 Clarity Data Export API，返回 (status, raw_json_str)。"""
    params = {"numOfDays": str(num_of_days)}
    for i, d in enumerate(dims, start=1):
        params[f"dimension{i}"] = d
    url = API_BASE + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {get_token()}",
        "Content-type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; Limingdao-ClarityExport/1.0; +https://www.limingdao.com)",
    })
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            return resp.status, body
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="replace")[:500]
        return e.code, f'{{"error": {json.dumps(detail)}, "http_code": {e.code}}}'
    except Exception as e:
        return -1, f'{{"error": {json.dumps(str(e))}}}'


def flatten(payload, dim):
    """把 API 返回的 metricName/information 结构扁平化为行。"""
    rows = []
    if not isinstance(payload, list):
        return rows
    for metric in payload:
        metric_name = metric.get("metricName", "")
        info_list = metric.get("information", []) or []
        for info in info_list:
            row = {"metric": metric_name}
            row.update(info)
            rows.append(row)
    return rows


def main():
    ap = argparse.ArgumentParser(description="Microsoft Clarity Data Export API 导出")
    ap.add_argument("--numOfDays", type=int, default=3, choices=[1, 2, 3],
                    help="回溯天数（1/2/3，对应最近 24/48/72 小时）")
    ap.add_argument("--dimension1", default="URL", help="第一维度")
    ap.add_argument("--dimension2", default="", help="第二维度（可选）")
    ap.add_argument("--dimension3", default="", help="第三维度（可选）")
    ap.add_argument("--out-dir", default="clarity/export", help="输出目录")
    args = ap.parse_args()

    dims = [d for d in [args.dimension1, args.dimension2, args.dimension3] if d]
    for d in dims:
        if d not in VALID_DIMS:
            print(f"WARN: 维度 '{d}' 不在官方建议列表 {sorted(VALID_DIMS)} 中，仍将尝试（可能返回错误）")

    status, body = fetch(args.numOfDays, dims)
    now = datetime.datetime.utcnow()
    ts = now.strftime("%Y%m%d-%H%M%S")

    os.makedirs(os.path.join(os.getcwd(), args.out_dir), exist_ok=True)
    out_dir = os.path.join(os.getcwd(), args.out_dir)

    # 原始 JSON 落盘
    raw_path = os.path.join(out_dir, f"clarity-{ts}.json")
    with open(raw_path, "w", encoding="utf-8") as f:
        f.write(body)
    print(f"HTTP {status} -> {raw_path}")

    if status != 200:
        print("FAIL: Clarity API 返回非 200，请检查 token 是否有效/过期、配额是否超限（每天 10 次）")
        sys.exit(1)

    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        print("FAIL: 返回内容不是合法 JSON")
        sys.exit(1)

    # 按维度分别扁平化输出 CSV
    for dim in dims:
        rows = flatten(payload, dim)
        if not rows:
            print(f"  (dimension={dim}) 无数据行")
            continue
        dim_key = dim.replace("/", "_").replace(" ", "_")
        csv_path = os.path.join(out_dir, f"clarity-{dim_key}.csv")
        fieldnames = []
        for r in rows:
            for k in r.keys():
                if k not in fieldnames:
                    fieldnames.append(k)
        with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=fieldnames)
            w.writeheader()
            w.writerows(rows)
        print(f"  {dim}: {len(rows)} 行 -> {csv_path}")

    # 汇总（覆盖写，供流水线读取展示）
    summary = {
        "exported_at_utc": now.strftime("%Y-%m-%d %H:%M:%S"),
        "numOfDays": args.numOfDays,
        "dimensions": dims,
        "status": status,
        "raw_file": os.path.basename(raw_path),
        "metrics": [],
    }
    for metric in payload:
        info = metric.get("information", []) or []
        total_sessions = sum(int(x.get("totalSessionCount", 0) or 0) for x in info)
        total_bots = sum(int(x.get("totalBotSessionCount", 0) or 0) for x in info)
        total_distant = sum(int(x.get("distantUserCount", 0) or 0) for x in info)
        summary["metrics"].append({
            "metricName": metric.get("metricName"),
            "rows": len(info),
            "totalSessionCount": total_sessions,
            "totalBotSessionCount": total_bots,
            "distantUserCount": total_distant,
        })
    sum_path = os.path.join(out_dir, "clarity-summary.json")
    with open(sum_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    print(f"summary -> {sum_path}")
    print("DONE")


if __name__ == "__main__":
    main()

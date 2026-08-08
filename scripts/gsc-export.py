#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gsc-export.py — 从 Google Search Console 导出最近 N 天查询/页面数据（服务账号方式）

用途：
  通过服务账号密钥（由 CNB 流水线 imports 注入为环境变量），调用 Search Console API，
  导出指定站点的「查询(query)」与「网页(page)」数据到 gsc/export/queries.csv / pages.csv。

密钥注入（CNB 流水线）：
  imports:
    - https://cnb.cool/<org>/<secret-repo>/-/blob/main/gen-lang-client-0803005687-xxx.json
  该 json 的字段会作为环境变量注入：type/project_id/private_key_id/private_key/client_email/
  client_id/auth_uri/token_uri/auth_provider_x509_cert_url/client_x509_cert_url

本地运行（可选，供调试）：
  # 先把服务账号 json 下载到本地，再：
  export GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa.json
  python3 scripts/gsc-export.py --days 28 --site limingdao
  # 或直接传 json 文件：
  python3 scripts/gsc-export.py --sa-file /path/to/sa.json --days 28 --site limingdao

输出：
  gsc/export/queries.csv    — 查询词：query,clicks,impressions,ctr,position
  gsc/export/pages.csv      — 落地页：page,clicks,impressions,ctr,position
"""
import argparse
import csv
import datetime
import json
import os
import sys

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]


def build_creds(sa_file):
    from google.oauth2 import service_account
    return service_account.Credentials.from_service_account_file(sa_file, scopes=SCOPES)


def build_creds_from_env():
    """从环境变量拼装服务账号 json（CNB imports 注入方式）。"""
    g = lambda k: os.environ.get(k, "")

    def required(k):
        v = os.environ.get(k, "")
        if not v:
            raise RuntimeError(f"缺少环境变量: {k}（请确认流水线 imports 已注入服务账号密钥）")
        return v

    sa = {
        "type": g("type") or "service_account",
        "project_id": required("project_id"),
        "private_key_id": required("private_key_id"),
        "private_key": required("private_key").replace("\\n", "\n"),
        "client_email": required("client_email"),
        "client_id": required("client_id"),
        "auth_uri": g("auth_uri"),
        "token_uri": required("token_uri"),
        "auth_provider_x509_cert_url": g("auth_provider_x509_cert_url"),
        "client_x509_cert_url": g("client_x509_cert_url"),
    }
    tmp = "/tmp/gsc-sa.json"
    with open(tmp, "w") as f:
        json.dump(sa, f, indent=2)
    return tmp


def pick_site(svc, keyword):
    """从服务账号可见站点里选出目标站点（关键字匹配，如 limingdao）。"""
    sites = svc.sites().list().execute()
    site_list = [s["siteUrl"] for s in sites.get("siteEntry", [])]
    print("Available sites:", site_list)
    if not site_list:
        print("FATAL: no sites accessible")
        sys.exit(0)
    if not keyword:
        # 默认优先 sc-domain: 类型
        target = next((s for s in site_list if s.startswith("sc-domain:")), site_list[0])
        print("No --site given, using:", target)
        return target
    kw = keyword.lower()
    for s in site_list:
        if kw in s.lower():
            print("Target site:", s)
            return s
    print(f"FATAL: no site matching keyword '{keyword}' in {site_list}")
    sys.exit(0)


def export_dimension(svc, site, start, end, dim, out_path):
    rows = []
    start_row = 0
    while True:
        body = {
            "startDate": start.strftime("%Y-%m-%d"),
            "endDate": end.strftime("%Y-%m-%d"),
            "dimensions": [dim],
            "rowLimit": 25000,
            "startRow": start_row,
        }
        resp = svc.searchanalytics().query(siteUrl=site, body=body).execute()
        batch = resp.get("rows", [])
        if not batch:
            break
        for r in batch:
            keys = r.get("keys", [])
            rows.append([
                keys[0] if keys else "",
                r.get("clicks", 0),
                r.get("impressions", 0),
                round(r.get("ctr", 0) * 100, 2),
                round(r.get("position", 0), 1),
            ])
        start_row += len(batch)
        if len(batch) < 25000:
            break
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", newline="", encoding="utf-8-sig") as fp:
        w = csv.writer(fp)
        header = "query" if dim == "query" else "page"
        w.writerow([header, "clicks", "impressions", "ctr", "position"])
        w.writerows(rows)
    print(f"Exported {len(rows)} rows ({dim}) -> {out_path}")
    return len(rows)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=28, help="回溯天数（默认 28）")
    ap.add_argument("--site", default="", help="站点关键字，如 limingdao；空则用第一个 sc-domain")
    ap.add_argument("--out-dir", default="gsc/export", help="输出目录")
    ap.add_argument("--sa-file", default="", help="服务账号 json 文件路径（本地调试用）")
    ap.add_argument("--no-commit", action="store_true", help="只导出不提交（流水线控制提交）")
    args = ap.parse_args()

    if args.sa_file:
        sa_file = args.sa_file
    elif os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        sa_file = os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
    else:
        sa_file = build_creds_from_env()

    creds = build_creds(sa_file)
    from googleapiclient.discovery import build
    svc = build("searchconsole", "v1", credentials=creds)

    site = pick_site(svc, args.site)
    end = datetime.date.today()
    start = end - datetime.timedelta(days=args.days - 1)

    out_dir = os.path.join(os.getcwd(), args.out_dir)
    nq = export_dimension(svc, site, start, end, "query", os.path.join(out_dir, "queries.csv"))
    npg = export_dimension(svc, site, start, end, "page", os.path.join(out_dir, "pages.csv"))
    print(f"DONE queries={nq} pages={npg}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
indexnow-submit.py — 向 IndexNow（Bing / 百度 / Yandex 等）主动推送 URL，加速爬虫发现新站
========================================================================================

用途：
    外链建设 / 收录加速的核心自动化手段。IndexNow 是 Bing、百度、Yandex、
    Seznam 等搜索引擎共同支持的「主动提交」协议：网站改版 / 新增页面后，
    把 URL 列表 POST 给 IndexNow API，搜索引擎会在数小时内抓取，远快于自然
    爬行（数天~数周）。这是新站爬坡期加速「被看见」最有效的低成本手段。

原理：
    1. 在站点根目录放一个 `<key>.txt`（key 为 32 位 hex 字符串），证明域名所有权；
    2. 构造 JSON：{ host, key, keyLocation, urlList: [...] };
    3. POST 到 https://api.indexnow.org/indexnow（Bing 聚合入口）即可，
       百度等也会同步读取。

用法：
    python3 scripts/indexnow-submit.py [--limit N] [--dry-run]

    --limit N    最多推送前 N 个 URL（默认全部，建议第一次先推首页/分类/指南等核心页）
    --dry-run    只打印将推送的 URL 列表，不发请求

输出：
    推送成功/失败统计 + 响应摘要（不入库，仅日志留档）

说明：
    - 由 .cnb.yml 在 push 成功后自动运行（见 main: push → indexnow 流水线）；
    - 也可手动运行。URL 从 sitemap 或构建产物 dist/client/ 扫描得到。
"""

import argparse
import json
import sys
import time
import urllib.parse
import urllib.request

# IndexNow 密钥（对应 public/<KEY>.txt）
KEY = "88b9bf2dedaf4503a16cbad4681b06e5"
HOST = "www.limingdao.com"
SITEMAP_URL = f"https://{HOST}/sitemap-index.xml"
# 核心优先级路径（优先推送高价值页面；2026-08-10 加码：补平台页/指南/热门领域/工具分类）
PRIORITY_PATHS = [
    "/",
    "/zh",
    "/en",
    "/zh/tools",
    "/en/tools",
    "/zh/accounts",
    "/en/accounts",
    "/zh/guides",
    "/en/guides",
    "/zh/services",
    "/zh/platforms",
    "/en/platforms",
    "/zh/categories",
    "/en/categories",
    "/zh/categories/ai-content",
    "/zh/categories/college-life",
    "/zh/categories/marketing-seo",
    "/zh/categories/video-generation",
    "/zh/tools/categories",
    "/zh/new",
    "/en/new",
    "/llms.txt",
    "/robots.txt",
]

UA = "Mozilla/5.0 (compatible; Limingdao-IndexNow/1.0; +https://www.limingdao.com)"


def http_get(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "ignore")


def fetch_sitemap_urls():
    """从 sitemap-index 递归收集所有 URL（简单 XML 解析）。"""
    urls = set()
    # 核心优先级路径（相对路径，统一转完整 URL）
    for p in PRIORITY_PATHS:
        u = p if p.startswith("http") else f"https://{HOST}{p}"
        urls.add(u)
    try:
        import re
        idx = http_get(SITEMAP_URL)
        # 收集子 sitemap
        subs = re.findall(r"<loc>\s*(https?://[^<]+sitemap[^<]*\.xml[^<]*)\s*</loc>", idx, re.I)
        for sub in subs[:10]:
            try:
                body = http_get(sub)
                found = re.findall(r"<loc>\s*(https?://[^<]+)\s*</loc>", body, re.I)
                for u in found:
                    if HOST in u:
                        urls.add(u)
            except Exception:
                continue
            time.sleep(0.3)
    except Exception as e:
        print(f"  [warn] sitemap 抓取失败（降级为核心路径）: {e}")
    # 归一化：去掉末尾斜杠（保留根）
    norm = set()
    for u in urls:
        u = u.strip()
        if not u.startswith("http"):
            u = f"https://{HOST}{u}"
        if u.endswith("/") and u.rstrip("/"):
            u = u.rstrip("/")
        norm.add(u)
    return sorted(norm)


def submit(urls, dry_run=False):
    """POST 到 IndexNow 聚合入口。"""
    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": f"https://{HOST}/{KEY}.txt",
        "urlList": urls,
    }
    if dry_run:
        print(f"[dry-run] 将推送 {len(urls)} 个 URL:")
        for u in urls[:20]:
            print(f"    {u}")
        if len(urls) > 20:
            print(f"    ... 等共 {len(urls)} 个")
        return True

    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "https://api.indexnow.org/indexnow",
        data=body,
        headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": UA},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            status = r.status
            resp = r.read().decode("utf-8", "ignore")
        print(f"✅ IndexNow 推送成功 (HTTP {status})，{len(urls)} 个 URL")
        return True
    except urllib.error.HTTPError as e:
        print(f"❌ IndexNow 推送失败 (HTTP {e.code}): {e.read().decode('utf-8','ignore')[:300]}")
        return False
    except Exception as e:
        print(f"❌ IndexNow 推送异常: {e}")
        return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=None)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    print("=" * 60)
    print("IndexNow 主动推送（Bing / 百度 / Yandex 等收录加速）")
    print(f"host: {HOST}   key: {KEY}")
    print("=" * 60)

    urls = fetch_sitemap_urls()
    print(f"共收集 {len(urls)} 个 URL")
    if args.limit:
        urls = urls[: args.limit]
        print(f"（--limit 截断后 {len(urls)} 个）")

    if not urls:
        print("没有可推送的 URL，退出")
        sys.exit(1)

    ok = submit(urls, dry_run=args.dry_run)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()

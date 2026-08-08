#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gsc-keyword-map.py — 生成《GSC 关键词地图》基线清单

用途：
  从 src/content/（categories / guides / accounts / tools）提取每个实体声明的
  primary_keyword / secondary_keywords，并拼出对应 URL，输出为 gsc/keyword-map.csv。

  这份 CSV 就是「关键词清单」的基线：后续 GSC 数据回来后，
  用它做「已覆盖关键词 vs GSC 实际流量词」的对比（见 scripts/gsc-audit.py），
  发现「有流量但清单里没有」的词 → 校准（补关键词/补内容）。

运行：
  python3 scripts/gsc-keyword-map.py          # 默认写 gsc/keyword-map.csv

输出：
  gsc/keyword-map.csv   — 关键词地图（UTF-8 with BOM，Excel 直接可开）
"""
import csv
import glob
import os
import re
import sys

try:
    import yaml
except ImportError:
    sys.exit("缺少 PyYAML：pip install pyyaml")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "src", "content")
OUT_CSV = os.path.join(ROOT, "gsc", "keyword-map.csv")
SITE = "https://www.limingdao.com"


def read_fm(path):
    """返回 frontmatter 的 dict（YAML 完整解析）。"""
    text = open(path, encoding="utf-8").read()
    m = re.match(r"^---\r?\n([\s\S]*?)\r?\n---", text)
    if not m:
        return {}
    try:
        data = yaml.safe_load(m.group(1)) or {}
    except Exception as e:
        print(f"  [warn] YAML 解析失败 {path}: {e}", file=sys.stderr)
        return {}
    return data


def seo_of(fm):
    seo = fm.get("seo") or {}
    if isinstance(seo, str):  # 防御：异常结构
        return {}
    return seo


def join_list(v):
    if not v:
        return ""
    if isinstance(v, str):
        return v
    if isinstance(v, list):
        return "; ".join(str(x).strip() for x in v if str(x).strip())
    return str(v)


def main():
    rows = []

    # 1) 领域页 categories
    for f in sorted(glob.glob(os.path.join(CONTENT, "categories", "*.md"))):
        fm = read_fm(f)
        slug = fm.get("slug") or os.path.splitext(os.path.basename(f))[0]
        seo = seo_of(fm)
        pk = seo.get("primary_keyword") or ""
        if not pk:
            continue
        rows.append({
            "type": "category",
            "slug": slug,
            "url": f"{SITE}/zh/categories/{slug}",
            "primary_keyword": pk,
            "secondary_keywords": join_list(seo.get("secondary_keywords")),
            "note": "领域页（CollectionPage）",
        })

    # 2) 指南 guides（zh 为默认落地页）
    for f in sorted(glob.glob(os.path.join(CONTENT, "guides", "zh", "*.md"))):
        fm = read_fm(f)
        guide_id = fm.get("guideId") or fm.get("slug") or os.path.splitext(os.path.basename(f))[0]
        seo = seo_of(fm)
        pk = seo.get("primary_keyword") or ""
        if not pk:
            continue
        rows.append({
            "type": "guide",
            "slug": guide_id,
            "url": f"{SITE}/zh/guides/{guide_id}",
            "primary_keyword": pk,
            "secondary_keywords": join_list(seo.get("secondary_keywords")),
            "note": "GEO 长文（Article）",
        })

    # 3) 账号 accounts
    for f in sorted(glob.glob(os.path.join(CONTENT, "accounts", "*.md"))):
        fm = read_fm(f)
        if fm.get("draft"):
            continue
        slug = fm.get("slug") or os.path.splitext(os.path.basename(f))[0]
        seo = seo_of(fm)
        pk = seo.get("primary_keyword") or ""
        if not pk:
            continue
        rows.append({
            "type": "account",
            "slug": slug,
            "url": f"{SITE}/zh/accounts/{slug}",
            "primary_keyword": pk,
            "secondary_keywords": join_list(seo.get("secondary_keywords")),
            "note": "账号详情页（Person）",
        })

    # 4) AI 工具 tools（旧站书签迁移，仅中文）
    for f in sorted(glob.glob(os.path.join(CONTENT, "tools", "*.md"))):
        fm = read_fm(f)
        slug = fm.get("slug") or os.path.splitext(os.path.basename(f))[0]
        title = fm.get("title") or slug
        rows.append({
            "type": "tool",
            "slug": slug,
            "url": f"{SITE}/zh/tools/{slug}",
            "primary_keyword": title,
            "secondary_keywords": "",
            "note": "AI 工具页（SoftwareApplication）",
        })

    os.makedirs(os.path.dirname(OUT_CSV), exist_ok=True)
    with open(OUT_CSV, "w", newline="", encoding="utf-8-sig") as fp:
        w = csv.DictWriter(fp, fieldnames=["type", "slug", "url", "primary_keyword", "secondary_keywords", "note"])
        w.writeheader()
        w.writerows(rows)

    print(f"OK  keyword-map 共 {len(rows)} 条：")
    from collections import Counter
    for k, v in Counter(r["type"] for r in rows).most_common():
        print(f"   - {k}: {v}")
    print(f"已写入 {OUT_CSV}")


if __name__ == "__main__":
    main()

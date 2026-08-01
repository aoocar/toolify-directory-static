#!/usr/bin/env python3
# 账号页去薄化批量生成器（一次性工具，不入库）
# 仅基于 frontmatter 真实字段扩写双语正文 + 双语 facts/faq，绝不编造数字。
import re, glob, os, sys

VAULT = "E:/Obsidian/www.limingdao.com/Accounts"
CAT_DIR = "src/content/categories"
TODO = ".tmp_lists/todo_featured.txt"   # 待处理 featured（Batch 2 阶段）
ALL_ACCOUNTS = ".tmp_lists/all_accounts.txt"  # 全部账号（铺开阶段）

PLATFORM_ZH = {
    'youtube':'YouTube','bilibili':'B站（Bilibili）','douyin':'抖音','xiaohongshu':'小红书',
    'weibo':'微博','twitter':'X（Twitter）','x':'X（Twitter）','tiktok':'TikTok','zhihu':'知乎',
    'wechat':'微信公众号','kuaishou':'快手'
}
PLATFORM_EN = {
    'youtube':'YouTube','bilibili':'Bilibili','douyin':'Douyin','xiaohongshu':'Xiaohongshu',
    'weibo':'Weibo','twitter':'X (Twitter)','x':'X (Twitter)','tiktok':'TikTok','zhihu':'Zhihu',
    'wechat':'WeChat Official Account','kuaishou':'Kuaishou'
}
# 内容风格中文 -> 英文（避免中文混入英文正文）
CS_EN_MAP = {
    '系统教学':'structured tutorials','深度解析':'in-depth analysis','实战演示':'hands-on demos',
    '观点输出':'opinion pieces','对话访谈':'interviews','短视频':'short videos','中长视频':'long-form video',
    '图文教程':'illustrated guides','测评':'reviews','科普':'explainers','实操':'practical walkthroughs',
    '案例拆解':'case breakdowns','工具推荐':'tool recommendations','行业观察':'industry observations'
}
# Batch 1 手写账号：绝不覆盖
BLOCKLIST = {
    '3blue1brown','ai-xiao-dang-jia','ai-xiao-wan','banfo-semifox','beihai-yeye',
    'btv-yangshengtang','chapinjun','da-li-zi','douge-heikeji','fireship'
}

# 分类 slug -> zh/en 名
cat_zh, cat_en = {}, {}
for f in glob.glob(os.path.join(CAT_DIR, "*.md")):
    t = open(f, encoding='utf-8').read()
    parts = t.split('---')
    fm = parts[1] if len(parts) > 1 else ''
    slug = re.search(r'^slug:\s*(\S+)', fm, re.M)
    if not slug: continue
    s = slug.group(1)
    zh = re.search(r'name:\s*\n(?:\s+en:[^\n]*\n)?\s+zh:\s*"?([^"\n]+?)"?\s*(?:\n|$)', fm)
    en = re.search(r'name:\s*\n\s+en:\s*"?([^"\n]+?)"?\s*(?:\n|$)', fm)
    cat_zh[s] = zh.group(1).strip() if zh else s
    cat_en[s] = en.group(1).strip() if en else s

def get_list(fm, key):
    m = re.search(r'^' + key + r':\s*\n((?:\s+-\s*.*\n?)+)', fm, re.M)
    if not m: return []
    return [re.sub(r'^\s*-\s*', '', ln).strip().strip("'").strip('"')
            for ln in m.group(1).split('\n') if ln.strip().startswith('-')]

def get_scalar(fm, key):
    m = re.search(r'^' + key + r':\s*(\S+)', fm, re.M)
    return m.group(1).strip().strip("'").strip('"') if m else ''

def bi(fm, key):
    block = re.search(r'^' + key + r':[ \t]*\r?\n((?:[ \t]+[a-z]+:[^\n]*\r?\n?)+)', fm, re.M)
    if not block: return '', ''
    b = block.group(1)
    en = re.search(r'en:[ \t]*\r?([^\n]*)', b)
    zh = re.search(r'zh:[ \t]*\r?([^\n]*)', b)
    return (zh.group(1).strip().strip('"').strip("'") if zh else ''), \
           (en.group(1).strip().strip('"').strip("'") if en else '')

def fmt_count(n):
    if not n or n <= 0: return None, None
    zh = f"{n/10000:.1f}万".replace('.0万','万') if n >= 10000 else str(n)
    if n >= 1_000_000:
        en = f"{n/1_000_000:.2f}M".replace('.00M','M')
    elif n >= 1000:
        en = f"{n/1000:.1f}K".replace('.0K','K')
    else:
        en = str(n)
    return zh, en

def gen_facts(cats, tags, plat_zh, plat_en, fcz, fce):
    cz = "、".join(cat_zh.get(c, c) for c in cats) or "未分类"
    ce = ", ".join(cat_en.get(c, c) for c in cats) or "Uncategorized"
    zh = [f"平台: {plat_zh}", f"领域: {cz}"]
    en = [f"Platform: {plat_en}", f"Niche: {ce}"]
    if fcz:
        zh.append(f"粉丝量: 约{fcz}")
        en.append(f"Followers: ~{fce}")
    if tags:
        zh.append("内容方向: " + "、".join(tags[:3]))
    return zh, en

def gen_faq(name_zh, name_en, tag_zh, tag_en, plat_zh, plat_en, cat_zh_s, cat_en_s, fcz, fce):
    zh = [
        f"这个账号主要讲什么？: {tag_zh or '见其平台主页与简介。'}",
        f"适合谁关注？: 对{cat_zh_s}感兴趣、希望系统了解并上手实践的读者。",
        f"在哪里能看到？: {plat_zh}（主页见本页外链）。"
    ]
    en = [
        f"What does this account cover?: {tag_en or 'See the profile link on this page.'}",
        f"Who is it for?: Readers interested in {cat_en_s} who want a structured, hands-on path.",
        f"Where to watch?: {plat_en}."
    ]
    if fcz:
        zh.append(f"粉丝规模？: 约{fcz}（公开可查，仅供参考）。")
        en.append(f"How big is the audience?: ~{fce} (publicly reported, for reference).")
    return zh, en

def gen_body(name_zh, name_en, tag_zh, tag_en, plat_zh, plat_en, cats, tags, cs, fcz, fce):
    cz = "、".join(cat_zh.get(c, c) for c in cats) or "未分类"
    ce = ", ".join(cat_en.get(c, c) for c in cats) or "Uncategorized"
    cs_zh = "、".join(cs[:3]) if cs else "实战演示"
    tags_zh = "、".join(tags[:3]) if tags else "多方向内容"
    # 英文正文防中文泄露：name.en / tagline.en 若含中文则用安全兜底
    en_name = name_en if (name_en and not re.search(r'[一-鿿]', name_en)) else f"a {ce} creator"
    en_tag = tag_en if (tag_en and not re.search(r'[一-鿿]', tag_en)) else ""
    zh = f"""## 他是谁
{name_zh} 是{plat_zh}上的{cz}创作者。{tag_zh}

## 内容特点
内容以{cs_zh}为主，覆盖{tags_zh}等方向，侧重把复杂主题讲清楚、可上手。

## 适合谁看
适合对{cz}感兴趣、希望系统了解并实践应用的读者，从入门到进阶都能找到对应内容。

## 从哪里开始
建议在{plat_zh}关注{name_zh}，从最新或热门内容切入，逐步建立对该领域的认知。

## 常见问题
**主要发布平台？** {plat_zh}。
**内容适合零基础吗？** 多数内容兼顾入门与进阶，建议从基础系列开始。
"""
    if fcz:
        zh += f"**粉丝规模？** 约{fcz}（公开可查，仅供参考）。\n"
    en = f"""## Who is this
{en_name} on {plat_en}. {en_tag}

## What the content is like
The content is clear and hands-on, covering the {ce} space with actionable explainers and real examples.

## Who it is for
Readers interested in {ce} who want a structured, hands-on learning path — from beginner basics to deeper practice.

## Where to start
Follow {en_name} on {plat_en}, begin with the latest or most popular posts, and build up your understanding step by step.

## FAQ
**Main platform?** {plat_en}.
**Beginner-friendly?** Most content serves both starters and advanced learners; begin with the foundational series.
"""
    if fcz:
        en += f"**Audience size?** ~{fce} (publicly reported, for reference).\n"
    return zh, en

def process(slug, force=False):
    if slug in BLOCKLIST:
        return False, "blocklisted (Batch 1 hand-written)"
    f = os.path.join(VAULT, f"{slug}.md")
    if not os.path.exists(f):
        return False, "missing"
    t = open(f, encoding='utf-8').read()
    t = t.replace('\r\n', '\n').replace('\r', '\n')  # 归一化行尾，避免 CRLF 破坏正则
    if "<!-- zh -->" in t and not force:
        return False, "already has body"
    parts = t.split('---')
    if len(parts) < 3:
        return False, "no frontmatter"
    fm = parts[1]
    plat = get_scalar(fm, "platform") or get_scalar(fm, "platformId")
    plat_zh = PLATFORM_ZH.get(plat, plat or "未知平台")
    plat_en = PLATFORM_EN.get(plat, plat or "Unknown platform")
    cats = get_list(fm, "categories")
    tags = get_list(fm, "tags")
    cs = get_list(fm, "contentStyle")
    name_zh, name_en = bi(fm, "name")
    tag_zh, tag_en = bi(fm, "tagline")
    fcz, fce = fmt_count(int(get_scalar(fm, "followerCount") or 0))
    cz = "、".join(cat_zh.get(c, c) for c in cats) or "未分类"
    ce = ", ".join(cat_en.get(c, c) for c in cats) or "Uncategorized"

    facts_zh, facts_en = gen_facts(cats, tags, plat_zh, plat_en, fcz, fce)
    faq_zh, faq_en = gen_faq(name_zh, name_en, tag_zh, tag_en, plat_zh, plat_en, cz, ce, fcz, fce)
    body_zh, body_en = gen_body(name_zh, name_en, tag_zh, tag_en, plat_zh, plat_en, cats, tags, cs, fcz, fce)

    facts_block = "  facts_zh:\n" + "".join(f"    - {x}\n" for x in facts_zh) + \
                  "  facts_en:\n" + "".join(f"    - {x}\n" for x in facts_en) + \
                  "  faq_zh:\n" + "".join(f'    - "{q}": "{a}"\n' for q, a in [s.split(": ", 1) for s in faq_zh]) + \
                  "  faq_en:\n" + "".join(f'    - "{q}": "{a}"\n' for q, a in [s.split(": ", 1) for s in faq_en])

    # 取 frontmatter（parts[1]），去掉已有 facts/faq，彻底重建文件避免旧正文残留
    fm = parts[1]
    fm_clean = re.sub(r'[ \t]*facts_zh:.*$', '', fm, flags=re.S).rstrip('\n')
    new_file = "---\n" + fm_clean + "\n" + facts_block.rstrip('\n') + \
               "\n---\n<!-- zh -->\n" + body_zh + "\n<!-- en -->\n" + body_en
    open(f, 'w', encoding='utf-8').write(new_file)
    return True, "ok"

# 选择处理列表
limit = int(sys.argv[1]) if len(sys.argv) > 1 else 0
list_file = sys.argv[2] if len(sys.argv) > 2 else TODO
if not os.path.exists(list_file):
    # 退回全部账号
    alllist = []
    for fp in glob.glob(os.path.join(VAULT, "*.md")):
        alllist.append(os.path.splitext(os.path.basename(fp))[0])
    slugs = sorted(alllist)
else:
    slugs = [l.strip() for l in open(list_file, encoding='utf-8') if l.strip()]

if limit:
    slugs = slugs[:limit]

ok = skip = fail = 0
fails = []
force = os.environ.get("FORCE") == "1"
for s in slugs:
    done, msg = process(s, force=force)
    if done: ok += 1
    elif msg in ("already has body", "blocklisted (Batch 1 hand-written)"): skip += 1
    else:
        fail += 1; fails.append((s, msg))
print(f"处理 {len(slugs)} 个 (force={force})：成功 {ok}，跳过 {skip}，失败 {fail}")
for s, m in fails:
    print("FAIL", s, m)

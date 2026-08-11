#!/usr/bin/env python3
"""生成xlsx数据中需要的分类文件"""
import os

CAT_DIR = "src/content/categories"

# slug: (icon, en_name, zh_name, en_desc, zh_desc)
categories = {
    "agriculture": ("🌾", "Agriculture & Rural", "三农", "Rural life, farming, agricultural products, and village culture.", "农村生活、农业生产、农产品与乡村文化，涵盖种植养殖、返乡创业与乡村美食。"),
    "humanities": ("📖", "Humanities & Social Science", "人文社科", "History, philosophy, culture, sociology, and intellectual content.", "历史、哲学、文化、社会观察等思想类内容，深入浅出的知识传播。"),
    "sports": ("⚽", "Sports", "体育", "Sports events, athlete coverage, game analysis, and fitness commentary.", "体育赛事、运动员动态、比赛解说与健身评论。"),
    "health": ("💊", "Health & Wellness", "健康", "Health tips, medical information, wellness routines, and disease prevention.", "健康养生、医学知识、疾病预防与生活方式管理。"),
    "others": ("📌", "Others", "其他", "Accounts that don't fit neatly into any single content category.", "不归属于特定分类的多类型或综合类内容账号。"),
    "military": ("🎖️", "Military & Defense", "军事", "Military news, defense analysis, weapons and equipment coverage.", "军事新闻、国防分析、武器装备与战略观察。"),
    "animation": ("🎨", "Animation & ACG", "动漫", "Anime, comics, ACG culture, cosplay, and animation commentary.", "动漫、漫画、ACG文化、Cosplay与动画解说。"),
    "pets": ("🐾", "Pets & Animals", "动物宠物", "Pet care, cute animals, pet adoption stories, and animal science.", "宠物养护、萌宠日常、领养故事与动物科普。"),
    "history": ("🏛️", "History", "历史", "Historical events, figures, cultural heritage, and historical interpretation.", "历史事件、历史人物、文化遗产与历史解读。"),
    "international": ("🌍", "International News", "国际", "Global affairs, international relations, world news, and foreign policy.", "国际时事、国际关系、全球热点与外交政策观察。"),
    "lottery": ("🎲", "Lottery & Gambling Info", "彩票", "Lottery news, results, and analysis information.", "彩票资讯、开奖结果与走势分析。"),
    "film-tv": ("🎬", "Film & TV", "影视", "Movie reviews, TV series, drama commentary, and film industry news.", "电影评论、电视剧集、影视解说与行业资讯。"),
    "emotion": ("💗", "Emotion & Relationships", "情感", "Emotional stories, relationship advice, psychology, and human connection.", "情感故事、两性关系、心理成长与人际沟通。"),
    "comedy": ("😂", "Comedy & Fun", "搞笑", "Funny content, sketch comedy, pranks, jokes, and light entertainment.", "搞笑段子、喜剧短剧、整蛊恶搞与轻松娱乐。"),
    "photography": ("📷", "Photography", "摄影", "Photography skills, camera reviews, travel photography, and visual arts.", "摄影技巧、相机评测、旅行摄影与视觉艺术。"),
    "travel": ("✈️", "Travel & Tourism", "旅游", "Travel guides, destination reviews, cultural exploration, and trip planning.", "旅行攻略、目的地推荐、文化探索与行程规划。"),
    "fashion": ("👗", "Fashion & Beauty", "时尚", "Fashion trends, outfit ideas, beauty tips, and personal styling.", "潮流穿搭、美妆护肤、个人形象与时尚趋势。"),
    "politics-society": ("🏛️", "Politics & Society", "时政社会", "Political news, social issues, policy analysis, and current affairs.", "时政新闻、社会热点、政策解读与公共事务。"),
    "automotive": ("🚗", "Automotive", "汽车", "Car reviews, driving tips, new energy vehicles, and auto industry news.", "汽车评测、驾驶技巧、新能源汽车与行业资讯。"),
    "law": ("⚖️", "Law & Legal", "法律", "Legal education, case analysis, rights protection, and law popularization.", "法律科普、案例分析、权益保护与法治宣传。"),
    "gaming": ("🎮", "Gaming", "游戏", "Game reviews, gameplay, esports, game news, and gaming culture.", "游戏评测、游戏实况、电竞、游戏资讯与游戏文化。"),
    "science-tech": ("🔬", "Science & Technology", "科学科技", "Scientific discoveries, tech innovations, research, and frontier science.", "科学发现、科技前沿、创新研究与最新进展。"),
    "science": ("🔭", "Science Popularization", "科普", "Easy-to-understand science content, popular science videos, and educational explainers.", "通俗易懂的科学知识、科普视频与趣味讲解。"),
    "variety-show": ("🎤", "Variety & Talk Shows", "综艺", "Variety show highlights, talk show clips, and entertainment programs.", "综艺节目、脱口秀精彩片段与娱乐节目内容。"),
    "food": ("🍜", "Food & Dining", "美食", "Food reviews, cooking tutorials, restaurant guides, and food culture.", "美食探店、烹饪教程、餐厅推荐与饮食文化。"),
    "career": ("💼", "Career & Workplace", "职业职场", "Career advice, workplace skills, job hunting, and professional development.", "职业规划、职场技能、求职面试与个人成长。"),
    "parenting": ("👶", "Parenting & Family", "育儿", "Child education, parenting tips, family life, and child development.", "儿童教育、育儿经验、亲子关系与家庭生活。"),
    "dance": ("💃", "Dance", "舞蹈", "Dance performances, dance tutorials, street dance, and dance culture.", "舞蹈表演、舞蹈教学、街舞与舞蹈文化。"),
    "finance": ("💰", "Finance & Economics", "财经", "Financial news, investment, economics, personal finance, and market analysis.", "财经新闻、投资理财、经济观察与市场分析。"),
    "fitness": ("💪", "Fitness & Exercise", "运动健身", "Workout routines, fitness tips, bodybuilding, and exercise science.", "健身教程、运动训练、增肌减脂与运动科学。"),
    "music": ("🎵", "Music", "音乐", "Music performances, songs, instruments, and music production.", "音乐演出、歌曲推荐、乐器演奏与音乐制作。"),
    "beauty": ("✨", "Beauty & Self-Image", "颜值", "Beauty content, self-presentation, personal image, and visual aesthetics.", "颜值展示、个人形象、视觉美学与自拍文化。"),
}

# Map Chinese category names to slugs
zh_to_slug = {
    "三农": "agriculture",
    "人文社科": "humanities",
    "体育": "sports",
    "健康": "health",
    "其他": "others",
    "养老": "senior",
    "军事": "military",
    "动漫": "animation",
    "动物宠物": "pets",
    "历史": "history",
    "国际": "international",
    "娱乐": "entertainment",
    "家居家装": "home-appliances",
    "彩票": "lottery",
    "影视": "film-tv",
    "情感": "emotion",
    "搞笑": "comedy",
    "摄影": "photography",
    "教育": "education",
    "数码": "tech-review",
    "旅游": "travel",
    "时尚": "fashion",
    "时政社会": "politics-society",
    "汽车": "automotive",
    "法律": "law",
    "游戏": "gaming",
    "生活": "lifestyle",
    "科学科技": "science-tech",
    "科普": "science",
    "综艺": "variety-show",
    "美食": "food",
    "职业职场": "career",
    "育儿": "parenting",
    "舞蹈": "dance",
    "财经": "finance",
    "运动健身": "fitness",
    "音乐": "music",
    "颜值": "beauty",
}

# Save the mapping for later use
import json
with open('/tmp/limingdao/zh_to_slug.json', 'w', encoding='utf-8') as f:
    json.dump(zh_to_slug, f, ensure_ascii=False, indent=2)

def generate_category_md(slug, icon, en_name, zh_name, en_desc, zh_desc):
    return f"""---
slug: {slug}
icon: {icon}
name:
  en: {en_name}
  zh: {zh_name}
description:
  en: {en_desc}
  zh: {zh_desc}
seo:
  primary_keyword: {zh_name} 创作者 账号
  secondary_keywords:
    - {zh_name}
    - {zh_name} 博主
    - {zh_name} 自媒体
  search_intent: 发现{zh_name}领域的优质创作者与账号
  title_zh: "{zh_name}创作者导航｜黎明岛"
  title_en: "{en_name} Creators — Dawn Island"
  meta_description_zh: "黎明岛收录{zh_name}领域优质创作者：{zh_desc}"
  meta_description_en: "Dawn Island curates {en_name.lower()} creators — {en_desc}"
geo:
  answer_summary_zh: >-
    {zh_name}类内容围绕{zh_desc}黎明岛收录该领域优质创作者，
    覆盖不同平台与内容风格，帮助读者发现值得关注的账号。
  answer_summary_en: >-
    {en_name} content covers {en_desc} Dawn Island curates quality
    creators in this niche across platforms and content styles.
  facts_zh:
    - 主要平台: 今日头条、微博、B站、快手、百家号
    - 常见主题: {zh_name}相关的内容创作与信息传播
    - 受众: 对{zh_name}感兴趣的广大用户
  facts_en:
    - Platforms: Toutiao, Weibo, Bilibili, Kuaishou, Baijiahao
    - Common themes: {en_name} content creation and information sharing
    - Audience: Users interested in {en_name.lower()}
  faq_zh:
    - 为什么要关注{zh_name}创作者？: {zh_desc}
    - 哪些平台有优质{zh_name}内容？: 今日头条、微博、B站、快手、百家号等平台均有优质创作者。
  faq_en:
    - Why follow {en_name.lower()} creators?: {en_desc}
    - Where to find quality {en_name.lower()} content?: Toutiao, Weibo, Bilibili, Kuaishou, and Baijiahao all host quality creators.
---
"""

# Check which categories already exist
existing = set()
for f in os.listdir(CAT_DIR):
    if f.endswith('.md'):
        existing.add(f.replace('.md', ''))

new_cats = 0
for slug, (icon, en_name, zh_name, en_desc, zh_desc) in categories.items():
    if slug not in existing:
        content = generate_category_md(slug, icon, en_name, zh_name, en_desc, zh_desc)
        with open(f"{CAT_DIR}/{slug}.md", 'w', encoding='utf-8') as f:
            f.write(content)
        new_cats += 1
        print(f"Created: {slug}.md")

print(f"\nNew categories created: {new_cats}")
print(f"Mapping saved to zh_to_slug.json")

# 黎明岛 — 使用与内容维护指南

本文档介绍如何在日常运营中维护「黎明岛」自媒体账号目录平台的内容。

---

## 1. 快速内容维护命令

项目通过 Astro 的内容集合（Content Collections）管理数据，所有数据都是本地的 Markdown 文件。

### 本地开发预览
```bash
npm run dev
```
启动后可在浏览器中打开本地预览，内容修改后会实时热更新。

### 生产静态构建
```bash
npm run build
```
构建生成的 HTML 静态页面位于 `dist/` 目录，可直接部署至 Vercel、Cloudflare Pages 等平台。

---

## 2. 如何添加一个新账号 (Account)

所有自媒体账号存放在 `src/content/accounts/` 目录下。

### 步骤 1：创建 Markdown 文件
在该目录下新建一个 `.md` 文件（建议以账号拼音或英文名命名，如 `mr-beast.md`）。

### 步骤 2：填写结构化数据
复制以下模板并根据实际账号修改：

```yaml
---
slug: xiaohongshu-specimen          # 账号唯一ID，会作为路由URL的一部分
profileUrl: https://www.xiaohongshu.com/user/profile/123456 # 账号主页完整链接
avatar: 🎨                          # 头像（可使用单个Emoji，也可输入图片URL）
platform: xiaohongshu               # 平台ID（必须是 content/platforms/ 下已有的slug）
platformId: "red-creator-abc"       # 达人平台内显示的 ID/Handle
verified: true                      # 是否为平台官方认证账号 (true/false)
categories:                         # 所属的内容领域，可填多个（必须是 content/categories/ 下已有的slug）
  - lifestyle
  - ai-content
tags:                               # 标签（用于搜索和分类过滤）
  - AI壁纸
  - 美学设计
contentStyle:                       # 内容风格定位
  - 极简视觉
  - 爆款提示词
monetization: e-commerce            # 变现方式（可选: brand-deals, ads, courses, e-commerce, membership, tips, mixed, unknown）
featured: true                      # 是否推荐到首页精选 (true/false)
followerCount: 150000               # 粉丝数（输入纯数字，前台会自动转化为 15万/150K）
avgEngagement: 8500                 # 平均互动量（点赞/收藏/评论）
contentFrequency: daily             # 创作频次（可选: daily, weekly, biweekly, monthly, irregular）
growthRate: 12.5                    # 月粉增长率 %（输入数字）
publishedAt: "2026-06-20"           # 收录日期
updatedAt: "2026-06-20"             # 数据最后更新日期
name:
  zh: 灵感生成器
  en: InspirationGen
tagline:
  zh: 每天分享一套超高质量的AI壁纸与提示词
  en: Daily sharing of ultra-high quality AI wallpapers and prompts
description:
  zh: 这是一个详细的中文账号描述，介绍该账号的具体玩法、爆款逻辑以及值得参考的内容细节。
  en: Detailed English description goes here.
---
```

---

## 3. 如何添加一个新分类领域 (Category/Niche)

所有领域分类存放在 `src/content/categories/` 目录下。

### 步骤 1：新建 Markdown 文件
新建一个以领域命名的 `.md` 文件（如 `finance.md`）。

### 步骤 2：填入配置
```yaml
---
slug: finance
icon: 📈
name:
  zh: 财财经商业
  en: Finance & Business
description:
  zh: 财经趋势、商业案例拆解以及个人搞钱理财方案分享。
  en: Insights on economy, business case studies and personal finance.
---
```

---

## 4. 如何添加一个自媒体平台 (Platform)

所有支持的平台存放在 `src/content/platforms/` 目录下。

### 步骤 1：新建 Markdown 文件
新建一个以平台命名的 `.md` 文件（如 `tiktok.md`）。

### 步骤 2：填入配置
```yaml
---
slug: tiktok
icon: 🎵
name:
  zh: TikTok
  en: TikTok
description:
  zh: 字节跳动旗下的全球短视频社交平台。
  en: Global short-video platform by ByteDance.
baseUrl: https://www.tiktok.com
type: short-video                  # 平台类型（可选: short-video, video, image-text, social, knowledge）
---
```
*(平台类型用于后台归类及样式定义)*

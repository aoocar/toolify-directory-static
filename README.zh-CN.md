# 黎明岛 (Dawn Island) — 自媒体达人库与 AI 内容代运营展示平台

黎明岛是一个基于 Astro 静态优先架构构建的互联网优质自媒体账号收录平台。同时，它也是你推广 **AI自媒体内容代运营业务** 的展示窗口。

> **Slogan:** AI 分身，可能是普通人最后的机会

---

## 🚀 核心价值

1. **达人灵感库**：收录各大社交平台（抖音、小红书、B站、YouTube 等）在不同领域（科技、知识、生活、AI内容）的优秀账号，提供核心数据与内容风格参考。
2. **业务漏斗**：在账号列表与详情中穿插高转化率的 AI 代运营服务引导（Business CTA），吸引有志于做自媒体的客户进行咨询。
3. **极速体验**：静态优先（SSG）架构，闪电般的页面加载速度，优秀的响应式和 SEO 表现。

---

## 📂 项目结构

*   `src/content/accounts/` - 达人账号的 Markdown 数据集合。
*   `src/content/platforms/` - 各个自媒体平台的基础数据。
*   `src/content/categories/` - 内容细分领域的分类数据。
*   `src/components/` - 核心复用组件（如 `AccountCard`、`BusinessCTA` 等）。
*   `src/pages/` - 页面路由（支持中英双语）。
*   `src/lib/directory.ts` - 数据抽象层，供前端页面统一调用。

---

## 🛠️ 本地开发

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```
打开浏览器访问 [http://localhost:4321/zh](http://localhost:4321/zh) 或 [http://localhost:4321/en](http://localhost:4321/en)。

### 3. 生成生产静态文件
```bash
npm run build
```
打包文件将输出在根目录下的 `dist/` 中，可直接进行静态托管。

---

## 📝 相关文档

- [使用与内容维护指南](./USAGE.zh-CN.md) — 了解如何添加新账号、编辑属性和日常维护。
- [开发与架构升级指南](./UPGRADE.zh-CN.md) — 了解底层架构和向数据库（如 Supabase）迁移的方案。

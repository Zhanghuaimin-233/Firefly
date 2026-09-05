# Firefly 项目 Code Wiki

> **文档版本**：v1.3 · 基于 Firefly `6.15.6`（Astro 7.1.3 / Svelte 5.56.7 / TypeScript 6.0）
>
> **生成时间**：2026-07-16（v1.0），2026-08-06（v1.1 上游合并后同步），2026-08-06（v1.2 新增看板娘多模型架构），2026-08-16（v1.3 新增文章绑定音频功能）
>
> **适用对象**：维护本仓库的开发者、AI Agent、二次贡献者

---

## ⚠️ 阅读须知（重要）

**在遇见任何不明确、与本 Wiki 描述不一致、或本 Wiki 未覆盖的实现细节时，务必优先查阅下列官方文档与权威源，再决定是否动手修改代码：**

| 文档类型 | 链接 | 用途 |
|---------|------|------|
| 📚 **官方使用文档（首选）** | <https://docs-firefly.cuteleaf.cn/zh/guide/getting-started.html> | Firefly 配置、布局、组件、部署的官方权威说明 |
| 📖 **Astro 官方文档** | <https://docs.astro.build/> | Astro 框架本身的概念（Content Collections、Integrations、Image、Font API 等） |
| 🎨 **Expressive Code 文档** | <https://expressive-code.com/> | 代码块渲染、主题、插件配置 |
| 🧩 **rehype/remark 生态** | <https://github.com/rehypejs/rehype> / <https://github.com/remarkjs/remark> | Markdown 处理管线插件机制 |
| 🌲 **Tailwind CSS v4** | <https://tailwindcss.com/> | 原子化类名约定与配置 |
| 🚀 **Swup.js** | <https://swup.js.org/> | SPA 式页面过渡与容器机制 |
| 🔍 **Pagefind** | <https://pagefind.app/> | 客户端全文搜索索引生成 |
| 🧪 **Biome** | <https://biomejs.dev/> | 代码格式化与 lint 规则 |
| 📦 **仓库源码** | <https://github.com/CuteLeaf/Firefly> | 上游源码与 Issue |

> **Agent 必读约定**：在执行任何"修改配置"、"新增组件"、"调整布局"类任务前，必须先比对官方使用文档与本仓库实际代码，确认当前版本是否存在差异。Wiki 是辅助记忆，**不是事实的唯一来源**——以仓库代码和官方文档为准。

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈与依赖](#2-技术栈与依赖)
3. [项目结构总览](#3-项目结构总览)
4. [核心架构](#4-核心架构)
5. [主要模块职责](#5-主要模块职责)
6. [关键类与函数说明](#6-关键类与函数说明)
7. [依赖关系](#7-依赖关系)
8. [项目运行方式](#8-项目运行方式)
9. [构建与部署](#9-构建与部署)
10. [约定与最佳实践](#10-约定与最佳实践)

---

## 1. 项目概述

**Firefly（流萤）** 是一款基于 [Astro](https://astro.build) 框架与 [Fuwari](https://github.com/saicaca/fuwari) 模板二次开发的清新美观且现代化个人博客主题模板，专为技术爱好者和内容创作者设计。

- **定位**：静态博客主题，强调性能、可配置性与 ACGN 风格视觉表现
- **核心特性**：
  - Astro + Svelte 混合架构，零运行时 JS 优先，仅在交互组件上水合
  - Swup SPA 式页面过渡动画，多容器同步替换
  - 配置驱动：所有功能模块均由 `src/config/*.ts` 切换
  - 双侧边栏 + 网格/瀑布流文章布局
  - 四种壁纸模式（横幅 / 全屏 / 全屏透明 / 纯色）
  - 亮/暗/跟随系统三种主题模式 + 360° 色相调节
  - i18n 多语言 UI（zh_CN / zh_TW / en / ja / ru / ko）
  - Pagefind 全文搜索、Mermaid/PlantUML 图表、KaTeX 数学公式
  - 加密文章（AES-256-GCM）、分享海报、相关文章推荐
  - Live2D / Spine 看板娘
  - 5 种评论系统（Twikoo / Waline / Giscus / Disqus / Artalk）

> **本 Wiki 不会重复 README 已有的"使用层面"说明**，仅从代码架构视角展开。若需了解如何使用某项功能，请先看 [官方使用文档](https://docs-firefly.cuteleaf.cn/zh/guide/getting-started.html)。

---

## 2. 技术栈与依赖

### 2.1 核心技术栈

| 类别 | 技术 | 版本约束 |
|------|------|---------|
| 框架 | Astro | `7.1.3` |
| UI 交互 | Svelte | `^5.56.7` |
| 样式 | Tailwind CSS v4 | `^4.3.3` |
| 语言 | TypeScript | `^6.0.3` |
| 包管理 | pnpm | `9.14.4`（`preinstall` 强制） |
| 运行时 | Node.js | `>= 22` |
| Linter/Formatter | Biome | `2.5.5` |
| 图标系统 | @iconify/svelte 离线模式 | `^2.3.0` |
| 页面过渡 | Swup（`@swup/astro`） | `^1.8.0` |
| 搜索 | Pagefind | `^1.5.2` |
| 图像处理 | sharp | `^0.35.3` |
| 日期 | dayjs | `^1.11.21` |
| Mermaid | `@mermanjs/web`（WASM） | `0.8.0-alpha.3` |

### 2.2 关键依赖分组

- **Astro 集成**：`@astrojs/svelte`、`@astrojs/mdx`、`@astrojs/sitemap`、`@astrojs/rss`、`@astrojs/cloudflare`、`@swup/astro`、`astro-expressive-code`、`astro-icon`
- **图标集**（`@iconify-json/*`）：`material-symbols`、`fa7-brands`、`fa7-regular`、`fa7-solid`、`simple-icons`、`mdi`、`mingcute`、`svg-spinners`
- **Markdown 处理**：`remark-math`、`remark-directive`、`remark-sectionize`、`rehype-katex`、`rehype-slug`、`rehype-autolink-headings`、`rehype-callouts`、`rehype-components`
- **特色功能**：`katex`、`qrcode`、`satori`（OG 图生成）、`pako`（PlantUML 编码）、`l2d-widget`、`@fancyapps/ui`（Fancybox 灯箱）、`sanitize-html`

完整清单见 [package.json](file:///e:/Dev/Projects/Firefly-trae-custom/package.json)。

---

## 3. 项目结构总览

```
Firefly/
├── .github/                     # CI 工作流（biome / build / deploy）、Issue 模板、dependabot
├── docs/                         # 多语言 README 与截图
├── public/                       # 直接服务的静态资源（不优化）
│   ├── assets/                   # css / fonts / images / js / music
│   ├── favicon/                  # 多尺寸站点图标
│   ├── gallery/                  # 相册源图与 urls.txt
│   └── pio/                      # Live2D / Spine 看板娘模型
├── scripts/                      # 构建期脚本（详见 §5.10）
├── src/
│   ├── assets/images/            # 受 Astro 优化的源图（壁纸、头像、封面）
│   ├── components/               # 按领域分组的组件（详见 §5.2）
│   ├── config/                   # 所有功能开关配置（详见 §5.1）
│   ├── constants/                # 构建期生成的常量（icons-data.json / lqips.json）
│   ├── content/                  # 内容集合源（posts / spec / dynamic）
│   ├── i18n/                     # 国际化键与翻译
│   ├── layouts/                  # 基础布局（Layout / MainGridLayout）
│   ├── pages/                    # Astro 文件路由（详见 §5.3）
│   ├── plugins/                  # 自定义 remark / rehype 插件（详见 §5.4）
│   ├── styles/                   # CSS / Styl 样式
│   ├── types/                    # 与 src/config 同构的类型定义
│   ├── utils/                    # 工具函数（详见 §5.5）
│   ├── content.config.ts         # 内容集合 schema 定义
│   ├── env.d.ts / global.d.ts    # 环境类型声明
├── astro.config.mjs              # Astro 主配置（详见 §4.2）
├── biome.json                    # 格式化与 lint 规则
├── pagefind.yml                  # 搜索索引排除规则
├── postcss.config.mjs            # PostCSS 配置
├── vercel.json / wrangler.jsonc  # 部署平台配置
├── AGENTS.md / CLAUDE.md         # Agent 与 AI 协作指引
└── package.json
```

> **路径别名**（`tsconfig.json`）：`@components/*`、`@assets/*`、`@constants/*`、`@utils/*`、`@i18n/*`、`@layouts/*` → `./src/<dir>/*`；`@/*` → `./src/*`。**新增代码应优先从 `@/config` 整体导入配置**。

---

## 4. 核心架构

### 4.1 Astro + Svelte 混合架构

Firefly 采用 **Astro Islands 架构**：

- `.astro` 组件 → 默认在服务端渲染，输出零 JS 的静态 HTML
- `.svelte` 组件 → 通过 `client:load` / `client:visible` 指令水合，仅承担必要的交互（搜索、分页、设置面板、TOC、追番、相册网格等）
- **Swup.js** 在客户端接管页面切换，按"容器"局部替换 DOM，提供 SPA 体验。Swup 配置的容器列表见 [astro.config.mjs](file:///e:/Dev/Projects/Firefly-trae-custom/astro.config.mjs#L96-L123)：
  - `#banner-overlay-container`、`#banner-dim-container`
  - `#swup-container`（主内容）
  - `#left-sidebar-dynamic`、`#right-sidebar-dynamic`
  - `#floating-toc-wrapper`

### 4.2 配置驱动体系

所有功能模块由 `src/config/*.ts` 控制，通过 [src/config/index.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/index.ts) 统一 barrel 导出。组件应从 `@/config` 而非具体文件导入，以减少 import 语句数。

`astro.config.mjs` 在构建期读取这些配置（`siteConfig`、`fontConfig`、`expressiveCodeConfig`、`mermaidConfig`、`plantumlConfig`）传入 Astro 集成。**修改这些配置后必须重启 dev server**。

### 4.3 布局系统

布局分两层，详见 [src/layouts/](file:///e:/Dev/Projects/Firefly-trae-custom/src/layouts/)：

```
Layout.astro          # 基础 HTML 壳：head / meta / 主题初始化 / analytics / Swup hooks 注册
  └─ MainGridLayout.astro  # 完整页面网格：navbar + wallpaper + 双侧栏 + 主内容 + footer
```

#### Layout.astro 关键职责

- 处理 SEO meta（title / description / keywords / OG / Twitter Card / JSON-LD）
- 注入 Favicon、RSS link、`<FontSetup />`
- **主题初始化脚本**（`is:inline`，渲染前执行以避免闪屏）：
  - 从 localStorage 读取 `theme` / `hue` / `wallpaperMode` / `wavesEnabled` / `gradientEnabled` / `bannerTitleEnabled`
  - 应用 `data-theme`、`data-wallpaper-mode`、`--hue`、`--banner-height-extend` 等 CSS 变量
  - 处理壁纸模式切换的 DOM 类（`enable-banner` / `no-banner-layout` / `wallpaper-transparent`）
- **图片 referrerpolicy 兜底脚本**：对动态注入的图片应用 `no-referrer`（防盗链图片 403 处理）
- 注册 Swup 生命周期钩子（`link:click` / `visit:start` / `content:replace` / `page:view` / `visit:end` / `scroll:top`）
- 初始化 TOC、icon loader、内容溢出容器、scroll 函数、网格列数计算
- 通过 `<ConfigCarrier />` 将 SSR 配置注入到客户端可读取的 DOM
- 通过 `<MusicManager />` / `<SakuraEffect />` / `<CursorTrail />` / `<FancyboxManager />` 挂载全局特性

#### MainGridLayout.astro 关键职责

- 计算 `gridCols` / `sidebarClass` / `rightSidebarClass` / `mainContentClass` / `footerClass`（基于 `responsive-utils.ts`）
- 渲染 `#top-row`（navbar wrapper）、`#wallpaper-wrapper`（壁纸容器，含轮播逻辑）、`#main-grid`（侧栏 + 内容 + footer 网格）
- 处理 `position: left | right | both` 三种侧栏模式与 `tabletSidebar` 平板断点逻辑
- 处理 `showBothSidebarsOnPostPage`（单侧栏模式下文章页临时双侧栏）
- 处理移动端底部组件 `mobileBottomComponents`
- 嵌入壁纸轮播脚本（`is:inline`，基于 CSS transition，支持 fade / slide / kenburns 三种过渡）
- 嵌入水波纹 SVG 与渐变过渡层
- 嵌入 Spine / Live2D 看板娘容器

### 4.4 内容集合

定义于 [src/content.config.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/content.config.ts)：

| 集合 | 加载路径 | Schema 概要 |
|------|---------|------------|
| `posts` | `src/content/posts/**/*.{md,mdx}` | `title` / `published` / `updated?` / `draft?` / `description?` / `image?` / `tags?` / `category?` / `lang?` / `pinned?` / `author?` / `sourceLink?` / `licenseName?` / `licenseUrl?` / `comment?` / `password?` / `passwordHint?` / `audio?`（文章绑定音频，字符串 URL 或 `{ url, name?, artist?, cover?, lrc?, instrumental? }` 对象，由 `post-audio.ts` 的 `normalizePostAudio()` 归一）以及内部使用的 `prevTitle` / `prevSlug` / `nextTitle` / `nextSlug` |
| `spec` | `src/content/spec/**/*.{md,mdx}` | 无 schema 约束（自由 frontmatter） |

**Draft 行为**：`PROD` 环境下自动过滤 `draft: true` 的文章（`content-utils.ts` 中的 `import.meta.env.PROD` 三元判断）。

### 4.5 主题与壁纸系统

#### 主题模式

- 三种模式：`light` / `dark` / `system`（默认值由 `siteConfig.themeColor.defaultMode` 决定）
- 通过 `localStorage.theme` 持久化，`<html>` 上的 `dark` 类与 `data-theme` 属性切换
- Expressive Code 的 `data-theme` 同步切换（`expressiveCodeConfig.darkTheme` / `lightTheme`）
- 色相 hue 由 `localStorage.hue` 持久化，写入 `--hue` CSS 变量

#### 壁纸模式

四种模式 + 切换/不可切换：

| 模式 | 说明 | 关键 DOM 类 |
|------|------|------------|
| `banner` | 横幅壁纸（首页占满，内页缩为顶栏背景） | `enable-banner` |
| `fullscreen` | 全屏壁纸 + 内容紧贴下方 | `wallpaper-fullscreen` + `no-banner-layout` |
| `overlay` | 全屏壁纸 + 半透明遮罩 + 卡片透明 | `wallpaper-overlay` + `wallpaper-transparent` |
| `none` | 纯色背景 | `no-banner-layout` |

壁纸模式由 `localStorage.wallpaperMode` 持久化，切换由 `setting-utils.ts` 的 `setWallpaperMode()` 统一处理，会派发 `wallpaperModeChange` 事件供轮播等子系统响应。

### 4.6 i18n 国际化

- **键定义**：[src/i18n/i18nKey.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/i18n/i18nKey.ts) 一个 `enum I18nKey`，新增 UI 文案时需在此扩展
- **语言文件**：[src/i18n/languages/](file:///e:/Dev/Projects/Firefly-trae-custom/src/i18n/languages/) 下 `en.ts` / `zh_CN.ts` / `zh_TW.ts` / `ja.ts` / `ru.ts` / `ko.ts`
- **查找函数**：[src/i18n/translation.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/i18n/translation.ts) 的 `i18n(key: I18nKey): string`
  - 默认语言为 `en`（兜底）
  - 当前语言缺失时回退到 `zh_CN`，再回退到 `en`
  - 别名映射：`en_us` → `en`，`zh_cn` → `zh_CN` 等
- **站点语言**：由 `siteConfig.lang`（`siteConfig.ts` 顶部 `SITE_LANG` 常量）控制
- **文章级语言**：可在 frontmatter 中通过 `lang` 字段覆盖
- 除简中外其他语言均为 AI 翻译，欢迎 PR 修正

### 4.7 Markdown 处理管线

Astro markdown processor（unified）的插件链见 [astro.config.mjs](file:///e:/Dev/Projects/Firefly-trae-custom/astro.config.mjs#L229-L291)。完整插件职责见 §5.4。

```
remark 阶段（MDAST）
  ├─ remarkAdmonitionToBlockquoteCallout（可选，Python-Markdown 风格 admonition）
  ├─ remarkMath                       （数学公式语法解析）
  ├─ remarkReadingTime                （计算阅读时长，写入 frontmatter）
  ├─ remarkImageGrid                  （[grid]…[/grid] 图片网格标记）
  ├─ remarkExcerpt                    （抽取首段为摘要）
  ├─ remarkDirective                  （启用 directive 语法）
  ├─ remarkSectionize                 （按标题分段为 <section>）
  ├─ parseDirectiveNode               （admonition / 自定义指令转换）
  ├─ remarkMermaid                    （识别 ```mermaid 代码块）
  └─ remarkPlantuml                   （识别 ```plantuml 代码块，生成主题 URL）

rehype 阶段（HAST）
  ├─ rehypeKatex                      （渲染数学为 KaTeX HTML）
  ├─ rehypeCallouts                   （提醒块样式）
  ├─ rehypeSlug                       （为标题添加 id）
  ├─ rehypeMermaid                    （构建时 WASM 渲染双主题 SVG）
  ├─ rehypePlantuml                   （改写为客户端 img + 主题切换脚本）
  ├─ rehypeDiagramPanZoom             （注入图表 pan-zoom 客户端脚本）
  ├─ rehypeFigure                     （img → figure + figcaption）
  ├─ rehypeImageReferrerPolicy        （防盗链域名加 no-referrer）
  ├─ rehypeExternalLinks              （外链 target=_blank + rel）
  ├─ rehypeEmailProtection            （mailto: 加密，base64 或 rot13）
  ├─ rehypeComponents(GithubCard)     （GitHub 仓库卡片）
  └─ rehypeAutolinkHeadings           （标题锚点）
```

### 4.8 自定义光标系统

通过 CSS `cursor: url()` 替换浏览器默认光标，支持 `.cur` 格式（含内置热点坐标）与 `.png` 混用。**仅作用于网页内 DOM，无法影响浏览器系统级 UI（如右键菜单、滚动条、表单原生下拉等）**——这是浏览器固有行为，非 Bug。

#### 配置入口

[cursorConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/cursorConfig.ts)：

```ts
export const cursorConfig: CursorConfig = {
  enable: false,           // 默认关闭
  switchable: true,        // 是否允许用户在显示设置中切换
  paths: {                 // 资源路径（相对于 public 目录）
    default:    "/assets/cursors/Arrow.cur",
    pointer:    "/assets/cursors/hand.cur",
    text:       "/assets/cursors/IBeam.cur",
    crosshair:  "/assets/cursors/Cross.cur",
    help:       "/assets/cursors/Help.cur",
    notAllowed: "/assets/cursors/No.cur",
    move:       "/assets/cursors/SizeAll.cur",
    nResize:    "/assets/cursors/SizeNS.cur",
    sResize:    "/assets/cursors/SizeNS.cur",
    eResize:    "/assets/cursors/SizeWE.cur",
    wResize:    "/assets/cursors/SizeWE.cur",
    neResize:   "/assets/cursors/SizeNESW.cur",
    swResize:   "/assets/cursors/SizeNESW.cur",
    nwResize:   "/assets/cursors/SizeNWSE.cur",
    seResize:   "/assets/cursors/SizeNWSE.cur",
  },
};
```

类型定义在 [types/effectsConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/types/effectsConfig.ts) 的 `CursorConfig`，与 `SakuraConfig` 同文件。`paths` 中每个字段对应一种 CSS 光标语义，留空则该类型回退到浏览器默认。

#### 应用机制

由 [CustomCursor.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/features/CustomCursor.astro) 在 [Layout.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/layouts/Layout.astro) 中 `<SakuraEffect />` 之后挂载。核心流程：

1. 通过 `define:vars` 将 `cursorConfig` 注入到 `is:inline` 内联脚本（不走 Astro 编译，零延迟执行）
2. 读取 `localStorage.cursorEnabled`（缺省回退到 `cursorConfig.enable`）
3. 启用时调用 `applyCursorStyle(paths)` 动态创建 `<style id="firefly-cursor-style">` 注入到 `<head>`，按元素类型生成多组 `cursor: url('...'), <keyword> !important;` 规则覆盖 Tailwind 的 `cursor-pointer` 等类
4. 监听 `cursorToggle` 自定义事件，响应用户在显示设置面板的开关切换

#### Swup 持久化

Swup 页面切换会替换整个 `<head>`，注入的 `<style>` 会丢失，而 `window.__fireflyCursorInitialized` 全局标记仍为 `true` 阻止重新初始化。为此 `setup()` 注册三重监听保证样式重新注入：

- `document.addEventListener('swup:contentReplaced', ...)` —— Swup v3 兼容
- `document.addEventListener('swup:content:replace', ...)` —— Swup v4 兼容
- `document.addEventListener('swup:enable', ...)` + 直接 `window.swup.hooks.on('content:replace', ...)` —— Swup 初始化后注册 hook

每次回调都重新读 `localStorage.cursorEnabled` 判断是否需要重新注入 `<style>`。

#### 用户开关

显示设置面板 [DisplaySettingsIntegrated.svelte](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/controls/DisplaySettingsIntegrated.svelte) 的"特效设置"区块（与樱花特效同区）渲染开关按钮，仅当 `cursorConfig.switchable === true` 时显示。切换流程：

1. UI 调用 `toggleCursorEnabled()` → `setCursorEnabled(value)`
2. `setCursorEnabled` 写入 `localStorage`、设置 `documentElement.dataset.cursorEnabled`、派发 `cursorToggle` 事件
3. `CustomCursor.astro` 监听到事件后 `applyCursorStyle` 或 `removeCursorStyle`

#### 资源约定

- 路径目录：`public/assets/cursors/`
- 推荐格式：`.cur`（Windows 光标格式，浏览器原生支持，含热点坐标）
- 不支持格式：`.ani`（动态光标，浏览器不支持）
- 可混用：`.png` 可与 `.cur` 混用，但需手动指定热点（CSS `cursor: url(x.png) 4 4, auto`），项目未采用
- 资源整理：用户提供的 14 个标准 Windows 光标资源（Arrow / hand / IBeam / Cross / Help / No / SizeAll / SizeNS / SizeWE / SizeNESW / SizeNWSE / AppStarting / UpArrow / Handwriting）

#### i18n

I18nKey 枚举 `customCursor`（[i18nKey.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/i18n/i18nKey.ts)），6 语言翻译：

| 语言 | 文案 |
|------|------|
| zh_CN | 自定义光标 |
| zh_TW | 自訂游標 |
| en | Custom Cursor |
| ja | カスタムカーソル |
| ko | 커스텀 커서 |
| ru | Кастомный курсор |

设置面板图标使用 `mdi:cursor-default`（[Icon.svelte](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/common/Icon.svelte) 通过 `@iconify/svelte` 离线模式加载），新增图标需手动从 `@iconify-json/*` 包提取 SVG body 追加到 [icons-data.json](file:///e:/Dev/Projects/Firefly-trae-custom/src/constants/icons-data.json)。

#### 已知限制

- 右键菜单、滚动条、原生表单下拉等浏览器系统 UI 仍显示原生光标，无法通过 CSS 覆盖
- 项目暂未实现自定义右键菜单组件，因此右键区域始终为原生光标
- `!important` 必须用于覆盖 Tailwind 的 `cursor-pointer` / `cursor-not-allowed` 等类

### 4.9 光标尾迹粒子系统

Canvas 2D 粒子系统，鼠标跟随的五瓣花形旋涡特效。复刻自 Wallpaper Engine `Cherry_Blossoms_2.json` 粒子配置，物理参数对照原版逐项映射。

#### 配置入口

[effectsConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/effectsConfig.ts) 的 `cursorTrailConfig`：

```ts
export const cursorTrailConfig: CursorTrailConfig = {
  enable: false,           // 默认关闭
  switchable: true,        // 是否允许用户在显示设置中切换
  imageSrc: "/assets/images/effects/cursor-petal-trimmed.png",
  maxParticles: 1000,      // 粒子池上限
  emitRate: 100,           // 每秒发射数量
  particleLife: { min: 1, max: 2.25 },   // 生命周期（秒）
  size: { min: 2.5, max: 3.5 },          // 花瓣宽度（像素）
  speed: { min: 0, max: 5 },             // 随机扩散速度
  gravity: { x: 0, y: 50 },              // 重力（Canvas Y 向下为正）
  drag: 1,                               // 阻力系数
  repel: { scale: -600, threshold: 25 }, // 近距离排斥
  attract: { scale: 500, threshold: 5000 }, // 远距离吸引
  vortex: { distanceOuter: 25, speed: 300 }, // 涡旋（线性衰减）
  trailLength: 1,                        // 拖尾长度
  sequenceCount: 5,                      // 序列分组数（五瓣花形）
  orbitRadius: 4,                        // 初始轨道偏移半径
  tangentSpeed: 50,                      // 初始切向速度
  colorRange: { min: [255, 173, 169], max: [249, 222, 255] }, // 粉红→淡紫
  zIndex: 100,
};
```

类型定义在 [types/effectsConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/types/effectsConfig.ts) 的 `CursorTrailConfig`。

#### 物理模型

粒子受到 5 种力的叠加作用，形成稳定的五瓣花形旋涡：

1. **排斥力**（`repel`）：距鼠标 < 25px 时施加反向力，线性衰减，防止粒子堆积在中心
2. **吸引力**（`attract`）：距鼠标 < 5000px 时施加正向力，线性衰减，将远处粒子拉回
3. **涡旋力**（`vortex`）：距鼠标 < 25px 时施加切向力，**线性衰减** `force = speed × (1 - dist/distanceOuter)`，形成圆周旋转
4. **重力**（`gravity`）：向下拉粒子，与涡旋叠加产生摆线/旋轮线轨迹
5. **阻力**（`drag`）：速度衰减，防止粒子无限加速

排斥 + 吸引在 `dist ≈ 4.2px` 处形成稳态环半径，涡旋使粒子绕环旋转，重力使轨迹向下偏移形成摆线。

#### 五瓣花形原理

`sequenceCount: 5` 实现原版 `mapsequencearoundcontrolpoint count:5` 语义：

- 粒子分 5 组，按 `2π/5 = 72°` 相位差围绕控制点发射
- Manager 维护 `_sequenceCounter`，每个新粒子递增并对 5 取模
- 5 组粒子以 72° 相位差同时做摆线运动，叠加后视觉上形成五瓣花形旋涡（而非简单圆环）

#### 颜色着色

原版 `colorrandom` 是运行时代码着色（非纹理资源）：纹理 `cursor-petal-trimmed.png` (78×138) 只是花瓣形状底图，粉色由代码在粒子诞生时随机插值 `粉红(255,173,169) → 淡紫(249,222,255)` 并与纹理 multiply 混合。

为性能采用**预渲染颜色档位缓存**：`buildTintedCache()` 将颜色范围量化为 8 档，每档用 `fillRect + multiply + destination-in` 三步生成着色后的离屏 canvas，粒子诞生时按随机色选档，draw 时直接用缓存，无需每帧混合。

#### 渲染混合

使用 `globalCompositeOperation = "lighter"`（加色混合）模拟原版 `overbright: 1.21` 发光感。配合**随机亮度层次**：15% 高亮粒子（alpha 0.5-0.7）制造闪烁，85% 普通粒子（alpha 0.15-0.35）构成紫红色锐利轮廓。加色混合下降低 alpha 避免大量粒子叠加过曝。

#### 应用机制

由 [CursorTrail.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/features/CursorTrail.astro) 在 [Layout.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/layouts/Layout.astro) 中挂载。核心流程：

1. 通过 `define:vars` 将 `cursorTrailConfig` 注入到 `is:inline` 内联脚本
2. 读取 `localStorage.cursorTrailEnabled`（缺省回退到 `cursorTrailConfig.enable`）
3. 启用时创建 `<canvas id="canvas_cursor_trail">` 固定全屏覆盖层，启动 `requestAnimationFrame` 动画循环
4. 监听 `cursorTrailToggle` 自定义事件，响应用户在显示设置面板的开关切换
5. `window.__fireflyCursorTrailInitialized` 全局标记防止 Swup 切页后重复初始化

#### 配置-组件解耦

同自定义光标系统：`setting-utils.ts` 只负责 localStorage 读写与事件派发，`CursorTrail.astro` 负责监听事件与 Canvas 动画循环。SSR 阶段不会因 `document` / `localStorage` 缺失而崩溃。

### 4.10 看板娘系统（SpineModel.astro + pioConfig.ts）

基于 [Spine Web Player](https://esotericsoftware.com/spine-player) 4.2 的多模型看板娘，支持前端设置面板实时切换模型与开关，配置驱动，新增模型只需改 `pioConfig.ts`。

#### 配置入口

[pioConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/pioConfig.ts) 的 `spineModelConfig`：

```ts
export const spineModelConfig: SpineModelConfig = {
  enable: true,                  // 总开关默认值（前端面板可覆盖）
  models: [                      // 可切换模型列表（模板化：追加 entry 即新增模型）
    {
      key: "105913",             // 唯一标识，存入 localStorage.pioModel
      name: "立绘",               // 前端按钮显示名（i18n 文案外的本地名）
      model: {
        path: "/pio/models/spine/105913/105913.json",
        scale: 0.24,
        skin: "normal",          // 立绘类模型眼嘴贴图在命名皮肤里，不指定只显示 base
        premultipliedAlpha: true,// Spine 3.6 默认预乘 alpha，配 false 半透明区会变灰
        viewportPadding: { left: 0, right: 0, top: 0, bottom: 0 }, // 全 0 贴底
      },
      size: { width: 150, height: 245 },
      position: { corner: "bottom-left", offsetX: 0, offsetY: 0 },
      interactive: {
        enabled: true,
        clickAnimations: ["mouth_talk", "eye_blink"],
        clickMessages: ["你好呀！", ...],  // 该模型专属台词
        messageDisplayTime: 3000,
        idleAnimations: ["eye_idle"],      // 该模型专属待机
        idleInterval: 8000,
      },
    },
    // ...其他模型 entry
  ],
  defaultModel: "105913",        // 无 localStorage 时默认激活的 key
  // 单模型字段（models 为空时回退使用，向后兼容）
  model: { path: "...", scale: 0.24, ... },
  position: { corner: "bottom-left", offsetX: 0, offsetY: 0 },
  size: { width: 150, height: 245 },
  interactive: { enabled: true, ... },
  responsive: { hideOnMobile: true, mobileBreakpoint: 768 },
};
```

类型定义在 [types/pioConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/types/pioConfig.ts) 的 `SpineModelConfig` / `SpineModelEntry`。每个 entry 字段独立，模型间互不干扰。

#### 多模型架构

[SpineModel.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/features/SpineModel.astro) 的 `getActiveModelConfig()` 按以下优先级解析当前激活模型：

1. 读 `localStorage.pioModel` 获取 key
2. key 为空时回退 `spineModelConfig.defaultModel`
3. 在 `modelsWithURL` 中按 key 查找 entry，找不到回退 `models[0]`
4. entry 字段为空时回退全局 `spineModelConfig.model.*` / `position.*` / `size.*` / `interactive.*`
5. `models` 列表为空时整体回退单模型字段（向后兼容旧配置）

返回的 `mc` 对象在运行时统一驱动容器尺寸、位置、SpinePlayer 创建、皮肤设置、点击/待机动画与消息显示，组件代码无任何模型特定硬编码（`"idle"` 仅作 Spine 行业惯例的兜底默认动画名）。

#### viewportPadding 与贴底显示

SpinePlayer 默认 `padLeft/Right/Top/Bottom: "10%"`，会在 canvas 四周留 10% 内边距。半身立绘类模型（如 105913）腿部截断，需要贴窗口底部显示时，通过 `viewportPadding: { left: 0, right: 0, top: 0, bottom: 0 }` 让 skeleton 贴 canvas 边。完整角色形象（如 firefly）不配 `viewportPadding`，保留 SpinePlayer 默认 10% 与底部的间距。

[SpineModel.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/features/SpineModel.astro) 构造 SpinePlayer 时：

```js
const pad = mc.viewportPadding;
const viewportCfg = pad
  ? { padLeft: pad.left ?? "10%", padRight: pad.right ?? "10%",
      padTop: pad.top ?? "10%", padBottom: pad.bottom ?? "10%" }
  : undefined;  // 不传则用 SpinePlayer 默认 10%

new window.spine.SpinePlayer("spine-player-container", {
  skeleton: mc.path,
  atlas: mc.atlas,           // 由 path 替换 .json→.atlas 推导
  animation: mc.interactive?.idleAnimations?.[0] || "idle",
  premultipliedAlpha: mc.premultipliedAlpha,
  ...(viewportCfg ? { viewport: viewportCfg } : {}),
  success: (player) => { /* ... */ },
});
```

#### 应用机制

由 [SpineModel.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/features/SpineModel.astro) 在 [MainGridLayout.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/layouts/MainGridLayout.astro) 中挂载。核心流程：

1. frontmatter 预处理 `modelsWithURL`，把 `path` 转 URL 供运行时使用
2. `initSpineModel()` 读 `localStorage.pioEnabled`，false 时隐藏容器直接返回
3. 调 `getActiveModelConfig()` 取 `mc`，`applyContainerStyle(mc)` 应用容器尺寸/位置
4. `cleanupSpineModel()` 清理旧实例 → `loadSpineCSS()` → 加载 Spine Web Player 运行时（CDN 失败回退本地 `/pio/static/spine-player.min.js`）
5. 创建 `new window.spine.SpinePlayer(...)`，`success` 回调中：
   - 构建 `availableAnimations` Set，过滤配置中不存在的动画名（避免 `loadSkeleton` 报错）
   - 显式 `setSkinByName(mc.skin)`（立绘类模型眼嘴贴图在命名皮肤里）
   - 绑定 canvas click：随机 `clickAnimations` + 随机 `clickMessages`（两者独立随机，未绑定对应关系）
   - 启动 `idleInterval` 待机动画循环（至少两个有效待机动画时启用）
6. `window.spineModelInitialized` 全局标记防重复初始化
7. `window.spinePlayerInstance` 保存实例引用供 dispose 与调试

#### 前端设置面板

[DisplaySettingsIntegrated.svelte](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/controls/DisplaySettingsIntegrated.svelte) 的独立「看板娘」选项卡（`mdi:cat` 图标），仅当 `isPioSwitchable = (spineModelConfig.models.length > 0) && spineModelConfig.enable` 为 true 时显示。选项卡内容：

- 看板娘开关（`localStorage.pioEnabled`，派发 `pioToggle` 事件）
- 模型选择按钮组（遍历 `spineModelConfig.models`，点击 `setPioModel(model.key)` 派发 `pioModelChange` 事件）
- 恢复默认按钮（同时重置开关与模型到 `defaultPioEnabled` / `defaultPioModel`）

#### 事件流

| 用户操作 | setting-utils 函数 | 派发事件 | SpineModel.astro 响应 |
|---------|-------------------|---------|----------------------|
| 切换开关 | `setPioEnabled(bool)` | `pioToggle` | 开启 → `initSpineModel()`；关闭 → `cleanupSpineModel()` + 隐藏容器 |
| 切换模型 | `setPioModel(key)` | `pioModelChange` | `cleanupSpineModel()` → `initSpineModel()`（读新 key 重建） |

#### 新增模型步骤（模板化）

1. 将 Spine 资源（`.json` / `.atlas` / `.png`）放入 `public/pio/models/spine/<key>/`
2. 在 `spineModelConfig.models` 数组追加一个 `SpineModelEntry`，填 `key` / `name` / `model.path` / `scale` / `skin` / `premultipliedAlpha` / `viewportPadding` / `size` / `position` / `interactive`
3. 无需改任何组件代码——前端按钮组会自动遍历 `models` 显示，`getActiveModelConfig()` 会按 key 解析

#### 已知限制

- 点击动画与点击消息是**独立随机**，未绑定对应关系（如「你好呀！」不一定配 `mouth_talk`）。需要绑定需扩展 schema（`clickEvents: [{message, animation}]`），见会话历史讨论
- 某些 emoji 动画可能不适合做待机（如流萤的某个 emoji 会有雾气包裹脸部的视觉），从 `idleAnimations` 中移除该动画名即可（仅改 pioConfig.ts 一行）
- `SpineModel.astro` frontmatter 的 `spineModelConfig.model.*` 引用是构建单模型回退路径，运行时优先使用 `models` 列表，不可删除

---

## 5. 主要模块职责

### 5.1 `src/config/` —— 配置中心

所有配置文件遵循"自包含 + 中文注释"原则，类型定义在 `src/types/` 同名文件中。

| 配置文件 | 导出名 | 控制内容 |
|---------|-------|---------|
| [siteConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/siteConfig.ts) | `siteConfig` | 站点标题/URL/描述/关键词、主题色、页面宽度、favicon、navbar、页面开关（friends/sponsor/guestbook/bangumi/gallery/anime）、文章列表布局、文章页配置、bangumi、anime、分页、图像优化、语言 |
| [navBarConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/navBarConfig.ts) | `navBarConfig`, `navBarSearchConfig` | 导航栏链接（含子菜单）与搜索配置 |
| [sidebarConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/sidebarConfig.ts) | `sidebarLayoutConfig` | 侧边栏开关、position（left/right/both）、tabletSidebar、hideSidebarOnPostPage、showBothSidebarsOnPostPage、leftComponents / rightComponents / mobileBottomComponents |
| [profileConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/profileConfig.ts) | `profileConfig` | 头像、姓名、签名、社交链接 |
| [backgroundWallpaper.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/backgroundWallpaper.ts) | `backgroundWallpaper` | 壁纸模式、切换开关、背景视频播放、桌面/移动图源、轮播、水波纹、渐变过渡、homeText、overlay 透明度/模糊 |
| [commentConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/commentConfig.ts) | `commentConfig` | 5 种评论系统：twikoo / waline / giscus / disqus / artalk |
| [musicConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/musicConfig.ts) | `musicPlayerConfig` | Meting API / 本地音乐模式、音量、播放模式、歌词 |
| [fontConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/fontConfig.ts) | `fontConfig`, `fontsList` | Astro Font API 字体定义 + 区域字体选择 + 子集化 |
| [coverImageConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/coverImageConfig.ts) | `coverImageConfig` | 封面图在列表/文章页的显示开关 |
| [expressiveCodeConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/expressiveCodeConfig.ts) | `expressiveCodeConfig` | 代码块主题、折叠插件、语言徽章插件 |
| [effectsConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/effectsConfig.ts) | `sakuraConfig`, `cursorTrailConfig` | 樱花飘落特效、光标尾迹粒子系统 |
| [cursorConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/cursorConfig.ts) | `cursorConfig` | 自定义鼠标光标（`.cur` 资源映射 + 用户开关，详见 §4.8） |
| [announcementConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/announcementConfig.ts) | `announcementConfig` | 公告内容 |
| [footerConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/footerConfig.ts) | `footerConfig` | 页脚 HTML 注入 |
| [licenseConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/licenseConfig.ts) | `licenseConfig` | 文章许可证显示 |
| [friendsConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/friendsConfig.ts) | `friendsPageConfig`, `getEnabledFriends()` | 友链页配置 |
| [galleryConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/galleryConfig.ts) | `galleryConfig` | 相册页配置 |
| [sponsorConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/sponsorConfig.ts) | `sponsorConfig` | 打赏页配置 |
| [pioConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/pioConfig.ts) | `live2dWidgetConfig`, `spineModelConfig` | Live2D 看板娘；Spine 看板娘（多模型 + 前端切换，详见 §4.10） |
| [mermaidConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/mermaidConfig.ts) | `mermaidConfig` | Mermaid 主题 |
| [plantumlConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/plantumlConfig.ts) | `plantumlConfig` | PlantUML 服务器、主题 |
| [analyticsConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/analyticsConfig.ts) | `analyticsConfig` | Google / Microsoft Clarity / Umami / La51 统计 |
| [index.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/index.ts) | （barrel） | 统一导出全部配置 + 类型 |

### 5.2 `src/components/` —— 组件库

按领域分目录组织，详见各子目录的 README：

| 子目录 | 内容 | 主要技术 |
|--------|------|----------|
| `analytics/` | GoogleAnalytics / La51Analytics / MicrosoftClarity / UmamiAnalytics | `.astro`，按需条件渲染 |
| `comment/` | Artalk / Disqus / Giscus / Twikoo / Waline + `index.astro` 路由 | `.astro`，运行时加载远程脚本 |
| `common/` | ButtonLink / ButtonTag / ClientPagination / CoverImage / DropdownItem / DropdownPanel / FloatingButton / Icon / ImageWrapper / Markdown / Pagination / PioMessageBox / WidgetLayout | `.astro` + `.svelte` 混合 |
| `controls/` | ArchivePanel / BackToComment / BackToHome / BackToTop / DisplaySettings / FloatingControls / FloatingTOC / LayoutSwitchButton / LightDarkSwitch / ScrollDownIndicator / Search / WallpaperSwitch | `.svelte` 为主（交互控件） |
| `features/` | BackgroundPlayer / CustomCursor / CursorTrail / EncryptedContent / EncryptedPost / FancyboxManager / FontSetup / KatexManager / Live2DWidget / MusicManager / MusicPlayer / PostAudioBar / SakuraEffect / SpineModel / TypewriterText | `.astro`，全局特性挂载点 |
| `layout/` | CategoryBar / ConfigCarrier / DropdownMenu / Footer / NavMenuPanel / Navbar / PostCard / PostMeta / PostPage / PostStats / SideBar | `.astro`，页面骨架 |
| `misc/` | License / RecommendedPost / SharePoster | `.astro` + `.svelte` |
| `pages/` | anime / bangumi / gallery / AdvancedSearch | `.svelte` 为主（页面级交互组件） |
| `widget/` | Advertisement / Announcement / Calendar / Categories / Music / Profile / SidebarTOC / SiteInfo / SiteStats / SpineModel / Tags | `.astro`，侧边栏小组件 |

### 5.3 `src/pages/` —— Astro 文件路由

| 路由 | 文件 | 说明 |
|------|------|------|
| `/` 与分页 `/page/N/` | `[...page].astro` | 首页文章列表，使用 `paginate()` |
| `/posts/[slug]` | `posts/[...slug].astro` | 文章详情页，含封面/目录/评论/相关推荐/分享海报/许可证/上下篇 |
| `/categories/` | `categories/index.astro` | 分类归档 |
| `/tags/` | `tags/index.astro` | 标签归档 |
| `/archive` | `archive.astro` | 时间轴归档 |
| `/about` | `about.astro` | 关于页（spec 集合） |
| `/friends` | `friends.astro` | 友链页（spec 集合，受 `siteConfig.pages.friends` 开关） |
| `/guestbook` | `guestbook.astro` | 留言板（spec 集合，依赖评论系统） |
| `/gallery` / `/gallery/[album]` | `gallery/index.astro` / `gallery/[album].astro` | 相册列表与相册详情 |
| `/anime` | `anime.astro` | 追番页（Bilibili + TMDB） |
| `/bangumi` | `bangumi.astro` | 番组计划页（Bangumi API） |
| `/sponsor` | `sponsor.astro` | 打赏页 |
| `/search` | `search.astro` | Pagefind 搜索页 |
| `/rss/` | `rss.astro` | RSS 介绍页（含复制链接） |
| `/rss.xml` | `rss.xml.ts` | RSS feed |
| `/robots.txt` | `robots.txt.ts` | 爬虫规则 |
| `/og/[...slug].png` | `og/[...slug].ts` | 动态 OG 图生成（satori） |
| `/api/allPostMeta.json` | `api/allPostMeta.json.ts` | 文章元数据 JSON API（客户端搜索预筛选用） |
| 404 | `404.astro` | 自定义 404 |

### 5.4 `src/plugins/` —— 自定义 Markdown 插件

#### 5.4.1 Remark 插件（MDAST）

| 文件 | 导出 | 作用 |
|------|------|------|
| [remark-mermaid.js](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/remark-mermaid.js) | `remarkMermaid()` | 识别 ` ```mermaid ` 代码块，改写为 `div.mermaid-container` 自定义节点（代码存入 `data-mermaid-code` 与 `hChildren`，MDX 兼容） |
| [remark-plantuml.js](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/remark-plantuml.js) | `remarkPlantuml(options)` | 识别 ` ```plantuml ` 代码块，调用 `plantuml-encoder.js` 生成双主题 URL，改写为 `div.plantuml-container` 节点 |
| [remark-excerpt.js](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/remark-excerpt.js) | `remarkExcerpt()` | 取文章首个 paragraph 作为摘要，写入 `data.astro.frontmatter.excerpt` |
| [remark-reading-time.mjs](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/remark-reading-time.mjs) | `remarkReadingTime()` | 用 `reading-time` 计算阅读时长，写入 `frontmatter.minutes`（最小 1）与 `words` |
| [remark-image-grid.js](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/remark-image-grid.js) | `remarkImageGrid()` | 解析 `[grid]…[/grid]` 标记，按图片数自动选 1-4 列 Tailwind grid 类，包裹为 `div.image-grid` |
| [remark-directive-rehype.js](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/remark-directive-rehype.js) | `parseDirectiveNode()` | 处理 remark directive 节点：将 28 种 admonition 类型转为 `blockquote` 并注入 `[!TYPE]`；其他 directive 转为自定义 HTML 标签（hastscript） |

#### 5.4.2 Rehype 插件（HAST）

| 文件 | 导出 | 作用 | 运行阶段 |
|------|------|------|---------|
| [rehype-mermaid.mjs](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/rehype-mermaid.mjs) | `rehypeMermaid(options)` | **构建时**用 `@mermanjs/web` (WASM) 渲染 light/dark 双主题静态 SVG，注入 `div.mermaid-wrapper`；失败降级为错误提示 + 源码 fallback | 构建时（WASM） |
| [rehype-plantuml.mjs](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/rehype-plantuml.mjs) | `rehypePlantuml()` | 改写为 `.plantuml-diagram-container` + `<img>` 携带 `data-light-src`/`data-dark-src`，每棵 tree 末尾注入 `plantuml-theme-switch.js` 客户端脚本 | 构建时（注入客户端脚本） |
| [rehype-diagram-panzoom.mjs](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/rehype-diagram-panzoom.mjs) | `rehypeDiagramPanZoom()` | 共享图表交互：为 `.diagram-container` 注入 `diagram-panzoom-script.js`，提供 pan-zoom/全屏控制；`WeakSet` 防重复注入 | 构建时（注入客户端脚本） |
| [rehype-component-github-card.mjs](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/rehype-component-github-card.mjs) | `GithubCardComponent(properties, children)` | 生成 GitHub 仓库卡片，内联 `<script>` 在客户端 fetch `api.github.com` 填充 avatar/stars/forks/license；校验 `repo` 必须为 `owner/repo` | 构建时（生成内联 fetch 脚本） |
| [rehype-email-protection.mjs](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/rehype-email-protection.mjs) | `default rehypeEmailProtection(options)` | 加密 `mailto:` 链接（`base64` 或 `rot13`），`onclick` 内联脚本解码跳转，移除原 `href` 防爬虫 | 构建时 |
| [rehype-external-links.mjs](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/rehype-external-links.mjs) | `default rehypeExternalLinks(options)` | 为 http/https 外部链接（排除 `siteUrl` 同域）添加 `target="_blank"` + `rel="noopener noreferrer"` | 构建时 |
| [rehype-figure.mjs](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/rehype-figure.mjs) | `default rehypeFigure()` | 将带 alt 文本的 `<img>` 转为 `<center><figure><img><figcaption></figure></center>`；跳过 `.plantuml-image`；调用 `image-utils.ts#shouldAddNoReferrer` 补 `referrerpolicy` | 构建时 |
| [rehype-image-referrerpolicy.mjs](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/rehype-image-referrerpolicy.mjs) | `default rehypeImageReferrerPolicy(options)` | 为匹配 `domains`（支持 `*` 通配符）域名的 `<img>` 添加 `referrerpolicy="no-referrer"` | 构建时 |

#### 5.4.3 辅助文件

| 文件 | 关键导出 | 作用 |
|------|---------|------|
| [utils/diagramConstants.js](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/utils/diagramConstants.js) | `DIAGRAM_CONTAINER`、`DIAGRAM_WRAPPER`、`MERMAID_*`、`PLANTUML_*`、`DIAGRAM_CONTROLS`、`DIAGRAM_CTRL_BTN`、`DIAGRAM_FS_*` | 集中管理图表插件共享的 CSS 类名常量 |
| [utils/extractText.js](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/utils/extractText.js) | `extractText(node)` | 递归提取 HAST 节点树的纯文本 |
| [plantuml-encoder.js](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/plantuml-encoder.js) | `encodePlantUML(source)`、`injectTheme(source, themeName)`、`buildUrl(server, encoded)` | PlantUML 专用编码：UTF-8 → raw DEFLATE（`pako.deflateRaw` level 9）→ PlantUML 自定义 base64 字母表（`0-9A-Za-z-_`，无 `=` 填充）；`injectTheme` 在 `@startuml` 后注入 `!theme`（已显式声明主题时跳过） |
| [diagram-panzoom-script.js](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/diagram-panzoom-script.js) | IIFE，挂载 `window._diagramPanZoomInit` / `window._diagramPanZoomReinit` | **客户端运行时**共享图表交互：拖拽平移、缩放控制栏、双击放大、全屏 overlay（pinch-to-zoom）、响应 `astro:page-load` / `astro:before-preparation` / `password:decrypted` 事件 |
| [plantuml-theme-switch.js](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/plantuml-theme-switch.js) | IIFE，挂载 `window.plantumlThemeInit` | **客户端运行时**新版 PlantUML 脚本：主题切换（`MutationObserver` 监听 `<html>.dark`）、加载失败降级（重试时调 `window._diagramPanZoomReinit`） |
| [plantuml-render-script.js](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/plantuml-render-script.js) | IIFE，挂载 `window.plantumlInitialized` | **客户端运行时**旧版一体化脚本（自带主题切换 + pan-zoom + 全屏，使用独立类名）。**当前未被 rehype-plantuml.mjs 引用**，疑似遗留代码 |

> **架构提示**：Mermaid 构建时静态渲染 SVG（无运行时网络依赖）；PlantUML 构建时只生成 URL，运行时浏览器请求 PlantUML 服务器获取 SVG，因此需要额外的主题切换/失败重试脚本。

### 5.5 `src/utils/` —— 工具函数

#### 构建时（SSR / Node.js）

| 文件 | 关键导出 | 作用 |
|------|---------|------|
| [build-platform.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/build-platform.ts) | `detectBuildPlatform({...})` | 检测构建平台（FIREFLY_BUILD_PLATFORM env → ciName → EdgeOne Pages → ESA Pages → isCI → Local/Local Dev） |
| [content-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/content-utils.ts) | `getSortedPosts()`、`getSortedPostsList()`、`getTagList()`、`getCategoryList()`、`getRelatedPosts(currentPost, maxCount=5)`、类型 `PostForList`/`Tag`/`Category` | 文章集合处理：按 pinned + published 排序、计算前后文链接、聚合标签/分类、相关文章推荐（标签 Jaccard ×100 + 标题分词 Jaccard ×100 + 6 个月半衰期 ×30 + 同分类 +10） |
| [crypto-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/crypto-utils.ts) | `encryptContent(html, password, slug)` | AES-256-GCM 加密 HTML：HMAC-SHA256 派生确定性 salt/iv（同输入同输出，便于 sessionStorage 缓存），PBKDF2 10 万次迭代派生密钥，输出 `base64(salt[16]+iv[12]+authTag[16]+ciphertext)` |
| [fontHelper.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/fontHelper.ts) | `collectUsedFontCssVars(config)`、`toPublicPath(rawSrc)` | 收集 `selected` / `bannerTitleFont` / `navbarTitleFont` / `codeFont` 中非 `system` 的 CSS 变量名；将 `./public/...`、`public/...`、`/public/...` 转为 `/...` 访问路径 |
| [gallery-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/gallery-utils.ts) | `scanAlbumPhotos(albumId)`、`getAlbumCover(album, photos)` | 扫描 `public/gallery/<albumId>/` 下图片（jpg/png/webp/avif/gif），`cover.*` 排首位；读取 `urls.txt` 远程 URL；封面优先级：手动 > cover.* > 首图 |
| [post-audio.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/post-audio.ts) | `normalizePostAudio(raw)`、类型 `PostAudioInput`/`PostAudioTrack` | 文章 frontmatter `audio` 字段归一：字符串/对象双模式统一为曲目对象；`url`/`cover` 完整 URL 透传、相对路径经 `url()` 解析，`lrc` 区分 URL 与内联 LRC 文本，字符串模式 `name` 取文件名（decodeURIComponent，去扩展名） |
| [lqip-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/lqip-utils.ts) | `getLqipGradient(src, basePath?, isPublic?)`、`isExternalImage(src)`、`getLqipStyle(src, ...)`、`getLqipProps(src, ...)` | LQIP 渐变：从 `@constants/lqips.json` 读取 18 字符 hex 紧凑格式，解码为 `linear-gradient(135deg, #xxx 0%, #xxx 50%, #xxx 100%)`；外部图片降级 |
| [responsive-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/responsive-utils.ts) | `getResponsiveSidebarConfig()`、`generateGridClasses(config)`、`generateSidebarClasses(config)`、`generateRightSidebarClasses(config)`、`generateMainContentClasses(config)`、类型 `ResponsiveSidebarConfig` | 基于 `sidebarLayoutConfig.position` 与 `tabletSidebar` 生成 Tailwind 网格类（768px / 769px / 1280px 三档断点） |
| [image-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/image-utils.ts) | `processCoverImageSync(image, seed)`、`getApiUrlList(image, seed)`、`getImageFormats()`、`getImageQuality()`、`getFallbackFormat()`、`shouldAddNoReferrer(urlStr)` | 封面图处理：`image==="api"` 返回随机封面 API URL（带 seed 哈希）；读取 `siteConfig.imageOptimization`；通配符域名匹配 |

#### 客户端运行时

| 文件 | 关键导出 | 作用 |
|------|---------|------|
| [icon-loader.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/icon-loader.ts) | `initIconLoader()` | 监听 `[data-icon-container]` 的 iconify-icon shadowRoot，显示加载指示器/图标；`MutationObserver` 监听新增容器，5 秒超时保护 |
| [navigation-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/navigation-utils.ts) | `navigateToPage(url, options?)`、`isSwupReady()`、`waitForSwup(timeout=5000)`、`preloadPage(url)`、`getCurrentPath()`、`isHomePage()`、`isPostPage()`、`pathsEqual(path1, path2)` | 优先用 `window.swup.navigate` 无刷新跳转，失败降级 `location.href`；外部链接 `window.open`；锚点 `scrollIntoView` |
| [sakura-manager.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/sakura-manager.ts) | `SakuraManager` 类、`initSakura(config)`、`toggleSakura()`、`stopSakura()`、`getSakuraStatus()` | Canvas + `requestAnimationFrame` 樱花飘落特效；支持位置/速度/旋转/透明度配置、`limitTimes` 限制次数、resize 处理；全局单例 `globalSakuraManager` |
| [setting-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/setting-utils.ts) | 见下 | **客户端设置中心**：统一管理 localStorage 持久化 + DOM 应用，涵盖主题/壁纸模式/Overlay 透明度模糊/Waves/Gradient/Sakura/Banner 标题与轮播/自定义光标。每个设置项遵循 `getDefault*` / `getStored*` / `set*` / `apply*ToDocument` 四件套模式（光标仅前三步，DOM 应用在 `CustomCursor.astro` 中完成） |
| [toc-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/toc-utils.ts) | `TOCManager` 类、`isPostPage()`、类型 `TOCConfig` | `IntersectionObserver` 监听标题可见性、活动指示器定位、点击平滑滚动（节流 100ms）、`anchorsMatchCurrentContent` 检测 SSR 锚点是否过期；`attach()` 优先复用 SSR 锚点，失败回退 `render()` 重建 |

`setting-utils.ts` 详细导出清单：

- **主题**：`getDefaultHue` / `getDefaultTheme` / `getSystemTheme` / `resolveTheme` / `getHue` / `setHue` / `applyThemeToDocument` / `setTheme` / `setupSystemThemeListener` / `getStoredTheme` / `initThemeListener`
- **壁纸**：`applyWallpaperModeToDocument` / `setWallpaperMode` / `initWallpaperMode` / `getStoredWallpaperMode` + `showBannerMode` / `showFullscreenMode` / `showOverlayMode` / `hideAllWallpapers` / `updateNavbarTransparency` / `adjustMainContentPosition` / `adjustMainContentTransparency`
- **Overlay**：`getDefaultOverlayOpacity` / `getStoredOverlayBlur` / `setOverlayCardOpacity` / `applyStoredOverlaySettingsToDocument`
- **Waves**：`getDefaultWavesEnabled` / `setWavesEnabled` / `applyWavesEnabledToDocument`
- **Gradient**：`getDefaultGradientEnabled` / `setGradientEnabled` / `applyGradientEnabledToDocument`
- **Sakura**：`getDefaultSakuraEnabled` / `getStoredSakuraEnabled` / `setSakuraEnabled`
- **Banner**：`getDefaultBannerTitleEnabled` / `getStoredBannerTitleEnabled` / `setBannerTitleEnabled` / `applyBannerTitleEnabledToDocument` / `getDefaultBannerCarouselEnabled` / `getStoredBannerCarouselEnabled` / `setBannerCarouselEnabled` / `applyBannerCarouselEnabledToDocument`
- **Cursor**：`getDefaultCursorEnabled` / `getStoredCursorEnabled` / `setCursorEnabled`（无 `applyCursorEnabledToDocument`，DOM 应用由 `CustomCursor.astro` 监听 `cursorToggle` 事件完成；`setCursorEnabled` 派发事件时同步写入 `documentElement.dataset.cursorEnabled`）
- **CursorTrail**：`getDefaultCursorTrailEnabled` / `getStoredCursorTrailEnabled` / `setCursorTrailEnabled`（同 Cursor 模式，DOM 应用由 `CursorTrail.astro` 监听 `cursorTrailToggle` 事件完成）
- **PIO（Spine 看板娘）**：`getDefaultPioEnabled` / `getStoredPioEnabled` / `setPioEnabled`（开关，派发 `pioToggle` 事件，由 `SpineModel.astro` 监听启停）/ `getDefaultPioModel` / `getStoredPioModel`（校验 stored key 是否仍在 `spineModelConfig.models` 列表内，否则回退默认）/ `setPioModel`（派发 `pioModelChange` 事件，由 `SpineModel.astro` 监听重建模型）

#### 两端通用

| 文件 | 关键导出 | 作用 |
|------|---------|------|
| [date-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/date-utils.ts) | `formatDateToYYYYMMDD(date)`、`formatDateI18n(dateInput, includeTime?)`、`formatDateI18nWithTime(dateInput)`、`formatDateTimeToYYYYMMDDHHmm(dateInput)` | 日期格式化，支持 14 种语言 locale 映射，读取 `siteConfig.lang` 与 `siteConfig.timezone` |
| [language-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/language-utils.ts) | `getLanguageDisplayName(langCode)` | `zh_CN` / `chinese_simplified` 等代码映射为显示名 |
| [layout-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/layout-utils.ts) | `getBackgroundImages()`、`isBannerSrcObject(src)`、`getDefaultBackground()`、`isHomePage(pathname)`、`getBannerOffset(position)` | 背景图处理：统一 desktop/mobile 配置为数组；判断首页（考虑 `BASE_URL`）；banner 偏移量 |
| [toc-shared.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/toc-shared.ts) | `computeTocItems(headings, {maxLevel})`、`escapeHtmlAttr(value)`、`renderBadgeInnerHTML(item)`、`renderTocItemHTML(item)`、类型 `TocInput`/`TocItem` | **无 DOM 依赖**：计算最小深度、过滤 `depth < minDepth + maxLevel`、按深度分级 `depthLevel`（0/1/2）、徽章类型；SSR 与客户端共用以保证结构一致 |
| [url-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/url-utils.ts) | `removeFileExtension(id)`、`pathsEqual(path1, path2)`、`getPostUrlBySlug(slug)`、`getTagUrl(tag)`、`getCategoryUrl(category)`、`getDir(path)`、`getFileDirFromPath(filePath)`、`getSearchUrl(query)`、`url(path)` | URL 工具：剥离 `.md/.mdx/.markdown` 扩展名；智能拼接（网络 URL 直接返回，本地路径加 `BASE_URL`） |

### 5.6 `src/styles/` —— 样式

| 文件 | 作用 |
|------|------|
| `main.css` | Tailwind v4 入口与全局变量 |
| `variables.styl` / `markdown-extend.styl` | Stylus 变量与 Markdown 扩展样式 |
| `markdown.css` | Markdown 内容样式（被 MainGridLayout 引入） |
| `expressive-code.css` | 代码块样式 |
| `navbar.css` / `toc.css` / `tags.css` / `categories.css` | 各模块样式 |
| `layout-styles.css` | 布局相关样式 |
| `transition.css` | Swup 过渡动画 |
| `gallery.css` / `anime-bangumi.css` | 相册与追番样式 |
| `banner-title.css` / `waves.css` | 横幅标题与水波纹 |
| `fancybox-custom.css` / `photoswipe.css` | 灯箱样式 |
| `custom-scrollbar.css` / `scrollbar.css` | 滚动条 |
| `widget-responsive.css` | 组件响应式 |

### 5.7 `src/types/` —— 类型定义

与 `src/config/` 同构，每个配置文件对应一个类型定义文件。统一在 [src/types/config.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/types/config.ts) barrel 导出。新增配置项时务必同步修改类型定义。

### 5.8 `src/constants/` —— 构建期生成常量

| 文件 | 作用 | 生成方式 |
|------|------|---------|
| [constants.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/constants/constants.ts) | 常量：`PAGE_SIZE` / `LIGHT_MODE` / `DARK_MODE` / `SYSTEM_MODE` / `WALLPAPER_*` / `BANNER_HEIGHT`(35) / `BANNER_HEIGHT_EXTEND`(30) / `BANNER_HEIGHT_HOME`(65) / `MAIN_PANEL_OVERLAPS_BANNER_HEIGHT`(3.5rem) / `PAGE_WIDTH`(100) / `UNCATEGORIZED` | 手工维护 |
| `icon.ts` | `defaultFavicons` 等图标常量 | 手工维护 |
| `icons-data.json` | Svelte 组件中使用的图标数据（`@iconify/svelte` 离线模式消费） | 手工维护（从 `@iconify-json/*` 包提取） |
| `lqips.json` | 图片 LQIP 渐变 hex 紧凑格式 | `pnpm lqips` 自动生成（**不要手改**） |

### 5.9 `src/content/` —— 内容集合源

```
content/
├── posts/                # 博客文章 (.md / .mdx)
│   ├── guide/            # 使用指南类文章
│   └── images/           # 文章引用的图片
└── spec/                 # 特殊页面（about / friends / guestbook）
```

文章 frontmatter 字段详见 §4.4 与 [官方文档](https://docs-firefly.cuteleaf.cn/zh/guide/getting-started.html)。

### 5.10 `scripts/` —— 构建脚本

| 脚本 | 命令 | 作用 |
|------|------|------|
| [generate-lqips.ts](file:///e:/Dev/Projects/Firefly-trae-custom/scripts/generate-lqips.ts) | `pnpm lqips` | 用 sharp 将 src 与 public 下图片缩到 2×2 像素，提取 4 个像素颜色生成 18 字符 hex 紧凑格式，写入 `src/constants/lqips.json`。忽略 `public/favicon/`、`public/pio/`、`public/assets/images/effects/`、`public/assets/music/` |
| [subset-fonts.ts](file:///e:/Dev/Projects/Firefly-trae-custom/scripts/subset-fonts.ts) | （`pnpm build` 调用） | 扫描页面字符并生成轻量 woff2 字体子集 |
| [new-post.js](file:///e:/Dev/Projects/Firefly-trae-custom/scripts/new-post.js) | `pnpm new-post <filename>` | 在 `src/content/posts/` 创建带 frontmatter 的 .md 文件 |
| [new-dynamic.js](file:///e:/Dev/Projects/Firefly-trae-custom/scripts/new-dynamic.js) | `pnpm new-dynamic` | 在 `src/content/dynamic/` 创建带 frontmatter 的动态条目 .md 文件 |
| [quarantine-bad-posts.mjs](file:///e:/Dev/Projects/Firefly-trae-custom/scripts/quarantine-bad-posts.mjs) | 手动 | 隔离问题文章（非构建流水线一部分） |

### 5.11 `.github/` —— CI 与协作

- `workflows/biome.yml`：PR 时跑 Biome lint
- `workflows/build.yml`：PR 时跑 `pnpm check` / `pnpm type-check` / `pnpm build`
- `workflows/deploy.yml`：主分支推送时部署
- `ISSUE_TEMPLATE/`：bug / feature / custom 三种 Issue 模板
- `dependabot.yml`：依赖自动更新
- `FUNDING.yml`：赞助信息
- `pull_request_template.md`：PR 模板

---

## 6. 关键类与函数说明

### 6.1 加密文章（[crypto-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/crypto-utils.ts)）

```ts
function encryptContent(html: string, password: string, slug: string): string
```

- **算法**：AES-256-GCM
- **密钥派生**：PBKDF2-SHA256，10 万次迭代，key length 32 字节
- **salt / iv 派生**：HMAC-SHA256(password, "salt:${slug}") 与 HMAC-SHA256(password, "iv:${slug}")，**确定性**——相同 password + slug 产生相同密文，使 sessionStorage 密码缓存可在页面重载后复用
- **输出格式**：`base64(salt[16] + iv[12] + authTag[16] + ciphertext)`
- **触发**：构建时若文章 frontmatter 含 `password` 字段，则对渲染后的 HTML 调用此函数加密；客户端由 `EncryptedPost.astro` / `EncryptedContent.astro` 提示输入密码并解密

### 6.2 内容处理（[content-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/content-utils.ts)）

#### `getSortedPosts()`

按 `pinned` + `published` 降序排序，并为每篇文章填充 `prevSlug` / `prevTitle` / `nextSlug` / `nextTitle`（用于文章页底部上下篇导航）。`PROD` 环境过滤 `draft`。

#### `getRelatedPosts(currentPost, maxCount = 5)`

相关文章推荐评分公式：

```
totalScore = tagMatchScore + titleSimilarityScore + timeFreshnessScore + categoryBonus
```

- `tagMatchScore`（0-100）：标签 Jaccard 相似度 × 100
- `titleSimilarityScore`（0-100）：标题分词 Jaccard 相似度 × 100（使用 `Intl.Segmenter("zh")` 中文分词）
- `timeFreshnessScore`（0-30）：6 个月半衰期指数衰减（`30 * exp(-ln2 * days / 180)`）
- `categoryBonus`（0 或 10）：同分类加 10

优先取有标签匹配的，不足时从无标签匹配的候选中按 `timeFreshnessScore + categoryBonus` 降序补充。

### 6.3 TOC 管理（[toc-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/toc-utils.ts) + [toc-shared.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/toc-shared.ts)）

`toc-shared.ts` 显式设计为无 DOM 依赖模块，SSR（`SidebarTOC.astro` / `FloatingTOC.astro`）与客户端（`TOCManager`）共用 `computeTocItems`，确保服务端渲染与客户端 fallback 重建产生完全相同的目录结构。

`TOCManager.attach()` 通过 `anchorsMatchCurrentContent` 检测 SSR 锚点是否过期（Swup 站内导航后侧栏 DOM 未被替换时回退 `render()` 重建），避免显示旧目录。

### 6.4 设置中心（[setting-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/setting-utils.ts)）

**最大的 utils 文件**（约 1286 行）。每个设置项遵循四件套模式：

```ts
getDefaultX()          // 读取 config 默认值（SSR safe）
getStoredX()          // 读取 localStorage 持久化值
setX(value)            // 写入 localStorage + 派发事件 + applyXToDocument()
applyXToDocument()    // 直接操作 DOM
```

大量 SSR-safe 守卫（`typeof localStorage === "undefined"`）。壁纸切换有 `is-wallpaper-transitioning` 过渡保护类与 `requestAnimationFrame` 防闪屏。`adjustMainContentPosition` 处理 fullscreen 模式动画的 `setTimeout` 竞态。

### 6.5 响应式侧边栏（[responsive-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/responsive-utils.ts)）

```ts
function getResponsiveSidebarConfig(): ResponsiveSidebarConfig
function generateGridClasses(config: ResponsiveSidebarConfig): { gridCols: string }
function generateSidebarClasses(config): string
function generateRightSidebarClasses(config): string
function generateMainContentClasses(config): string
```

基于 `sidebarLayoutConfig.position`（`left` / `right` / `both`）与 `tabletSidebar` 生成 Tailwind 网格类。三档断点：

- **< 768px**：`grid-cols-1`（单列，移动端底部组件独立显示）
- **768-1279px**：`md:grid-cols-[17.5rem_1fr]` 或 `md:grid-cols-[1fr_17.5rem]`（两列，平板端显示主侧栏）
- **>= 1280px**：`xl:grid-cols-[17.5rem_1fr_17.5rem]`（三列，仅 both 模式）

### 6.6 PlantUML 编码（[plantuml-encoder.js](file:///e:/Dev/Projects/Firefly-trae-custom/src/plugins/plantuml-encoder.js)）

```ts
function encodePlantUML(source: string): string  // UTF-8 → raw DEFLATE → PlantUML base64
function injectTheme(source: string, themeName: string): string  // 在 @startuml 后注入 !theme
function buildUrl(server: string, encoded: string): string  // <server>/svg/<encoded>
```

PlantUML 自定义 base64 字母表为 `0-9A-Za-z-_`，无 `=` 填充。

### 6.7 自定义光标系统（[CustomCursor.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/features/CustomCursor.astro) + [cursorConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/cursorConfig.ts)）

#### CSS 规则生成

`buildCursorCSS(paths)` 按元素类型生成多组 `cursor: url('...'), <keyword> !important;` 规则：

| 配置字段 | CSS 选择器（精简） | 关键字 |
|---------|------------------|-------|
| `default` | `*, *::before, *::after` | `auto` |
| `pointer` | `a, button, [role="button"], input[type="button"/"submit"/"reset"/"checkbox"/"radio"], label, select, summary, [tabindex], .clickable, .cursor-pointer` | `pointer` |
| `text` | `input[type="text"/"password"/"email"/"number"/"search"/"tel"/"url"], textarea, [contenteditable]` | `text` |
| `crosshair` | `.cursor-crosshair` | `crosshair` |
| `help` | `.cursor-help` | `help` |
| `notAllowed` | `[disabled], [aria-disabled="true"], .cursor-not-allowed` | `not-allowed` |
| `move` | `.cursor-move, .cursor-grab` | `move` |
| `nResize` / `sResize` | `.cursor-n-resize, .cursor-s-resize` | `ns-resize` |
| `eResize` / `wResize` | `.cursor-e-resize, .cursor-w-resize` | `ew-resize` |
| `neResize` / `swResize` | `.cursor-ne-resize, .cursor-sw-resize` | `nesw-resize` |
| `nwResize` / `seResize` | `.cursor-nw-resize, .cursor-se-resize` | `nwse-resize` |

`!important` 用于覆盖 Tailwind 的 `cursor-pointer` 等类。空字段跳过该规则，回退到浏览器默认。

#### 单例保护

`window.__fireflyCursorInitialized` 标记防止 `setup()` 重复执行。但 Swup 切页后 `<head>` 被替换导致 `<style id="firefly-cursor-style">` 丢失，因此不能依赖单例跳过样式注入——三重 Swup 监听器每次回调都重新调用 `applyCursorStyle()`。

#### 配置-组件解耦

`setting-utils.ts` 只负责 localStorage 读写与事件派发，不操作 DOM；`CustomCursor.astro` 负责监听事件与 `<style>` 注入。这种解耦让 SSR 阶段（`setting-utils.ts` 在 `.svelte` 中被 import 时）不会因 `document` / `localStorage` 缺失而崩溃。

### 6.8 光标尾迹粒子系统（[CursorTrail.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/features/CursorTrail.astro) + [effectsConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/effectsConfig.ts)）

#### 粒子类 `PetalParticle`

每个粒子维护位置、速度、生命周期、尺寸、旋转、颜色、拖尾历史：

```javascript
constructor(x, y, config, tintedCache, sequenceIndex) {
  // sequenceIndex % sequenceCount 决定 72° 相位偏移
  const phase = (sequenceIndex % seqCount) * (Math.PI * 2 / seqCount);
  this.x = x + Math.cos(phase) * orbitR;    // 初始位置偏移
  this.vx = -Math.sin(phase) * tangentSpeed; // 切向初速度
  this.baseAlpha = Math.random() < 0.15 ? 0.5-0.7 : 0.15-0.35; // 随机亮度
}
```

`update(dt, mouseX, mouseY)` 依次施加排斥、吸引、涡旋（线性衰减）、重力、阻力，然后积分位置与生命衰减。

#### 管理器 `CursorTrailManager`

- `init()`：加载花瓣图片 → `buildTintedCache()` 预渲染 8 档着色纹理 → 创建 canvas → 绑定鼠标事件 → 启动 RAF
- `emit(dt)`：按 `emitRate` 累积发射，`_sequenceCounter++` 传递给每个新粒子
- `startAnimation()`：RAF 循环，每帧 clearRect → emit → update + draw（光标花瓣）
- `stop()`：cancelAnimationFrame + 移除事件 + 移除 canvas
- `updateConfig(newConfig)`：配置变更时 stop → 更新 → init

#### Swup 持久化

`window.__fireflyCursorTrailInitialized` 全局标记防止重复初始化。Canvas 是 `document.body.appendChild` 创建的独立元素，Swup 切页时只替换 `[data-swup]` 容器，canvas 不在容器内因此不会丢失。但若 Swup 替换了整个 body，`setup()` 在 `DOMContentLoaded` 后会重新执行——此时全局标记为 true 直接 return，需要依赖 `cursorTrailToggle` 事件恢复。

---

## 7. 依赖关系

### 7.1 模块间依赖

```
astro.config.mjs
  ├─ src/config/*        （读取 siteConfig / fontConfig / expressiveCodeConfig / mermaidConfig / plantumlConfig）
  ├─ src/plugins/*       （注入全部 remark / rehype 插件）
  ├─ src/utils/fontHelper.ts
  ├─ src/i18n/{i18nKey,translation}.ts
  └─ src/utils/url-utils.ts

src/layouts/Layout.astro
  ├─ src/config/*                              （analytics / backgroundWallpaper / expressiveCode / profile / site）
  ├─ src/constants/{constants,icon}.ts
  ├─ src/utils/{layout-utils,url-utils,setting-utils,icon-loader}.ts
  └─ src/components/{analytics,features,layout}/*

src/layouts/MainGridLayout.astro
  ├─ src/layouts/Layout.astro
  ├─ src/config/{backgroundWallpaper,sidebarLayoutConfig,live2dWidgetConfig,siteConfig}
  ├─ src/constants/constants.ts
  ├─ src/utils/{layout-utils,responsive-utils,date-utils,image-utils}
  └─ src/components/{features,controls,layout,common}/*

src/pages/posts/[...slug].astro
  ├─ src/layouts/MainGridLayout.astro
  ├─ src/utils/{content-utils,url-utils,image-utils,date-utils}
  ├─ src/config/{coverImageConfig,licenseConfig,profileConfig,siteConfig,sponsorConfig}
  └─ src/components/{comment,common,features,misc,layout}/*
```

### 7.2 插件依赖图

```
remark-mermaid.js ──► (div.mermaid-container) ──► rehype-mermaid.mjs
                                                      │
                                                      ├─► utils/diagramConstants.js
                                                      └─► utils/extractText.js

remark-plantuml.js ──► plantuml-encoder.js ──► (div.plantuml-container) ──► rehype-plantuml.mjs
                                                                                  │
                                                                                  ├─► utils/diagramConstants.js
                                                                                  ├─► utils/extractText.js
                                                                                  └─► plantuml-theme-switch.js (?raw 注入)

rehype-mermaid.mjs  ─┐
                     ├──► (都生成 .diagram-container) ──► rehype-diagram-panzoom.mjs ──► diagram-panzoom-script.js (?raw 注入)
rehype-plantuml.mjs ─┘

rehype-figure.mjs ──► ../utils/image-utils.ts#shouldAddNoReferrer
rehype-image-referrerpolicy.mjs ──► (独立实现域名匹配，逻辑与 shouldAddNoReferrer 几乎一致)
```

**Mermaid 与 PlantUML 共享**：CSS 类名常量（`utils/diagramConstants.js`）、文本提取（`utils/extractText.js`）、客户端 pan-zoom/全屏交互（`rehype-diagram-panzoom.mjs` + `diagram-panzoom-script.js`）、HAST 节点改写模式。

### 7.3 utils 模块间依赖

- `content-utils.ts` → `url-utils.ts`（`getCategoryUrl`）、`@i18n/*`
- `gallery-utils.ts` → `url-utils.ts`（`url`）
- `navigation-utils.ts` → `url-utils.ts`（`url`）
- `setting-utils.ts` → `layout-utils.ts`（`isHomePage`）、`@constants/constants`、`@/config`、`@/types/config`
- `toc-utils.ts` → `toc-shared.ts`（`computeTocItems` / `renderTocItemHTML` / `TocInput`）、`@i18n/*`
- `image-utils.ts` → `../config/coverImageConfig`、`../config/siteConfig`
- `date-utils.ts` → `../config`（`siteConfig`）
- `lqip-utils.ts` → `@constants/lqips.json`

### 7.4 客户端事件总线

跨模块通过 DOM 自定义事件通信：

| 事件名 | 派发者 | 监听者 |
|-------|-------|-------|
| `swup:enable` | Swup 初始化 | `Layout.astro`（注册 hooks） |
| `astro:page-load` | Astro | `Layout.astro` / `icon-loader` / TOC |
| `password:decrypted` | `EncryptedContent.astro` | `diagram-panzoom-script.js`（重新初始化图表交互，100ms 延迟） |
| `wallpaperModeChange` | `setting-utils.ts#setWallpaperMode` | 壁纸轮播脚本（启停 autoplay） |
| `bannerCarouselChange` | 设置面板 | 壁纸轮播脚本 |
| `cursorToggle` | `setting-utils.ts#setCursorEnabled` | `CustomCursor.astro`（启停光标样式注入） |
| `cursorTrailToggle` | `setting-utils.ts#setCursorTrailEnabled` | `CursorTrail.astro`（启停粒子动画循环） |
| `pioToggle` | `setting-utils.ts#setPioEnabled` | `SpineModel.astro`（启停看板娘：开启时 `initSpineModel()`，关闭时 `cleanupSpineModel()` + 隐藏容器） |
| `pioModelChange` | `setting-utils.ts#setPioModel` | `SpineModel.astro`（`cleanupSpineModel()` → `initSpineModel()` 重建模型实例） |
| `firefly:page:loaded` | `Layout.astro`（评论容器存在时） | 评论系统初始化 |

---

## 8. 项目运行方式

### 8.1 环境要求

- **Node.js** ≥ 22.0
- **pnpm** ≥ 9（`package.json` 的 `preinstall` 脚本通过 `only-allow pnpm` 强制）
- **Git**

### 8.2 开发命令

| 命令 | 作用 |
|------|------|
| `pnpm install` | 安装依赖 |
| `pnpm dev` 或 `pnpm start` | 启动开发服务器，默认 `http://localhost:4321` |
| `pnpm check` | `astro check`，类型与渲染诊断 |
| `pnpm type-check` | `tsc --noEmit --isolatedDeclarations` |
| `pnpm format` | Biome 格式化 `src` |
| `pnpm lint` | Biome 检查 + 安全修复 `src` |
| `pnpm build` | 完整构建流水线（见 §9.1） |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm new-post <filename>` | 在 `src/content/posts/` 创建新文章 |
| `pnpm new-dynamic` (`new-d`) | 在 `src/content/dynamic/` 创建动态条目 |
| `pnpm lqips` | 重新生成 `src/constants/lqips.json` |
| `pnpm astro ...` | 直接调用 Astro CLI |

### 8.3 开发流程建议

1. 克隆仓库后 `pnpm install`
2. **修改 `src/config/siteConfig.ts`** 与其他 `src/config/*.ts` 自定义站点
3. `pnpm dev` 启动开发服务器
4. 修改组件 / 页面 / 插件
5. 提交前：`pnpm check` + `pnpm type-check` + `pnpm lint` + `pnpm format`
6. 视觉/交互变更：`pnpm preview` 验证 + 截图附 PR

> **修改 `astro.config.mjs` 或 `src/config/*` 后必须重启 dev server 才能生效**。

---

## 9. 构建与部署

### 9.1 构建流水线

`pnpm build` 实际执行（见 [package.json](file:///e:/Dev/Projects/Firefly-trae-custom/package.json#L9)）：

```
npx tsx scripts/generate-lqips.ts   # 1. 生成图片 LQIP 渐变 → src/constants/lqips.json
  ↓
astro build                         # 2. Astro 构建（含 remark/rehype 插件链 + Expressive Code）
  ↓
npx tsx scripts/subset-fonts.ts     # 3. 字体子集化
  ↓
pagefind --site dist                # 4. Pagefind 全文搜索索引
```

### 9.2 部署目标

#### Vercel（默认）

配置见 [vercel.json](file:///e:/Dev/Projects/Firefly-trae-custom/vercel.json)：

- `buildCommand`: `pnpm build`
- `outputDirectory`: `dist`
- `installCommand`: `pnpm install`
- `framework`: `astro`
- `cleanUrls`: true
- 全站安全头：`X-Content-Type-Options: nosniff` / `X-Frame-Options: DENY` / `X-XSS-Protection: 1; mode=block` / `Referrer-Policy: strict-origin-when-cross-origin`
- `_astro/*` 资源 1 年强缓存（`max-age=31536000, immutable`）

#### Cloudflare Workers

设置环境变量 `CF_WORKERS=1` 启用 `@astrojs/cloudflare` 适配器（见 [astro.config.mjs](file:///e:/Dev/Projects/Firefly-trae-custom/astro.config.mjs#L51-L55)），配置见 [wrangler.jsonc](file:///e:/Dev/Projects/Firefly-trae-custom/wrangler.jsonc)：

- `compatibility_date`: `2025-01-01`
- `compatibility_flags`: `["nodejs_compat"]`
- `assets.directory`: `./dist`

#### 其他平台

- Netlify / EdgeOne Pages / Cloudflare Pages 等通过平台自动识别 Astro 框架
- 框架预设：`Astro`；根目录：`./`；输出目录：`dist`；构建命令：`pnpm run build`；安装命令：`pnpm install`

### 9.3 Pagefind 搜索

配置见 [pagefind.yml](file:///e:/Dev/Projects/Firefly-trae-custom/pagefind.yml)，排除索引的选择器：

- `span.katex` / `span.katex-display`（数学公式）
- `[data-pagefind-ignore]`（手动标记忽略的元素，如锚点图标）
- `.search-panel` / `#search-panel`（搜索面板自身）

文章页主标题与正文标记 `data-pagefind-body` / `data-pagefind-weight="10"` / `data-pagefind-meta="title"`。

### 9.4 CI 工作流

`.github/workflows/`：

- `biome.yml`：PR 触发 Biome lint
- `build.yml`：PR 触发 `pnpm check` / `type-check` / `build`
- `deploy.yml`：主分支推送触发部署

---

## 10. 约定与最佳实践

### 10.1 代码风格（[biome.json](file:///e:/Dev/Projects/Firefly-trae-custom/biome.json)）

- **缩进**：tab
- **JS/TS 字符串**：双引号
- **Linter**：Biome recommended 规则集 + 自定义 style 规则（`noParameterAssign` / `useAsConstAssertion` / `useDefaultParameterLast` / `useEnumInitializers` / `useSelfClosingElements` / `useSingleVarDeclarator` / `noUnusedTemplateLiteral` / `useNumberNamespace` / `noInferrableTypes` / `noUselessElse` 等为 `error`）
- **`.svelte` / `.astro` / `.vue` 放宽**：`useConst: off` / `useImportType: off` / `noUnusedVariables: off` / `noUnusedImports: off`
- **忽略**：`src/**/*.css` / `src/public/**` / `dist/**` / `node_modules/**` / `src/constants/icons-data.json`（手工维护但 Biome 不格式化）/ `src/constants/lqips.json`（自动生成）

### 10.2 命名约定

- **Astro / Svelte 组件**：`PascalCase`（`PostCard.astro` / `Search.svelte`）
- **配置模块**：`camelCase` 结尾 `Config.ts`（`siteConfig.ts` / `commentConfig.ts`）
- **工具**：描述性 kebab case（`date-utils.ts` / `content-utils.ts` / `crypto-utils.ts`）
- **`src/types` 与 `src/config` 必须对齐**：新增配置字段时同步修改对应类型定义

### 10.3 提交与 PR

- **Conventional Commits**：`feat: ...` / `fix: ...` / `chore: ...`
- **聚焦单一关注点**：一个 PR 只解决一个问题
- **不提交敏感信息**：secrets / tokens / service keys 不进 config 文件
- **审查生成文件**：`dist/` / `src/constants/lqips.json` 提交前需复核；`src/constants/icons-data.json` 手工追加图标后需复核 JSON 合法性
- **UI 变更需截图**：PR 描述中附验证截图

### 10.4 路径别名优先

新增 import 应优先使用 `@/`、`@components/`、`@utils/`、`@i18n/`、`@layouts/`、`@constants/`、`@assets/` 别名，而非相对路径。

### 10.5 Swup 容器约定

新增需要在页面切换时被 Swup 替换的 DOM 区块时，**必须**：

1. 在 [astro.config.mjs](file:///e:/Dev/Projects/Firefly-trae-custom/astro.config.mjs#L100-L108) 的 `swup.containers` 数组中追加容器 id
2. 在每个页面（包括 404）都渲染该容器（哪怕空），否则 Swup 会找不到容器而回退整页加载
3. 给容器添加 `transition-swup-fade` 等 transition 类
4. 注意：Swup 不会替换静态容器（`#left-sidebar-wrapper` / `#right-sidebar-static`），需要替换的用动态容器（`#left-sidebar-dynamic` / `#right-sidebar-dynamic`）

### 10.6 已知"屎山"与历史遗留

- `plantuml-render-script.js` 是旧版一体化 PlantUML 客户端脚本（自带 pan-zoom + 主题切换 + 全屏，使用独立类名 `.plantuml-controls`）。当前 `rehype-plantuml.mjs` 注入的是新版 `plantuml-theme-switch.js`（仅主题切换 + 失败降级，pan-zoom 交给共享的 `diagram-panzoom-script.js`），旧版未被引用，**可考虑删除**
- `rehype-image-referrerpolicy.mjs` 与 `image-utils.ts#shouldAddNoReferrer` 用几乎相同的通配符域名匹配算法实现同一目的，存在逻辑重复（可能是有意解耦或历史原因）
- `backgroundWallpaper.ts` 的注释自承"已经屎山代码"，壁纸模式切换在边界场景可能出 bug，**推荐用户关闭切换功能（`switchable: false`）选定一种模式**

### 10.7 调试提示

- **主题/壁纸闪烁**：检查 `Layout.astro` 的 `is:inline` 主题初始化脚本是否在 `<body>` 渲染前执行
- **Swup 切页后组件失效**：检查是否在 `content:replace` 或 `page:view` 钩子中重新初始化
- **图标不显示**：检查 `initIconLoader()` 是否在 Swup 切页后被重新调用（`Layout.astro` 已处理）
- **加密文章图表交互失效**：检查 `password:decrypted` 事件是否被监听（`diagram-panzoom-script.js` 已处理，100ms 延迟）
- **构建慢**：`src/` 下图片越多 Astro 优化越慢；考虑用 `public/` 直接服务
- **Pagefind 索引异常**：检查元素是否误加 `data-pagefind-ignore`
- **自定义光标切页后失效**：检查 `CustomCursor.astro` 的三重 Swup 监听器是否齐全（`swup:contentReplaced` / `swup:content:replace` / `swup:enable` + `window.swup.hooks.on('content:replace')`），以及 `localStorage.cursorEnabled` 是否被正确读取
- **自定义光标/光标尾迹开关图标不显示**：在 [DisplaySettingsIntegrated.svelte](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/controls/DisplaySettingsIntegrated.svelte) 中新增 `icon="mdi:xxx"` 或修改图标名后，必须从 `node_modules/@iconify-json/<prefix>/icons.json` 提取对应图标的 `body` 字段，追加到 [icons-data.json](file:///e:/Dev/Projects/Firefly-trae-custom/src/constants/icons-data.json) 对应集合的 `icons` 对象中，否则运行时 `iconExists()` 返回 false 显示占位灰圈
- **自定义光标对右键菜单无效**：浏览器系统级 UI 限制，CSS `cursor: url()` 无法覆盖右键菜单、滚动条、原生表单下拉等，非 Bug
- **看板娘选项卡不显示**：检查 `spineModelConfig.models.length > 0` 且 `spineModelConfig.enable === true`，两者皆满足时 `isPioSwitchable` 才为 true，否则「看板娘」tab 不出现在设置面板
- **看板娘图标（mdi:cat）显示灰圈**：在 DisplaySettingsIntegrated.svelte 中新增 `icon="mdi:cat"` 后，必须从 `node_modules/@iconify-json/mdi/icons.json` 提取 `cat` 图标的 `body` 字段，追加到 [icons-data.json](file:///e:/Dev/Projects/Firefly-trae-custom/src/constants/icons-data.json) 的 `mdi.icons` 对象中
- **看板娘模型底部有间隙**：半身立绘类模型需在 entry.model 配置 `viewportPadding: { left: 0, right: 0, top: 0, bottom: 0 }` 贴底；完整角色形象不配则保留 SpinePlayer 默认 10% 间距
- **看板娘脸颊/半透明区变灰**：Spine 3.6 资源默认预乘 alpha，需在 entry.model 配 `premultipliedAlpha: true`

---

## 附录：快速跳转索引

### 入口文件

- [astro.config.mjs](file:///e:/Dev/Projects/Firefly-trae-custom/astro.config.mjs) —— Astro 主配置
- [src/config/index.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/index.ts) —— 配置 barrel
- [src/content.config.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/content.config.ts) —— 内容集合 schema
- [src/layouts/Layout.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/layouts/Layout.astro) —— 基础 HTML 壳
- [src/layouts/MainGridLayout.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/layouts/MainGridLayout.astro) —— 主网格布局

### 关键工具

- [src/utils/content-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/content-utils.ts) —— 内容处理
- [src/utils/setting-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/setting-utils.ts) —— 客户端设置中心
- [src/utils/responsive-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/responsive-utils.ts) —— 响应式侧栏
- [src/utils/crypto-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/crypto-utils.ts) —— 文章加密
- [src/utils/url-utils.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/utils/url-utils.ts) —— URL 工具

### 关键组件

- [src/components/layout/SideBar.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/layout/SideBar.astro) —— 侧边栏容器
- [src/components/layout/Navbar.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/layout/Navbar.astro) —— 导航栏
- [src/components/controls/DisplaySettings.svelte](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/controls/DisplaySettings.svelte) —— 显示设置面板
- [src/components/features/EncryptedPost.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/features/EncryptedPost.astro) —— 加密文章容器
- [src/components/features/CustomCursor.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/features/CustomCursor.astro) —— 自定义光标注入（详见 §4.8 / §6.7）
- [src/components/features/CursorTrail.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/features/CursorTrail.astro) —— 光标尾迹粒子特效（详见 §4.9 / §6.8）
- [src/components/features/SpineModel.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/features/SpineModel.astro) —— Spine 看板娘渲染（多模型 + 前端切换，详见 §4.10）
- [src/config/cursorConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/cursorConfig.ts) —— 自定义光标配置
- [src/config/effectsConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/effectsConfig.ts) —— 樱花飘落 + 光标尾迹特效配置
- [src/config/pioConfig.ts](file:///e:/Dev/Projects/Firefly-trae-custom/src/config/pioConfig.ts) —— Spine / Live2D 看板娘配置（多模型架构）
- [src/components/comment/index.astro](file:///e:/Dev/Projects/Firefly-trae-custom/src/components/comment/index.astro) —— 评论系统路由

### 官方资源

- 📚 **官方使用文档**：<https://docs-firefly.cuteleaf.cn/zh/guide/getting-started.html>
- 🌐 **在线预览**：<https://firefly.cuteleaf.cn/>
- 📦 **GitHub 仓库**：<https://github.com/CuteLeaf/Firefly>
- 💬 **QQ 交流群**：[1087127207](https://qm.qq.com/q/ZGsFa8qX2G)

---

**End of Wiki**

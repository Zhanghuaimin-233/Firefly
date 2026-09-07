# 📦 Components 组件目录

## 动态组件

- `widget/Dynamic.astro`：显示最新动态的侧边栏组件。
- `pages/dynamic/DynamicFeed.svelte`：负责动态 JSON 加载、搜索、年份筛选和分页。
- `pages/dynamic/DynamicGallery.astro`：动态图片网格、轮播和灯箱。
- `pages/dynamic/DynamicInlineComments.astro`：单条动态的按需评论区。
- `pages/dynamic/DynamicItem.astro`：动态条目的服务端渲染组件。
- `pages/dynamic/DynamicItemTemplate.astro`：动态条目的客户端渲染模板。

Firefly 项目中所有可复用组件的集中管理。组件按照功能和职责进行分类，提供清晰的架构和易于维护的代码组织。

## 📁 目录结构

### 🏗️ layout/ - 页面布局组件

负责整体页面框架和布局结构的组件。

- `BannerHomeTextOverlay.astro` - 首页横幅文字覆盖层（标题/副标题/打字机/双语翻译）
- `BannerPostMetaOverlay.astro` - 文章页横幅元数据覆盖层
- `CategoryBar.astro` - 分类栏组件
- `ConfigCarrier.astro` - 配置载体组件
- `DropdownMenu.astro` - 下拉菜单组件
- `Footer.astro` - 页脚组件
- `HeaderTopRow.astro` - 顶部行组件
- `Navbar.astro` - 导航栏组件（支持 static/fixed/dynamic 三种模式）
- `NavMenuPanel.astro` - 导航菜单面板
- `PostCard.astro` - 文章卡片组件
- `PostMeta.astro` - 文章元数据组件
- `PostPage.astro` - 文章页面布局组件
- `PostStats.astro` - 文章统计组件（字数/阅读时长）
- `SideBar.astro` - 侧边栏组件
- `SidebarColumn.astro` - 侧边栏列容器组件
- `WallpaperSection.astro` - 壁纸区域组件（图片/视频背景）

### 🎮 controls/ - 导航和交互控件

页面导航和用户交互功能组件。

**导航控件**
- `BackToComment.astro` - 返回评论区按钮
- `BackToHome.astro` - 返回主页按钮
- `BackToTop.astro` - 返回顶部按钮
- `FloatingControls.astro` - 右下角悬浮控件容器
- `FloatingTOC.astro` - 浮动目录组件
- `ScrollDownIndicator.astro` - 向下滚动指示器
- `ArchivePanel.astro` - 归档面板组件（服务端渲染 + 客户端筛选/折叠）

**交互组件**
- `DisplaySettingsIntegrated.svelte` - 集成显示设置面板（外观/壁纸/特效/看板娘选项卡；布局切换与壁纸模式切换已并入本面板）
- `ImmersiveReading.astro` - 沉浸式阅读模式
- `ImmersiveTOC.astro` - 沉浸式阅读目录
- `LightDarkSwitch.svelte` - 主题切换组件
- `Search.svelte` - 搜索功能组件

### 🔧 common/ - 公共可复用组件

通用的 UI 组件和工具组件，支持跨项目复用。

**基础 UI 组件**
- `ButtonLink.astro` - 链接按钮
- `ButtonTag.astro` - 标签按钮
- `DropdownItem.astro` / `.svelte` - 下拉选项
- `DropdownPanel.astro` / `.svelte` - 下拉面板容器
- `FloatingButton.astro` - 悬浮按钮基础组件
- `Icon.svelte` - 图标组件（带加载状态和错误处理）
- `WidgetLayout.astro` - 小部件布局容器

**内容和展示组件**
- `CoverImage.astro` - 封面图组件（支持本地图片和随机图API）
- `ImageWrapper.astro` - 图片包装器（支持本地和远程图片）
- `Markdown.astro` - Markdown 内容样式包装器
- `PioMessageBox.astro` - 消息框组件（Live2D/Spine 消息显示）
- `Timeline.astro` / `TimelineItem.astro` - MDX 时间线组件（左侧竖线节点，条目支持日期/标题/正文 Markdown、节点换色和内置图标）
- `Steps.astro` / `StepItem.astro` / `Badge.astro`  - MDX 内容组件（编号步骤条、内联徽章）

**分页组件**
- `ClientPagination.svelte` - 客户端分页（JavaScript 控制）
- `Pagination.astro` - 静态路由分页（Astro 原生）

**列表与筛选组件**
- `FilterControls.svelte` - 筛选控制组件（胶囊筛选按钮，bangumi/vndb/mal 共用）
- `TabNav.svelte` - 标签导航组件（支持 URL hash 深链，bangumi/vndb/mal/bilibili 共用）
- `TabGroup.svelte` - 标签组容器组件
- `GridSkeleton.svelte` - 媒体网格加载骨架
- `PageJump.svelte` - 分页页码跳转组件

### 🧩 widget/ - 小部件

侧边栏中使用的各种功能小部件。

- `Advertisement.astro` - 广告组件
- `Announcement.astro` - 公告组件
- `Calendar.astro` - 日历组件
- `Categories.astro` - 分类组件
- `Dynamic.astro` - 最新动态侧边栏组件
- `DynamicSidebar.svelte` - 动态侧边栏客户端交互（加载与展开）
- `Music.astro` - 音乐播放器小部件
- `Profile.astro` - 个人信息/社交链接小部件
- `SidebarTOC.astro` - 侧边栏目录组件
- `SiteInfo.astro` - 站点信息组件
- `SiteStats.astro` - 站点统计组件
- `SpineModel.astro` - Spine 看板娘组件
- `Tags.astro` - 标签组件

### ✨ features/ - 全局功能特效组件

全局加载的功能增强和特效组件。

**管理器（初始化和管理功能）**
- `BackgroundPlayer.astro` - 背景视频播放器（banner 模式下视频顶部对齐、仅底部裁切；单视频原生循环，多视频轮播）
- `CodeGroupManager.astro` - 代码组管理器
- `CustomCursor.astro` - 自定义光标注入（CSS `cursor: url()` 替换，含 Swup 持久化）
- `CursorTrail.astro` - 光标尾迹粒子特效（Canvas 2D 粒子系统，五瓣花形旋涡，含 Swup 持久化）
- `FancyboxManager.astro` - Fancybox 图片查看器管理
- `FontSetup.astro` - 字体加载和管理（基于 Astro Font API）
- `GithubCardManager.astro` - GitHub 仓库卡片管理器（消费构建期抓取的卡片数据）
- `KatexManager.astro` - Katex 数学公式渲染管理
- `MusicManager.astro` - 全局音乐播放管理器（单例，管理唯一 audio 元素和播放状态，通过 CustomEvent 同步所有 MusicPlayer 视图实例）
- `WavesEffect.astro` - 水波纹特效（视频播放时可通过 `playerShowWaves` 配置保留）

**功能组件**
- `EncryptedContent.astro` - 加密内容组件
- `EncryptedPost.astro` - 加密文章组件
- `Live2DWidget.astro` - Live2D 看板娘组件
- `MusicPlayer.astro` - 音乐播放器 UI 视图控制器（纯 UI，委托 MusicManager 进行播放控制）
- `MusicPlayerView.astro` - 音乐播放器视图组件
- `PostAudioBar.astro` - 文章绑定音频播放条（frontmatter `audio` 字段驱动，独立 audio 元素；与全局音乐互斥：播放时暂停全局音乐，离页恢复；监听 body subtree 感知 Swup 容器替换；加密文章中随解密注入；支持"文章音频自动播放"用户开关，见特效设置）
- `SakuraEffect.astro` - 樱花飘落特效
- `SpineModel.astro` - Spine 看板娘组件
- `TypewriterText.astro` - 打字机动画效果

### 📃 pages/ - 页面特定组件

特定页面使用的组件，不用于其他页面。

- `AdvancedSearch.svelte` - 高级搜索组件

**pages/bangumi/** - 番组计划页面组件
- `BangumiGrid.svelte` - 番组网格布局组件
- `BangumiSection.svelte` - 番组分类展示组件
- `Card.svelte` - 番组卡片组件

**pages/bilibili/** - 哔哩哔哩追番页面组件
- `BilibiliCard.svelte` - 哔哩哔哩卡片组件
- `BilibiliGrid.svelte` - 哔哩哔哩网格布局组件
- `BilibiliDetailModal.svelte` - 哔哩哔哩详情弹窗组件

**pages/mal/** - MyAnimeList 页面组件
- `Card.svelte` - MAL 卡片组件
- `MalGrid.svelte` - MAL 网格布局组件
- `MalSection.svelte` - MAL 分类展示组件

**pages/vndb/** - VNDB 页面组件
- `Card.svelte` - VNDB 卡片组件
- `VndbGrid.svelte` - VNDB 网格布局组件
- `VndbSection.svelte` - VNDB 分类展示组件

**pages/gallery/** - 相册页面组件
- `AlbumCard.astro` - 相册卡片组件
- `PhotoCard.astro` - 照片卡片组件

### 💬 comment/ - 评论系统组件

第三方评论系统集成组件。

- `index.astro` - 评论主组件
- `Artalk.astro` - Artalk 评论集成
- `Disqus.astro` - Disqus 评论集成
- `Giscus.astro` - Giscus 评论集成（GitHub 讨论）
- `Twikoo.astro` - Twikoo 评论集成
- `Waline.astro` - Waline 评论集成

### 📊 analytics/ - 数据统计组件

网站分析和统计集成组件。

- `GoogleAnalytics.astro` - Google Analytics
- `La51Analytics.astro` - 51la 统计
- `MicrosoftClarity.astro` - Microsoft Clarity
- `UmamiAnalytics.astro` - Umami 统计

### 🔧 misc/ - 杂项工具组件

其他辅助和工具类组件。

- `License.astro` - 许可证信息显示
- `RecommendedPost.astro` - 推荐文章组件
- `SeriesNav.astro` - 系列文章导航组件（frontmatter `series` 驱动）
- `SharePoster.svelte` - 分享海报生成

---

## 🗂️ 分类原则

| 分类 | 用途 | 特点 |
|------|------|------|
| **layout/** | 页面布局和结构 | 决定整体页面框架 |
| **controls/** | 导航和交互 | 用户交互功能 |
| **common/** | 通用可复用组件 | 跨多个页面/组件使用 |
| **widget/** | 侧边栏小部件 | 侧边栏特定组件 |
| **features/** | 全局功能特效 | 全局加载的增强功能 |
| **pages/** | 页面特定组件 | 仅在特定页面使用 |
| **comment/** | 评论系统 | 第三方服务集成 |
| **analytics/** | 数据统计 | 分析和统计服务 |
| **misc/** | 工具和辅助 | 其他杂项功能 |

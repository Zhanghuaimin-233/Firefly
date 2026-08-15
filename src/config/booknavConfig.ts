import type { BooknavGroup, BooknavPageConfig } from "../types/booknavConfig";

// 书签导航页面配置
export const booknavPageConfig: BooknavPageConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "",

	// favicon 自动获取配置
	favicon: {
		// 书签未填写 icon 时，是否自动获取目标站点的 favicon 图标
		enabled: true,

		// favicon 接口地址，{domain} 为占位符，会被替换成目标站点域名
		// 更换接口只需保证地址里含有 {domain}，例如：
		//   https://a.favicon.im/{domain}
		//   https://favicon.im/{domain}
		api: "https://a.favicon.im/{domain}",
	},
};

// 书签导航配置
// 每个数组项是一个分类组，分类组内的 items 是该分类下的书签
export const booknavConfig: BooknavGroup[] = [
	{
		id: "dev",
		name: "开发",
		icon: "material-symbols:code-rounded",
		desc: "写代码时离不开的站点",
		weight: 100,
		items: [
			{
				title: "GitHub",
				url: "https://github.com",
				desc: "全球最大的代码托管平台",
				// icon 字段可以使用 astro-icon 图标库的图标名称
				// 也可以使用图片 URL 和本地图片路径
				// 不填则会通过接口自动获取目标站点的 favicon 图标（需要在上面配置）
				icon: "fa7-brands:github",
				weight: 10,
			},
			{
				title: "MDN Web Docs",
				url: "https://developer.mozilla.org",
				desc: "最权威的 Web 技术文档",
				weight: 9,
			},
			{
				title: "Astro",
				url: "https://astro.build",
				desc: "内容驱动型网站的 Web 框架",
				weight: 8,
			},
			{
				title: "Svelte",
				url: "https://svelte.dev",
				desc: "把组件编译成高效原生 JS 的框架",
				weight: 7,
			},
			{
				title: "Tailwind CSS",
				url: "https://tailwindcss.com",
				desc: "一个功能强大且灵活的 CSS 框架",
				weight: 6,
			},
			{
				title: "IDEA 快捷键",
				url: "https://hotkeycheatsheet.com/zh/hotkey-cheatsheet/idea",
				desc: "IntelliJ IDEA 快捷键速查",
				weight: 5,
			},
		],
	},
	{
		id: "opensource",
		name: "项目",
		icon: "material-symbols:code-rounded",
		desc: "好用的开源项目",
		weight: 90,
		items: [
			{
				title: "Firefly",
				url: "https://github.com/CuteLeaf/Firefly",
				desc: "清晰美观的 Astro 个人博客主题模板",
				icon: "/favicon/firefly-32.png",
				weight: 10,
			},
		],
	},
	{
		id: "design",
		name: "设计",
		icon: "material-symbols:palette-outline-rounded",
		desc: "配色、图标与灵感来源",
		weight: 90,
		items: [
			{
				title: "Iconify",
				url: "https://icon-sets.iconify.design",
				desc: "海量开源图标集合搜索",
				weight: 10,
			},
			{
				title: "iconfont",
				url: "https://www.iconfont.cn",
				desc: "阿里巴巴矢量图标库",
				weight: 9,
			},
			{
				title: "羽兔网",
				url: "https://www.yutu.cn/",
				desc: "年轻人都在用的自学设计平台",
				weight: 8,
			},
			{
				title: "奇迹秀",
				url: "https://www.qijishow.com/",
				desc: "因设计而美丽",
				weight: 7,
			},
		],
	},
	{
		id: "tools",
		name: "工具",
		icon: "material-symbols:build-outline-rounded",
		desc: "顺手的在线小工具",
		weight: 80,
		items: [
			{
				title: "TinyPNG",
				url: "https://tinypng.com",
				desc: "在线压缩 PNG / JPEG 图片",
				weight: 10,
			},
			{
				title: "Squoosh",
				url: "https://squoosh.app",
				desc: "Google 出品的图片压缩与格式转换",
				weight: 9,
			},
			{
				title: "Carbon",
				url: "https://carbon.now.sh",
				desc: "把代码片段生成漂亮的图片",
				weight: 8,
			},
			{
				title: "刘明野的工具箱",
				url: "https://tools.liumingye.cn/",
				desc: "聚合的在线小工具",
				weight: 7,
			},
			{
				title: "sm.ms",
				url: "https://sm.ms/",
				desc: "免费图床",
				weight: 6,
			},
			{
				title: "SauceNAO",
				url: "https://saucenao.com/",
				desc: "以图搜图",
				weight: 5,
			},
			{
				title: "trace.moe",
				url: "https://trace.moe/",
				desc: "动漫场景反向搜索",
				weight: 4,
			},
			{
				title: "VirusTotal",
				url: "https://www.virustotal.com/gui/home/upload",
				desc: "文件与链接安全扫描",
				weight: 3,
			},
			{
				title: "链接是什么",
				url: "https://whatslink.info/",
				desc: "解析链接的真实内容",
				weight: 2,
			},
			{
				title: "云短信",
				url: "https://www.storytrain.info/",
				desc: "在线接收短信验证码",
				weight: 1,
			},
			{
				title: "TrackersList",
				url: "https://trackerslist.com/#/zh?id=xiu2trackerslistcollection",
				desc: "BT tracker 订阅列表",
				weight: 0,
			},
		],
	},
	{
		id: "resources",
		name: "资源",
		icon: "material-symbols:auto-stories-outline-rounded",
		desc: "文档、教程与阅读",
		weight: 70,
		items: [
			{
				title: "Firefly Docs",
				url: "https://docs-firefly.cuteleaf.cn",
				desc: "Firefly 主题模板文档",
				icon: "https://docs-firefly.cuteleaf.cn/logo.png",
				weight: 10,
			},
			{
				title: "夏夜流萤",
				url: "https://blog.cuteleaf.cn",
				desc: "飞萤之火自无梦的长夜亮起",
				weight: 9,
			},
			{
				title: "Z-library",
				url: "https://zh.z-lib.gs/",
				desc: "免费电子书下载",
				weight: 8,
			},
		],
	},
	{
		id: "ai",
		name: "AI 学习",
		icon: "material-symbols:psychology-outline-rounded",
		desc: "AI 工具、术语与行业动态",
		weight: 60,
		items: [
			{
				title: "21st.dev",
				url: "https://21st.dev/community/components",
				desc: "AI 生成的高质量 UI 组件库",
				weight: 10,
			},
			{
				title: "VibeHub",
				url: "https://vibe-hub.org/",
				desc: "Vibe Coding 术语图鉴",
				weight: 9,
			},
			{
				title: "MotionSites",
				url: "https://motionsites.ai/",
				desc: "AI Hero 提示词与动效参考",
				weight: 8,
			},
			{
				title: "AI HOT",
				url: "https://aihot.virxact.com/",
				desc: "AI 行业动态聚合与日报",
				weight: 7,
			},
			{
				title: "Codex Reset",
				url: "https://codex-reset.com/zh/",
				desc: "Codex 配额重置追踪",
				weight: 6,
			},
		],
	},
	{
		id: "download",
		name: "下载站",
		icon: "material-symbols:download-rounded",
		desc: "软件与系统资源下载",
		weight: 50,
		items: [
			{
				title: "MSDN 系统库",
				url: "https://www.xitongku.com/index.html",
				desc: "原版 Windows 生态资源",
				weight: 10,
			},
			{
				title: "原版软件",
				url: "https://next.itellyou.cn/Original/",
				desc: "微软原版镜像下载",
				weight: 9,
			},
			{
				title: "果核剥壳",
				url: "https://www.ghxi.com/",
				desc: "软件下载站",
				weight: 8,
			},
			{
				title: "软仓",
				url: "https://www.ruancang.net/",
				desc: "软件资源库",
				weight: 7,
			},
			{
				title: "下载集",
				url: "https://www.xzji.com/",
				desc: "免费绿色软件下载",
				weight: 6,
			},
		],
	},
	{
		id: "fun",
		name: "娱乐",
		icon: "material-symbols:sports-esports-outline-rounded",
		desc: "吃喝玩乐与社交",
		weight: 40,
		items: [
			{
				title: "食用手册",
				url: "https://cook.yunyoujun.cn/",
				desc: "云游君的菜谱站",
				weight: 10,
			},
			{
				title: "pixiv",
				url: "https://www.pixiv.net/",
				desc: "插画与同人作品社区",
				weight: 9,
			},
			{
				title: "小霸王",
				url: "http://ending.fun/",
				desc: "红白机与街机在线游戏",
				weight: 8,
			},
			{
				title: "Nexus Mods",
				url: "https://www.nexusmods.com/",
				desc: "游戏 Mod 社区",
				weight: 7,
			},
			{
				title: "X",
				url: "https://x.com/home",
				desc: "社交平台",
				weight: 6,
			},
			{
				title: "Telegram",
				url: "https://web.telegram.org/a/",
				desc: "即时通讯",
				weight: 5,
			},
			{
				title: "Discord",
				url: "https://discord.com/channels/@me",
				desc: "语音与社区交流",
				weight: 4,
			},
		],
	},
];

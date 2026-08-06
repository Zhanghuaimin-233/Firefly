import type { Live2DWidgetConfig, SpineModelConfig } from "../types/pioConfig";

// Spine 看板娘配置
export const spineModelConfig: SpineModelConfig = {
	// Spine 看板娘总开关默认值（可被前端设置面板覆盖）
	enable: true,

	// 可切换的模型列表
	models: [
		{
			// 立绘类模型（Spine 3.6 升级至 4.2），半身腿部截断，贴底显示
			key: "105913",
			name: "立绘",
			model: {
				path: "/pio/models/spine/105913/105913.json",
				scale: 0.24,
				x: 0,
				y: 0,
				// 立绘类模型眼嘴贴图在命名皮肤里，不指定则只显示 base 身体
				skin: "normal",
				// Spine 3.6 默认导出预乘 alpha，必须配 true 否则半透明区域（如脸颊粉色）会变灰
				premultipliedAlpha: true,
				// 全 0 = skeleton 贴 canvas 边，立绘截断处贴窗口底部
				viewportPadding: { left: 0, right: 0, top: 0, bottom: 0 },
			},
			size: { width: 150, height: 245 },
			position: { corner: "bottom-left", offsetX: 0, offsetY: 0 },
			interactive: {
				enabled: true,
				// 105913 为部件级动画：mouth_talk 为说话动画，配合消息气泡
				clickAnimations: ["mouth_talk", "eye_blink"],
				clickMessages: [
					"你好呀！",
					"今天也要加油哦！✨",
					"想要一起去看星空吗？🌟",
					"记得要好好休息呢~",
					"有什么想对我说的吗？💫",
				],
				messageDisplayTime: 3000,
				// eye_idle 为循环眨眼，是 105913 唯一适合循环的待机动画
				idleAnimations: ["eye_idle"],
				idleInterval: 8000,
			},
		},
		{
			// 博客自带完整角色形象，保留原版与底部的间距
			key: "firefly",
			name: "流萤",
			model: {
				path: "/pio/models/spine/firefly/1310.json",
				scale: 1.0,
				x: 0,
				y: 0,
				// firefly 纹理为 straight alpha，不配 premultipliedAlpha（默认 false）
				// 不配 viewportPadding，用 SpinePlayer 默认 10% padding，保留与底部间距
			},
			size: { width: 135, height: 165 },
			position: { corner: "bottom-left", offsetX: 0, offsetY: 20 },
			interactive: {
				enabled: true,
				clickAnimations: [
					"emoji_0",
					"emoji_1",
					"emoji_2",
					"emoji_3",
					"emoji_4",
					"emoji_5",
				],
				clickMessages: [
					"你好呀！我是流萤~",
					"今天也要加油哦！✨",
					"想要一起去看星空吗？🌟",
					"记得要好好休息呢~",
					"有什么想对我说的吗？💫",
					"让我们一起探索未知的世界吧！🚀",
					"每一颗星星都有自己的故事~⭐",
					"希望能带给你温暖和快乐！💖",
				],
				messageDisplayTime: 3000,
				idleAnimations: ["idle", "emoji_0", "emoji_1", "emoji_3", "emoji_4"],
				idleInterval: 8000,
			},
		},
	],

	// 默认激活的模型 key
	defaultModel: "105913",

	// 单模型字段（向后兼容，models 为空时使用）
	model: {
		path: "/pio/models/spine/105913/105913.json",
		scale: 0.24,
		x: 0,
		y: 0,
		skin: "normal",
		premultipliedAlpha: true,
		viewportPadding: { left: 0, right: 0, top: 0, bottom: 0 },
	},

	// 全局默认位置配置
	position: {
		corner: "bottom-left",
		offsetX: 0,
		offsetY: 0,
	},

	// 全局默认尺寸配置
	size: {
		width: 150,
		height: 245,
	},

	// 全局默认交互配置
	interactive: {
		enabled: true,
		clickAnimations: ["mouth_talk", "eye_blink"],
		clickMessages: [
			"你好呀！",
			"今天也要加油哦！✨",
		],
		messageDisplayTime: 3000,
		idleAnimations: ["eye_idle"],
		idleInterval: 8000,
	},

	// 响应式配置
	responsive: {
		hideOnMobile: true,
		mobileBreakpoint: 768,
	},

	zIndex: 1000,
	opacity: 1.0,
};

// Live2D 看板娘配置 (使用 l2d-widget 库，文档：https://l2d-widget.hacxy.cn)
export const live2dWidgetConfig: Live2DWidgetConfig = {
	// Live2D 看板娘开关
	enable: false,
	// 模型配置，支持单个模型或数组（多模型切换）
	model: [
		{
			// Live2D模型本地文件路径
			path: "/pio/models/live2d/snow_miku/model.json",
			// 动作声音音量 范围0~1，默认 0（静音）
			volume: 0,
			// 模型缩放比例
			scale: 1,
			// X轴偏移，范围 -2~2，正值向右
			x: 0,
			// Y轴偏移，范围 -2~2，正值向上
			y: 0,
		},
		{
			// 外部直连模型
			path: "https://model.hacxy.cn/cat-black/model.json",
			volume: 0,
			scale: 1,
			x: 0,
			y: 0,
		},
	],
	// 显示位置：bottom-left 或 bottom-right
	position: "bottom-left" as const,
	// 画布尺寸（px）
	size: { width: 200, height: 200 },
	// 主题色，用于菜单、状态条等 UI 元素的背景色，默认 'rgba(96,165,250,0.9)'
	primaryColor: "var(--l2d-msg-bg)",
	// 入场/退场动画时长（ms）
	transitionDuration: 1500,
	// 入场/退场动画类型
	transitionType: "slide" as const,
	// 菜单配置
	menus: {
		// 完全替换默认菜单项
		items: [
			{
				icon: "mdi:home",
				label: "返回主页",
				action: "home",
			},
			{
				icon: "mdi:arrow-up",
				label: "返回顶部",
				action: "scrollToTop",
			},
			{
				icon: "mdi:bed",
				label: "休眠",
				action: "sleep",
			},
			{
				icon: "mdi:swap-horizontal",
				label: "切换模型",
				action: "switchModel",
			},
			{
				icon: "mdi:github",
				label: "GitHub",
				action: "github",
			},
		],
		// 菜单对齐方式
		align: "right" as const,
	},
	// 提示气泡配置
	tips: {
		// 气泡开关
		enable: true,
		// 初始欢迎消息
		welcomeMessage: ["你好呀！", "欢迎来到我的世界！"],
		// 循环提示内容
		messages: [
			"有什么需要帮助的吗？",
			"今天天气真不错呢！",
			"要不要一起玩游戏？",
			"记得按时休息哦！",
		],
		// 文字显示时间（ms）
		duration: 3000,
		// 提示气泡切换间隔（ms）
		interval: 6000,
		// 位置偏移量（px），基于默认位置（模型正上方居中）进行微调
		offset: {
			x: 0, // 正值右移，负值左移
			y: 0, // 正值下移，负值上移
		},
	},
	// 响应式配置
	responsive: {
		// 在移动端隐藏
		hideOnMobile: true,
		// 移动端断点
		mobileBreakpoint: 768,
	},
};

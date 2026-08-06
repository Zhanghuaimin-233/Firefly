// Spine 看板娘单模型定义（用于前端切换）。未提供的字段回退到 spineModelConfig 全局默认
export type SpineModelEntry = {
	key: string; // 唯一标识，如 "firefly"、"105913"
	name: string; // 设置面板显示名，如 "流萤"
	model: {
		path: string; // 模型文件路径 (.json)
		scale?: number;
		x?: number;
		y?: number;
		skin?: string;
		premultipliedAlpha?: boolean;
		// viewport padding（px 或 "10%" 等字符串）。全设 0 则 skeleton 贴 canvas 边；不配则用 SpinePlayer 默认 10%
		viewportPadding?: {
			left?: number | string;
			right?: number | string;
			top?: number | string;
			bottom?: number | string;
		};
	};
	size?: { width?: number; height?: number };
	position?: {
		corner?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
		offsetX?: number;
		offsetY?: number;
	};
	interactive?: {
		enabled?: boolean;
		clickAnimations?: string[];
		clickMessages?: string[];
		messageDisplayTime?: number;
		idleAnimations?: string[];
		idleInterval?: number;
	};
};

// Spine 看板娘配置
export type SpineModelConfig = {
	enable: boolean; // 是否启用 Spine 看板娘（总开关默认值，可被前端设置覆盖）
	// 可切换的模型列表。若为空数组则回退到下面的单 model 字段（向后兼容）
	models: SpineModelEntry[];
	// 默认激活的模型 key（前端未选择时使用）
	defaultModel: string;

	// 单模型字段（向后兼容，models 为空时使用）
	model: {
		path: string; // 模型文件路径 (.json)
		scale?: number; // 模型缩放比例，默认1.0
		x?: number; // X轴偏移，默认0
		y?: number; // Y轴偏移，默认0
		skin?: string; // 默认皮肤名，用于立绘类模型（base 在 default 皮肤、表情在命名皮肤时需指定，如 "normal"）
		premultipliedAlpha?: boolean; // 纹理是否预乘 alpha，默认 false。Spine 3.6 导出的纹理通常为 true，与 straight alpha 混用会导致半透明区域变灰
		viewportPadding?: {
			left?: number | string;
			right?: number | string;
			top?: number | string;
			bottom?: number | string;
		};
	};
	position: {
		corner: "bottom-left" | "bottom-right" | "top-left" | "top-right"; // 显示位置
		offsetX?: number; // 水平偏移量，默认20px
		offsetY?: number; // 垂直偏移量，默认20px
	};
	size: {
		width?: number; // 容器宽度，默认280px
		height?: number; // 容器高度，默认400px
	};
	interactive?: {
		enabled?: boolean; // 是否启用交互功能，默认true
		clickAnimations?: string[]; // 点击时随机播放的动画列表
		clickMessages?: string[]; // 点击时随机显示的文字消息
		messageDisplayTime?: number; // 文字显示时间（毫秒），默认3000
		idleAnimations?: string[]; // 待机动画列表
		idleInterval?: number; // 待机动画切换间隔（毫秒），默认10000
	};
	responsive?: {
		hideOnMobile?: boolean; // 是否在移动端隐藏，默认false
		mobileBreakpoint?: number; // 移动端断点，默认768px
	};
	zIndex?: number; // 层级，默认1000
	opacity?: number; // 透明度，0-1，默认1.0
};

// Live2D 看板娘配置 (使用 l2d-widget)
export type Live2DWidgetConfig = {
	enable: boolean; // 是否启用 Live2D 看板娘
	model:
		| { path: string; volume?: number; scale?: number; x?: number; y?: number }
		| {
				path: string;
				volume?: number;
				scale?: number;
				x?: number; // X轴偏移，范围 -2~2，正值向右
				y?: number; // Y轴偏移，范围 -2~2，正值向上
		  }[]; // 模型配置，支持单个或多个模型
	position?: "bottom-left" | "bottom-right"; // 显示位置，默认 "bottom-left"
	size?: number | { width: number; height: number }; // 画布尺寸（px），默认 300
	primaryColor?: string; // 主题色，用于菜单、状态条等 UI 元素
	transitionDuration?: number; // 入场/退场动画时长（ms），默认 1500
	transitionType?: "slide" | "fade"; // 入场/退场动画类型，默认 "slide"
	menus?: {
		items?: { icon?: string; label: string; action: string }[]; // 完全替换默认菜单项
		extraItems?: { icon?: string; label: string; action: string }[]; // 追加到默认菜单末尾
		align?: "left" | "right"; // 菜单对齐方式，默认 "right"
	};
	tips?: {
		enable?: boolean; // 气泡开关，默认 true
		welcomeMessage?: string[]; // 欢迎语
		messages?: string[]; // 循环提示内容
		duration?: number; // 每条提示展示时长（ms），默认 3000
		interval?: number; // 提示循环间隔（ms），默认 5000
		offset?: { x?: number; y?: number }; // 位置偏移量（px）
		typing?: {
			param?: string; // 嘴型参数名
			speed?: number; // 打字速度（ms/字），默认 100
			minValue?: number; // 嘴型开合最小值（0-1），默认 0.5
			maxValue?: number; // 嘴型开合最大值（0-1），默认 1
		};
	};
	responsive?: {
		hideOnMobile?: boolean; // 是否在移动端隐藏
		mobileBreakpoint?: number; // 移动端断点，默认 768
	};
};

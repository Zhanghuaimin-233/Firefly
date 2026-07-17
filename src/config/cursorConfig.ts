import type { CursorConfig } from "../types/effectsConfig";

// 自定义鼠标光标配置
// 资源位于 public/assets/cursors/ 目录下
// 浏览器原生支持 .cur 格式（含热点坐标），无需额外指定热点位置
export const cursorConfig: CursorConfig = {
	// 是否启用自定义光标
	enable: false,

	// 是否允许用户在设置中切换
	switchable: true,

	// 光标资源路径（相对于 public 目录）
	// 留空则该类型使用浏览器默认光标
	paths: {
		default: "/assets/cursors/Arrow.cur", // 默认指针
		pointer: "/assets/cursors/hand.cur", // 链接/可点击
		text: "/assets/cursors/IBeam.cur", // 文本选择
		crosshair: "/assets/cursors/Cross.cur", // 十字
		help: "/assets/cursors/Help.cur", // 帮助
		notAllowed: "/assets/cursors/No.cur", // 不可用
		move: "/assets/cursors/SizeAll.cur", // 移动
		nResize: "/assets/cursors/SizeNS.cur", // 上下调整
		sResize: "/assets/cursors/SizeNS.cur",
		eResize: "/assets/cursors/SizeWE.cur", // 左右调整
		wResize: "/assets/cursors/SizeWE.cur",
		neResize: "/assets/cursors/SizeNESW.cur", // 东北西南调整
		swResize: "/assets/cursors/SizeNESW.cur",
		nwResize: "/assets/cursors/SizeNWSE.cur", // 西北东南调整
		seResize: "/assets/cursors/SizeNWSE.cur",
	},
};

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
	// 字段与 CSS cursor 关键字一一对应；无专属 .cur 的语义复用现有资源
	paths: {
		default: "/assets/cursors/Arrow.cur", // default
		pointer: "/assets/cursors/hand.cur", // pointer
		help: "/assets/cursors/Help.cur", // help
		progress: "/assets/cursors/AppStarting.cur", // progress（箭头+沙漏）
		text: "/assets/cursors/IBeam.cur", // text
		crosshair: "/assets/cursors/Cross.cur", // crosshair
		move: "/assets/cursors/SizeAll.cur", // move
		notAllowed: "/assets/cursors/No.cur", // not-allowed
		noDrop: "/assets/cursors/No.cur", // no-drop（复用 No）
		grab: "/assets/cursors/SizeAll.cur", // grab（复用 SizeAll）
		grabbing: "/assets/cursors/SizeAll.cur", // grabbing（复用 SizeAll）
		allScroll: "/assets/cursors/SizeAll.cur", // all-scroll（复用 SizeAll）
		colResize: "/assets/cursors/SizeWE.cur", // col-resize（复用 SizeWE）
		rowResize: "/assets/cursors/SizeNS.cur", // row-resize（复用 SizeNS）
		nResize: "/assets/cursors/SizeNS.cur", // n-resize
		sResize: "/assets/cursors/SizeNS.cur", // s-resize
		eResize: "/assets/cursors/SizeWE.cur", // e-resize
		wResize: "/assets/cursors/SizeWE.cur", // w-resize
		neResize: "/assets/cursors/SizeNESW.cur", // ne-resize
		swResize: "/assets/cursors/SizeNESW.cur", // sw-resize
		nwResize: "/assets/cursors/SizeNWSE.cur", // nw-resize
		seResize: "/assets/cursors/SizeNWSE.cur", // se-resize
	},
};

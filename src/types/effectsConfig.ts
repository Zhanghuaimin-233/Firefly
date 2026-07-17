export type SakuraConfig = {
	enable: boolean; // 是否启用樱花特效
	switchable?: boolean; // 是否允许用户在设置中切换樱花特效
	sakuraNum: number; // 樱花数量，默认21
	limitTimes: number; // 樱花越界限制次数，-1为无限循环
	size: {
		min: number; // 樱花最小尺寸倍数
		max: number; // 樱花最大尺寸倍数
	};
	opacity: {
		min: number; // 樱花最小不透明度
		max: number; // 樱花最大不透明度
	};
	speed: {
		horizontal: {
			min: number; // 水平移动速度最小值
			max: number; // 水平移动速度最大值
		};
		vertical: {
			min: number; // 垂直移动速度最小值
			max: number; // 垂直移动速度最大值
		};
		rotation: number; // 旋转速度
		fadeSpeed: number; // 消失速度，不应大于最小不透明度
	};
	zIndex: number; // 层级，确保樱花在合适的层级显示
};

// 自定义鼠标光标配置
export type CursorConfig = {
	enable: boolean; // 是否启用自定义光标
	switchable?: boolean; // 是否允许用户在设置中切换
	// 光标资源路径（相对于 public 目录），每个对应一种 CSS 光标类型
	// 留空则该类型使用浏览器默认光标
	paths: {
		default?: string; // 默认指针（Arrow）
		pointer?: string; // 链接/可点击（hand）
		text?: string; // 文本选择（IBeam）
		crosshair?: string; // 十字（Cross）
		help?: string; // 帮助（Help）
		notAllowed?: string; // 不可用（No）
		move?: string; // 移动（SizeAll）
		nResize?: string; // 上下调整（SizeNS）
		sResize?: string; // 上下调整（SizeNS）
		eResize?: string; // 左右调整（SizeWE）
		wResize?: string; // 左右调整（SizeWE）
		neResize?: string; // 东北西南调整（SizeNESW）
		swResize?: string; // 东北西南调整（SizeNESW）
		nwResize?: string; // 西北东南调整（SizeNWSE）
		seResize?: string; // 西北东南调整（SizeNWSE）
	};
};

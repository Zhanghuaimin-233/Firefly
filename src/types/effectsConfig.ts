export type SakuraConfig = {
	enable: boolean; // 是否启用樱花特效
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

// 鼠标跟随花瓣特效配置（复刻 Wallpaper Engine 光标花瓣粒子系统）
export type CursorTrailConfig = {
	enable: boolean; // 是否启用
	switchable?: boolean; // 是否允许用户在设置中切换
	imageSrc: string; // 花瓣图片路径（相对 public 目录）
	maxParticles: number; // 粒子池上限
	emitRate: number; // 每帧发射数量
	particleLife: { min: number; max: number }; // 生命周期（秒）
	size: { min: number; max: number }; // 初始尺寸（像素）
	speed: { min: number; max: number }; // 发射速度
	gravity: { x: number; y: number }; // 重力（WE: 0 -50 0）
	drag: number; // 阻力系数（WE: 1）
	repel: { scale: number; threshold: number }; // 近距离排斥（WE: -600, 50）
	attract: { scale: number; threshold: number }; // 远距离吸引（WE: 500, 5000）
	vortex: { distanceOuter: number; speed: number }; // 涡旋（WE: 50, 300）
	trailLength: number; // 拖尾长度（WE: 1）
	sequenceCount: number; // 序列分组数（WE: mapsequencearoundcontrolpoint count 5）
	orbitRadius: number; // 初始轨道偏移半径（粒子围绕控制点的发射半径）
	tangentSpeed: number; // 初始切向速度（WE: speed "0 100 0"，缩小后按比例）
	colorRange: { min: [number, number, number]; max: [number, number, number] }; // 颜色随机范围 RGB
	zIndex: number; // 层级
	ambient?: AmbientPetalConfig; // 环境落花层配置（可选）
};

// 自定义鼠标光标配置
export type CursorConfig = {
	enable: boolean; // 是否启用自定义光标
	switchable?: boolean; // 是否允许用户在设置中切换
	// 光标资源路径（相对于 public 目录），每个对应一种 CSS cursor 关键字
	// 留空则该类型使用浏览器默认光标
	// 字段覆盖 MDN cursor 规范中有 .cur 资源支撑或可语义复用的关键字
	paths: {
		default?: string; // default：默认指针（Arrow）
		pointer?: string; // pointer：链接/可点击（hand）
		help?: string; // help：帮助（Help）
		progress?: string; // progress：后台忙碌可交互（AppStarting）
		text?: string; // text：文本选择（IBeam）
		crosshair?: string; // crosshair：十字（Cross）
		move?: string; // move：移动（SizeAll）
		notAllowed?: string; // not-allowed：不可用（No）
		noDrop?: string; // no-drop：不可放置（复用 No）
		grab?: string; // grab：可抓取（复用 SizeAll）
		grabbing?: string; // grabbing：抓取中（复用 SizeAll）
		allScroll?: string; // all-scroll：全向滚动（复用 SizeAll）
		colResize?: string; // col-resize：列宽调整（复用 SizeWE）
		rowResize?: string; // row-resize：行高调整（复用 SizeNS）
		nResize?: string; // n-resize：上调整（SizeNS）
		sResize?: string; // s-resize：下调整（SizeNS）
		eResize?: string; // e-resize：右调整（SizeWE）
		wResize?: string; // w-resize：左调整（SizeWE）
		neResize?: string; // ne-resize：东北调整（SizeNESW）
		swResize?: string; // sw-resize：西南调整（SizeNESW）
		nwResize?: string; // nw-resize：西北调整（SizeNWSE）
		seResize?: string; // se-resize：东南调整（SizeNWSE）
	};
};

// 环境落花层配置（复刻 WE particles/huya.json）
export type AmbientPetalConfig = {
	enable: boolean; // 是否启用环境落花层
	emitRate: number; // 每秒发射数量（WE: 20）
	maxParticles: number; // 粒子池上限（WE: 30）
	particleLife: { min: number; max: number }; // 生命周期秒（WE: 11-16）
	size: { min: number; max: number }; // 尺寸像素（WE: 40-80）
	velocity: { min: [number, number]; max: [number, number] }; // 初始速度 xy（WE: 140-250, 50-90）
	gravity: { x: number; y: number }; // 重力（WE: 5 10 0）
	drag: number; // 阻力（WE: 0.1）
	turbulent: {
		// 湍流（WE: turbulentvelocityrandom）
		offset: number;
		scale: number;
		speedMin: number;
		speedMax: number;
	};
	angularVelocity: { min: number; max: number }; // 自转角速度（WE: -5~5）
	fadeIn: number; // 淡入时间秒（WE: 0.1）
	fadeOut: number; // 淡出时间占比 0-1（WE: 0.9）
	colorRange: {
		min: [number, number, number];
		max: [number, number, number];
	}; // 颜色（WE: 255 255 255 → 255 192 248）
};

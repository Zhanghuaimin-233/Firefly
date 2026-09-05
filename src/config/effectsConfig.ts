import type { CursorTrailConfig, SakuraConfig } from "../types/effectsConfig";

// 特效配置 - 集中管理所有动画特效

export const sakuraConfig: SakuraConfig = {
	// 是否启用樱花特效
	enable: true,

	// 樱花数量
	sakuraNum: 21,

	// 樱花越界限制次数，-1为无限循环
	limitTimes: -1,

	// 樱花尺寸
	size: {
		// 樱花最小尺寸倍数
		min: 0.5,
		// 樱花最大尺寸倍数
		max: 1.1,
	},

	// 樱花不透明度
	opacity: {
		// 樱花最小不透明度
		min: 0.3,
		// 樱花最大不透明度
		max: 0.9,
	},

	// 樱花移动速度
	speed: {
		// 水平移动
		horizontal: {
			// 水平移动速度最小值
			min: -1.7,
			// 水平移动速度最大值
			max: -1.2,
		},
		// 垂直移动
		vertical: {
			// 垂直移动速度最小值
			min: 1.5,
			// 垂直移动速度最大值
			max: 2.2,
		},
		// 旋转速度
		rotation: 0.03,
		// 消失速度，不应大于最小不透明度
		fadeSpeed: 0.03,
	},

	// 层级，确保樱花在合适的层级显示
	zIndex: 100,
};

// 鼠标跟随花瓣特效配置（复刻 Wallpaper Engine 光标花瓣粒子系统）
// 参数对照 WE: particles/workshop/2093672045/Cherry_Blossoms_2.json
export const cursorTrailConfig: CursorTrailConfig = {
	// 是否启用
	enable: true,

	// 是否允许用户在设置中切换
	switchable: true,

	// 花瓣图片路径（相对 public 目录）
	// 使用 trimmed 版本（78×138，无透明边距；原版 200×200 含大量透明）
	imageSrc: "/assets/images/effects/cursor-petal-trimmed.png",

	// 粒子池上限（WE: maxcount 1000）
	maxParticles: 1000,

	// 每秒发射数量（WE: emitter rate 100）
	emitRate: 100,

	// 生命周期（秒）（WE: lifetimerandom 1-2.25）
	particleLife: {
		min: 1,
		max: 2.25,
	},

	// 初始尺寸（像素，指花瓣宽度；高度按纹理宽高比自动计算）
	// WE 原版 30-40 在 3840 坐标系；网页按比例缩小到 2.5-3.5
	size: {
		min: 2.5,
		max: 3.5,
	},

	// 发射速度（WE: emitter speedmin 0, speedmax 20）
	// 减小随机扩散，让 vortex 切向旋转主导运动
	speed: {
		min: 0,
		max: 5,
	},

	// 重力（Canvas 坐标系：Y 向下为正；WE 原值 0 -50 0 在 3D 中表示向下）
	gravity: {
		x: 0,
		y: 50,
	},

	// 阻力系数（WE: movement drag 1）
	drag: 1,

	// 近距离排斥：距鼠标小于 threshold 时施加 scale 方向力（WE: controlpointattract -600, 50）
	// threshold 缩小到 25（50%），稳态半径从 8.4 缩小到 4.2
	repel: {
		scale: -600,
		threshold: 25,
	},

	// 远距离吸引：距鼠标小于 threshold 时施加 scale 方向力（WE: controlpointattract 500, 5000）
	attract: {
		scale: 500,
		threshold: 5000,
	},

	// 涡旋：距鼠标小于 distanceOuter 时施加切向速度（WE: vortex 50, 300）
	// distanceOuter 缩小到 25（50%），运动范围减半
	vortex: {
		distanceOuter: 25,
		speed: 300,
	},

	// 拖尾长度（WE: spritetrail maxlength 1）
	trailLength: 1,

	// 序列分组数（WE: mapsequencearoundcontrolpoint count 5）
	// 粒子分5组，按 72°(2π/5) 相位差围绕控制点发射
	// 配合 vortex 旋转 + gravity 下拉，5组摆线运动叠加形成五瓣花形旋涡
	sequenceCount: 5,

	// 初始轨道偏移半径（粒子围绕控制点的发射半径）
	// WE 原版约 8-10（稳态半径），缩小到 4-5
	orbitRadius: 4,

	// 初始切向速度（WE: mapsequencearoundcontrolpoint speed "0 100 0"）
	// 缩小后约 50
	tangentSpeed: 50,

	// 颜色随机范围 RGB（WE: colorrandom 255 173 169 → 249 222 255）
	// 调整博客主题色改这里
	colorRange: {
		min: [255, 173, 169], // 粉
		max: [249, 222, 255], // 淡紫
	},

	// 层级
	zIndex: 100,

	// 环境落花层（复刻 WE particles/huya.json，场景装饰性落花，从屏幕顶部斜向飘落）
	// 已禁用：用户只需要光标跟随粒子效果
	ambient: {
		enable: false,
		emitRate: 20,
		maxParticles: 30,
		particleLife: { min: 11, max: 16 },
		size: { min: 40, max: 80 },
		velocity: { min: [140, 50], max: [250, 90] },
		gravity: { x: 5, y: 10 },
		drag: 0.1,
		turbulent: { offset: 3, scale: 0.5, speedMin: 35, speedMax: 100 },
		angularVelocity: { min: -5, max: 5 },
		fadeIn: 0.1,
		fadeOut: 0.9,
		colorRange: { min: [255, 255, 255], max: [255, 192, 248] },
	},
};

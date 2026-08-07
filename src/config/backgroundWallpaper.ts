import type { BackgroundWallpaperConfig } from "@/types/backgroundWallpaper";

export const backgroundWallpaper: BackgroundWallpaperConfig = {
	// 壁纸模式："banner" 横幅壁纸，"fullscreen" 全屏壁纸，"overlay" 全屏透明，"none" 纯色背景无壁纸
	mode: "banner",
	// 是否启用背景视频播放，配置后将在导航栏显示视频播放按钮
	playerEnable: true,
	/**
	 * 背景图片配置
	 * 图片路径支持三种格式：
	 * 1. public 目录（以 "/" 开头，不优化）："/assets/images/banner.avif"
	 * 2. src 目录（不以 "/" 开头，自动优化但会增加构建时间，推荐）："assets/images/banner.avif"
	 * 3. 远程 URL："https://example.com/banner.jpg"
	 * 注意：远程URL和public目录的图片不会被优化，请确保图片体积足够小以免影响加载速度
	 *
	 * 建议不要替换d1-d6，m1-m6这些默认示例图片，但你可以删除掉节省空间
	 * 因为以后可能会更换示例图片，导致你自定义的图片被覆盖
	 * 所以建议使用自己的图片的时候命名为其他名称，不要使用d1-d6，m1-m6这些名称
	 *
	 * 如果只使用一张图片或者使用随机图API，推荐直接使用字符串格式：
	 * desktop: "https://t.alcy.cc/pc",   // 随机图API
	 * desktop: "assets/images/DesktopWallpaper/d1.avif", // 单张图片
	 *
	 * mobile: "https://t.alcy.cc/mp", // 随机图API
	 * mobile: "assets/images/MobileWallpaper/m1.avif", // 单张图片
	 *
	 * 支持配置多张图片（数组），每次刷新页面随机显示一张：
	 * desktop: [
	 * "assets/images/DesktopWallpaper/d1.avif",
	 * "assets/images/DesktopWallpaper/d2.avif",
	 * ],
	 *
	 * mobile:[
	 *   "assets/images/MobileWallpaper/m1.avif",
	 *   "assets/images/MobileWallpaper/m2.avif",
	 * ],
	 */
	src: {
		// 桌面背景图片（支持单张或多张随机）
		// desktop: "assets/images/DesktopWallpaper/d1.avif",
		desktop: [
			"assets/images/DesktopWallpaper/105931.avif",
			"assets/images/DesktopWallpaper/105961.avif",
			"assets/images/DesktopWallpaper/107631.avif",
			"assets/images/DesktopWallpaper/107661.avif",
			"assets/images/DesktopWallpaper/111931.avif",
			"assets/images/DesktopWallpaper/115531.avif",
			"assets/images/DesktopWallpaper/125331.avif",
			"assets/images/DesktopWallpaper/137631.avif",
			"assets/images/DesktopWallpaper/180531.avif",
		],
		// 移动背景图片（支持单张或多张随机）
		// mobile: "assets/images/MobileWallpaper/m1.avif",
		mobile: [
			"assets/images/MobileWallpaper/m1.avif",
			"assets/images/MobileWallpaper/m2.avif",
			"assets/images/MobileWallpaper/m3.avif",
			"assets/images/MobileWallpaper/m4.avif",
			"assets/images/MobileWallpaper/m5.avif",
			"assets/images/MobileWallpaper/m6.avif",
		],
		// 背景视频播放地址
		// 支持单个视频路径（字符串）或多个视频循环（数组，参考上面壁纸配置）
		// 支持远程视频URL，本地视频请放在 public/assets/videos/ 目录下
		// playerUrl: "/assets/videos/firefly.mp4",
		playerUrl: "https://bed.twoleaf.cn/file/1785658612716_firefly.mp4",
	},
	// 横幅壁纸和全屏壁纸共享配置
	common: {
		// 壁纸遮罩暗度，让横幅文字显示更清晰，0-1之间，值越大越暗
		dimOpacity: 0.2,
		// 多视频播放模式："order" 顺序循环，"random" 随机切换（仅当 playerUrl 为数组时生效）
		playerMode: "random",
		// 主页横幅文字
		homeText: {
			// 是否启用主页横幅文字
			enable: true,
			// 主页横幅主标题
			title: "With You, My Lord.",
			// 主页横幅主标题中文翻译（显示在主标题下方，字号较小，可选）
			titleTranslation: "与你同在，我的主。",
			// 主页横幅主标题字体大小
			titleSize: "4.5rem",
			// 主页横幅副标题
			subtitle: [
				"Through Whispering Winds, I Follow",
    			"Beneath Verdant Leaves, I Await",
    			"Along Distant Roads, I Walk Beside You",
    			"Amid Gentle Dawn, I Offer My Prayer",
    			"Through Fleeting Seasons, I Stay",
    			"Wherever You May Go, I Shall Follow",
			],
			// 主页横幅副标题中文翻译（与 subtitle 一一对应，打字机模式下跟随英文同步切换，可选）
			subtitleTranslation: [
				"穿过低语的风，我相随",
				"在翠绿的叶下，我等候",
				"沿着遥远的路，我伴你同行",
				"在温柔的晨光中，我献上祈祷",
				"穿过流转的四季，我驻留",
				"无论你去往何方，我都将追随",
			],
			// 主页横幅副标题字体大小
			subtitleSize: "1.5rem",
			// 中文翻译字体大小（主标题翻译和副标题翻译共用，可选，默认 "1rem"）
			translationSize: "1.125rem",
			typewriter: {
				// 是否启用打字机效果
				// 打字机开启 → 循环显示所有副标题
				// 打字机关闭 → 每次刷新随机显示一条副标题
				enable: true,
				// 打字速度（毫秒）
				speed: 100,
				// 删除速度（毫秒）
				deleteSpeed: 50,
				// 完全显示后的暂停时间（毫秒）
				pauseTime: 2000,
			},
		},
		// 文章横幅信息："description" 显示描述，"meta" 显示日期、字数和阅读时长
		postInfo: {
			mode: "description",
		},
		// 导航栏配置
		navbar: {
			// 导航栏透明模式："semi" 半透明，"full" 完全透明，"semifull" 动态透明
			transparentMode: "semi",
			// 毛玻璃模糊度，0 即关闭导航栏的毛玻璃
			// 注意：导航栏子菜单与浮动面板始终保留毛玻璃，模糊度跟随此项但有最小值
			blur: 5,
		},
		// 水波纹动画效果配置，开启会影响页面性能，请根据自己的喜好开启
		waves: {
			enable: {
				// 桌面端是否启用水波纹动画效果
				desktop: true,
				// 移动端是否启用水波纹动画效果
				mobile: true,
			},
		},
		// 渐变过渡效果配置，当水波纹关闭时自动启用，提供壁纸底部到背景色的平滑过渡
		gradient: {
			enable: {
				// 桌面端是否启用渐变过渡
				desktop: true,
				// 移动端是否启用渐变过渡
				mobile: true,
			},
			// 渐变高度
			height: "10%",
		},
		// 壁纸轮播配置，横幅壁纸和全屏壁纸共享，仅在配置多张图片时生效
		carousel: {
			// 是否启用壁纸轮播；关闭时保持每次刷新随机显示一张
			enable: false,
			// 轮播切换间隔（毫秒）
			interval: 5000,
			// 过渡效果: 'fade' 渐变 | 'zoom' 缩放 | 'slide' 滑动 | 'kenburns' 旋转木马
			transitionEffect: "zoom",
		},
	},
	// Banner模式特有配置
	banner: {
		// 图片位置
		// 支持所有CSS object-position值，如: 'top', 'center', 'bottom', 'left top', 'right bottom', '25% 75%', '10px 20px'..
		// 如果不知道怎么配置百分百之类的配置，推荐直接使用：'center'居中，'top'顶部居中，'bottom' 底部居中，'left'左侧居中，'right'右侧居中
		position: "0% 20%",
	},
	// 全屏透明覆盖模式特有配置
	overlay: {
		// 层级，确保壁纸在背景层
		zIndex: -1,
		// 壁纸透明度
		opacity: 0.8,
		// 背景模糊度
		blur: 10,
		// 卡片透明度，0-1之间，值越小越透明
		cardOpacity: 0.5,
	},
	// 全屏壁纸模式特有配置
	fullscreen: {
		// 图片位置
		position: "center",
	},
};

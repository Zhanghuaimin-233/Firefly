---
title: 给博客换一只鼠标
published: 2026-08-11
description: 给 Firefly 博客换一套自定义 Windows 光标：从素材格式的坑（ani/png/cur）、配置驱动接入、动态注入 CSS，到 Swup 切页丢失样式、右键菜单露馅和图标需重新生成等折腾记录。
image: ""
tags: [博客, 光标, Firefly, 前端]
category: 博客折腾
draft: false
slug: custom-blog-cursor
---

博客折腾到一定程度，就会开始在意一些没用但好玩的东西。比如鼠标指针。

默认那个白色小箭头看了好多年，功能上没毛病，审美上无聊。既然整个博客都是自己定制的，光标没理由不能换。

## 先翻一遍家底

第一反应是看看项目里有没有现成的开关。这个博客基于 Firefly 主题，配置都在 `src/config/` 下，每个功能对应一个文件：壁纸、字体、樱花特效、音乐播放器……唯独没有光标。

那就自己加。

## 素材这关比想象中绕

本来以为拿到一套光标素材就能直接用。结果一翻，是 png 和 ani 混着的。

png 没问题，浏览器都支持。ani 就不行了——这是 Windows 的动态光标格式，浏览器压根不认。查了一圈，CSS `cursor: url()` 只认静态图，想要动态光标基本没戏。

退而求其次，用静态。但 png 有个麻烦：热点坐标。光标的"点击点"不一定在左上角，比如十字光标的热点在中心，调整大小光标的热点在边缘。png 不带热点信息，得在 CSS 里手动指定：

```css
cursor: url(x.png) 4 4, auto;
```

每个光标都要算坐标，烦。

最后发现 `.cur` 格式才是正解。这是 Windows 静态光标格式，浏览器原生支持，而且热点坐标内嵌在文件里，CSS 里写路径就行，不用额外指定。

整理了一套 32×32 的标准 Windows 光标，十四个：Arrow、hand、IBeam、Cross、Help、No、SizeAll、各种 Size。够用了。

## 配置怎么放

Firefly 是配置驱动的，所有功能都在 `src/config/` 下有一个对应的 `xxxConfig.ts`。照着樱花特效的样子做一个 `cursorConfig.ts`：

```ts
export const cursorConfig: CursorConfig = {
  enable: false,
  switchable: true,
  paths: {
    default:    "/assets/cursors/Arrow.cur",
    pointer:    "/assets/cursors/hand.cur",
    text:       "/assets/cursors/IBeam.cur",
    // ... 其他各种语义
  },
};
```

`enable` 默认关，因为不是所有访客都喜欢被改光标。`switchable` 控制用户能不能在设置面板里自己开关。`paths` 是各种光标语义到资源文件的映射。

资源放在 `public/assets/cursors/` 下，直接走静态服务。

## 怎么把样式塞进去

思路是动态生成一段 CSS，注入到 `<head>` 里。核心就一句：

```css
*, *::before, *::after {
  cursor: url('/assets/cursors/Arrow.cur'), auto !important;
}
```

`!important` 是必须的，不然 Tailwind 的 `cursor-pointer` 这类工具类会盖掉。

不同元素对应不同光标，所以要根据语义生成多组规则：

- `a, button, [role="button"]` 这些用 `pointer` 光标
- `input[type="text"], textarea` 这些用 `text` 光标
- `[disabled]` 用 `notAllowed` 光标
- 调整大小的八个方向各自有对应

写了个 `buildCursorCSS(paths)` 函数，把配置对象转成一段 CSS 字符串，然后塞进一个 `<style id="firefly-cursor-style">` 标签里。组件挂载在全局 Layout 里，紧跟在樱花特效后面。

## 加个开关

光标这事见仁见智，不能强加给所有访客。所以在显示设置面板里加了个开关，跟樱花特效放一块。

开关的状态走 localStorage，跟主题色、壁纸模式一套逻辑：`getDefaultCursorEnabled` 读配置默认值，`getStoredCursorEnabled` 读 localStorage，`setCursorEnabled` 写入并派发一个 `cursorToggle` 事件。

光标组件监听这个事件，开就注入样式，关就移除 `<style>` 标签。

## 切页就失效

兴冲冲打开本地预览，首页光标正常，点进文章页——光标变回原样了。

第一反应是没做持久化。但想了想，开关状态明明存了 localStorage，组件也监听了事件，怎么还会丢？

翻了一下，问题出在 Swup。这个博客用 Swup 做页面切换，切页时会把整个 `<head>` 替换掉。我注入的那个 `<style>` 标签在 `<head>` 里，自然跟着没了。

更尴尬的是，组件里有个 `window.__fireflyCursorInitialized` 标记防止重复初始化。切页后这个标记还在，于是 `setup()` 直接 return，不会重新注入样式。

解决办法是监听 Swup 的页面切换事件，每次切完都重新读 localStorage 判断要不要重新注入。为了兼容 Swup 不同版本，一口气注册了三个：

```js
document.addEventListener('swup:contentReplaced', reapply);
document.addEventListener('swup:content:replace', reapply);
document.addEventListener('swup:enable', () => {
  window.swup.hooks.on('content:replace', reapply);
});
```

第三个是为了在 Swup 初始化完成后挂上 hook。冗余是冗余了点，但三个里总有一个能命中。

## 右键菜单还是露馅

换完光标，左点右点都挺满意，结果一右键——菜单出来的时候，光标变回原生箭头了。

这不是 Bug。右键菜单是浏览器系统级 UI，CSS 的 `cursor` 属性管不到这一层。滚动条、原生表单下拉也是一样。

除非自己实现一个右键菜单组件盖住原生的，否则这个角落永远会露出原生光标。想了想，不值得为一个光标去做自定义右键菜单，接受了。

## 图标也不显示

最后一个小坑。设置面板里那个开关按钮的图标，本来用的是 `mdi:cursor-default`，结果显示成一个灰色圆圈。

翻了一下项目的图标机制，才想起来这个项目的图标是构建时扫描生成的。`scripts/generate-icons.js` 会扫所有 `.svelte` 文件里的 `icon="prefix:name"` 模式，把对应 SVG 提取出来塞进 `src/constants/icons.ts`。

我新加的图标名不在上次的扫描结果里，运行时找不到，就显示占位。

跑一遍 `pnpm icons` 重新生成，好了。

## 小结

整个过程踩了四个坑：

1. ani 浏览器不支持，得用 cur
2. Swup 切页会丢 head 里的 style，得重新注入
3. 右键菜单是系统 UI，CSS 管不到
4. 新加的图标名要跑 `pnpm icons` 生成

光标本身实现起来不难，真正花时间的是搞清楚浏览器、Swup、构建工具各自在哪一层、管什么事。博客折腾这事大体也是这个套路——你以为在改一个东西，其实是在和一整条链路打交道。

第一篇日记就到这。下一篇见。

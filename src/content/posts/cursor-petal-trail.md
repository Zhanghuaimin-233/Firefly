---
title: 光标尾迹：把 Wallpaper Engine 的花瓣搬到博客上
published: 2026-08-11
description: 把 Wallpaper Engine 里 Cherry Blossoms 2 的动态花瓣效果搬进 Astro 博客：从读 JSON 物理参数、对齐坐标系与力公式，到五瓣花形相位、运行时染色和加色发光，以及接进 Firefly 的配置过程。
image: ""
tags: [博客, 特效, Canvas, Firefly]
category: 博客折腾
draft: false
slug: cursor-petal-trail
---

## 一张壁纸引起的折腾

起点是 Steam 创意工坊里一张叫 Cherry Blossoms 2 的动态壁纸。鼠标动起来的时候，会有粉色花瓣在指针周围打着旋飘下来。好看。

然后就动了念头——能不能把这套效果搬到博客上？

Wallpaper Engine 的粒子效果跑在它自己的引擎里，配置是一份 JSON。博客这边是 Astro 静态站，运行时只有浏览器那点 Canvas 2D 能用。两套体系，物理公式能不能对得上，一开始心里没底。

## 先看原版在做什么

打开壁纸目录翻到 `Cherry_Blossoms_2.json`，Wallpaper Engine 的粒子配置很像一份物理参数表——发射率、生命周期、初速度、重力、阻力、排斥、吸引、涡旋，每一项都写得明明白白。

看完一遍大概有底：这些力浏览器都能算，无非是把每帧的 dt 乘到加速度上累加到速度，再把速度乘到 dt 累加到位置。Canvas 2D 画粒子也不难，`drawImage` 加 `globalCompositeOperation` 就能搞定。

唯一犯嘀咕的是几个看起来不太常规的字段：

- `mapsequencearoundcontrolpoint count: 5`——这个"5"是什么意思？
- `colorrandom`——颜色是运行时染上去的，还是纹理自带的？
- 花瓣纹理到底有几张？

当时没深究，先按"物理照搬"的思路撸了一版。

## 第一版：物理搬过来，效果不对

照着 JSON 把参数逐项映射到 TypeScript：

```typescript
gravity: { x: 0, y: -50 },
emitRate: 100,
particleLife: { min: 1, max: 2.25 },
repel: { scale: -600, threshold: 25 },
attract: { scale: 500, threshold: 5000 },
vortex: { distanceOuter: 25, speed: 300 },
```

每帧的逻辑也很常规：算离鼠标的距离，近距离加排斥力，远距离加吸引力，再加一个切向的涡旋力，最后加重力和阻力。

跑起来一看——花瓣是有了，但完全是另一种东西。原版是绕着鼠标打旋的小花瓣云，我这边是一团向上飞出去的粉色烟雾。

第一个翻车的是重力方向。Wallpaper Engine 的坐标系 y 轴向下为正，我习惯性写成了 `y: -50` 让粒子向上飘，结果原版"花瓣向下飘落"的语义被我搞反了。改成 `y: 50`，方向终于对了。

第二个是发射率。一开始按"每帧累加粒子数"实现，60fps 下每秒其实塞了 180 个粒子，是原版的三倍。改成 `emitRate * dt` 按秒计算，才算和原版对齐。

第三个坑更隐蔽——力公式。原版 `repel` 用的是 `scale / dist` 形式，粒子离鼠标越近力越大。听起来合理，但粒子贴到鼠标上时 `dist` 趋近 0，力会炸到无穷大，粒子被瞬间弹飞。改成线性衰减 `scale * (1 - dist / threshold)`，近距离力有上限，远距离平滑过渡到 0，这才稳下来。

```typescript
// 近距离排斥（线性衰减）
if (dist < cfg.repel.threshold) {
  const force = cfg.repel.scale * (1 - dist / cfg.repel.threshold);
  this.vx += (dx / dist) * force * dt;
  this.vy += (dy / dist) * force * dt;
}
```

到这里，粒子总算在鼠标周围稳定地打转了。但还差得远——原版那种五瓣花形的旋涡，我这边只有一个均匀的圆环。

## 花瓣纹理的坑

原版花瓣看起来就一张图，但用 RePKG 解包壁纸的 `.pkg` 文件后才发现，那个 `.tex` 文件是一张 2600×200 的 sprite sheet——13 帧 × 200×200，每帧是花瓣的不同姿态。

RePKG 默认只导出第一帧。也就是说之前用的那张花瓣图，其实是 13 帧里的第一帧。

完整还原多帧动画得在 Canvas 里按帧切图、按帧绘制，逻辑稍麻烦。但原版的 `animationmode` 是 `randomframe`——每帧随机挑一张，不是按顺序播放。这就给了个偷懒的空间：单帧 + `ctx.rotate(随机角度)` 视觉上几乎等效，花瓣的朝向本来就是乱的。

```javascript
this.rotation = Math.random() * Math.PI * 2;
// 渲染时
ctx.save();
ctx.translate(p.x, p.y);
ctx.rotate(p.rotation);
ctx.drawImage(petalTexture, -w / 2, -h / 2, w, h);
ctx.restore();
```

13 帧的 sprite sheet 最终换成了一张 78×138 的裁剪图，把周围透明边距削掉了，资源体积也小了一截。

## 真正的难点：五瓣花形

物理参数对齐、纹理搞定、粒子能稳定打转之后，效果还是差一截。原版那种花瓣绕着鼠标形成五个"瓣"的旋涡感，我这边只有一个均匀的圆环。

回去翻 JSON，那个一开始没细想的 `mapsequencearoundcontrolpoint count: 5` 才是关键。

它的语义是：把粒子分成 5 组，每组按 `2π/5 = 72°` 的相位差围绕控制点（鼠标）发射。5 组粒子同时做摆线运动，叠加起来视觉上就形成了五瓣花形，而不是一个简单的圆环。

理清这个之后实现就直白了：

```javascript
constructor(x, y, config, tintedCache, sequenceIndex) {
  // sequenceIndex % sequenceCount 决定 72° 相位偏移
  const phase = (sequenceIndex % seqCount) * (Math.PI * 2 / seqCount);
  this.x  = x + Math.cos(phase) * orbitR;      // 初始位置偏移
  this.vx = -Math.sin(phase) * tangentSpeed;   // 切向初速度
}
```

Manager 维护一个 `_sequenceCounter`，每生成一个新粒子就自增并对 5 取模。5 组粒子以 72° 相位差同时做涡旋 + 重力 + 排斥吸引的合运动，叠加出来的轨迹就是五瓣花形。

到这里终于像原版了。

## 颜色和发光

原版的 `colorrandom` 是运行时染色——纹理只是一张白色形状底图，粒子生成时用随机颜色和纹理做 multiply 混合。颜色范围从 `[255, 173, 169]` 到 `[249, 222, 255]`，粉到浅紫的渐变。

每帧 per-particle 做混合太贵。预渲染了 8 档颜色缓存（把颜色范围量化成 8 步），粒子生成时随机分到一档，渲染时直接 `drawImage` 对应的预染纹理。视觉上看不出和连续染色的差别。

```javascript
// 预渲染 8 档颜色缓存
const tintedCache = [];
for (let i = 0; i < 8; i++) {
  const t = i / 7;
  const r = lerp(255, 249, t);
  const g = lerp(173, 222, t);
  const b = lerp(169, 255, t);
  tintedCache.push(renderTintedTexture(petalTexture, r, g, b));
}
```

发光用的是 Canvas 的 `globalCompositeOperation = "lighter"`，加色混合。花瓣叠在一起时会过曝发亮，有点像原版的过亮辉光。代价是单粒子 alpha 要调低，不然一团粒子糊在一起就全白了。

让一小部分粒子（大概 15%）用较高的 alpha（0.5–0.7），其余的用 0.15–0.35，制造一点闪烁层次。全部统一 alpha 看起来太均质，像贴纸不像粒子。

## 接到博客里

博客是 Astro + Svelte 架构，所有特效都是配置驱动的。新建 `CursorTrail.astro` 组件挂到 `Layout.astro` 里，参数全塞进 `effectsConfig.ts`：

```typescript
export const cursorTrailConfig: CursorTrailConfig = {
  enable: false,
  switchable: true,
  imageSrc: "/assets/images/effects/cursor-petal-trimmed.png",
  maxParticles: 1000,
  emitRate: 100,
  sequenceCount: 5,
  orbitRadius: 4,
  tangentSpeed: 50,
  // ... 物理参数省略
};
```

开关状态存 `localStorage`，设置面板里加一个开关。这里有个细节——Swup 接管页面切换时会替换整个 `<head>`，但 Canvas 元素挂在 `<body>` 上，所以不用像自定义光标那样处理样式丢失问题。不过粒子 Manager 的初始化要避免重复，加了个 `window.__cursorTrailInitialized` 标记。

最后给设置项配了个 `mdi:cursor-default-click-outline` 图标，文案改成"光标尾迹"。改完图标发现没生效——这个项目的图标系统是 `@iconify/svelte` 离线模式，新增图标必须手动跑一次 `pnpm icons` 重新生成图标数据。这条之前踩过，结果又踩了一次。

## 折腾完了

最终效果不是 1:1 复刻——原版那个 13 帧的 sprite sheet 没完整用上，环境落花层也禁用了，只保留了鼠标跟随这一层。但视觉上够了：鼠标动起来五瓣花形旋涡跟着转，粉色花瓣边飘边淡出，比原版多了点 Canvas 加色混合的发光感。

整个过程有两个感觉。

一是 Wallpaper Engine 的粒子系统配置其实挺透明的，JSON 摊开来看每一项物理参数都有明确语义，不像某些引擎黑盒一堆。真正难的不是参数翻译，是 `mapsequencearoundcontrolpoint` 这种语义不直观的字段——不读源码根本不知道它在分组。

二是 Canvas 2D 的性能上限比想象中高。1000 个粒子 + 物理更新 + 加色混合，在普通笔记本上能稳定跑 60fps。预渲染颜色缓存这个优化挺关键，每帧省下来的混合计算可能比粒子数本身影响还大。

代码已经提交进 Firefly 仓库了，配置在 `src/config/effectsConfig.ts`，组件在 `src/components/features/CursorTrail.astro`。想自己改参数试试的，把 `enable` 打开就能看到效果。

折腾告一段落。下一篇见。

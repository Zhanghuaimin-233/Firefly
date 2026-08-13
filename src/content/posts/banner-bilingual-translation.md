---
title: 给横幅加一行中文翻译
published: 2026-08-13
description: 给 Firefly 博客的英文横幅加中文翻译：从扩 schema、改打字机让翻译跟着英文同步切换，到移动端字号倒置翻车补响应式断点的折腾记录。
image: ""
tags: [博客, Firefly, 前端, Astro]
category: 博客折腾
draft: false
slug: banner-bilingual-translation
---

博客横幅挂了一串英文挺久了。主标题 "With You, My Lord."，下面副标题六句英文数组，配打字机循环打字。功能上没毛病，但中文读者扫一眼过去，多少隔了一层。

想在这底下垫一行小字中文翻译。本来以为就是多写几个字符串的事，结果牵扯出一连串——打字机怎么同步、移动端字号倒置、断点要逐档补。这一篇记录一下。

## 先摸清现状

横幅文字配置在 `src/config/backgroundWallpaper.ts` 的 `homeText` 块：

```ts
homeText: {
  enable: true,
  title: "With You, My Lord.",
  subtitle: [
    "Through Whispering Winds, I Follow",
    "Beneath Verdant Leaves, I Await",
    // ...共 6 条
  ],
  typewriter: { enable: true, speed: 100, deleteSpeed: 50, pauseTime: 2000 },
}
```

副标题是数组，打字机开着就循环：打一句 → 暂停 → 删完 → 下一句。渲染走 `TypewriterText.astro`，主标题和副标题两层结构。

要加翻译，得先想清楚三件事：加在哪一层、数组怎么对应、打字机循环时翻译跟不跟着动。这三点直接决定了实现复杂度——主标题单条好办，副标题数组要么固定一条、要么六条一一对应同步切换，打字机模式下还要处理"英文打完翻译才出现、英文开始删翻译先消失"的时序。

## schema 先扩好

类型定义在 `src/types/backgroundWallpaper.ts`。照着原有字段加三个可选项：

```ts
titleTranslation?: string;               // 主标题翻译，单条
subtitleTranslation?: string | string[]; // 副标题翻译，和 subtitle 一一对应
translationSize?: string;                // 翻译字号，默认 1rem
```

三个都可选，不配就什么都不渲染，老配置完全不受影响。`subtitleTranslation` 设计成和 `subtitle` 同结构——配数组就要求长度对齐，打字机切到第几句就显示第几句的翻译。

## 打字机怎么跟着切换

整个折腾最绕的一环。

打字机组件 `TypewriterText.astro` 原本只管一段文本：逐字打出、暂停、逐字删除、切下一条。现在要让翻译跟着英文节奏走——英文打完了，翻译淡入；英文开始删了，翻译先藏掉。

思路是给组件加一个 `syncText` prop，渲染一个同步用的 `<span class="typewriter-sync">` 紧跟在主文本后面。组件内部的 `TypewriterEffect` 类多管一个同步元素：

```ts
private showSync() {
  if (this.syncElement && this.syncTexts.length > 0) {
    this.syncElement.textContent = this.syncTexts[this.currentTextIndex] || "";
  }
}
private clearSync() {
  if (this.syncElement) this.syncElement.textContent = "";
}
```

关键是调用时机。原版的 `type()` 方法在打字完成时直接进暂停、然后开始删除。改完之后，完成那一刻先 `showSync()` 显示翻译，再进暂停；暂停结束要开始删除前，先 `clearSync()` 把翻译藏掉，再进删除流程：

```ts
} else {
  // 打字完成，显示同步翻译
  this.showSync();
  if (this.texts.length > 1) {
    this.isDeleting = true;
    this.timeoutId = window.setTimeout(() => {
      this.clearSync();   // 删除前先藏翻译
      this.type();
    }, this.pauseTime);
  }
}
```

顺序不能反。如果翻译在删除过程中还挂着，英文已经少了一半、翻译还完整显示着，画面就很怪——像是翻译在替英文收尾。

非打字机模式（`typewriter.enable: false`）简单些，副标题每次刷新随机挑一条。这时候翻译用同一个随机索引去取，保证英文和翻译对得上：

```ts
const getRandomSubtitle = () => {
  const subtitle = homeText?.subtitle;
  const translation = homeText?.subtitleTranslation;
  if (Array.isArray(subtitle)) {
    const i = Math.floor(Math.random() * subtitle.length);
    const sub = subtitle[i];
    const trans = Array.isArray(translation)
      ? (translation[i] || translation[0] || "")
      : (translation || "");
    return { subtitle: sub, translation: trans };
  }
  // ...
};
```

## 主标题翻译直接渲染

主标题没打字机，就一行字。翻译直接在下面渲染一个 div，字号走 `translationSize`：

```astro
{backgroundWallpaper.common?.homeText?.titleTranslation && (
  <div class="banner-title-translation text-white/70"
       style={{ fontSize: homeText.translationSize || "1rem" }}>
    {homeText.titleTranslation}
  </div>
)}
```

副标题这边分两条路：打字机模式把 `syncText` 传给 `TypewriterText`；非打字机模式渲染一个 `.banner-subtitle-translation` span，内容共用 `getRandomSubtitle` 的结果。还有一段老代码 `setRandomSubtitle` 内联脚本负责 Swup 切页后重新挑一条——这部分本来就有，只是要让它同步更新翻译 span 的内容。

## 加粗一下

翻译默认字重 400，在壁纸上有点飘。主标题是 `font-bold`（700），翻译不能也用 700 那么重，但 400 太轻了。在 `src/styles/banner-title.css` 给主标题翻译加了一句：

```css
.banner-title-translation {
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
  font-weight: 700;
}
```

副标题翻译没加粗——副标题本身就没加粗，翻译跟着副标题风格走，保持层级一致。`text-shadow` 是必须的，不然浅色壁纸上一片白糊。

## 移动端翻车了

桌面端跑起来挺正常，主标题英文 + 翻译、副标题打字机 + 同步翻译，节奏也对。切到手机竖屏一看——翻译比英文还大。

原因是主标题和副标题在 `layout-styles.css` 里有四个移动端断点逐档缩放：

| 断点 | 主标题 | 副标题 |
|---|---|---|
| ≤480px | `min(4.5rem, 10vw)` ≈ 16px | 1rem |
| 481-640px | `min(4.5rem, 10vw)` | 1.125rem |
| 641-767px | `min(4.5rem, 8vw)` | 1.25rem |
| 768-1023px | `min(4.5rem, 7vw)` | 1.5rem |

但翻译的字号来自内联 `translationSize`（配的 `1.125rem`），固定值，不走断点。结果在 ≤480px 这种小屏上，副标题缩到了 1rem，翻译还是 1.125rem——翻译比英文大了一圈，层级完全反了。

修复就是老老实实去四个断点里补翻译的字号，用 `!important` 盖掉内联：

```css
@media (max-width: 480px) {
  .banner-title-translation { font-size: 0.85rem !important; }
  .banner-subtitle-translation, .typewriter-sync { font-size: 0.8rem !important; }
}
@media (min-width: 481px) and (max-width: 640px) {
  .banner-title-translation { font-size: 0.95rem !important; }
  .banner-subtitle-translation, .typewriter-sync { font-size: 0.9rem !important; }
}
/* ...另外两档同理 */
```

注意 `.typewriter-sync` 也要一起覆盖——打字机模式的翻译走的是这个 span，不跟 `.banner-subtitle-translation` 走。漏掉它的话，打字机模式在小屏上还是会翻车。

四档字号顺着副标题的缩放梯度调，翻译始终比同级行小一档：

| 断点 | 主标题翻译 | 副标题翻译 | 副标题（参考） |
|---|---|---|---|
| ≤480px | 0.85rem | 0.8rem | 1rem |
| 481-640px | 0.95rem | 0.9rem | 1.125rem |
| 641-767px | 1rem | 0.95rem | 1.25rem |
| 768-1023px | 1.05rem | 1.05rem | 1.5rem |
| ≥1024px | 1.125rem（内联） | 1.125rem（内联） | 1.5rem |

## 收尾

改动最后落在五个文件：schema 类型定义、TypewriterText 组件、MainGridLayout 渲染、banner-title.css 加粗、layout-styles.css 响应式断点。配置文件里填了中文翻译示例，后来又自己润色了一版措辞，把打字机 `pauseTime` 从 2000 调到 5000——英文打完留着翻译多看几秒。

整个过程最花心思的不是写代码，是打字机同步时序那段——完成显示、删除前隐藏，顺序反了画面就乱；以及移动端字号倒置这个坑，桌面端完全看不出来，必须真去竖屏看一眼才发现。配置驱动的项目加字段容易，难的是让新字段在所有已有的响应式、动画、切页逻辑里都行为正确。

代码已经提交进 Firefly 仓库。想加翻译的话，在 `homeText` 里填 `titleTranslation` 和 `subtitleTranslation` 就行，不填完全不影响原有行为。

折腾告一段落。下一篇见。

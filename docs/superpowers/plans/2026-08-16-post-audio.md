# 文章绑定音频（Post Audio）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 文章 frontmatter 可绑定一段音频，打开文章自动加载并展示播放 UI，读者手动播放；与全局背景音乐互斥。

**Architecture:** 三阶段——基础分支实现共享底层（schema + 规范化工具 + 测试文章），再切两个特性分支分别实现"形态 A：文章内嵌播放条（独立 audio 元素）"与"形态 B：复用全局 MusicManager（临时曲目注入）"，用户体验后择一合并。

**Tech Stack:** Astro 7（`<script is:inline>` 模式，与 MusicManager/MusicPlayer 一致）、Zod schema、Swup 页面切换、pnpm。

**设计文档:** `docs/superpowers/specs/2026-08-16-post-audio-design.md`

**测试框架说明:** 本仓库无单元测试框架（AGENTS.md 明确）。验证方式为 `pnpm astro sync` / `pnpm check` / `pnpm type-check` / `pnpm build` + `pnpm dev` 手动检查清单。每个 Task 的"验证"步骤即代替 TDD 的红绿循环。

**关键背景（执行者必读）:**

- `MusicManager.astro`（`src/components/features/MusicManager.astro`）是全局单例，`<audio>` 挂在 `document.body`（Swup 容器外，切页持续存在），暴露 `window.__fireflyMusic` API 与 `fm:*` 事件。其内部曲目对象字段为 `{ name, artist, url, pic, lrc, instrumental }`（注意是 `pic` 不是 `cover`）。
- `MusicManager` 在 `src/layouts/Layout.astro:611` 无条件挂载（没有 enable 开关）；UI 显隐由 `musicPlayerConfig.showInSidebar` / `showInNavbar` 控制。
- 文章页 `src/pages/posts/[...slug].astro` 位于 `#swup-container` 内，Swup 切页时整个替换。容器内联脚本随替换重新执行。
- 加密文章：正文（含 slot 内组件的 HTML 与内联脚本）被服务端加密，解密后 `innerHTML` 注入并**重建 script 节点**（`src/components/features/EncryptedContent.astro:99-108`），所以放在加密 slot 内的组件脚本会在解密后正确执行。
- Swup 切页清理模式：参考 `MusicPlayer.astro:823-841` 的 MutationObserver 自清理模式。
- 包管理器 pnpm；PowerShell 环境，命令分隔用 `;`。
- 本地测试音频已存在：`public/assets/music/内海孝彰 - 心想い ～ココロオモイ～ -絆、つないで。こころ、結んで。離別と決意-.opus`，同名封面在 `public/assets/music/cover/….avif`。
- 当前工作分支：`trae/firefly-personal`。

---

## Phase 0：共享底层（分支 `trae/firefly-personal`）

### Task 1: Schema 与类型扩展

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1: 在 `src/content.config.ts` 顶部 PostData 类型前新增音频输入类型，并给 `PostData` 增加 `audio` 字段**

在 `type PostData = {` 之前插入：

```ts
type PostAudioInput = {
	url: string;
	name?: string;
	artist?: string;
	cover?: string;
	lrc?: string;
	instrumental?: boolean;
};
```

在 `type PostData = { ... }` 内、`passwordHint: string;` 之后加一行：

```ts
	audio?: string | PostAudioInput;
```

- [ ] **Step 2: 在 postsCollection schema 中新增 audio 字段**

在 `src/content.config.ts` 的 posts schema 中 `passwordHint: z.string().optional().default(""),` 之后插入：

```ts
		audio: z
			.union([
				z.string(),
				z.object({
					url: z.string(),
					name: z.string().optional(),
					artist: z.string().optional(),
					cover: z.string().optional(),
					lrc: z.string().optional(),
					instrumental: z.boolean().optional(),
				}),
			])
			.optional(),
```

- [ ] **Step 3: 验证 schema 编译**

Run: `pnpm astro sync`
Expected: 无报错，生成 `.astro/content.d.ts`（含新 audio 字段）。

### Task 2: 规范化工具 `post-audio.ts`

**Files:**
- Create: `src/utils/post-audio.ts`

- [ ] **Step 1: 创建工具文件，完整内容如下**

```ts
import { url } from "./url-utils";

// 文章 frontmatter 音频输入（与 content.config.ts 的 PostAudioInput 保持一致）
export type PostAudioInput = {
	url: string;
	name?: string;
	artist?: string;
	cover?: string;
	lrc?: string;
	instrumental?: boolean;
};

// 规范化后的文章音频曲目（url/cover 已解析为可请求地址）
export type PostAudioTrack = {
	name: string;
	artist: string;
	url: string;
	cover?: string;
	lrc?: string;
	instrumental?: boolean;
};

const isFullUrl = (path: string) => /^https?:\/\//.test(path);

const resolveUrl = (path: string) => (isFullUrl(path) ? path : url(path));

// lrc 可能是 URL/本地路径，也可能是内联 LRC 文本；仅对前两者做地址解析
const resolveLrc = (lrc: string) => {
	if (isFullUrl(lrc)) return lrc;
	if (lrc.startsWith("/") || /\.(lrc|txt)(\?|#|$)/i.test(lrc)) return url(lrc);
	return lrc;
};

const fileNameOf = (trackUrl: string) => {
	const clean = trackUrl.split(/[?#]/)[0];
	const last = clean.substring(clean.lastIndexOf("/") + 1);
	let decoded = last;
	try {
		decoded = decodeURIComponent(last);
	} catch {
		// 含非法百分号序列时保留原字符串
	}
	return decoded.replace(/\.[^./]+$/, "") || "未知曲目";
};

// 双模式归一：字符串 → name 取文件名；对象 → 缺省 name 取文件名
export function normalizePostAudio(
	raw: string | PostAudioInput | undefined | null,
): PostAudioTrack | null {
	if (!raw) return null;
	if (typeof raw === "string") {
		const trimmed = raw.trim();
		if (!trimmed) return null;
		const resolved = resolveUrl(trimmed);
		return { name: fileNameOf(resolved), artist: "", url: resolved };
	}
	const trimmedUrl = raw.url?.trim();
	if (!trimmedUrl) return null;
	const resolved = resolveUrl(trimmedUrl);
	return {
		name: raw.name?.trim() || fileNameOf(resolved),
		artist: raw.artist?.trim() || "",
		url: resolved,
		cover: raw.cover?.trim() ? resolveUrl(raw.cover.trim()) : undefined,
		lrc: raw.lrc?.trim() ? resolveLrc(raw.lrc.trim()) : undefined,
		instrumental: raw.instrumental === true,
	};
}
```

- [ ] **Step 2: 验证类型检查**

Run: `pnpm type-check`
Expected: 无错误。

### Task 3: 测试文章

**Files:**
- Create: `src/content/posts/post-audio-test-object.md`
- Create: `src/content/posts/post-audio-test-string.md`

- [ ] **Step 1: 创建对象模式测试文章**

`src/content/posts/post-audio-test-object.md`：

```markdown
---
title: 文章音频测试（对象模式）
published: 2026-08-16
category: 测试
tags:
  - 测试
audio:
  url: /assets/music/内海孝彰 - 心想い ～ココロオモイ～ -絆、つないで。こころ、結んで。離別と決意-.opus
  name: 心想い ～ココロオモイ～
  artist: 内海孝彰
  cover: /assets/music/cover/内海孝彰 - 心想い ～ココロオモイ～ -絆、つないで。こころ、結んで。離別と決意-.avif
  instrumental: true
---

对象模式测试文。打开本文应看到音频播放界面（形态分支实现后）。
```

- [ ] **Step 2: 创建字符串模式测试文章**

`src/content/posts/post-audio-test-string.md`：

```markdown
---
title: 文章音频测试（字符串模式）
published: 2026-08-16
category: 测试
tags:
  - 测试
audio: /assets/music/内海孝彰 - 心想い ～ココロオモイ～ -絆、つないで。こころ、結んで。離別と決意-.opus
---

字符串模式测试文。歌名应自动取文件名"内海孝彰 - 心想い ～ココロオモイ～ -絆、つないで。こころ、結んで。離別と決意-"。
```

注意：两篇测试文章不带 `draft: true`（draft 会被 getSortedPosts 过滤，dev 下也无法访问）。择分支合并后由用户决定删除或保留。

- [ ] **Step 3: 验证内容集合构建**

Run: `pnpm astro sync; pnpm check`
Expected: 无错误，两篇文章通过 schema 校验。

### Task 4: 基础分支整体验证与提交

- [ ] **Step 1: 全量验证**

Run: `pnpm astro sync; pnpm type-check; pnpm build`
Expected: 三个命令全部成功。若 type-check 报 `dynamic` collection 相关错误，先 `pnpm astro sync` 再重试（已知事项）。

- [ ] **Step 2: 提交**

```powershell
git add src/content.config.ts src/utils/post-audio.ts src/content/posts/post-audio-test-object.md src/content/posts/post-audio-test-string.md
git commit -m "feat: 文章 frontmatter 新增 audio 字段与规范化工具（共享底层）"
```

---

## Phase A：形态 A——文章内嵌播放条（分支 `feature/post-audio-embedded`）

### Task 5: 切分支并实现 PostAudioBar 组件

**Files:**
- Create: `src/components/features/PostAudioBar.astro`

- [ ] **Step 1: 从基础分支切出特性分支**

```powershell
git checkout -b feature/post-audio-embedded
```

- [ ] **Step 2: 创建组件，完整内容如下**

`src/components/features/PostAudioBar.astro`：

```astro
---
import Icon from "@/components/common/Icon.svelte";
import I18nKey from "@/i18n/i18nKey";
import { i18n } from "@/i18n/translation";
import type { PostAudioTrack } from "@/utils/post-audio";

interface Props {
	track: PostAudioTrack;
}

const { track } = Astro.props;

const barId = `post-audio-bar-${Math.random().toString(36).slice(2, 9)}`;

const labels = {
	play: i18n(I18nKey.musicPlay),
	pause: i18n(I18nKey.musicPause),
};

const trackJson = JSON.stringify({
	name: track.name,
	artist: track.artist,
	url: track.url,
	cover: track.cover || "",
});
---

<div id={barId} class="post-audio-bar mb-6 rounded-xl bg-black/5 dark:bg-white/10 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 onload-animation">
	<div class="h-12 w-12 sm:h-14 sm:w-14 rounded-lg overflow-hidden shrink-0 bg-black/10 dark:bg-white/10 flex items-center justify-center text-black/40 dark:text-white/40">
		{track.cover ? (
			<img src={track.cover} alt={track.name} class="h-full w-full object-cover" loading="lazy" />
		) : (
			<Icon is:inline name="material-symbols:music-note-rounded" class="text-2xl" />
		)}
	</div>
	<div class="flex-1 min-w-0">
		<div class="text-sm font-medium truncate text-black/80 dark:text-white/80">{track.name}</div>
		{track.artist && (
			<div class="text-xs truncate text-black/45 dark:text-white/45">{track.artist}</div>
		)}
		<div class="mt-1.5 flex items-center gap-2">
			<span class="post-audio-current text-[11px] tabular-nums text-black/45 dark:text-white/45">0:00</span>
			<div class="post-audio-progress-wrapper relative flex-1 h-1.5 rounded-full bg-black/10 dark:bg-white/15 cursor-pointer">
				<div class="post-audio-progress absolute inset-y-0 left-0 rounded-full bg-(--primary)" style="width: 0%"></div>
			</div>
			<span class="post-audio-duration text-[11px] tabular-nums text-black/45 dark:text-white/45">0:00</span>
		</div>
	</div>
	<button
		type="button"
		class="post-audio-toggle h-10 w-10 rounded-full bg-(--primary) text-white dark:text-black/70 flex items-center justify-center shrink-0 transition hover:scale-105 active:scale-95"
		aria-label={labels.play}
		title={labels.play}
	>
		<span class="post-audio-icon-play"><Icon is:inline name="material-symbols:play-arrow-rounded" class="text-xl" /></span>
		<span class="post-audio-icon-pause hidden"><Icon is:inline name="material-symbols:pause-rounded" class="text-xl" /></span>
	</button>
	<div class="post-audio-error hidden text-xs text-red-400 shrink-0"></div>
	<audio class="post-audio-element hidden" preload="metadata" src={track.url}></audio>
</div>

<script is:inline define:vars={{ barId, trackJson, labels }}>
(function () {
    var root = document.getElementById(barId);
    if (!root) return;

    var track = JSON.parse(trackJson);
    var audio = root.querySelector('.post-audio-element');
    var toggleBtn = root.querySelector('.post-audio-toggle');
    var iconPlay = root.querySelector('.post-audio-icon-play');
    var iconPause = root.querySelector('.post-audio-icon-pause');
    var progressEl = root.querySelector('.post-audio-progress');
    var progressWrapper = root.querySelector('.post-audio-progress-wrapper');
    var currentEl = root.querySelector('.post-audio-current');
    var durationEl = root.querySelector('.post-audio-duration');
    var errorEl = root.querySelector('.post-audio-error');

    var wasGlobalPlaying = false;
    var destroyed = false;

    function mgr() { return window.__fireflyMusic; }

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        var min = Math.floor(seconds / 60);
        var sec = Math.floor(seconds % 60);
        return min + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function setPlayingUI(playing) {
        iconPlay.classList.toggle('hidden', playing);
        iconPause.classList.toggle('hidden', !playing);
        toggleBtn.setAttribute('aria-label', playing ? labels.pause : labels.play);
        toggleBtn.setAttribute('title', playing ? labels.pause : labels.play);
    }

    // 播放前互斥：暂停全局背景音乐并记录状态
    function pauseGlobalIfPlaying() {
        var m = mgr();
        if (m && m.getState().isPlaying) {
            wasGlobalPlaying = true;
            m.togglePlay();
        }
    }

    // 离页/销毁时：恢复全局背景音乐
    function resumeGlobalIfNeeded() {
        if (!wasGlobalPlaying) return;
        wasGlobalPlaying = false;
        var m = mgr();
        if (m && !m.getState().isPlaying) m.togglePlay();
    }

    function play() {
        pauseGlobalIfPlaying();
        audio.play().then(function () {
            setPlayingUI(true);
        }).catch(function (e) {
            if (e.name === 'AbortError') return;
            showError();
        });
    }

    function pause() {
        audio.pause();
        setPlayingUI(false);
    }

    function showError() {
        errorEl.textContent = '音频加载失败';
        errorEl.classList.remove('hidden');
        setPlayingUI(false);
    }

    toggleBtn.addEventListener('click', function () {
        if (audio.paused) play();
        else pause();
    });

    audio.addEventListener('timeupdate', function () {
        if (!audio.duration || isNaN(audio.duration)) return;
        currentEl.textContent = formatTime(audio.currentTime);
        durationEl.textContent = formatTime(audio.duration);
        progressEl.style.width = (audio.currentTime / audio.duration) * 100 + '%';
    });

    audio.addEventListener('loadedmetadata', function () {
        durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('ended', function () {
        setPlayingUI(false);
        progressEl.style.width = '0%';
        currentEl.textContent = '0:00';
        resumeGlobalIfNeeded();
    });

    audio.addEventListener('error', function () {
        if (audio.src) showError();
    });

    progressWrapper.addEventListener('click', function (e) {
        if (!audio.duration || isNaN(audio.duration)) return;
        var rect = progressWrapper.getBoundingClientRect();
        var percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audio.currentTime = percent * audio.duration;
    });

    // 读者手动操作全局播放器时：文章音频让路，且不记恢复标记
    function onGlobalPlayState(e) {
        if (e.detail && e.detail.isPlaying) {
            wasGlobalPlaying = false;
            if (!audio.paused) pause();
        }
    }
    window.addEventListener('fm:play-state', onGlobalPlayState);

    // Swup 切页清理：参考 MusicPlayer.astro 的 MutationObserver 模式
    var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var removed = mutations[i].removedNodes;
            for (var j = 0; j < removed.length; j++) {
                if (removed[j] === root || (removed[j].contains && removed[j].contains(root))) {
                    destroyed = true;
                    pause();
                    resumeGlobalIfNeeded();
                    window.removeEventListener('fm:play-state', onGlobalPlayState);
                    observer.disconnect();
                    return;
                }
            }
        }
    });
    if (root.parentNode) {
        observer.observe(root.parentNode, { childList: true });
    }
})();
</script>
```

说明：
- `preload="metadata"`——打开文章只加载元数据（时长等），不预下载整文件；点击播放即时起播。
- 互斥、让路、恢复逻辑全部在组件内，未侵入 MusicManager。
- `musicPlayerConfig` 无 enable 开关、MusicManager 无条件挂载，`mgr()` 判空仅作防御（理论上恒存在）。

- [ ] **Step 3: 验证组件编译**

Run: `pnpm check`
Expected: 无错误。若 Icon 组件名 `material-symbols:music-note-rounded` / `play-arrow-rounded` / `pause-rounded` 不在 `src/constants/icons-data.json` 中，从 `node_modules/@iconify-json/material-symbols/icons.json` 提取对应 SVG body 追加（仓库既定手工流程），否则图标不显示。

### Task 6: 集成到文章页

**Files:**
- Modify: `src/pages/posts/[...slug].astro`

- [ ] **Step 1: 在 frontmatter 导入并规范化**

在 `[...slug].astro` 的 frontmatter import 区加入：

```ts
import PostAudioBar from "@/components/features/PostAudioBar.astro";
import { normalizePostAudio } from "@/utils/post-audio";
```

在 `const relatedPosts = await getRelatedPosts(entry, 5);` 之前加入：

```ts
const postAudio = normalizePostAudio(entry.data.audio);
```

- [ ] **Step 2: 普通文章插入（非加密分支）**

在非加密分支 `) : (\n        <>` 之后、`<Markdown class="mb-6 markdown-content onload-animation">` 之前插入：

```astro
          {postAudio && <PostAudioBar track={postAudio} />}
```

- [ ] **Step 3: 加密文章插入（加密 slot 内，解密后才出现）**

在加密分支 `<EncryptedPost password={entry.data.password} slug={entry.id} hint={entry.data.passwordHint}>` 之后、`<Markdown class="mb-6 markdown-content onload-animation">` 之前插入同样一行：

```astro
          {postAudio && <PostAudioBar track={postAudio} />}
```

（加密分支中该组件与正文一起被服务端加密；解密后 EncryptedContent 重建 script 节点，脚本正常执行。）

- [ ] **Step 4: 验证构建**

Run: `pnpm astro sync; pnpm type-check; pnpm build`
Expected: 全部成功，两篇测试文章页面生成。

### Task 7: 形态 A 手动验证与提交

- [ ] **Step 1: 启动 dev 服务器**

Run: `pnpm dev`（长驻命令，另开终端或用浏览器）
访问 `http://localhost:4321/posts/post-audio-test-object/`

- [ ] **Step 2: 手动检查清单（全项通过才算完成）**

1. 播放条出现在元数据与正文之间：封面、歌名"心想い ～ココロオモイ～"、歌手、进度条、播放按钮。
2. 点播放 → 出声、图标变暂停；进度条前进、时间走动。
3. 点暂停 → 停止。
4. 互斥：先在侧边栏播放全局音乐 → 点文章播放条播放 → 全局音乐暂停；点离开文章（回首页）→ 文章音频停止、全局音乐自动恢复。
5. 让路：文章音频播放中 → 手动点侧边栏全局播放器的播放/切歌 → 文章音频暂停。
6. 字符串模式文章 `/posts/post-audio-test-string/`：歌名自动显示为文件名，无封面时显示音符图标。
7. 播完一曲（或拖到结尾）→ 播放按钮复位；若之前全局音乐在播则恢复。
8. 无 `audio` 字段的普通文章：不渲染播放条。
9. 加密文章（任选一篇加 password 测试或跳过并在 Phase B 后补测）：锁屏无播放条，输入密码解密后出现且可播放。
10. 浏览器控制台无报错。

- [ ] **Step 3: 提交**

```powershell
git add src/components/features/PostAudioBar.astro "src/pages/posts/[...slug].astro"
git add src/constants/icons-data.json
git commit -m "feat: 文章内嵌音频播放条（形态 A）"
```

（icons-data.json 仅在确实追加了图标时才 add。）

---

## Phase B：形态 B——复用全局播放器（分支 `feature/post-audio-global`）

### Task 8: 切分支并扩展 MusicManager API

**Files:**
- Modify: `src/components/features/MusicManager.astro`

- [ ] **Step 1: 从基础分支切出特性分支**

```powershell
git checkout trae/firefly-personal
git checkout -b feature/post-audio-global
```

- [ ] **Step 2: 在 `// ── Public API ─────` 区块之前插入临时曲目机制**

插入位置：`audio.addEventListener('error', ...)` 区块之后、`// ── Init (idempotent) ─────` 之前（或 Public API 前），插入：

```js
    // ── Post temp track（文章临时曲目） ─────────────────────
    var tempSnapshot = null; // { playlist, index, wasPlaying, token }

    function loadTempTrack(track, token) {
        function inject() {
            if (!tempSnapshot) {
                tempSnapshot = {
                    playlist: state.playlist,
                    index: state.currentIndex,
                    wasPlaying: !audio.paused,
                    token: token
                };
            } else {
                // 文章→文章直达：保留最初快照，仅刷新令牌
                tempSnapshot.token = token;
            }
            if (!audio.paused) audio.pause();
            state.playlist = [track];
            loadTrack(0, false);
        }
        if (state.initialized) {
            inject();
        } else {
            init().then(inject);
        }
    }

    function restorePlaylist(token) {
        if (!tempSnapshot) return;
        if (token && tempSnapshot.token !== token) return; // 上一页的过期清理，忽略
        var snap = tempSnapshot;
        tempSnapshot = null;
        if (!audio.paused) audio.pause();
        state.playlist = snap.playlist;
        if (snap.playlist.length === 0) {
            emit('fm:track', { index: -1, track: null, autoPlay: false });
            return;
        }
        loadTrack(snap.index, false);
        if (snap.wasPlaying) {
            audio.play().then(function () {
                state.isPlaying = true;
                emit('fm:play-state', { isPlaying: true });
            }).catch(function (e) {
                if (e.name === 'AbortError') return;
                console.warn('Resume failed:', e);
            });
        }
    }
```

- [ ] **Step 3: 临时曲目模式下不自动循环/跳过（含错误自动跳过路径）**

将现有的：

```js
    function playNext(auto) {
        if (state.playMode === 1 && auto) {
```

改为：

```js
    function playNext(auto) {
        if (tempSnapshot && auto) {
            // 文章临时曲目：不自动循环、错误也不自动跳过（避免坏 URL 无限重试）
            return;
        }
        if (state.playMode === 1 && auto) {
```

注意：`playNext` 定义位于 `tempSnapshot` 声明之前，但 JS 函数体在调用时才求值，`var tempSnapshot` 提升到 IIFE 顶部，运行时可见，无 TDZ 问题。

再将现有的：

```js
    audio.addEventListener('ended', function () {
        playNext(true);
    });
```

改为：

```js
    audio.addEventListener('ended', function () {
        if (tempSnapshot) {
            // 文章临时曲目：播完即停，UI 复位
            state.isPlaying = false;
            emit('fm:play-state', { isPlaying: false });
            return;
        }
        playNext(true);
    });
```

- [ ] **Step 4: 在 Public API 对象上暴露新方法**

在 `window.__fireflyMusic = {` 对象内、`loadTrack: loadTrack` 之后追加两行：

```js
        loadTempTrack: loadTempTrack,
        restorePlaylist: restorePlaylist
```

- [ ] **Step 5: 验证编译**

Run: `pnpm check`
Expected: 无错误。

### Task 9: 文章页挂载脚本组件

**Files:**
- Create: `src/components/features/PostAudioMount.astro`
- Modify: `src/pages/posts/[...slug].astro`

- [ ] **Step 1: 创建挂载组件，完整内容如下**

`src/components/features/PostAudioMount.astro`：

```astro
---
import type { PostAudioTrack } from "@/utils/post-audio";

interface Props {
	track: PostAudioTrack;
}

const { track } = Astro.props;

const mountId = `post-audio-mount-${Math.random().toString(36).slice(2, 9)}`;

// MusicManager 内部曲目字段为 pic（封面），在此完成映射
const trackJson = JSON.stringify({
	name: track.name,
	artist: track.artist,
	url: track.url,
	pic: track.cover || undefined,
	lrc: track.lrc || undefined,
	instrumental: track.instrumental === true,
});
---

<div id={mountId} style="display:none"></div>

<script is:inline define:vars={{ mountId, trackJson }}>
(function () {
    var el = document.getElementById(mountId);
    if (!el) return;
    var mgr = window.__fireflyMusic;
    if (!mgr || !mgr.loadTempTrack) return;

    var token = mountId;
    mgr.loadTempTrack(JSON.parse(trackJson), token);

    // Swup 切页清理：离开文章页时恢复原歌单与播放状态
    var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var removed = mutations[i].removedNodes;
            for (var j = 0; j < removed.length; j++) {
                if (removed[j] === el || (removed[j].contains && removed[j].contains(el))) {
                    mgr.restorePlaylist(token);
                    observer.disconnect();
                    return;
                }
            }
        }
    });
    if (el.parentNode) {
        observer.observe(el.parentNode, { childList: true });
    }
})();
</script>
```

- [ ] **Step 2: 集成到文章页（与形态 A 同样的两个插入点）**

在 `[...slug].astro` frontmatter import 区加入：

```ts
import PostAudioMount from "@/components/features/PostAudioMount.astro";
import { normalizePostAudio } from "@/utils/post-audio";
```

在 `const relatedPosts = await getRelatedPosts(entry, 5);` 之前加入：

```ts
const postAudio = normalizePostAudio(entry.data.audio);
```

加密分支：`<EncryptedPost ...>` 之后、`<Markdown ...>` 之前插入：

```astro
          {postAudio && <PostAudioMount track={postAudio} />}
```

非加密分支 `) : (\n        <>` 之后、`<Markdown ...>` 之前插入同样一行：

```astro
          {postAudio && <PostAudioMount track={postAudio} />}
```

- [ ] **Step 3: 验证构建**

Run: `pnpm astro sync; pnpm type-check; pnpm build`
Expected: 全部成功。

### Task 10: 形态 B 手动验证与提交

- [ ] **Step 1: 启动 dev 服务器并检查**

Run: `pnpm dev`
访问 `http://localhost:4321/posts/post-audio-test-object/`

- [ ] **Step 2: 手动检查清单（全项通过才算完成）**

1. 打开文章：侧边栏/导航栏播放器显示该文章曲目（歌名/封面），处于暂停态（未自动播放）。
2. 点全局播放器播放键 → 文章音频出声。
3. 切回首页 → 恢复原歌单；若进入文章前全局音乐在播则自动续播。
4. 文章→文章（两篇测试文互切）：播放器曲目跟随切换，无残留错误状态。
5. 播完一曲 → 停止（不循环、不跳下一首）。
6. 字符串模式文章：曲目名自动取文件名。
7. 无 `audio` 字段文章：播放器行为与原版完全一致（不注入临时曲目、离开无影响）。
8. Meting 模式（若站点配置为 meting）：同样仅替换当前曲目，离开后恢复原歌单。
9. 浏览器控制台无报错。

- [ ] **Step 3: 提交**

```powershell
git add src/components/features/MusicManager.astro src/components/features/PostAudioMount.astro "src/pages/posts/[...slug].astro"
git commit -m "feat: 文章音频复用全局播放器临时曲目机制（形态 B）"
```

---

## 收尾（用户体验后）

两个分支各自就绪后，用户 `git checkout feature/post-audio-embedded` / `feature/post-audio-global` 用 `pnpm dev` 体验，择一合并回 `trae/firefly-personal`，删除另一分支。合并时确认是否保留两篇测试文章。

## 风险与已知取舍

- 形态 A：`preload="metadata"` 意味着点击播放时才开始拉流，网络 URL 首次起播可能有缓冲延迟。
- 形态 B：若 `showInSidebar` 与 `showInNavbar` 均为 false，读者没有任何可见控件操作临时曲目（形态 B 固有限制，已在设计文档声明）。
- 形态 B 修改了共享的 MusicManager（ended 行为加了 tempSnapshot 分支），回归风险点是原歌单"列表循环"行为——验证清单第 5/7 项覆盖。
- 加密文章的音频 URL 以密文形式包含在页面中，与正文同级别保护；frontmatter 的其他字段本就是明文（现状一致）。

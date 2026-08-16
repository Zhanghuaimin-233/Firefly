# 设计文档：文章绑定音频（Post Audio）

日期：2026-08-16
状态：已确认（用户于对话中批准）

## 1. 背景与目标

为博客文章提供"每篇可绑定一段音频"的能力。读者打开文章时，音频自动加载并呈现播放界面，由读者手动点击播放（不强制自动播放，规避浏览器自动播放拦截）。

现有基础：

- 全局音乐播放器由三层 Astro 组件构成：`MusicManager.astro`（全局单例，持有挂载在 Swup 容器外的 `<audio>` 元素，暴露 `window.__fireflyMusic` API 与 `fm:*` 事件总线）、`MusicPlayer.astro`（UI 控件）、`Music.astro`（侧边栏包装）。
- 曲目字段 `url/cover/lrc` 已支持完整网络 URL（`^https?://` 直接透传，否则视为 `public/` 相对路径经 `url()` 转换）。
- 文章 frontmatter schema（`src/content.config.ts`）当前无音频字段。
- 加密文章正文在用户输入密码前不存在于 DOM（服务端 AES-GCM 加密，解密后 `innerHTML` 注入并派发 `password:decrypted` 事件）。

## 2. 需求决策记录

| 决策点 | 结论 |
|---|---|
| 自动播放策略 | 不自动播放。打开文章仅自动加载音频并展示播放 UI，读者手动点击播放 |
| 播放 UI 形态 | 未定。新开两个分支分别实现"文章内嵌播放条"与"复用全局播放器"，用户体验后择一保留 |
| frontmatter 字段格式 | 双模式：简单字符串或结构化对象 |
| 离开文章页行为 | 离页即停；若此前全局背景音乐因文章音频暂停，则自动恢复 |
| 加密文章 | 音频 UI 在 `password:decrypted` 事件后才出现，锁屏界面不显示 |

## 3. 共享底层设计（在基础分支实现）

### 3.1 Schema 扩展

`src/content.config.ts` 的 posts schema 新增可选 `audio` 字段，双模式：

```yaml
# 模式一：简单字符串（歌名自动取文件名，去掉扩展名）
audio: https://music.example.com/song.mp3

# 模式二：结构化对象
audio:
  url: /assets/music/song.mp3      # 本地 public/ 相对路径或完整 http(s) URL
  name: 萤火虫之歌                   # 可选，缺省取文件名
  artist: 某歌手                    # 可选
  cover: /assets/music/cover/s.jpg  # 可选，相对路径或完整 URL
  lrc: https://.../song.lrc        # 可选，URL 或内联 LRC 文本
  instrumental: false               # 可选，纯音乐标记
```

类型定义同步到 `src/types`（保持 `src/types` 与 `src/config` 对齐的仓库惯例）。

### 3.2 规范化工具

新增工具函数（放 `src/utils`，如 `post-audio.ts`）：

- 输入：frontmatter 的 `audio` 原始值（string 或 object）。
- 输出：统一的曲目对象 `{ name, artist, url, cover?, lrc?, instrumental? }`，`url`/`cover` 按 `isFullUrl = /^https?:\/\//` 判断：完整 URL 原样保留，否则经 `url()` 转站点绝对路径。字符串模式 `name` 取 URL/路径最后段去扩展名。
- 供两种形态（A/B 分支）共用。

### 3.3 播放互斥逻辑

文章音频与全局背景音乐互斥：

- 播放文章音频时：若全局音乐正在播放 → 暂停全局音乐，并记住 `wasGlobalPlaying = true`。
- 离开文章页（Swup 切页销毁文章音频组件）：文章音频停止；若 `wasGlobalPlaying` → 恢复全局音乐播放。
- 读者手动操作全局播放器（播放/切歌）时：文章音频主动暂停让路，且不记恢复标记（读者意图明确）。

互斥通过 `window.__fireflyMusic` 现有 API（`getState/togglePlay` 等）与 `fm:play-state` 事件实现，不侵入 MusicManager 内部状态。

## 4. 形态 A：文章内嵌播放条（分支 `feature/post-audio-embedded`）

- 新组件 `PostAudioBar.astro`，插入位置：文章页（`src/pages/posts/[...slug].astro`）元数据区之后、正文之前。
- 视觉：`card-base` 风格横条——封面缩略图 + 歌名/歌手 + 播放/暂停按钮 + 进度条 + 时间显示。无封面时显示占位图标。
- 使用组件自有的独立 `<audio>` 元素，不占用全局播放器的 audio。
- Swup 切页时组件随 `#swup-container` 销毁：监听自身移除（参考 `MusicPlayer.astro` 的 MutationObserver 模式），销毁时停止播放并触发全局音乐恢复。
- V1 不做歌词显示（保持迷你；全局播放器已有完整歌词能力）。
- 即使 `musicPlayerConfig.enable = false` 也可用（互斥逻辑此时为空操作）。

## 5. 形态 B：复用全局播放器（分支 `feature/post-audio-global`）

- `MusicManager` 新增 API：
  - `loadTempTrack(track)`：将文章曲目作为临时曲目注入并加载（不自动播放），侧边栏/导航栏播放器 UI 同步显示该曲目；内部保存原 playlist、currentIndex、播放状态快照。
  - `restorePlaylist()`：离开文章页时调用，恢复原歌单与快照状态。
- 文章页内联脚本在页面就绪（Swup 首载或 `content:replace`）时调用 `loadTempTrack`；Swup 离页钩子调用 `restorePlaylist`。
- 互斥/恢复语义在形态 B 中由快照机制承载：`loadTempTrack` 在注入前保存原 playlist、索引与播放状态；`restorePlaylist` 按快照恢复（若进入文章前全局音乐正在播放则恢复播放，对应 3.3 的 `wasGlobalPlaying` 语义）。
- 依赖 `musicPlayerConfig.enable = true`；未启用时文章音频功能不可用（该形态的固有限制）。
- 优点：零新增 UI，复用完整歌词/播放列表能力。代价：读者未必注意到音乐已切换，临时曲目状态管理更复杂。

## 6. 分支与验证流程

1. 基础分支（当前工作分支）：实现共享底层（schema + 类型 + 规范化工具）+ 一篇带音频的测试文章。
   - 验证：`pnpm astro sync` → `pnpm check` → `pnpm type-check` → `pnpm build` 全部通过。
2. 从基础分支切出 `feature/post-audio-embedded`（形态 A）与 `feature/post-audio-global`（形态 B）分别实现。
   - 每分支验证：上述命令 + `pnpm dev` 手动验证（加载、播放、暂停、切页互斥、恢复）。
3. 用户体验两个分支（`pnpm dev`），选定后合并其一、删除另一分支。

## 7. 错误处理

- 音频 URL 加载失败（`error` 事件）：播放 UI 显示错误态（如"音频加载失败"），不静默。
- frontmatter `audio` 字段格式非法（如对象缺 `url`）：构建期 schema 校验报错，明确提示。
- 网络音频跨域：仅要求音频服务器允许直接 GET 播放（与现有全局播放器网络 URL 行为一致），不做代理。

## 8. 范围外（明确不做）

- 自动播放（含静音自动播放 hack）。
- 单篇文章多音频/播放列表。
- 文章内嵌播放条的歌词显示。
- 正文 Markdown 内嵌音频语法（仅 frontmatter 绑定）。

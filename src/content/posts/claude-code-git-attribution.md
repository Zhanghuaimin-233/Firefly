---
title: Claude Code Git Attribution 管理指南：关闭提交署名并清理历史记录
published: 2026-03-13
description: 关闭 Claude Code 的提交署名，并清理已经写入 Git 历史记录的署名信息。
image: ""
tags: [Claude Code, Git, 配置]
category: AI日常
draft: false
slug: claude-code-git-attribution
author: "Eric"
sourceLink: "https://www.jetems.com/posts/claude-code-git-attribution-guide/"
---

## 1. 背景

Claude Code 在执行 `git commit` 时，默认可能会在提交信息里追加 Claude 相关署名信息，例如：

```text
🤖 Generated with Claude Code

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

这类 attribution 信息在个人项目中通常无碍，但在团队协作、开源项目或有统一提交规范的仓库中，可能带来以下问题：

- commit message 格式不符合团队约定。
- PR 描述被自动追加额外内容，显得不够简洁。
- 对外开源项目不希望引入第三方工具署名。
- 历史提交中混入大量不需要的 attribution 信息。

核心处理思路分两部分：

1. 关闭新提交和 PR 中的自动署名。
2. 视情况清理已经存在的历史提交。

## 2. 禁止新提交带 Claude 署名

编辑 Claude Code 全局配置文件：

```text
~/.claude/settings.json
```

加入或修改以下配置：

```json
{
  "attribution": {
    "commit": "",
    "pr": ""
  }
}
```

### 配置字段说明

| 字段 | 作用 |
| --- | --- |
| `attribution.commit` | 控制 `git commit message` 中自动追加的署名内容 |
| `attribution.pr` | 控制 Pull Request 描述中自动追加的署名内容 |

将两个字段都设为空字符串，表示完全禁用对应位置的自动署名。

修改后需要重启 Claude Code 才会生效。

### 与旧版配置的关系

新配置建议优先使用 `attribution` 字段。如果实际仍有署名残留，可补充旧版字段：

```json
{
  "includeCoAuthoredBy": false,
  "includeGitInstructions": false
}
```

| 字段                       | 说明                                   |
| ------------------------ | ------------------------------------ |
| `includeCoAuthoredBy`    | 控制是否在 commit 信息中添加 Co-Authored-By 署名 |
| `includeGitInstructions` | 控制是否在 Git 操作中提供额外指令说明                |

配置来源补充：[Claude Code 技巧：禁用 Git 提交中的 Co-Authored-By 署名 - nobt Blog](https://nobt854.github.io/blog/2026/03/17/claude-code-disable-co-author/)

## 3. 清理已有历史提交

如果仓库里已经存在 Claude Code 自动生成的 attribution，需要根据提交是否已经推送到远程来选择处理方式。

### 3.1 情况一：只有本地提交，尚未 push

可以使用 `git filter-repo` 批量删除历史 commit message 中的 Claude 署名行。

#### 第一步：安装工具

```bash
brew install git-filter-repo
# 或
pip install git-filter-repo --break-system-packages
```

#### 执行批量清理

```bash
git filter-repo --force --message-callback '
return re.sub(b".*Co-Authored-By: Claude.*\n", b"", message)
'
```

说明：

- `--message-callback` 用于处理每条提交信息。
- 正则会删除包含 `Co-Authored-By: Claude` 的行。
- `--force` 用于跳过 `fresh clone` 检查，本地仓库直接操作时通常需要加上。

### 3.2 情况二：已经 push 到远程

如果包含 attribution 的提交已经推送到远程仓库，需要先执行与本地提交相同的历史清理命令，然后强制推送：

```bash
git push --force
```

注意事项：

- 强制推送会改写远程历史。
- 相关 commit hash 会全部变化。
- 协作者可能需要重新 clone，或基于新的历史重新 rebase。
- 公开仓库中影响更大，执行前需要先评估协作成本和风险。

### 3.3 情况三：只修改最近一次提交

如果只需要处理最近一次提交，且该提交还没有 push，可以使用：

```bash
git commit --amend
```

随后在编辑器中手动删除 `Co-Authored-By` 相关行，保存退出即可。

## 4. 按项目单独配置

Claude Code 的 attribution 不只能做全局配置，也可以按项目覆盖。

| 配置文件路径 | 作用范围 | 适用场景 |
| --- | --- | --- |
| `~/.claude/settings.json` | 全局配置，影响所有项目 | 个人偏好统一关闭 attribution |
| `.claude/settings.json` | 项目级配置，可提交到仓库 | 团队希望统一配置行为 |
| `.claude/settings.local.json` | 项目本地覆盖，通常加入 `.gitignore` | 只在当前项目中保留个人本地设置 |

实践选择：

- 个人只是想关闭自己所有项目中的署名：使用全局配置。
- 团队希望所有成员保持一致：使用项目级 `.claude/settings.json`。
- 只想在某个项目本地临时覆盖：使用 `.claude/settings.local.json`。

## 5. 推荐处理流程

如果只是从现在开始不再追加 Claude 署名：

1. 打开 `~/.claude/settings.json`。
2. 将 `attribution.commit` 和 `attribution.pr` 都设为空字符串。
3. 重启 Claude Code。
4. 后续新提交和 PR 描述将不再自动追加 attribution。

如果还需要清理旧提交：

1. 先确认提交是否已经 push。
2. 未 push 的本地提交可以使用 `git filter-repo` 或 `git commit --amend` 清理。
3. 已 push 的历史提交需要谨慎评估是否改写远程历史。
4. 确认风险后，再执行清理和 `git push --force`。

## 6. 总结

Claude Code 的 Git attribution 是可配置行为。对于需要保持提交记录简洁、遵守团队提交规范、或避免额外工具署名的项目，建议尽早关闭 attribution。

如果仓库尚未推送，清理成本较低；如果历史已经进入远程仓库，改写历史会影响协作者，应先评估风险再决定是否强制推送。

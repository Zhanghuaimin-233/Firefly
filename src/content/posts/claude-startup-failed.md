---
title: Claude Code 启动失败（ps1 不是可执行程序）的解决办法
published: 2026-05-12
description: Claude Code 启动失败（含 ps1 不是可执行程序）时，通过重装更新解决的办法。
image: ""
tags: [Claude Code, 排错]
category: Claude Code
draft: true
slug: claude-startup-failed
---

## 现象

Claude Code 启动失败，常见报错包括 `ps1 不是可执行程序`。

## 解决办法

这类问题大多可以通过重装更新解决：

```bash
# 查看全局包版本
npm list -g
# 下载最新包
npm install -g @anthropic-ai/claude-code@latest
```

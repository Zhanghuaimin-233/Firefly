---
title: opencode 启动时 Bun 崩溃的排查与修复
published: 2026-05-06
description: opencode 启动时 Bun 崩溃问题的排查与修复记录。
image: ""
tags: [opencode, Bun, 排错]
category: 开发工具
draft: false
slug: opencode-bun-crash
---

## 具体情况

通过 npm 全局安装，Windows 11 操作系统，Bun v1.3.13 启动时崩溃：

```text
Bun v1.3.13 (bf2e2cec) Windows x64 (baseline) Windows v.win11_dt CPU: sse42 avx avx2 avx512
Args: "E:\Dev\Runtimes\nvm\v20.20.2\node_modules\opencode-ai\node_modules\opencode-windows-x64\bin\opencode.exe" "--version"
Elapsed: 3ms | User: 0ms | Sys: 15ms
RSS: 17.95MB | Peak: 17.95MB | Commit: 24.78MB | Faults: 4536
panic(main thread): Segmentation fault at address 0x7FF77D85A798
oh no: Bun has crashed. This indicates a bug in Bun, not your code.
To send a redacted crash report to Bun's team, please file a GitHub issue using the link below:
```

## 解决方法

同步两个包版本即可：

```bash
# 查看全局包版本
npm list -g
# 全局卸载包
npm uninstall -g xxx
# 下载最新包
npm install -g xxx@latest
```

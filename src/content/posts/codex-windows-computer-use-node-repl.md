---
title: Codex Windows Computer Use node_repl 配置重启后消失排查记录
published: 2026-08-13
description: 记录 Codex Desktop 在 Windows 上能正常初始化 Computer Use，但重启后 node_repl 的 MCP 配置会从 config.toml 消失的现象。通过排除 cc-switch、对照 config/batchWrite 日志时间，定位到是 Desktop 启动阶段的有损配置写回所致，并给出启动后补回配置的临时恢复步骤与官方 Issue 跟踪。
image: ""
tags: [Codex, Windows, 排错, AI Agent, Computer Use, node_repl]
category: AI日常
draft: false
slug: codex-windows-computer-use-node-repl
---

> 记录时间：2026-08-07  
> 环境：Windows x64 / Microsoft Store 版 Codex Desktop  
> 涉及版本：Codex Desktop `26.803.5235.0`，日志中的 Desktop client `26.803.41515`  
> 当前结论：`node_repl` 运行时本身可以正常工作，但 Codex Desktop 会在启动过程中重写 `config.toml`，删除手动添加的有效配置。现阶段只有临时恢复方法，还没有真正解决 Desktop 的配置写回缺陷。

---

## 这次和上次不是同一个问题

之前修复 Computer Use 时，故障集中在这些地方：

- `openai-bundled` marketplace 不完整；
- WindowsApps 文件带 EFS 加密属性；
- 插件缓存与 Store 安装包版本不一致；
- `@oai/sky` 的 exports 缺少 Computer Use 使用的深层入口；
- `config.toml` 中没有注册 bundled 插件。

那次修复的重点，是把 Computer Use 插件和依赖重新拼完整。

这次情况有点耐人寻味：插件运行时并没有坏，配置也确实有效。只要等 Codex 启动完成，再手动补回 `node_repl` 配置，新任务里的 Computer Use 就能正常初始化。

问题出在下一次启动。

```text
手动加入 node_repl 配置
→ 新任务成功初始化 Computer Use
→ 可以读取 Windows 应用与窗口列表
→ 完全退出 Codex
→ 再次启动 Codex
→ node_repl 配置块消失
```

也就是说，这次不是“配置写错了”，而是“正确配置被 Codex 自己删掉了”。

---

## 最初看到的现象

Computer Use 无法使用时，`%USERPROFILE%\.codex\config.toml` 中缺少：

```toml
[mcp_servers.node_repl]
```

对应的 MCP 注册。

一开始不能确定是谁改写了配置，因为这台电脑同时使用了 cc-switch。它也会管理一部分 Agent 配置，因此很自然会先怀疑是不是两个配置管理器互相覆盖。

为了排除这一点，我们做了两轮测试。

### 第一轮：Codex 启动后手动补配置

等 Codex Desktop 完全启动后，再把有效的 `node_repl` 配置写进：

```text
%USERPROFILE%\.codex\config.toml
```

然后新建任务，初始化 Computer Use。

结果成功：

- Computer Use 运行时成功初始化；
- 能读取 Windows 应用和窗口列表；
- 能识别 Codex、文件资源管理器、VS Code、Edge 等当前窗口。

这次只做了无副作用测试，没有点击、输入或启动应用。

这个结果至少说明了两件事：

1. `node_repl.exe` 本身可用；
2. 手动添加的 TOML 配置能被 Codex 正确读取。

如果配置格式或可执行文件有问题，这一步就不可能成功。

### 第二轮：完全退出 cc-switch 后重试

为了排除 cc-switch，我们将它完全退出，然后重复以下过程：

1. 启动 Codex；
2. 手动补回 `node_repl` 配置；
3. 确认 Computer Use 可以初始化；
4. 完全退出 Codex；
5. 确认 cc-switch 仍未运行；
6. 再次启动 Codex；
7. 重新检查 `config.toml`。

结果没有变化：`node_repl` 配置仍然消失了。

所以 cc-switch 基本可以排除。真正参与这次改写的是 Codex Desktop 自己。

---

## 真正有意思的证据：`config/batchWrite`

在受控重启过程中，Codex 的 Desktop/app-server 日志记录到了：

```text
config/batchWrite
```

2026-08-07 的一次复现中，这个请求出现在本地时间约 `19:45:03`。同一时间，`config.toml` 被重新创建，原本存在的 `node_repl` 配置块已经不见了。

更关键的是，写回发生之前没有对应的：

- TOML 解析失败；
- `node_repl` 配置校验错误；
- MCP 启动错误；
- 找不到 `node_repl.exe`。

而且完全相同的配置，只要在 Desktop 启动完成后再写进去，就可以正常工作。

目前最符合这些证据的解释是：

```text
Codex Desktop 启动
→ 读取或生成一份不包含 node_repl 的配置快照
→ 初始化 bundled runtime / plugin
→ 通过 config/batchWrite 写回 config.toml
→ 原文件中的 node_repl 配置没有被合并，而是被遗漏
```

从表现上看，这很像一次有损的配置往返：读取时接受这段配置，写回时却没有把它带回来。

---

## 临时恢复方法

这不是永久修复，只能让当前启动周期中的 Computer Use 恢复工作。

### 1. 等 Codex Desktop 完全启动

不要在启动前写入配置。

测试已经证明，如果提前写入，Desktop 在启动同步过程中可能再次将它删除。比较可靠的临时顺序是：

```text
先启动 Codex
→ 等待插件和运行时初始化完成
→ 再修改 config.toml
→ 新建任务测试 Computer Use
```

### 2. 找到当前 `node_repl.exe`

可以在 PowerShell 7 中查找：

```powershell
$CodexLocal = Join-Path $env:LOCALAPPDATA "OpenAI\Codex"

Get-ChildItem -LiteralPath $CodexLocal `
  -Recurse `
  -Force `
  -File `
  -Filter "node_repl.exe" `
  -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object FullName, Length, LastWriteTime
```

如果存在多个版本，应优先确认当前 CUA runtime 使用的版本，不能直接照抄旧哈希目录。

本次测试时，本地 CUA/node_repl runtime 已更新到：

```text
runtime package: 0.0.6
runtime build: 20260723162306-088049353ddc
```

这里的版本和路径都可能随 Codex 更新而变化。

如果命令完全找不到 `node_repl.exe`，说明当前问题已经不是单纯缺少配置，不应该继续套用本节方法。

### 3. 补回 MCP 注册

配置结构至少需要类似：

```toml
[mcp_servers.node_repl]
command = 'C:\实际路径\node_repl.exe'
startup_timeout_sec = 120
```

如果当前 runtime 还要求环境变量，则必须以实际安装状态为准补充：

```toml
[mcp_servers.node_repl.env]
# 填写当前 runtime 真正需要的环境变量
```

不要直接复制旧记录中的 runtime 哈希路径。Codex 更新后，旧目录可能已经被删除或替换。

也不要在公开文章、Issue 或聊天记录中粘贴完整 `config.toml`。其中可能同时存在其他 MCP 的 Token、API Key、服务器地址和本地隐私路径。

### 4. 新建任务做无副作用验证

推荐先只验证控制通道，不要直接让它点击和输入：

```text
初始化 Computer Use，读取当前 Windows 应用和窗口列表。
不要点击、输入、切换窗口或启动应用。
```

本次成功结果是：

- 运行时能够初始化；
- 能读取应用和窗口列表；
- 能识别 Codex、文件资源管理器、VS Code、Edge 等窗口。

这已经足以证明 `node_repl` 与 Windows 控制通道可以建立连接。

---

## 为什么这还不能叫“修好了”

手动补回配置以后，Computer Use 确实能用。但只要重新启动 Codex，配置仍可能再次消失。

所以目前准确的状态是：

```text
node_repl 运行时：可用
手动 MCP 配置：可用
Computer Use 控制通道：可用
跨重启持久化：失败
Desktop 配置写回缺陷：未修复
```

这次恢复方法绕开了启动写回窗口，却没有修复写回逻辑本身。

理论上可以再写一个监视脚本，在 Codex 每次删掉配置后自动补回。不过在配置文件上安排两个程序互相覆盖，多少有点像让两个清洁机器人争夺同一块地板。它可能暂时有效，却很容易带来版本冲突或损坏其他设置。

在官方修复之前，更稳妥的做法仍然是：

1. 保留一份脱敏后的 `node_repl` 配置片段；
2. Codex 启动完成后按需补回；
3. 新建任务做最小测试；
4. 更新 Codex 后重新确认 runtime 路径，不复用旧哈希路径。

---

## 已向官方补充报告

GitHub 上已经存在高度相关的开放 Issue：

- [#24718：Codex Desktop startup rewrites config.toml and removes user-defined MCP servers on Windows](https://github.com/openai/codex/issues/24718)

我们将本次新版复现补充到了该 Issue：

- [本次复现评论](https://github.com/openai/codex/issues/24718#issuecomment-5216927677)

补充内容包括：

- Codex Desktop 与日志客户端版本；
- Windows x64 环境；
- 手动配置能够正常初始化 Computer Use；
- cc-switch 完全退出后仍然复现；
- `config/batchWrite` 与配置文件重建时间吻合；
- 启动前没有 `node_repl` 解析或启动错误；
- 当前表现可能是已关闭 Issue [#26190](https://github.com/openai/codex/issues/26190) 的修复不完整或新版回归。

---

## 这次留下的判断规则

以后再遇到 Computer Use 不可用，可以先判断故障发生在哪一层。

如果出现 marketplace 缺失、插件缓存版本不一致、EFS 加密或 `@oai/sky` import 报错，继续参考上一篇记录。

如果表现为：

- `node_repl` 配置手动加入后可以使用；
- Codex 重启后配置块消失；
- 日志中能看到 `config/batchWrite`；
- 没有 TOML 解析或 MCP 启动错误；

那么优先怀疑 Desktop 启动阶段的配置重写，而不是继续重装插件或修改 `@oai/sky`。

最短判断链路可以记成：

```text
先证明配置能用
→ 再证明只有重启会让它消失
→ 排除其他配置管理器
→ 对照 config/batchWrite 时间
→ 将问题定位到 Desktop 配置写回
```

这次真正弄明白的，不是“怎样再补一次配置”，而是为什么一段已经验证可用的配置总会消失。

至于永久修复，只能等 Codex Desktop 不再把它忘掉。

---

## 上一篇记录

- [Codex Windows Computer Use 插件不可用修复记录](/posts/codex-windows-computer-use-fix)

---
title: 给 Agent 装上浏览器：Playwright CLI 与 Web Access
published: 2026-08-12
description: 介绍 microsoft/playwright-cli 与 eze-is/web-access 两个让 Agent 操作浏览器的项目，解析它们的定位差异、能力边界，以及如何配合使用，让 Coding Agent 真正“亲自看一眼”自己写的页面。
image: ./images/01-playwright-verification-loop.webp
tags: [AI Agent, Playwright, Web Access, 浏览器自动化]
category: AI日常
draft: false
slug: playwright-cli-web-access
---

最近折腾 Agent 工具时，发现了两个挺有意思的项目：

- `microsoft/playwright-cli`
- `eze-is/web-access`

它们看起来都在做同一件事：

> 让 AI 能够操作浏览器。

但真正用下来会发现，它们解决的其实是两个不同的问题。

一个负责让 Agent **把网页操作好**，另一个负责让 Agent **把互联网用明白**。

---

## Playwright CLI：让 Agent 自己验收自己写的网页

仓库：[`microsoft/playwright-cli`](https://github.com/microsoft/playwright-cli)

Playwright 本身大家应该并不陌生，它一直都是 Web 自动化和端到端测试领域的常用工具。

而这个 Playwright CLI，则可以理解成：

> 把 Playwright 变成了一套专门方便 Coding Agent 调用的命令行接口。

例如：

```bash
playwright-cli open http://localhost:4321 --headed
playwright-cli snapshot
playwright-cli click e12
playwright-cli screenshot
```

于是以前的开发流程可能是：

```text
Agent 写代码
↓
Agent：理论上应该没问题
↓
我打开浏览器
↓
页面炸了
```

现在可以变成：

```text
Agent 写代码
↓
Agent 自己打开浏览器
↓
自己点按钮
↓
自己看 Console
↓
自己截图
↓
发现炸了
↓
自己回去修
```

突然有了一种“终于学会自己检查作业”的欣慰感。

尤其适合前端项目。

比如我平时折腾博客时，可以直接要求 Agent：

> 修改完成后启动开发服务器，使用 Playwright CLI 打开页面，检查桌面端和移动端布局，实际测试修改过的交互，发现问题自行修复。

这样就能形成真正的：

**编码 → 浏览器验证 → 修复 → 再验证**

![](./images/01-playwright-verification-loop.webp)

闭环。

Playwright CLI 还提供了截图、Network、Console、Trace、视频录制、Storage、Cookie 等能力，所以相比单纯“能打开网页”，它更像是一套 Agent 专用的浏览器调试工具箱。

---

## Web Access：让 Agent 真正学会上网

仓库：[`eze-is/web-access`](https://github.com/eze-is/web-access)

如果说 Playwright CLI 更偏“浏览器工程工具”，那么 Web Access 的野心明显更大。

它并不只是教 Agent 怎么点网页。

它考虑的是另一个问题：

> AI 到底应该怎样使用互联网？

Web Access 本质上是一个 Agent Skill。

里面包含了一整套联网策略，例如根据情况决定使用：

```text
Web Search
Web Fetch
curl
Jina
浏览器 CDP
```

比如查普通资料，没必要启动浏览器：

```text
搜索 → 找到官网 → 抓取正文
```

如果只是读一篇文章，也可以先转换成 Markdown，省下一大堆 Token。

但如果遇到：

- 需要登录的网站
- 动态页面
- 管理后台
- 小红书一类静态抓取困难的平台

它才会升级到真正的浏览器操作。

这种感觉很像给 Agent 配了一个“联网调度器”。

![](./images/02-web-access-routing.webp)

---

## 最大的区别：它直接用你的浏览器

Web Access 有一个特别有意思，同时也需要格外谨慎的能力：

**通过 CDP 直接连接 Chrome 或 Edge。**

这意味着它可以使用你当前浏览器里的登录状态。

例如你的 Edge 已经登录：

```text
GitHub
博客后台
某个管理平台
```

Agent 连接之后，不需要重新输入账号密码。

对于需要登录的网站来说，这体验非常舒服。

相比之下，Playwright CLI 更倾向于：

```text
Agent
↓
自己的 Playwright 浏览器 Session
```

而 Web Access 是：

```text
Agent
↓
我的 Edge
↓
我的登录状态
```

能力自然强很多，但权限也大很多。

所以如果真的长期使用，我个人反而更推荐专门创建一个：

```text
Agent Browser Profile
```

只登录 Agent 真正需要使用的网站。

![](./images/03-agent-browser-profile.webp)

不然哪天 Agent 一转头看见浏览器里开着邮箱、学校后台和各种账号……

嗯。

还是给彼此保留一点私人空间比较好。

---

## 两个工具其实并不冲突

最开始看到它们时，我也以为是二选一。

后来发现其实完全可以同时存在：

```text
                 Agent
                   │
        ┌──────────┴──────────┐
        │                     │
   Playwright CLI         Web Access
        │                     │
   前端开发验证           普通联网任务
   UI 自动测试            搜索资料
   Console                登录网站
   Network                浏览器操作
   Screenshot             信息收集
```

我的理解是：

> **Playwright CLI 解决“如何可靠地操作浏览器”。**

而：

> **Web Access 解决“什么时候以及怎样使用互联网”。**

![](./images/04-complementary-roles.webp)

所以如果是 Coding Agent：

Playwright CLI 很适合直接作为开发工具链的一部分。

而 Web Access 更像是给 Agent 补上一套完整的联网能力。

---

## 最后

现在 Coding Agent 的发展方向越来越有意思了。

以前我们给 AI：

```text
代码
终端
Git
```

现在开始继续往外补：

```text
浏览器
搜索
登录状态
网页交互
视觉反馈
```

Agent 也就从：

> “根据代码推测页面应该正常。”

逐渐进化成：

> “我刚刚亲自打开看了一下，确实正常。”

虽然只差几个字，但对实际开发体验来说，已经完全不是一回事了。

至于下一步……

大概就是 Agent 看完自己写的前端之后，沉默两秒，然后主动说：

> “这个按钮确实有点丑，我再改一下。”

那一天应该也不远了。

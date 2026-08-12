---
title: Agent 的 Skill、MCP 和 Plugin，到底有什么区别？
published: 2026-05-28
updated: 2026-08-12
description: 用大白话拆解 AI Agent 里最容易混的三个词——Skill、MCP、Plugin。一个教 Agent 怎么干，一个给 Agent 发工具，一个把教程和工具装进一个箱子，三者经常一层套一层。
image: ./images/01-three-layers-labeled.webp
tags: [AI Agent, Skill, MCP, Plugin]
category: AI Agent
draft: false
slug: agent-plugin-skills-mcp
---

折腾各种 Agent 工具久了，总会碰到几个绕不开的词：**Skill、MCP、Plugin。**

麻烦的是，它们看起来都在干差不多的事情。

装一个 Skill，Agent 多了新能力。

接一个 MCP，Agent 也多了新能力。

再装个 Plugin——怎么还是多了新能力？

刚开始看的时候确实很容易产生一种：

> 你们 AI 圈是不是又在给同一个东西起三个名字？

后来仔细理了一遍，发现其实没那么复杂。

如果只想先记住一句话：

| 东西 | 可以理解成 |
|---|---|
| **Skill** | 教 Agent **怎么做事** |
| **MCP** | 给 Agent **能调用的工具** |
| **Plugin** | 把这些东西 **打包安装** |

基本抓住这三个区别，后面就好理解了。

![](./images/01-three-layers-labeled.webp)

---

## Skill：给 Agent 一本“操作手册”

Skill 最好理解。

它通常围绕一个 `SKILL.md` 展开，里面告诉 Agent：

```text
什么时候使用这个 Skill
↓
任务应该怎么完成
↓
中间调用哪些工具
↓
最后输出成什么样
```

例如我可以写一个“博客写作 Skill”，规定：

- 不要写成百科；
- 先讲人话，再讲术语；
- 多给真实场景；
- 少来“综上所述”；
- 偶尔允许吐槽两句。

然后以后写文章时，Agent 就按照这套方法来。

所以 Skill 更像是在解决：

> **Agent 本来会做，但我希望它按照我的方法做。**

它也不一定只有 Markdown。

一个 Skill 目录里还可以塞：

```text
blog-writing/
├─ SKILL.md
├─ scripts/
├─ references/
└─ assets/
```

脚本、模板、参考资料都可以一起带上。

不过有一点很重要：

**Skill 不等于超能力。**

假设 Skill 里写：

> 打开网页，点击登录，然后截图。

如果 Agent 本身没有浏览器工具，也没有脚本或者其他工具提供浏览器能力，那它看完这句话以后也只能陷入沉思。

所以更准确地说：

> **Skill 是把已有能力组织成一套稳定流程。**

![](./images/02-skill-organizes-ability-labeled.webp)

---

## MCP：真的给 Agent 插一个工具

MCP 就不一样了。

它解决的问题更接近：

> **Agent 现在不会这个，我得给它接一个真的能干活的东西。**

例如接一个浏览器 MCP，可能给 Agent 暴露：

```text
navigate()
click()
type()
screenshot()
```

于是 Agent 就真的可以开网页、点按钮、输入文字。

接数据库 MCP：

```text
Agent
↓
MCP Server
↓
Database
```

Agent 就可以查数据库。

GitHub、Notion、云盘、浏览器、本地程序，同样都可以通过类似方式接进来。

所以我现在更喜欢把 MCP 想象成一种：

> **Agent 的 USB 接口。**

![](./images/03-mcp-connects-tools.webp)

Skill 会告诉 Agent：

> “检查网页时，先看布局，再点按钮，最后截图。”

MCP 则负责回答：

> “行，浏览器给你接好了。”

两者经常一起出现，但职责其实完全不同。

---

## Plugin：干脆把这一套装进盒子里

到了 Plugin，事情又往上一层。

Plugin 通常不是某一种具体能力，而更像一个**安装和分发方式**。

例如做一个“前端检查插件”，里面完全可以同时放：

```text
Frontend Plugin
├─ Skill
│  └─ 告诉 Agent 怎么检查 UI
│
├─ MCP
│  └─ 提供浏览器操作能力
│
├─ Hook
│  └─ 修改页面后自动触发检查
│
└─ Agent
   └─ 专门负责视觉验收
```

![](./images/04-plugin-package.webp)

用户不用研究这几个东西分别怎么装。

一句：

> 装这个 Plugin。

然后整套能力一起进来了。

所以 Plugin 更像：

> **扩展整合包。**

当然，不同 Agent 产品对 Plugin 的定义并不完全一样。

有的平台允许里面放 Skill、MCP、Hook、Agent 等很多组件，有的平台实现方式可能完全不同。

所以“Plugin”这个词最好不要脱离具体产品来看。

甚至有时候一个 Plugin 里面可能就只有一个 Skill。

这种情况下用户看起来就会觉得：

> 那 Plugin 和 Skill 有什么区别？

区别更多只是：

```text
Skill
→ 那个真正描述任务方法的东西

Plugin
→ 把它交到用户手上的包装方式
```

---

## 为什么它们总让人觉得是一回事？

因为最后的**效果可能完全一样**。

例如目标都是：

> 让 Agent 检查网页。

可以只靠 Skill：

```text
Agent 本身已经有浏览器
↓
Skill 告诉它怎么检查
```

也可以只接 MCP：

```text
Agent
↓
Browser MCP
↓
自己决定怎么检查
```

还可以搞成完整 Plugin：

```text
UI Review Plugin
├─ Skill：规定检查标准
└─ MCP：提供浏览器能力
```

最后看起来都是：

> Agent 打开网页检查了一遍。

所以如果只看结果，很容易混在一起。

真正应该看的不是“它最后能干什么”，而是：

> **它在整个系统里负责哪一层？**

---

## 那到底什么时候用哪个？

我现在的判断方式非常简单。

如果我的需求是：

> Agent 已经会了，但是做得不符合我的习惯。

写 **Skill**。

例如：

- 博客写作风格；
- Code Review 规则；
- 项目开发流程；
- UI 验收标准；
- 文档模板。

如果我的需求是：

> Agent 压根没有这个能力。

考虑 **MCP** 或其他工具接口。

例如：

- 操作数据库；
- 控制浏览器；
- 查询内部系统；
- 接入某个在线服务；
- 控制本地设备。

如果我的需求变成：

> 这套东西已经越来越复杂，我想让别人一键装好。

再考虑 **Plugin**。

大概就是：

```text
规定怎么干
→ Skill

提供家伙
→ MCP

连人带家伙一起打包
→ Plugin
```

这样记反而比背定义轻松很多。

---

## 还有一个容易忽略的问题：装扩展不等于复制几个文件

这一点是我后来越来越在意的。

尤其 Skill 给人的感觉很轻：

```text
SKILL.md
```

看起来就是一个 Markdown。

但如果里面还有：

```text
scripts/
```

事情就不一样了。

它可能要求：

```text
Node.js
Python
Playwright
OpenCV
ffmpeg
Docker
ADB
API Key
……
```

MCP 也是一样。

配置里写：

```text
command: npx
```

不代表什么都准备好了。

第一次运行的时候，背后照样可能：

```text
下载 npm 包
↓
下载浏览器
↓
创建缓存
↓
启动本地服务
```

远程 MCP 虽然不用在本地装这么多东西，却又会多出另一批问题：

```text
数据发给谁？
需要什么权限？
服务收费吗？
以后会不会停？
```

所以现在看到一个 Agent 扩展，我已经不太关心它到底自称 Skill、MCP 还是 Plugin 了。

我通常先看三件事：

```text
它会执行什么？
它在哪里执行？
它能碰到我的什么东西？
```

这三个问题比名字重要得多。

![](./images/05-extension-security-boundary.webp)

特别是浏览器登录态、本地文件、数据库、Git 仓库和 API Key 这种东西，权限一旦给出去，就不能再把它当普通提示词看了。

---

## 最后还是用一句最容易记的

如果以后又把这三个东西搞混，我大概会这样提醒自己：

```text
Skill
→ 教 Agent 怎么干活

MCP
→ 给 Agent 发工具

Plugin
→ 把教程和工具装进一个箱子
```

它们并不互斥，反而经常是一层套一层：

```text
Plugin
↓
Skill
↓
MCP
↓
真实的浏览器、数据库和服务
```

这么看以后，原本三个听起来很“AI 基础设施”的名词，突然就朴素了不少。

说到底，无非就是：

**教它怎么干，给它家伙干，再把整套东西装好带走。**

AI 圈绕了一大圈，最后还是没逃过工具箱。

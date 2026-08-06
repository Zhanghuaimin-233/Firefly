---
title: Agent 扩展机制入门：Plugin、Skills 与 MCP 有什么区别？
published: 2026-05-28
description: 通俗讲解 AI Agent 的三种扩展机制——Plugin、Skills 与 MCP——的定位、区别与适用场景。
image: ""
tags: [AI Agent, Plugin, Skills, MCP]
category: AI Agent
draft: true
slug: agent-plugin-skills-mcp
---

本文用于通俗解释现代 AI Agent 中常见的三类扩展机制：**插件（Plugin）**、**技能（Skills）** 与 **MCP 服务**。它们经常实现相似功能，但所处层级、安装方式、依赖来源和适用场景并不相同。

---

## 1. 先用一句话理解三者

| 名称 | 一句话理解 | 主要解决的问题 |
|---|---|---|
| **Skill** | 教 Agent 按什么流程做事的“操作手册”，也可附带脚本与模板 | 让任务执行更稳定、更符合个人或团队规范 |
| **MCP** | 让 Agent 连接外部工具与数据源的“标准接口” | 给 Agent 增加可调用的真实能力 |
| **Plugin** | 将多种扩展组件打包安装的“扩展套装” | 让用户更方便地安装、分发、升级整套能力 |

最容易记忆的关系是：

```text
Plugin：负责打包和安装
├─ Skills：负责流程、知识与任务规范
├─ MCP：负责连接外部工具和数据
├─ Hooks：负责事件触发后的自动动作
└─ Agents / Commands / 其他扩展组件
```

需要注意的是：**Plugin 的具体能力由不同 Agent 产品自行定义**。例如在 Claude Code 的插件体系中，一个插件可以包含 Skills、Agents、Hooks、MCP Servers、LSP Servers 与 Monitors；其他产品的插件系统可能具有不同结构。

---

## 2. Skill：让 Agent 学会“怎样做”

### 2.1 Skill 是什么？

Skill 通常是一个包含 `SKILL.md` 的目录。`SKILL.md` 会描述：

- 这个技能适用于什么任务；
- Agent 应按照什么步骤操作；
- 应使用什么命令、脚本或已有工具；
- 输出内容应符合什么格式。

一个典型 Skill 目录可能长这样：

```text
ui-review-skill/
├─ SKILL.md          # 必需：任务说明与执行流程
├─ scripts/          # 可选：Python / Node / Shell 脚本
├─ references/       # 可选：规范、参考资料
└─ assets/           # 可选：模板、示例资源
```

### 2.2 Skill 擅长什么？

Skill 最适合把经验与流程固化下来，例如：

- 按固定代码规范审查 Python 项目；
- 按统一结构生成实验报告；
- 检查网页 UI 的布局、按钮风格与文字溢出；
- 规定 Agent 修改文件前后应进行哪些检查；
- 让 Agent 使用某种固定语气、文档格式或项目习惯。

### 2.3 Skill 的关键限制

一个纯 Markdown 的 Skill 本身不会凭空获得浏览器、数据库或本地命令能力。

例如 Skill 写着：

```text
打开网页，点击登录按钮并截图。
```

它能够执行成功的前提是：

- Agent 本来就有浏览器工具；或
- Skill 附带脚本，并且 Agent 能运行这些脚本；或
- Skill 指示 Agent 调用已经配置好的 MCP 工具。

因此，Skill 的本质更接近：

> **把已有能力组织成稳定、可复用的工作流程。**

### 2.4 Skill 的安装与依赖特点

纯 `SKILL.md` 通常安装最方便：复制目录到指定位置即可使用。

但如果 Skill 附带脚本，就可能需要额外准备：

- Node.js 与 npm 包；
- Python 与 pip 包；
- Playwright 浏览器运行环境；
- OpenCV、OCR 模型、ADB、Git、ffmpeg 等外部程序；
- 环境变量、访问令牌或本地权限。

因此：

```text
纯文档 Skill：安装轻量，主要依赖 Agent 已有能力
带脚本 Skill：本质上也属于需要审查依赖的软件包
```

---

## 3. MCP：让 Agent 获得“可调用的新工具”

### 3.1 MCP 是什么？

MCP，即 Model Context Protocol，是一种让 AI 应用连接外部工具与数据源的标准协议。

在 MCP 架构中，通常存在：

```text
用户
 ↓
Agent / AI 客户端（MCP Client）
 ↓
MCP Server
 ↓
浏览器、数据库、文件系统、代码仓库、在线服务或本地程序
```

MCP Server 可以向 Agent 暴露：

- **Tools**：可调用的动作，例如打开网页、查询数据库、创建 Issue；
- **Resources**：可读取的数据或上下文；
- **Prompts**：服务端提供的提示模板。

### 3.2 MCP 擅长什么？

MCP 更适合真正连接外部系统，例如：

- 让 Agent 操作浏览器；
- 查询数据库；
- 访问 GitHub、Notion、云盘或项目管理系统；
- 获取实时技术文档；
- 控制本地工具，例如 ADB、测试程序或内部开发服务。

例如一个浏览器 MCP 可能提供：

```text
navigate(url)
click(element)
type(element, text)
screenshot()
read_page()
```

Agent 可以把这些工具当作明确的功能接口使用，而不需要了解背后是 Playwright、浏览器协议还是远程服务。

### 3.3 MCP 的安装方式与依赖特点

MCP Server 可以在本地运行，也可以位于远程服务器上。因此 MCP 的依赖情况并不统一。

| MCP 形式 | 常见配置特征 | 本地常见依赖 | 主要代价 |
|---|---|---|---|
| 远程 MCP | 配置中出现 `url` | 通常无需安装服务端程序 | 依赖网络、认证与服务存续 |
| Node 本地 MCP | `command: npx` | Node.js、npm 包、间接依赖 | 首次运行可能自动下载大量内容 |
| Python 本地 MCP | `python` / `uvx` | Python、pip/uv 包、系统库 | 可能遇到环境冲突 |
| Docker MCP | `command: docker` | Docker 与镜像 | 磁盘占用、端口与卷挂载管理 |
| 独立程序 MCP | `.exe` 或二进制文件 | 运行库、驱动、外部程序 | 需核对程序来源与权限 |

因此：

> **MCP 配置写好了，不代表依赖已经准备好了。**

例如配置了一个由 `npx` 启动的浏览器 MCP，第一次真正调用时仍可能下载 npm 包、浏览器组件或生成用户数据目录。

### 3.4 MCP 的优势与限制

**优势：**

- 工具接口结构化，Agent 更容易发现与调用；
- 适合多个客户端复用同类工具；
- 适合接入实时数据和真实外部操作；
- 便于将浏览器、数据库、服务 API 等能力统一暴露给 Agent。

**限制：**

- 本地 MCP 可能带来依赖安装、运行环境和进程维护问题；
- 远程 MCP 可能依赖账号、API Key、网络与第三方服务持续运营；
- 能读取或修改真实数据的 MCP 需要特别谨慎地授权；
- 若服务端关闭，依赖该服务的核心功能可能随之失效。

---

## 4. Plugin：把能力打包成“可安装套装”

### 4.1 Plugin 是什么？

Plugin 通常是某个 Agent 产品定义的可安装扩展包。与 Skill 和 MCP 不同，Plugin 更偏向于**安装、分发与组合机制**。

一个复杂插件可能包含：

```text
frontend-check-plugin/
├─ skills/
│  └─ ui-review/
│     └─ SKILL.md
├─ agents/
│  └─ visual-inspector.md
├─ hooks/
│  └─ after-edit-check.json
├─ .mcp.json
└─ README.md
```

它安装后可能同时实现：

- 用 Skill 规定 UI 检查流程；
- 用 MCP 操作浏览器；
- 用 Hook 在保存文件后自动触发检查；
- 用专门 Agent 负责视觉验收与报告整理。

### 4.2 Plugin 为什么会让人感觉与 Skill 很像？

因为一个简单 Plugin 可能只有一个 Skill：

```text
python-review-plugin/
└─ skills/
   └─ python-review/
      └─ SKILL.md
```

此时从用户体验看，安装 Plugin 与安装 Skill 几乎没有区别。

但当扩展需要组合多个技能、工具、事件触发器与角色时，Plugin 的优势就会显现出来：用户只需要安装一次完整套件，而不用分别处理每个组件。

### 4.3 Plugin 能不能解决 MCP 安装麻烦的问题？

Plugin 可以隐藏或简化 MCP 的配置步骤，例如自动注册一个浏览器 MCP；但它无法消除 MCP 的实际运行要求：

- 需要登录的服务仍然要授权；
- 需要 API Key 的服务仍然要配置凭据；
- 本地 MCP 的 Node、Python、Docker 等依赖仍然可能要下载；
- 远程 MCP 仍然依赖网络和服务方持续运行。

因此：

```text
Plugin 解决“怎样方便安装与组合”
MCP 解决“怎样连接并调用外部能力”
Skill 解决“怎样按照流程完成任务”
```

---

## 5. 为什么三者会出现功能重叠？

三者并不是严格互斥的类别，而是可以在不同层面完成相同目标。

以“让 Agent 操作浏览器检查网页”为例，可能有三种方案：

### 方案 A：只有 Skill

```text
Agent 自带浏览器能力
  ↓
UI 检查 Skill 规定检查步骤
  ↓
Agent 打开网页、截图并生成报告
```

适合：Agent 已有浏览器工具，只需要补充检查规范。

### 方案 B：只有 MCP

```text
Agent
  ↓
Browser MCP 提供 navigate / click / screenshot 等工具
  ↓
Agent 自行决定如何检查网页
```

适合：Agent 原本没有浏览器能力，需要新增通用操作工具。

### 方案 C：Plugin 打包 Skill + MCP

```text
网页验收 Plugin
  ├─ Skill：规定验收标准与报告格式
  └─ Browser MCP：负责打开、点击、读取、截图
```

适合：需要向用户提供一套安装即可使用的完整解决方案。

这说明：

> **功能结果可以相似，但职责并不相同。Skill 偏任务流程，MCP 偏能力接口，Plugin 偏整体分发。**

---

## 6. 三者对比表

| 对比项目 | Skill | MCP | Plugin |
|---|---|---|---|
| 核心定位 | 工作流程与知识包 | 工具/数据连接协议与服务 | 可安装扩展套装 |
| 最典型内容 | `SKILL.md`、脚本、模板、参考资料 | 本地或远程 MCP Server | Skills、MCP、Hooks、Agents 等组合 |
| 是否一定执行代码 | 否 | 是，Server 需要运行 | 取决于内部组件 |
| 是否天然提供新外部能力 | 否，通常复用已有工具或附带脚本 | 是 | 可以通过内部 MCP 或原生组件提供 |
| 最轻安装方式 | 复制一个目录 | 添加远程地址或本地启动配置 | 从市场或目录一键安装 |
| 本地依赖风险 | 纯文档较低，附脚本后升高 | 本地 MCP 可能很高 | 继承全部内部组件的依赖 |
| 远程服务依赖 | 视脚本/流程而定 | 远程 MCP 通常较强 | 视内部 MCP 或服务而定 |
| 适合定制个人习惯 | 非常适合 | 不主要负责此事 | 可打包个人或团队方案 |
| 适合连接数据库、浏览器、云服务 | 需要依赖已有工具或脚本 | 非常适合 | 可内置或捆绑 MCP |
| 适合分发完整产品体验 | 一般 | 单独分发偏工程化 | 非常适合 |

---

## 7. 如何选择：按需求判断

### 7.1 选择 Skill 的情况

当需求的核心是：

```text
Agent 已经大致能完成任务，但我希望它按固定方法、规范或模板执行。
```

适合制作 Skill 的例子：

- 代码审查规范；
- 文档输出格式；
- 项目专用开发流程；
- 页面视觉验收标准；
- 固定的调试、排错或报告生成步骤。

### 7.2 选择 MCP 的情况

当需求的核心是：

```text
Agent 需要获得一个真实、可调用、可连接外部系统的新工具。
```

适合使用或开发 MCP 的例子：

- 浏览器自动化；
- 数据库查询；
- GitHub、Notion、Jira、云存储等在线系统操作；
- 本地设备、模拟器、ADB、内部服务控制；
- 实时文档或业务数据查询。

### 7.3 选择 Plugin 的情况

当需求的核心是：

```text
我希望把多种能力组合成一个安装即用的完整扩展。
```

适合制作 Plugin 的例子：

- 前端 UI 测试套件：检查规范 + 浏览器能力 + 截图报告；
- 项目开发助手：编码规范 + 文档查询 + 提交前检查；
- 自动化调试套件：测试流程 + 工具调用 + 日志模板 + 专门 Agent。

---

## 8. 安装和依赖：最容易被忽略的部分

安装 Agent 扩展时，不应只看它属于 Skill、MCP 还是 Plugin，而应检查它实际执行什么、运行在哪里。

### 8.1 依赖判断思路

```text
第一步：它会不会执行代码？
  - 纯说明文档：依赖较少
  - 附带脚本或服务程序：继续检查运行环境

第二步：代码在哪里运行？
  - 本地运行：检查 Node、Python、Docker、浏览器、外部程序
  - 远程运行：检查网络、授权、隐私、服务存续与费用

第三步：它能接触什么资源？
  - 浏览器登录态
  - 本地文件
  - 数据库
  - Git 仓库
  - API Key / OAuth 权限

第四步：版本是否固定？
  - 固定版本更容易审计和复现
  - `latest` 等自动更新形式可能导致行为变化
```

### 8.2 审查重点表

| 扩展类型 | 应重点审查什么？ |
|---|---|
| 纯 Skill | 指令内容是否可靠，是否会误导 Agent 操作敏感文件 |
| 带脚本 Skill | 依赖清单、安装脚本、网络访问、文件权限、密钥读取 |
| 本地 MCP | 启动命令、依赖下载、服务权限、数据访问范围、版本固定情况 |
| 远程 MCP | 服务提供方、认证方式、数据上传范围、停服风险、调用限制 |
| Plugin | 内部包含的所有 Skill、MCP、Hook、Agent 与安装动作 |

---

## 9. 推荐的分层使用方式

在复杂工作流中，三者并不需要互相取代。更合理的组合通常是：

```text
Plugin：面向用户提供一键安装体验
  ↓
Skill：规定任务流程、标准与输出格式
  ↓
MCP：提供浏览器、数据库、文档查询等底层能力
  ↓
真实系统：网页、文件、服务、设备与数据
```

例如一个网页 UI 检查扩展：

```text
UI 检查 Plugin
├─ Skill：规定需要检查间距、配色、按钮一致性和响应式布局
├─ MCP：负责打开网页、切换尺寸、读取页面与截图
└─ Hook：在页面文件修改后自动触发基础检查
```

这种设计的好处是：

- 检查规则变化时，只需修改 Skill；
- 底层浏览器能力可以继续复用 MCP；
- 用户只需安装 Plugin，而不必手动拼装所有组件。

---

## 10. 最终记忆法

可以将三者记成以下比喻：

| 概念 | 类比 |
|---|---|
| **Skill** | 教 Agent 做事的教程、流程卡或作业规范 |
| **MCP** | Agent 可以插接的工具接口、设备驱动或服务桥梁 |
| **Plugin** | 将教程、工具与自动化规则装在一起的扩展安装包 |

一句话总结：

> **Skill 让 Agent 更会做事，MCP 让 Agent 真能调用外部能力，Plugin 让整套扩展更容易安装和分发。**

---

## 参考资料

1. Agent Skills 官方概览：<https://agentskills.io/home>
2. Agent Skills 规范：<https://agentskills.io/specification>
3. Model Context Protocol 官方文档：<https://modelcontextprotocol.io/docs/learn/server-concepts>
4. Model Context Protocol 官方介绍：<https://modelcontextprotocol.io/docs/getting-started/intro>
5. Claude Code Plugins Reference：<https://code.claude.com/docs/en/plugins-reference>
6. Claude Code Plugins Guide：<https://code.claude.com/docs/en/plugins>
7. Codex Agent Skills 文档：<https://developers.openai.com/codex/skills>

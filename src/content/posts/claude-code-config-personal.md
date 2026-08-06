---
title: Claude Code 配置详解（个人向）
published: 2025-06-22
description: 一份个人向的 Claude Code 配置笔记，覆盖设置项、工作流与常用技巧。
image: ""
tags: [Claude Code, 配置, 开发工具]
category: Claude Code
draft: true
slug: claude-code-config-personal
---

# Claude Code 配置详解（settings.json）

> 本文用于解释 Claude Code 常见 `settings.json` 配置字段的作用。  
> 文中已去除个人网关地址、Token 和具体第三方模型名，统一使用占位符示例。  
> 注意：Claude Code 更新较快，部分字段可能随版本变化；建议以官方文档和当前安装版本为准。

---

## 1. 配置文件的常见位置

Claude Code 的配置通常可以放在不同作用域中：

| 位置 | 典型路径 | 作用 |
|---|---|---|
| 用户级配置 | `~/.claude/settings.json` | 对当前用户的所有项目生效 |
| 项目级配置 | `<project>/.claude/settings.json` | 对当前项目生效，适合团队共享 |
| 本地项目配置 | `<project>/.claude/settings.local.json` | 只对当前机器生效，通常不提交到 Git |
| 企业/托管配置 | 由组织策略控制 | 优先级通常更高，用户可能无法覆盖 |

需要注意：

- 涉及个人 Token、私有网关地址、个人偏好的配置，建议放在用户级配置或本地项目配置。
- 涉及团队协作规范的配置，可以放在项目级配置。
- 权限相关配置需要谨慎，尤其是 `auto`、`bypassPermissions` 这类模式。
- 某些高权限配置放在项目级配置时可能被 Claude Code 忽略，以防不可信仓库自动提升权限。

---

## 2. 一份去除个人信息后的示例结构

下面是一份脱敏后的结构示例：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "",
    "ANTHROPIC_BASE_URL": "https://your-llm-gateway.example.com/anthropic",

    "ANTHROPIC_MODEL": "your-model-id[1m]",
    "CLAUDE_CODE_SUBAGENT_MODEL": "your-subagent-model-id[1m]",

    "ANTHROPIC_DEFAULT_FABLE_MODEL": "your-fable-model-id[1m]",
    "ANTHROPIC_DEFAULT_FABLE_MODEL_NAME": "your-fable-display-name",

    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "your-haiku-model-id",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME": "your-haiku-display-name",

    "ANTHROPIC_DEFAULT_OPUS_MODEL": "your-opus-model-id[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL_NAME": "your-opus-display-name",

    "ANTHROPIC_DEFAULT_SONNET_MODEL": "your-sonnet-model-id[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL_NAME": "your-sonnet-display-name",

    "DISABLE_AUTOUPDATER": "1",
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "CLAUDE_CODE_EFFORT_LEVEL": "max",
    "CLAUDE_CODE_ATTRIBUTION_HEADER": "0"
  },

  "attribution": {
    "commit": "",
    "pr": "",
    "sessionUrl": false
  },

  "enabledPlugins": {
    "plugin-name@marketplace-name": true
  },

  "extraKnownMarketplaces": {
    "marketplace-name": {
      "source": {
        "repo": "owner/repo",
        "source": "github"
      }
    }
  },

  "includeCoAuthoredBy": false,
  "includeGitInstructions": false,

  "permissions": {
    "defaultMode": "auto"
  },

  "skipAutoPermissionPrompt": true,
  "theme": "dark"
}
```

---

## 3. `env`：环境变量配置

`env` 用于在 Claude Code 启动时注入环境变量。  
它可以控制模型选择、认证方式、请求路由、功能开关等。

### 3.1 `ANTHROPIC_AUTH_TOKEN`

```json
"ANTHROPIC_AUTH_TOKEN": ""
```

作用：

- 用于配置 Anthropic 兼容接口的认证 Token。
- 通常会作为请求认证信息发送给后端服务。
- 如果为空，表示没有在这里提供 Token。

注意：

- 如果这里填写真实 Token，不要提交到 GitHub。
- 不要把包含真实 Token 的配置发给别人。
- 如果项目需要共享配置，建议用环境变量或本地私有配置文件保存 Token。

---

### 3.2 `ANTHROPIC_BASE_URL`

```json
"ANTHROPIC_BASE_URL": "https://your-llm-gateway.example.com/anthropic"
```

作用：

- 指定 Claude Code 请求发送到哪个 API endpoint。
- 可用于代理、企业网关、第三方 LLM gateway 或兼容 Anthropic API 的服务。
- 设置后，请求不一定直接发往 Anthropic 官方接口，而是发往该地址。

注意：

- 如果是第三方网关，代码片段、提示词、工具调用内容可能经过该服务。
- 处理私有项目、密钥、公司代码时要格外谨慎。
- 不建议把个人网关地址写进公开仓库。

---

### 3.3 `ANTHROPIC_MODEL`

```json
"ANTHROPIC_MODEL": "your-model-id"
```

作用：

- 指定 Claude Code 当前会话默认使用的模型。
- 它通常比普通 settings 里的 `model` 字段更直接。
- 启动参数 `--model` 或会话中的 `/model` 仍可能覆盖当前会话模型。

示例：

```json
"ANTHROPIC_MODEL": "claude-sonnet-xxx"
```

如果模型或网关支持 1M 上下文，可以使用类似：

```json
"ANTHROPIC_MODEL": "claude-sonnet-xxx[1m]"
```

注意：

- `[1m]` 是否可用取决于 Claude Code 版本、模型别名、后端网关和实际模型能力。
- 不是所有模型都支持 `[1m]`。
- 如果后端网关不识别该写法，可能会报错或回退。

---

### 3.4 `CLAUDE_CODE_SUBAGENT_MODEL`

```json
"CLAUDE_CODE_SUBAGENT_MODEL": "your-subagent-model-id"
```

作用：

- 指定 Claude Code subagent 使用的模型。
- 会覆盖子代理自身定义中的模型设置。
- 如果希望子代理继承默认模型，可以使用 `inherit`。

示例：

```json
"CLAUDE_CODE_SUBAGENT_MODEL": "inherit"
```

或：

```json
"CLAUDE_CODE_SUBAGENT_MODEL": "your-model-id[1m]"
```

适用场景：

- 想让所有子代理统一使用同一个模型。
- 想让主会话和 subagent 都走同一套模型。
- 想避免某些 subagent 自动调用较贵或较弱的默认模型。

---

### 3.5 `ANTHROPIC_DEFAULT_*_MODEL`

常见字段：

```json
"ANTHROPIC_DEFAULT_FABLE_MODEL": "your-fable-model-id",
"ANTHROPIC_DEFAULT_HAIKU_MODEL": "your-haiku-model-id",
"ANTHROPIC_DEFAULT_OPUS_MODEL": "your-opus-model-id",
"ANTHROPIC_DEFAULT_SONNET_MODEL": "your-sonnet-model-id"
```

作用：

- 为 Claude Code 内部的模型别名指定实际模型。
- 当 Claude Code 或用户选择 `sonnet`、`opus`、`haiku`、`fable` 等别名时，会映射到这里配置的模型。
- 常用于接入第三方 LLM gateway 或企业部署模型。

常见理解：

| 字段 | 一般用途 |
|---|---|
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | 日常主力模型别名 |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | 高能力/复杂任务模型别名 |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | 快速、轻量、小任务模型别名 |
| `ANTHROPIC_DEFAULT_FABLE_MODEL` | 特定版本中用于模型选择器或内部别名的模型 |

关于 `[1m]`：

```json
"ANTHROPIC_DEFAULT_SONNET_MODEL": "your-sonnet-model-id[1m]",
"ANTHROPIC_DEFAULT_OPUS_MODEL": "your-opus-model-id[1m]"
```

- `[1m]` 通常表示 1M 上下文变体。
- 官方文档中更明确提到的是 `sonnet[1m]` 和 `opus[1m]`。
- `haiku[1m]` 并不是常规推荐写法。
- 第三方网关是否支持 `[1m]`，需要看网关实现。

---

### 3.6 `ANTHROPIC_DEFAULT_*_MODEL_NAME`

常见字段：

```json
"ANTHROPIC_DEFAULT_SONNET_MODEL_NAME": "your-sonnet-display-name",
"ANTHROPIC_DEFAULT_OPUS_MODEL_NAME": "your-opus-display-name",
"ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME": "your-haiku-display-name",
"ANTHROPIC_DEFAULT_FABLE_MODEL_NAME": "your-fable-display-name"
```

作用：

- 控制模型选择器中显示的名称。
- 不一定影响真实调用的模型。
- 通常和 `ANTHROPIC_DEFAULT_*_MODEL` 成对使用。

示例：

```json
"ANTHROPIC_DEFAULT_SONNET_MODEL": "provider-model-id[1m]",
"ANTHROPIC_DEFAULT_SONNET_MODEL_NAME": "Provider Sonnet 1M"
```

其中：

- `MODEL` 是真实模型 ID。
- `MODEL_NAME` 是显示名称。

---

### 3.7 `DISABLE_AUTOUPDATER`

```json
"DISABLE_AUTOUPDATER": "1"
```

作用：

- 关闭 Claude Code 的自动后台更新。
- 通常仍允许手动更新。

适用场景：

- 不希望工具自动升级导致行为变化。
- 希望固定某个版本用于项目或团队环境。
- 第三方分发版、特殊环境或镜像环境中常见。

注意：

- 关闭自动更新后，要自己关注安全更新和兼容性问题。
- 如果希望完全禁用更新，可能还需要查看当前版本是否支持更严格的更新禁用字段。

---

### 3.8 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`

```json
"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
```

作用：

- 开启实验性的 agent teams 功能。
- 允许 Claude Code 使用多代理协作能力。

注意：

- experimental 表示实验功能，行为可能变化。
- 可能存在兼容性、稳定性或权限边界变化。
- 不建议在重要项目中盲目开启，除非明确需要。

---

### 3.9 `CLAUDE_CODE_EFFORT_LEVEL`

```json
"CLAUDE_CODE_EFFORT_LEVEL": "max"
```

作用：

- 控制模型的推理努力等级。
- 常见值可能包括：`low`、`medium`、`high`、`xhigh`、`max`、`auto`。
- 实际是否生效取决于模型和后端服务支持情况。

常见取值理解：

| 值 | 含义 |
|---|---|
| `low` | 更快，推理较少 |
| `medium` | 平衡 |
| `high` | 更认真，可能更慢 |
| `xhigh` | 更高推理努力 |
| `max` | 尽量使用最高推理努力 |
| `auto` | 由系统自动决定 |

注意：

- 更高 effort 通常可能带来更高延迟或更高消耗。
- 第三方网关不一定完全支持该字段。
- 如果后端模型不支持，可能会被忽略。

---

### 3.10 `CLAUDE_CODE_ATTRIBUTION_HEADER`

```json
"CLAUDE_CODE_ATTRIBUTION_HEADER": "0"
```

作用：

- 控制是否在提示词中加入 Claude Code attribution header。
- 设置为 `0` 通常表示关闭该 attribution header。

可能用途：

- 减少提示词中额外的固定头部内容。
- 在 LLM gateway 场景中提高 prompt cache 命中率。
- 避免某些第三方兼容网关对额外 header 行为不一致。

注意：

- 这和 Git commit / PR 中的署名不是同一个东西。
- Git/PR 署名主要由 `attribution`、`includeCoAuthoredBy` 等字段控制。

---

## 4. `attribution`：提交与 PR 署名配置

```json
"attribution": {
  "commit": "",
  "pr": "",
  "sessionUrl": false
}
```

作用：

- 控制 Claude Code 在 Git commit、PR 描述、session 链接中添加的署名信息。
- 适合不希望自动出现 “Generated with Claude Code” 或 session 链接的场景。

### 4.1 `attribution.commit`

```json
"commit": ""
```

作用：

- 控制 commit message 中是否加入 attribution。
- 设置为空字符串通常表示不添加提交署名。

---

### 4.2 `attribution.pr`

```json
"pr": ""
```

作用：

- 控制 Pull Request 描述中是否加入 attribution。
- 设置为空字符串通常表示不添加 PR 署名。

---

### 4.3 `attribution.sessionUrl`

```json
"sessionUrl": false
```

作用：

- 控制是否在提交、PR 或相关输出中附加 Claude Code session 链接。
- 设置为 `false` 表示不附加 session URL。

建议：

如果想尽量关闭所有自动署名，可以同时设置：

```json
"attribution": {
  "commit": "",
  "pr": "",
  "sessionUrl": false
}
```

---

## 5. `enabledPlugins`：启用插件

```json
"enabledPlugins": {
  "plugin-name@marketplace-name": true
}
```

作用：

- 控制是否启用某个 Claude Code 插件。
- 格式通常是：

```text
插件名@市场名
```

示例：

```json
"enabledPlugins": {
  "example-plugin@example-marketplace": true
}
```

说明：

| 值 | 含义 |
|---|---|
| `true` | 启用插件 |
| `false` | 禁用插件 |

注意：

- 插件可以扩展 Claude Code 能力。
- 启用前应确认插件来源可信。
- 插件可能引入额外工具、权限或行为变化。

---

## 6. `extraKnownMarketplaces`：额外插件市场

```json
"extraKnownMarketplaces": {
  "marketplace-name": {
    "source": {
      "repo": "owner/repo",
      "source": "github"
    }
  }
}
```

作用：

- 注册额外插件市场。
- 让 Claude Code 知道某个 marketplace 从哪里获取。
- 这只是“认识这个市场”，不等于启用其中所有插件。

字段说明：

| 字段 | 作用 |
|---|---|
| `marketplace-name` | 自定义市场名称 |
| `source.repo` | GitHub 仓库，例如 `owner/repo` |
| `source.source` | 来源类型，例如 `github` |

注意：

- 注册 marketplace 后，仍需要在 `enabledPlugins` 中启用具体插件。
- 第三方插件市场需要确认可信度。
- 不建议在不理解插件能力的情况下启用陌生插件。

---

## 7. `includeCoAuthoredBy`：旧版共同作者署名开关

```json
"includeCoAuthoredBy": false
```

作用：

- 控制是否在 Git commit 中添加 `Co-Authored-By` 署名。
- 当前更推荐使用 `attribution` 字段统一控制署名。

状态：

- 这是较旧的字段。
- 在新配置中，`attribution` 通常优先级更高。
- 保留它一般不会有太大问题，但如果追求简洁，可以只使用 `attribution`。

推荐写法：

```json
"attribution": {
  "commit": "",
  "pr": "",
  "sessionUrl": false
}
```

---

## 8. `includeGitInstructions`：Git 指令注入开关

```json
"includeGitInstructions": false
```

作用推测：

- 该字段可能用于控制是否向 Claude Code 注入额外 Git 操作相关指令。
- 设置为 `false` 表示不包含这些 Git instructions。

注意：

- 该字段在当前官方 settings 文档中不一定能查到。
- 可能来自旧版本、内部字段、社区配置或特定分发版。
- 如果当前版本不识别该字段，通常会忽略它。

建议：

- 如果配置中已有该字段，可以暂时保留。
- 如果追求“严格官方字段”，可以考虑删除。
- 如果删除后行为没有变化，则说明当前环境可能没有使用它。

---

## 9. `permissions`：权限配置

```json
"permissions": {
  "defaultMode": "auto"
}
```

`permissions` 用于控制 Claude Code 可以自动执行哪些操作、哪些操作需要确认、哪些操作禁止执行。

---

### 9.1 `permissions.defaultMode`

```json
"defaultMode": "auto"
```

作用：

- 设置 Claude Code 默认权限模式。
- 不同模式会影响工具调用、文件编辑、命令执行时是否需要确认。

常见模式概念：

| 模式 | 大致含义 |
|---|---|
| `default` | 默认模式，较保守 |
| `acceptEdits` | 自动接受文件编辑，但其他高风险操作仍可能确认 |
| `plan` | 更偏计划/分析，减少直接执行 |
| `auto` | 自动化程度更高，减少确认弹窗，并依赖安全判断 |
| `dontAsk` | 只允许预先批准的工具，不主动询问 |
| `bypassPermissions` | 绕过权限确认，风险最高 |

注意：

- `auto` 比默认模式更方便，但也更需要信任项目环境。
- `bypassPermissions` 风险很高，不建议日常使用。
- 某些版本中，项目级配置里的 `defaultMode: "auto"` 可能会被忽略，防止不可信仓库自动提升权限。
- 如果想稳定默认使用 `auto`，通常应放在用户级配置中。

---

### 9.2 `permissions.allow`

示例：

```json
"permissions": {
  "allow": [
    "Bash(npm test)",
    "Read(./src/**)"
  ]
}
```

作用：

- 明确允许某些工具或操作。
- 可用于减少重复确认。

示例含义：

| 规则 | 含义 |
|---|---|
| `Bash(npm test)` | 允许运行 `npm test` |
| `Read(./src/**)` | 允许读取 `src` 目录 |

注意：

- 不要过度放宽高风险命令。
- 对 `rm`、`git push`、部署脚本、密钥读取等操作要谨慎。

---

### 9.3 `permissions.deny`

示例：

```json
"permissions": {
  "deny": [
    "Read(./.env)",
    "Read(./.env.*)",
    "Read(./secrets/**)",
    "Read(./*.pem)",
    "Read(./*.key)"
  ]
}
```

作用：

- 明确禁止某些工具或操作。
- 适合保护敏感文件和危险命令。

建议常见保护对象：

```json
"deny": [
  "Read(./.env)",
  "Read(./.env.*)",
  "Read(./secrets/**)",
  "Read(./config/credentials.json)",
  "Read(./*.pem)",
  "Read(./*.key)",
  "Read(./id_rsa)",
  "Read(./id_ed25519)"
]
```

适合保护：

- `.env`
- API Key
- SSH 私钥
- 证书文件
- 数据库凭据
- 云服务密钥
- 部署凭证

---

### 9.4 `permissions.ask`

示例：

```json
"permissions": {
  "ask": [
    "Bash(git push)",
    "Bash(rm -rf *)"
  ]
}
```

作用：

- 指定某些操作必须询问确认。
- 适合中高风险但不想完全禁止的操作。

适合放入 `ask` 的操作：

- `git push`
- 删除文件
- 安装依赖
- 修改系统配置
- 执行部署脚本
- 运行数据库迁移

---

### 9.5 建议的安全权限模板

如果使用第三方网关或开启 `auto`，建议至少保护敏感文件：

```json
"permissions": {
  "defaultMode": "auto",
  "deny": [
    "Read(./.env)",
    "Read(./.env.*)",
    "Read(./secrets/**)",
    "Read(./config/credentials.json)",
    "Read(./*.pem)",
    "Read(./*.key)",
    "Read(./id_rsa)",
    "Read(./id_ed25519)"
  ],
  "ask": [
    "Bash(git push)",
    "Bash(rm -rf *)",
    "Bash(rm -rf .*)"
  ]
}
```

注意：

- 规则语法可能随版本变化。
- 最好用 Claude Code 内置 `/permissions` 界面检查规则是否被正确识别。
- 不要盲目复制未知来源的 allow 规则。

---

## 10. `skipAutoPermissionPrompt`：跳过 auto 权限提示

```json
"skipAutoPermissionPrompt": true
```

作用推测：

- 可能用于跳过 auto mode 的 opt-in / 首次确认提示。
- 社区资料中常见说法是“跳过自动权限模式提示”。

重要说明：

- 当前官方 settings 文档中不一定能查到该字段。
- 它更像是内部字段、旧版字段、社区发现字段或特定版本字段。
- 如果 Claude Code 当前版本不识别，通常会被忽略。
- 它不等价于 `bypassPermissions`。
- 它不代表跳过所有权限确认。

建议：

- 如果已有配置中包含它，可以保留观察。
- 如果追求严格官方字段，可以删除。
- 真正控制默认权限模式的关键字段仍然是：

```json
"permissions": {
  "defaultMode": "auto"
}
```

---

## 11. `skipDangerousModePermissionPrompt`：跳过危险模式确认

示例：

```json
"skipDangerousModePermissionPrompt": true
```

作用：

- 跳过进入 `bypassPermissions` 危险模式前的确认提示。
- 这是官方文档中能查到的字段。

注意：

- 它针对的是 `bypassPermissions`，不是普通 `auto`。
- 风险较高。
- 项目级配置中可能会被忽略，以避免不可信仓库自动绕过确认。

不建议日常使用：

```json
"permissions": {
  "defaultMode": "bypassPermissions"
}
```

除非是在完全可信、隔离、临时环境中。

---

## 12. `theme`：主题配置

```json
"theme": "dark"
```

作用：

- 控制 Claude Code 的界面主题。

常见值：

| 值 | 含义 |
|---|---|
| `auto` | 跟随系统 |
| `dark` | 深色主题 |
| `light` | 浅色主题 |
| `dark-daltonized` | 深色无障碍色彩 |
| `light-daltonized` | 浅色无障碍色彩 |
| `dark-ansi` | ANSI 风格深色主题 |
| `light-ansi` | ANSI 风格浅色主题 |

示例：

```json
"theme": "dark"
```

---

## 13. 配置检查建议

修改完配置后，建议检查以下几点。

### 13.1 检查是否泄露个人信息

不要公开：

- 真实 `ANTHROPIC_AUTH_TOKEN`
- 真实 API Key
- 私有网关地址
- 公司内部 API endpoint
- SSH 私钥
- `.env`
- 任何密码或凭据

---

### 13.2 检查模型是否真的生效

可以在 Claude Code 中查看当前模型：

```text
/model
```

或者启动时手动指定模型：

```bash
claude --model your-model-id
```

注意：

- `/model` 可能只影响当前会话。
- 恢复旧会话时，可能继续使用旧会话保存的模型。
- `ANTHROPIC_MODEL`、`--model`、settings 中的 `model` 字段之间有优先级差异。

---

### 13.3 检查权限是否真的生效

在 Claude Code 中运行：

```text
/permissions
```

用它检查：

- 当前权限模式
- 哪些规则来自用户级配置
- 哪些规则来自项目级配置
- allow / ask / deny 是否被正确识别

---

### 13.4 第三方网关场景的额外注意

如果使用 `ANTHROPIC_BASE_URL` 指向第三方服务，要注意：

- 提示词和代码片段可能经过第三方服务。
- 不要让模型读取 `.env`、私钥、token。
- 不要在不可信项目中开启过于宽松的权限。
- 尽量使用 `permissions.deny` 保护敏感文件。
- 不要把个人配置提交到公开仓库。

---

## 14. 推荐的脱敏分享版模板

下面这份适合分享给别人作为参考，不包含具体模型和私有地址：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "",
    "ANTHROPIC_BASE_URL": "https://your-llm-gateway.example.com/anthropic",

    "ANTHROPIC_MODEL": "your-model-id[1m]",
    "CLAUDE_CODE_SUBAGENT_MODEL": "your-subagent-model-id[1m]",

    "ANTHROPIC_DEFAULT_FABLE_MODEL": "your-fable-model-id[1m]",
    "ANTHROPIC_DEFAULT_FABLE_MODEL_NAME": "your-fable-display-name",

    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "your-haiku-model-id",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME": "your-haiku-display-name",

    "ANTHROPIC_DEFAULT_OPUS_MODEL": "your-opus-model-id[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL_NAME": "your-opus-display-name",

    "ANTHROPIC_DEFAULT_SONNET_MODEL": "your-sonnet-model-id[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL_NAME": "your-sonnet-display-name",

    "DISABLE_AUTOUPDATER": "1",
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "CLAUDE_CODE_EFFORT_LEVEL": "max",
    "CLAUDE_CODE_ATTRIBUTION_HEADER": "0"
  },

  "attribution": {
    "commit": "",
    "pr": "",
    "sessionUrl": false
  },

  "enabledPlugins": {
    "plugin-name@marketplace-name": true
  },

  "extraKnownMarketplaces": {
    "marketplace-name": {
      "source": {
        "repo": "owner/repo",
        "source": "github"
      }
    }
  },

  "includeCoAuthoredBy": false,
  "includeGitInstructions": false,

  "permissions": {
    "defaultMode": "auto",
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./config/credentials.json)",
      "Read(./*.pem)",
      "Read(./*.key)",
      "Read(./id_rsa)",
      "Read(./id_ed25519)"
    ],
    "ask": [
      "Bash(git push)",
      "Bash(rm -rf *)",
      "Bash(rm -rf .*)"
    ]
  },

  "skipAutoPermissionPrompt": true,
  "theme": "dark"
}
```

---

## 15. 简短结论

这类配置主要分成几部分：

| 模块 | 作用 |
|---|---|
| `env` | 模型、认证、网关、功能开关 |
| `attribution` | Git commit / PR / session 链接署名 |
| `enabledPlugins` | 启用插件 |
| `extraKnownMarketplaces` | 注册额外插件市场 |
| `permissions` | 权限模式与操作规则 |
| `theme` | 界面主题 |
| 旧字段 / 非官方字段 | 兼容旧版本或社区发现功能，需要谨慎判断 |

如果只是个人使用，可以把模型、网关、Token 放在用户级配置。  
如果要分享给别人，应删除所有私有模型名、网关地址和 Token。  
如果开启 `auto` 或使用第三方网关，建议一定加 `permissions.deny` 保护敏感文件。

---

## 16. 省流版：带注释配置模板

> 这一节适合快速看懂配置。  
> 注意：下面使用 `jsonc` 写法添加了 `// 注释`，方便阅读。  
> 如果你的 Claude Code 配置文件严格按 JSON 解析，请不要直接复制带注释版本，需要删除所有 `// 注释` 后再使用。

```jsonc
{
  // env 用于注入 Claude Code 启动时的环境变量
  // 常用于配置 API 网关、Token、默认模型、实验功能等
  "env": {
    // 认证 Token
    // 如果使用第三方网关或 Anthropic 兼容接口，可能需要填写
    // 不要提交到 GitHub，也不要公开分享
    "ANTHROPIC_AUTH_TOKEN": "",

    // API 基础地址
    // 用于把 Claude Code 请求转发到代理、企业网关或第三方 LLM gateway
    // 如果使用官方 Anthropic 接口，通常不需要自定义
    "ANTHROPIC_BASE_URL": "https://your-llm-gateway.example.com/anthropic",

    // 主会话默认模型
    // 直接指定 Claude Code 当前会话优先使用的模型
    // 如果模型和网关支持 1M 上下文，可以使用 your-model-id[1m]
    "ANTHROPIC_MODEL": "your-model-id[1m]",

    // subagent 使用的模型
    // 会覆盖子代理自身定义里的模型设置
    // 如果想让子代理继承主模型，可以设置为 inherit
    "CLAUDE_CODE_SUBAGENT_MODEL": "your-subagent-model-id[1m]",

    // Fable 模型别名对应的实际模型
    // 用于把 Claude Code 内部的 fable 别名映射到指定模型
    "ANTHROPIC_DEFAULT_FABLE_MODEL": "your-fable-model-id[1m]",

    // Fable 模型在模型选择器里的显示名称
    // 只影响显示，不一定影响实际调用的模型
    "ANTHROPIC_DEFAULT_FABLE_MODEL_NAME": "your-fable-display-name",

    // Haiku 模型别名对应的实际模型
    // 一般用于快速、轻量、小任务
    // 通常不建议强行写成 [1m]
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "your-haiku-model-id",

    // Haiku 模型显示名称
    "ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME": "your-haiku-display-name",

    // Opus 模型别名对应的实际模型
    // 通常用于高能力、复杂任务模型
    // 如果模型和网关支持，可以添加 [1m]
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "your-opus-model-id[1m]",

    // Opus 模型显示名称
    "ANTHROPIC_DEFAULT_OPUS_MODEL_NAME": "your-opus-display-name",

    // Sonnet 模型别名对应的实际模型
    // 通常是 Claude Code 的日常主力模型别名
    // 如果模型和网关支持，可以添加 [1m]
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "your-sonnet-model-id[1m]",

    // Sonnet 模型显示名称
    "ANTHROPIC_DEFAULT_SONNET_MODEL_NAME": "your-sonnet-display-name",

    // 禁用自动更新
    // 适合想固定 Claude Code 版本、不希望自动升级导致行为变化的场景
    "DISABLE_AUTOUPDATER": "1",

    // 开启实验性 agent teams
    // experimental 功能可能随版本变化，稳定性不如正式功能
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",

    // 推理努力等级
    // 常见值可能包括 low、medium、high、xhigh、max、auto
    // 是否真正生效取决于模型和后端网关支持情况
    "CLAUDE_CODE_EFFORT_LEVEL": "max",

    // 关闭 Claude Code attribution header
    // 这和 Git commit / PR 署名不是同一个东西
    // 在 LLM gateway 场景下可能有助于减少额外提示词头部内容
    "CLAUDE_CODE_ATTRIBUTION_HEADER": "0"
  },

  // attribution 控制 Git commit、PR 描述、session 链接中的署名信息
  "attribution": {
    // commit 署名
    // 空字符串表示不在 commit message 中追加自动署名
    "commit": "",

    // PR 署名
    // 空字符串表示不在 Pull Request 描述中追加自动署名
    "pr": "",

    // 是否附加 Claude Code session 链接
    // false 表示不附加
    "sessionUrl": false
  },

  // 启用插件
  // 格式通常是 plugin-name@marketplace-name
  "enabledPlugins": {
    // true 表示启用，false 表示禁用
    "plugin-name@marketplace-name": true
  },

  // 注册额外插件市场
  // 注意：这里只是让 Claude Code 知道这个 marketplace
  // 具体插件仍需要在 enabledPlugins 中单独启用
  "extraKnownMarketplaces": {
    "marketplace-name": {
      "source": {
        // 插件市场所在的 GitHub 仓库
        "repo": "owner/repo",

        // 来源类型
        "source": "github"
      }
    }
  },

  // 旧版共同作者署名开关
  // 当前更推荐使用 attribution 字段统一控制
  // attribution 通常优先级更高
  "includeCoAuthoredBy": false,

  // Git 指令注入开关
  // 当前官方文档中不一定能查到该字段
  // 可能来自旧版本、内部字段、社区配置或特定分发版
  "includeGitInstructions": false,

  // 权限配置
  // 控制 Claude Code 哪些操作可以自动执行、哪些需要确认、哪些禁止
  "permissions": {
    // 默认权限模式
    // default：较保守
    // acceptEdits：自动接受文件编辑
    // plan：偏计划/分析
    // auto：自动化程度更高，减少确认
    // dontAsk：只允许预批准工具
    // bypassPermissions：绕过权限确认，风险最高
    "defaultMode": "auto",

    // 明确禁止读取敏感文件
    // 使用第三方网关或 auto 模式时强烈建议添加
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./config/credentials.json)",
      "Read(./*.pem)",
      "Read(./*.key)",
      "Read(./id_rsa)",
      "Read(./id_ed25519)"
    ],

    // 对高风险命令保留确认
    // 不想完全禁止，但希望执行前让用户确认
    "ask": [
      "Bash(git push)",
      "Bash(rm -rf *)",
      "Bash(rm -rf .*)"
    ]
  },

  // 可能用于跳过 auto mode 的首次提示或 opt-in 弹窗
  // 当前官方 settings 文档中不一定能查到
  // 更像内部字段、旧版字段或社区发现字段
  // 不等价于 bypassPermissions，也不代表跳过所有权限确认
  "skipAutoPermissionPrompt": true,

  // 跳过 bypassPermissions 危险模式确认
  // 这是官方文档中更明确的字段
  // 只有使用 bypassPermissions 时才相关，日常 auto 模式不是必须
  // 风险较高，不建议随便开启
  // "skipDangerousModePermissionPrompt": true,

  // 界面主题
  // 常见值：auto、dark、light、dark-daltonized、light-daltonized、dark-ansi、light-ansi
  "theme": "dark"
}
```

### 16.1 可直接使用的无注释版模板

如果你的配置文件必须是严格 JSON，可以使用下面这个无注释版本：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "",
    "ANTHROPIC_BASE_URL": "https://your-llm-gateway.example.com/anthropic",
    "ANTHROPIC_MODEL": "your-model-id[1m]",
    "CLAUDE_CODE_SUBAGENT_MODEL": "your-subagent-model-id[1m]",
    "ANTHROPIC_DEFAULT_FABLE_MODEL": "your-fable-model-id[1m]",
    "ANTHROPIC_DEFAULT_FABLE_MODEL_NAME": "your-fable-display-name",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "your-haiku-model-id",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME": "your-haiku-display-name",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "your-opus-model-id[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL_NAME": "your-opus-display-name",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "your-sonnet-model-id[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL_NAME": "your-sonnet-display-name",
    "DISABLE_AUTOUPDATER": "1",
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "CLAUDE_CODE_EFFORT_LEVEL": "max",
    "CLAUDE_CODE_ATTRIBUTION_HEADER": "0"
  },
  "attribution": {
    "commit": "",
    "pr": "",
    "sessionUrl": false
  },
  "enabledPlugins": {
    "plugin-name@marketplace-name": true
  },
  "extraKnownMarketplaces": {
    "marketplace-name": {
      "source": {
        "repo": "owner/repo",
        "source": "github"
      }
    }
  },
  "includeCoAuthoredBy": false,
  "includeGitInstructions": false,
  "permissions": {
    "defaultMode": "auto",
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./config/credentials.json)",
      "Read(./*.pem)",
      "Read(./*.key)",
      "Read(./id_rsa)",
      "Read(./id_ed25519)"
    ],
    "ask": [
      "Bash(git push)",
      "Bash(rm -rf *)",
      "Bash(rm -rf .*)"
    ]
  },
  "skipAutoPermissionPrompt": true,
  "theme": "dark"
}
```

### 16.2 可复用的通用配置模块

```json
{
  "env": {
    "DISABLE_AUTOUPDATER": "1",
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "CLAUDE_CODE_EFFORT_LEVEL": "max",
    "CLAUDE_CODE_ATTRIBUTION_HEADER": "0"
  },
  "attribution": {
    "commit": "",
    "pr": "",
    "sessionUrl": false
  },
  "enabledPlugins": {
    "codex@openai-codex": true,
    "superpowers@claude-plugins-official": true
  },
  "extraKnownMarketplaces": {
    "openai-codex": {
      "source": {
        "repo": "openai/codex-plugin-cc",
        "source": "github"
      }
    }
  },
  "includeCoAuthoredBy": false,
  "includeGitInstructions": false,
  "permissions": {
    "defaultMode": "auto"
  },
  "skipAutoPermissionPrompt": true,
  "theme": "dark"
}
```

---
title: Codex Windows Computer Use 插件不可用修复记录
published: 2026-06-29
description: 记录 Windows 下 Codex 的 Computer Use 插件不可用问题的排查与修复过程。
image: ""
tags: [Codex, Windows, 排错, AI Agent]
category: AI日常
draft: false
slug: codex-windows-computer-use-fix
---

> 记录时间：2026-06-18  
> 场景：Windows / Microsoft Store 版 Codex Desktop 更新后，Computer Use（电脑操控）插件不可用。  
> 结论：这类问题很可能在后续 Store 更新后复发；优先按“marketplace → EFS 加密 → config 注册 → @oai/sky exports”四层排查。

---

## 1. 本次现象

Windows 版 Codex Desktop 中，@电脑 / Computer Use 无法使用。本次排查中出现过这些典型症状：

- 设置页显示 Computer Use unavailable。
- 插件市场中找不到或无法加载 computer-use@openai-bundled。
- 用户目录下只有残缺的 openai-bundled.staging-*。
- marketplace.json 缺失。
- 复制插件资源时出现“无法加密指定的文件”。
- 新线程调用 @电脑 时出现 Node ESM exports 报错：

```text
Package subpath './dist/project/cua/sky_js/src/targets/windows/internal/computer_use_client_base.js'
is not defined by "exports" ... @oai/sky/package.json
```

最终修好后，新线程 @电脑 测试成功。

---

## 2. 根因分层

### 2.1 bundled marketplace 半更新

正常情况下，Codex 安装包内应存在完整的 bundled 插件源：

```text
C:\Program Files\WindowsApps\OpenAI.Codex_*\app\resources\plugins\openai-bundled
```

其中至少应该有：

```text
.agents\plugins\marketplace.json
plugins\computer-use\.codex-plugin\plugin.json
plugins\chrome\.codex-plugin\plugin.json
plugins\browser\.codex-plugin\plugin.json
```

但用户目录中实际可能只剩残缺 staging：

```text
%USERPROFILE%\.codex\.tmp\bundled-marketplaces\openai-bundled.staging-*
```

本次现场里，这些 staging 目录存在，但 FileCount = 0，没有 marketplace.json，也没有 computer-use 的 plugin.json。

### 2.2 WindowsApps 源文件带 EFS / Application Protected 属性

从 Store 安装目录复制 openai-bundled 时，源文件可能带有加密或受保护属性。直接用 Copy-Item 复制会触发：

```text
无法加密指定的文件。
```

本次经验是：

1. 先用 xcopy /G 从 WindowsApps 复制。
2. 再用 cipher /d /s 对目标目录递归解密。
3. 用 cipher /c 确认关键文件显示 U，而不是 E。

### 2.3 config.toml 未注册 openai-bundled

即使文件复制回来了，用户目录下的 config.toml 中仍可能缺少 openai-bundled marketplace 和插件启用项。

需要确保包含：

```toml
[marketplaces.openai-bundled]
source_type = "local"
source = '\\?\C:\Users\用户名\.codex\.tmp\bundled-marketplaces\openai-bundled'

[plugins."browser@openai-bundled"]
enabled = true

[plugins."chrome@openai-bundled"]
enabled = true

[plugins."computer-use@openai-bundled"]
enabled = true
```

### 2.4 @oai/sky package exports 不匹配

本次最终卡点是 computer-use 插件脚本会 import：

```js
@oai/sky/dist/project/cua/sky_js/src/targets/windows/internal/computer_use_client_base.js
```

但 runtime 中的 @oai/sky/package.json 原本只导出包根入口：

```json
"exports": {
  ".": "./dist/project/cua/sky_js/src/index.js"
}
```

需要额外补上：

```json
"./dist/project/cua/sky_js/src/targets/windows/internal/computer_use_client_base.js": "./dist/project/cua/sky_js/src/targets/windows/internal/computer_use_client_base.js"
```

---

## 3. 快速判断是否复发

Codex 更新后，先新开线程测试：

```text
@电脑 打开记事本，输入“computer-use 测试成功”，不要做别的。
```

如果失败，先跑这些检查：

```powershell
$CodexHome = Join-Path $env:USERPROFILE ".codex"
Test-Path (Join-Path $CodexHome ".tmp\bundled-marketplaces\openai-bundled\.agents\plugins\marketplace.json")
Test-Path (Join-Path $CodexHome "plugins\cache\openai-bundled\computer-use")
Select-String -LiteralPath (Join-Path $CodexHome "config.toml") -Pattern "openai-bundled|computer-use@openai-bundled"
```

检查 @oai/sky exports：

```powershell
$SkyPackage = Get-ChildItem -LiteralPath (Join-Path $env:LOCALAPPDATA "OpenAI\Codex\runtimes\cua_node") -Recurse -Force -Filter package.json | Where-Object { $_.FullName -like "*\node_modules\@oai\sky\package.json" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Get-Content -LiteralPath $SkyPackage.FullName -Raw | Select-String -Pattern "computer_use_client_base"
```

---

## 4. 一键修复脚本

使用方式：

1. 先完整退出 Codex Desktop。
2. 打开 PowerShell 7。
3. 粘贴运行下面脚本。
4. 重开 Codex，新线程测试 @电脑。

脚本会写入用户目录下的 Codex 配置和 runtime package.json，运行前会自动备份。

```powershell
$ErrorActionPreference = "Stop"

$CodexHome = Join-Path $env:USERPROFILE ".codex"
$BackupRoot = Join-Path $env:USERPROFILE "codex-plugin-backups"
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupDir = Join-Path $BackupRoot "computer-use-full-repair-$Stamp"
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$CodexProcesses = Get-Process Codex -ErrorAction SilentlyContinue
if ($CodexProcesses) {
  throw "检测到 Codex 仍在运行。请先完整退出 Codex Desktop，再重新运行脚本。"
}

Get-Process extension-host,codex-computer-use -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

$Config = Join-Path $CodexHome "config.toml"
if (Test-Path -LiteralPath $Config) {
  Copy-Item -LiteralPath $Config -Destination (Join-Path $BackupDir "config.toml") -Force
}

$GlobalState = Join-Path $CodexHome ".codex-global-state.json"
if (Test-Path -LiteralPath $GlobalState) {
  Copy-Item -LiteralPath $GlobalState -Destination (Join-Path $BackupDir ".codex-global-state.json") -Force
}

$Pkg = Get-AppxPackage -Name OpenAI.Codex | Sort-Object Version -Descending | Select-Object -First 1
if (-not $Pkg) {
  throw "未找到 OpenAI.Codex AppX 包。"
}

$Source = Join-Path $Pkg.InstallLocation "app\resources\plugins\openai-bundled"
$SourceMarketplace = Join-Path $Source ".agents\plugins\marketplace.json"
if (-not (Test-Path -LiteralPath $SourceMarketplace)) {
  throw "安装包内 openai-bundled 不完整：$SourceMarketplace 不存在。"
}

$TmpParent = Join-Path $CodexHome ".tmp\bundled-marketplaces"
$Target = Join-Path $TmpParent "openai-bundled"
New-Item -ItemType Directory -Force -Path $TmpParent | Out-Null

Get-ChildItem -LiteralPath $TmpParent -Directory -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "openai-bundled*" } | ForEach-Object {
  Move-Item -LiteralPath $_.FullName -Destination (Join-Path $BackupDir $_.Name) -Force
}

$XcopyCommand = 'xcopy "{0}" "{1}\" /E /I /H /Y /G' -f $Source, $Target
& cmd.exe /d /c $XcopyCommand
if ($LASTEXITCODE -gt 1) {
  throw "xcopy 失败，退出码：$LASTEXITCODE"
}

cipher /d /s:"$Target" | Out-Host

$Required = @(
  ".agents\plugins\marketplace.json",
  "plugins\computer-use\.codex-plugin\plugin.json",
  "plugins\chrome\.codex-plugin\plugin.json",
  "plugins\browser\.codex-plugin\plugin.json"
)

foreach ($rel in $Required) {
  $p = Join-Path $Target $rel
  if (-not (Test-Path -LiteralPath $p)) {
    throw "修复后仍缺文件：$p"
  }
  $attrs = (Get-Item -LiteralPath $p).Attributes.ToString()
  if ($attrs -like "*Encrypted*") {
    throw "文件仍然带 Encrypted 属性：$p"
  }
}

if (-not (Test-Path -LiteralPath $Config)) {
  New-Item -ItemType File -Force -Path $Config | Out-Null
}

$ConfigText = Get-Content -LiteralPath $Config -Raw
$NL = [Environment]::NewLine

$MarketplaceBlock = @"

[marketplaces.openai-bundled]
last_updated = "$(Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")"
source_type = "local"
source = '\\?\$Target'
"@

if ($ConfigText -notmatch '(?m)^\[marketplaces\.openai-bundled\]') {
  if ($ConfigText -match '(?m)^\[plugins\]') {
    $ConfigText = $ConfigText -replace '(?m)^\[plugins\]', ($MarketplaceBlock + $NL + $NL + "[plugins]")
  } else {
    $ConfigText += $NL + $MarketplaceBlock + $NL + $NL + "[plugins]" + $NL
  }
}

$PluginBlocks = @(
  '[plugins."browser@openai-bundled"]' + $NL + 'enabled = true' + $NL,
  '[plugins."chrome@openai-bundled"]' + $NL + 'enabled = true' + $NL,
  '[plugins."computer-use@openai-bundled"]' + $NL + 'enabled = true' + $NL
)

foreach ($block in $PluginBlocks) {
  $header = ($block -split [Environment]::NewLine)[0]
  $escaped = [regex]::Escape($header)
  if ($ConfigText -notmatch "(?m)^$escaped$") {
    if ($ConfigText -match '(?m)^\[plugins\]') {
      $ConfigText = $ConfigText -replace '(?m)^\[plugins\]', ("[plugins]" + $NL + $block)
    } else {
      $ConfigText += $NL + "[plugins]" + $NL + $block
    }
  }
}

Set-Content -LiteralPath $Config -Value $ConfigText -Encoding UTF8

$SkyPackage = Get-ChildItem -LiteralPath (Join-Path $env:LOCALAPPDATA "OpenAI\Codex\runtimes\cua_node") -Recurse -Force -Filter package.json -ErrorAction SilentlyContinue | Where-Object { $_.FullName -like "*\bin\node_modules\@oai\sky\package.json" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $SkyPackage) {
  throw "未找到 @oai/sky/package.json。"
}

Copy-Item -LiteralPath $SkyPackage.FullName -Destination (Join-Path $BackupDir "sky-package.json") -Force

$SkyJson = Get-Content -LiteralPath $SkyPackage.FullName -Raw | ConvertFrom-Json
$NeededExportKey = "./dist/project/cua/sky_js/src/targets/windows/internal/computer_use_client_base.js"
$NeededExportValue = "./dist/project/cua/sky_js/src/targets/windows/internal/computer_use_client_base.js"

if ($SkyJson.exports -is [string]) {
  $rootExport = $SkyJson.exports
  $SkyJson.exports = [ordered]@{
    "." = $rootExport
  }
}

if (-not $SkyJson.exports.PSObject.Properties[$NeededExportKey]) {
  $SkyJson.exports | Add-Member -NotePropertyName $NeededExportKey -NotePropertyValue $NeededExportValue
}

$SkyJson | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $SkyPackage.FullName -Encoding UTF8

$SkyRoot = Split-Path -Parent $SkyPackage.FullName
$Bin = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $SkyRoot))

Push-Location $Bin
try {
  node --input-type=module -e "import('@oai/sky/dist/project/cua/sky_js/src/targets/windows/internal/computer_use_client_base.js').then(m=>console.log(Object.keys(m).join(','))).catch(e=>{console.error(e); process.exit(1)})"
} finally {
  Pop-Location
}

"修复完成。备份目录：$BackupDir"
"请重新打开 Codex Desktop，然后新线程测试：@电脑 打开记事本，输入 computer-use 测试成功"
```

---

## 5. 手动验证清单

### 5.1 marketplace 文件存在

```powershell
$Target = Join-Path $env:USERPROFILE ".codex\.tmp\bundled-marketplaces\openai-bundled"
Test-Path (Join-Path $Target ".agents\plugins\marketplace.json")
Test-Path (Join-Path $Target "plugins\computer-use\.codex-plugin\plugin.json")
Test-Path (Join-Path $Target "plugins\chrome\.codex-plugin\plugin.json")
Test-Path (Join-Path $Target "plugins\browser\.codex-plugin\plugin.json")
```

### 5.2 文件没有 EFS 加密

```powershell
cipher /c "$env:USERPROFILE\.codex\.tmp\bundled-marketplaces\openai-bundled\.agents\plugins\marketplace.json"
```

期望看到 U marketplace.json，而不是 E marketplace.json。

### 5.3 config 已注册 openai-bundled

```powershell
Select-String -LiteralPath "$env:USERPROFILE\.codex\config.toml" -Pattern "openai-bundled|computer-use@openai-bundled|chrome@openai-bundled|browser@openai-bundled"
```

### 5.4 @oai/sky exports 已修复

```powershell
$SkyPackage = Get-ChildItem -LiteralPath (Join-Path $env:LOCALAPPDATA "OpenAI\Codex\runtimes\cua_node") -Recurse -Force -Filter package.json | Where-Object { $_.FullName -like "*\bin\node_modules\@oai\sky\package.json" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Get-Content -LiteralPath $SkyPackage.FullName -Raw | Select-String -Pattern "computer_use_client_base"
```

---

## 6. 2026-06-29 二次复发记录

### 6.1 现象

Microsoft Store 将 Codex 更新到：

```text
OpenAI.Codex_26.623.5546.0_x64__2p2nqsd0c76g0
```

更新后，Computer Use 再次不可用。新线程测试失败，但这次不是上次的 @oai/sky exports 问题复发。

### 6.2 本次确认的差异

本次排查到的新状态：

- Store 源包中的 computer-use 已更新到 26.623.42026；
- 用户侧 openai-bundled bundle 仍停在旧版本 26.611.62324；
- 用户侧 plugins cache 也仍停在旧版本 26.611.62324；
- config.toml 里的 openai-bundled marketplace 注册被移除；
- browser@openai-bundled、chrome@openai-bundled、computer-use@openai-bundled 三个插件启用项也被移除；
- @oai/sky/package.json 中上次补过的 computer_use_client_base.js exports 仍然存在，没有被覆盖。

也就是说，这次复发的根因链路是：

```text
Microsoft Store 更新 Codex
→ 新 WindowsApps 源包版本变为 26.623.42026
→ 用户侧 materialized bundle / cache 仍是 26.611.62324
→ config.toml 中 openai-bundled 注册丢失
→ 新线程无法加载 computer-use@openai-bundled
```

### 6.3 本次有效修复

本次没有重装 Codex，而是按层修复：

1. 备份当前 config.toml、旧用户侧 openai-bundled、旧 cache；
2. 从新 Store 源包重新复制 openai-bundled；
3. 复制后执行 cipher /d 递归解密，避免 EFS 属性遗留；
4. 在 config.toml 中重新补回 openai-bundled marketplace；
5. 在 config.toml 中重新启用 browser、chrome、computer-use 三个 bundled 插件；
6. 预热 plugins\cache\openai-bundled，确保 cache 中也有 26.623.42026；
7. 验证 @oai/sky 深层导入仍可用；
8. 重启或新线程测试 @电脑，用户确认测试通过。

本次备份目录：

```text
C:\Users\Kagamihara Nadeshiko\codex-plugin-backups\computer-use-after-store-update-20260629-011006
```

### 6.4 本次验证结果

修复后确认：

- source / user bundle / cache 三处 computer-use 版本均为 26.623.42026；
- .agents\plugins\marketplace.json 为 Archive，不再带 Encrypted；
- config.toml 可被 tomllib 正常解析；
- marketplaces 中包含 openai-bundled；
- plugins 中包含 browser@openai-bundled、chrome@openai-bundled、computer-use@openai-bundled；
- @oai/sky 根导入返回 sky；
- @oai/sky 深层导入返回 WindowsComputerUseClientBase；
- codex-computer-use.exe 存在；
- 新线程 @电脑 测试通过。

### 6.5 这次新增的判断规则

如果 Microsoft Store 更新后再次失效，不要只看 @oai/sky exports。先做版本对照：

```powershell
$SourceManifest = "C:\Program Files\WindowsApps\OpenAI.Codex_*\app\resources\plugins\openai-bundled\plugins\computer-use\.codex-plugin\plugin.json"
$UserManifest = "$env:USERPROFILE\.codex\.tmp\bundled-marketplaces\openai-bundled\plugins\computer-use\.codex-plugin\plugin.json"
$CacheRoot = "$env:USERPROFILE\.codex\plugins\cache\openai-bundled\computer-use"
```

重点看三处是否一致：

```text
WindowsApps 源包版本
用户侧 .codex\.tmp\bundled-marketplaces\openai-bundled 版本
用户侧 .codex\plugins\cache\openai-bundled 版本
```

如果源包版本更新了，但用户侧 bundle/cache 仍是旧版本，同时 config.toml 里找不到 openai-bundled，那么优先按本节方案处理。

---

## 7. 更新后的复发判断

因为 Windows 版 Codex 通过 Microsoft Store 更新，后续更新可能覆盖：

```text
%LOCALAPPDATA%\OpenAI\Codex\runtimes\cua_node\...\bin\node_modules\@oai\sky\package.json
```

也可能重建：

```text
%USERPROFILE%\.codex\.tmp\bundled-marketplaces\openai-bundled
%USERPROFILE%\.codex\plugins\cache\openai-bundled
```

因此后续如果复发，优先怀疑这三处：

1. openai-bundled marketplace 被半更新；
2. 从 WindowsApps 复制出的文件带 EFS 加密；
3. config.toml 中 openai-bundled marketplace / plugin 启用项被移除；
4. 用户侧 openai-bundled bundle / cache 仍停在旧版本；
5. @oai/sky/package.json 的 exports 补丁被更新覆盖。

最短处理策略：

1. 先重跑本文“一键修复脚本”；
2. 完整退出并重启 Codex；
3. 新线程测试 @电脑；
4. 若仍失败，贴出新报错，继续按错误层排查。

---

## 8. 本次有效修复点摘要

本次真正生效的修复链路是：

```text
重建 openai-bundled marketplace
→ 递归解密复制出的 EFS 文件
→ 在 config.toml 注册 openai-bundled 和插件启用项
→ 确认或预热 plugins\cache\openai-bundled
→ 按需修复 @oai/sky package.json exports
→ 重启 Codex
→ 新线程 @电脑 测试成功
```

关键不是盲目重装 Codex，而是把每一层都验证到：

- 文件存在；
- 文件未加密；
- 配置已注册；
- cache 已生成；
- Node import 能通过；
- 新线程实际能调用 @电脑。

---

## 9. 相关链接

- 原始参考文章：[Windows 使用 Codex 出现「computer-use 插件不可用」的解决方法（已验证）](https://blog.csdn.net/weixin_41961749/article/details/161627902)

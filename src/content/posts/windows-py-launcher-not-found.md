---
title: Windows 下 `py` 找不到 Python 的排查与修复
published: 2026-07-10
description: Windows 下 `py` 命令找不到 Python 时的排查思路与修复方法。
image: ""
tags: [Python, Windows, 排错]
category: Python
draft: false
slug: windows-py-launcher-not-found
---

# Windows 下 `py` 找不到 Python 的排查与修复

## 1. 问题现象

在 Windows / PowerShell 中执行 `python` 可以正常进入 Python：

```text
Python 3.13.6 ...
```

但执行：

```powershell
py -3.13
```

却报错：

```text
Python 3.13 not found!
Installed Pythons found by C:\Windows\py.exe Launcher for Windows
No Installed Pythons Found!

Requested Python version (3.13) not installed, use -0 for available pythons
```

这说明：

- `python.exe` 本身可以运行
- 环境变量 PATH 可能是正常的
- 但 Windows Python Launcher（`py.exe`）没有识别到当前 Python

## 2. 问题原因

`py.exe` 不完全依赖 PATH，它主要通过 Windows 注册表识别 Python 安装信息，常见路径为：

```text
HKCU\Software\Python\PythonCore\版本号\InstallPath
```

例如 Python 3.13：

```text
HKCU\Software\Python\PythonCore\3.13\InstallPath
```

本次问题的关键是 PowerShell 字符串拼接错误。原脚本中写了：

```powershell
"$pyRootpython.exe"
```

PowerShell 会把它理解为变量 `$pyRootpython`，而不是 `$pyRoot + "python.exe"`。由于 `$pyRootpython` 不存在，写入注册表的值变成了 `.exe`，因此注册表检查结果出现了：

```text
ExecutablePath : .exe
```

这导致 `py.exe` 无法找到真正的 Python 解释器。

## 3. 快速判断方法

### 3.1 检查 `python` 是否能运行

```powershell
python --version
```

如果能输出版本号（如 `Python 3.13.6`），说明 Python 本体基本正常。

### 3.2 检查 `py` 是否能识别 Python

```powershell
py -0p
```

或者：

```powershell
py --list-paths
```

如果输出 `No Installed Pythons Found!`，说明 `py.exe` 没有识别到 Python 注册信息。

### 3.3 检查注册表内容

```powershell
Get-ItemProperty "HKCU:\Software\Python\PythonCore\3.13\InstallPath"
```

正常结果应该类似：

```text
(default)      : E:\Dev\Runtimes\Python313\
ExecutablePath : E:\Dev\Runtimes\Python313\python.exe
```

异常结果可能是：

```text
(default)      : E:\Dev\Runtimes\Python313\
ExecutablePath : .exe
```

如果 `ExecutablePath` 是 `.exe`，就说明 Python 路径写坏了。

## 4. 修复方法

### 方法一：直接修复 `ExecutablePath`

适合已经确认 Python 路径正确，只是注册表中的 `ExecutablePath` 错误的情况。

```powershell
$regPath = "HKCU:\Software\Python\PythonCore\3.13\InstallPath"

Set-ItemProperty `
    -Path $regPath `
    -Name "ExecutablePath" `
    -Value "E:\Dev\Runtimes\Python313\python.exe"
```

然后重新测试：

```powershell
py -0p
py -3.13 --version
```

预期结果：

```text
 -V:3.13 * E:\Dev\Runtimes\Python313\python.exe
Python 3.13.6
```

### 方法二：使用完整修正版注册脚本

推荐使用这个版本，避免字符串拼接错误。

```powershell
# Python 根目录，末尾可以带 \
$pyRoot = "E:\Dev\Runtimes\Python313\"
$verShort = "3.13"

# 拼接 python.exe 路径
$pythonExe = Join-Path $pyRoot "python.exe"

# 注册表路径
$regPath = "HKCU:\Software\Python\PythonCore\$verShort\InstallPath"

# 检查 Python 是否存在
if (-not (Test-Path $pythonExe)) {
    throw "未找到 Python：$pythonExe"
}

# 创建注册表项
New-Item -Path $regPath -Force | Out-Null

# 写入 Python 安装目录
Set-ItemProperty `
    -Path $regPath `
    -Name "(Default)" `
    -Value $pyRoot

# 写入 Python 可执行文件路径
Set-ItemProperty `
    -Path $regPath `
    -Name "ExecutablePath" `
    -Value $pythonExe

Write-Host "注册完成：$pythonExe"
```

## 5. PowerShell 字符串拼接注意事项

### 错误写法

```powershell
"$pyRootpython.exe"
```

这会被 PowerShell 理解为变量 `$pyRootpython`，也就是查找一个名为 `$pyRootpython` 的变量。

### 正确写法一：使用 `${}` 明确变量边界

```powershell
"${pyRoot}python.exe"
```

### 正确写法二：使用 `Join-Path`

更推荐这种写法，尤其适合路径拼接。

```powershell
Join-Path $pyRoot "python.exe"
```

## 6. PowerShell 中查找命令路径

在 PowerShell 中不要直接使用：

```powershell
where py
```

因为 `where` 在 PowerShell 中通常是 `Where-Object` 的别名。应该使用：

```powershell
where.exe py
```

或者：

```powershell
Get-Command py
```

例如 `Get-Command py` 可能输出：

```text
CommandType     Name    Version    Source
-----------     ----    -------    ------
Application     py.exe             C:\Windows\py.exe
```

## 7. 推荐排查流程

当遇到 `python` 能用、但 `py` 找不到 Python 时，按下面顺序排查：

### 第一步：确认 Python 本体是否正常

```powershell
python --version
```

如果正常输出版本号，说明 Python 本体可用。

### 第二步：确认 `py.exe` 是否存在

```powershell
Get-Command py
```

或者：

```powershell
where.exe py
```

如果能找到 `C:\Windows\py.exe`，说明 Python Launcher 存在。

### 第三步：查看 `py.exe` 识别结果

```powershell
py -0p
```

如果显示 `No Installed Pythons Found!`，说明 Launcher 没有读到有效的 Python 注册信息。

### 第四步：检查注册表

```powershell
Get-ItemProperty "HKCU:\Software\Python\PythonCore\3.13\InstallPath"
```

重点检查 `ExecutablePath` 是否为真实存在的 `python.exe` 路径：

```text
# 正确示例
ExecutablePath : E:\Dev\Runtimes\Python313\python.exe

# 错误示例
ExecutablePath : .exe
```

### 第五步：修复注册表

```powershell
Set-ItemProperty `
    -Path "HKCU:\Software\Python\PythonCore\3.13\InstallPath" `
    -Name "ExecutablePath" `
    -Value "E:\Dev\Runtimes\Python313\python.exe"
```

### 第六步：重新测试

```powershell
py -0p
py -3.13 --version
```

如果能看到 Python 路径和版本号，说明修复完成。

## 8. 常见误判

### 误判一：认为 Python 没装好

如果 `python --version` 正常，说明 Python 本体通常没问题。

### 误判二：认为 PATH 有问题

`python` 能运行，说明 PATH 至少可以找到某个 Python。但 `py.exe` 不主要依赖 PATH，所以 PATH 正常不代表 `py` 一定正常。

### 误判三：认为 Python Launcher 太旧

如果注册表中 `ExecutablePath` 明显是 `.exe`，优先修复注册表路径，不要先怀疑 Launcher 版本。

## 9. 最终结论

本次问题的根因是 PowerShell 变量拼接错误：

```powershell
"$pyRootpython.exe"
```

导致注册表中的 `ExecutablePath` 被错误写入为 `.exe`。正确做法是使用：

```powershell
"${pyRoot}python.exe"
```

或者更推荐：

```powershell
Join-Path $pyRoot "python.exe"
```

修复后，`py -3.13` 即可正常识别 Python 3.13。

---
title: "windows 系统延长系统更新时间"
published: 2026-05-12
description: "通过注册表 FlightSettingsMaxPauseDays 延长 Windows 系统更新暂停天数的方法。"
image: ""
tags: [Windows, 系统更新, 注册表, 技巧]
category: "Windows"
draft: false
slug: "windows-extend-update-period"
---

1. 启动注册表编辑器进入以下路径  
2. 计算机\HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings
3. 新建一个DWORD(32)位的值
4. 重命名值的ID：FlightSettingsMaxPauseDays
5. 双击编辑十进制编辑值(个人设置2940，最好不要超过3000)

---

### 或者直接将以下内容复制粘贴到txt中后修改后缀为.reg管理器权限运行

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings]
"FlightSettingsMaxPauseDays"=dword:00000B7C

```

### 也可以直接复制以下命令在powershell中执行

```powershell
reg add "HKLM\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings" /v FlightSettingsMaxPauseDays /t REG_DWORD /d 2940 /f
```

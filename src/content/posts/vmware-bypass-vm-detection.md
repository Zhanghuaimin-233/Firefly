---
title: "VMware 绕过虚拟机检测（学习通客户端可过）"
published: 2026-05-08
description: "通过在 .vmx 配置文件中添加 monitor_control.restrict_backdoor 等参数，绕过虚拟机检测的方法。"
image: ""
tags: [VMware, 虚拟机, 排错]
category: "虚拟机"
draft: false
slug: "vmware-bypass-vm-detection"
---

在vm配置文件（一般是`.vmx`文件）中添加

`monitor_control.restrict_backdoor = TRUE`

保存文件    

如果还被检测可以再加入一行  

`disable_acceleration = TRUE`

***

>弊端：可能无法使用`vm tools`







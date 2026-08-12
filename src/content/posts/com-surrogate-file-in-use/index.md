---
title: "如何解决“操作无法完成，因为文件已经在 COM Surrogate 中打开。”？"
published: 2026-06-25
description: "文件被 COM Surrogate 占用无法删除时，通过缩略图设置与资源监视器结束关联进程的解决办法。"
image: "./images/file-20260625171739512.png"
tags: [Windows, COM Surrogate, 文件占用, 排错]
category: Windows 杂谈
draft: false
slug: "com-surrogate-file-in-use"
---


1、首先打开文件资源管理器，点击顶部的查看——选项，在“查看”标签下，点击“显示缩略图，而不是显示图标”。再进行操作，不行在任务管理器里找到[COM Surrogate](https://zhida.zhihu.com/search?content_id=31598750&content_type=Answer&match_order=1&q=COM+Surrogate&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3ODI1NTE1ODMsInEiOiJDT00gU3Vycm9nYXRlIiwiemhpZGFfc291cmNlIjoiZW50aXR5IiwiY29udGVudF9pZCI6MzE1OTg3NTAsImNvbnRlbnRfdHlwZSI6IkFuc3dlciIsIm1hdGNoX29yZGVyIjoxLCJ6ZF90b2tlbiI6bnVsbH0.0Zexo0CJtiTuNbPvWRrwqF8II5mbFFAc6l2f3KEhx9k&zhida_source=entity) 进程，右键点击结束任务。或者试试下个方法。

2、右击开始菜单，点击“任务管理器”。点击“性能”标签最下方的“打开资源监视器”；在“CPU”标签下的“关联的句柄”栏输入该文件或文件夹的名称。比如，我要删除的文件夹叫“20150530”。待搜索出结果后逐个右击关联的进程，并选择结束进程。待所有的关联进程都结束完毕后（右击搜索出的进程，此时“结束进程”是灰色的），再对文件或文件夹进行操作就行了。

其中方法2对其他占用程序也生效
  
![697](./images/file-20260625171739512.png)![](./images/file-20260625171807634.png)
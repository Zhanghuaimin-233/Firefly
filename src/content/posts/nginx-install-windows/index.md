---
title: Windows 下 Nginx 安装与简单使用详解
published: 2023-03-22
description: Windows 下 Nginx 的下载、安装、目录结构与基础使用（反向代理、静态服务）详解。
image: "./images/0_1.png"
tags: [Nginx, Windows, 安装教程, Web服务器]
category: 环境搭建
draft: false
slug: nginx-install-windows
author: "来一份辣子鸡丁"
sourceLink: "https://blog.csdn.net/weixin_44251179/article/details/129700793"
licenseName: "CC 4.0 BY-SA"
licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
---

## 一、背景

Nginx 是高性能的 Web 与反向代理服务，也是一种轻量级 Web 服务器，可作为独立服务器部署网站，应用广泛，在前后端分离场景下尤其常见。开发时我们常在 Windows 下用 Nginx 作为 Web 服务器。

## 二、安装

### 1、下载 Nginx

推荐两个网站：

- Nginx 官网：[http://nginx.org/](http://nginx.org/)
- Nginx 中文网：[https://nginx.p2hp.com/](https://nginx.p2hp.com/)

### 1.1、Nginx 官网

**去 Nginx 官网下载：** 访问官网，找到 download。

![官网下载页](./images/0_1.png)

**选择 Nginx 版本：** 在下载界面选择所需版本，找到对应版本下载即可。

![选择版本](./images/0_2.png)

**解压 Nginx：** 下载到本地后直接解压即可。

![解压目录](./images/0_3.png)

### 1.2、Nginx 中文网

**去 Nginx 中文网下载：** 访问中文网，找到下载 Nginx。

![中文网下载页](./images/0_4.png)

**选择 Nginx 版本：** 在下载界面选择所需版本，找到对应版本下载即可。

![中文网选择版本](./images/0_5.png)

**解压 Nginx：** 下载到本地后直接解压即可。

![解压目录](./images/0_3.png)

## 三、Nginx 的使用

### 1、Nginx 基本目录

![Nginx 目录结构](./images/0_6.png)

- **conf**：Nginx 配置文件目录
- **docs**：文档目录
- **html**：静态 html 文件目录
- **logs**：日志目录
- **temp**：临时文件目录

### 2、查看 80 端口是否被占用

Nginx 的配置文件是 **conf** 目录下的 **nginx.conf**。

![conf 目录](./images/0_7.png)

![nginx.conf](./images/0_8.png)

Nginx 默认端口号为 **80**。若 80 端口被占用，需要修改。

#### 2.1、解决方式一：修改 Nginx 端口号

直接修改 **nginx.conf** 配置文件中的端口号：

![修改端口号](./images/0_9.png)

#### 2.2、解决方式二：杀死被占用的端口

按 **Windows 键 + R** 打开运行窗口，输入 **cmd** 打开命令行窗口（小黑窗）：

![运行窗口](./images/0_10.png)

~~netstat -ano~~ （不好使）

~~然后输入 `netstat -ano | findstr "端口号"` 命令，查看此端口号的进程，找到对应 PID~~ （不好使）

![netstat 命令](./images/0_11.png)

或使用 `tasklist | findstr "进程名称"` 命令查找 PID。我们要找的是 nginx.exe 的 PID，直接输入 `tasklist | findstr "nginx.exe"`：

![tasklist 查找进程](./images/0_12.png)

然后输入 `taskkill /f /t /pid pid号` 根据 PID 杀死进程：

![taskkill 按 PID 杀死](./images/0_13.png)

或输入 `taskkill /f /t /im "nginx.exe"` 按进程名杀死所有进程。`/f` 表示强制杀死，`/t` 表示进程树：

![taskkill 按名称杀死](./images/0_14.png)

> 进程名称要输入全称，例如有的需要加 `.exe`！可右键 `.exe` 应用程序，查看属性：

![查看属性](./images/0_15.png)

即可看到应用程序的进程名称：

![进程名称](./images/0_16.png)

再次输入 `tasklist | findstr "nginx.exe"` 查看进程信息，已无 nginx.exe 进程，说明已成功杀死：

![确认进程已结束](./images/0_17.png)

### 3、Nginx 启动方式

#### 3.1、双击 nginx.exe 启动（不推荐）

双击 nginx 目录下的 nginx.exe，一般会有黑色弹窗一闪而过，代表启动成功。

![双击启动](./images/0_18.png)

浏览器地址栏输入 **localhost:80** 并回车（80 端口可省略，输入了也不显示）：

![访问 localhost](./images/0_19.png)

能看到该页面即启动成功。

#### 3.2、通过命令启动

在 nginx 安装目录的路径栏中输入 **cmd**：

![路径栏输入 cmd](./images/0_20.png)

直接输入 **nginx** 或 **start nginx** 并回车即可启动：

![命令启动](./images/0_21.png)

浏览器地址栏输入 **localhost:80** 并回车：

![访问 localhost](./images/0_22.png)

能看到该页面即启动成功。

关闭 Nginx 的命令：`nginx -s stop`

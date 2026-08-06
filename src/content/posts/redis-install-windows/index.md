---
title: Windows 下 Redis 安装部署与可视化工具使用
published: 2022-02-23
description: Windows 下 Redis 的安装部署，以及 treeNMS、RedisStudio、Redis Desktop Manager 等可视化工具的使用。
image: "./images/0_1.png"
tags: [Redis, 数据库, Windows, 安装教程]
category: 数据库
draft: true
slug: redis-install-windows
author: "明金同学"
sourceLink: "https://blog.csdn.net/weixin_44893902/article/details/123087435"
licenseName: "CC 4.0 BY-SA"
licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
---

本文介绍 Windows 下 Redis 的两种安装方式（zip 压缩包与 msi 安装包），并补充几个常用的可视化客户端（treeNMS、RedisStudio、Redis Desktop Manager），可按需选看。

## Redis 下载地址

Windows 版 Redis 下载（GitHub，推荐）：

- [https://github.com/tporadowski/redis/releases](https://github.com/tporadowski/redis/releases)
- [https://github.com/MicrosoftArchive/redis/releases](https://github.com/MicrosoftArchive/redis/releases)

官网下载（无 Windows 版本）：[https://redis.io/download](https://redis.io/download)

Redis 中文网：[http://www.redis.cn](http://www.redis.cn)

所有版本汇总：[https://download.redis.io/releases/](https://download.redis.io/releases/)（下载后为 Linux 压缩包，需自行下载、解压和编译）

发行说明：[https://raw.githubusercontent.com/redis/redis/5.0/00-RELEASENOTES](https://raw.githubusercontent.com/redis/redis/5.0/00-RELEASENOTES)

> Redis 支持 32 位和 64 位，按系统和实际情况选择。本文下载 **Redis-x64-xxx.zip** 压缩包到磁盘，解压后将文件夹重命名为 **redis**。

**`.msi` 与 `.zip` 的区别：**

- `.msi` 是 Windows Installer 的程序安装包，可安装、修改、卸载程序，相当于把安装相关的所有内容封装在一个包里，还包含安装过程自身的信息（如安装序列、目标文件夹路径、安装选项等）。
- `.zip` 是压缩包，解压即可用，无需安装。

## 一、zip 压缩包方式下载安装

### 1、下载 Redis 压缩包

本文在 GitHub 下载 Windows 用的 5.0 版本 `Redis-x64-5.0.14.1.zip`。

[https://github.com/tporadowski/redis/releases](https://github.com/tporadowski/redis/releases)

![GitHub Releases 下载页面](./images/0_1.png)

![选择版本](./images/0_2.png)

### 2、解压到文件夹

将压缩包解压到指定文件夹，如 **D:\Redis**，内容如下：

![解压后的目录](./images/0_3.png)

### 3、启动 Redis 服务

在 Redis 安装目录下打开 cmd 窗口，执行命令启动服务：

```bash
redis-server.exe redis.windows.conf
```

> 可先用 `cd` 切换到 redis 所在目录：`cd /d d:\redis`

![打开 cmd 窗口](./images/0_4.png)

也可直接在 Redis 目录的路径栏输入 `cmd` 回车进入命令窗口：

![路径栏输入 cmd](./images/0_5.png)

> **`cd` 切换目录命令示例：**
>
> - `cd` // 显示当前目录
> - `cd ..` // 进入父目录
> - `cd /d d:` // 进入上次 d 盘所在的目录（或直接输入 `d:`）
> - `cd /d d:\` // 进入 d 盘根目录
> - `cd d:` // 显示上次 d 盘所在的目录
> - `cd /d d:\src` // 进入 `d:\src` 目录

随后执行 `redis-server.exe redis.windows.conf` 启动服务：

![启动 Redis 服务](./images/0_6.png)

> 默认端口为 6379，出现上图即说明 Redis 服务启动成功。命令中的 `redis.windows.conf` 可省略，省略后 `redis-server.exe` 会使用默认配置。

为方便使用，建议把 Redis 路径加入系统变量 `Path`，省去每次输入路径：

![配置 Path 环境变量](./images/0_7.png)

### 4、打开 Redis 客户端进行连接

使用 `redis-cli.exe` 命令打开 Redis 客户端：

```bash
redis-cli.exe -h 127.0.0.1 -p 6379
```

![打开客户端](./images/0_8.png)

输入 `ping` 检测服务器与客户端的连通性，返回 `PONG` 即连接成功：

![ping 测试](./images/0_9.png)

> 若连接失败，注意启动服务后需另开一个 cmd 窗口到 Redis 目录执行命令，**原来的 Redis 启动窗口不要关闭**，否则无法访问服务端。

![另启 cmd 窗口](./images/0_10.png)

连接成功即代表 Redis 安装部署完成。

### 5、基础操作测试

Redis 默认有 16 个数据库，初始使用 0 号库，可用 `select` 切换到 8 号库：

```bash
select 8
```

![切换到 8 号库](./images/0_11.png)

用 `set` 设置键值、`get` 取出键值：

![set/get 操作](./images/0_12.png)

用 `shutdown` 关闭 Redis 服务：

![shutdown 命令](./images/0_13.png)

Redis 启动窗口会出现服务关闭提示：

![服务关闭提示](./images/0_14.png)

**Redis 常用服务指令：**

- 卸载服务：`redis-server --service-uninstall`
- 开启服务：`redis-server --service-start`
- 停止服务：`redis-server --service-stop`

## 二、msi 安装包方式下载安装

### 1、下载 Redis 安装包

本文在 GitHub 下载 Windows 用的 5.0 版本 `Redis-x64-5.0.14.1.msi`（另一种 `.zip` 即上文第一种方式）。

[https://github.com/tporadowski/redis/releases](https://github.com/tporadowski/redis/releases)

![下载 msi 安装包](./images/0_15.png)

![选择 msi 版本](./images/0_16.png)

### 2、进行安装

![安装向导](./images/0_17.png)

![安装选项](./images/0_18.png)

① 直接运行 `.msi` 安装包，一路 next，到下图界面勾选后再 next：

![勾选选项](./images/0_19.png)

② 选择端口后 next（默认 6379，后续可用配置文件修改）：

![端口选择](./images/0_20.png)

③ 选择最大缓存容量后 next（后续可用配置文件修改）：

![缓存容量](./images/0_21.png)

![容量界面](./images/0_22.png)

点击 `install` 开始安装。若杀毒软件弹权限提示，全部允许即可：

![安装权限提示](./images/0_23.png)

![安装进度](./images/0_24.png)

### 3、进行配置

① 安装完成后，进入 Redis 安装目录找到配置文件 **redis.windows-service.conf**。

> 注意是 **redis.windows-service.conf**，不是 **redis.windows.conf**。后者是以非系统服务方式启动程序时使用的配置文件。

![配置文件位置](./images/0_25.png)

② 在配置文件中找到 `requirepass foobared`，在其后追加一行，设置访问密码：

```text
requirepass 123456
```

测试时可不设密码，这里以 123456 做演示：

![设置密码](./images/0_26.png)

### 4、启动服务

进入计算机服务（右键计算机 → 管理 → 服务和应用程序 → 服务），在右侧找到 Redis 服务，查看启动情况，未启动则手动启动。

> 因前面修改过配置文件，需要重启服务。

![服务管理器](./images/0_27.png)

也可在【任务管理器】→【服务】中启动：

![任务管理器服务](./images/0_28.png)

### 5、测试能否正常工作

进入 Redis 安装路径测试：

```bash
cd c:\redis
```

![进入安装路径](./images/0_29.png)

输入 `redis-cli` 并回车（redis-cli 为客户端程序），如图正常进入并显示正确端口号，说明服务已启动：

```bash
redis-cli
```

![redis-cli 连接](./images/0_30.png)

因前面配置了密码，使用前需先验证。输入 `auth 123456` 并回车（123456 为设定的密码），返回 OK 表示验证通过：

![auth 密码验证](./images/0_31.png)

再验证 `set` 与 `get`，一切正常即安装部署成功：

![set/get 验证](./images/0_32.png)

## 三、使用可视化工具

### 1、Redis Desktop Manager

需安装使用，0.9.4 以上收费。

**下载地址：**[https://github.com/uglide/RedisDesktopManager/releases/download/0.9.3/redis-desktop-manager-0.9.3.817.exe](https://github.com/uglide/RedisDesktopManager/releases/download/0.9.3/redis-desktop-manager-0.9.3.817.exe)

**详情：**[https://blog.csdn.net/u012688704/article/details/82251338](https://blog.csdn.net/u012688704/article/details/82251338)

下载后直接安装，无需配置即可连接：

![RDM 安装](./images/0_33.png)

界面如下：

![RDM 界面](./images/0_34.png)

### 2、RedisStudio

**下载地址：**[https://github.com/cinience/RedisStudio/releases](https://github.com/cinience/RedisStudio/releases)

打开即可使用：

![RedisStudio 启动](./images/0_35.png)

界面如下：

![RedisStudio 界面](./images/0_36.png)

### 3、treeNMS

treeNMS 管理工具官网：[http://www.treesoft.cn/dms.html](http://www.treesoft.cn/dms.html)

基于 Java、WEB 方式管理 Redis，Windows 环境下下载解压即可使用，内含部署说明：

![treeNMS 官网](./images/0_37.png)

界面如下：

![treeNMS 界面一](./images/0_38.png)

![treeNMS 界面二](./images/0_39.png)

![treeNMS 界面三](./images/0_40.png)

## 参考博文

- CSDN @ 脱毛的二哈 [windows安装Readis与可视化工具](https://blog.csdn.net/qq_30211955/article/details/88881361)
- CSDN @ Zepal [windows下Redis的安装和配置–图文教程](https://blog.csdn.net/weixin_41381863/article/details/88231397)
- 脚本之家 @ 一入码坑深似海 [推荐几款 Redis 可视化工具(太厉害了)](https://www.jb51.net/article/208969.htm)


---
title: Windows 下 MySQL 8.0 安装教程（详细版）
published: 2026-05-28
description: Windows 下 MySQL 8.0 安装与验证的保姆级图文教程，覆盖安装向导、服务配置、常见失败处理与两种验证方式。
image: "./images/41bbf33d6e1cc1c3e9487ec9aaefc93e.png"
tags: [MySQL, 数据库, Windows, 安装教程]
category: 数据库
draft: true
slug: mysql-install-windows
author: "忧乐君"
sourceLink: "https://blog.csdn.net/m0_71422677/article/details/136007088"
---

# Windows 下 MySQL 8.0 安装教程（详细版）

打开 [MySQL 官网](https://www.mysql.com/downloads/)，按下面的步骤走。

安装 MySQL 后，建议先回顾一下 [关系型数据库的介绍与历史](https://blog.csdn.net/m0_71422677/article/details/135947554?spm=1001.2014.3001.5502) 和 [常见关系型数据库产品介绍](https://blog.csdn.net/m0_71422677/article/details/135978883?spm=1001.2014.3001.5502)，再看正式安装步骤。

## 一、从 MySQL 官网安装

![MySQL 官网下载页](./images/41bbf33d6e1cc1c3e9487ec9aaefc93e.png)

![MySQL 下载页面](./images/2cc7e1c7b01e6ba293a6a97e86073c24.png)

![选择下载版本](./images/0dba66b797a5e95b78a1210c0e052cd7.png)

把页面翻译成中文，看着更顺。

![页面切换为中文](./images/b556ad61af05491b76b874c8cf1a7a49.png)

下载并打开安装包，能看到版本是 8.0.36。双击运行（或右键打开），会先安装一个 `mysql-installer` 程序，再由它来安装 MySQL。

![运行安装包](./images/36f72da0dad77e6f625edcb2db2c0f2d.png)

> 如果之前在同一台机器装过 MySQL，安装程序可能检测到现有配置并自动跳过某些步骤，也可能根据环境检测结果自动配置。本例以 8.0.31 的截图演示，与 8.0.36 的安装步骤有少量迭代差异，按自己屏幕上显示的内容对应即可。（第一次装 8.0.36 版本时，很多步骤会因版本迭代被跳过，忽略即可。）

![安装向导步骤](./images/652db117e2097fd69d11385415a59ae4.png)

8.0.36 没有以下步骤，说明新版本已经合并掉了，不用理会，后面同理。

![安装向导后续步骤](./images/dbbd3d35bbc3a2ac3b3878093121fd3c.png)

下一步后可能出现以下情况：

![配置选项界面](./images/6a1ab602d3f43127a7fbfcbc752d5091.png)

![配置界面二](./images/ac3cde4965caf879550da2506534bc5e.png)

![配置界面三](./images/b9c33128162c0a0a28c9b9530444e8ce.png)

![配置界面四](./images/42a2747fdd83ecbfeb7cb58f719dd204.png)

![配置选项说明](./images/56fbfcc87a431eb78efbc68a988f81aa.png)

序号 2 可勾可不勾（Windows 防火墙本身不太靠谱），序号 3、4 按自身情况选择。

![网络 / 连接配置](./images/27af156740bca5a4c6cd83f1e26cb5ad.png)

序号 1、2、3、4 解释：

1. 选 **TCP/IP**，即通过网络连接 MySQL，MySQL 启动后是一个网络服务。TCP/IP 协议栈是互联网通信的基础，定义了数据如何在网络中传输与交换，支撑 HTTP、FTP、SMTP 等应用层协议。
2. Windows 防火墙就那样，勾不勾看你喜好。
3 / 4. 本机连 MySQL，用命名管道（Named Pipe）或共享内存（Shared Memory）都可以。Named Pipe 常用于大量数据通信，Shared Memory 用于需要高速传输的进程间通信。前者通过读写文件通信，后者直接共享内存，使用时要分别考虑文件 I/O 开销和数据同步问题。

![连接配置详情](./images/0d9155d54f39297a3b468daef84c3d42.png)

### 关闭 / 启动 MySQL 服务

**Win + R** 打开「运行」，输入 `services.msc` 回车，进入「服务」管理器，找到 MySQL（显示「正在运行」），右键「停止」即可。安装成功后需要手动启动时也用这个方法。

![服务管理器停止 MySQL](./images/32e0fc6e09ac749b351ac4d9ebbe1a35.png)

MySQL 推荐使用最新数据库和客户端。MySQL 8 换了加密插件，所以如果选第一种加密方式，很可能导致 Navicat 等旧客户端连不上 MySQL 8。

![选择加密方式](./images/0d250f5bffba3b93ab9d041fa4a03fc4.png)

**MySQL 的超级管理员叫 `root`**。初次设置密码建议先用弱口令，记性好的也可以直接设强口令（macOS 要求强口令：大小写 + 数字 + 特殊字符，长度大于 8 位）。

![设置 root 密码](./images/c7a88f58f9702cd15d570fe44b23e705.png)

是否开机自启：建议手动启动。需要时 **Win + R** → 输入 `services.msc` → 找到 MySQL → 右键「启动」。

![服务自启动设置](./images/7fb65480871e34bcc9a3a06f3fa3fe6a.png)

授权对路径的访问权限：

![授权路径访问](./images/7442927adbea15a4ce73065e965ee5ec.png)

MySQL 服务器的日志配置（运行时会产生各类日志）：

1. **错误日志（Error Log）**：默认用 `<用户名>.err`，名称不要出现中文或特殊字符（下划线、数字、空格等），用纯英文。
2. **通用日志（General Log）**：开启后，MySQL 会记录每个客户端连接的建立、执行的 SQL 语句以及断开连接等事件。
3. **慢查询日志（Slow Query Log）**：记录执行时间超过阈值的查询。在涉及隐私或敏感信息的场景下，开启它可能有信息泄露风险。
4. **二进制日志（Binary Log）**：对数据的增删改都会记录。误删、误改数据时，可通过它恢复。

![日志配置](./images/137a734c8225dd0db677e742dccc0713.png)

![日志配置二](./images/d87dffc7a693af507e4b5e9aff53e28c.png)

![日志配置三](./images/51f8be4db2d8e778c2970ad28896e7d8.png)

![日志配置四](./images/46f3e947ba8b2dc01a2161dcfc3e9c43.png)

![配置完成](./images/001f856ca8a7e5048e60e3f7ac6f29bd.png)

### Starting the server 安装失败的处理

如果卡在 **Starting the server** 失败，多半是之前装过 MySQL 没卸载干净。可以照下面处理：

1. 停在这个页面，不用叉掉重装（叉掉也无妨，处理方式一样）。
2. 「此电脑」右键 → 显示更多选项 → 管理，进入如下页面：

![计算机管理](./images/8ee7965d0e7309016b230cb7d1ee09d6.png)

![计算机管理界面](./images/ae57c89326eeb1750dde70f32f494115.png)

3. 找到 MySQL，右键 → 属性 → 登录，勾选「允许服务与桌面交互」，先「应用」再「确定」。

![服务登录设置](./images/d5095efe75e26e1e8703344931f285fc.png)

![Starting the server 失败处理](./images/77b15352c0a3609b5e588e39844ab7e0.png)

回到这一界面再点一次安装即可。

![重新安装](./images/de57c49cb2816688285a25fe07b83d14.png)

> 也可直接打开「开始菜单」（Win 徽标，通常在屏幕左下角；找不到就按键盘上的 Windows 键，位于 Ctrl 和 Alt 之间），搜索「计算机管理」，展开「服务与应用程序」→「服务」，步骤一样。这个手动启动 MySQL 的方法要记牢。

![计算机管理入口](./images/abe269c1afe5721ea67a5ef1cea65455.png)

上述过程也用下面这种方法：找到 MySQL 后右键「属性」，后续操作一致。

![服务属性设置](./images/76cd30433dbd25a1b1363266b079e454.png)

## 二、两种验证方式查看是否安装成功

### 1. MySQL 控制台验证

开始菜单打开 **MySQL 8.0 Command Line Client**，输入设置的密码，弹出当前 MySQL 服务器状态即成功。

![MySQL 命令行客户端](./images/6da2d219bb4dcb62d95004d57552e2c0.png)

![命令行客户端登录](./images/0994db434af1f938a42370d7a1eb3664.png)

### 2. 命令提示符（cmd）验证

1. 找到安装好的 MySQL 的 `bin` 文件夹路径，默认一般是 `C:\Program Files\MySQL\MySQL Server 8.0\bin`。
2. **Win + R** 输入 `cmd`，在窗口中执行：

   ```text
   cd C:\Program Files\MySQL\MySQL Server 8.0\bin
   mysql -h localhost -u root -p
   ```

   再输入数据库密码，登录成功即可看到信息。

![cmd 验证登录](./images/f4acdd63024bb24a8254788018a8ef03.png)

到这里 MySQL 就装好了。安装过程中你常会看到名为 `bin` 的文件夹——它存放可执行程序。本教程用 cmd 验证 MySQL，在 [Python 免费安装教程](https://blog.csdn.net/m0_71422677/article/details/128777778?spm=1001.2014.3001.5502) 里也用 cmd 验证 Python。下一篇会在 [边边角角小知识专栏](https://blog.csdn.net/m0_71422677/article/details/128777778?spm=1001.2014.3001.5502) 分享 `bin` 文件夹的作用和 cmd 的一些小知识。

---
title: "UE4 引擎的编译与修改"
published: 2026-05-10
description: "在 Windows 下获取虚幻 4.26.2 源码、配置 VS2019 编译环境并修改 UnMesh4.cpp 源码的完整步骤。"
image: ""
tags: [UE4, Unreal Engine, 编译, 游戏开发]
category: 环境搭建
draft: false
slug: "ue4-engine-build-modify"
---

# UE4 引擎的编译与修改

## 第一步：获取虚幻 4.26.2 引擎源代码

需要满足以下三个前置条件：

### 1. 拥有 Epic Games 账号

- 搜索并下载 Epic Games 应用
- 注册一个 Epic Games 账号

### 2. 拥有 GitHub 账号

- 注册一个 GitHub 账号（需要魔法）

### 3. 关联两个账号并接受 Unreal 邀请

1. 在 Epic 应用中点击左下角你的昵称
2. 在个人界面中找到 **GitHub 图标**，点击进行关联
3. 关联成功后，前往你注册 GitHub 用的邮箱
4. 会收到虚幻引擎发来的邀请邮件，点击 **接受**
5. 此时你就可以访问虚幻引擎源代码数据库了

> **注意：** 不满足上述三个条件的话，访问会显示 404，无法查看源码。

详细步骤参考：[【UE4】Github 上访问 Unreal Engine 的源码](https://blog.csdn.net/Bob__yuan/article/details/108662527)

### 下载源码

找到对应版本的引擎（4.26.2），下载 ZIP 并解压。

- 发行版地址：[4.26.2-release · EpicGames/UnrealEngine](https://github.com/EpicGames/UnrealEngine/releases/tag/4.26.2-release)
- 有三个文件，下载上面两个
- 第二个 ZIP 解压
- 第一个 `Commit.gitdeps.xml` 需要替换到 `Engine/Build` 目录下同名文件，不替换后续无法完整下载

> Per a previous announcement on [GitHub Disruption](https://forums.unrealengine.com/t/upcoming-disruption-of-service-impacting-unreal-engine-users-on-github/1155880). To remedy related download errors, a new `Commit.gitdeps.xml` file is attached to this release as an Asset. Please replace the existing `Engine/Build/Commit.gitdeps.xml` with the attached file.
>
> 根据之前在 GitHub 上的公告 [Disruption](https://forums.unrealengine.com/t/upcoming-disruption-of-service-impacting-unreal-engine-users-on-github/1155880)，为纠正相关下载错误，该版本会附加一个新的 `Commit.gitdeps.xml` 文件作为资产。请用附件替换现有的 `Engine/Build/Commit.gitdeps.xml`。

---

## 第二步：配置编译环境

### 放置源码

将获得的文件夹放进大于 100G 的硬盘里，确定该路径内**没有中文**且越简洁越好。

### 下载 VS2019

- **必须是 VS2019 版本，没得商量**
- 不要去微软官网下载，你下不到的
- 去左道旁门的网站看有没有百度网盘链接分享
- 就 4MB 左右很小，下载完成后安装，这个得等比较久，耐心

### 配置组件

这是 VS2019 编译 UE4 需要的组件（个人安装选择，实测够用）：

```json
{
  "version": "1.0",
  "components": [
    "Microsoft.VisualStudio.Component.CoreEditor",
    "Microsoft.VisualStudio.Workload.CoreEditor",
    "Microsoft.VisualStudio.Component.NuGet",
    "Microsoft.VisualStudio.Component.Roslyn.Compiler",
    "Microsoft.VisualStudio.Component.Roslyn.LanguageServices",
    "Microsoft.VisualStudio.ComponentGroup.WebToolsExtensions",
    "Microsoft.VisualStudio.Component.TypeScript.4.3",
    "Microsoft.VisualStudio.Component.JavaScript.TypeScript",
    "Microsoft.Component.MSBuild",
    "Microsoft.VisualStudio.Component.TextTemplating",
    "Microsoft.Net.Component.4.5.TargetingPack",
    "Microsoft.VisualStudio.Component.Debugger.JustInTime",
    "Component.Microsoft.VisualStudio.LiveShare",
    "Microsoft.VisualStudio.Component.IntelliCode",
    "Microsoft.Net.Component.4.6.2.TargetingPack",
    "Microsoft.VisualStudio.Component.VC.CoreIde",
    "Microsoft.VisualStudio.Component.Windows10SDK",
    "Microsoft.VisualStudio.Component.VC.Tools.x86.x64",
    "Microsoft.VisualStudio.Component.Graphics.Tools",
    "Microsoft.VisualStudio.Component.VC.DiagnosticTools",
    "Microsoft.VisualStudio.Component.Windows10SDK.19041",
    "Microsoft.VisualStudio.Component.VC.Redist.14.Latest",
    "Microsoft.VisualStudio.ComponentGroup.NativeDesktop.Core",
    "Microsoft.VisualStudio.ComponentGroup.WebToolsExtensions.CMake",
    "Microsoft.VisualStudio.Component.VC.CMake.Project",
    "Microsoft.VisualStudio.Component.VC.ATL",
    "Microsoft.VisualStudio.Component.VC.TestAdapterForBoostTest",
    "Microsoft.VisualStudio.Component.VC.TestAdapterForGoogleTest",
    "Microsoft.VisualStudio.Component.VC.ASAN",
    "Microsoft.VisualStudio.Workload.NativeDesktop",
    "Microsoft.VisualStudio.Workload.NativeGame",
    "Microsoft.Net.Component.4.6.2.SDK"
  ],
  "extensions": []
}
```

复制上述文件修改文件名为 `.vsconfig` 即可导入使用。

### 参考配置

- [Setting Up Visual Studio for Unreal Engine | Unreal Engine 4.27 Documentation](https://dev.epicgames.com/documentation/unreal-engine/setting-up-visual-studio-for-unreal-engine?application_version=4.27)
- [UE4.27 配置 Windows VS2019 & VScode](https://gongshan-liu.github.io/CGAndGameDocs/parts/unreals/ue_27_config_vs2019_and_vsc_windows.html)
- （4.26 未给出，猜测可能与 4.27 相同）

---

## 第三步：生成项目文件与编译

### 生成项目文件

以管理员身份运行 `GenerateProjectFiles.bat`，得到 `UE4.sln`（解决方案）。右键它，打开方式选择 Visual Studio 2019。

### 修改源码

VS 界面右侧三分之一区域是目录，在目录里找到：

```
\Unreal\UnrealMesh\UnMesh4.cpp
```

修改 `UnMesh4.cpp` 中的源代码：

- Go to line 841: `Ar << S.bCastShadow;`
- Insert the following between line 841 and 842:

> 请前往第 841 行：`Ar << S.bCastShadow;`
> 请在第 841 行和第 842 行之间插入以下内容：

```cpp
uint32 Dummy = 0;
Ar << Dummy;
```

### 构建项目

在右侧目录顶上找到 **UE4**，右键 → **生成**，耐心等待。

### 完成

在 `Engine/Binaries/Win64` 里应该可以看见魔改版 "Unreal Editor" 了。对它创建快捷方式，放在桌面或你觉得好找的地方。

至此，虚幻引擎便构建完成了。

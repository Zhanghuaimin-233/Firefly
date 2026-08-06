---
title: "Stable Audio 3 本地部署记录：Windows + uv + CUDA + Gradio UI"
published: 2026-06-22
description: "记录在 Windows 下用 uv + CUDA 本地部署 Stability-AI/stable-audio-3，并运行 medium 与 small-sfx 两个模型的完整流程。"
image: ""
tags: [Stable Audio, AI 部署, 本地模型, Gradio]
category: "AI 部署"
draft: false
slug: "stable-audio-3-local-deploy"
---

# Stable Audio 3 本地部署记录：Windows + uv + CUDA + Gradio UI

本文记录在 Windows 环境下本地部署 `Stability-AI/stable-audio-3`，并成功运行 `medium` 与 `small-sfx` 两个模型的完整流程。

>用于个人游戏开发[2026-06-21 精简开发文档，发展方向以及音频资产解决思路](../游戏开发日记/2026-06-21%20精简开发文档，发展方向以及音频资产解决思路.md#^8b8883)

适用目标：

- 本地生成游戏音效
    
- 使用 Gradio Web UI
    
- 对比 `medium` 与 `small-sfx`
    
- 避免 Windows 下 `uv` 自动装 CPU 版 PyTorch 的坑
    

---

## 1. 模型区别

Stable Audio 3 仓库中常用模型如下：

|模型|启动参数|定位|硬件|
|---|---|---|---|
|Stable Audio 3 Small-Music|`small-music`|轻量音乐专用|CPU 可跑|
|Stable Audio 3 Small-SFX|`small-sfx`|轻量音效专用|CPU 可跑|
|Stable Audio 3 Medium|`medium`|高质量通用模型|需要 CUDA GPU|

项目 README 中说明，`small-music` 是 music-only，`small-sfx` 是 sound effects-only，二者都是 433M 参数、最长 120 秒；`medium` 是 1.4B 参数、最长 380 秒，需要 CUDA GPU。

实际用于游戏音效时，推荐：

```text
small-sfx：普通射击、命中、拾取、UI、短爆炸
medium：主动技能、Boss 爆炸、角色登场、复杂能量音效
small-music：主菜单 BGM、关卡 BGM、Boss BGM
```

---

## 2. 准备环境

需要提前安装：

```text
Git
Python 3.10+
uv
NVIDIA 显卡驱动
CUDA Toolkit 12.6
Hugging Face 账号
FFmpeg，可选但推荐
```

确认 CUDA Toolkit：

```powershell
nvcc -V
```

输出类似：

```text
Cuda compilation tools, release 12.6, V12.6.77
```

注意：`nvcc -V` 只能证明系统安装了 CUDA Toolkit，不代表当前 Python 虚拟环境里的 PyTorch 是 CUDA 版。真正要看的是：

```powershell
.\.venv\Scripts\python.exe -c "import torch; print(torch.__version__); print(torch.version.cuda); print(torch.cuda.is_available())"
```

---

## 3. 安装 uv

PowerShell 安装：

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

安装完成后，如果提示需要添加 PATH，可以在当前 PowerShell 执行：

```powershell
$env:Path = "C:\Users\你的用户名\.local\bin;$env:Path"
```

检查：

```powershell
uv --version
uvx --version
```

---

## 4. 克隆 Stable Audio 3

示例目录：

```powershell
cd E:\Dev\Environments\StableAudio3

git clone https://github.com/Stability-AI/stable-audio-3.git

cd .\stable-audio-3
```

---

## 5. 安装项目依赖

安装基础依赖和 UI 依赖：

```powershell
uv sync --extra ui --link-mode=copy
```

`--link-mode=copy` 用于避免 uv 在跨盘缓存时出现 hardlink warning。

如果提示：

```text
Failed to hardlink files; falling back to full copy.
```

这不是错误，只是 uv 想用硬链接加速，但缓存目录和虚拟环境可能不在同一个磁盘，自动退回复制模式。

---

## 6. Hugging Face 模型授权

~~需要分别授权不同模型。授权 `medium` 不等于授权 `small-sfx`。~~
更正：实际使用发现授权的是仓库,其包含的模型一次授权都可以下载使用。

打开并登录 Hugging Face：

```text
https://huggingface.co/stabilityai/stable-audio-3-medium
https://huggingface.co/stabilityai/stable-audio-3-small-sfx
```

分别点击同意协议 / 申请访问。

然后登录 Hugging Face CLI：

```powershell
uvx hf auth login --force
uvx hf auth whoami
```

测试权限：

```powershell
uvx hf download stabilityai/stable-audio-3-medium model_config.json
uvx hf download stabilityai/stable-audio-3-small-sfx model_config.json
```

如果出现 403：

```text
Cannot access gated repo
Access to model ... is restricted
```

通常是：

```text
1. 当前模型没有单独授权
2. 网页授权账号和 CLI 登录账号不是同一个
3. 授权还没生效
```

---

## 7. Windows 下 uv + CUDA 的关键坑

Stable Audio 3 的 `pyproject.toml` 里依赖了：

```toml
torch==2.7.1
torchaudio==2.7.1
```

它也配置了 CUDA 12.6 的 PyTorch 源：

```toml
[[tool.uv.index]]
name = "pytorch-cu126"
url = "https://download.pytorch.org/whl/cu126"
explicit = true
```

但是关键问题是：它只给 Linux x86_64 配置了 CUDA 源 marker：

```toml
torch = [
  { index = "pytorch-cu126", marker = "sys_platform == 'linux' and platform_machine == 'x86_64'" }
]
torchaudio = [
  { index = "pytorch-cu126", marker = "sys_platform == 'linux' and platform_machine == 'x86_64'" }
]
```

因此在 Windows 下直接 `uv sync`，很容易装成：

```text
torch: 2.7.1+cpu
cuda build: None
cuda available: False
```

解决方法是：手动给 `.venv` 安装 CUDA 版 PyTorch。

---

## 8. 给 `.venv` 补 pip

uv 创建的虚拟环境可能没有 pip。  
如果执行：

```powershell
.\.venv\Scripts\python.exe -m pip
```

提示：

```text
No module named pip
```

则执行：

```powershell
.\.venv\Scripts\python.exe -m ensurepip --upgrade
```

检查：

```powershell
.\.venv\Scripts\python.exe -m pip --version
```

---

## 9. 手动安装 CUDA 12.6 版 PyTorch

进入项目根目录：

```powershell
cd E:\Dev\Environments\StableAudio3\stable-audio-3
```

卸载 CPU 版：

```powershell
.\.venv\Scripts\python.exe -m pip uninstall -y torch torchaudio torchvision
```

安装 CUDA 12.6 版：

```powershell
.\.venv\Scripts\python.exe -m pip install --no-cache-dir `
  torch==2.7.1 `
  torchaudio==2.7.1 `
  --index-url https://download.pytorch.org/whl/cu126
```

检查 CUDA 是否可用：

```powershell
.\.venv\Scripts\python.exe -c "import torch; print('torch:', torch.__version__); print('cuda build:', torch.version.cuda); print('cuda available:', torch.cuda.is_available()); print('gpu:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'NO CUDA')"
```

正确结果类似：

```text
torch: 2.7.1+cu126
cuda build: 12.6
cuda available: True
gpu: NVIDIA GeForce RTX 4060 Laptop GPU
```

---

## 10. 避免 uv 把 Torch 覆盖回 CPU 版

之后不要随便执行：

```powershell
uv sync
uv run python run_gradio.py ...
```

因为它可能触发同步，把 CUDA 版 PyTorch 覆盖回 CPU 版。

推荐直接使用：

```powershell
.\.venv\Scripts\python.exe ...
```

如果必须同步依赖，使用：

```powershell
uv sync --extra ui --no-install-package torch --no-install-package torchaudio --link-mode=copy
```

---

## 11. Gradio 输出音频 0:00 / 无法下载问题

曾遇到现象：

```text
频谱图正常显示
音频播放器显示 0:00 / 0:00
无法下载音频
```

这通常说明模型已经生成出了音频数据，但 Gradio 前端没有正确拿到可播放 / 可下载的音频文件。

可能原因包括：

```text
1. 文件命名过长
2. 文件名中包含特殊字符
3. verbose 命名把 prompt 拼进文件名，导致路径异常
4. Gradio 对相对路径解析异常
5. 输出文件被异步删除
```

建议按下面顺序排查。

### 11.1 先尝试修改 UI 输出参数

先不要急着改代码。  
在 Gradio 页面中展开：

```text
Output params
```

将输出参数改为：

```text
File format：wav
File naming：output.wav
Cut to seconds total：勾选
```

然后重新生成一次。

如果此时音频播放器可以正常显示时长，并且可以下载，说明问题大概率和 verbose 文件名有关。

推荐后续生成素材时先使用：

```text
File naming：output.wav
```

然后手动重命名保存，例如：

```text
player_shoot_01.wav
enemy_hit_01.wav
powerup_activate_01.wav
```

### 11.2 如果仍然 0:00 / 无法下载，再执行代码修复

如果改成 `output.wav` 后依旧失败，再修改 Gradio 输出逻辑。

进入项目根目录：

```powershell
cd E:\Dev\Environments\StableAudio3\stable-audio-3
```

执行：

```powershell
$path = ".\stable_audio_3\interface\diffusion_cond.py"

$content = Get-Content $path -Raw

$content = $content -replace `
'delete_files_async\(\[output_wav, output_filename\], 30\)', `
'# delete_files_async([output_wav, output_filename], 30)'

$content = $content -replace `
'return \(output_filename, \[audio_spectrogram, \*preview_images\]\)', `
'return (os.path.abspath(output_filename), [audio_spectrogram, *preview_images])'

Set-Content $path $content -Encoding UTF8
```

这段修复做了两件事：

```text
1. 禁止 30 秒后自动删除生成音频
2. 返回绝对路径给 Gradio，避免相对路径解析问题
```

修改完成后重新启动 UI。

### 11.3 检查生成文件是否正常落盘

生成完成后，在项目根目录执行：

```powershell
dir *.wav | Sort-Object LastWriteTime -Descending | Select-Object -First 5 Name,Length,LastWriteTime
```

如果能看到类似：

```text
output.wav    176444    ...
```

说明文件已经正常生成。

也可以直接用系统播放器测试：

```powershell
start .\output.wav
```

如果系统播放器能播放，但 Gradio 仍然显示 0:00，说明更偏向 Gradio 前端路径 / 缓存问题，可以刷新网页或重启 Gradio。

---

## 12. 关闭 Gradio 公网分享链接，可选

官方 `run_gradio.py` 默认：

```python
interface.launch(
    share=True,
    ...
)
```

如果只在本地使用，建议改为：

```powershell
(Get-Content .\run_gradio.py) -replace 'share=True,', 'share=False,' | Set-Content .\run_gradio.py
```

这样只开放本地地址：

```text
http://127.0.0.1:7860
```

>值得一提的是该脚本和上面的无法下载问题是项目级设置,只要你还是通过这个仓库自带的 **`run_gradio.py` + `create_diffusion_cond_ui`** 启动界面，那么**切换 `medium`、`small-sfx`，甚至 `small-music`，都会一起生效**

---

## 13. Triton / Flash Attention 警告说明

Windows 原生环境可能出现：

```text
No module named 'flash_attn'
flash_attn not installed
No module named 'triton'
torch._inductor.exc.InductorError
```

如果最后进度条能正常完成：

```text
100%|████████| 8/8
```

并且能生成音频，则可以先忽略。

为了减少 TorchDynamo / Inductor 编译相关刷屏，可以在启动前设置：

```powershell
$env:TORCHDYNAMO_DISABLE = "1"
```

这会关闭部分编译优化尝试，日志更干净，Windows 下更稳。

---

## 14. Medium 启动脚本

文件名：

```text
start_medium.ps1
```

内容：

```powershell
cd E:\Dev\Environments\StableAudio3\stable-audio-3

$env:TORCHDYNAMO_DISABLE = "1"

.\.venv\Scripts\python.exe run_gradio.py --model medium --title "Chengyu SFX Forge - Medium"
```

运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\start_medium.ps1
```

---

## 15. Small-SFX 启动脚本

文件名：

```text
start_small_sfx.ps1
```

内容：

```powershell
cd E:\Dev\Environments\StableAudio3\stable-audio-3

$env:TORCHDYNAMO_DISABLE = "1"

.\.venv\Scripts\python.exe run_gradio.py --model small-sfx --title "Chengyu SFX Forge - Small SFX"
```

运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\start_small_sfx.ps1
```

---

## 16. 为什么用 ps1，不用 bat

在 Windows 下，本项目更推荐用 `.ps1`，原因是：

```text
1. 可以稳定设置环境变量，例如 TORCHDYNAMO_DISABLE
2. 可以直接调用 .venv\Scripts\python.exe
3. 避免 bat / cmd 下路径、引号、虚拟环境切换不稳定
4. 避免 uv run 自动同步导致 torch 被换回 CPU 版
```

重点不是激活虚拟环境，而是直接指定当前项目的 Python：

```powershell
.\.venv\Scripts\python.exe run_gradio.py --model medium
```

这样比：

```powershell
uv run python run_gradio.py --model medium
```

更稳。

---

## 17. 推荐对比测试参数

为了公平对比 `medium` 和 `small-sfx`，建议用同一条 prompt、同一个 seed、同样秒数、同样 steps。

Prompt 示例：

```text
Short blue-white energy bullet firing sound effect, bright plasma zap with a tiny crystalline click, clean arcade vertical shooter style, light and energetic, suitable for rapid repeated shots, no music, no voice, no ambience, very short tail, single game sound effect only.
```

推荐参数：

```text
Seconds total: 1
Steps: 8
Seed: 233
File format: wav
File naming: output.wav
Cut to seconds total: 勾选
```

对比重点：

```text
small-sfx：是否更短、更干净、更像游戏音效
medium：是否质感更丰富、空间感更强、细节更多
```

---

## 18. 推荐文件命名规范

```text
assets/audio/sfx/player_shoot_01.wav
assets/audio/sfx/player_shoot_02.wav
assets/audio/sfx/enemy_hit_01.wav
assets/audio/sfx/enemy_explode_small_01.wav
assets/audio/sfx/powerup_activate_01.wav
assets/audio/sfx/energy_recharge_01.wav
assets/audio/sfx/shield_absorb_01.wav
```

先生成 wav 原始文件，再后处理为 ogg：

```powershell
ffmpeg -i input.wav `
  -af "silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=1:stop_threshold=-45dB,loudnorm" `
  -ar 44100 `
  -ac 2 `
  -c:a libvorbis `
  -q:a 5 `
  output.ogg
```

---

## 19. 最终成功标志

CUDA 检查：

```text
torch: 2.7.1+cu126
cuda build: 12.6
cuda available: True
gpu: NVIDIA GeForce RTX 4060 Laptop GPU
```

UI 启动：

```text
Running on local URL: http://127.0.0.1:7860
```

生成完成：

```text
100%|████████| 8/8
```

音频播放器不再显示 0:00 / 0:00，并且可以下载 wav 文件。

## 20. 音频输出目录与时间命名，可选增强项

默认情况下，Stable Audio 3 的 Gradio UI 会根据 `File naming` 规则生成输出文件名。  
如果使用 `verbose`，文件名会包含 prompt、cfg、seed 等信息，容易出现：

```text
文件名过长
文件名包含特殊字符
Windows 路径兼容性问题
Gradio 播放器显示 0:00 / 0:00
音频无法下载
```

因此，建议将输出逻辑改为：

```text
指定统一输出文件夹
按照当前时间自动命名
按模型区分输出目录
避免 prompt 参与文件名
```

推荐输出结构：

```text
outputs/
  medium/
    medium_20260622_143512_038.wav
    medium_20260622_143620_417.wav

  small-sfx/
    small-sfx_20260622_144002_159.wav
    small-sfx_20260622_144121_883.wav
```

文件名格式：

```text
模型名_年月日_时分秒_毫秒.wav
```

这样可以避免文件覆盖，也方便对比不同模型生成结果。

---

## 21. 修改输出目录与时间命名

### 1. 先备份原文件：

```powershell
cd E:\Dev\Environments\StableAudio3\stable-audio-3

Copy-Item .\stable_audio_3\interface\diffusion_cond.py .\stable_audio_3\interface\diffusion_cond.py.bak
```

### 2. 修改 `diffusion_cond.py`：

打开：

```text
stable_audio_3/interface/diffusion_cond.py
```

找到：

```python
    if file_format:
        filename_extension = file_format.split(" ")[0].lower()
    else:
        filename_extension = "wav"
    output_filename = "%s.%s" % (basename, filename_extension)
    output_wav = "%s.wav" % basename
```

替换为：

```python
    if file_format:
        filename_extension = file_format.split(" ")[0].lower()
    else:
        filename_extension = "wav"

    output_dir = os.path.abspath(os.environ.get("SA3_OUTPUT_DIR", "outputs"))
    os.makedirs(output_dir, exist_ok=True)

    timestamp = time.strftime("%Y%m%d_%H%M%S")
    millis = int((time.time() % 1) * 1000)

    output_prefix = os.environ.get("SA3_OUTPUT_PREFIX", "").strip()
    if output_prefix:
        basename = f"{output_prefix}_{timestamp}_{millis:03d}"
    else:
        basename = f"{timestamp}_{millis:03d}"

    output_filename = os.path.join(output_dir, "%s.%s" % (basename, filename_extension))
    output_wav = os.path.join(output_dir, "%s.wav" % basename)
```

这个文件顶部已经有：

```python
import os, time, math
```

所以不需要额外添加 `import os` 或 `import time`。

### 3. 确认不要自动删除文件

如果之前还没改过，找到：

```Python
    delete_files_async([output_wav, output_filename], 30)
```

注释掉：

```Python
    # delete_files_async([output_wav, output_filename], 30)
```

否则生成的音频还是可能 30 秒后被删掉。官方这里确实是异步删除输出文件。

### 4. 确认返回绝对路径

找到：

```Python
    return (output_filename, [audio_spectrogram, *preview_images])
```

建议改成：

```Python
    return (os.path.abspath(output_filename), [audio_spectrogram, *preview_images])
```

虽然我们前面已经让 `output_filename` 是绝对路径了，但这里再确认一下更稳。

---

## 22. 更新后的 Medium 启动脚本

文件名：

```text
start_medium.ps1
```

内容：

```powershell
cd E:\Dev\Environments\StableAudio3\stable-audio-3

$env:TORCHDYNAMO_DISABLE = "1"
$env:SA3_OUTPUT_DIR = "E:\Dev\Environments\StableAudio3\stable-audio-3\outputs\medium"
$env:SA3_OUTPUT_PREFIX = "medium"

.\.venv\Scripts\python.exe run_gradio.py --model medium --title "Chengyu SFX Forge - Medium"
```

运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\start_medium.ps1
```

---

## 23. 更新后的 Small-SFX 启动脚本

文件名：

```text
start_small_sfx.ps1
```

内容：

```powershell
cd E:\Dev\Environments\StableAudio3\stable-audio-3

$env:TORCHDYNAMO_DISABLE = "1"
$env:SA3_OUTPUT_DIR = "E:\Dev\Environments\StableAudio3\stable-audio-3\outputs\small-sfx"
$env:SA3_OUTPUT_PREFIX = "small-sfx"

.\.venv\Scripts\python.exe run_gradio.py --model small-sfx --title "Chengyu SFX Forge - Small SFX"
```

运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\start_small_sfx.ps1
```

---

## 24. 关于这些修改的通用性

以下修改属于当前 `stable-audio-3` 项目的 Gradio UI 通用修改：

```text
关闭 Gradio 公网分享链接
修复输出音频 0:00 / 无法下载
指定输出目录
按当前时间自动命名
按模型设置输出前缀
```

只要仍然通过：

```text
run_gradio.py
```

启动，并使用项目自带的 Gradio UI，那么这些修改对以下模型都生效：

```text
medium
small-sfx
small-music
```

需要注意：

```text
1. 如果重新 git pull、重新 clone 或覆盖源码，这些手动修改可能会丢失
2. 如果改用其他启动脚本或其他 UI，不一定会继承这些修改
3. 如果使用 uv sync，仍然要注意 Windows 下 torch 被覆盖回 CPU 版的问题
```

推荐长期使用 `.ps1` 启动脚本，并直接调用：

```powershell
.\.venv\Scripts\python.exe run_gradio.py
```

不要优先使用：

```powershell
uv run python run_gradio.py
```

这样可以避免 uv 自动同步环境，把 CUDA 版 PyTorch 覆盖回 CPU 版。
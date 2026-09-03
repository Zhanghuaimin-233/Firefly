---
title: 为什么 128K 模型塞不进第 128001 个 Token？真正拦住它的可能根本不是模型
published: 2026-09-03
updated: 2026-09-03
draft: false
category: AI日常
tags:
  - 大模型
  - RoPE
  - 位置编码
  - vLLM
  - 推理引擎
image: ./images/06-summary-infographic-landscape.webp
description: 标称 128K 的模型到了第 128001 个 Token 常常不是「开始胡说」，而是直接拒绝。本文区分 Effective Context Limit 与 Hard Context Limit，从位置编码、RoPE、模型配置、vLLM 的 max_model_len 一路看到 KV Cache 与 GPU Kernel——拦住那个 Token 的通常是整套推理系统。
---
前两篇我们已经把两个问题拆开了。

第一篇讨论：

> Context Window（上下文窗口）到底是什么？

第二篇讨论：

> 为什么 Context 越长，模型可能越来越难把里面的信息用好？

到了这里，一个我自己纠结了挺久的问题终于冒出来了。

如果长上下文的问题主要是：

- 模型越来越难找到信息；

- Attention（注意力机制）开始面对更多干扰；

- 长距离关系越来越难处理；

- Reasoning（推理）质量可能下降；

那这听起来都只是：

> **模型会越来越笨。**

可是……

为什么一个标称 128K Context Window 的模型，到了第 128001 个 Token，很多时候不是：

> “可以，你塞吧，就是我可能开始胡说八道。”

而是：

> **不行，塞不进去了。要压缩上下文了...**

这就很奇怪。

如果 Attention 只是越来越难处理信息，那第 128001 个 Token 到底撞到谁了？

模型脑袋里真的存在这么一段代码吗？

```python
if token_count >= 128000:
    raise Exception("脑容量已满，拒绝思考")
```

其实往底层拆之后会发现：

> **还真可能存在很像这样的代码。**

只不过它大概率不在“模型脑子”里。

![第 128001 个 Token 到底撞到了谁：128K 上下文硬限制、省流图与推理系统五道门](./images/06-summary-infographic-landscape.webp)

---

### 先把两个完全不同的“上限”分开

这一篇最重要的事情，就是先把两个概念彻底拆开。

#### Effective Context Limit（有效上下文限制）

上一篇主要聊的就是它。

这里的意思是：

> **即使模型还能接收这些内容，它稳定利用这些信息的能力也可能随着上下文变长而下降。**

比如模型支持 128K。

可能：

```text
20K   → 很稳
60K   → 还不错
100K  → 开始偶尔漏东西
128K  → 能跑，但已经比较容易迷路
```

这属于：

> **能力问题。**

---

#### Hard Context Limit（上下文硬限制）

Hard 在这里表示：

> **系统直接不允许超过这个长度。**

例如：

```text
允许：127999 Token
允许：128000 Token
拒绝：128001 Token
```

甚至 Transformer 还没来得及思考：

> “这个上下文是不是有点太长了？”

请求就已经被拦下来了。

这属于：

> **工程和架构限制。**

所以我们可以先记住一句：

```text
Hard Context Limit
        ≠
Effective Context Limit
```

一个决定：

> **能不能进去。**

另一个决定：

> **进去以后还能不能好好干活。**

前两篇一直在研究后者。

这一篇终于来抓门口那个保安。

![Hard Context Limit 与 Effective Context Limit：一个决定能否进入，一个决定进入后能否有效利用](./images/01-hard-vs-effective-context.webp)

---

## 模型为什么需要知道 Token 在哪里？

要理解这个“门”最早是怎么出现的，还得先说一个东西：

**Positional Encoding（位置编码）**

这里的 Position 就是：

> 位置。

Encoding 则可以理解成：

> 把位置信息转换成模型能够计算的表示。

为什么需要它？

因为单纯的 Self-Attention（自注意力机制）本身，并不会天然理解我们习以为常的：

> “第一个词、第二个词、第三个词……”

这种顺序关系。

例如：

```text
主人 打了 怪物
```

和：

```text
怪物 打了 主人
```

出现的词差不多。

但顺序一换：

> 怎么感觉突然有生命危险了 `(0x0)`

所以 Transformer 需要某种方式告诉模型：

```text
主人 → 在这里
打了 → 在这里
怪物 → 在这里
```

以及它们彼此之间的位置关系。

这就是 Position Encoding 要解决的问题。

---

## 最直观的方法：给每个位置发一个号码牌

有一种很容易理解的方法：

**Learned Positional Embedding（可学习位置嵌入）**

这里需要拆一下。

**Embedding（嵌入）**是机器学习里很常见的词。

它不是说：

> 把 Token 物理塞进了什么东西。

而是：

> **把某个对象表示成一组神经网络可以处理的数字。**

所以 Positional Embedding 可以先理解成：

> **每一个位置，都对应一组表示这个位置的数字。**

Learned（可学习）则表示：

> 这些位置表示不是人为写死的，而是在模型训练过程中学出来的。

---

### 它真的可以像一张表

为了方便理解，可以想象模型内部有：

```text
Position 0      → [一组数字]
Position 1      → [一组数字]
Position 2      → [一组数字]
Position 3      → [一组数字]
...
Position 511    → [一组数字]
```

然后 Token 来了：

```text
第一个 Token → 查 Position 0
第二个 Token → 查 Position 1
第三个 Token → 查 Position 2
```

非常直观。

问题也同样直观。

如果这张表只做到：

```text
Position 511
```

现在突然来了：

```text
Position 512
```

模型：

> ？

表里没有。

这种情况下，“最大长度”就真的很像数组长度。

例如 Hugging Face 的 BERT 配置里，默认就有：

```text
max_position_embeddings = 512
```

而它使用的是 Absolute Position Embedding（绝对位置嵌入）。官方文档中也明确规定，BERT 的 `position_ids` 位于 `0` 到 `max_position_embeddings - 1` 的范围内。

换成人话就是：

```text
0
1
2
...
510
511
```

都有位置表示。

第 512：

> **没有这个格子。**

当然，BERT 并不是我们今天聊天时常见的生成式大语言模型，我这里只是拿它作为一个特别清楚的例子。

因为在这种设计里：

> “位置表到头了”

是真的能成为一个非常直观的架构硬边界。

---

## 但是现在很多 LLM 用的已经不是这种办法了

事情到这里本来挺简单。

如果现代大模型也是：

```text
位置表长度 = 128K
```

那答案就结束了。

第 128001 个 Token 为什么进不去？

> 因为数组越界。

下课，吃饭。

可惜 Transformer 的世界显然不打算让我这么早下班。

现代很多 LLM 使用的是另一种位置编码方式：

**RoPE（Rotary Position Embedding，旋转位置嵌入）**

名字开始有一点像魔法技能了。

我们继续拆。

---

## RoPE：“位置”不一定非要提前存在一张表里

RoPE 的全称是：

**Rotary Position Embedding**

通常翻译成：

> **旋转位置嵌入。**

这里的 Rotary（旋转）并不是说模型里真的有个小齿轮在转。

它的核心思想是：

> **根据 Token 所处的位置，对 Attention 中的 Query 和 Key 向量做与位置有关的旋转变换。**

Query 和 Key 我们上一篇已经见过：

- Query：我现在想找什么？

- Key：我这里大概是什么信息？

RoPE 会把：

> **“你在第几个位置”**

这件事编码进它们之间的关系。

具体数学怎么转，我们这一篇先不展开。

第四篇再把手伸进公式窝里。

这里真正重要的是：

> **RoPE 不需要像刚才那种可学习位置表一样，为每一个 Position 提前准备一格独立参数。**

---

### 所以 Position 128001 还能算吗？

从 RoPE 的数学形式来看，它的位置变换是根据位置编号计算出来的。

也就是说：

```text
Position 1       → 可以计算
Position 1000    → 可以计算
Position 128000  → 可以计算
Position 128001  → 公式依然存在
Position 1000000 → 公式还是能继续算
```

这就出现了一个特别关键的区别。

以前那种固定位置表可能是：

```text
0 1 2 3 ... 131071
                  ↑
                表没了
```

RoPE 更接近：

```text
给我 position
      ↓
按照公式计算对应的位置变换
```

因此，**RoPE 本身没有传统固定位置表那种非常直观的“最后一个格子”。**

RoPE 的原始论文也专门把 Sequence Length Flexibility（序列长度灵活性）列为它的性质之一。

注意：

> 这不代表“用了 RoPE 的模型天然拥有无限可用上下文”。

这句话非常重要。

它只能说明：

> **位置编码这一环，不再必然因为固定位置表耗尽而停下来。**

至于模型有没有训练过这么长、算出来以后还认不认识这些位置、Attention 顶不顶得住、显存受不受得了……

那是后面的事情。

![固定 Position Table 与 RoPE 的区别：位置表会耗尽，RoPE 可以继续计算位置](./images/02-position-table-vs-rope.webp)

但现在问题反而更大了。

---

## 既然 RoPE 还能继续算，那 128K 是谁定的？

这就是我之前真正纠结的地方。

假设一个模型使用 RoPE。

理论上：

```text
Position 131071 → 能算
Position 131072 → 也能算
```

那么为什么产品页面仍然堂堂正正写着：

> Context Window：128K

甚至超过以后直接压缩上下文？

因为：

> **我们平常说“模型上下文窗口”，实际上说的往往不是裸神经网络里某一个孤立结构的极限，而是整套模型推理系统共同给出的工作范围。**

也就是说，我们得把视角稍微拉远一点。

平常发送一句话给大模型，大概不是：

```text
你的文字
   ↓
Transformer
```

中间其实还有一长串东西：

```text
用户输入
   ↓
Tokenizer（分词器）
   ↓
API / 请求检查
   ↓
Model Config（模型配置）
   ↓
Inference Engine（推理引擎）
   ↓
KV Cache / 内存管理
   ↓
GPU Kernel（GPU 计算内核）
   ↓
Transformer
```

第 128001 个 Token 想见到 Transformer：

> 得先把前面这几个门卫全过一遍。

只要其中一个说：

> 不行。

那它就进不去了。

![第 128001 个 Token 在见到 Transformer 前需要经过 API、Config、Engine、KV Cache 与 Kernel](./images/03-inference-gatekeepers.webp)

---

## 第一位门卫：API

这是最好理解的一层。

模型厂商完全可以直接规定：

```text
Maximum Context Length = 128K
```

然后服务器收到请求以后先数 Token。

逻辑可能类似：

```python
tokens = tokenizer(prompt)

if len(tokens) > MAX_CONTEXT_LENGTH:
    raise ContextLengthExceeded()
```

真实 API 的实现当然不会就这么三行。

而且有些模型的 Context Window 还会把：

> 输入 Token + 最大输出 Token

共同计算在总长度里面。

但核心逻辑就是：

> **先检查你有没有超过产品规定的长度。**

如果超了：

> 请求直接拒绝。

这个时候 GPU 可能都还没开始认真干活。

Transformer：

> 今天发生什么了吗？

API：

> 没什么，我在门口处理掉了。

所以某些情况下：

> **第 128001 个 Token 甚至从来没有真正进入模型。**

---

## 第二位门卫：Model Config

模型通常还有自己的：

**Model Config（模型配置）**

里面会描述很多模型相关参数，例如：

- Hidden Size

- Layer 数量

- Attention Head 数量

- Position Encoding 配置

- 最大模型长度

- RoPE 参数

其中就可能存在类似：

```text
max_position_embeddings
```

或者推理框架最终推导出来的：

```text
max_model_len
```

不过这里有一个很容易踩的坑：

> **看到 `max_position_embeddings`，不能立刻认为这个模型内部一定存在一张这么长的可学习位置表。**

像前面 BERT 那种 Absolute Position Embedding 模型，这个字段确实非常接近：

> “位置表有多长”。

但对于采用 RoPE 的模型，它更多还可能同时承担：

- 模型配置约定；

- 训练支持范围；

- 推理框架长度推导依据；

等作用。

所以同一个字段名：

> 在不同模型架构里，背后的含义不能机械照搬。

配置文件只是告诉整个系统：

> **这套模型按设计应该怎么运行。**

---

## 第三位门卫：Inference Engine

接下来是一个特别容易翻译错的词：

**Inference Engine（推理引擎）**

这里一定要注意：

Inference 虽然中文也翻译成：

> 推理。

但它和上一篇的：

**Reasoning（逻辑推理）**

不是一回事。

Reasoning 是：

> 模型根据条件推导答案。

Inference 在机器学习工程里则表示：

> **把已经训练好的模型真正运行起来，输入数据，然后计算输出。**

所以 Inference Engine 更接近：

> **负责把模型高效跑起来的运行系统。**

比如：

- vLLM

- TensorRT-LLM

- llama.cpp

都可以承担类似角色。

它们负责的东西可能包括：

- 请求调度；

- 显存管理；

- KV Cache；

- Batch（批处理）；

- GPU 计算；

- 多用户并发；

- 模型加载。

于是推理引擎当然也需要知道：

> **一条请求最多允许多长？**

---

## 现实里真的就有 `max_model_len`

这不是我为了方便解释临时编出来的变量名。

例如 vLLM 里就存在：

```text
--max-model-len
```

官方文档对它的定义非常直接：

> Model context length (prompt and output)

也就是：

> **模型上下文长度，包括 Prompt（输入提示）和 Output（输出）。**

![Prompt 与 Output 共同占用 max_model_len：输入越长，留给输出的空间可能越少](./images/04-prompt-output-shared-budget.webp)

如果没有手动指定，vLLM 会尝试从模型配置里自动推导。

现在的 vLLM 甚至支持：

```text
--max-model-len auto
```

让它根据 GPU Memory（GPU 显存）自动寻找能够容纳的最大长度。

这件事本身就已经非常能说明问题了。

“最大上下文长度”在真实推理系统里：

> **真的可以是一个运行参数。**

并不是 Transformer 脑袋里某种神秘的：

> “128K 注意力血条”。

---

## 第四位门卫：内存和 KV Cache

接下来这位我们先点到为止。

因为第四篇会专门拆它。

模型生成内容时，为了不用每生成一个新 Token 就把过去所有内容重新算一遍，通常会保存之前 Attention 中计算过的一部分结果。

这叫：

**KV Cache（Key-Value Cache，键值缓存）**

这里的 Key 和 Value，就是上一篇 Attention 里的 K 和 V。

不是 Redis 那种：

```text
key = "主人"
value = "可可萝"
```

虽然名字确实非常容易串台。

上下文越长：

> KV Cache 通常也要跟着变大。

所以即使：

- RoPE 还能算；

- API 愿意让你进；

- 推理引擎支持更长序列；

如果 GPU 显存只够：

> 128K

那到了更长：

> **物理上也塞不下。**

这也是为什么 vLLM 的自动长度会直接考虑 GPU Memory。

不过这一块我们下一篇再算。

不然这篇刚把读者从 RoPE 里救出来，转头又往显存公式里扔，有点残忍。

---

## 第五位门卫：GPU Kernel

还有一个经常出现但中文特别容易误会的词：

**GPU Kernel（GPU 计算内核）**

Kernel 平常也会翻译成：

> 内核。

但这里不是：

- Windows 内核；

- Linux Kernel；

- 操作系统核心。

GPU Kernel 在这里指的是：

> **实际运行在 GPU 上，负责执行某一种具体高性能计算的程序。**

比如 Attention 的底层计算，最终就可能由专门优化过的 GPU Kernel 执行。

为了追求速度，这些 Kernel 往往不会写成：

> “随便什么形状、什么长度、什么数据类型我都优雅处理。”

它们通常会针对：

- Head Dimension

- Block Size

- Data Type

- Sequence Length

- GPU 架构

等条件做大量优化。

所以某些实现也可能对支持的序列规模存在自己的要求。

超过以后可能：

- 换另一套实现；

- 性能暴跌；

- 无法运行；

- 或直接被上层框架禁止。

---

## 所以第 128001 个 Token 到底撞到了谁？

答案终于可以出来了：

> **不一定。**

它可能撞到：

```text
API 产品限制
```

也可能撞到：

```text
模型配置
```

也可能撞到：

```text
推理引擎 max_model_len
```

也可能撞到：

```text
KV Cache / GPU 显存
```

还可能是：

```text
底层计算实现
```

对于某些位置编码方式：

> **模型的位置表示本身也可能存在真正的架构边界。**

所以一个模型最终对外表现出来的：

> 128K Context Window

实际上更接近：

> **这整套模型 + 推理系统共同承诺能够支持的工作范围。**

而不一定是：

> “Transformer 这个神经网络到了第 128001 个 Token 就违反数学定律。”

---

## 那我把 `128K` 改成 `1M` 不就好了？

到这里，一个非常程序员的问题就出现了：

> 既然这是配置，那我改配置不就完事了？

这个想法……

还真不完全错。

假设一个使用 RoPE 的开源模型原本配置：

```text
max_model_len = 131072
```

你强行让推理框架接受：

```text
max_model_len = 1048576
```

如果同时满足：

- 推理框架允许；

- Position Encoding 能继续计算；

- GPU Kernel 支持；

- 显存足够；

- KV Cache 放得下；

那么：

> **它确实可能真的开始跑。**

这也进一步证明：

> 原本那个 128K，并不一定是神经网络数学上绝对不可越过的墙。

---

### 然后模型可能开始精神状态良好

这里的“良好”指：

> 良好地胡说八道。

因为又回到了上一篇的问题。

假设这个模型训练时主要适应的是：

> 128K 以内的位置关系。

你突然扔给它：

> 1M。

虽然 RoPE 的公式还能算：

> **模型却不一定学过怎么在这种位置尺度上工作。**

这会涉及：

**Length Extrapolation（长度外推）**

Extrapolation 通常翻译成：

> 外推。

它原本是数学和统计学里的概念。

在这里表示：

> **让模型在超过训练时主要经历的序列长度范围之外继续工作。**

所以可能出现非常有趣的场面：

```text
程序运行成功        ✓

GPU 没爆            ✓

1M Token 输入成功   ✓

模型知道自己在干嘛  ×
```

这就是为什么：

> **能跑**

和：

> **好用**

必须彻底分开。

![把 128K 配置扩展到 1M 后，能够运行并不等于模型能够稳定利用更长上下文](./images/05-run-vs-usable-extrapolation.webp)

---

## RoPE 不是“无限上下文许可证”

这里我觉得有必要单独强调一下。

读到前面很容易形成一个新的误解：

> 原来 RoPE 可以继续计算！

> 那 RoPE = 无限上下文！

也不是。

RoPE 只是让：

> **位置表示不再必须依赖一张固定长度的可学习位置表。**

它没有自动解决：

- 模型是否训练过这么长的序列；

- 长度外推是否稳定；

- Attention 是否还能有效利用信息；

- KV Cache 是否装得下；

- 计算时间是否还能接受；

- GPU 有没有被主人当场榨干。

所以：

```text
RoPE 可以继续计算位置
             ≠
模型拥有无限可用上下文
```

我们这里只是证明了一件更小、但非常关键的事情：

> **对于采用 RoPE 等位置机制的现代模型，“第 128001 个位置不存在”不一定是上下文硬限制的根本原因。**

真正的边界经常来自整套系统。

---

## 现在再回头看“128K 上下文”

经过三篇以后，这个数字已经可以拆成两个视角了。

第一种是：

**Supported Context Window（受支持的上下文窗口）**

表示：

> **模型和推理系统声明、配置、测试并愿意支持到的长度。**

第二种是：

**Effective Context（有效上下文）**

表示：

> **模型实际上能够多稳定地利用这么长的信息。**

于是可能出现：

```text
模型声明支持：128K
          │
          │
          │      ← 系统仍然允许运行
          │
          ↓
模型从某个长度开始越来越难用
```

也可能：

```text
数学上还能继续计算位置
          │
          │
          ↓
──────── 128K ────────
          ↑
     推理系统在这里
       直接关门
```

这两件事并不矛盾。

---

## 最有意思的结论：第 128001 个 Token 可能根本没见过模型

这大概是我研究这个问题之后，觉得最适合记住的一句话。

我们很容易想象：

> 第 128001 个 Token 进入了模型。

然后模型看了一眼：

> “对不起，我装不下。”

但现实中完全可能是：

```text
第 128001 个 Token
        ↓
Tokenizer
        ↓
长度检查
        ↓
“超过 max_model_len”
        ↓
请求拒绝
```

Transformer：

> 谁？

所以“上下文窗口上限”很多时候与其理解成：

> **模型大脑容量。**

不如理解成：

> **整套模型运行系统给这次计算划出的最大工作区间。**

---

## 不过这又把我们推到了最后一个问题

好。

现在假设我们开始作弊。

把所有门卫都撤掉：

- API 不限制；

- 推理框架不限制；

- GPU Kernel 支持；

- Position 可以继续计算；

- 给模型无限多的显存；

- 给它无限多的计算资源；

- 完全不在乎输出质量。

甚至允许它最后回答：

> `主人主人主人草莓PostgreSQL宇宙飞船114514……`

我们只问一个特别纯粹的问题：

> **不管结果有没有意义，它还能不能继续算？**

128K 后面是 1M。

1M 后面是 100M。

100M 后面再继续。

有没有某一个 Token：

> 无论如何都绝对无法跨过去？

这时候问题就不再是：

> 产品限制。

也不再是：

> 输出质量。

而开始变成：

> **Transformer 在数学和计算意义上的边界究竟在哪里？**

这就是最后一篇要继续干的事情：

**《[如果不管模型会不会胡说八道，大模型理论上能拥有无限上下文吗？](/posts/can-context-be-infinite/)》**

到了那里，我们终于可以放心把：

- Attention 的计算复杂度

- `O(N²)`

- KV Cache

- Prefill

- Decode

- FlashAttention

- RoPE 外推

这些东西全部搬出来。

前三篇已经把地基铺好了。

下一篇再看到公式，应该就不会有那种：

> “等等等等，你先告诉我第 128001 个 Token 为什么进不去啊！”

的感觉了 `(*/ω＼*)`

毕竟这次我们终于抓到人了：

> **很多时候，模型还没说不行，门卫已经先把门关上了。**

## 系列文章

这是「大模型上下文」系列，四篇按顺序读会更顺：

1. [128K 上下文到底是什么意思？大模型的“记忆容量”可能和你想的不一样](/posts/128k-context-window/)
2. [上下文越长越好吗？为什么大模型“看得见”，却不一定“用得好”](/posts/long-context-why-harder/)
3. 为什么 128K 模型塞不进第 128001 个 Token？真正拦住它的可能根本不是模型（本文）
4. [如果不管模型会不会胡说八道，大模型理论上能拥有无限上下文吗？](/posts/can-context-be-infinite/)

---

## 参考资料

1. [Vaswani, A. et al. (2017), _Attention Is All You Need_  ](https://arxiv.org/abs/1706.03762?utm_source=chatgpt.com)
    Transformer 原始论文，其中介绍了 Positional Encoding（位置编码）以及 Transformer 为什么需要显式加入序列位置信息。

2. [Devlin, J. et al. (2018), _BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding_  ](https://arxiv.org/abs/1810.04805?utm_source=chatgpt.com)
    BERT 原始论文，可作为采用绝对位置表示的经典 Transformer 模型参考。

3. [Hugging Face Transformers, _BERT Documentation_  ](https://huggingface.co/docs/transformers/model_doc/bert?utm_source=chatgpt.com)
    官方文档中的 `BertConfig` 明确给出了 `max_position_embeddings = 512`，并说明 Position ID 的使用范围。

4. [Su, J. et al. (2021), _RoFormer: Enhanced Transformer with Rotary Position Embedding_  ](https://arxiv.org/abs/2104.09864?utm_source=chatgpt.com)
    RoPE（旋转位置嵌入）的原始论文，介绍了通过旋转矩阵编码绝对位置并在 Self-Attention 中体现相对位置关系的方法。

5. [vLLM Documentation, _Model Configuration / max-model-len_  ](https://docs.vllm.ai/en/latest/api/vllm/config/model/?utm_source=chatgpt.com)
    vLLM 官方文档对 `max_model_len` 的定义是模型的 Context Length，并支持从 Model Config 推导或根据 GPU Memory 自动选择可容纳的最大长度，是理解“工程上下文限制”的一个很直观的真实例子。

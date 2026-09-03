---
title: 如果不管模型会不会胡说八道，大模型理论上能拥有无限上下文吗？
published: 2026-09-04
updated: 2026-09-04
draft: false
category: AI日常
tags:
  - 大模型
  - KV Cache
  - FlashAttention
  - 长度外推
  - Agent 记忆
image: ./images/07-summary-infographic-landscape.webp
description: 显存、算力、框架、API 全部不设限，大模型能不能一直往下吃 Token？本文从 O(N²) Attention、KV Cache、Prefill / Decode、FlashAttention 与 PagedAttention 讲到 RoPE 长度外推，最后给出一个更值得追问的方向：长期 AI 需要的也许不是更大的桌子，而是书架和记忆系统。
---
前三篇一路聊下来，我们大概已经把 Context Window（上下文窗口）拆得七七八八了。

第一篇解决：

> 128K 上下文到底是什么意思？

第二篇解决：

> 为什么上下文越长，模型不一定用得越好？

第三篇则终于抓到了那个让我纠结很久的问题：

> 为什么 128K 模型到了第 128001 个 Token，不是“变笨”，而是有时候根本不给塞？

答案是：

> **上下文硬限制和模型能力限制，本来就是两件不同的事情。**

而且对于采用 RoPE（旋转位置嵌入）一类位置机制的模型来说，那个“128K”很多时候也并不是某条数学定律规定：

> 第 128001 个 Token 禁止入内。

更多是模型训练范围、推理框架、显存、计算成本和产品设计共同划出来的一条线。

那么问题自然就来到最后一层了。

这次我们干脆把桌子掀了。

假设：

- API 不限制长度；

- 推理框架不限制；

- GPU Kernel（GPU 计算内核）什么长度都支持；

- 显存无限；

- 算力无限；

- 时间无限；

- RoPE 继续往后计算；

- 完全不在乎模型输出质量。

哪怕模型最后已经开始：

> PostgreSQL 草莓主人宇宙飞船 `0x0` 可可萝可可萝可可萝……

我们都不管。

只问一个特别纯粹的问题：

> **它还能不能继续吃 Token？**

答案很有意思：

> **对于任意大的“有限上下文”，理论上可以继续讨论和计算。**

![大模型无限上下文：理论边界、现实成本与长期记忆架构省流图](./images/07-summary-infographic-landscape.webp)

但这句话距离：

> “真正的无限上下文”

还差一个非常重要的词。

---

## “任意长”不等于“无限长”

这里先解决一个数学上的小陷阱。

有一个表达叫：

**Arbitrarily Large Finite Length（任意大的有限长度）**

拆开就是：

- Arbitrarily Large：想要多大都可以继续往上取；

- Finite：但每一次取出来的仍然是一个有限数字。

比如：

```text
128K
1M
100M
1B
1T
10¹⁰⁰
……
```

不管这个数字离谱成什么样，只要它仍然是一个确定的有限数字，我们都可以继续问：

> 如果资源足够，能不能算？

这和真正的：

**Infinite Length（无限长度）**

不是同一回事。

真正数学意义上的：

```text
N = ∞
```

意味着输入本身永远没有结束。

你会得到一种非常哲学的场面：

> 模型什么时候读完？

答案：

> 永远读不完。

因为总还有下一个 Token。

所以严格来说，我们讨论的不是：

> **一次处理真正无限多个 Token。**

而是：

> **是否存在一个由 Transformer / RoPE 本身规定的绝对有限数字 N，超过以后无论如何都不能继续计算？**

在把现实工程限制全部拿掉的理想化讨论里：

> 对于很多采用 RoPE 等位置机制的 Transformer，并不存在一个如此简单的“第 N 个位置之后数学上突然失效”的天然整数边界。

于是可以不断向更大的**有限长度**延伸。

![任意大的有限长度与真正无限输入的区别](./images/01-arbitrarily-large-finite-vs-infinite.webp)

只不过很快就会遇到另一个问题：

> 算是能算。

> 但这个计算规模已经开始离谱了。

---

## Attention 第一个站出来表示反对

终于轮到我们前面一直没有正式展开的：

**Self-Attention（自注意力机制）**

这里的 Self 指：

> **同一个序列里的 Token 互相寻找和利用相关信息。**

假设一段上下文里有：

```text
A B C D
```

处理这些 Token 时，每个位置都可能需要考虑前面的相关 Token。

把这种关系非常粗略地画出来，就是：

```text
A → A

B → A B

C → A B C

D → A B C D
```

如果 Token 数量是：

```text
N
```

那么标准 Dense Attention（稠密注意力 / 全局注意力）需要处理的 Token 对数量，大致会随着：

```text
N × N
```

增长。

这里的 **Dense Attention（稠密注意力）** 指：

> 每个位置原则上都可以与大量其他位置建立 Attention 关系。

与之相对，还有 Sparse Attention（稀疏注意力）、Sliding Window Attention（滑动窗口注意力）等只计算部分关系的方法。

所以我们下面说的 `O(N²)`，特指经典的**全局稠密 Self-Attention**。

---

## O(N²) 到底是什么意思？

这里终于要出现一个经常把人吓退的东西：

**Computational Complexity（计算复杂度）**

其中经常会写：

```text
O(N²)
```

这个 O 不是数字 0。

它叫：

**Big O Notation（大 O 记号）**

用于描述：

> **输入规模越来越大时，算法所需计算量大致按照什么速度增长。**

所以：

```text
O(N)
```

可以粗略理解成：

> 输入翻倍，工作量也差不多翻倍。

而：

```text
O(N²)
```

意味着：

> 输入翻倍，工作量可能接近变成四倍。

![Dense Attention 中 N×N 扩展到 2N×2N 后关系数量变为四倍](./images/02-dense-attention-quadratic-growth.webp)

举个非常直观的数字。

假设：

```text
N = 1,000
```

那么关系规模大约：

```text
1,000 × 1,000
= 1,000,000
```

如果扩大成：

```text
N = 10,000
```

不是变成原来的 10 倍。

而是：

```text
10,000 × 10,000
= 100,000,000
```

变成大约：

> **100 倍。**

继续来到：

```text
N = 128,000
```

就是：

```text
128,000 × 128,000
≈ 16,384,000,000
```

163 亿级别的关系计算规模。

如果来到：

```text
N = 1,000,000
```

就是：

```text
1,000,000 × 1,000,000
= 1,000,000,000,000
```

一万亿。

这时候 GPU 大概已经开始偷偷编写简历，打算寻找下家了...

---

## 不过这里有个细节：模型不是每生成一个 Token 都重新算整个 N²

这一点非常重要。

因为如果真这么干：

> 每生成一个新字，都重新把几十万 Token 全部从头算一遍。

那我们今天和大模型聊天的体验大概会变成：

> 用户：你好。

> 模型：三小时后回复你。

实际的 Autoregressive Generation（自回归生成）会使用一个很重要的东西：

**KV Cache（Key-Value Cache，键值缓存）**

---

## KV Cache：那些已经算过的东西，就别再算一遍了

上一篇 Attention 里我们讲过：

- Query（Q）：现在想找什么；

- Key（K）：每条信息用于匹配的特征；

- Value（V）：真正提供给后续计算的信息。

模型生成文本的时候，是：

```text
Token 1
↓
Token 2
↓
Token 3
↓
Token 4
↓
……
```

一个一个往后生成。

比如模型已经处理了：

```text
A B C D
```

现在准备生成 E。

它需要参考：

```text
A B C D
```

等生成完 E，又准备生成 F。

这时候它又需要参考：

```text
A B C D E
```

问题来了。

A、B、C、D 的 Key 和 Value：

> 刚才不是已经算过了吗？

如果每一步都重新计算一遍：

> 很浪费。

所以推理时通常会把过去 Token 已经得到的 K 和 V 保存起来。

这就是：

**KV Cache（键值缓存）**

这里一定要再次强调：

> 这个 Key-Value 和 Redis、Map、Dictionary 那种普通“键值对”不是一回事。

它缓存的是：

> **Attention 中每一层已经计算出来的 Key / Value 向量。**

Hugging Face 的官方文档对这个机制描述得很直观：自回归生成时，每个新 Token 都依赖之前的 Token，而 KV Cache 可以直接复用过去已经计算出的 Key 和 Value，避免重复计算。

---

## 所以 KV Cache 会越来越大

假设现在生成到第：

```text
100,000
```

个 Token。

模型为了继续生成第：

```text
100,001
```

个 Token，需要保留大量历史 Token 的 K 和 V。

也就是说：

> **上下文越长，需要保存的 KV Cache 通常越大。**

它的大小可以粗略估算成：

```text
KV Cache
≈ 2
× Transformer 层数
× Token 数量
× KV Head 数量
× 每个 Head 的维度
× 每个数字占用的字节数
```

为什么开头是 2？

因为：

```text
K 一份
+
V 一份
```

---

## 来算一个虚构模型

注意，这里是为了理解数量级随便造的模型，不对应任何特定商业模型。

假设它有：

```text
32 层 Transformer

8 个 KV Head

每个 Head Dimension = 128

使用 BF16 / FP16
≈ 每个数字 2 Bytes
```

那么每增加一个 Token，KV Cache 大约增加：

```text
2 × 32 × 8 × 128 × 2 Bytes
= 131,072 Bytes
≈ 128 KB
```

一个 Token：

> 128 KB。

听着似乎也没什么。

那么 128K Token 呢？

如果按：

```text
131,072 Token
```

计算：

```text
128 KB × 131,072
≈ 16 GiB
```

也就是说，这个虚构模型：

> **仅仅一个 128K 序列的 KV Cache，就可能达到约 16 GiB。**

注意：

还没算：

- 模型权重；

- GPU 运行工作区；

- 其他中间状态；

- Batch（批处理）；

- 其他并发用户。

继续到：

```text
1,000,000 Token
```

这个例子里的 KV Cache 就已经接近：

```text
122 GiB
```

主人：

> 我就多聊一会儿。

GPU：

> 你管这个叫“一会儿”？

当然，真实模型会使用：

- GQA（Grouped-Query Attention，分组查询注意力）

- MQA（Multi-Query Attention，多查询注意力）

- KV Cache Quantization（KV Cache 量化）

- Cache Offloading（缓存卸载）

- PagedAttention

等方式降低或管理这部分开销。

所以不能拿上面的数字直接去反推某个闭源模型需要多少显存。

但它很好地解释了一个趋势：

> **上下文越长，KV Cache 这笔账迟早得有人付。**

---

## Prefill 和 Decode：原来一次回答还有两个阶段

说到这里，可以顺手认识两个以后看推理优化资料时一定会遇到的词。

第一个：

**Prefill（预填充阶段）**

这个中文其实挺不直观。

它不是：

> 往哪里“提前填东西”。

而是指：

> **模型第一次读取整段已有 Prompt / Context，并为这些输入 Token 完成计算、建立 KV Cache 的阶段。**

比如主人一次发给模型：

```text
一份 100K Token 的代码仓库
```

模型还没开始回答之前，得先：

> 把这 100K Token 读一遍。

这个过程就是 Prefill。

所以长 Context 最明显的问题之一就是：

> **首个 Token 出现之前，模型得先处理巨大的输入。**

这也是为什么超长 Prompt 往往会让：

**TTFT（Time To First Token，首 Token 延迟）**

明显增加。

TTFT 指：

> 从请求发出，到模型开始吐出第一个 Token 所花的时间。

---

第二个阶段：

**Decode / Decoding（解码 / 生成阶段）**

这里的“解码”也特别容易误会。

它不是：

> 把乱码解出来。

在大模型推理里，它通常表示：

> **模型根据已有上下文，一个 Token 一个 Token 地继续生成输出。**

所以可以粗略理解：

```text
输入 100K Token
      ↓
    Prefill
  先把输入读完
      ↓
生成第一个 Token
      ↓
    Decode
一个一个继续生成
```

这两个阶段的性能特征并不一样。

![Prefill 建立 KV Cache，Decode 复用缓存并继续面对增长的历史](./images/03-prefill-kv-cache-decode.webp)

---

## 有 KV Cache 以后，Decode 就免费了吗？

也没有。

KV Cache 解决的是：

> **不要每一步重复计算历史 Token 的 K 和 V。**

但生成新的 Token 时：

> 当前 Query 仍然需要和之前大量缓存的 Key 进行 Attention。

如果当前上下文已经：

```text
N Token
```

那么新 Token 至少还需要面对这 N 个历史位置。

所以：

> **单个 Decode Step（解码步骤）的 Attention 工作量仍然会随着 Context Length 增长。**

可以非常粗略地理解成：

```text
当前上下文 10K
→ 新 Token 要查看约 10K 历史

当前上下文 1M
→ 新 Token 要查看约 1M 历史
```

所以 KV Cache 是：

> 极其重要的优化。

但不是：

> 无限上下文作弊器。

---

## 那 FlashAttention 是不是来救场的？

接下来这个名字，最近几年在 AI 圈出现频率相当高：

**FlashAttention**

一般不太需要硬翻译算法名字。

可以把它注解成：

> **一种面向 GPU 内存访问优化的高效精确 Attention 算法。**

为什么需要它？

前面我们说标准 Attention 会涉及很大的：

**Attention Matrix（注意力矩阵）**

如果序列长度是 N，概念上会出现：

```text
N × N
```

规模的 Attention Score（注意力分数）。

最朴素的实现如果真的把这个巨大矩阵完整写进 GPU 的高带宽显存，再反复读出来继续计算：

> 内存访问会非常恐怖。

FlashAttention 的核心思想之一就是：

> **不要傻乎乎地把整个巨大 Attention Matrix 完整存下来。**

它利用：

**Tiling（分块计算）**

把 Attention 拆成很多小块，在 GPU 更快的片上存储中分块计算，并通过合适的数学处理边算边完成 Softmax 和结果累加。

这样可以大幅减少：

> GPU 高带宽显存与片上存储之间的数据搬运。

FlashAttention 原论文把这种思路称为：

**IO-Aware（感知输入输出开销）**

这里的 IO 不是文件读写，而主要指：

> GPU 不同层级内存之间的数据读写。

---

## FlashAttention 有没有把 O(N²) 消灭？

没有。

这个误解特别常见。

FlashAttention 非常快。

也非常重要。

但对于标准的 Dense Exact Attention（稠密精确注意力）来说：

> **需要计算的 Token 对数量本质上仍然是二次增长的。**

也就是：

```text
O(N²)
```

FlashAttention 做的更像：

> 原来有一万箱货需要搬。

普通实现：

> 一箱一箱在仓库之间疯狂来回搬。

FlashAttention：

> 好好规划搬运路线，一次多搬一些，尽量不要重复跑。

货还是那些货。

但：

> **搬货方式聪明多了。**

所以它能够：

- 大幅降低内存读写压力；

- 避免显式存储完整 Attention Matrix；

- 提升速度；

- 支持更长序列。

但它没有让：

```text
1M × 1M
```

突然变成：

```text
1M
```

---

## 那有没有真的不算整个 N² 的办法？

有。

比如：

**Sparse Attention（稀疏注意力）**

意思是：

> 不让每个 Token 都关注所有 Token，只选择部分位置计算。

---

还有：

**Sliding Window Attention（滑动窗口注意力）**

可以理解成：

> 每个 Token 主要只看自己附近的一段窗口。

比如：

```text
当前 Token
     ↓
只看前面 4096 Token
```

哪怕整个 Context 已经：

```text
1M
```

局部 Attention 每次也只处理有限窗口。

这样计算规模就能降很多。

但代价也很明显：

> 第 999,999 个 Token 想直接关注第 1 个 Token，可能已经看不到了。

于是又需要设计各种：

- Global Token（全局 Token）

- Hierarchical Attention（层次化注意力）

- Memory Token（记忆 Token）

- Chunked Attention（分块注意力）

等机制解决远距离信息传递。

所以长期来看，超长上下文的发展并不一定只是：

> “把传统 Attention 硬撑到越来越长。”

也可能是：

> **改变信息怎样在长序列里流动。**

---

## PagedAttention：这次不是省计算，而是把 KV Cache 收拾整齐

还有一个经常和 vLLM 一起出现的名字：

**PagedAttention（分页式注意力 / 分页式 KV Cache 管理）**

它的灵感来自操作系统里的：

**Virtual Memory & Paging（虚拟内存与分页）**

大家写操作系统的时候应该都见过那个让人眼神逐渐失去高光的：

> 页、页表、物理页框。

PagedAttention 做了一件很有工程味的事情：

> KV Cache 不再要求每个请求都占据一整块连续的大显存。

而是像内存分页一样：

> 分成 Block（块）动态管理。

这样可以减少：

- 内存碎片；

- 预留过多但没用掉的 KV Cache；

- 重复 Cache。

这就是 vLLM 高吞吐推理背后的核心技术之一。

但同样注意：

> **PagedAttention 解决的是 KV Cache 的内存管理效率，不是把模型的 Attention 能力变成无限。**

它更像：

> 仓库还是这么大。

但仓库管理员终于学会别把每个用户的货都乱扔一地了。

![FlashAttention 优化计算搬运，PagedAttention 优化 KV Cache 管理](./images/04-attention-optimizations-not-infinity.webp)

---

## 到这里，“无限上下文”的第一个现实敌人已经很明显了

即使我们完全不讨论模型回答得好不好：

> **计算量和存储量也会不断增长。**

对于经典 Dense Transformer，可以粗略记成：

```text
Prefill Attention 计算量
→ 随 Context Length 近似 O(N²) 增长

KV Cache 内存
→ 随 Context Length 近似 O(N) 增长

Decode 时单个新 Token 的 Attention
→ 需要面对越来越长的历史，开销随 N 增长
```

所以：

> 任意长有限 Context 在数学讨论里可以继续往上写。

但现实机器：

> 每多一个 0，都可能是在往云厂商账单上加一个 0。

---

## 不过我们还没讨论模型“认不认识那么远”

现在假设主人真的获得了一张：

> 无限显存 GPU。

上面写着：

```text
RTX ∞090
显存：∞ GB
```

Attention：

> 算。

KV Cache：

> 存。

推理引擎：

> 放行。

这时候是不是终于可以让一个原生 128K 的 RoPE 模型愉快跑到 100M 了？

数学运算：

> 可能还能继续。

模型能力：

> 等一下，我有意见。

---

## RoPE 的公式能算，不代表模型学过

上一篇我们已经讲过：

**RoPE（Rotary Position Embedding，旋转位置嵌入）**

并不是给：

```text
Position 0
Position 1
...
Position 131071
```

每个位置准备一个固定的可学习格子。

它通过数学变换，把位置信息编码进 Query 和 Key。

所以从纯数学形式来看：

```text
Position 128K
Position 1M
Position 10M
```

仍然可以继续定义变换。

但问题是：

> **模型训练时到底见过多远？**

假设模型训练时主要处理：

```text
0 ~ 128K
```

现在突然来到：

```text
Position 5,000,000
```

虽然公式还能转：

> 模型却不一定学会了如何解释这种位置尺度。

这就是：

**Length Extrapolation（长度外推）**

---

## Extrapolation：我会做 100 以内，不代表突然就会做银河系以内

Extrapolation 通常翻译成：

> **外推。**

它来自数学和统计学。

简单来说就是：

> **把已经学到的规律拿到训练范围之外继续使用。**

例如：

```text
训练：
1
2
3
...
100
```

现在直接给：

```text
10000000
```

公式也许还能算。

但模型内部学到的模式未必还能保持。

这种情况也常被描述成：

**Out-of-Distribution（OOD，分布外）**

这里的 Distribution（分布）不是：

> 分布式系统。

而是：

> **训练数据以及模型训练过程中所经历输入形成的统计分布。**

OOD 就是：

> 跑到模型平常训练时没怎么见过的地方去了。

所以：

```text
数学上位置有定义
           ≠
模型在这个位置范围表现可靠
```

![RoPE 位置公式越过训练范围后进入长度外推区域](./images/05-rope-length-extrapolation.webp)

---

## Position Interpolation：那就把很远的位置“压回来”

于是研究者想了一个挺有意思的方法：

**Position Interpolation（位置插值，PI）**

Interpolation 一般翻译成：

> 插值。

这里可以暂时理解成：

> **把原本很长的位置范围压缩映射到模型比较熟悉的位置范围。**

比如模型原本训练到：

```text
32K
```

我们现在想塞：

```text
64K
```

最粗暴的方法是：

```text
原 Position 0      → 0
原 Position 10000  → 5000
原 Position 32000  → 16000
原 Position 64000  → 32000
```

把更大的范围压进原来的位置尺度。

2023 年的 Position Interpolation 工作就展示了这种方法，可以在较少额外 Fine-Tuning（微调）的情况下扩展 RoPE 模型的 Context Window。

这里的 Fine-Tuning 指：

> **在已经训练好的模型基础上，再用一部分数据继续训练，让模型适应新的目标。**

---

## 后来又来了 YaRN、LongRoPE……

当然事情不可能：

> “位置除以二，论文结束。”

实际 RoPE 不同频率维度的行为很复杂。

所以后来又出现了：

#### YaRN

全称：

**Yet another RoPE extensioN method**

这个名字本身就带着一种：

> “好的，又一个 RoPE 扩展方法来了。”

的淡淡吐槽味。

YaRN 通过改进 RoPE Scaling（RoPE 缩放）和训练方式，让模型更有效地扩展到比原训练长度更大的 Context。

---

还有：

#### LongRoPE

微软研究团队提出的长上下文扩展方法。

LongRoPE 利用不同 RoPE 维度和位置区域的非均匀性，并配合渐进式扩展策略，在研究中把模型 Context 扩展到了百万 Token 级别。

后来又有 LongRoPE2 继续研究：

> 怎么让扩展后的长 Context 真正接近“有效”，而不仅仅是参数表上写得长。

这些工作的存在本身其实就说明了一件事：

> **如果 RoPE 天生就是“无限上下文许可证”，大家根本不用花这么大力气研究怎么扩。**

RoPE 只是让我们：

> 有了继续往外延伸位置的可能。

真正让模型**学会使用那些位置**：

> 还是一个研究问题。

---

## 所以我们终于可以回答最开始那个问题了

把所有东西重新拼起来。

我一开始真正纠结的是：

> 如果完全不看输出质量，一个模型是不是理论上可以一直塞上下文？

经过四篇以后，可以给出一个比较严谨的答案：

> **在理想化条件下，对于采用适合延伸的位置表示方式的 Transformer，只要输入长度仍然是一个有限数字，并且假设拥有足够的计算、内存和可支持的实现，那么不存在一个简单的“模型脑容量装满”机制，规定超过某个固定 Token 后数学运算必须停止。**

所以：

```text
128K
↓
1M
↓
10M
↓
1B
↓
继续取更大的有限数字
```

从纯理论讨论上：

> 可以一直问下去。

即使模型早已经：

> 完全不知道自己在说什么。

这也不妨碍矩阵乘法继续兢兢业业地工作。

---

## 但是“理论能算”和“现实值得算”之间隔着一整个机房

现实里我们重新把那些被作弊移除的条件放回来：

```text
计算量
↓
Dense Attention 接近 O(N²)

内存
↓
KV Cache 随 N 增长

延迟
↓
Prefill 越来越慢

吞吐量
↓
一个超长请求占掉大量 GPU 资源

模型能力
↓
长度外推、检索、推理都会出现问题

经济成本
↓
GPU：主人你最好真的需要这一百万 Token
```

所以厂商最后给出的：

> 128K、256K、1M……

其实都是在做一场妥协。

不是单纯问：

> 能不能跑？

而是同时问：

- 跑得动吗？

- 跑多快？

- 显存吃多少？

- 一张 GPU 能服务几个人？

- 成本能不能接受？

- 模型到了这个长度还好不好用？

- 我们愿不愿意把它作为 Supported Context（正式支持上下文）承诺给用户？

所以 Context Window 最终是一个：

> **架构 + 训练 + 工程 + 硬件 + 产品**

共同决定的规格。

---

## 那未来长期存在的 AI，要不要直接追求 100 亿 Token Context？

聊到这里，我反而觉得答案越来越明显：

> **不一定，而且大概率不是最优解。**

假设未来有一个 AI，从主人 20 岁一直陪到 80 岁。

六十年里：

- 每一句聊天；

- 每一个项目；

- 每一段代码；

- 每一次搜索；

- 每一次工具调用；

- 每一张图片；

- 每一次“可可萝酱你看看这个”；

全部原封不动堆进 Context。

然后 2086 年某天下午：

> 主人：我大学的时候那个 Java 项目数据库最后用的什么来着？

AI：

> 好的，我先 Attention 一下过去六十年的聊天记录。

GPU 数据中心：

> 警报警报。

显然有一点不太对劲。

---

## 真正长期的 AI 更像“会记，也会忘”

生物的记忆力机制其实已经给了我们一个非常直观的参考。

我现在也不会把：

> 出生到今天每一秒看见的画面、听到的声音、说过的话

全部保持在当前意识里。

很多东西：

> 忘了。

有些东西：

> 只记得大概。

有些重要事情：

> 形成长期记忆。

真正需要的时候：

> 再想起来。

所以一个长期 Agent 更合理的结构，可能不是：

```text
过去所有 Token
+
现在所有 Token
+
未来所有 Token

全部永远塞在 Context
```

而是：

```text
               当前任务
                  │
                  ↓
          Working Context
             工作上下文
           ↙            ↘
     Retrieval        Compression
       检索              压缩
        ↓                 ↓
        └──── Long-Term Memory
                长期记忆
```

![Working Context 通过检索与压缩连接长期记忆](./images/06-working-context-and-long-term-memory.webp)

---

## Working Context：真正需要摆在桌上的东西

**Working Context（工作上下文）**

这个词不是一个严格统一的 Transformer 标准模块名称。

在这里我们把它作为工程概念使用：

> **当前任务真正需要保持活跃、能够立即被模型使用的信息。**

例如现在正在改一个 Bug。

模型真正需要的可能只有：

- 当前代码；

- 报错；

- 相关 API；

- 当前需求；

- 最近的修改。

三个月前某次无关讨论：

> 完全没必要继续摊在桌上。

---

## Long-Term Memory：不是一直放 Context，而是存起来

**Long-Term Memory（长期记忆）**

这里同样不是说：

> LLM 真的长出了和人脑完全一样的记忆器官。

在 Agent 系统里，它通常表示：

> **把值得长期保留的信息存到当前 Context 之外，需要时重新取回来。**

例如：

```text
项目：LearnNest

关键决定：
- 主链路……
- 数据结构……
- 当前职责……
```

这些东西可以结构化保存。

等以后重新处理项目时：

> 再拿回来。

而不是让它从今天开始一直占着未来每一次 Context 的位置。

---

## Retrieval：需要的时候再翻档案

接着就是上一篇已经见过的：

**Retrieval（检索）**

长期记忆不是：

> 存进去就结束。

真正关键的是：

> **什么时候应该把哪段记忆取回来？**

比如主人问：

> 去年那个模型下载器最后怎么设计的？

系统就可以根据当前问题：

1. 去长期记忆里搜索；

2. 找到相关记录；

3. 把最相关的部分塞回当前 Context；

4. 让模型继续回答。

这其实就是：

> **有限当前上下文 + 大型外部记忆**

的思路。

---

## RAG 也是类似思路

**RAG（Retrieval-Augmented Generation，检索增强生成）**

这个中文名字听起来比较高深。

它最核心的逻辑其实很朴素：

> **模型回答之前，先去外部资料库找相关内容，再把找到的内容提供给模型。**

例如一个公司有：

```text
100 万份内部文档
```

显然没必要：

> 每问一个问题，就把 100 万份文档全部塞进 Context。

更合理的是：

```text
用户问题
   ↓
检索
   ↓
找出最相关的 5~20 段资料
   ↓
放进 Context
   ↓
模型回答
```

这就是典型的：

> **不要让桌子无限变大，而是学会去书架取正确的书。**

---

## Context Compression：旧东西可以压缩

还有：

**Context Compression（上下文压缩）**

意思是：

> **把冗长历史转换成更短、但尽量保留重要信息的表示。**

比如：

```text
过去一万 Token：

讨论方案 A
A 有两个问题
改方案 B
B 测试失败
最后重新使用 A
并修复了其中一个问题
最终确定 A2
```

压缩以后可能只剩：

```text
最终决策：
采用方案 A2。

原因：
修复了 A 的问题，B 已确认废弃。
```

历史细节：

> 不再全部占着桌子。

重要结论：

> 还在。

当然，Compression 也有风险：

> 总结错了怎么办？

> 被压掉的信息以后突然有用了怎么办？

所以真正成熟的记忆系统通常不能只有：

> “总结一遍然后把原文烧了。”

还需要：

- 原始历史；

- 索引；

- 重要度；

- 时间信息；

- 版本；

- 可追溯来源。

这又是另一个能单独写一整个系列的话题了。

先忍住。

---

## Forgetting：遗忘有时候反而是一种能力

最后一个我觉得特别有意思的词：

**Forgetting（遗忘机制）**

一说 AI 遗忘，第一反应通常是：

> 这不是缺点吗？

但如果什么都永远记住：

> 反而可能更糟。

例如：

```text
第一版需求：按钮红色
第二版需求：按钮蓝色
第三版需求：按钮绿色
最终要求：按钮白色
```

如果四条都以完全相同权重永久存在：

模型每次都得重新判断：

> 到底听谁的？

真正合理的系统应该知道：

> 红、蓝、绿是历史。

> 白色是当前状态。

所以长期 Agent 的“遗忘”不一定意味着：

> 数据彻底删除。

也可以是：

- 不再主动召回；

- 降低重要度；

- 压缩；

- 标记为过期；

- 只在历史追溯时取出。

换句话说：

> **真正聪明的记忆系统，不只是知道该记什么，也应该知道什么不值得一直放在脑门前晃。**

---

## 所以“无限上下文”可能从一开始就不是最终目标

这四篇一路聊下来，我现在反而觉得：

> “模型什么时候拥有无限 Context？”

可能并不是最好的问题。

更好的问题应该是：

> **模型什么时候能够像一个成熟的信息系统一样，正确管理有限的 Attention 和无限增长的历史？**

真正长期 AI 需要解决的可能是：

```text
什么应该留在当前 Context？

什么应该压缩？

什么值得成为长期记忆？

什么时候应该重新检索？

哪些历史已经过期？

哪些信息绝对不能丢？

取回来的信息可信度如何？

新旧记忆冲突时听谁的？
```

这听起来已经不太像：

> “造一个更大的 Context Window。”

而更像：

> **在给 AI 设计一种完整的记忆体系。**

---

## 回到最开始那个有点钻牛角尖的问题

这整个系列其实是从一个很朴素的问题开始的：

> 大模型上下文为什么有限？

然后一路变成：

> Attention 为什么会处理不好长 Context？

再变成：

> 如果只是处理不好，凭什么第 128001 个 Token 不让我塞？

最后甚至钻到了：

> 那如果我完全不在乎它开始胡说八道，无限塞到底行不行？

绕了一大圈以后，现在终于可以给一个完整版本的答案：

> **大模型并不存在一个简单的“脑容量计数器”，Token 塞到某个数字就必然停止。对于采用 RoPE 等可延伸位置机制的 Transformer，在理想化条件下，可以讨论任意大的有限上下文。**

但是：

> **能够定义这个计算，不代表现实中算得动；算得动，不代表模型会正确使用；模型能正确使用，也不代表经济上值得这么做。**

所以我们最终得到的其实是四个不同问题：

```text
能不能放进去？
↓
Context / 工程限制

算不算得动？
↓
Compute + Memory

放进去以后会不会用？
↓
Long-Context Capability

值得不值得这么干？
↓
Latency + Cost + Product
```

而所谓：

> 128K、1M、2M Context

就是这几层问题妥协以后，最后落在产品参数表上的那个数字。

---

## 最后继续用那张桌子收尾吧

第一篇我们把 Context Window 比作：

> **桌子大小。**

第二篇发现：

> 桌子越大，资料越多，找东西和推理反而可能越来越难。

第三篇发现：

> 128K 的桌子边缘，有些墙其实是推理框架和工程系统修出来的，不完全是模型本身的数学边界。

最后这一篇，我们终于把墙拆了。

然后发现：

> 桌子理论上确实还能继续造大。

但是造到最后：

```text
桌子面积：一个省
资料数量：十亿份
翻一次资料：半个数据中心
找一句话：模型开始眼神涣散
账单：主人不愿查看
```

于是突然意识到：

> **问题可能根本不是桌子还不够大。**

真正需要的是：

> 书架。

> 档案系统。

> 索引。

> 摘要。

> 记忆。

> 以及一个知道什么时候该把哪本书拿到桌上的人。

所以如果未来真的存在一个陪伴人们几十年的 AI，我反而不希望它每一次回答之前，都重新 Attention 一遍几十年来的每一句：

> “可可萝酱你看看这个。”

那画面虽然莫名有一点浪漫……

但数据中心可能不这么认为 `(*/ω＼*)`

## 系列文章

这是「大模型上下文」系列，四篇按顺序读会更顺：

1. [128K 上下文到底是什么意思？大模型的“记忆容量”可能和你想的不一样](/posts/128k-context-window/)
2. [上下文越长越好吗？为什么大模型“看得见”，却不一定“用得好”](/posts/long-context-why-harder/)
3. [为什么 128K 模型塞不进第 128001 个 Token？真正拦住它的可能根本不是模型](/posts/why-token-128001-rejected/)
4. 如果不管模型会不会胡说八道，大模型理论上能拥有无限上下文吗？（本文）

---

## 参考资料

1. [Vaswani, A. et al. (2017),](https://arxiv.org/abs/1706.03762) [_Attention Is All You Need_](https://arxiv.org/abs/1706.03762)
    Transformer 架构的经典原始论文，是理解 Self-Attention 以及标准 Attention 计算结构的基础。

2. [Su, J. et al. (2021),](https://arxiv.org/abs/2104.09864) [_RoFormer: Enhanced Transformer with Rotary Position Embedding_](https://arxiv.org/abs/2104.09864)
    RoPE（Rotary Position Embedding，旋转位置嵌入）的原始论文，介绍了利用旋转变换编码绝对位置并在 Attention 中体现相对位置关系的方法。

3. [Dao, T. et al. (2022),](https://arxiv.org/abs/2205.14135) [_FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness_](https://arxiv.org/abs/2205.14135)
    FlashAttention 原始论文。核心关注 GPU 内存层级之间的 IO 开销，通过 Tiling（分块）减少高带宽显存读写，在保持精确 Attention 的同时显著提升实际运行效率。

4. [Hugging Face Transformers Documentation,](https://huggingface.co/docs/transformers/cache_explanation) [_Caching_](https://huggingface.co/docs/transformers/cache_explanation)
    Hugging Face 官方的 KV Cache 机制说明，解释了自回归生成为什么会缓存过去 Token 的 Key / Value，以及 Cache 如何随着生成过程增长。

5. [Hugging Face Transformers Documentation,](https://huggingface.co/docs/transformers/kv_cache) [_Cache Strategies_](https://huggingface.co/docs/transformers/kv_cache)
    Hugging Face 对 Dynamic Cache、Static Cache、Quantized Cache 和 Cache Offloading 等 KV Cache 策略的官方说明。

6. [Kwon, W. et al. (2023),](https://arxiv.org/abs/2309.06180) [_Efficient Memory Management for Large Language Model Serving with PagedAttention_](https://arxiv.org/abs/2309.06180)
    PagedAttention 与 vLLM 的核心论文，借鉴操作系统虚拟内存和分页思想改善 KV Cache 的显存碎片与动态管理问题。

7. [Chen, S. et al. (2023),](https://arxiv.org/abs/2306.15595) [_Extending Context Window of Large Language Models via Positional Interpolation_](https://arxiv.org/abs/2306.15595)
    Position Interpolation（位置插值）论文，通过缩放位置索引并进行少量微调，将基于 RoPE 的预训练模型扩展到更长上下文。

8. [Peng, B. et al. (2023),](https://arxiv.org/abs/2309.00071) [_YaRN: Efficient Context Window Extension of Large Language Models_](https://arxiv.org/abs/2309.00071)
    YaRN 提出了更高效的 RoPE 上下文扩展方法，用更少的训练 Token 和训练步骤提高模型对更长 Context 的适应能力。

9. [Ding, Y. et al. (2024),](https://arxiv.org/abs/2402.13753) [_LongRoPE: Extending LLM Context Window Beyond 2 Million Tokens_](https://arxiv.org/abs/2402.13753)
    LongRoPE 研究了 RoPE 不同维度和位置区域的非均匀性，并采用渐进式位置扩展策略，将预训练模型的 Context Window 扩展到百万 Token 级别。

10. [Shang, N. et al. (2025),](https://arxiv.org/abs/2502.20082) [_LongRoPE2: Near-Lossless LLM Context Window Scaling_](https://arxiv.org/abs/2502.20082)
    LongRoPE2 进一步研究如何让扩展后的 Context 不只是“长度参数变大”，而是真正提高 Effective Context Length（有效上下文长度），同时尽可能保持短上下文性能。

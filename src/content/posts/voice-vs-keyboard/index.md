---
title: 语音还是键盘？重新思考我和 AI 沟通的方式
published: 2026-08-15
updated: 2026-08-15
category: AI日常
tags:
  - AI
  - 工作流
  - 输入方式
  - LLM
slug: voice-vs-keyboard
image: ./images/infographic-landscape.webp
description: 语音输入不只是“打字更快”——它减少了人在表达前对自己想法的那次过滤。文章借用信息检索的 Precision/Recall 与 Transformer 注意力机制，提出“探索态用语音、执行态用文字”的 AI 协作方式。
---

最近刷到不少 AI 博主推荐一个挺有意思的习惯：

**少打字，多用语音和 AI 沟通。**

这里说的不是让 AI 直接听我的声音，而是最普通的：

**说话 → 输入法转成文字 → 发给 AI。**

最开始我觉得这只是“打字更快”。

后来仔细想了一下，发现它真正有意思的地方可能不是速度，而是：

> **语音减少了人在表达之前，对自己想法进行的那一次过滤。**

![语音还是键盘：探索时说，执行时写](./images/infographic-landscape.webp)

## 打字，其实是在提前压缩自己的想法

正常打字的时候，我们往往会先在脑子里过一遍：

> 这个有必要说吗？  
> 这个猜测是不是有点蠢？  
> 这句话好像太啰嗦了。  
> 算了，删掉。

最后真正发给 AI 的，已经是一份经过人工压缩的版本。

而语音不太一样。

嘴通常比手快，尤其是脑子开始乱飞的时候：

> “我觉得这里可以这样做……不过等等，好像有性能问题。之前是不是遇到过类似情况？但那个架构又不一样。其实我真正担心的可能不是性能，而是以后不好扩展……”

如果一个字一个字打，我大概说到第二句就已经开始删东西了。

语音却更容易把这些：

**猜测、犹豫、突然冒出的点子和尚未成形的需求**

一起留下来。

如果借用信息检索里的概念打个比方：

**打字偏向 High Precision，语音偏向 High Recall。**

打字留下来的东西更精确，语音则更容易把脑子里的东西全部捞上来。

![语音提高探索时的 Recall，键盘提高执行时的 Precision](./images/01-recall-and-precision.webp)

于是开工前梳理需求、讨论架构、分析复杂 Bug、产品脑暴这些场景，语音突然就很好用了。

毕竟如果我要先花十分钟把自己的需求整理得逻辑严密，再交给 AI 帮我整理需求……

那多少有点像：

**请了个秘书，然后自己先把会议纪要写好了。**

## 但废话多了，不会干扰 AI 的注意力吗？

这也是我一开始最大的疑问。

如果语音输入把“呃”“等等”“我想想”，甚至各种被自己否定的猜测全部塞进上下文，会不会把模型真正应该关注的信息冲淡？

这里就要稍微碰一下 Transformer 的 **Attention Mechanism（注意力机制）** 了。

Transformer 最经典的来源是 Vaswani 等人在 2017 年发表的 _Attention Is All You Need_。[论文中提出的 Scaled Dot-Product Attention](https://arxiv.org/abs/1706.03762)，并不是简单地把“注意力平均分给上下文里的所有文字”，而是根据 Query 与不同 Key 的匹配关系计算权重，再组合相应的 Value。

非常粗略地理解就是：

```text
“用户真正想解决什么？”
        ↓
目标要求        █████████
关键限制        ███████
相关猜测        ████
“呃……我想想”   █
无关内容        █
```

所以，上下文多出几十个 token，并不意味着每个 token 都会平均抢走一份固定的“注意力额度”。

**模型本身就具备对不同信息赋予不同权重的机制。**

这算是打消了我最开始一半的顾虑。

但是——

**注意力机制能够区分信息，不代表模型永远能够正确地区分信息。**

这才是另一半。

## 真正危险的不是“废话”，而是“看起来很有用的废话”

比如：

> “呃……我想想。”

这种东西语义价值很低。

真正麻烦的是：

> 可能用 SQLite。  
> 等等，PostgreSQL 好像更好。  
> 不过 SQLite 应该也够。  
> 算了，还是 PostgreSQL 吧。

这些内容全部和任务高度相关，但它们互相冲突。

![Attention 可以分配权重，但相关且互相冲突的信息仍可能误导模型](./images/02-attention-and-conflicting-context.webp)

Shi 等人在 ICML 2023 的研究 _Large Language Models Can Be Easily Distracted by Irrelevant Context_ 中就发现，向推理任务中加入无关信息，确实可能明显影响大语言模型的表现。

也就是说：

> **Attention 并不是一个“自动过滤所有垃圾信息”的魔法。**

模型能够分配注意力，但上下文里如果同时存在大量貌似相关的猜测、旧方案和干扰项，它依然可能判断错“到底应该相信谁”。

还有一个很经典的现象叫 **Lost in the Middle**。

Liu 等人的研究发现，在长上下文任务中，仅仅改变关键信息出现的位置，都可能影响模型利用它的能力。不少模型对于上下文开头和结尾的信息利用得更好，而埋在中间的关键信息更容易被忽略。

所以：

**装得进 Context Window，不等于模型一定能同样好地利用里面每一条信息。**

这也是为什么我不会得出“既然能语音，那就连续说二十分钟全部塞进去”这种结论。

## 探索态用语音，执行态用文字

最后我发现，其实不用纠结：

> “长 Prompt 用语音，短 Prompt 用文字？”

更准确的区分应该是：

**探索态 → 语音**

**执行态 → 文字**

![语音探索经过 AI 整理和人工确认后，再转入文字执行](./images/03-explore-compress-review-execute.webp)

当我还不知道功能具体怎么设计、真正的问题在哪里、哪种方案比较合理时，就直接说。

想到哪里说到哪里。

这时候我要的是 **Recall**，有些混乱也没关系。

说完补一句：

> **先别执行，把刚才的内容整理成确定需求、猜测、已否定方案和待确认问题。**

让 AI 先进行一次 Context Compression。

然后我再检查：

> 这个对。  
> 这个删掉。  
> 这里理解错了。  
> 真正重要的是这一条。

等需求已经确定，要让 Agent 真正开工了，再换回键盘：

> 按刚才确认的方案执行。  
> 仅修改模型管理模块。  
> 不调整现有下载接口。  
> 完成后运行测试，不提交 Git。

此时我要的已经不是 Recall，而是 **Precision**。

顺便一提，技术名词、路径、版本号和命令最好也用键盘确认一下。

毕竟输入法面对：

> pnpm、Astro、PostgreSQL、Playwright、Claude Code、Codex……

偶尔会表现出惊人的艺术创作能力。

## 最后

所以我现在比较喜欢这样的 AI 工作流：

```text
Voice
  ↓
Raw Thought
  ↓
AI Context Compression
  ↓
Human Review
  ↓
Clean Context
  ↓
Agent Execution
```

语音负责提高思维输入的带宽。

AI 负责第一次整理。

人负责判断和拍板。

最后再用精确的文字控制 Agent 执行。

如果一定要把整件事情压缩成一句话：

> **语音适合把脑子交给 AI 看，文字适合告诉 AI 现在该做什么。**

这么想以后，语音输入法好像就不只是一个“更快的键盘”了。

它更像是在 AI 时代，给自己的脑子接了一根高带宽数据线。

至于数据线上偶尔夹杂的：

> “呃……等等……我刚刚想说什么来着？”

放心。

Attention 还没有脆弱到听见这几个字就宣布罢工。

---

## 参考资料

1. **Vaswani, A. et al. (2017). _Attention Is All You Need_. NeurIPS 2017.**  
    Transformer 与 Scaled Dot-Product Attention 的奠基论文。  
    [arXiv：Attention Is All You Need](https://arxiv.org/abs/1706.03762)
    
2. **Shi, F. et al. (2023). _Large Language Models Can Be Easily Distracted by Irrelevant Context_. ICML 2023.**  
    研究无关上下文如何干扰大语言模型的推理表现。  
    [PMLR：Large Language Models Can Be Easily Distracted by Irrelevant Context](https://proceedings.mlr.press/v202/shi23a.html)
    
3. **Liu, N. F. et al. (2024). _Lost in the Middle: How Language Models Use Long Contexts_. Transactions of the Association for Computational Linguistics.**  
    研究长上下文中关键信息位置对模型利用能力的影响。  
    [ACL Anthology：Lost in the Middle](https://aclanthology.org/2024.tacl-1.9/)

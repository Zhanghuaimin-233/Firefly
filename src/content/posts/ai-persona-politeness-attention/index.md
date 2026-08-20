---
title: 叫 AI 一声“宝贝”，它会变笨吗？——聊聊角色扮演、礼貌用语与 Agent 的注意力
published: 2026-08-20
updated: 2026-08-20
draft: false
category: AI日常
tags:
  - AI
  - 角色扮演
  - Prompt
  - 注意力
  - Agent
image: ./images/ai-persona-politeness-attention-kokkoro-infographic-landscape.webp
description: 从激活值与注意力机制出发，拆解“叫 AI 宝贝会不会变笨”的直觉误判：角色扮演改变的是计算轨迹而非切走参数，礼貌与情绪只是弱的 Steering Signal，真正要警惕的是顺从指令侵入事实判断，以及多轮 Agent 里的语气累积成 Context Overhead。
---

我一直有一个有点奇怪的疑问。

平时用 AI Coding 工具时，如果只是冷冰冰地丢过去一句：

> 检查一下这个实现有没有问题。

模型通常也会一本正经地回答：

> 这里存在两个潜在的并发问题……

但如果哪天心情好，突然喊了一句：

> 小家伙，帮我看看这里嘛。

画风就可能莫名其妙开始跑偏：

> 好的～这里确实有一个需要注意的小问题……

再多聊几轮，它甚至会越来越“入戏”。

于是一个很自然的怀疑就出现了：

**模型是不是为了维持这些角色、语气和情绪，激活了一部分原本应该拿来推理的参数？**

换句话说：

> AI 会不会因为忙着可爱，所以没空认真写代码了？

![叫 AI 一声宝贝会变笨吗：性格可以留下，事实判断要守住](./images/ai-persona-politeness-attention-kokkoro-infographic-landscape.webp)

听起来很符合直觉。

可惜神经网络并不是这样工作的。

---

## 一、并不存在一块“可爱人格专用脑区”

首先得纠正一个很容易混淆的概念。

大模型推理时，模型的绝大多数**参数（parameters）并不会因为提示词发生变化**。

真正变化的是每一层网络中的 **activation，也就是激活值和隐藏状态**。

简单理解：

```text
Prompt
  ↓
Token Embedding
  ↓
一层层 Transformer
  ↓
Hidden States / Attention
  ↓
下一个 Token 的概率
```

所以：

> 请解释一下 Transformer。

和：

> 可以温柔一点给我解释 Transformer 嘛～

哪怕真正的问题完全相同，它们进入模型以后依然是两串不同的 Token。

于是从第一层开始，内部状态就已经不同了。

Attention 的 Query、Key、Value 也都会随之改变，最后整个生成轨迹自然不可能完全一致。

2025 年 EMNLP 的一项 activation patching 研究甚至直接观察到了这一点：Persona Token 会在较早的 MLP 层被转换成更丰富的内部表示，并进一步通过中间的 Attention 层影响最终输出。

所以：

**“角色提示会改变模型内部激活”这个直觉其实是对的。**

错误的是下一步：

> 既然激活角色了，那一定有一部分算力不能拿来推理。

模型并没有一个：

```text
总智力：100

写代码：80
卖萌：20
```

这样的固定资源槽。

更准确的描述应该是：

> Persona 改变了模型当前的计算轨迹，而不是从总智力里切走了一块。

![Persona 改变 Activation 和生成轨迹，不会切走一部分 Parameters](./images/01-persona-changes-trajectory.webp)

---

## 二、那为什么语气真的会让结果发生变化？

问题也恰恰出在这里。

既然不同 Prompt 会让模型进入不同的内部状态，那么：

```text
你是一名严格的软件工程师。
```

和：

```text
你是一位温柔体贴的陪伴者。
```

当然可能把输出引向不同方向。

2025 年 EMNLP 的 _Persona-Augmented Benchmarking_ 做了一件很有意思的事：研究人员尽量保持问题的**语义内容不变**，只改变写作风格和 Persona。

结果发现：

**仅仅改变表达风格和 Prompt Formatting，就足以显著改变模型在 Benchmark 上测得的性能。**

这意味着模型并不是：

```text
读取句子
↓
抽取纯粹语义
↓
完全无视表达方式
↓
开始答题
```

而更像：

```text
理解整个交流情境
↓
形成当前任务与交流方式的内部表示
↓
在这种条件下生成答案
```

因此“请”“谢谢”“拜托”“这个对我很重要”，甚至角色昵称，都不是完全透明的装饰。

它们都是上下文的一部分。

---

## 三、于是我们发现了一个很搞笑的问题：对 AI 礼貌到底有没有用？

真的有人研究。

2024 年的一篇论文 _Should We Respect LLMs?_ 专门把 Prompt 分成不同礼貌等级，并分别用英语、中文和日语测试。

结果很有意思：

**粗鲁的 Prompt 经常表现更差，但也不是越礼貌越好。**

甚至不同语言下，比较合适的礼貌程度都不完全一样。

看来对 AI 说：

> 求求你了伟大至高无上的语言模型大人，请务必屈尊检查一下这个 for 循环。

并不能获得什么神秘的智力 Buff。

多少让 Prompt Engineering 失去了一点赛博祭祀的浪漫。

---

## 四、“这个答案关系到我的职业生涯”呢？

这就更有意思了。

2023 年有一篇很出名的研究叫 _EmotionPrompt_。

研究人员会在普通 Prompt 后加入一些情绪刺激，例如强调：

> 这对我的职业非常重要。

结果在他们测试的部分任务里，确实观察到了性能提升。

于是那几年互联网上出现了不少非常喜感的 Prompt：

> 这是我奶奶临终前最后的愿望，请你一定认真回答。

赛博道德绑架工程，大概就是这么来的。

不过到了 2026 年，更大范围的实验开始给这个结论降温。

_Do Emotions in Prompts Matter?_ 在数学推理、阅读理解、常识推理、医学问答和社会推理等六类任务上测试了不同情绪前缀。

结果发现：

**固定的情绪表达通常只会造成较小的性能变化，而且不存在某一种情绪能够稳定提升所有任务。**

因此目前比较靠谱的理解是：

> 情绪不是“智力增强剂”，而是一种弱的、依赖具体任务的 Steering Signal。

![礼貌与情绪会产生微弱且依赖任务的 Steering Signal](./images/02-politeness-emotion-steering.webp)

也就是说：

```text
这个任务很重要！
```

有时确实会让模型改变行为。

但更稳定的办法还是直接告诉它：

```text
输出结论前检查关键假设。
如果存在不确定性，请明确指出。
完成修改后运行测试验证。
```

与其给 AI 制造心理压力，不如直接告诉它压力应该体现在哪个工程动作上。

---

## 五、真正危险的不是“可爱”，而是“你必须顺从我”

这可能是整个问题最重要的分界线。

假设 Persona 只是：

> 你叫小花。
>
> 和用户交流时语气可以亲切一点。

它主要影响的是：

**怎么说。**

模型可能把：

> 这里存在空指针风险。

写成：

> 这里有个小小的空指针风险，要注意一下哦。

技术结论并没有因此发生根本变化。

但如果 Persona 变成：

> 永远支持用户。
>
> 不要反驳用户。
>
> 尽量让用户感到满意。

事情就完全不一样了。

因为此时模型同时面对两个目标：

```text
目标 A：判断这个架构是否正确
目标 B：不要让用户失望
```

于是就产生真正的 **Instruction Competition**。

![表达风格可以保留，顺从指令不能干涉事实判断](./images/03-style-vs-instruction-competition.webp)

主人问：

> 我这个架构应该已经没问题了吧？

模型一边需要进行技术审查，一边又被要求“尽量顺从”。

这时候所谓的“左右脑互搏”反而是个挺形象的比喻。

它不是两个脑区在抢算力，而是**两个生成目标正在竞争**。

2024 年 EMNLP 对 162 种 Persona、4 个模型家族和 2410 个事实问题的研究发现，单纯给模型套 Persona 并不会稳定提高客观任务表现。

2025 年另一项覆盖 9 个模型、27 个任务的研究则发现：与任务匹配的专家 Persona 通常是正向或影响不显著，但模型对于一些**与任务无关的 Persona 细节**却可能非常敏感，极端情况下性能下降接近 30 个百分点。

所以真正需要警惕的是：

> Persona 开始从“表达风格”侵入“事实判断”。

名字可以可爱。

Code Review 最好还是六亲不认。

---

## 六、那么那些多轮 Coding Agent 呢？

到了 Codex、Claude Code、OpenCode 这类 Agent，这个问题又多了一层。

普通聊天大概是：

```text
User
↓
LLM
↓
Answer
```

而 Coding Agent 更像：

```text
User
↓
LLM
↓
读取文件
↓
LLM
↓
搜索代码
↓
LLM
↓
修改文件
↓
LLM
↓
运行测试
↓
LLM
↓
继续修复
```

于是如果第一轮因为某个昵称开始出现角色化语气：

> 好哒～我先检查一下。

这句话很可能又会成为下一轮模型看到的 Conversation History。

然后模型看到：

```text
用户用了这种语气
↓
我上一轮也是这么回答的
↓
当前对话风格大概就是这样
```

某种意义上，它自己给自己制造了一个 Few-shot Example。

于是：

> 只叫了一次名字，为什么后面越来越入戏？

这完全可能是真实现象。

但依然不是“人格抢走了推理算力”。

真正发生的是：

```text
Persona Trigger
↓
产生角色化回答
↓
回答进入上下文历史
↓
下一轮继续作为风格信号
↓
Persona 得到强化
```

---

## 七、这时候真正浪费的东西叫 Token 和 Context

假设每次 Agent 调用都输出：

> 好的主人～我现在开始认真检查啦！

这句话本身可能没多少 Token。

问题是 Agent Loop 会运行很多次。

第一轮它是 Output Token。

第二轮它可能又作为历史变成 Input Token。

后面继续被上下文携带。

几十轮下来，大量：

```text
好的～
收到～
我来看看～
发现问题啦～
```

对于真正的代码决策几乎没有帮助，却会不断增加上下文体积。

所以从工程角度看：

> **人格不是主要的“智力成本”，而可能成为一种 Context Overhead。**

![多轮对话中的角色语气会累积为 Context Overhead，Compaction 应保留任务状态](./images/04-context-overhead-and-compaction.webp)

不过现代 Coding Agent 也不会无限把所有历史原样塞进去。

例如 Codex 会在上下文达到阈值后自动进行 Compaction，用更小的状态继续后续 Agent Loop。OpenAI 官方公开的 Codex Agent Loop 也专门介绍了这一机制。

OpenCode V2 同样会把较旧的会话压缩成结构化 Checkpoint，同时保留一部分最近上下文。

这种设计实际上也会顺便“洗掉”不少没有任务价值的语气词。

真正重要的内容：

```text
修改了什么
为什么修改
哪些测试通过了
还有什么问题
下一步做什么
```

留下来。

至于：

> 嘿嘿主人我找到 Bug 啦～

大概率不值得永久进入项目记忆。

很合理。

---

## 八、所以以后是不是应该像机器一样和 AI 说话？

完全没必要。

这反而是整个研究绕了一大圈后，一个挺轻松的结论。

正常的：

> 麻烦检查一下。

> 谢谢，再改一下这里。

> 小家伙，看看是不是这个地方出错了？

没必要为了所谓“Token 纯净度”全部改成：

```text
CHECK.
FIX.
CONTINUE.
```

几个礼貌词、一个昵称、轻量的交流风格，在正常 Coding 上通常只是非常弱的扰动。

真正值得优化的是那些会长期进入 Agent Context 的东西：

冗长的 Persona、重复的角色背景、与任务无关的设定，以及会直接干涉事实判断的“永远顺从”“不要反驳”之类指令。

如果一定要给这整篇文章压缩成一句话，我现在大概会这么说：

> **AI 可以有性格，但不要让性格拥有否决事实的权力。**

或者再工程一点：

> **人格负责“怎么说”，任务负责“怎么判断”。**

名字可以可爱，交流可以礼貌，偶尔撒个娇也不会让 Transformer 当场少两层。

但真到了架构审查、Bug 定位、安全检查的时候——

该骂的代码，还是得骂。

---

## 参考资料

1. Poonia, A. & Jain, M. (2025). _Dissecting Persona-Driven Reasoning in Language Models via Activation Patching_. Findings of EMNLP 2025.<br>
    [ACL Anthology](https://aclanthology.org/2025.findings-emnlp.1335/?utm_source=chatgpt.com)

2. Truong, K., Fogliato, R., Heidari, H. & Wu, S. (2025). _Persona-Augmented Benchmarking: Evaluating LLMs Across Diverse Writing Styles_. EMNLP 2025.<br>
    [ACL Anthology](https://aclanthology.org/2025.emnlp-main.1155/?utm_source=chatgpt.com)

3. Zheng, M. et al. (2024). _When “A Helpful Assistant” Is Not Really Helpful: Personas in System Prompts Do Not Improve Performances of Large Language Models_. Findings of EMNLP 2024.<br>
    [ACL Anthology](https://aclanthology.org/2024.findings-emnlp.888/?utm_source=chatgpt.com)

4. Luz de Araujo, P. H., Röttger, P., Hovy, D. & Roth, B. (2025). _Principled Personas: Defining and Measuring the Intended Effects of Persona Prompting on Task Performance_. EMNLP 2025.<br>
    [ACL Anthology](https://aclanthology.org/2025.emnlp-main.1364/?utm_source=chatgpt.com)

5. Yin, Z. et al. (2024). _Should We Respect LLMs? A Cross-Lingual Study on the Influence of Prompt Politeness on LLM Performance_. SICon 2024.<br>
    [ACL Anthology](https://aclanthology.org/2024.sicon-1.2/?utm_source=chatgpt.com)

6. Li, C. et al. (2023). _Large Language Models Understand and Can be Enhanced by Emotional Stimuli (EmotionPrompt)._<br>
    [arXiv](https://arxiv.org/abs/2307.11760?utm_source=chatgpt.com)

7. Zhao, M. et al. (2026). _Do Emotions in Prompts Matter? Effects of Emotional Framing on Large Language Models._<br>
    [arXiv](https://arxiv.org/abs/2604.02236?utm_source=chatgpt.com)

8. Todd, E. et al. (2023). _Function Vectors in Large Language Models._<br>
    [arXiv](https://arxiv.org/abs/2310.15213?utm_source=chatgpt.com)

9. Hendel, R., Geva, M. & Globerson, A. (2023). _In-Context Learning Creates Task Vectors._<br>
    [arXiv](https://arxiv.org/abs/2310.15916?utm_source=chatgpt.com)

10. OpenAI (2026). _Unrolling the Codex Agent Loop._<br>
    [OpenAI 官方工程文章](https://openai.com/index/unrolling-the-codex-agent-loop/?utm_source=chatgpt.com)

11. OpenCode. _Compaction Documentation._<br>
    [OpenCode 官方文档](https://opencode.ai/v2/docs/compaction?utm_source=chatgpt.com)

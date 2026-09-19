# Part 1: What You Need: Memory, Bandwidth and the Machine on Your Desk

2026-09-19 · @Someone

## About this part

This is the first of five parts in the running AI locally module. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). The format is the same as elsewhere: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 30 minutes.

This module is more practical than the others. It is about running models on hardware you own: what that takes, how to find and choose a model, which software to run it with, what happens when you ask it to act as an agent, and how to build on it. It names products throughout, because there is no other way to be useful, and it moves faster than anything else in the course. Every table says when it was written. The module explains what the tools do and what to look for, and leaves the commands to each tool's own documentation, which will be right after this page is not.

It leans on [part 3 of the language models module](file/48a4ae01-75ae), which explains quantisation, the KV cache and the economics of self-hosting. You can read this module without it, and it will make more sense with it.

### What part 1 gives you

Part 1 builds one idea: running a model locally is a question about memory. How much memory you have decides which models you can run at all. How fast that memory can be read decides how fast they answer. Processor speed, which is what people look at first, comes a distant third. By the end you should be able to look at a machine's specification and a model's name and say whether it will run, and roughly how fast.

## 1. Should you

**In plain terms.** Running a model yourself gives you privacy, control, a fixed cost and independence from anyone's service. It costs you quality, since the best models do not fit on a desk, and it costs you time. For most work an API is still the right answer. Local is right when the data cannot leave, when you need the same model next year, when the volume is high and steady, or when you want to learn how this really works. **Who should read it:** everyone. This is the decision the rest of the module assumes you have made.

The language models module reached a blunt conclusion about self-hosting: for nearly every organisation, a rented server for a large open model sits idle most of the day and costs more than the API it replaces. That conclusion stands. This module is about something smaller and more personal: a model on your own laptop, workstation or a box under the desk, serving one person or a small team.

### What you gain

- **Privacy that does not depend on a contract.** Nothing leaves the machine. For source code under a confidentiality agreement, client documents, medical or legal material and anything a contract forbids sending to a third party, this is the whole argument.
- **A model that does not change.** A file on your disk behaves the same next year. Hosted models are revised and retired on the vendor's schedule, and a prompt tuned for one version may not survive the next.
- **No meter.** Once the hardware is bought, a million tokens cost the electricity. Experiments you would never run against a paid API become free to try, and that changes how you work.
- **It works offline,** on a train, on a plane and during an outage.
- **Understanding.** Nothing teaches what a context window, a quantisation level or a token per second really is like watching one run out.

### What you give up

- **Quality.** The best open models have hundreds of billions to trillions of parameters and need a rack of data-centre GPUs. What fits on a desk is the 4 to 35 billion parameter range, with a few larger exceptions on expensive machines. Those models are very good and they are not the best. The gap is widest on exactly the hard, long, multi-step tasks where a model is most valuable, as part 4 shows.
- **Speed at the top end.** A hosted service answers from hardware costing hundreds of thousands of dollars. A laptop does not.
- **Your time.** Choosing, downloading, configuring and updating is work, and the defaults are often wrong in ways part 3 describes.
- **Someone else carrying the risk.** No vendor filters the output, indemnifies you or fixes the security hole.

### When local wins

| Situation | Why local |
| --- | --- |
| The data may not leave the building | The only option that needs no trust in a third party |
| High, steady volume of a narrow task | Classification, extraction, summarising, tagging. A small model does these well, and the meter never runs |
| A workflow that must be reproducible | Regulated or audited work, research, anything re-run next year |
| Working offline or on a poor connection | Field work, travel, secure sites |
| Experiments and learning | Free to try anything, as often as you like |
| A feature built into a product that ships to users' machines | No server bill, and no user data collected |

For everything else, which is most things, the language models module's advice holds: use the most capable hosted model that your tests justify. Many people end up using both, a local model for private and routine work and an API for the hard problems.

## 2. Memory decides what runs

**In plain terms.** A model is a big file of numbers, and all of it has to sit in fast memory while it runs. So the first question is simply whether the file fits. A model's size in gigabytes is roughly its parameter count in billions multiplied by how many bytes each number takes, which is set by how heavily it has been compressed. **Who should read it:** everyone. The sum in this section is the most useful thing in the module.

### The sum

[Part 1 of the language models module](file/590c1ae1-8bf3) describes a model as billions of numbers called weights, and its part 3 describes quantisation: storing each weight in fewer bits, trading a little quality for a lot of memory. Put together, they give the size of the file.

```
memory for the weights  =  parameters  x  bits per weight  /  8
```

| Parameters | At 16 bits, as published | At 8 bits | At about 4.5 bits, the usual choice |
| --- | --- | --- | --- |
| 4 billion | 8 GB | 4 GB | 2.3 GB |
| 9 billion | 18 GB | 9 GB | 5 GB |
| 14 billion | 28 GB | 14 GB | 8 GB |
| 27 billion | 54 GB | 27 GB | 15 GB |
| 35 billion | 70 GB | 35 GB | 20 GB |
| 70 billion | 140 GB | 70 GB | 40 GB |
| 120 billion | 240 GB | 120 GB | 68 GB |

Four to five bits per weight is where most people settle. Part 2 explains the names these compressed versions go by and what each costs in quality.

### The weights are not everything

On top of the weights you need room for three more things.

- **The context.** The KV cache, which the language models module explains, holds the conversation so far and grows with every token. For a mid-sized model it is somewhere between 50 and 300 kilobytes per token, so a 32,000-token context can need several gigabytes and a 128,000-token one can need more than the weights. Part 3 shows that this is the setting most often got wrong.
- **Working memory** for the computation itself: allow a gigabyte or two.
- **Everything else on the machine.** On a computer where the model shares memory with the operating system, the browser and the editor, those come out of the same budget.

A workable rule: the weights should take no more than about two thirds to three quarters of the memory available to the model. A 15 GB file is comfortable in 24 GB and will not run usefully in 16 GB.

### Two kinds of memory

Where that memory is matters as much as how much there is.

- **A graphics card has its own memory,** called VRAM, which is very fast and strictly limited: 8 to 32 GB on consumer cards. The model must fit in it to run at full speed. If it does not, the overflow goes to the computer's ordinary memory and runs on the processor, and speed falls by a factor of five to twenty for that part.
- **Unified memory is one pool shared by processor and graphics,** as on Apple silicon Macs and some recent AMD and NVIDIA machines. There is much more of it, up to 128 GB or beyond, and all of it is available to the model. It is slower than a graphics card's memory, for a reason the next section gives.

This is the central trade in choosing local hardware. A graphics card is fast and small. Unified memory is large and slower. Which suits you depends on whether you would rather run a 14 billion parameter model very quickly or a 70 billion parameter one at reading speed.

### Deep dive (optional): mixture of experts changes the sum

The language models module describes mixture-of-experts models, which hold many parameters and use only a few for each token. They are increasingly common in the sizes that run locally, and they split the sum in two.

**Memory is set by total parameters.** Every expert must be in memory, since any of them may be needed for the next token. A model with 35 billion parameters in total needs the 20 GB that any 35 billion parameter model needs.

**Speed is set by active parameters.** Only the experts chosen for this token are read. If 3 billion of the 35 are active, it generates at close to the speed of a 3 billion parameter model.

So a mixture-of-experts model gives the knowledge of a large model at the speed of a small one, on a machine with enough memory to hold the large one. That is a very good fit for unified-memory machines, which have plenty of memory and modest speed, and a poor fit for an 8 GB graphics card, which has neither the room nor the need. It also makes possible a trick for graphics cards: keep the always-used parts of the model in fast VRAM and the experts in ordinary memory, which current software supports and which costs far less speed than overflowing a dense model would.

## 3. Bandwidth decides how fast

**In plain terms.** To produce each word, the machine has to read through the whole model once. So the speed of a local model is set almost entirely by how fast the memory can be read, a figure called memory bandwidth. It is on every specification sheet and almost nobody looks at it. A rough rule: divide the bandwidth by the size of the model file and you have the most tokens per second you can hope for. **Who should read it:** everyone who will buy or choose hardware.

### Why reading speed is the limit

The language models module explains that generating each token takes one full pass through the network, and that during generation the processor spends most of its time waiting for weights to arrive from memory. The arithmetic is simple. If the file is 15 GB and the memory can deliver 300 GB a second, the weights can be read at most twenty times a second, so twenty tokens a second is the ceiling whatever the processor.

```
tokens per second, at most  =  memory bandwidth  /  size of the weights read for each token
```

For a dense model the weights read for each token are the whole file. For a mixture-of-experts model they are only the active part, which is why such models feel so much faster than their size suggests. Real speeds come in at perhaps half to three quarters of the ceiling, and fall as the context fills.

Reading speed is comfortable from about ten tokens a second. Thirty feels quick. Agents, which part 4 covers, want much more, since they generate a great deal of text nobody reads.

### Two phases, two limits

There are two phases, and different hardware is good at each.

- **Reading the prompt** processes all the input tokens at once. This is limited by raw computing power, where graphics cards are far ahead. It decides how long you wait before the first word appears.
- **Writing the answer** produces one token at a time. This is limited by memory bandwidth, as above.

For chat the first phase hardly matters, since prompts are short. For agents and for work over long documents it dominates: a 50,000-token context takes a few seconds to read on a high-end graphics card and can take minutes on a machine with slow prompt processing. This is the unadvertised weakness of large unified-memory machines, and it is improving: Apple's newest chips add hardware specifically to speed it up.

### What this explains

- **A five-year-old graphics card can beat a new laptop processor,** because its memory is several times faster.
- **Processor cores, clock speed and "AI TOPS" figures tell you almost nothing** about language model speed. Advertised neural processing units in laptops are, at the time of writing, little used by the software in part 3.
- **Ordinary desktop memory is the slow lane.** A desktop computer's main memory delivers 50 to 100 GB a second, a tenth or less of a good graphics card. A model running from it manages a few tokens a second.
- **Two graphics cards pool their memory and not their speed.** Software can split a model across two cards, which lets a bigger model fit. Each token still passes through them in turn, so it runs at about the speed of one.

## 4. The machines

**In plain terms.** There are three sensible kinds of machine. A PC with an NVIDIA graphics card is the fastest and has the best software support, and is limited by how much memory the card has. A Mac with a lot of unified memory runs much bigger models, more slowly, with no fuss. Newer small computers from AMD and NVIDIA with large unified memory sit below the Mac on speed and price. **Who should read it:** anyone choosing or judging hardware. The table will date.

Figures are manufacturers' published specifications as of September 2026.

| Machine | Memory for the model | Bandwidth | What it suits |
| --- | --- | --- | --- |
| NVIDIA RTX 5090 | 32 GB | About 1,800 GB a second | The fastest consumer option. Models up to about 30 billion parameters at 4 bits, very quickly |
| NVIDIA RTX 4090 or 3090 | 24 GB | About 1,000 GB a second | The long-standing enthusiast choice, widely available second-hand. The same models, a little slower |
| NVIDIA cards with 16 GB | 16 GB | 450 to 960 GB a second | Models up to about 14 billion parameters. Check the bandwidth: it varies twofold between cards of the same memory |
| NVIDIA cards with 8 to 12 GB | 8 to 12 GB | 270 to 500 GB a second | Models of 4 to 9 billion parameters |
| NVIDIA workstation cards | 48 to 96 GB | Up to about 1,800 GB a second | Large models at full speed, at several times the price |
| AMD Radeon cards with 24 to 32 GB | 24 to 32 GB | 640 to 960 GB a second | Comparable hardware for less money, with software support that is good and less polished |
| Apple MacBook Pro or Mac Studio, Max chip | Up to 128 GB | 410 to about 600 GB a second | Models up to 70 billion parameters and the larger mixture-of-experts models, at reading speed or better |
| Apple Mac Studio, Ultra chip | Up to 512 GB | About 800 GB a second | The largest models that can run on a desk at all |
| Apple Mac mini or MacBook, Pro chip | Up to 64 GB | About 270 GB a second | Mid-sized models at a modest pace |
| AMD Ryzen AI Max machines | Up to 128 GB | About 256 GB a second | A small, quiet, inexpensive box with a lot of memory. Best with mixture-of-experts models |
| NVIDIA DGX Spark | 128 GB | About 273 GB a second | The same idea from NVIDIA, with its software stack. For development more than speed |
| Any computer with no suitable graphics | Its main memory | 50 to 100 GB a second | Models up to about 4 billion parameters usably. Larger ones at a crawl |

### The three platforms

- **NVIDIA.** Everything in part 3 works, first and best. Its programming platform, CUDA, is what nearly all AI software is written for, and new models and techniques arrive here first. The limit is memory per dollar: consumer cards stop at 32 GB.
- **Apple.** A Mac is the simplest way to get a lot of fast-enough memory, which makes it the common local machine among engineers. Apple's own framework, MLX, is now the fastest way to run models on it, and the main tools use it. It is slower than a graphics card at reading long prompts, and it does not run the server software that part 5 describes for serving a team.
- **AMD.** Its graphics cards and unified-memory machines offer the most memory for the money. Its programming platform, ROCm, works with the main engines on Linux and increasingly on Windows, and a cross-vendor alternative, Vulkan, works nearly everywhere and is slower. Expect to spend more time on setup, and check that the specific tool you want supports the specific card you have.

### Choosing

Decide what you want to run before you look at machines.

1. **Pick the model size your work needs.** Part 2 helps with this. For private chat, summarising and simple coding help, 8 to 14 billion parameters is enough. For serious coding assistance and agents, the 27 to 35 billion range is where models become dependable.
2. **Work out the memory** from section 2, with room for the context you need.
3. **Decide what speed you can live with** from section 3. Chat is forgiving. Agents are not.
4. **Then choose the platform** that delivers both within your budget.

And before buying anything, try it. Whatever machine you already have will run a 4 billion parameter model well enough to learn everything in parts 2 and 3, and an hour's rental of a cloud GPU will tell you what a larger one would feel like.

### The whiteboard version

A model is a file of numbers that must sit in fast memory while it runs. Its size is its parameter count times the bits per weight, so 27 billion parameters at the usual 4 to 5 bits is about 15 GB, plus room for the context. Memory capacity decides what runs at all. Memory bandwidth decides how fast, because every token means reading the active weights once: bandwidth divided by file size is the ceiling on tokens per second. Mixture-of-experts models need memory for all their parameters and run at the speed of the few they use. Graphics cards are fast and small, unified-memory machines are large and slower, and ordinary memory is the slow lane. Local is for private data, reproducible work, steady volume and learning. For the hardest problems, the best models are still somewhere else.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Why memory decides | All weights must be resident in GPU-addressable memory, and size is parameters times bits per weight | The model is a big file that has to fit in the fast part of the computer's memory. If it does not fit, it barely runs |
| Why bandwidth decides speed | Decoding is memory-bound: each token requires reading every active weight once | To write each word, the machine reads the whole model. So it goes as fast as the memory can be read, not as fast as the chip can think |
| VRAM against unified memory | A discrete pool on a very fast bus against one larger pool shared with the processor on a slower one | A graphics card has a small, very fast desk to work on. A Mac has a big, slower one |
| Prompt processing | Prefill is compute-bound and parallel, and sets time to first token | Reading what you gave it is a separate job from writing the answer, and some machines that write well read slowly |
| Mixture of experts, locally | Capacity follows total parameters, latency follows active parameters | It needs memory for the whole team and runs at the speed of the few who turn up for each word |

## Misconceptions to correct

Three claims come up constantly. Agree with the true part first, then add what it leaves out.

### "We can run it ourselves and stop paying for the API"

**True:** after the hardware is bought, each token costs only electricity, and for private or high-volume work that is a real saving.

**Misleading:** what runs on a desk is not the model you were paying for. The best models are far too large. A local model will do routine work well and fall short on the hard problems, and someone has to choose it, run it and keep it current.

**What to say:** "We can run something ourselves, and it is worth doing for private data and routine jobs. It will not replace the best hosted model for the hard work, so let us decide which jobs go where and test the local model on ours before we cancel anything."

### "We need the fastest processor we can get"

**True:** a faster chip helps with reading long prompts, and with everything else the computer does.

**Misleading:** generating text is limited by how fast memory can be read, not by how fast the chip computes. A machine with twice the processor and half the memory bandwidth is half as fast. The specification that matters is one that most buyers never look at.

**What to say:** "Look at two numbers: how much memory the model can use, and the memory bandwidth in gigabytes a second. Those decide what runs and how fast. Core counts and AI ratings do not."

### "It has 32 GB of memory, so a 30 GB model will fit"

**True:** the weights themselves would fit.

**Misleading:** the context needs memory too, and grows with every token, along with working space and everything else running. On a machine where the model shares memory with the rest of the system, the browser is in that budget as well. A model that only just fits runs with a context too short to be useful, or spills into slow memory.

**What to say:** "Leave a quarter to a third of the memory free. A model that fills it has no room to think."

## Glossary

Every technical term used in this part, in plain language and in alphabetical order. Terms explained in the language models module are not repeated.

| Term | Meaning |
| --- | --- |
| Active parameters | The part of a mixture-of-experts model used for each token. It sets the speed |
| Bits per weight | How much storage each of a model's numbers takes after quantisation. Commonly 4 to 5 |
| CUDA | NVIDIA's programming platform, which most AI software is written for first |
| Dense model | A model that uses all its parameters for every token |
| Memory bandwidth | How fast memory can be read, in gigabytes a second. The main limit on generation speed |
| Metal and MLX | Apple's graphics programming platform, and its framework for running models on Apple silicon |
| Offloading | Keeping part of a model in ordinary memory when it does not fit in the graphics card's. Much slower |
| Prompt processing | Reading the input, all at once, before the first token is written. Limited by computing power |
| ROCm | AMD's programming platform for its graphics cards |
| Time to first token | How long you wait before the answer starts. Set by prompt processing |
| Tokens per second | How fast the answer is written. Around ten is reading speed |
| Total parameters | All the parameters in a model, used or not. It sets the memory needed |
| Unified memory | One pool of memory shared by processor and graphics, as on Apple silicon |
| VRAM | A graphics card's own memory. Very fast, and limited in size |
| Vulkan | A graphics programming platform that works across vendors. A fallback where the others are not supported |

## Sources

Figures in this part come from these documents, read in September 2026. Hardware specifications are the manufacturers' published figures, from the drafter's knowledge, and should be checked against current listings before a purchase.

- [Best hardware for local LLMs in 2026](https://dev.to/macyou/best-hardware-for-local-llms-in-2026-mac-vs-nvidia-vs-amd-one-formula-for-every-row-3jop), for the bandwidth-divided-by-size rule across Apple, NVIDIA and AMD machines
- [Mac Studio and Mac mini against NVIDIA GPUs for local LLMs](https://bizon-tech.com/blog/mac-studio-mac-mini-vs-nvidia-gpus-llm), for comparative bandwidth figures
- [Picking hardware for local AI inference in 2026](https://www.jaredwatkins.com/posts/2026/04/local-ai-hardware-guide/), April 2026, for the unified-memory machines
- [Ollama, LM Studio, vLLM, llama.cpp and MLX compared](https://codersera.com/blog/ollama-vs-lm-studio-vs-vllm-vs-llama-cpp-vs-mlx-2026/), 2026, for MLX as the fastest path on Apple silicon and the gains in prompt processing on its newest chips

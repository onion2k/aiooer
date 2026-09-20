# Part 3: Running a Model: Engines, Apps and the Settings That Matter

2026-09-19 · Chris Neale

## About this part

This is the third of five parts in the running AI locally module. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). The format is the same as elsewhere: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 30 minutes.

[Part 1](file/a1c4e7f2-5b38) covered the machine and [part 2](file/d92b6a05-8e13) the model file. This part is about the software in between. It describes what each tool is and what to look for, and leaves installation and commands to each tool's own documentation, which changes monthly and will be right when this page is not.

### What part 3 gives you

Part 3 builds one idea: there are only two or three engines, and everything else is a layer on top of one of them. Knowing which engine is under the app you are using tells you what it can run, how fast, and which settings exist. And one of those settings, the context length, is wrong by default often enough that it accounts for most of the disappointment people have with local models.

## 1. Engines and layers

**In plain terms.** The program that actually runs a model is called an inference engine, and there are only a few. Most people never touch one directly. They use an app that wraps an engine and adds a way to download models and a window to chat in. So "which app" is mostly a question of taste, and "which engine" decides what works. **Who should read it:** everyone.

A useful summary from one 2026 comparison: some of these tools are experience layers, some are engines, and one is a serving system. They are less competitors than different layers of one stack.

| Layer | What it does | Examples |
| --- | --- | --- |
| Engine | Loads the weights and does the arithmetic, on whatever hardware you have | llama.cpp, MLX |
| App | Finds and downloads models, manages them, offers a chat window or a simple command, and runs a local server. Built on an engine | Ollama, LM Studio, Jan and others |
| Serving system | Runs one model for many people at once, efficiently | vLLM, SGLang. Part 5 |
| Harness | Uses a running model to do work: edit code, run commands, act as an agent | Part 4 |

### The engines

**llama.cpp** is the engine under most local software. It is an open source project written in C and C++, which created the GGUF format that part 2 described. Its distinguishing quality is that it runs on anything: NVIDIA, AMD and Intel graphics cards, Apple silicon, ordinary processors with no graphics card at all, phones and single-board computers. It supports every quantisation level in part 2, and it can split a model between a graphics card and ordinary memory when it does not fit. It ships with its own server and a simple web page for chatting, and it can be used directly. New model designs usually work in llama.cpp within days of release, and occasionally take weeks.

**MLX** is Apple's framework for running models on Apple silicon, and the fastest way to do so. Measurements published in 2026 put it at around one and a half times the speed of llama.cpp on the same Mac for dense models, and more for mixture-of-experts models. It runs only on Macs, and uses its own model format, which part 2 described.

That is nearly the whole list. On a Mac, the engine is MLX or llama.cpp. On anything else, it is llama.cpp, until you are serving a team, when part 5's serving systems take over.

## 2. The apps

**In plain terms.** Ollama is the one developers use: a simple command, a local server, and nearly every other tool knows how to talk to it. LM Studio is the one with a proper window, where you browse for models and chat, and it needs no command line at all. Both are free, both run the same engines underneath, and either is a fine place to start. **Who should read it:** everyone choosing a tool. The details date quickly.

As of September 2026:

| Tool | What it is | Runs on | Good for | Watch for |
| --- | --- | --- | --- | --- |
| Ollama | A command-line tool and background service, with a small desktop app. Downloads a model by name, runs it, and serves it on the local machine. Open source. Uses llama.cpp, and since early 2026 MLX on Macs | Mac, Windows, Linux. NVIDIA, AMD and Apple hardware | Developers. It is the default that most harnesses and libraries expect to find | A short default context on smaller machines, which section 3 covers. Its own catalogue of models, under its own short names. It also lists "cloud" models that run on its servers and not on yours |
| LM Studio | A desktop application with a model browser, a chat window, and a local server you can switch on. The app is closed source and free, including for use at work. Uses llama.cpp and MLX | Mac, Windows, Linux | Anyone who prefers a window to a terminal. Comparing models side by side. Seeing at a glance whether a model will fit | Not open source, which rules it out for some organisations |
| llama.cpp, used directly | The engine's own server and command-line tools | Everything | Full control of every setting. Unusual hardware. Building it into a product. The newest features first | You manage model files yourself, and the options are many |
| MLX, used directly | Apple's framework, with command-line tools for language models | Macs only | The best speed on a Mac, and fine-tuning on one | Fewer community conversions than GGUF |
| Jan, GPT4All, Msty and others | Open source desktop chat apps | Mostly all three systems | A fully open source alternative to LM Studio | Smaller projects, which follow new models more slowly |
| Docker Model Runner, and similar | Running models as a service inside a container toolchain | Wherever the toolchain runs | Teams whose development environment already lives in containers | Younger, with fewer models |

### How to choose

If you write software, start with Ollama: it is what the rest of the ecosystem assumes. If you do not, or you want to see what you are doing, start with LM Studio. Move to llama.cpp itself when you hit something the apps do not expose. On a Mac, check that whichever you choose is using MLX.

They coexist without trouble, and a model downloaded for one can usually be pointed at by another, though each keeps its files in its own place and you can easily end up with the same 15 GB file three times.

### Names within names

One source of confusion is worth knowing in advance. Ollama and similar tools keep their own catalogues, in which a model has a short name and a tag, such as a family name followed by a size. That short name stands for one particular conversion at one particular quantisation level, usually 4 bits, chosen by the tool. It is not the full name that part 2 taught you to read, and two tools' short names for "the same" model may be different files. When it matters, look at what the short name resolves to. Both Ollama and LM Studio can also fetch any GGUF file from Hugging Face by its full name.

## 3. The settings that matter

**In plain terms.** Most settings can be left alone. Three cannot. The context length decides how much the model can see, and its default is often far too small. The number of layers on the graphics card decides whether it runs fast or crawls. And the prompt template has to match the model, or it quietly behaves worse. **Who should read it:** everyone who will run a model for more than a quick chat. This section explains most of the complaints about local models.

### Context length

Part 3 of the language models module explains the context window and the KV cache that holds it. A model card will advertise a window of 128,000 or 256,000 tokens. What you get when you run it is whatever the software allocates, which is a separate and much smaller number.

Ollama's documentation states its defaults: 4,000 tokens on a machine with under 24 GB of graphics memory, 32,000 with 24 to 48 GB, and 256,000 with more. Four thousand tokens is about 3,000 words. A single source file, a few turns of conversation and the instructions a coding tool sends before you type anything all exceed it.

What happens next is the important part. The software does not report an error. It discards the oldest text and carries on, and the model answers from what is left. The symptoms look like a stupid model: it forgets the instructions, ignores the file it was just given, loses track after a few turns, or fails to use its tools. The same documentation recommends at least 64,000 tokens for agents, coding tools and web search. Every harness in part 4 says the same.

The setting costs memory, as part 1 explained: tens to hundreds of kilobytes per token, depending on the model. On a 24 GB card with a 16 GB model, a 64,000-token context may not fit at full precision, which leads to the next setting.

- **Check the context length before judging any model.** It is the first thing to look at when a local model seems worse than its reputation.
- **Set it to what the job needs, and no higher.** Memory reserved for context you do not use is memory a better model could have had.
- **Check it took effect.** The tools will show how much memory a loaded model is using and whether it is on the graphics card.

### Fitting it on the graphics card

An engine loads a model layer by layer, and each layer goes either to the graphics card or to ordinary memory. Part 1 explained the cost: anything not on the card runs many times slower.

The apps choose automatically, and a model that mostly fits will be split without telling you. If generation is much slower than part 1's sum predicts, this is the usual reason. The tools report the split. The fix is a smaller model, a lower quantisation level from part 2, a shorter context, or the next setting.

For mixture-of-experts models there is a better split than layer by layer, which part 1 mentioned: keep the parts every token uses on the card and the experts in ordinary memory. llama.cpp supports this, and it makes models of 30 billion parameters and more usable on a 16 GB card.

### Squeezing the context

Two settings reduce what the context costs.

- **Flash attention** is a faster, leaner way of computing attention that gives the same results. Most tools now turn it on by default. If yours has not, turn it on.
- **Quantising the KV cache** stores the context at 8 bits in place of 16, halving its memory for a loss in quality that is usually too small to notice. Four bits is available and does cost quality. At 8 bits this is often what makes a long context fit.

### The prompt template

Part 1 of the language models module explains that a chat is one long token sequence with special markers between turns. Every model family uses different markers, and a model only behaves as trained when it sees its own.

A GGUF file carries its template inside it, and the apps apply it for you, so this normally just works. It goes wrong in three situations: a conversion made with a faulty template, which the community usually finds and fixes within days of a model's release, which is a reason not to download on day one; a tool that overrides the template with its own; and tool calling, which part 4 covers, where the template also defines how the model asks to use a tool. The symptom is subtle. The model works, and is noticeably worse than it should be, or never calls a tool.

### Sampling

Temperature and the related settings are explained in part 1 of the language models module. The practical point for local use is that model cards now state recommended values, which differ between families and between a model's thinking and non-thinking modes, and the models are sensitive to them. A model that rambles, repeats itself or loops is often running with the wrong ones. Use the card's.

### Deep dive (optional): speculative decoding

Part 3 of the language models module describes speculative decoding: a small draft model guesses several tokens ahead and the large model checks them all in one pass, accepting those it agrees with. The output is identical to what the large model would have produced alone, and arrives faster.

It suits local use well, because part 1's bottleneck is reading the weights, and checking five tokens costs barely more than producing one. The engines support it, and some publishers now release a matched draft model alongside the main one: those are the files marked `draft`, `assistant` or `eagle` that part 2 listed. Gains of one and a half to two and a half times are typical, more for predictable text such as code, and less for mixture-of-experts models, which are already reading little. The draft model needs memory of its own.

## 4. The local server

**In plain terms.** Every one of these tools can run as a small server on your own machine that answers in the same format as the big hosted services. That means any program written to use a hosted model can be pointed at your local one by changing an address. It is what makes a local model useful for more than chatting. **Who should read it:** developers, and anyone who will read part 4.

The hosted services settled, more or less, on one format for requests and responses, first defined by OpenAI's API: a list of messages in, a message out, with optional tool definitions and streaming. llama.cpp, Ollama, LM Studio, MLX and vLLM all provide a server that accepts that format on the local machine.

So a local model is, to other software, just another provider. The harnesses in part 4, editor extensions, libraries and your own scripts need an address and a model name. Nothing else changes. This is also how the two ways of working combine: the same code can use a local model for private or routine work and a hosted one for the hard cases, as part 5 describes.

Four cautions.

- **"Compatible" is approximate.** The basic chat format works everywhere. Tool calling, structured output, images and reasoning fields vary between servers and between models, and a newer format from one vendor is supported by some local servers and not others. When a tool misbehaves with a local model, this is the second thing to check, after the context length.
- **The server is unprotected.** By default these servers listen only on the local machine, accept any request and need no password. That is fine. Making one reachable from the network, which is one setting, exposes an open, unauthenticated service. Anyone who can reach it can use it and, depending on the tool, load and delete models. Put it behind something that checks who is asking, or do not expose it.
- **One request at a time, by default.** The apps are built for one user. Part 5 covers serving several.
- **Loading takes time.** The first request after a model is loaded waits while gigabytes are read from disk. The apps unload idle models after a few minutes, and a slow first answer is that and not a fault.

## 5. Knowing how fast it is

**In plain terms.** Two numbers describe a local model's speed: how fast it reads what you give it, and how fast it writes. The tools will show you both. Compare them with what part 1 says your machine should manage, and if they are far below it, something is on the wrong side of the graphics card. **Who should read it:** everyone who has a model running.

The tools all report, for each response, the prompt processing speed and the generation speed, both in tokens per second. llama.cpp includes a benchmarking tool that measures both under controlled conditions, and the apps show them in the chat window or a verbose mode.

- **Generation speed** should be within sight of part 1's ceiling: memory bandwidth divided by the size of the weights read for each token. Half to three quarters of the ceiling is normal. A fifth of it means part of the model is in ordinary memory.
- **Prompt processing speed** is usually ten to a hundred times the generation speed, and is what sets the wait before the first word. For an agent that sends 30,000 tokens of instructions and files with every request, it matters more than generation speed.
- **Both fall as the context fills,** since there is more to attend to. Measure at the context length you will use.
- **Thinking models hide their cost.** A model that writes two thousand tokens of reasoning before a fifty-token answer has, at thirty tokens a second, kept you waiting over a minute. For interactive use, a non-thinking mode or a faster model is often the better trade.

Useful speeds, as a rough guide: ten tokens a second is reading speed and fine for chat. Thirty is comfortable. Agents want fifty or more, along with prompt processing in the thousands, because they generate and re-read a great deal of text that no person reads.

### The whiteboard version

There are two engines that matter locally: llama.cpp, which runs GGUF files on anything, and MLX, which is faster on Macs. Ollama and LM Studio are apps built on them, one for the command line and one with a window, and both can serve a model on your own machine in the format the hosted services use, so any tool can be pointed at it. Three settings decide whether it works. Context length defaults to as little as 4,000 tokens, and text beyond it is silently discarded: set it to what the job needs, 64,000 for agents, and check the memory. Make sure the model is actually on the graphics card. And make sure the prompt template is the model's own. Quantise the KV cache to 8 bits if the context will not fit. Then measure both speeds against what the hardware should deliver.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Engine and app | An inference runtime, and a management and interface layer built on it | The engine does the work. The app is the dashboard. Several apps share the same engine |
| Context length setting | The KV cache allocation at load time, independent of the model's trained maximum | How much the model can see at once. The box says 128,000 tokens, and the software may quietly give it 4,000 |
| Silent truncation | Tokens beyond the allocated window are dropped, oldest first, with no error | When it runs out of room it forgets the beginning, without telling anyone, and then looks stupid |
| GPU offload | The number of layers placed in VRAM, with the remainder run from system memory | Whether the whole model is on the fast part of the machine. If a slice is not, the whole thing slows to a crawl |
| OpenAI-compatible server | A local HTTP endpoint implementing the chat completions interface | The model answers in the same format as the big services, so any tool can use it by changing an address |

## Misconceptions to correct

Three claims come up constantly. Agree with the true part first, then add what it leaves out.

### "We tried a local model and it was useless"

**True:** local models are weaker than the best hosted ones, and some tasks are beyond them.

**Misleading:** the commonest cause of a useless local model is a context of a few thousand tokens, silently discarding most of what it was given. The second is a model half in slow memory, and the third a wrong prompt template. Each makes a good model look bad, and none is reported as an error.

**What to say:** "Before we write it off: what was the context length set to, was it all on the graphics card, and was it the recommended model for that tool? Most bad first impressions are one of those three."

### "The model supports 256,000 tokens, so we can give it the whole repository"

**True:** the model was trained to handle that much, and the card says so.

**Misleading:** what it gets is what the software allocates and the memory allows. A context that long can need more memory than the model itself, and reading it can take minutes on hardware with slow prompt processing. Part 3 of the language models module also explains that quality falls well before the advertised limit.

**What to say:** "The limit on the box is what it was trained for, not what our machine can hold. Let us work out what context fits in memory beside the model, and test at that."

### "Ollama and LM Studio are different AIs"

**True:** they look different, name models differently and can give different results.

**Misleading:** they are front ends to the same one or two engines, running the same model files. Differences in results come from different default settings and, sometimes, a different conversion of the model behind the same short name.

**What to say:** "They are two dashboards on the same engine. If they disagree, compare the settings and the exact model file before comparing the apps."

## Glossary

Every technical term used in this part, in plain language and in alphabetical order. Terms from earlier parts and the language models module are not repeated.

| Term | Meaning |
| --- | --- |
| Draft model | A small model that guesses ahead for a large one in speculative decoding |
| Flash attention | A faster, leaner way of computing attention with identical results |
| Inference engine | The program that loads a model's weights and runs it |
| KV cache quantisation | Storing the context at lower precision to save memory. Eight bits costs little |
| Layer offload | How many of a model's layers are placed on the graphics card. The rest run slowly from ordinary memory |
| llama.cpp | The open source engine under most local software. Runs GGUF files on almost any hardware |
| LM Studio | A desktop application for finding, running and serving local models |
| Local server | A model served on your own machine in the same format the hosted APIs use |
| MLX | Apple's framework for running models on Apple silicon |
| Ollama | A command-line tool and service for downloading, running and serving local models |
| Prompt template | The markers a model expects between the turns of a conversation. Carried inside a GGUF file |
| Silent truncation | Dropping the oldest text when the context is full, without reporting it |

## Sources

Behaviour and figures in this part come from these documents, read in September 2026. Defaults change between versions, so check each tool's current documentation.

- [Ollama: context length](https://docs.ollama.com/context-length), for the defaults of 4,000, 32,000 and 256,000 tokens by graphics memory, the recommendation of at least 64,000 for agents and coding tools, and how to check that a model is on the graphics card
- [Ollama, LM Studio, vLLM, llama.cpp and MLX compared](https://codersera.com/blog/ollama-vs-lm-studio-vs-vllm-vs-llama-cpp-vs-mlx-2026/), 2026, for the layers of the stack, Ollama's move to MLX on Apple silicon, the speed of MLX against llama.cpp, and the engines under each app
- [llama.cpp against vLLM](https://developers.redhat.com/articles/2026/06/15/llamacpp-vs-vllm-choosing-right-local-llm-inference-engine), Red Hat, June 2026, for when each engine is the right choice
- [Best open-source agent harnesses for local LLMs](https://www.marktechpost.com/2026/09/18/best-open-source-agent-harnesses-for-local-llms-in-2026/), September 2026, for silent truncation and the context lengths that coding tools need
- [llama.cpp](https://github.com/ggml-org/llama.cpp), for the engine, its server and its supported hardware

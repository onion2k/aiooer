# Part 5: Building on It: From Your Own Code to a Shared Service

2026-09-19 · Chris Neale

## About this part

This is the last of five parts in the running AI locally module. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). The format is the same as elsewhere: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 25 minutes.

Parts 1 to 3 got a model running, and [part 4](file/b7d15e92-4c60) put an agent on it. This part is about building things of your own on a local model: calling it from code, searching your own documents, running the other kinds of model, serving colleagues, and knowing when to stop.

### What part 5 gives you

Part 5 builds one idea: a local model is a component, and the design rules for building with models apply to it unchanged, with two differences that work in your favour. Calls cost nothing, so designs that would be extravagant against a paid API, such as trying five times and checking each, become sensible. And small models can be forced to produce valid structured output, which removes a whole class of failure. Used within those strengths, a modest local model does a surprising amount of real work.

## 1. Calling it from code

**In plain terms.** Your programs talk to a local model exactly as they would to a hosted one, by sending a request to an address. Only the address changes. That means you can write the code once and decide later, or per task, whether a local or a hosted model answers. **Who should read it:** developers.

Part 3 described the local server and its compatible format. The practical consequence is that the client libraries published for the hosted services work against a local model when given a different address, and the higher-level libraries treat a local server as one more provider.

[The practical AI module](file/f3a91c20-6d4e) covers how to build with models: prompts as code, structured output, tools, retrieval and evaluation. All of it applies. Three points are particular to local models.

### Design for the model you have

A small model follows a short, explicit prompt with one job in it far better than a long one with several. Where a hosted model would take a page of instructions and a complex task, a local one does better with the task broken into steps in your own code, each a simple call: classify, then extract, then summarise. Part 2 of the language models module makes the point that small models do well when the facts are in front of them and the task is narrow. Build for that.

### Force the structure

Part 1 of the language models module explains that token choice is ordinary code, so a system can mask out any token that would break a format. The local engines expose this directly. You supply a JSON schema, or a formal grammar, and the engine permits only tokens that keep the output valid. The result always parses.

This matters more for small models than large ones, because malformed output is one of their commonest failures, and it removes that failure entirely. It guarantees the shape and not the content: a field will be present and of the right type, and may still be wrong. For extraction, classification, routing and anything feeding another program, use it by default.

### Spend calls freely

Against a paid API, every call is a cost, and designs are shaped by that. Locally, calls are free and the only budget is time. That changes what is sensible.

- **Try several times and check.** Generate five candidates and keep the one that passes a test, or the one most of them agree on. The language models module's idea that verification converts compute into reliability is cheapest to apply here.
- **Use a second call as a checker.** Ask the model, in a separate request, whether the output meets the instruction.
- **Process everything.** Tag every document, summarise every ticket, check every commit message. Jobs that would never justify an API bill are an overnight run.
- **Run your evaluations often.** [Part 3 of the practical AI module](file/f3a91c20-6d4e) says to test prompts like code. A local test set of a few hundred examples can be run on every change.

## 2. Your own documents

**In plain terms.** A local model knows nothing about your files until they are put in front of it. The usual way is to search your documents for the passages relevant to a question and hand those to the model with the question. Every piece of that, the search included, can run on your own machine, so nothing confidential leaves it. **Who should read it:** anyone who wants a private assistant over their own material.

[Part 8 of the practical AI module](file/0b8e5d17-f4c2) explains retrieval-augmented generation in full: split documents into passages, turn each into a vector with an embedding model so that similar meanings land close together, search by meaning and by keyword, rerank, and put the best passages in the prompt. Nothing about that changes locally. What changes is that all of it can run beside the model.

- **Embedding models are small.** Part 2 listed them among the things a name can tell you. Good ones have from a few hundred million to a few billion parameters, run quickly on a processor with no graphics card at all, and are published under the same licences as chat models. The local tools in part 3 serve them alongside chat models.
- **The index can be a file.** For thousands to a few million passages, a vector index inside an ordinary embedded database is enough. No server is needed.
- **Rerankers are small too,** and run locally in the same way.

This is the strongest case for local AI. A private assistant over contracts, client files, medical notes, source code or a lifetime of personal notes is exactly the thing people will not send to a third party, and it plays to a small model's strength, since part 2 of the language models module notes that small models do well when the facts are in front of them.

Two cautions apply with more force to a small model. A small model is more easily distracted by irrelevant passages, so retrieve fewer and better ones. And part 3's context setting applies: retrieved passages need room, and a 4,000-token default will silently discard them.

## 3. Other kinds of local model

**In plain terms.** The same machine that runs a language model can run models that transcribe speech, speak text, make images and read images. Most are smaller than a language model and some work very well locally. **Who should read it:** anyone building more than a chat box.

| Kind | Local state of the art, in brief | Notes |
| --- | --- | --- |
| Speech to text | Excellent. Open models transcribe many languages at better than real time on a laptop | The clearest local success. Meetings, dictation and interviews never need to leave the machine |
| Text to speech | Good. Small open models produce natural speech in real time | The voice-cloning cautions in [part 4 of the generative media module](file/c5d82e16-0f9b) apply to the local tools just as much, and they have no filters |
| Reading images | Good. Many current open language models accept images as well as text, as part 2's name suffixes indicate | Screenshots, diagrams, scanned documents and photographs of whiteboards |
| Making images | Very good, on a graphics card | [The generative media module](file/7c41d2a9-1e05) covers this in depth. Part 6 of that module has the hardware figures |
| Video, music and 3D | Possible, and demanding | The same module, parts 3 to 5 |
| Embeddings and reranking | Excellent, and light | Section 2 |

These share the machine's memory with the language model. On a single graphics card, an image model and a language model usually cannot both be loaded, and the tools swap them, which takes seconds each time. Unified-memory machines cope better, which is another point in their favour for mixed work.

### Fine-tuning locally

[Part 2 of the language models module](file/5086e893-fa85) explains what fine-tuning is good for, which is style, format and narrow tasks and not teaching facts, and describes LoRA, the method that makes it cheap. It is practical on local hardware. A model of 8 billion parameters can be fine-tuned with LoRA on a 16 to 24 GB graphics card in an hour or two, and the MLX tools do the same on a Mac. Variants that keep the base model quantised during training reach larger models.

It is worth considering for one situation in particular: a narrow, high-volume task where a small model is nearly good enough. A few hundred to a few thousand good examples will often take a 4 or 8 billion parameter model to the accuracy of a much larger one on that single task, and the result runs fast on modest hardware. For anything broader, a better prompt, retrieval or a larger model is the better investment, as the language models module says.

## 4. Serving more than one person

**In plain terms.** The apps in part 3 are built for one person at a time. Sharing a model among a team needs different software, designed to answer many requests at once, and it needs a proper graphics card in a machine that stays on. It is a small server to look after, and it is worth doing only when several people will really use it. **Who should read it:** anyone thinking of a shared local model. Others can skip to section 5.

### Why the apps do not scale

Part 1 explained that generating a token means reading the whole model from memory, and that the processor spends most of its time waiting. When several requests arrive together, a serving system reads the weights once and advances all of them at the same time. The memory is read no more often, and ten people are served in little more time than one. Part 3 of the language models module calls this batching, and explains that it is the basis of the hosted services' economics.

The desktop apps mostly handle requests one at a time, or a few at once. One comparison published in 2026 measured a dedicated serving system at sixteen to twenty times the throughput of a desktop app under heavy simultaneous load, and found the two almost level for a single user. The gap is entirely about concurrency.

### The serving systems

As of September 2026:

| System | What it is | Runs on | Notes |
| --- | --- | --- | --- |
| vLLM | The most widely used open source serving system. Manages the memory for many simultaneous contexts efficiently, and batches requests continuously as they arrive and finish | Linux, with NVIDIA or AMD graphics cards. Not Macs, in practice | Uses models in safetensors form with server-side quantisation formats, and not GGUF, as part 2 explained |
| SGLang | A comparable system, with particular strengths in structured output and in reusing shared prompt prefixes | The same | Often chosen for agent workloads, where many requests share a long opening prompt |
| llama.cpp's server | The same engine as part 3, which can serve several requests in parallel | Everything, including Macs | The simple choice for a handful of users, or where the hardware is not a Linux machine with a graphics card |
| Hugging Face's Text Generation Inference | A serving system that was widely used | | Put into maintenance in March 2026. Its maker now recommends the others. Mentioned because older guides still point to it |

### What it takes

- **A machine that stays on,** with a graphics card sized for the model plus the contexts of everyone using it at once. Every simultaneous user needs their own context in memory, so part 1's sum is done for the peak and not the average.
- **Something in front of it.** Part 3 warned that these servers accept any request. A shared one needs authentication, encryption and logging, usually from a gateway placed in front.
- **Someone to look after it:** updates, new models, monitoring, a plan for when it is down.
- **An honest estimate of use.** The language models module's conclusion about self-hosting applies at small scale too. A shared server earns its place with steady use by several people, or a continuous batch workload. For occasional use by three people, each running their own model, or an API, is simpler and probably cheaper.

The cases where a small shared server is clearly right are the ones part 1 listed: data that may not leave, a fixed model for reproducible work, and steady high-volume processing.

## 5. Running it responsibly

**In plain terms.** A model on your own machine has no vendor behind it. Nobody filters what it produces, updates it, or tells you when something is wrong. Keep a record of exactly which model and settings you used, check the licence, put your own limits in place, and keep an eye on the field, because in a year the right choice will be different. **Who should read it:** anyone using a local model for work.

- **Pin what you use.** Record the exact file, its quantisation level, the tool and its version, and the settings, for anything whose results matter. Tools' short model names are reassigned to new files without notice. This is the local form of the language models module's rule that prompts are code and the model version is part of it.
- **Know the licence,** as part 2 explained, for the exact file, and keep a note of it.
- **There are no guard rails unless you add them.** Hosted services filter inputs and outputs. A local model does whatever it is asked. For anything user-facing that is your responsibility, and small classifier models published for the purpose, which part 2 listed under `guard`, are one tool for it.
- **Treat model files and tools as software from the internet,** because they are. Part 2's advice on sources and formats applies, and so does keeping the tools updated: they are network services written quickly, and security fixes are frequent.
- **Test before you switch.** A new model with better scores may be worse at your task. Keep a small test set from your own work, as the language models module describes, and run it before changing anything.
- **Review the choice regularly.** Twice a year is reasonable. The best model for a given amount of memory has changed every few months, the tools' defaults shift, and hardware that was exotic becomes ordinary.

## 6. When to stop

**In plain terms.** Local models are the right tool for private, routine, high-volume and offline work, and the wrong tool for the hardest problems. The sensible end state for most people is both, with the code written so that either can answer. **Who should read it:** everyone. This is the judgement the module is meant to leave you with.

A local model is the wrong choice, and it is worth recognising quickly, when:

- **The task needs the best model there is.** Hard reasoning, large-scale design, long autonomous work. The language models module's method applies: prove the task with the most capable model, then step down. If it fails at the step to local, that is your answer.
- **The time spent is worth more than the API bill.** For most individuals and small teams, a modest monthly spend on a hosted model costs less than the hours spent keeping a local stack running. Privacy, reproducibility or volume have to justify the difference.
- **It needs to be available to many people, reliably,** and nobody's job is to keep it so.
- **Nothing confidential is involved,** and the vendor's terms are acceptable, which part 3 of the AI in the organisation module explains how to check.

And it is the right choice, often the only one, when the data cannot leave, when the result must be reproducible, when the volume is large and the task is narrow, when there is no connection, or when you are building something that ships to a user's own machine.

Because part 3's server speaks the same format as the hosted services, this need not be decided once. Write the code against the common format, keep the address and the model name as configuration, and route by task: private and routine work to the local model, hard problems to a hosted one. That is part 2 of the language models module's routing, with the boundary of your own machine as one of the things to route on.

### The whiteboard version

A local model is called from code exactly as a hosted one is, at a different address. Build for a small model: short explicit prompts, one job per call, steps in your code and not in the prompt. Force valid structured output with a schema or grammar, which the local engines support. Calls are free, so try several times and check, and run your tests often. Private document search is the strongest use: embedding models are small, run without a graphics card, and the index can be a file. Speech recognition, image reading and image generation all run locally too, sharing the same memory. Serving a team needs a serving system such as vLLM on a Linux machine with a graphics card, sized for everyone's contexts at once, behind authentication, and only steady use justifies it. Nobody stands behind a local model, so pin the exact file and settings, know the licence, add your own limits, and review the choice twice a year. Use local for the private, the routine, the bulk and the offline, a hosted model for the hardest work, and write the code so that either can answer.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| The local endpoint | An HTTP server implementing the common chat interface, addressable by any client library | Your programs talk to the model on your machine exactly as they would to a big service. Only the address differs |
| Constrained output | Decoding restricted by a grammar or JSON schema, so that every sampled token keeps the output valid | The model is only allowed to write things that fit the form. It always fills the form in correctly, though not always truthfully |
| Spending calls freely | With zero marginal cost, best-of-N sampling and self-verification become cheap | It costs nothing to ask again. So ask five times, check each answer, and keep the good one |
| Local retrieval | Embedding, indexing and reranking all run on the machine, beside the generator | It searches your own files for the relevant pages and reads those before answering, and none of it leaves your computer |
| Serving system | Continuous batching and paged memory management amortise each pass over the weights across concurrent requests | Software built to answer many people at once from one model. The desktop apps answer one at a time |

## Misconceptions to correct

Three claims come up constantly. Agree with the true part first, then add what it leaves out.

### "We will set up a server and the whole team can share it"

**True:** serving software makes one graphics card serve many people efficiently, and for private data it may be the only option.

**Misleading:** it is a server: it needs a machine that stays on, memory for everyone's context at once, authentication in front of it, and someone to maintain it. For a few occasional users it costs more in attention than it saves, and the model is still weaker than a hosted one.

**What to say:** "Let us count who would use it, how often, and for what. If it is private data or steady volume, yes, with an owner. If it is five of us now and then, each running our own, or an API, is less work."

### "A small model cannot do real work"

**True:** small models are clearly weaker at open-ended reasoning and long tasks.

**Misleading:** given a narrow task, the facts in front of it and output forced into a valid structure, a model of 4 to 14 billion parameters classifies, extracts, summarises and answers from documents very well, for nothing, in private. Much useful work is exactly that.

**What to say:** "It will not design the system. It will happily tag ten thousand tickets overnight, or answer questions from our own documents without them leaving the building. Let us pick jobs of that shape."

### "Once it is set up, it is done"

**True:** a pinned model file never changes, which is one of the reasons to run locally.

**Misleading:** the field does. The best model for your memory budget is replaced every few months, the tools change their defaults and fix security holes, and a setup left for a year is both out of date and unpatched.

**What to say:** "Pin it so that results are reproducible, and put a review in the calendar twice a year. Update the tools in between."

## Glossary

Every technical term used in this part, in plain language and in alphabetical order. Terms from earlier parts and the language models module are not repeated.

| Term | Meaning |
| --- | --- |
| Best of N | Generating several answers and keeping the one that passes a check |
| Constrained decoding | Restricting a model to tokens that keep its output valid against a schema or grammar |
| Continuous batching | Advancing many requests together, adding and removing them as they arrive and finish |
| Embedded database | A database that runs inside your program as a file, with no server |
| Gateway | A service in front of a model server that handles authentication, encryption and logging |
| Grammar | A formal description of allowed output, which an engine can enforce token by token |
| Guard model | A small classifier used to filter a model's inputs or outputs |
| Pinning | Recording the exact model file, tool version and settings so that results can be reproduced |
| Reranker | A small model that reorders search results by relevance to the question |
| SGLang | An open source serving system, strong on structured output and shared prompt prefixes |
| Serving system | Software that runs one model for many simultaneous users efficiently |
| vLLM | The most widely used open source serving system |

## Sources

Behaviour and figures in this part come from these documents, read in September 2026.

- [Ollama, LM Studio, vLLM, llama.cpp and MLX compared](https://codersera.com/blog/ollama-vs-lm-studio-vs-vllm-vs-llama-cpp-vs-mlx-2026/), 2026, for the sixteen to twenty times throughput gap under concurrent load and its absence for a single user, the platforms vLLM runs on, and the retirement of Text Generation Inference in March 2026
- [llama.cpp against vLLM](https://developers.redhat.com/articles/2026/06/15/llamacpp-vs-vllm-choosing-right-local-llm-inference-engine), Red Hat, June 2026, for when each is the right choice
- [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180), 2023, for the design behind vLLM
- [llama.cpp grammars](https://github.com/ggml-org/llama.cpp/blob/master/grammars/README.md), for constraining output with a grammar or JSON schema
- [QLoRA: Efficient Finetuning of Quantized LLMs](https://arxiv.org/abs/2305.14314), 2023, for fine-tuning with the base model kept quantised

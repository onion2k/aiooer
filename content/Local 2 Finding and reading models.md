# Part 2: Finding and Reading Models: Hugging Face and What a Name Tells You

2026-09-19 · Chris Neale

## About this part

This is the second of five parts in the running AI locally module. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). The format is the same as elsewhere: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 30 minutes.

[Part 1](file/a1c4e7f2-5b38) showed that a model's size decides whether it runs on your machine and how fast. This part is about where models come from and how to tell, from the name alone, what you are looking at.

### What part 2 gives you

Part 2 builds one idea: a model's name is a specification. `gemma-4-26B-A4B-it-qat-q4_0` looks like noise and is nine facts, and between them they tell you whether it will fit, how fast it will run, what it is for and how much quality was traded away to make it small. Once you can read names, the rest of choosing a model is reading a page and doing part 1's sum.

## 1. Hugging Face

**In plain terms.** Hugging Face is where almost every open model is published. It works like a code-hosting site for models: each model has a page with a description, a list of files and a licence. Anyone can publish, which means the choice is enormous and nothing is checked, so it matters whose page you are downloading from. **Who should read it:** everyone.

The Hugging Face Hub hosts millions of models. When a lab releases open weights, this is where they appear, usually within minutes of the announcement, and the tools in part 3 download from it directly.

### What is on a model's page

- **The model card** is the description, written by the publisher. A good one states what the model is for, its size, its context length, how it was trained, how it performs, its known limits and how to run it. A thin or absent card is a warning.
- **The files.** The weights, usually as several large files, alongside small configuration files that say how the model is built and how its prompts must be formatted. Part 3 explains why that last file matters.
- **The licence,** shown as a tag at the top. Section 4 covers what to look for.
- **Signals of use:** downloads in the last month, likes, and a discussion tab where problems are reported. High numbers do not prove quality. They do mean that faults have probably been found and talked about.
- **The family tree.** The page links to the model this one was derived from, and to everything derived from it: fine-tunes, merges and, most usefully, quantised versions.

### Originals and conversions

A lab publishes a model once, at full precision, in a format meant for training and for servers. Almost nobody runs that file locally. What you run is a conversion: the same model compressed to 4 or 5 bits and repackaged for the software in part 3.

Conversions are published separately, sometimes by the lab itself and more often by a handful of well-known community publishers who convert every notable model within hours of its release. So a single model appears on the Hub many times over: the original, and then a dozen repositories of conversions, each holding a dozen files at different compression levels. This is the main reason the Hub looks bewildering, and section 3 explains how to read those files.

### Who to trust

Anyone can upload anything under any name, and names are easy to imitate.

- **Prefer the lab's own organisation page** for originals, and check that it is the verified one.
- **For conversions, prefer the established publishers,** which you will recognise after a week because every guide and tool points to the same few.
- **Prefer the safetensors and GGUF formats.** Both hold only numbers. Older formats could run code when loaded, as the generative media module explains, and there is no longer any reason to accept one.
- **Be wary of a model with a famous name, no card and no history.**

### Gated models

Some publishers require you to log in and accept terms before downloading, and a few review requests by hand. The page says so. A gated model needs an access token in whatever tool downloads it, which the tools in part 3 all support. Read what you are agreeing to: it is the licence, and section 4 explains why it is not always what "open" suggests.

## 2. Reading a name

**In plain terms.** A model's name is a string of codes, and every code means something. There is the family and version, the size, sometimes a second size saying how much of it runs at once, a word saying what it was trained to do, and then codes for how it has been compressed and packaged. Learn a dozen of them and you can read any name on the Hub. **Who should read it:** everyone. This is the part of the module to keep open in a tab.

Take four names that were current in September 2026.

```names
Qwen3.6-35B-A3B
gemma-4-E4B-it
gpt-oss-20b
Mistral-Small-4-119B-2603
```

### Family and version

`Qwen3.6`, `gemma-4`, `gpt-oss`, `Mistral-Small-4`. The family tells you the publisher and the lineage, and the version tells you the generation. Part 2 of the language models module explains why generation matters more than size: a recent small model regularly beats a large one from two years earlier. When in doubt, take the newer generation.

Family names carry tier words too, and they mislead. `Small`, `Medium` and `Large`, or `Flash` and `Pro`, describe a publisher's own range and not any absolute size. The fourth example is a "Small" of 119 billion parameters, which needs about 68 GB at 4 bits. Read the number, not the word.

### The size: 27B, 8B, 120b

The number followed by B is the parameter count in billions. It is the single most useful fact in the name, because part 1's sum turns it directly into memory: at the usual compression, a little over half a gigabyte per billion.

A few publishers leave it out, and then the card has it. Very large models use T for trillions.

### Active parameters: A3B

A second number prefixed with A marks a mixture-of-experts model, and gives the parameters active for each token. `35B-A3B` has 35 billion parameters and uses 3 billion at a time.

Part 1's deep dive explains what that means, and it is worth repeating because it is the commonest misreading on the Hub. **The first number sets the memory. The second sets the speed.** A `35B-A3B` needs the 20 GB of any 35 billion parameter model, and then runs about as fast as a 3 billion parameter one. It is not a 3 billion parameter model that fits in 2 GB.

Older mixture-of-experts names used a different form, such as `8x7B` for eight experts of seven billion each. Such a model holds rather less than the product suggests, since the experts share some layers, and the convention has largely been replaced by stating total and active sizes.

On quality, a mixture-of-experts model generally performs below a dense model of the same total size and well above a dense model of its active size. A `35B-A3B` is not as capable as a dense 35 billion parameter model, and is much more capable than a dense 3 billion one.

### Effective parameters: E4B

A newer prefix, E, stands for effective. One current family of small models keeps a large table of per-layer lookup values that can sit in slow storage and be fetched as needed, and need not occupy fast memory. Its `E4B` model has 8 billion parameters in all and behaves, in memory and speed, like one of about 4.5 billion. The E number is the one to use in part 1's sum. These models are aimed at phones and laptops.

### What it was trained to do

| In the name | Means |
| --- | --- |
| `base`, `pt`, or nothing at all on older models | The raw pretrained model, which only continues text. It will not follow instructions or hold a conversation. For researchers and people fine-tuning |
| `it`, `instruct`, `chat` | Trained to follow instructions and converse, as part 2 of the language models module describes. This is the one you want |
| `thinking`, `reasoning` | Trained to write out extended reasoning before answering. Better on hard problems, and slower, since the thinking is generated at the same tokens per second as everything else |
| `coder`, `code` | Further trained on code |
| `vl`, `vision`, `omni` | Accepts images, or images and audio, as well as text |
| `guard`, `safeguard` | A classifier for filtering content, not an assistant |
| `embed`, `embedding`, `reranker` | Not a chat model at all. Part 5 covers what these are for |
| `draft`, `assistant`, `eagle`, `mtp` | A small companion model used to speed up a large one through speculative decoding, which part 3 of the language models module describes. Not for use on its own |

Many recent models are hybrids that think or not according to a setting, with no suffix. The card says how to switch.

### Dates and revisions

A four-digit number such as `2603` or `2507` is a date, year then month: March 2026, July 2025. Some publishers use it in place of a version number and reissue a model under the same name with a new date. When two files differ only in this, take the later.

## 3. Reading the rest: formats and quantisation

**In plain terms.** The end of a file's name says how it has been packaged and how hard it has been squeezed. GGUF is the packaging used by most local software, and MLX is the one for Macs. A code such as Q4_K_M says how many bits each number has been cut down to. Four to five bits is the usual balance. Below that, quality falls away quickly, and small models suffer more than large ones. **Who should read it:** everyone who will download a model. The table is the practical core.

```names
Qwen3.6-27B-Q4_K_M.gguf
gemma-4-26B-A4B-it-qat-q4_0
Qwen3.6-27B-FP8
gpt-oss-20b-MLX-8bit
```

### Formats

| Format | What it is | Used by |
| --- | --- | --- |
| Safetensors | The standard container for weights at full or near-full precision. What labs publish | Server software such as vLLM. The starting point for every conversion |
| GGUF | One file holding the weights, usually quantised, together with everything needed to run them: the model's structure, its vocabulary and its prompt format | llama.cpp and everything built on it, which is most local software. Runs on any hardware |
| MLX | Weights converted for Apple's framework | Macs only, and the fastest option there |
| AWQ, GPTQ, and formats named for a bit width such as FP8 and NVFP4 | Quantised weights for server software on graphics cards | vLLM and similar, on NVIDIA and AMD hardware. Part 5 |

For a laptop or a desktop, you are looking for GGUF, or MLX on a Mac. The others matter when you serve a team.

### Quantisation codes

Part 3 of the language models module explains quantisation: storing each weight in fewer bits. GGUF files carry a code that says how.

`Q4_K_M` reads as follows. `Q4` is the nominal bits per weight. `K` names the method, the current standard, which quantises weights in small blocks that each carry their own scale. The final letter is a size variant, `S`, `M` or `L` for small, medium and large: the larger variants keep the most sensitive parts of the model at higher precision. So a `Q4_K_M` file averages closer to 4.8 bits than to 4.

| Code | Bits per weight, roughly | Size of a 27 billion parameter model | Quality |
| --- | --- | --- | --- |
| `F16`, `BF16` | 16 | 54 GB | The original |
| `Q8_0` | 8.5 | 29 GB | Indistinguishable from the original in use |
| `Q6_K` | 6.6 | 22 GB | Very close |
| `Q5_K_M` | 5.7 | 19 GB | Close. A good choice if you have the room |
| `Q4_K_M` | 4.8 | 16 GB | The usual choice. A small, measurable loss |
| `IQ4_XS` | 4.3 | 15 GB | About as good as `Q4_K_M` in less space, a little slower on some hardware |
| `Q3_K_M` | 3.9 | 13 GB | Noticeably worse. For when nothing else fits |
| `Q2_K`, `IQ2` and below | 2 to 3 | 8 to 11 GB | Badly damaged, except on very large models |

Codes beginning `IQ` use a newer method that calibrates against sample text to decide which weights matter most. They give better quality for a given size, particularly below 4 bits.

### Choosing a level

- **Start at `Q4_K_M`.** It is the default for good reason.
- **If you have room to spare, go up,** to 5 or 6 bits. Beyond 6 you are spending memory on nothing you will notice.
- **Below 4 bits, prefer a smaller model at 4 bits.** A 14 billion parameter model at `Q4` is usually better than a 27 billion one at `Q2`, and faster.
- **Large models tolerate more.** A 70 billion parameter model at 3 bits remains useful. An 8 billion parameter one does not.
- **Reasoning, code and long context suffer first,** as the language models module notes. For those, stay at 5 bits or above if you can.
- **The context needs memory too.** Part 1 explained that the weights should leave a quarter to a third of memory free. A smaller file with a usable context beats a larger one without.

### Models made for four bits

Two recent developments blur the table above, both for the better.

Some publishers now release models trained to be quantised. `qat`, for quantisation-aware training, means the model was taught during training to work at low precision, so its 4-bit version loses far less than an ordinary conversion would. Where a `qat` version exists, prefer it.

Others publish at 4 bits in the first place. `MXFP4` and `NVFP4` are 4-bit number formats that some recent models are trained and released in, so that there is no higher-precision original to lose quality from. One widely used open model of 20 billion parameters ships this way and occupies about 12 GB as published.

### Deep dive (optional): why the last bits matter less than the first

A weight stored in 16 bits can take one of about 65,000 values. In 4 bits it can take one of 16. It is surprising that this works at all.

It works because a network's behaviour depends on the combined effect of thousands of weights in each calculation, and the rounding errors mostly cancel. It works better with two refinements. Blocks of a few dozen weights share a scale factor, so the 16 available values are spread over the range that block actually uses. And the few weights that matter most, identified by running sample text through the model, are kept at higher precision. The `K` and `IQ` methods are those two ideas.

Below about 4 bits the errors stop cancelling, and quality falls quickly and then abruptly. Larger models hold out longer because they are more redundant. That is why a 3-bit 70 billion parameter model can be usable and a 3-bit 8 billion one is not.

## 4. Licences

**In plain terms.** "Open" does not mean "do what you like". Some models can be used for anything, including paid work. Some are free for research and personal use only. Some are free until your company reaches a certain size. The licence is on the model's page, and it is the licence of that exact file that counts. **Who should read it:** anyone who will use a model at work.

| Kind | What it allows | Examples, September 2026 |
| --- | --- | --- |
| Permissive: Apache 2.0, MIT | Any use, including commercial, with attribution | Most current models from Alibaba, Google, OpenAI, Mistral and DeepSeek in the sizes that run locally |
| Community licences | Free use with conditions: a list of forbidden uses, a ceiling on users or revenue, sometimes rules about naming what you build | Meta's Llama models, and some from Tencent and others |
| Non-commercial and research-only | Evaluation and research. Commercial use needs a separate paid agreement | Some models from smaller labs, and many fine-tunes |
| None stated | Assume you may not use it | A good deal of what is on the Hub |

Four points are worth knowing.

- **The local-sized models are, at the moment, unusually permissive.** A year or two ago the best small models carried restrictive licences. In 2026 nearly every leading family offers its small and mid-sized models under Apache 2.0 or MIT. Check anyway: it has changed before and will change again.
- **A fine-tune inherits its parent's licence** and may add its own. A conversion carries the licence of what it converts.
- **The licence covers the weights, not what you generate.** Some licences do restrict using outputs to train competing models.
- **The training data is a separate question,** which part 3 of the AI in the organisation module covers, and a permissive licence on the weights says nothing about it.

## 5. Choosing a model

**In plain terms.** Work out what fits, from part 1. Among the current generation of the main families at that size, pick by what you need it for. Then test it on your own work, because rankings are a guide and not an answer. As of late 2026, a model of about 27 to 35 billion parameters is where local models become dependable for coding and agents, and one of 8 to 14 billion is plenty for private chat and summarising. **Who should read it:** everyone. The table will date, and the method will not.

### The method

1. **Set the memory budget** from part 1: what your machine has, less a quarter to a third for the context and everything else.
2. **That gives a size.** At 4 to 5 bits: 8 GB of memory takes up to about 9 billion parameters, 16 GB about 14 billion, 24 GB about 27 to 32 billion, 32 GB about 35 billion with a long context, 64 GB about 70 billion, and 128 GB about 120 billion. A mixture-of-experts model may go larger than this on a unified-memory machine, since it stays fast.
3. **Shortlist the current generation** of two or three families at that size. Rankings of local models are published monthly, and the tools in part 3 show what is popular.
4. **Match it to the job.** A coding model for code. A model that accepts images if you need that. A thinking model for hard problems where you can wait. Check the context length on the card against what part 3 says your work needs.
5. **Test on your own tasks.** Part 2 of the language models module explains why public benchmarks are a poor guide, and its method applies: a handful of real examples from your work, tried on each candidate. Locally, this is free.

### The field in September 2026

| Memory for the model | What runs well | Notes |
| --- | --- | --- |
| Under 8 GB, or no graphics card | Models of 2 to 4 billion parameters, including the "effective" 2 and 4 billion ones | Good for summarising, rewriting, simple questions and running inside an app. Not for agents |
| 8 to 12 GB | 8 to 9 billion parameters | A capable private assistant |
| 16 GB | 12 to 14 billion parameters. A 20 billion parameter model released at 4 bits | The practical floor for coding help |
| 24 GB | Dense models of 27 to 31 billion parameters. Mixture-of-experts models of 26 to 35 billion with 3 to 4 billion active | Where local models become dependable for coding and for the agents in part 4 |
| 32 to 48 GB | The same, at higher precision or with a long context | The context is often what the extra memory is for |
| 64 to 128 GB of unified memory | Dense models to 70 billion parameters. Mixture-of-experts models of around 120 billion | The largest that run on a desk at useful speed |
| Several data-centre GPUs | Open models of hundreds of billions to trillions of parameters | Open weights, and not local in any ordinary sense |

The last row is worth a moment. Several of the strongest open models in 2026 have between 280 billion and 2.4 trillion parameters. Their weights can be downloaded by anyone and run by almost no one. When a model is described as open, ask whether it is open in the sense that you could run it. Some tools now list such models beside local ones and quietly run them on the vendor's servers, which is convenient, and is not local.

### The whiteboard version

Models live on Hugging Face, where anyone can publish, so download originals from the lab's own page and conversions from the well-known publishers, in safetensors or GGUF. A name is a specification. The number before B is parameters in billions, and sets the memory. A number after A is the active parameters of a mixture-of-experts model, and sets the speed. E means effective parameters. `it` or `instruct` is the one you want, and `base` is not. GGUF is the format for most local software and MLX for Macs. `Q4_K_M` means about 4.8 bits per weight, the usual choice: go higher if there is room, and below 4 bits choose a smaller model. `qat` and models released at 4 bits lose least. Check the licence of the exact file. Then work out what fits, shortlist the current generation at that size, and test on your own work.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Total and active parameters | A sparse mixture-of-experts model stores all experts and routes each token to a few | The first number says how much memory it needs. The second says how fast it runs |
| Base and instruct | A pretrained next-token predictor against one post-trained to follow instructions | The raw model only continues text. The "instruct" one answers you. You want that one |
| GGUF | A single-file container of quantised tensors and the metadata to run them | One file with everything the software needs, already squeezed to fit |
| Q4_K_M | 4-bit block-wise quantisation with per-block scales, the most sensitive tensors kept at higher precision | Each number in the model cut from 16 bits to about 5. A third of the size for a small loss |
| Open weights | Weights published under some licence, which may or may not permit your use, for hardware you may or may not have | You can download it. Whether you may use it at work, and whether you can run it at all, are two further questions |

## Misconceptions to correct

Three claims come up constantly. Agree with the true part first, then add what it leaves out.

### "It says A3B, so it is a 3 billion parameter model and will run on anything"

**True:** it generates about as fast as a 3 billion parameter model, because only that much is used for each token.

**Misleading:** all 35 billion parameters must be in memory, since any of them may be needed next. It needs about 20 GB and will not load on an 8 GB card.

**What to say:** "The big number is how much memory it needs and the small one is how fast it goes. We need the memory for the big number."

### "A bigger model squeezed harder beats a smaller one"

**True:** down to about 4 bits, the larger model at lower precision usually does win.

**Misleading:** below 4 bits quality falls off quickly, and it falls fastest on the things local models are already weakest at: reasoning, code and long contexts. A model at 2 or 3 bits is often worse than the next size down at 4, and slower as well.

**What to say:** "Four bits is the floor for most models. If it only fits at three, we want the smaller model."

### "It is open source, so we can use it however we like"

**True:** the weights are free to download, and many current models carry licences that allow any use.

**Misleading:** "open" covers everything from Apache 2.0 to research-only. Some licences cap your company's size or forbid listed uses, fine-tunes inherit their parent's terms, and a file with no licence gives you no rights at all. Open weights are also not open source in the usual sense: the training data and code are rarely published.

**What to say:** "Open means we can download it. Whether we may ship it is on the licence tag of that exact file, and someone should read it before it goes near a product."

## Glossary

Every technical term used in this part, in plain language and in alphabetical order. Terms from part 1 and the language models module are not repeated.

| Term | Meaning |
| --- | --- |
| Base model | The raw pretrained model, which continues text and does not follow instructions |
| Conversion | A published model repackaged, and usually quantised, for local software |
| Effective parameters | For models that keep part of themselves in slow storage, the size that counts for memory and speed |
| Gated model | One that requires logging in and accepting terms before download |
| GGUF | The single-file model format used by llama.cpp and most local software |
| Hugging Face Hub | The site where open models, datasets and demos are published |
| Importance matrix | Measurements of which weights matter most, used by the IQ quantisation methods |
| Instruct model | A model trained to follow instructions and converse. Also marked `it` or `chat` |
| K-quant | The standard GGUF quantisation method, in which blocks of weights each carry their own scale |
| MLX format | Weights converted for Apple's framework. For Macs |
| Model card | The description on a model's page: what it is, how it was made, how to use it |
| MXFP4, NVFP4 | Four-bit number formats that some models are trained and published in |
| Quantisation-aware training (QAT) | Training a model to work at low precision, so that its quantised version loses little |
| Safetensors | The standard safe container for model weights. Holds numbers and cannot run code |
| Thinking model | One trained to write out extended reasoning before it answers |

## Sources

Names, sizes, dates and licences in this part were read from Hugging Face in September 2026.

- [GGUF on the Hugging Face Hub](https://huggingface.co/docs/hub/gguf), for the format and the table of quantisation types with their bits per weight
- [Gemma 4 model card](https://huggingface.co/google/gemma-4-26B-A4B-it-assistant), for "effective" and "active" parameters as its publisher defines them, the 2.3 and 4.5 billion effective sizes against 5.1 and 8 billion in total, and the 25.2 billion total against 3.8 billion active
- [Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B) and [Qwen3.6-27B](https://huggingface.co/Qwen/Qwen3.6-27B), April 2026, Apache 2.0
- [gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b), August 2025, Apache 2.0, published at 4 bits
- [Mistral-Small-4-119B-2603](https://huggingface.co/mistralai/Mistral-Small-4-119B-2603), for a "Small" of 119 billion parameters and the date suffix
- [Safetensors](https://huggingface.co/docs/safetensors/index), for the format that cannot execute code

# The AI field guide: Introduction

2026-09-20 · Chris Neale

## What this guide is for

This is a field guide to AI: what it is, how to use it well, how it works underneath, and what is out there. It starts with use, because nearly everyone reading it already uses these tools, and using them well is the quickest thing to get better at: the chat window first, then the AI built into software you already have, then what to do when neither is enough. For anyone who does not use them yet, a short optional primer comes before all of it. The guide then explains what the tools are doing behind the scenes, which you do not need in order to use them and which explains why the advice works. After that come seams of the subject you may not have met: running models on your own hardware, the models that generate images, video, music and 3D objects, and kinds of AI model that are not chat assistants at all. A field guide is also for looking things up, and it will grow reference sections that are not written to be read straight through.

The guide is written for people in engineering, product and leadership who need to discuss AI with both technical and non-technical colleagues, accurately and without hype. Most of it is about building software, because that is the work the author knows and where the evidence is best. The two parts it opens with, and the module on generative media, assume no engineering at all.

It has a point of view. Most people use AI to lower their own effort on work they would have done anyway, and then check everything by hand, which slows the AI to human pace. The larger prize is to change how work is done so that the AI's speed shows up in delivery, and to take on things that were never worth attempting before.

That change needs confidence about where AI can be trusted, where it cannot, and what must be built to close the gap. Practical AI and AI in the organisation supply the practice. The language models module supplies the reasons.

## The modules

The guide is in six modules, in three steps: use it well, see how it works, then explore further. An optional primer comes before them, for readers who are new to AI. Each numbers its own parts from 1, and a reference to "part 3" inside a part means part 3 of the same module.

### Intro to AI (optional)

| Part | After it you can | Time |
| --- | --- | --- |
| [Part 1: What AI is](file/a7f20c15-9d3e) | Say what today's AI is, what it knows, and why it is sometimes confidently wrong | 15 min |
| [Part 2: Using it: the basics](file/4c8be1d6-27fa) | Ask for what you want, check what you get, and know what never to type in | 15 min |
| [Part 3: What is possible](file/e15a9b70-c4d2) | Tell what AI is worth trying on, what it cannot do, and where to go next in the guide | 15 min |

This module is optional. It is a primer for anyone who has come to the guide without much experience of AI: what it is, the basics of using it, and what is possible. It needs no technical background and takes about 45 minutes. If you already use an AI assistant most days, start with practical AI.

### Practical AI

| Part | After it you can | Time |
| --- | --- | --- |
| [Part 1: AI chat](file/b4e9d0a7-3c81) | Get far more out of a chat assistant, and know when you have outgrown it | 30 min |
| [Part 2: AI in apps](file/9f2c5e38-a7b4) | Judge the AI built into the software you already use, and what it may see | 25 min |
| [Part 3: Intent, AGENTS.md and other instruction files](file/f3a91c20-6d4e) | Write the standing instructions that tell a model what you want, and know which file does what | 35 min |
| [Part 4: Skills, agents and plugins](file/8d27b5e4-c019) | Package know-how so an agent can use it, and choose between a skill, an agent definition and a plugin | 25 min |
| [Part 5: Agentic work](file/1d8f42a6-b93e) | Brief an agent, keep it on course over a long task, and decide where it should run | 30 min |
| [Part 6: Multi-modal models](file/52e0a7c9-b3f6) | Use models that read images, audio and video as well as text, and know what they miss | 30 min |
| [Part 7: MCP servers and tool use](file/c9146f3b-27a8) | Connect a model to your own systems, and decide what it may do there | 25 min |
| [Part 8: Retrieval](file/0b8e5d17-f4c2) | Have a model answer from your own documents, and diagnose it when it answers badly | 25 min |
| [Part 9: Guardrails and evals](file/7a3f2c68-91de) | Contain what a model can do, and measure whether it is doing it well | 25 min |

This module covers the craft of using and building with models. Parts 1 and 2 are how nearly everyone meets AI: the chat window, and the AI inside software they already use. Parts 3 to 9 are what to do when that is no longer enough: the instruction files, skills and plugins that shape an agent, what happens when one runs, models that take more than text, connecting a model to tools and systems, answering from your own documents, and keeping the result safe and measured. It names products and file formats throughout, and those date quickly. It is where the guide starts, and it needs no knowledge of how a model works. Its first part lists the seven things about a model's behaviour that the rest leans on. Its part 9 ends with a design review checklist and the module's own two reference sections. The whole module is about four hours of reading.

### AI in the organisation
| Part | After it you can | Time |
| --- | --- | --- |
| [Part 1: AI across the software lifecycle](file/d6e2a95b-3f14) | Apply AI to discovery, planning, review, testing and operations as well as coding, and say why the whole process sets the gain | 40 min |
| [Part 2: AI in the team](file/3e89a4fc-a0bc) | Redesign how your team works so that AI's speed shows up in delivery | 45 min |
| [Part 3: Strategy and communication](file/bbb9efdd-e221) | Make and defend an AI investment case to any audience | 45 min |

This module takes the practice from one person to a team and an organisation. Part 1 goes along the whole software lifecycle, from discovery to operations, and shows that most of the gain is outside coding. Part 2 is about redesigning how a team works so that the AI's speed reaches delivery, and how to measure whether it has. Part 3 covers the decisions above the team, vendors, risk, governance and the investment case, and how to explain all of it to any audience. It ends with the module's two reference sections. The whole module is about two hours of reading.

### Language models

| Part | After it you can | Time |
| --- | --- | --- |
| [Part 1: How an LLM works](file/590c1ae1-8bf3) | Explain what happens between prompt and response | 35 min |
| [Part 2: How models are built](file/5086e893-fa85) | Explain sycophancy, coding strength and capability jumps | 35 min |
| [Part 3: Running models](file/48a4ae01-75ae) | Predict where a model fails and what a workload costs | 40 min |

This module is what happens behind the scenes. Part 1 follows a prompt through the machine. Part 2 explains how a model comes by its abilities and its habits. Part 3 covers what it costs to run and how it fails, and ends with the module's two reference sections. None of it is needed to use the tools well. Every technical idea is included because it explains a behaviour you have seen or a decision you will make. The whole module is about two hours of reading.

### Running AI locally

| Part | After it you can | Time |
| --- | --- | --- |
| [Part 1: What you need](file/a1c4e7f2-5b38) | Look at a machine and a model and say whether it will run, and roughly how fast | 30 min |
| [Part 2: Finding and reading models](file/d92b6a05-8e13) | Read a model's name as a specification, and choose one for your memory, your job and your licence | 30 min |
| [Part 3: Running a model](file/6e0f3c81-a247) | Choose an engine and an app, and set the three settings that decide whether a local model works | 30 min |
| [Part 4: Agents on local models](file/b7d15e92-4c60) | Pick a harness and a task a local model can handle, and keep the agent contained | 30 min |
| [Part 5: Building on it](file/3a8c9f47-d1e5) | Build on a local model from your own code, and know when a hosted one is the better tool | 25 min |

This module is hands-on, and it dates faster than the others. It covers the hardware, where models are published and how to read their names, the software that runs them, agents and the harnesses that drive them, and building on a local model. It names products throughout and says when each table was written. It explains what the tools do and leaves the commands to their own documentation. It leans on part 3 of the language models module, and can be read without it. The whole module is about two and a half hours of reading.

### Generative media

| Part | After it you can | Time |
| --- | --- | --- |
| [Part 1: How generative media models work](file/7c41d2a9-1e05) | Explain how a model turns noise and a prompt into a picture, a clip or a song, and how the token design differs | 45 min |
| [Part 2: Images](file/4b1e90c7-3d28) | Say what image models do reliably, what still goes wrong and why | 15 min |
| [Part 3: Video](file/9a63f5d1-7c40) | Plan a generated sequence as shots, and say why clips are short and what breaks in them | 30 min |
| [Part 4: Music and audio](file/c5d82e16-0f9b) | Tell the two designs of music model apart by ear and by behaviour, and say what you may do with a generated song | 30 min |
| [Part 5: 3D](file/1f7a3b94-e652) | Judge whether a generated 3D object is usable for a job, and what it will cost to make it so | 25 min |
| [Part 6: Shaping models](file/2f9be6c3-5a17) | Choose between a base model, a fine-tune, a LoRA and starting from existing media for a job | 50 min |
| [Part 7: Prompting](file/e08a7d54-9b32) | Write prompts that suit the model in front of you, and improve them with purpose | 45 min |

This module covers models that generate images, video, music and 3D objects. Part 1 explains the machine they share, and the second design that competes with it. Parts 2 to 5 take each medium in turn. Part 6 covers how models are adapted with fine-tunes, LoRAs, control inputs and style transfer, where to run them, and the questions of rights and provenance. Part 7 covers how to prompt them. You can read this module without the first. The whole module is about four hours of reading.

### Other AI models

| Part | After it you can | Time |
| --- | --- | --- |
| [Part 1: Small models](file/e4b7a1d3-5c92) | Explain how quantising, distilling and pruning make a model small, what each costs, and what a very small model is good for | 30 min |
| [Part 2: World models](file/96c3f08a-d417) | Say what a world model predicts, how it differs from a video model, and what it is for | 25 min |
| [Part 3: Diffusion language models](file/2d5e8b61-a3f0) | Explain how a language model can write a whole passage at once and refine it, and what that trades against writing word by word | 25 min |
| [Part 4: System one models](file/b18f4c27-6e9a) | Tell when a decision needs a typed answer with a probability, and not generated text | 30 min |

This module will grow. Each part stands alone, and each names products and figures that date quickly. It covers kinds of model that the other modules do not: small models such as the Smol, Phi and Needle families, world models such as NVIDIA's Cosmos, DeepMind's Genie and World Labs' work, language models built on diffusion, and models such as Jev that return a decision and no text. Part 4 describes a product announced days before it was written, from its maker's own figures, and says so. The whole module is about two hours of reading.

## How each part is laid out

- **In plain terms** opens each numbered section. It is a short non-technical summary, followed by a note on which parts of the section a non-technical reader needs and which they can skip.
- **Main text** stands on its own and can be read start to finish.
- **Deep dive (optional)** sections go one level further down. Skip them all and nothing later breaks. Read them when you expect an engineer to push you on detail.
- **Say it two ways** gives a technical and a non-technical version of each key idea.
- **Misconceptions to correct** lists common claims, with what is true in each, what is misleading, and a sentence you can say in reply.
- **Glossary** at the end of each part defines every technical term introduced there.
- **Sources** appear where a part quotes study results or legal dates.

Four modules end with two reference sections for use on their own: the explanations you will need most often, each in a line, and every misconception in the module with a one-line response. They close part 9 of practical AI, part 3 of AI in the organisation, part 3 of language models and part 7 of generative media.

## Suggested routes

Each module numbers its own parts, so every route names its modules. If you are new to AI, read the optional intro to AI module first, whichever route you take.

| Reader | Route |
| --- | --- |
| Engineering manager or technical lead | Practical AI in order, then AI in the organisation, then language models parts 1 to 3. Read the deep dives in the areas where your engineers will test you |
| Engineer | Practical AI in order with the deep dives, then language models parts 1 to 3, then AI in the organisation parts 1 and 2 |
| Product or delivery lead | Practical AI parts 1 and 2, then AI in the organisation part 1 in full and part 2 sections 1, 2 and 7, then the checklist in practical AI part 9 section 3 |
| Non-technical leader | The "In plain terms" openers throughout practical AI, then AI in the organisation part 1 section 1, part 2 sections 1 to 3 and part 3 sections 5 and 6 in full |
| One hour only | Practical AI part 1, AI in the organisation part 1 section 1 and part 2 sections 1 to 3, language models part 3 section 7, and the two reference sections that close practical AI part 9 |
| Engineer building an AI feature | Practical AI parts 3 to 9 in order, with language models part 3 section 7 for why the failures happen. Take the checklist in part 9 section 3 to every design review |
| Anyone who wants a model on their own machine | Language models part 3, then running AI locally parts 1 to 3. Add part 4 before letting an agent near your files |
| Designer, marketer or producer making media | Generative media part 7 in full, then the part for your medium from parts 2 to 5, then part 6 sections 4, 7, 9 and 10, with the "In plain terms" openers of part 1 |
| Engineer building a media pipeline | Generative media parts 1 to 7 in order, with the deep dives |

## Four ideas that run through everything

1. **The model knows two things.** What it absorbed in training, which is broad but fuzzy, and what is in front of it now, which is exact but limited. Most practical skill lies in managing the second.
2. **Verification converts compute into reliability.** Models are strongest where success can be checked automatically. The more checkable you make your work, the more you can hand over and the less you need to read.
3. **The constraint sets the pace.** Writing code is a fraction of delivery. Faster coding helps only when review, testing, decisions and release can keep up.
4. **Measure, do not feel.** People reliably misjudge how much AI helps them. Take a baseline, and report delivery outcomes and not activity.

## A note on currency

The guide was written in September 2026. The mechanisms the guide explains change slowly. Products, prices and regulation change quickly. All prices are illustrative, and the regulatory detail in part 3 of the AI in the organisation module is correct only as of that date. Section 7 of that part describes a quarterly habit for keeping your own picture up to date.

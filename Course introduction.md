# How AI works: Course Introduction

2026-09-18 · @Someone

## What this course is for

This course explains how AI works and how to use it well in an engineering organisation. Its first module covers large language models (LLMs), the kind of AI behind today's chat assistants and coding tools. Its second covers the models that generate images, video, music and 3D objects. Its third is practical: running models on your own hardware. Its fourth covers the craft of building with models: instructions, skills, tools, retrieval, guardrails and evals. A fifth, on other kinds of AI model, is on its way. The course is written for people who lead engineering work and need to discuss AI with both technical and non-technical colleagues, accurately and without hype.

It has a point of view. Most people use AI to lower their own effort on work they would have done anyway, and then check everything by hand, which slows the AI to human pace. The larger prize is to change how work is done so that the AI's speed shows up in delivery, and to take on things that were never worth attempting before.

That change needs confidence about where AI can be trusted, where it cannot, and what must be built to close the gap. The first three parts of the language models module supply that understanding. The rest of the course applies it.

## The modules

The course is in five modules. Each numbers its own parts from 1, and a reference to "part 3" inside a part means part 3 of the same module.

### Language models

| Part | After it you can | Time |
| --- | --- | --- |
| [Part 1: How an LLM works](file/590c1ae1-8bf3) | Explain what happens between prompt and response | 35 min |
| [Part 2: How models are built](file/5086e893-fa85) | Explain sycophancy, coding strength and capability jumps | 35 min |
| [Part 3: Running models](file/48a4ae01-75ae) | Predict where a model fails and what a workload costs | 40 min |
| [Part 4: AI in the team](file/3e89a4fc-a0bc) | Redesign how your team works so that AI's speed shows up in delivery | 45 min |
| [Part 5: Strategy and communication](file/bbb9efdd-e221) | Make and defend an AI investment case to any audience | 45 min |

Parts 1 to 3 cover how the technology works. Parts 4 and 5 cover how to use it in a team and an organisation. Building with models, which sat between them, became the practical AI module. Every technical idea is included because it explains a behaviour you will see or a decision you will make. The whole module is about three and a half hours of reading.

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

### Running AI locally

| Part | After it you can | Time |
| --- | --- | --- |
| [Part 1: What you need](file/a1c4e7f2-5b38) | Look at a machine and a model and say whether it will run, and roughly how fast | 30 min |
| [Part 2: Finding and reading models](file/d92b6a05-8e13) | Read a model's name as a specification, and choose one for your memory, your job and your licence | 30 min |
| [Part 3: Running a model](file/6e0f3c81-a247) | Choose an engine and an app, and set the three settings that decide whether a local model works | 30 min |
| [Part 4: Agents on local models](file/b7d15e92-4c60) | Pick a harness and a task a local model can handle, and keep the agent contained | 30 min |
| [Part 5: Building on it](file/3a8c9f47-d1e5) | Build on a local model from your own code, and know when a hosted one is the better tool | 25 min |

This module is more practical than the others, and it dates faster. It covers the hardware, where models are published and how to read their names, the software that runs them, agents and the harnesses that drive them, and building on a local model. It names products throughout and says when each table was written. It explains what the tools do and leaves the commands to their own documentation. It leans on part 3 of the language models module, and can be read without it. The whole module is about two and a half hours of reading.

### Practical AI

| Part | After it you can | Time |
| --- | --- | --- |
| [Part 1: Intent, agents and other instruction files](file/f3a91c20-6d4e) | Write the standing instructions that tell a model what you want, and know which file does what | 35 min |
| [Part 2: Skills, agents and plugins](file/8d27b5e4-c019) | Package know-how so that an agent can use it, and choose between a skill, a sub-agent and a plugin | 35 min |
| [Part 3: Multi-modal models](file/52e0a7c9-b3f6) | Use models that read images, audio and video as well as text, and know what they miss | 30 min |
| [Part 4: MCP servers and tool use](file/c9146f3b-27a8) | Connect a model to your own systems, and decide what it may do there | 25 min |
| [Part 5: Retrieval](file/0b8e5d17-f4c2) | Have a model answer from your own documents, and diagnose it when it answers badly | 25 min |
| [Part 6: Guardrails and evals](file/7a3f2c68-91de) | Contain what a model can do, and measure whether it is doing it well | 30 min |

This module covers the craft of building with models: the instruction files, skills and plugins that shape an agent, models that take more than text, connecting a model to tools and systems, answering from your own documents, and keeping the result safe and measured. It names products and file formats throughout, and those date quickly. It grew out of a part of the language models module called Building with models, and it assumes part 3 of that module. Its part 6 ends with a design review checklist and the module's own two reference sections. The whole module is about three hours of reading.

### Other AI models

| Part | After it you can | Time |
| --- | --- | --- |
| Part 1: Small models | Explain how quantising, distilling and pruning make a model small, what each costs, and what a very small model is good for | 30 min |
| Part 2: World models | Say what a world model predicts, how it differs from a video model, and what it is for | 25 min |
| Part 3: Diffusion language models | Explain how a language model can write a whole passage at once and refine it, and what that trades against writing word by word | 25 min |
| Part 4: System one models | Tell when a decision needs a typed answer with a probability, and not generated text | 20 min |

This module is being written, and it will grow. It covers kinds of model that the other modules do not: small models such as the Smol, Phi and Needle families, world models such as NVIDIA's Cosmos, DeepMind's Genie and World Labs' work, language models built on diffusion, and models such as Jev that return a decision and no text.

## How each part is laid out

- **In plain terms** opens each numbered section. It is a short non-technical summary, followed by a note on which parts of the section a non-technical reader needs and which they can skip.
- **Main text** stands on its own and can be read start to finish.
- **Deep dive (optional)** sections go one level further down. Skip them all and nothing later breaks. Read them when you expect an engineer to push you on detail.
- **Say it two ways** gives a technical and a non-technical version of each key idea.
- **Misconceptions to correct** lists common claims, with what is true in each, what is misleading, and a sentence you can say in reply.
- **Glossary** at the end of each part defines every technical term introduced there.
- **Sources** appear where a part quotes study results or legal dates.

Part 5 of the language models module ends with two reference sections for use on their own: the 20 explanations you will need most often, and all sixteen misconceptions with one-line responses. Part 7 of the generative media module and part 6 of the practical AI module end with the same for their own modules.

## Suggested routes

The first four routes run through the language models module, the next two through the generative media module, and the last through running AI locally.

| Reader | Route |
| --- | --- |
| Engineering manager or technical lead | All five parts in order. Read the deep dives in the areas where your engineers will test you |
| Engineer | Parts 1 to 3 with the deep dives, then part 4, then the practical AI module in order |
| Non-technical leader | The "In plain terms" openers throughout, then part 4 sections 1 to 3 and part 5 sections 5 and 6 in full |
| One hour only | Part 1 sections 1 and 7, part 3 section 7, part 4 sections 1 to 3, and the two reference sections that close part 5 |
| Designer, marketer or producer making media | Generative media part 7 in full, then the part for your medium from parts 2 to 5, then part 6 sections 4, 7, 9 and 10, with the "In plain terms" openers of part 1 |
| Engineer building a media pipeline | Generative media parts 1 to 7 in order, with the deep dives |
| Anyone who wants a model on their own machine | Language models part 3, then running AI locally parts 1 to 3. Add part 4 before letting an agent near your files |

## Four ideas that run through everything

1. **The model knows two things.** What it absorbed in training, which is broad but fuzzy, and what is in front of it now, which is exact but limited. Most practical skill lies in managing the second.
2. **Verification converts compute into reliability.** Models are strongest where success can be checked automatically. The more checkable you make your work, the more you can hand over and the less you need to read.
3. **The constraint sets the pace.** Writing code is a fraction of delivery. Faster coding helps only when review, testing, decisions and release can keep up.
4. **Measure, do not feel.** People reliably misjudge how much AI helps them. Take a baseline, and report delivery outcomes and not activity.

## A note on currency

The course was written in September 2026. The mechanisms the course explains change slowly. Products, prices and regulation change quickly. All prices are illustrative, and the regulatory detail in part 5 of the language models module is correct only as of that date. Section 7 of that part describes a quarterly habit for keeping your own picture up to date.

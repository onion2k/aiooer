# How AI works: Course Introduction

2026-09-18 · @Someone

## What this course is for

This course explains how AI works and how to use it well in an engineering organisation. It concentrates on large language models (LLMs), the kind of AI behind today's chat assistants and coding tools. It is written for people who lead engineering work and need to discuss AI with both technical and non-technical colleagues, accurately and without hype.

It has a point of view. Most people use AI to lower their own effort on work they would have done anyway, and then check everything by hand, which slows the AI to human pace. The larger prize is to change how work is done so that the AI's speed shows up in delivery, and to take on things that were never worth attempting before.

That change needs confidence about where AI can be trusted, where it cannot, and what must be built to close the gap. The first three parts supply that understanding. The last three apply it.

## The modules

The course is in two modules. Each numbers its own parts from 1, and a reference to "part 3" inside a part means part 3 of the same module.

### Language models

| Part | After it you can | Time |
| --- | --- | --- |
| [Part 1: How an LLM works](file/590c1ae1-8bf3) | Explain what happens between prompt and response | 35 min |
| [Part 2: How models are built](file/5086e893-fa85) | Explain sycophancy, coding strength and capability jumps | 35 min |
| [Part 3: Running models](file/48a4ae01-75ae) | Predict where a model fails and what a workload costs | 40 min |
| [Part 4: Building with models](file/cadfcb5f-9a30) | Review an AI feature or workflow design and spot the gaps | 45 min |
| [Part 5: AI in the team](file/3e89a4fc-a0bc) | Redesign how your team works so that AI's speed shows up in delivery | 45 min |
| [Part 6: Strategy and communication](file/bbb9efdd-e221) | Make and defend an AI investment case to any audience | 45 min |

Parts 1 to 3 cover how the technology works. Parts 4 to 6 cover how to use it. Every technical idea is included because it explains a behaviour you will see or a decision you will make. The whole module is about four hours of reading.

### Image models

| Part | After it you can | Time |
| --- | --- | --- |
| Part 1: How image models work | Explain how a diffusion model turns noise and a prompt into a picture | 40 min |
| Part 2: Shaping image models | Choose between a base model, a fine-tune, a LoRA and image-to-image for a job | 40 min |
| Part 3: Prompting for images | Write prompts that suit the model in front of you, and improve them with purpose | 35 min |

This module is being written. It covers how image generation works, how models such as Stable Diffusion are adapted with fine-tunes, LoRAs and style transfer, and how to prompt different models well.

## How each part is laid out

- **In plain terms** opens each numbered section. It is a short non-technical summary, followed by a note on which parts of the section a non-technical reader needs and which they can skip.
- **Main text** stands on its own and can be read start to finish.
- **Deep dive (optional)** sections go one level further down. Skip them all and nothing later breaks. Read them when you expect an engineer to push you on detail.
- **Say it two ways** gives a technical and a non-technical version of each key idea.
- **Misconceptions to correct** lists common claims, with what is true in each, what is misleading, and a sentence you can say in reply.
- **Glossary** at the end of each part defines every technical term introduced there.
- **Sources** appear where a part quotes study results or legal dates.

Part 6 of the language models module ends with two reference sections for use on their own: the 25 explanations you will need most often, and all twenty misconceptions with one-line responses.

## Suggested routes

These routes run through the language models module. Routes through the image models module will join them as it is written.

| Reader | Route |
| --- | --- |
| Engineering manager or technical lead | All six parts in order. Read the deep dives in the areas where your engineers will test you |
| Engineer | Parts 1 to 4 with the deep dives, then part 5 |
| Non-technical leader | The "In plain terms" openers throughout, then part 5 sections 1 to 3 and part 6 sections 5 and 6 in full |
| One hour only | Part 1 sections 1 and 7, part 3 section 7, part 5 sections 1 to 3, and the two reference sections that close part 6 |

## Four ideas that run through everything

1. **The model knows two things.** What it absorbed in training, which is broad but fuzzy, and what is in front of it now, which is exact but limited. Most practical skill lies in managing the second.
2. **Verification converts compute into reliability.** Models are strongest where success can be checked automatically. The more checkable you make your work, the more you can hand over and the less you need to read.
3. **The constraint sets the pace.** Writing code is a fraction of delivery. Faster coding helps only when review, testing, decisions and release can keep up.
4. **Measure, do not feel.** People reliably misjudge how much AI helps them. Take a baseline, and report delivery outcomes and not activity.

## A note on currency

The course was written in September 2026. The mechanisms the course explains change slowly. Products, prices and regulation change quickly. All prices are illustrative, and the regulatory detail in part 6 of the language models module is correct only as of that date. Section 7 of that part describes a quarterly habit for keeping your own picture up to date.

# Part 1: Small Models: Quantised, Distilled, Pruned and Trained Small

2026-09-19 · Chris Neale

## About this part

This is the first of four parts in the other AI models module. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). The format is the same as elsewhere: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 30 minutes.

The module covers kinds of model that the rest of the course passes by. Each part stands alone. This one is about language models made deliberately small: how they are made, what is lost in the making, and what they are for. It builds on three passages elsewhere. [Part 2 of the language models module](file/5086e893-fa85) explains distillation, [part 3 of that module](file/48a4ae01-75ae) explains quantisation, and [part 2 of the running AI locally module](file/d92b6a05-8e13) explains how to read a small model's name and file. This part does not repeat them. It puts them side by side with the methods they left out.

### What part 1 gives you

Part 1 builds one idea: a small model keeps skill better than it keeps knowledge. Shrinking a model, by any method, costs it facts and long chains of reasoning first, and costs it narrow, well-practised skills last. So a small model is a poor oracle and can be an excellent component: one job, done fast, cheaply, privately, and often on the device in your hand.

## 1. What small means, and why bother

**In plain terms.** The famous models are enormous and live in data centres. A small model is one that fits on a laptop, a phone, or even a watch. It knows less and reasons less well. It is also fast, nearly free to run, works with no connection, and keeps your data on your device. For many jobs inside software, that trade is the right one. **Who should read it:** everyone.

### A rough scale

No one agrees where "small" begins, and the line moves every year. This is how the word is used in 2026.

| Class | Parameters | Runs on | Typical use |
| --- | --- | --- | --- |
| Tiny | Under 1 billion, down to tens of millions | A phone, a watch, a microcontroller | One task: calling a function, extracting fields, routing, embeddings |
| Small | 1 to 4 billion | A phone or any laptop | A general assistant with thin knowledge. A strong base for fine-tuning |
| Medium | 7 to 30 billion | A good laptop or one graphics card | Most of what the running AI locally module describes |
| Large | Hundreds of billions and up | A data centre | The hosted models of the language models module |

This part is about the first two rows.

### Why anyone wants one

- **Cost.** Part 3 of the language models module showed that cost follows the number of active parameters. A model a hundred times smaller is roughly a hundred times cheaper for each token, which turns "too expensive to run on every record" into "run it on every record".
- **Latency.** A small model on the device answers in tens of milliseconds, with no network in the way. Autocomplete, voice interfaces and anything inside an interaction need that.
- **Privacy and availability.** Nothing leaves the device, and it works in a tunnel, on a factory floor or on an aeroplane.
- **Energy.** A watch or a sensor has a battery measured in milliwatt-hours. Only a tiny model is possible at all.
- **Control.** A small open model can be fine-tuned on a single graphics card in an afternoon, pinned for ever, and shipped inside a product.

The running AI locally module made most of these points about models you run yourself. They apply with more force as the model shrinks.

## 2. Three ways to shrink a model

**In plain terms.** There are three ways to make a big model smaller. You can store its numbers less precisely, like saving a photo at lower quality. You can train a small model to imitate the big one, like an apprentice. Or you can cut parts out of the big one and retrain what remains, like pruning a tree. Each loses something different, and the best small models use all three. **Who should read it:** everyone can read the table. The rest is for engineers.

### Side by side

| Method | What changes | What it saves | What it costs | Who can do it |
| --- | --- | --- | --- | --- |
| Quantising | The precision of each weight: 16 bits down to 8, 4 or fewer | Memory, and so speed | Little at 8 bits, a small loss at 4, a steep one below | Anyone, in minutes, with no training |
| Distilling | Nothing in the big model. A small student is trained to imitate it | Everything: the student is a smaller model | The student learns what it was shown. Whatever the teaching data left out is gone | Anyone with the teacher's outputs. The best form needs the teacher's owner |
| Pruning | Parts of the network are removed: layers, attention heads, neurons | Parameters, and so memory and compute | Damage, which retraining must repair | Anyone with the weights and a training budget |

### Quantising

Part 3 of the language models module covers the idea, and part 2 of the running AI locally module the file formats. Two points matter here.

First, the loss falls hardest on small models. A large model has redundancy to spare, and rounding its weights to 4 bits costs little. A 1-billion-parameter model has none, and the same rounding is felt at once. The published guidance from the local tools is consistent: the smaller the model, the more bits it should keep.

Second, the floor is being lowered by training, not by rounding. A model quantised after training, as almost all are, degrades quickly below 4 bits. A model trained from the start with its weights held to a few levels does not. Microsoft's BitNet work trained models whose every weight is one of three values, minus one, zero or one, which is about 1.58 bits, and reported results matching a full-precision model of the same size. Needle, in section 4, ships at about 2 bits a weight and was built for it. The technique is called quantisation-aware training, and it is why "2-bit" no longer has to mean "broken".

### Distilling

Part 2 of the language models module explains the two forms: matching the teacher's probabilities, and training on the teacher's outputs. Every vendor's small tier is made this way. Two uses matter most for small models.

- **Distilling reasoning.** A large reasoning model writes out long worked solutions, and a small model is trained on them. DeepSeek did this publicly in 2025, releasing small open models trained on its R1 model's reasoning, and they outscored much larger models that had not been taught this way. A small model cannot discover how to reason well. It can be shown.
- **Distilling a task.** A large model labels a great many examples of one job, such as choosing the right function to call, and a tiny model is trained on nothing else. The student ends up better at that job than general models many times its size, and useless at everything else. This is how the tiny row of the table in section 1 is populated.

The limit is in the word imitate. A student learns the behaviour it was shown on the inputs it was shown. Outside them it has nothing to fall back on, where the teacher had broad knowledge. Test a distilled model on your own inputs, including odd ones.

### Pruning

Pruning removes parts of a trained network. The useful kind is structured: whole layers, whole attention heads or whole rows of neurons are taken out, so that the model that remains is a smaller ordinary model and runs faster on ordinary hardware.

The parts to remove are chosen by measuring how much each one matters on a sample of data, and removing the least important. The model is damaged by this, sometimes badly. It is then retrained briefly, and the retraining is usually distillation with the original model as the teacher. NVIDIA's published recipe for this, used to make its Minitron models, compressed a model family by two to four times and needed less than 3% of the original training data to recover, which is the point: a family of sizes can be cut from one expensive training run.

### They combine

A small model on a phone in 2026 has typically been through all three: pruned from a larger sibling, distilled from a larger teacher, and quantised for shipping. The costs add up too, and they fall in the same place, which section 5 describes.

### Deep dive (optional): why removing single weights does not help

The oldest form of pruning is unstructured: set individual weights to zero, wherever they are, if they are small. Networks tolerate a lot of this. Half the weights of many models can be zeroed with little loss.

It rarely makes anything faster. The matrix is the same size with holes in it, and a graphics processor multiplies it in the same time, zeros included. Turning scattered zeros into speed needs special formats and hardware support. Some graphics cards accelerate one fixed pattern, two zeros in every four weights, and little else is widely supported.

Structured pruning avoids the problem by removing whole rows, heads or layers, so the matrices themselves get smaller. It does more damage for each parameter removed, because it cannot pick and choose, and that is why the retraining step is not optional.

Depth and width also behave differently. Removing layers makes the model faster in proportion, since layers run one after another, and tends to cost more reasoning. Narrowing layers keeps more of the quality and saves less time. Published recipes usually do some of each.

## 3. The fourth way: train it small

**In plain terms.** The other way to get a small model is to build a small one from the start and teach it extremely well: far more reading than its size would suggest, and much better reading, including lessons written for it by larger models. Two of the best-known small families were made this way. **Who should read it:** everyone. It is short.

### More data than the size deserves

Part 2 of the language models module described the balance between a model's size and the amount of text it is trained on. That balance minimises the cost of training. A small model that will be run billions of times should be judged on the cost of running, and for that it pays to train far past the balance point. Hugging Face's SmolLM3 has 3 billion parameters and was trained on 11.2 trillion tokens. That is more than 3,000 tokens for each parameter, against the 20 or so that the training-cost balance suggests. The extra training keeps paying, more slowly, for a long way.

### Better data than the web

Microsoft's Phi family is built on a bet about quality. Its first models were trained largely on synthetic "textbook" material, written by larger models to teach clearly, with web data filtered hard for educational value. The reports claimed small models matching ones several times their size, and the 3.8-billion-parameter Phi-3-mini was presented as rivalling the original ChatGPT model while running on a phone.

Two cautions belong with that. Synthetic textbooks written by a large model are distillation by another name, so this is less a fourth method than the second one applied to pretraining. And models trained this way have tended to look better on benchmarks than in open-ended use, since benchmark questions look like textbook exercises. The claim to test is always the one about your task.

## 4. Three families

**In plain terms.** Three families of small model show three different aims. One is built to be completely open, so that anyone can see how it was made. One is a large company's bet that careful teaching beats size. And one is so small that it fits in a few megabytes and does one thing: turn what you said into an action your device can carry out. **Who should read it:** anyone choosing a model. The table dates quickly.

| | SmolLM | Phi | Needle |
| --- | --- | --- | --- |
| From | Hugging Face | Microsoft | Cactus Compute |
| Sizes | 135 million to 3 billion parameters | About 3.8 billion for the mini line, with larger siblings | Around a hundred million parameters and below. Files of 8 to 29 MB |
| Made by | Training small on a very large, curated, published data mix | Training small on filtered and synthetic "textbook" data | Training for very low precision, and only for its tasks |
| Aim | A general small model, and a fully open recipe | A general small model with strong reasoning for its size | Calling functions, extracting fields and making embeddings on tiny devices |
| Licence | Apache 2.0, with data, code and checkpoints published | MIT for recent releases | Apache 2.0 |
| Notable | SmolLM3: 128,000-token context, six languages, a switchable thinking mode | Phi-4-mini: a 200,000-token vocabulary. A multimodal sibling takes speech and images | Ships at about 2 bits a weight. Any depth from 2 to 20 layers of the one model can be deployed |

The table was written in September 2026. The figures come from each project's own report or repository, and the comparisons each makes with other models are its own.

### What each one teaches

**SmolLM** is the one to study. Almost every other model in this course is open-weight at most: the weights are published and the recipe is not. SmolLM3's makers published the data mixture, the training stages, the configurations and the intermediate checkpoints. If you want to know how a small model is actually made, it is written down.

**Phi** is the one to be careful with. It is a capable family with a permissive licence and a strong record on reasoning for its size. It is also the family for which the gap between benchmark and experience has been most discussed. Treat it like any other candidate: run your own cases.

**Needle** is the one that changes the question. It is not a small chat model. It cannot hold a conversation. It takes an instruction and a list of available functions and produces the call, or takes a text and produces the fields, in a file smaller than a photograph. Its makers report it beating models ten times its size at choosing tool calls on mobile tasks. That is their claim and their benchmark. What is not in doubt is the design lesson: if the job is narrow enough, the model can be smaller than anyone expected five years ago. [Part 4](file/b18f4c27-6e9a) of this module follows the same thought to its end.

## 5. What a small model is for

**In plain terms.** A small model has forgotten most of the encyclopaedia and kept most of its manners. It can follow an instruction, fill in a form, sort things into categories and call the right function. It cannot be trusted on facts, and it loses the thread on long problems. So you give it one clear job, hand it the facts it needs, and check its work. **Who should read it:** everyone.

### Skill survives, knowledge does not

Facts take room. A model's knowledge of the world is spread across its parameters, and every method in this part removes or blurs parameters. What goes first is the long tail: the less common fact, the minor language, the obscure library. What survives longest is form: grammar, following instructions, the shape of JSON, the pattern of a function call.

Reasoning over many steps goes early too. Part 3 of the language models module gave the arithmetic of compounding error, and a small model's error for each step is higher, so its useful chain is shorter. [Part 4 of the running AI locally module](file/b7d15e92-4c60) showed what that does to agents.

### Good uses

- classification, routing and triage, where the answer is one of a known list
- extracting fields from text into a schema
- choosing and filling in a tool call, as the first, cheap step of a larger system
- rewriting, summarising and tidying short texts, where the facts are all in the input
- embeddings and reranking for the retrieval described in [part 8 of the practical AI module](file/0b8e5d17-f4c2)
- autocomplete and other work inside an interaction
- a first pass that handles the easy majority and passes the rest up to a larger model

The pattern in that list is that the model is handed what it needs to know, and the answer has a checkable shape.

### Poor uses

- answering questions from memory
- long, open-ended reasoning, and agents that run for many steps
- anything in a language or a field the model saw little of
- a task where a confident wrong answer is expensive and nothing checks it

### Getting the most from one

- **Fine-tune it.** Part 2 of the language models module said fine-tuning changes behaviour well and knowledge poorly. A small model's weakness is knowledge, which you will supply in the prompt, and its task is behaviour. A few thousand good examples of your task often lift a small model past a general model many times its size, on that task alone.
- **Write for it.** Short, explicit prompts. One job for each call. Steps in your code, not in the prompt. Structured output forced with a schema, which the local engines support.
- **Keep the bits.** Use the highest precision that fits. The smaller the model, the more it matters.
- **Measure it.** Build the eval set described in [part 9 of the practical AI module](file/7a3f2c68-91de) before choosing. With small models the differences between candidates on your task are large and do not follow the public rankings.
- **Give it a way up.** Let it say it does not know, and route those cases to something bigger.

### The whiteboard version

Four ways to a small model: round the numbers, teach an apprentice, prune and retrain, or raise it small on excellent material. All four lose facts before they lose skills. So a small model is a specialist, not a scholar. Give it one job, the facts it needs and a check on its work, and it will do that job for almost nothing, anywhere.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Quantisation | Storing weights at lower precision, with loss growing as bits and model size fall | Saving the model at lower quality, like a compressed photo. Fine at first, then suddenly not |
| Quantisation-aware training | Training with weights constrained to few levels, so that the model learns to work within them | Teaching the model from the start to get by on rough numbers, in place of roughening them afterwards |
| Distillation | Training a small student on a large teacher's outputs or distributions | An apprentice learning from a master. It learns what it was shown, and no more |
| Structured pruning | Removing whole layers, heads or neurons by measured importance, then retraining to recover | Cutting out the parts that matter least, then giving the model time to heal |
| Over-training | Training a small model on far more tokens than the compute-optimal amount, to lower the cost of running it | Giving a small student many more years of school, because it will be working for a very long time |
| Task-specific model | A tiny model trained on one job, such as tool calling, and nothing else | A specialist that does one thing superbly and cannot make conversation |
| Skill versus knowledge | Compression removes long-tail facts and long reasoning chains before it removes format and instruction following | It forgets the encyclopaedia before it forgets its manners |

## Misconceptions to correct

### "A small model is just a worse big model"

**True:** on any broad test of knowledge or reasoning, a small model scores lower, and always will.

**Misleading:** on one narrow task, a small model trained for it can match or beat a general model many times its size, at a fraction of the cost and delay, on a device with no connection. It is a different tool, not a poorer one.

**What to say:** "We would not ask it to be our expert. We ask it to do one job, thousands of times a second, for nearly nothing. For that it is the better choice."

### "Quantising is free, so always take the smallest file"

**True:** at 8 bits the loss is hard to find, and at 4 bits it is small for a large model.

**Misleading:** the loss grows as the model shrinks, and it lands on reasoning, code and rarer knowledge, which casual testing misses. Below 4 bits, a model that was not trained for it degrades fast.

**What to say:** "We take the most precise version that fits, and we test the one we will ship, not the one in the report."

### "It scored as well as the big model, so it will do the same job"

**True:** small models now reach benchmark scores that only large models managed two years ago.

**Misleading:** a score measures the benchmark. Small models, especially those trained on synthetic exercises, are closest to large ones on exam-style questions and furthest on open-ended work, rare knowledge and long tasks.

**What to say:** "Scores tell us which models to try. Our own fifty cases tell us which one to use."

## Glossary

Terms introduced in this part, in plain language and in alphabetical order. Distillation, quantisation and parameters are defined in the glossaries of the language models module.

| Term | Meaning |
| --- | --- |
| Depth pruning | Removing whole layers from a model |
| On-device | Running on the phone, watch or machine in front of the user, with no server involved |
| Over-training | Training a model on far more text than would be most economical for training alone, so that it is cheaper to run for its quality |
| Pruning | Removing parts of a trained network to make it smaller |
| Quantisation-aware training | Training a model with low-precision weights from the start, so that it works well at that precision |
| Reasoning distillation | Training a small model on worked solutions written by a large reasoning model |
| Small language model | A language model small enough to run on a laptop or phone. In 2026, roughly 4 billion parameters or fewer |
| Structured pruning | Pruning whole layers, heads or neurons, so that the remaining model is smaller and faster on ordinary hardware |
| Synthetic data | Training text written by a model and not by people |
| Task-specific model | A model trained for one job and no other |
| Ternary weights | Weights that can each take only three values: minus one, zero or one |
| Unstructured pruning | Setting individual weights to zero wherever they are, which saves little time on ordinary hardware |
| Width pruning | Narrowing a model's layers by removing neurons or attention heads |

## Sources

Figures and descriptions of the three families come from each project's own report or repository, read in September 2026, and so do the comparisons they make. The account of which abilities survive compression, and the advice in section 5, rest on the drafter's general knowledge.

- [SmolLM3: smol, multilingual, long-context reasoner](https://huggingface.co/blog/smollm3), Hugging Face, July 2025, for the size, the training tokens, the context length, the languages, the thinking mode and what was published
- [Phi-3 Technical Report](https://arxiv.org/abs/2404.14219), April 2024, for the 3.8-billion-parameter model, its data and the comparison with larger models
- [Phi-4-Mini Technical Report](https://arxiv.org/abs/2503.01743), March 2025, for the vocabulary, the synthetic data recipe and the multimodal sibling
- [Needle](https://github.com/cactus-compute/needle), Cactus Compute, for the file sizes, the precision, the tasks, the deployable depths, the licence and the makers' benchmark claims
- [Compact Language Models via Pruning and Knowledge Distillation](https://arxiv.org/abs/2407.14679), NVIDIA, July 2024, for structured pruning followed by distillation, the compression factors and the share of training data needed
- [The Era of 1-bit LLMs](https://arxiv.org/abs/2402.17764), Microsoft, February 2024, for ternary weights trained from the start
- [DeepSeek-R1](https://arxiv.org/abs/2501.12948), January 2025, for small models distilled from a reasoning model's outputs
- [Distilling the Knowledge in a Neural Network](https://arxiv.org/abs/1503.02531), Hinton, Vinyals and Dean, 2015, for the original method

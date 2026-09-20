# Part 3: Diffusion Language Models

2026-09-19 · Chris Neale

## About this part

This is the third of four parts in the other AI models module. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). The format is the same as elsewhere: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 25 minutes.

Two modules of this course describe two machines. The language models module describes a model that writes one token at a time, left to right. The generative media module describes a model that starts from noise and refines a whole picture at once. This part is about what happens when the second machine is pointed at the first one's job. It draws on [part 1 of the language models module](file/590c1ae1-8bf3) and [part 1 of the generative media module](file/7c41d2a9-1e05), and recaps what it needs from each.

### What part 3 gives you

Part 3 builds one idea: a diffusion language model drafts the whole passage and then revises it, where an ordinary one commits to each word before thinking of the next. Writing many tokens at each step makes it fast, and being able to see the whole draft lets it fill gaps and fix earlier words. In return it gives up some accuracy, some control, and most of the engineering that a decade of left-to-right models has accumulated. In 2026 it is a real option for work where speed is the point, and an experiment everywhere else.

## 1. Two ways to write

**In plain terms.** Today's chat models write the way you speak: one word after another, never going back. A diffusion language model writes more the way you edit: it starts with a page of blanks, fills in the words it is surest of all over the page, and keeps going round until the page is complete. Because it fills many blanks at once, it can finish much sooner. **Who should read it:** everyone.

### One at a time

Part 1 of the language models module described autoregressive generation. The model reads everything so far and produces a probability for every possible next token. One is chosen, added to the text, and the model runs again. A reply of 500 tokens takes 500 passes, each waiting for the last. A token, once written, is never changed. If the third word was a poor choice, every later word has to live with it.

### All at once, several times

A diffusion language model starts with the reply as a row of blanks, called masks. On each pass it looks at the whole row, prompt and blanks together, and predicts every blank at once. It keeps the predictions it is most confident of, leaves the rest blank, and goes round again. With each pass more of the text is settled, and what is settled helps with what is not.

```
start    [mask] [mask] [mask] [mask] [mask] [mask] [mask]
pass 1   The    [mask] [mask] [mask] the    [mask] .
pass 2   The    cat    [mask] on     the    mat    .
pass 3   The    cat    sat    on     the    mat    .
```

Seven tokens took three passes, not seven. At scale, a few hundred tokens might take a few dozen passes. That is the source of the speed.

The connection to images is the shape of the process, not the detail. Part 1 of the generative media module described starting from pure noise and removing it in steps. Text cannot be slightly noisy, because a token is one word-piece or another and nothing in between. So the text version of noise is the mask: a fully masked reply is pure noise, and unmasking is denoising. Training matches. Take real text, mask a random share of it, anywhere from a little to all, and train the model to restore what is missing.

## 2. How it works, and what had to be solved

**In plain terms.** The idea is simple, and making it practical took three fixes. The model has to see in both directions, which means a different kind of training. Replies have no fixed length, so writing in chunks was needed. And the trick that makes ordinary models fast had to be rebuilt, because it depends on never changing earlier text. **Who should read it:** engineers. Others can skip to section 3.

### Seeing both ways

An autoregressive model is trained with a rule that each position may look only to its left, since that is all that exists when it is generating. A diffusion model fills blanks that have settled text on both sides, so every position looks at every other. That is a different model, trained differently.

It can be trained that way from the start. LLaDA, from early 2025, was an 8-billion-parameter model trained from scratch by masking, and its authors reported it to be competitive with an autoregressive model of the same size trained the ordinary way. That established that nothing about language requires the left-to-right design.

Training from scratch throws away the enormous investment in existing models, and work through late 2025 found it learns less from each training token. So the common recipe by 2026 is conversion: take a trained autoregressive model and continue training it with the masking objective. It keeps what the model knows and changes how it writes.

### Writing in blocks

Pure diffusion needs the reply's length fixed before it starts, since it begins with that many blanks. It also cannot use the key-value cache, the store of earlier computation that part 3 of the language models module showed is what makes generation affordable, because any token might still change.

Block diffusion solves both. The reply is written in blocks of a few dozen tokens. Within a block the model works by diffusion, filling blanks in parallel over a handful of passes. Between blocks it is autoregressive: once a block is finished it is fixed, its computation is cached, and the next block begins. Length is open-ended again, the cache works again, and most of the parallel speed is kept. Nearly every deployed diffusion language model works this way, so in practice these are hybrids.

### The dial

An image model's step count trades time against quality, and the same dial exists here. Fewer passes means more tokens settled on each pass, and more of them wrong, since tokens settled together cannot take each other into account. More passes approaches one token a pass, which is autoregression done the expensive way. Much current research is on deciding well which tokens are safe to settle together.

### Deep dive (optional): speed is not the same as efficiency

It is tempting to read "ten times faster" as "ten times cheaper". It is not, and the reason is in part 3 of the language models module.

Generating one token at a time leaves a graphics processor mostly idle. The work for each token is small, and the time goes on fetching the model's weights from memory. Providers fill the idle capacity by batching: serving many users' tokens in one pass. At high load an autoregressive server is already using its hardware well.

A diffusion model fills the idle capacity a different way: many tokens of one user's reply in each pass. For that single user the reply arrives far sooner. The total arithmetic is not smaller. Each pass processes the whole block, and there are several passes, so the computation for each finished token can be higher than autoregression's.

So the advantage is largest when latency matters and the server is lightly loaded: one user, waiting. As load rises, the batching an autoregressive server was already doing closes the gap. NVIDIA's Nemotron-Labs-Diffusion, published in July 2026, makes the point by being three things at once. The same model can run autoregressively, by diffusion, or with diffusion drafting tokens that its own autoregressive mode checks, and it switches between them according to how busy it is.

## 3. What it trades

**In plain terms.** The gain is speed, often five to ten times, which changes what a tool can feel like. There are smaller gains in filling gaps and editing. The costs are somewhat lower accuracy on hard questions, weaker support for the features developers rely on, and a young, thin ecosystem. **Who should read it:** everyone. The table is the summary.

| | Autoregressive | Diffusion |
| --- | --- | --- |
| Writes | One token a pass, left to right | Many tokens a pass, in any order, over several passes |
| Speed for one user | Tens to a few hundred tokens a second | Around a thousand tokens a second in published tests |
| Can revise what it wrote | No | Within the block being written, yes |
| Filling a gap in the middle | Needs special training | Natural. It is what the model does |
| Quality at the top end | The best models are all of this kind | Competitive with small and mid-sized models. Behind on hard reasoning and knowledge |
| Forcing a format | Mature: schemas and grammars are enforced token by token | Harder, since tokens do not arrive in order. Methods are appearing |
| Tools, caching, serving software | A decade of engineering | Early |
| Choice of models | Hundreds | A handful |

### The speed is real

Inception Labs' Mercury Coder was the first commercial example, in 2025. Independent tests measured it at over a thousand tokens a second on the graphics cards of the day, which its report put at up to ten times faster than speed-optimised autoregressive models of comparable quality. Google DeepMind's experimental Gemini Diffusion was reported at about 1,500. Mercury 2, in February 2026, added a reasoning mode at about a thousand tokens a second, against well under a hundred for the small reasoning models it was compared with.

A thousand tokens a second changes the feel of things. A screen of code appears in under a second. A reasoning model's long deliberation, which part 2 of the language models module described and which users wait through, shrinks from half a minute to a few seconds. An agent that makes fifty model calls finishes while you are still reading its first message. A voice assistant replies without the pause.

### What else is gained

- **Filling in.** Code completion in the middle of a file, editing a paragraph in place, and completing a template are all "restore the missing part", which is the training task itself.
- **Looking ahead.** Because the model sees the whole draft, the end of a sentence can shape its beginning. LLaDA's authors showed it handling a task that trips autoregressive models, completing a poem backwards, line before line. NVIDIA's work reports that training with both objectives improves planning ahead.
- **Second thoughts.** Some designs let the model re-mask a token it has come to doubt, and so correct an early mistake, which an autoregressive model can never do.

### What is given up

- **Accuracy where it is hardest.** Google's own figures for its experimental model show it level with a small autoregressive sibling on coding tests and clearly behind on graduate-level science questions, 40% against 57%, and on multilingual tasks. The top of every quality ranking remains autoregressive.
- **Guaranteed structure.** [Part 4 of the practical AI module](file/c9146f3b-27a8) relied on constrained decoding to guarantee valid JSON. That machinery checks tokens as they arrive in order, and here they do not. Equivalents for diffusion were still being published in mid-2026.
- **The ecosystem.** Prompt caching, tool-calling formats, serving stacks, quantised builds for laptops and fine-tuning recipes all assume the autoregressive design. Each is being rebuilt, and few are finished.
- **Familiar behaviour.** Settings such as temperature act differently, and a reply streams in blocks that fill in, not as a steady line of text.

## 4. Where it stands, and when to consider one

**In plain terms.** In 2026 you can buy access to a fast diffusion model aimed at coding, download several open ones, and try Google's as a demo. None is a general replacement for the models you use now. They are worth testing where a person or a program is waiting and the task is not among the hardest. **Who should read it:** anyone choosing models for a latency-sensitive product.

### What exists

| Model | From | Status in September 2026 |
| --- | --- | --- |
| Mercury, Mercury Coder, Mercury 2 | Inception Labs | A commercial API. Aimed at coding, agents and voice. Mercury 2 has a reasoning mode |
| Gemini Diffusion | Google DeepMind | An experimental demo, announced in May 2025 |
| LLaDA | Renmin University and Ant Group | Open weights. The first 8-billion-parameter model trained from scratch, and larger successors |
| Nemotron-Labs-Diffusion | NVIDIA | Open models at 3, 8 and 14 billion parameters that run in autoregressive, diffusion or mixed mode |

The list dates quickly and is not complete.

### When to try one

- **Latency is the product.** Autocomplete, inline edits, voice, anything in the middle of an interaction.
- **An agent is slow because of many small calls**, none of them especially hard.
- **The work is filling in or rewriting**, not open-ended composition.
- **A hosted API is acceptable.** Running one locally is possible with the open models and is not yet well supported by the tools in the running AI locally module.

And when not to: the hardest reasoning, knowledge-heavy questions, strict structured output, and anywhere your existing tooling does the heavy lifting.

Test it as [part 6 of the practical AI module](file/7a3f2c68-91de) describes, on your own cases, and measure what the user experiences, which is time to a complete, correct answer. A fast wrong answer followed by a retry is slower than a slow right one.

### Where it is going

The likeliest outcome is not that one design replaces the other. The designs are merging. Block diffusion is already half autoregressive. Autoregressive models have for some time used a related trick, speculative decoding, in which a small fast model drafts several tokens and the large model checks them in one pass. Using diffusion as the drafter, inside the same model, is the step NVIDIA's work takes. A reader in a few years may find that "diffusion or autoregressive" has become a setting and not a kind of model.

### The whiteboard version

Ordinary models write a word at a time and never look back. Diffusion models start from a page of blanks and fill it in over a few passes, many words at once. That makes them several times faster for one user, and good at filling gaps. They are behind on the hardest questions and on tooling. Consider one where someone is waiting, and test it on time to a correct answer.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Autoregressive generation | One token sampled for each forward pass, conditioned on everything to its left, never revised | Writing in ink, one word at a time, without going back |
| Diffusion language model | Iterative parallel unmasking of a token sequence by a model with bidirectional attention | Starting with a page of blanks and filling in the surest words everywhere, round after round |
| Masking as noise | The discrete analogue of image noise: tokens are replaced by a mask, and the model is trained to restore them | Text cannot be blurred like a picture, so the model practises on text with words blacked out |
| Block diffusion | Diffusion within fixed-size blocks, autoregression between them, which restores caching and open-ended length | It writes a paragraph at a time. Each paragraph is drafted and revised as a whole, then fixed |
| Steps versus quality | Fewer denoising passes settle more tokens at once, with more conflicts between them | The fewer rounds of revision, the faster and rougher the result |
| Latency versus throughput | Parallel decoding raises tokens a second for one request without lowering compute for each token | One customer is served much faster. The kitchen does not cook more meals an hour |
| Infilling | Generating a missing span conditioned on both sides | Filling a gap in the middle of a page so that it fits what comes before and after |

## Misconceptions to correct

### "It is an image generator making text"

**True:** the idea was borrowed from image models, and the process has the same shape: start from nothing useful and refine in steps.

**Misleading:** it is a language model through and through: a transformer over tokens, trained on text, usually converted from an ordinary LLM. There is no picture and no continuous noise. The "noise" is blanked-out words.

**What to say:** "It is a language model that drafts and revises, where the usual kind writes straight through. The family resemblance to image models is the revising."

### "Ten times faster means ten times cheaper"

**True:** for one request the answer does arrive several times sooner, and that is worth money where people are waiting.

**Misleading:** the speed comes from doing more work in parallel, not less work. Under heavy load, ordinary models already use the hardware fully, and the gap narrows. Prices are set by vendors and do not track speed.

**What to say:** "We are buying shorter waits, not a smaller bill. We will look at the actual price, and at the time to a correct answer on our own tasks."

### "This will replace the models we use now"

**True:** diffusion models have gone from research to products in about a year, and the speed advantage is large.

**Misleading:** the strongest models remain autoregressive, the tooling gap is wide, and the most active research combines the two designs. Expect the fast mode to be absorbed into mainstream models more than a changing of the guard.

**What to say:** "It is a good option where speed is what matters. We try it there, keep our current models for the hard work, and expect the two to grow together."

## Glossary

Terms introduced in this part, in plain language and in alphabetical order. Tokens, attention and the key-value cache are defined in the glossaries of the language models module, and denoising in the generative media module.

| Term | Meaning |
| --- | --- |
| Autoregressive | Generating one token at a time, each depending on all the tokens before it |
| Bidirectional attention | Attention in which every position can look at every other, to its left and its right |
| Block diffusion | Writing a reply in blocks: diffusion inside each block, one block after another |
| Conversion | Turning a trained autoregressive model into a diffusion model by further training |
| Denoising pass | One round in which the model predicts the masked tokens and settles some of them |
| Diffusion language model | A language model that generates by filling in a masked sequence over several passes |
| Infilling | Generating text to fit a gap, using what comes before and after it |
| Latency | How long one request takes to be answered |
| Mask | A placeholder token meaning "not decided yet" |
| Parallel decoding | Settling several tokens in one pass |
| Re-masking | Blanking a token again so that it can be reconsidered |
| Speculative decoding | A fast drafter proposes several tokens and the main model checks them in one pass |
| Throughput | How much work a server completes in a given time, across all its users |

## Sources

Speeds and scores are as reported by each developer or by the testers they cite, read in September 2026, on hardware and workloads of their choosing. The comparison table in section 3, and the account in the deep dive of why the speed advantage narrows under load, rest on the drafter's general knowledge together with the Nemotron paper.

- [Large Language Diffusion Models](https://arxiv.org/abs/2502.09992), February 2025, for LLaDA: masking as the training task, an 8-billion-parameter model trained from scratch, and the reversal result
- [Mercury: Ultra-Fast Language Models Based on Diffusion](https://arxiv.org/abs/2506.17298), Inception Labs, June 2025, for the first commercial models and their measured speeds
- [Inception launches Mercury 2](https://www.businesswire.com/news/home/20260224034496/en/Inception-Launches-Mercury-2-the-Fastest-Reasoning-LLM-5x-Faster-Than-Leading-Speed-Optimized-LLMs-with-Dramatically-Lower-Inference-Cost), February 2026, for the reasoning mode and its speed
- [Gemini Diffusion](https://deepmind.google/models/gemini-diffusion/), Google DeepMind, for the speed, the claimed benefits, the benchmark comparison and its experimental status
- [Block Diffusion](https://arxiv.org/abs/2503.09573), March 2025, for diffusion within blocks and autoregression between them, restoring caching and open-ended length
- [Efficient-DLM](https://arxiv.org/abs/2512.14067), December 2025, for converting autoregressive models, and for training from scratch learning less efficiently
- [Nemotron-Labs-Diffusion](https://arxiv.org/abs/2607.05722), NVIDIA, July 2026, for one model with three modes, switching with load, and the complementarity of the two objectives
- [Constrained Decoding for Diffusion Language Models](https://arxiv.org/abs/2607.07026), July 2026, for the state of guaranteed structure

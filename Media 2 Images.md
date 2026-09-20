# Part 2: Images

2026-09-19 · Chris Neale

## About this part

This is the second of seven parts in the generative media module. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). The format is the same as before: **In plain terms** opens each numbered section, and a glossary closes the part. Reading time is about 20 minutes.

[Part 1](file/7c41d2a9-1e05) described the machine using pictures as its example, so this part is short. It collects what is particular to still images: where the medium stands, what still goes wrong and why, and which models exist.

### What part 2 gives you

Images are the mature medium. The models are good, cheap and fast, the tools for controlling them are the most developed, and the ways they fail are well understood. If you know what is reliable here and what is not, you know what to expect of video, music and 3D in a year or two, because each is following the same path some distance behind.

## 1. Where images stand

**In plain terms.** Making a good still picture from a description is now routine. It takes seconds and costs a cent or so. What is not routine is exactness: the right number of things, in the right places, with the right words on them, looking the same in the next picture. **Who should read it:** everyone.

A current image model will reliably give you a well-lit, well-composed, convincing picture of almost anything that has been widely photographed or drawn. Light, reflection, perspective, skin, fabric and weather are usually right. Style is controllable across a very wide range. A single image takes between one and thirty seconds, on a hosted service or a good graphics card.

What remains hard falls into four groups, and part 1 gave the reason for each.

- **Exactness.** Counts, positions, relationships between objects, and lettering. Section 2 goes through these.
- **Consistency.** The same character, product or style across many images. The basic machine does not do this at all, and part 6 is about the techniques that do.
- **Truth.** A real place, a real product, a real person, a working diagram. The model produces what such things usually look like, which is not what this one looks like.
- **Structure.** The output is a flat grid of pixels. There are no layers, no editable text, no vectors and usually no transparency.

So the medium is strongest for concept work, illustration, mood and backgrounds, marketing imagery where no specific real thing is depicted, and as a rendering step for a composition a person has laid out. It is weakest for anything that must be accurate: technical diagrams, maps, charts, interface mock-ups with real text, and pictures of your actual product. For those, the workable pattern is the one part 6 recommends throughout: a person supplies the part that must be exact, and the model renders around it.

## 2. What goes wrong in pictures

**In plain terms.** The model has learned what pictures look like, not what is in them. So it is weakest wherever a picture can look fine and still be wrong: the number of fingers, the letters on a sign, how many apples you asked for, which coat was meant to be red. **Who should read it:** everyone. This is the section to have read before you review generated images.

### Hands, and their relatives

Hands were the famous failure. A hand is small in most photographs, takes countless poses, and is often partly hidden, so the training signal is weak and varied. "Several roughly parallel fingers" looks plausible locally even when the count is wrong. Larger models, better data and more detailed latents have made bad hands uncommon, but the cause has not gone away. It shows up wherever exactness matters and appearance is forgiving: teeth, the spokes of a wheel, the keys of a piano, the rigging of a ship, the pattern on a repeated tile.

### Lettering is drawing, not writing

Text in an image is shapes. To letter a word correctly, the model must know its spelling and draw each glyph exactly. First-generation models could do neither. Their encoder saw words as whole tokens, with no access to the letters inside them, which is the same blind spot [part 1 of the language models module](file/590c1ae1-8bf3) describes for letters inside tokens. And the 8 x 8 blocks of the latent were too coarse for small type.

Models with a sentence-level encoder and a richer latent do far better, and short signs and headlines now usually come out right. Long passages, small print and unusual names still fail. Check every word of any lettering before an image is used, and expect to add real text afterwards in a design tool for anything that matters.

### Counting and relationships are weak

"Three apples" often yields four. "A red cube on a blue sphere" may swap the colours. "A cat to the left of a dog" is honoured about as often as not by older models. A keyword encoder does not carry the structure of the sentence, and the image has no slot for "the second apple". Attributes leak between objects for the same reason: ask for a woman in a green coat beside a red car and the coat may come out red.

Language-model encoders improve all of this substantially. It remains the first place to look when a model ignores part of a prompt.

### Small things

Part 1 explained that the model works on a miniature in which each position stands for a block of pixels. Anything only a few pixels across is below the resolution the model thinks in, and the decoder invents it. A face that fills the frame is fine. The same face at the back of a crowd is often mangled, as are distant signs, jewellery and the small print on packaging. Newer models keep more information at each position and do better. The practical fix is to generate the small thing large, separately, or to repair it afterwards with the inpainting that part 6 describes.

### A checklist for review

Before a generated image is used, look at: every hand and every face, however small. Every letter of any text. The count of anything that was counted in the brief. Whether each colour and attribute is on the object it was meant for. Reflections and shadows, which should agree with the light. Repeated structures such as fences, windows and keyboards. And whether it resembles anything recognisable, which part 6 returns to.

## 3. The model families

**In plain terms.** There are hosted image services, which you use through a website or an API, and open models, which you can download. The open ones come in families, and everything built for one family, all its add-ons and adapted versions, works only with that family. Newer families read prompts far better. Older ones have far more add-ons. **Who should read it:** anyone who will choose a model. Others can read the four points after the table.

Hosted services are the default for most people, and part 6 compares the two routes. They change too fast to list usefully, and they fall into the two kinds that part 1 described: diffusion services with a house style and a set of switches, and assistants built on a language model that generate and edit in conversation. Part 7 covers how to prompt each.

Open models matter because they can be adapted, and part 6 is about that. Stable Diffusion is the family the open ecosystem grew from, and its early generations still matter. But the field has moved on from one company to many, and the newest families look quite different from the first. The table is as of September 2026, and this is the fastest-dating page in the module.

| Family | Released | Size | Reads prompts with | Licence of the weights | Notes |
| --- | --- | --- | --- | --- | --- |
| Stable Diffusion 1.x | 2022 | About 1 billion | CLIP | Open, with a list of forbidden uses | Small, fast, runs on almost anything. Superseded for quality, still used for its add-ons |
| Stable Diffusion XL | 2023 | 2.6 billion denoiser | Two CLIP encoders | Open, with a list of forbidden uses | Still has by far the largest library of fine-tunes, LoRAs and control models, above all for illustration |
| Stable Diffusion 3.5 | 2024 | 2 to 8 billion | Two CLIP encoders and T5 | Free below a revenue threshold | The first of the family to read sentences. It never gathered an ecosystem |
| FLUX.1 | 2024 | 12 billion | CLIP and T5 | Differs by variant | From a company founded by authors of the original latent diffusion work. A large LoRA library |
| Qwen-Image | August 2025, with versions to December 2025 | 20 billion | A vision-language model | Apache 2.0, which allows commercial use | From Alibaba. Known for accurate lettering, in Chinese as well as English. Separate editing versions |
| HunyuanImage 3.0 | September 2025 | 80 billion, of which 13 billion run per token | Itself: it is a language model | Its publisher's own community licence | From Tencent. Not a diffusion model but the token design from part 1. Needs several data-centre GPUs |
| FLUX.2 | November 2025, smaller versions since | 32 billion, with versions of 9 and 4 billion | A 24 billion parameter vision-language model. A 4 billion parameter language model in the smallest | Non-commercial for the 32 and 9 billion versions. Apache 2.0 for the 4 billion | Generation and editing in one model, with up to ten reference images. The smallest version runs in about 13 GB |
| Z-Image | November 2025 and January 2026 | 6 billion | A 4 billion parameter language model | Apache 2.0 | From Alibaba. The fast version needs 8 steps and fits in 16 GB |
| Ideogram 4.0 | June 2026 | 9.3 billion | An 8 billion parameter vision-language model | Non-commercial | From a design-tool company. Built for typography and layout. Trained only on structured JSON captions, which part 7 returns to |
| Krea 2 | June 2026 | 12 billion | A vision-language model | Its publisher's own licence, which requires deployers to filter content | From a design-tool company. Published as a raw base for fine-tuning and a fast distilled version |

Four things have changed since the first generation, and they matter more than any row of the table.

- **The reader is now a language model.** Every family released since mid-2025 reads prompts with a full language model or vision-language model, not with CLIP. That is why they follow long descriptions, handle layout and letter text correctly, and it is why part 7 treats prose and structured prompts as the current dialects.
- **Generating and editing have merged.** Newer families take images as input alongside the prompt, so one model generates, edits by instruction and works from reference images. Several of the techniques in part 6 are becoming built-in abilities and not add-ons.
- **Models have grown past a single consumer card.** Twenty to thirty billion parameters, plus a text encoder that is itself a large language model, does not fit in 24 GB without heavy quantisation. In response, publishers now ship a small, fast tier of 4 to 6 billion parameters aimed squarely at consumer hardware.
- **"Open" no longer means "free to use".** The weights of several of the best models can be downloaded by anyone and used commercially by no one without a paid licence. The permissively licensed families now come mainly from Chinese labs. Part 6 explains why the licence of the exact file matters.

The names will keep changing. The pattern that matters is stable: each family is a separate world.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Why details fail | The model is trained to match the distribution of images, which rewards local plausibility and not global correctness | It learned what pictures look like, not what is in them. So it is weakest where a picture can look fine and be wrong |
| Attribute leakage | Text conditioning that does not bind attributes to objects, so that attention spreads a property across several regions | Ask for a green coat and a red car, and the coat may come out red. The model hears the colours and the objects, and not which goes with which |
| Model family | A base model and everything derived from its weights. Adapters are valid only within it | A make of engine. Parts made for one do not fit another |

## Misconceptions to correct

Two claims come up constantly. Agree with the true part first, then add what it leaves out.

### "You can always tell, just look at the hands"

**True:** early models made obvious errors, and careful inspection still finds mistakes in lettering, reflections and fine repeated structures.

**Misleading:** current models get hands right most of the time, and a good generated image passes casual inspection. Detection software is unreliable and easily defeated. The dependable signal is provenance: metadata attached when an image is made or captured, which part 6 covers. It can be stripped, so its absence proves nothing.

**What to say:** "We should not rely on anyone's eye, including mine. For images we publish, we keep a record of how each was made. For images we receive, we treat the source as the evidence, not the pixels."

### "It cannot do text, so we cannot use it for anything with words"

**True:** first-generation models could not letter at all, and even now long passages, small print and unusual names fail.

**Misleading:** current models letter short signs, headlines and labels correctly most of the time, in several scripts, and some are built for typography and layout. The remaining risk is that a wrong letter is easy to miss.

**What to say:** "Short text usually works now. We check every letter, and for anything that matters, the real words go on afterwards in a design tool, where they stay editable."

## Glossary

Every technical term used in this part, in plain language and in alphabetical order. Terms from part 1 are not repeated.

| Term | Meaning |
| --- | --- |
| Attribute leakage | A colour or property asked for on one object turning up on another |
| Base model | A model trained from scratch by a lab, which fine-tunes and add-ons start from |
| Family | A base model together with every fine-tune and add-on made from it. Add-ons work only within their family |
| Licence, non-commercial | Terms that let anyone download and try a model, and no one use it for paid work without a separate agreement |
| Vision-language model | A language model that also reads images. The text encoder in most image models released since 2025 |

## Sources

Dates, sizes and licences in section 3 come from each publisher's model card or announcement, read in September 2026.

- [Qwen-Image](https://github.com/QwenLM/Qwen-Image), [HunyuanImage 3.0](https://huggingface.co/tencent/HunyuanImage-3.0), [FLUX.2](https://bfl.ai/blog/flux-2), [FLUX.2 dev](https://huggingface.co/black-forest-labs/FLUX.2-dev) and [FLUX.2 klein 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B), [Z-Image](https://github.com/Tongyi-MAI/Z-Image), [Ideogram 4.0](https://ideogram.ai/blog/ideogram-4.0/) and [Krea 2](https://www.krea.ai/blog/krea-2-technical-report), for sizes, text encoders, dates and licences
- [SDXL](https://arxiv.org/abs/2307.01952), 2023, for the 2.6 billion parameter denoiser and its two text encoders
- [Scaling Rectified Flow Transformers for High-Resolution Image Synthesis](https://arxiv.org/abs/2403.03206), 2024, for the move to sentence-level text encoders and richer latents

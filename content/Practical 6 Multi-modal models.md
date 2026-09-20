# Part 6: Multi-modal Models

2026-09-19 · Chris Neale

## About this part

This is the sixth of nine parts in the practical AI module. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). The format is the same as elsewhere: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 30 minutes.

[Part 3](file/f3a91c20-6d4e) said the model knows only what is in front of it. Until recently that meant text. Most current models also accept pictures, many accept documents as pictures, and some accept sound and video. This part explains how that works, what it costs, and what these models reliably miss.

It is about models that take in media. Models that produce media are the subject of the [generative media module](file/7c41d2a9-1e05), and the two are different machines that are easy to confuse, as section 1 explains.

### What part 6 gives you

Part 6 builds one idea: to the model, a picture or a sound is more tokens. Everything follows from that. It is why an image has a price, why a detail too small for the grid is simply absent, why a model can discuss a chart and still misread a number on it, and why text inside an image can give the model orders. A multi-modal model reads your media. It does not look at it the way you do.

## 1. What multi-modal means

**In plain terms.** A multi-modal model takes in more than one kind of thing: text and images, and sometimes audio and video. You can show it a screenshot, a scanned invoice or a photograph of a whiteboard and ask about it. What comes out is still, in most cases, text. Taking a picture in and making a picture are different abilities, and a model may have one without the other. **Who should read it:** everyone.

### In and out are separate

A mode is a kind of data: text, image, audio, video. A model has a list of modes it accepts and a list of modes it produces, and the lists are rarely the same. The most common arrangement by far is text and images in, text out. Such a model can describe, compare, transcribe and reason about an image. It cannot draw one.

| Kind of model | Takes in | Gives back | Covered in |
| --- | --- | --- | --- |
| Language model | Text | Text | The language models module |
| Vision-language model | Text and images, often documents | Text | This part |
| Omni model | Text, images, audio and video | Text, and sometimes speech | This part |
| Generative media model | Text, and sometimes media to start from | Images, video, music or 3D | The generative media module |

When a chat product appears to do everything, it is usually a language model with tools. It reads your photograph itself, and when you ask for a picture it writes a prompt and calls an image model, as [part 7](file/c9146f3b-27a8) describes. The join matters when something goes wrong, because the model that understood your request is not the one that drew the result.

The line is blurring. A few models now generate images or speech from the same network that reads them, and the token-based design described in the generative media module is the route by which that is happening. For practical purposes in 2026, check the two lists for the model in front of you.

### What it is good for

- reading documents as they are, with their tables, stamps, handwriting and layout
- extracting fields from forms, receipts and invoices into structured data
- explaining a chart, a diagram or an architecture drawing
- checking a user interface: a coding agent that can see the rendered page can fix what it sees
- describing images for accessibility, search or moderation
- transcribing and summarising meetings, with who said what
- operating software that has no API, through screenshots

## 2. How a model reads a picture

**In plain terms.** The model cuts the image into a grid of small squares, turns each square into something shaped like a word, and reads the squares along with your text. So a picture costs tokens, like text, and a bigger picture costs more. Anything much smaller than a square is lost, and an oversized image is shrunk first, which can blur small print. **Who should read it:** everyone can read the main text. The arithmetic is for whoever pays the bill.

### From pixels to tokens

Part 1 of the language models module shows text becoming tokens, and each token becoming a vector. An image takes a parallel path to the same place. It is divided into patches, a small network turns each patch into a vector, and those vectors are placed in the sequence beside the vectors for your words. From there on the transformer treats them alike. Attention lets a word in your question look at a patch of the image in the same way it looks at another word.

This explains the general shape of what these models can do. They are good at what an image is about, how its parts relate, and what the text in it says, because those survive being turned into a few thousand vectors. They are weaker at exact positions, exact counts and fine detail, because those often do not.

### What an image costs

The figures differ by vendor, and one documented example shows the pattern. Anthropic's Claude models use patches of 28 by 28 pixels, and an image costs one token per patch.

```
tokens = ceil(width / 28) x ceil(height / 28)

1000 x 1000 pixels   ->  36 x 36  =  1,296 tokens
1920 x 1080 pixels   ->  69 x 39  =  2,691 tokens
```

Each model has a ceiling. On the current high-resolution models it is a long edge of 2,576 pixels and 4,784 tokens, and on older ones 1,568 pixels and 1,568 tokens. A larger image is scaled down to fit before the model sees it. So a 4K screenshot costs no more than the ceiling, and its small text may no longer be legible after the shrink.

At a few dollars per million input tokens, a thousand one-megapixel images cost single-digit dollars. That is cheap for a task and adds up in a loop. An agent that takes a screenshot at every step, and resends the conversation each turn, pays for every earlier screenshot again unless the harness clears them, which is one more reason for the compaction in [part 5](file/1d8f42a6-b93e).

### Getting a good reading

- **Send the part that matters.** Crop to the table, the error message or the component. A crop at full resolution beats a whole page scaled down.
- **Resize it yourself.** If you shrink the image to the model's limit, you see exactly what the model will see, and you can check that the small print survived.
- **Image first, question after.** The advice for long documents applies: material first, then the question.
- **Label several images.** "Image 1:", "Image 2:", so that you and the model can refer to them.
- **Keep it upright and sharp.** Rotated, blurred and heavily compressed images are documented causes of errors.
- **Do not rely on hidden data.** The model sees pixels only. It does not receive the file's metadata, such as the date or the location in a photograph.

### Deep dive (optional): two ways to connect an eye

Most vision-language models are built from two parts that were trained separately. A vision encoder, usually a vision transformer, has already learned to turn image patches into useful vectors. A small projector network translates those vectors into the space the language model uses for its tokens. The combined model is then trained on images paired with text, so that the language model learns to make use of what the encoder says. The design is economical, because both halves exist already. The Qwen3-VL family, an open-weight line from Alibaba with models from 2 billion to 235 billion parameters and a 256,000-token context, is a well-documented example.

The alternative is to train one network on everything from the start, with no separate encoder. Raw patches, and short slices of audio, are projected directly into the token space, and a single transformer learns all of it together. Google describes its Gemma 4 12B model, released in April 2026, as encoder-free in this sense. The argument for it is that nothing is lost in translation between two networks trained for different purposes. The argument against is cost, since nothing can be reused.

Either way the practical behaviour is the same: a fixed grid, a token budget for each image, and a ceiling on resolution. The differences show up in benchmarks more than in how you use the model.

## 3. Documents, charts and screens

**In plain terms.** The commonest use of a vision model at work is reading documents: PDFs with tables, scanned forms, slides, screenshots. It is very good at this, better than older scanning software on messy pages, and it understands what it reads. It also makes a kind of mistake scanners do not: it can write down what it expected to see. **Who should read it:** everyone who handles documents.

### How a PDF is read

A PDF may hold real text, pictures of text, or both. Sending only the extracted text loses the tables, the charts and anything scanned. The documented approach for Claude is to do both: each page is converted to an image, the text of the page is extracted, and the model receives the two together. The published estimate is 1,500 to 3,000 tokens a page for the text, plus the image cost from section 2. A hundred-page report can therefore run to several hundred thousand tokens, and dense documents can fill the context before any page limit is reached.

So the questions from [part 8](file/0b8e5d17-f4c2) apply. For one report, put it in the context. For ten thousand, retrieve the pages that matter first.

### Extraction

Turning documents into data is the workhorse use. Ask for structured output against a schema, as part 7 describes, and apply two rules from it with extra force. Give every field an honest way out, such as null or "unreadable", because a smudged total will otherwise be given a plausible value. And validate what comes back: totals that should add up, dates that should be dates, identifiers that should match a pattern.

For long runs of clean, printed text, a conventional OCR or PDF parser is cheaper and exact, and the model can work from its output. The model earns its cost where layout carries meaning, where the scan is poor, or where the task needs understanding as well as reading.

### Charts and diagrams

Models explain charts well: what is plotted, the trend, the outlier, what the author wants you to conclude. Reading exact values off a chart is less reliable, because a value is a position, and position is what the grid blurs. If the numbers matter, get the data behind the chart. If only the picture exists, ask for values with a stated tolerance and check a sample.

### Screens and computer use

A screenshot is an image like any other, and it closes a loop that text cannot. A coding agent that can see the rendered page, through a browser tool, can tell that the button is off the screen or the text is unreadable, which no test of the markup would show.

Computer use goes further: the model is given screenshots and tools to move the pointer, click and type, and it operates an application as a person would. It works, and it is slower and less reliable than an API call, since each step is a screenshot, a decision and an action, and a misjudged coordinate clicks the wrong thing. It is useful for legacy systems that have no API. It also carries the largest injection risk in this module, because everything on the screen is input. Section 5 returns to that.

## 4. Audio and video

**In plain terms.** Some models can listen and watch. Sound is cut into short slices and video into still frames, usually one a second, and each becomes tokens like everything else. A model that hears the audio directly catches things a transcript loses, such as who is speaking and how they sound. A model that "watches" a video has really seen a slideshow with a soundtrack, and anything that happened between the slides did not happen as far as it knows. **Who should read it:** anyone working with meetings, calls or footage.

### Two ways to handle speech

The older route is a pipeline: a speech-to-text model produces a transcript, and a language model reads it. It is cheap, the transcript can be stored and searched, and any language model will do. It discards everything that is not words: tone, hesitation, overlapping speakers, the alarm going off in the background.

The newer route is a model that takes audio in directly. Google's Gemini documentation gives a rate of 32 tokens for each second of audio, so a minute is 1,920 tokens and an hour is about 115,000. It lists transcription with timestamps, telling speakers apart, detecting emotion and recognising sounds that are not speech. It also notes that audio is downsampled and mixed down to a single channel, so a recording that kept each speaker on a separate channel loses that separation.

Some models also produce speech directly, which makes spoken conversation possible without a pipeline of three models. Alibaba's open-weight Qwen3-Omni takes text, images, audio and video, and answers in text or speech. The gain is latency and naturalness. The cost is that everything in this module still applies, to a system that now answers before anyone can review what it said.

### Video is frames plus sound

No current model takes in every frame. The same documentation describes sampling one frame a second, at either 66 or 258 tokens a frame depending on the resolution setting, with the audio track alongside. That comes to roughly 100 tokens for each second of video at low resolution and 300 at high.

| Length | Low resolution | High resolution |
| --- | --- | --- |
| 1 minute | about 6,000 tokens | about 18,000 tokens |
| 10 minutes | about 60,000 | about 180,000 |
| 1 hour | about 360,000 | about 1,080,000 |

So a model with a million-token context holds about three hours of video at low resolution or one hour at high, which is what the documentation states. It also means an hour of footage is one of the most expensive single inputs you can send.

One frame a second is enough for a lecture, a meeting or a screen recording. It is not enough for anything fast: a dropped catch, a flicker in an interface, a sleight of hand. Low resolution is enough for who is in the room and not for the text on their slides. Some APIs let you raise the frame rate or trim the clip, and one now offers a mode in which the model navigates the video, looking closely only where it needs to, with a claimed saving of most of the tokens on long footage.

The generative media module explains why generated video is short and drifts. Understanding video has the opposite problem. The clips can be long, and the model's attention to any one second is thin.

### Choosing a route

| You have | Sensible route |
| --- | --- |
| Meetings to summarise, words are what matter | Speech-to-text, then a language model. Keep the transcript |
| Calls where tone, speakers or background matter | A model with native audio input |
| A long recording and one question | Find the relevant minutes first, by transcript, then send that portion |
| Screen recordings of a bug | Native video at high resolution and a short clip, or a handful of chosen frames as images |
| A spoken assistant | A speech-in, speech-out model, with the guardrails of part 9 decided before launch |

## 5. What they miss

**In plain terms.** These models fail in ways that are different from a person's and different from a scanner's. They miscount, lose track of left and right, and misread small or unusual details, and they do it fluently, with no sign of doubt. They also fill gaps with what is usually true. And because they read any text in an image, a picture can carry instructions. **Who should read it:** everyone. This section is the reason to keep a check in the loop.

### The documented limits

Vendors publish these. The list below follows Anthropic's and is typical.

- **Counting.** Approximate, and worse with many small objects.
- **Spatial reasoning.** Positions, coordinates and layouts are approximate. Anything that depends on exact location needs verifying.
- **Small, rotated or poor images.** Errors rise sharply with low quality, rotation and very small images.
- **People.** The models will describe a person and will not name one from their face, by policy.
- **Synthetic images.** A model cannot reliably tell whether an image was generated. Do not use one as a detector. The generative media module covers provenance.
- **Specialist images.** A general model is not a diagnostic tool for medical scans, and the vendors say so.

### Seeing what is expected

The failure that matters most is quieter. A language model predicts what is likely, and that habit does not switch off when the input is an image. Shown a familiar logo with one letter changed, a clock with its hands in an unusual place, or an animal with an extra leg, models often report the familiar version. Shown a form, a model may fill a blurred field with the value such fields usually hold.

This is hallucination, from part 3 of the language models module, with a picture as the prompt. It is dangerous for the same reason: the output is confident and well formed. In document work it means the rare, unusual value, the one that matters most to an auditor, is the one most likely to be normalised away.

### Images carry instructions

Part 3 of the language models module describes prompt injection: text the model reads as data is obeyed as an instruction. A model that reads images reads the text in them. Instructions can sit in a screenshot, in a scanned letter, in small pale type on a web page that a person would never notice, or in a frame of a video.

For a model that only answers questions, the damage is a wrong answer. For an agent with tools, and above all for computer use, it is the full risk described in [part 9](file/7a3f2c68-91de), with a larger attack surface, since filters built for text do not inspect pixels. Treat every image from outside as untrusted content.

### Working with the grain

- Ask for what the model is good at: meaning, structure, text, comparison. Verify what it is weak at: counts, positions, exact values.
- Where a number matters, have the model quote the text it read, and check that against the source or a second method.
- Build an eval set of your own documents, including ugly ones, as part 9 describes. Public scores say little about your invoices.
- When the answer is wrong, look at what was sent. Most failures are a detail that did not survive resizing.
- Keep a person on the cases where a misreading is expensive.

### A note on choosing

Support for modes is the fastest-changing fact in this module. As of September 2026, in broad terms: all the major hosted model families read images and PDFs; Google's Gemini models also take audio and video directly; OpenAI's take images and audio; and the strongest open-weight options are the Qwen3-VL family for images and video, Qwen3-Omni for audio as well, and Google's Gemma 4, whose smaller models take audio and run on a laptop under an Apache 2.0 licence. [Part 2 of the running AI locally module](file/d92b6a05-8e13) explains how to read those names. Check each model's card for its two lists before you design around it.

### The whiteboard version

Everything becomes tokens. A picture is a grid of patches, a sound is a string of slices, a video is a slideshow with a soundtrack. The model reads them well and cheaply enough to be useful everywhere. It does not measure, it does not count, and it believes whatever is written on the wall.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Multi-modal | A model whose input, and sometimes output, spans more than one modality, all represented as tokens in one sequence | An AI that can be shown things and played things, not only written to |
| Vision-language model | A language model with image patches encoded into its token space, producing text | An AI that reads pictures and answers in words. It cannot draw |
| Patch | A small square of the image, 28 pixels across in one documented case, encoded as one token | The image is cut into tiles, and each tile counts as about one word |
| Image cost | Tokens in proportion to area, capped by downscaling to a maximum resolution | A picture costs about as much as a page or two of text, and an oversized one is shrunk first |
| Native audio | Audio encoded directly to tokens, keeping prosody, speakers and non-speech sound | It hears the recording itself, so it knows who spoke and how, not only what was said |
| Video understanding | Frames sampled at about one a second, tokenised with the audio track | It sees a slideshow with sound. What happens between slides is invisible to it |
| Visual prompt injection | Instructions embedded in image text are read into the context like any other tokens | A sign in a photo can give the AI orders, so pictures from outside are treated with suspicion |

## Misconceptions to correct

### "It sees the image the way I do"

**True:** the descriptions are fluent and usually right, and the model often notices things a hurried person would not.

**Misleading:** it reads a grid of tiles at a limited resolution and reports what is likely. It miscounts, confuses positions, and can replace an unusual detail with the usual one, all without any sign of doubt.

**What to say:** "It is an excellent reader and a poor measurer. We use it to understand documents and images, and we check anything that depends on an exact count, position or figure."

### "It watched the whole video"

**True:** models accept hours of footage and can answer questions about it, including what was said and roughly when.

**Misleading:** it sampled about one frame a second, often at low resolution. Fast events and small on-screen text may never have reached it, and it will still answer.

**What to say:** "It has seen a frame a second and heard the soundtrack. For anything quick or small, we send the short clip at high resolution, or the frames themselves."

### "Multi-modal means it can make images and video too"

**True:** some products do both from one chat window, and a few models are starting to.

**Misleading:** reading media and generating media are separate abilities. Most models that understand images produce only text, and a chat product that draws is usually handing the job to a different model.

**What to say:** "We check what each model takes in and what it gives out. Understanding a picture and making one are different tools, and we choose each on its merits."

## Glossary

Terms introduced in this part, in plain language and in alphabetical order. Earlier terms are defined in parts 3 and 4 and in the glossaries of the language models module.

| Term | Meaning |
| --- | --- |
| Computer use | A model operating a graphical interface through screenshots, clicks and typing |
| Downscaling | Shrinking an image to fit a model's size limit before the model sees it |
| Encoder-free | A design in which one network learns from raw patches and audio slices, with no separate vision or audio encoder |
| Frame sampling | Taking still frames from a video at a fixed rate, commonly one a second, to give to a model |
| Modality | A kind of data: text, image, audio or video |
| Multi-modal model | A model that accepts, and sometimes produces, more than one kind of data |
| Native audio | Audio given to the model directly, not through a transcript |
| OCR | Optical character recognition: conventional software that turns pictures of text into text |
| Omni model | A model that takes text, images, audio and video, and may answer in speech |
| Patch | One small square of an image, which the model treats as a token |
| Projector | A small network that translates a vision encoder's output into the language model's token space |
| Speech-to-text | A model that turns recorded speech into a transcript |
| Vision encoder | A network that turns image patches into vectors |
| Vision-language model | A language model that also reads images and answers in text |
| Visual prompt injection | Instructions hidden in an image that a model reads and may follow |

## Sources

Figures and limits in this part come from these documents, read in September 2026. They are one vendor's numbers each, given to show the pattern, and they change with each model. The account of models reporting what they expect to see, and the summary of which families take which modes, rest on the drafter's general knowledge and should be checked against current model cards.

- [Anthropic: vision](https://platform.claude.com/docs/en/build-with-claude/vision), for the 28-pixel patch, the cost formula, the resolution ceilings, the advice on image order and labelling, the note on metadata, and the list of limitations
- [Anthropic: PDF support](https://platform.claude.com/docs/en/build-with-claude/pdf-support), for pages processed as text and image together, and the tokens per page
- [Google: video understanding](https://ai.google.dev/gemini-api/docs/video-understanding), for one frame a second, tokens per frame, tokens per second, the hours of video that fit a context, and the agentic mode
- [Google: audio understanding](https://ai.google.dev/gemini-api/docs/audio), for 32 tokens a second, the capabilities listed, and the downsampling to one channel
- [Qwen3-VL Technical Report](https://arxiv.org/abs/2511.21631), November 2025, for the family's sizes, context length and design
- [Qwen3-Omni Technical Report](https://arxiv.org/abs/2509.17765), September 2025, for a single open model taking text, images, audio and video and answering in text or speech
- [Welcome Gemma 4](https://huggingface.co/blog/gemma4), April 2026, for the sizes, which of them take audio, the licence and the encoder-free 12B model

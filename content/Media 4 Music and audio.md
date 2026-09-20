# Part 4: Music and Audio

2026-09-19 · Chris Neale

## About this part

This is the fourth of seven parts in the generative media module. The aims of the guide, the layout every part follows and suggested reading routes are in [Introduction](file/0a139f54-ef01). The format is the same as before: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 30 minutes.

[Part 1](file/7c41d2a9-1e05) described two ways of building a generative media model: removing noise from the whole thing at once, and writing it one token at a time. In images and video the first dominates. Music is where you can hear the difference, because both designs are in everyday use.

### What part 4 gives you

Part 4 builds one idea: sound is the medium where the two designs meet on equal terms, and which one a product uses explains how it behaves. It also covers the two things that make audio different from pictures in practice. The output is a finished mix that is hard to take apart, and the rights position is unlike any other medium, because recorded music is owned by a few large companies that have sued, and then licensed.

## 1. Sound as numbers

**In plain terms.** A recording is a very long list of numbers: the air pressure at the microphone, measured tens of thousands of times a second. Models do not work on that directly. They squash it into a few dozen coded frames a second, and that squashed form is what gets generated. **Who should read it:** non-technical readers need only the first two paragraphs.

Digital audio is a waveform sampled 44,100 times a second, twice over for stereo. Part 1 put a three-minute song at about 16 million numbers. Unlike an image, those numbers mean almost nothing individually. What we hear as pitch, rhythm and timbre lives in patterns across thousands of samples, from the fifty or so that make one cycle of a bass note to the millions that make a verse.

So every audio model begins with a neural codec: an autoencoder, as in part 1, that turns each second of sound into somewhere between 20 and 75 frames, each a short list of numbers, and can turn them back into sound. The compression is around a hundredfold. What is lost first is what part 1 predicted: the finest detail, which in audio means the crisp top end of cymbals, breath and consonants.

The codec is also where the two designs part company.

- **Keep the frames as continuous numbers,** and you have a latent that a diffusion model can add noise to and remove it from, exactly as in part 1.
- **Snap each frame to the nearest entries in a fixed list of a few thousand,** and the song becomes a sequence of tokens that a language model can write.

### What this explains

- **Fidelity has a ceiling set by the codec.** A model cannot produce sound its decoder cannot express. A thin, watery or slightly metallic quality, most audible on vocals and cymbals, is the sound of a codec, and it is the audio counterpart of the washed-out decoder in part 1.
- **Length is cheap compared with video.** Three minutes of music is a few thousand to ten thousand frames, less than five seconds of video. Whole songs are practical.
- **The output is one mixed recording.** Drums, bass, vocals and everything else were generated as a single signal. Separate tracks, which any producer would want, have to be pulled apart afterwards by a different model, imperfectly. Section 4 returns to this.

## 2. Two designs, head to head

**In plain terms.** One kind of music model writes a song the way a chatbot writes a paragraph, a fraction of a second at a time from start to finish. The other kind starts with static for the whole song and cleans it all up together. The first is better at songs that hang together over minutes, with lyrics that fit. The second is faster, easier to edit in the middle, and better at texture. **Who should read it:** everyone. The table is the part to keep.

### The token design

The song is a sequence of codec tokens, and a transformer predicts the next one, as [part 1 of the language models module](file/590c1ae1-8bf3) describes. Lyrics and a style description go in the same context as text. The first widely used open music model, from 2023, worked this way and produced about 30 seconds of instrumental music. An open model from early 2025 scaled the idea up to complete songs of several minutes with sung vocals, using one language model for the song's structure and a second to fill in acoustic detail.

Audio suits this design in a way images do not. It has a natural order, which is time. And music is built from structure over long spans: a chorus that returns, a build that pays off a minute later. Holding a plan over a long sequence is what language models are good at.

The best-known commercial song services do not publish how they work. They are widely reported to be built this way, on the evidence of their makers' earlier open releases and public statements. Treat that as informed inference and not as fact.

### The diffusion design

The whole song is a grid of continuous latent frames, which starts as noise and is denoised together over a few dozen steps, steered by the text. Open models of this kind include one from 2024 for sound effects and short musical pieces of up to 47 seconds, and one from 2025 that generates complete songs with vocals.

That second model's published figures show what the design buys: up to four minutes of music in about 20 seconds on a data-centre GPU, which its makers put at fifteen times faster than language-model baselines, and it runs on a consumer card with 8 GB of memory. Its makers are also candid about the trade. In their words, the language-model approach excels at aligning lyrics but is slow and prone to structural artefacts, and diffusion is fast but often lacks coherence over long spans.

### The trade

| | Tokens | Diffusion |
| --- | --- | --- |
| Generates | From the first second to the last, in order | The whole piece at once, rough to fine |
| Speed | Slow. Minutes of computing for minutes of music | Fast. Seconds for minutes of music |
| Song structure over minutes | Strong | Weaker, improving |
| Lyrics landing on the melody | Strong | Weaker, improving |
| Texture and sound design | Good | Strong |
| Redoing a section in the middle | Awkward. Everything after it depends on it | Natural. Mask it and regenerate, as with inpainting |
| Streaming as it generates | Natural | Only in chunks |
| Runs on a consumer graphics card | Just, for the open ones | Comfortably |

### Hybrids

As part 1 predicted, the two are being combined along the line the table suggests. A language model sketches the song, its sections, melody and where the words fall, as a coarse token sequence, and a diffusion model renders that sketch into full-quality sound. Research systems from 2025 onwards interleave the two, and it is reasonable to suppose commercial services do something similar. When a service is strong on structure and lyrics and also offers clean editing of a section, this is a likely reason.

## 3. Songs, sounds and speech

**In plain terms.** "AI audio" covers three quite different products: whole songs with singing, sound effects and background music without words, and spoken voice. They are built differently, sold differently and carry different risks. **Who should read it:** everyone.

| Kind | What you give it | What you get | Typical use |
| --- | --- | --- | --- |
| Song generation | A style description and, optionally, lyrics | A complete mixed song of two to four minutes, with vocals | Demos, jingles, content for social media, personal use |
| Instrumental and sound effects | A description: "rain on a tin roof", "tense ambient pad, 90 seconds" | A short clip, usually under a minute, which may loop | Film and game sound, podcasts, background music |
| Speech and voice | Text, and a voice to speak it in | Natural speech, in a stock voice or a copy of a real one | Narration, dubbing, accessibility, voice interfaces |

A fourth is arriving from another direction. Part 3 described video models that generate sound with the picture, which for many everyday uses removes the need for a separate sound-effects step.

Speech is the most mature of the three and the least like the rest of this module. Modern speech models are largely token-based and conversational, and they sit closer to the language models module than to this one. Their place here is the risk they carry, which section 6 covers: a usable copy of a person's voice can be made from under a minute of recording.

## 4. Working with a song generator

**In plain terms.** You give a song generator two things: a description of the style, and the words. You mark the words up into verses and choruses. Then you work as you would with pictures: make several, pick one, and fix parts of it, by extending it, replacing a section or regenerating the vocal. Pulling the result apart into separate instruments is possible but rough. **Who should read it:** anyone who will use one. Part 7 covers how to write the prompt.

### Two prompts, not one

Almost every song generator takes a style prompt and a lyrics field separately, and they do different jobs. The style prompt is a brief: genre, era, tempo, mood, instrumentation, the kind of voice. The lyrics are performed. Structure is given by tags in the lyrics, by convention in square brackets: intro, verse, chorus, bridge, outro. Models trained on tagged lyrics follow them well, and the tags are the main control over a song's shape.

Left without lyrics, most services write their own with a language model, with the homogenising effect part 7 describes for prompts written by language models.

### The editing tools

Each has a counterpart in part 6, because the mechanisms are the same.

| Tool | What it does | Counterpart in images |
| --- | --- | --- |
| Variations | The same prompt with a new seed | Varying the seed |
| Extend | Continues from the end of a clip | Outpainting |
| Replace a section | Regenerates a marked stretch to fit what surrounds it | Inpainting |
| Change the lyrics | Regenerates the vocal over a span, keeping the backing | Instruction editing |
| Cover, or restyle | Keeps the melody and structure of an input recording and changes the style | Image-to-image |
| Voice or persona | Holds a singer's character across songs | A character reference or subject LoRA |
| Fine-tune add-on | A LoRA trained on a genre or an artist's catalogue | A style LoRA |

One open diffusion model documents all of the first five, plus LoRA training, which shows that they are properties of the design and not of any one product.

### Stems

Producers work with stems: separate recordings of drums, bass, vocals and the rest, which can be balanced, processed and replaced individually. A generated song is a single mixed signal. Services that offer stems obtain them by running a separation model over the finished mix. The results are good enough for rebalancing a vocal or making a karaoke version, and usually not clean enough for professional remixing, with traces of each part audible in the others.

This is the audio form of part 1's observation that the output is flat, and it is the main thing that keeps generated music out of professional production workflows. Models that generate stems directly, or that add a part to an existing recording, exist in research and in some products, and are the development to watch.

## 5. What goes wrong

**In plain terms.** The model has learned what songs sound like, not how music works. It cannot reliably be given a key, a tempo or a chord sequence. Over several minutes it can lose the thread. Sung words are sometimes slurred or wrong. And left to itself it produces the most average music imaginable. **Who should read it:** everyone.

- **No music theory.** A model has no notion of key, chord or bar, only of how recordings sound. Ask for 120 beats a minute in D minor and you will often get roughly that, by association with the words and not by construction. Anything that must synchronise with other music or with picture has to be checked and usually adjusted afterwards.
- **Long-range structure.** A chorus that returns subtly different, a bridge that never arrives, an ending that simply stops. Diffusion models are weaker here and token models stronger, as section 2 said.
- **Vocals.** Mispronounced and slurred words, syllables crammed into too few notes, invented words where the lyric was unusual. Names and brand names are the worst case. The vocal is also where codec artefacts are most audible.
- **The average.** Part 1's rule about defaults is very audible in music. An unspecific prompt gives glossy, mid-tempo, heavily produced pop with a clean vocal, and lyrics written by a language model rhyme "fire" with "desire". Distinctive results need distinctive briefs.
- **Counting and arrangement.** "A string quartet" may contain a piano. Instruments drift in and out in ways no arranger would choose.
- **Resemblance.** Melodies are short, and the space of pleasant ones is smaller than the space of images. A generated tune that is close to a famous one is more likely than a generated picture that is close to a famous photograph, and music rights holders are far more active. Section 6 returns to this.

As with video, review by listening for one thing at a time: the words, the structure, the ending, and whether it reminds you of something.

## 6. Rights are different here

**In plain terms.** Most recorded music is owned by three companies, and they sued the main AI song services for training on it. During 2025 and 2026 some of those cases turned into licensing deals and others are still in court. The practical upshot is that what you may do with a generated song depends heavily on which service made it and which plan you were on. Separately, copying a real person's voice without consent is the most dangerous thing in this module. **Who should read it:** everyone. None of this is legal advice, and all of it is as of September 2026.

### The labels and the services

Images were scraped from millions of owners who could not easily act together. Recorded music belongs largely to three major groups with long experience of litigation, and the difference shows.

In June 2024 the major labels sued the two best-known song generators in the United States for training on their recordings. The services argued fair use. In late 2025 the position changed. One major settled with one service at the end of October, and another major settled with the other service in November. Both settlements were coupled with licensing agreements under which the services are to launch new models trained on licensed music, with artists able to opt in, and both brought restrictions on downloading what is generated. Other claims, including those of the largest labels against one of the services, were still being litigated in 2026, and no United States court had ruled on the fair use question.

Alongside this, a number of services train only on music they have licensed or commissioned, and sell that as the point.

### What it means for you

- **Read the plan, not the homepage.** Whether you may use a generated song commercially usually depends on the subscription tier at the moment of generation. Free tiers commonly forbid it. Terms have changed repeatedly as the settlements took effect, so check them when you generate, and keep a record.
- **Ownership is as weak as for images.** Part 6 explains that in the United States, output from a prompt alone has no copyright protection. Lyrics you wrote yourself are yours. A melody the model produced probably is not.
- **Check for resemblance.** For anything public, have someone with a good ear listen for a familiar tune, and run the track through a recognition service. Distribution platforms run their own checks and will reject or demonetise matches.
- **Distribution platforms have their own rules.** Streaming services and music distributors increasingly require AI-generated music to be labelled, and some restrict or exclude it.
- **The safest route, where it matters,** is a service trained on licensed music that offers an indemnity, or stock and commissioned music as before.

### Voices

A speech model can produce a convincing copy of a voice from under a minute of recording. Song models can imitate a singer's style, and some will imitate a specific voice.

This is where generative media does the most direct harm. Cloned voices are used for fraud, in calls impersonating family members and executives. They are used to put words in the mouths of public figures. For performers, a voice is their livelihood. A voice is also biometric personal data, and a recognisable voice is protected by rights of publicity in many places even where copyright does not reach.

The rule from part 6 applies without softening. No cloning of a real person's voice without their written consent for the specific use, including colleagues, including "just for the internal demo". If your organisation uses voice for verification anywhere, such as telephone banking or approving payments, treat that control as broken and replace it.

## 7. The model families

**In plain terms.** For whole songs, the hosted services are well ahead of anything you can download. For sound effects and instrumental beds, open models are useful and easy to run. **Who should read it:** anyone choosing a tool.

As of September 2026:

| Family | Kind | Open weights | Notes |
| --- | --- | --- | --- |
| Suno, Udio | Songs with vocals | No | The best-known song services. Moving to licensed training under the settlements described above |
| Other hosted music services | Songs and instrumentals | No | Several, from audio and cloud companies. Some are trained only on licensed music and offer commercial terms on that basis |
| MusicGen | Instrumental, about 30 seconds | Yes, non-commercial | Meta, 2023. The token design. 3.3 billion parameters at its largest |
| Stable Audio Open | Sound effects and short music, up to 47 seconds | Yes, free below a revenue threshold | Stability AI, 2024. Latent diffusion. About a billion parameters |
| YuE | Songs with vocals, several minutes | Yes, Apache 2.0 | Early 2025. The token design, with two language models. Slow: minutes of computing for a song |
| ACE-Step | Songs with vocals, up to four minutes | Yes, Apache 2.0 | 2025, updated January 2026. Diffusion. Fast, runs in 8 GB, with editing, extension and LoRA training |

The pattern is the one part 3 found for video. Open models trail the best hosted ones by a clear margin on overall quality, particularly vocals, and offer what hosted ones cannot: they run privately, can be fine-tuned, and do not change under you.

### The whiteboard version

Sound is a waveform, squashed by a codec into a few dozen frames a second. Keep those frames as continuous numbers and you can generate a whole song by removing noise, quickly, with easy editing of any section. Snap them to tokens and a language model can write the song from start to finish, slowly, with better structure and lyrics. Products are one, the other or both. Whatever made it, a generated song is a single mixed recording with no separate parts, it has no real notion of key or tempo, and it tends towards the average. The rights position is unlike any other medium: the labels sued, some have licensed, and what you may do depends on the service and the plan. Never copy a real voice without consent.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Neural codec | An autoencoder mapping a waveform to a short sequence of latent frames, continuous or quantised to a codebook | A very good squasher. It turns a second of sound into a few dozen coded frames, and back |
| The token design | Autoregressive generation of quantised codec tokens by a transformer, conditioned on text and lyrics | It writes the song a split second at a time, start to finish, like a chatbot writing a sentence |
| The diffusion design | Iterative denoising of the full sequence of continuous latent frames | It starts with static for the whole song and cleans all of it up together |
| Stems | Separate signals per instrument group. Generated audio has none, so they are estimated by source separation | The separate tracks a producer works with. A generated song does not have them, and pulling them out afterwards is rough |
| Voice cloning | Conditioning a speech model on a speaker embedding taken from a short sample | A minute of someone talking is enough to make them say anything. Which is why we never do it without their written consent |

## Misconceptions to correct

Three claims come up constantly. Agree with the true part first, then add what it leaves out.

### "AI music is royalty-free, so we can use it anywhere"

**True:** no performer or composer is owed a royalty on a generated track, and many services grant commercial rights on paid plans.

**Misleading:** what you may do is set by the service's terms for your plan on the day you generated it, and those terms have been changing as lawsuits settle. Free tiers usually forbid commercial use. A track that resembles an existing song can infringe whoever made it. And with no copyright in a prompt-only track, you cannot stop anyone else using it.

**What to say:** "Royalty-free is not the same as risk-free. For anything public we use a paid plan on a licensed service, keep the terms and the prompt on file, and check the track against a recognition service."

### "Describe the song you want and you will get it"

**True:** a good style brief and tagged lyrics give a convincing song in the right genre, quickly.

**Misleading:** the model cannot be told a key, an exact tempo, a chord sequence or a melody, and it cannot be given notes the way a musician can. It delivers the feel, not a specification. Music that must fit other music, or hit marks in a video, needs a person and an editor afterwards.

**What to say:** "It is a very fast session band with no sheet music. Great for a feel and a demo. If we need it in a particular key, at a particular length, hitting particular moments, someone has to edit it."

### "It is our presenter, so we can clone their voice"

**True:** the organisation may own the recordings, and a cloned voice would save studio time.

**Misleading:** owning a recording is not owning the voice. A voice is personal data and part of a person's identity, and employment does not give consent to have new words put in someone's mouth. What is generated can outlive their employment and be used in ways they never agreed to.

**What to say:** "Only with their written agreement, for named uses, with a way to withdraw it. And we say in the piece that the voice is synthetic."

## Glossary

Every technical term used in this part, in plain language and in alphabetical order. Terms from part 1 are not repeated.

| Term | Meaning |
| --- | --- |
| Codebook | The fixed list of values a codec snaps its frames to, which turns sound into tokens |
| Cover | Generating a new version of an existing recording that keeps its melody and structure and changes its style |
| Extend | Continuing a generated piece from where it ends |
| Lyrics tags | Markers in the lyrics, such as verse and chorus, that tell a song model the structure |
| Neural codec | A model that compresses sound into a short sequence of frames and can rebuild it |
| Sample rate | How many times a second the waveform is measured. 44,100 for music |
| Source separation | Using a model to split a mixed recording into approximate stems |
| Stem | A separate recording of one part of a song, such as drums or vocals |
| Style prompt | The description of genre, mood, tempo, instruments and voice given to a song model |
| Voice cloning | Making a synthetic copy of a specific person's voice from a sample |
| Waveform | Sound as a list of pressure measurements over time |

## Sources

Figures and dates in this part come from these documents, read in September 2026. The account of the law is not legal advice.

- [Simple and Controllable Music Generation](https://arxiv.org/abs/2306.05284), 2023, for MusicGen and the token design
- [High Fidelity Neural Audio Compression](https://arxiv.org/abs/2210.13438), 2022, for neural codecs and codebooks
- [Stable Audio Open](https://arxiv.org/abs/2407.14358), 2024, for open latent diffusion audio and the 47-second limit
- [YuE: Scaling Open Foundation Models for Long-Form Music Generation](https://arxiv.org/abs/2503.08638), 2025, for full songs by the token design
- [ACE-Step](https://github.com/ace-step/ACE-Step) and its [paper](https://arxiv.org/abs/2506.00045), 2025, for the speed and memory figures, the editing abilities, the January 2026 update, and its makers' comparison of the two designs
- [SongBloom](https://arxiv.org/abs/2506.07634), 2025, for interleaving token sketching with diffusion refinement
- [AI music generators: how they work and why it matters](https://charleseldering.substack.com/p/ai-music-generators-how-they-work), July 2026, for the inference that the main commercial services use the token design, and its statement that neither publishes its architecture
- [Deploying open-source music generation](https://www.spheron.network/blog/deploy-open-source-ai-music-generation-gpu-cloud-2026/), April 2026, for the sizes, limits and licences of the open models
- [AI music lawsuits timeline](https://dynamoi.com/learn/ai-music-distribution/ai-music-copyright-cases-timeline), updated May 2026, for the June 2024 suits, the October and November 2025 settlements and the cases still active

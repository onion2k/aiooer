# Part 3: Video

2026-09-19 · @Someone

## About this part

This is the third of seven parts in the generative media module. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). The format is the same as before: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 30 minutes.

[Part 1](file/7c41d2a9-1e05) described a machine that turns noise into a picture. A video model is that machine with one more dimension. Almost everything in part 1 carries over unchanged, so this part is about what the extra dimension costs and what it breaks.

### What part 3 gives you

Part 3 builds one idea: a video model makes shots, not films. It produces a few seconds of footage in which everything was generated together, and it is remarkably good at that. Everything longer, a scene, a sequence, a story, is assembled by a person from shots, and the skill is in keeping those shots consistent with each other.

## 1. A picture with time added

**In plain terms.** A video model does not make one frame and then the next. It starts with static for the whole clip, every frame at once, and cleans all of it up together. That is why the frames agree with each other, and also why a clip is only a few seconds long: the whole of it has to fit in the machine at the same time. **Who should read it:** everyone. This section is short and frames the rest.

The pipeline is the one from part 1, with a different shape of grid. An autoencoder compresses the clip in space and in time. The denoiser, a diffusion transformer, starts from noise in that compressed space and removes it over a few dozen steps, steered by a prompt. A decoder expands the result into frames.

The important detail is that the denoiser's attention runs across the whole clip. A patch in frame 40 can look at every patch in frame 1. That is what keeps a face the same face from start to finish, and makes motion continuous. Early attempts at video generated frames separately with an image model and tried to smooth them together afterwards, and they flickered and boiled, because nothing forced neighbouring frames to agree. Generating them jointly is what fixed that.

Two consequences follow, and the rest of this part unpacks them.

- **Length is the expensive dimension.** Everything in the clip is in memory and in attention at once. Section 2 does the sums.
- **Coherence ends at the clip's edge.** Inside a clip, everything was decided together. Between two clips, nothing was. Part 1's rule that every output is a fresh draw applies to every shot.

## 2. Why seconds are expensive

**In plain terms.** Five seconds of video is over a hundred pictures. Even squeezed down hard, that is tens of thousands of pieces the model must consider together, and the work grows with the square of that number. So clips are short, resolution is modest, and a few seconds can take minutes to make. **Who should read it:** non-technical readers need only the first paragraph and "What this explains".

Part 1 put five seconds of 1,280 by 720 video at about 330 million numbers, a hundred times a single image. Compression is what makes it possible at all, and video compresses well, because neighbouring frames are nearly identical.

One openly documented model compresses by 16 in width, 16 in height and 4 in time, then groups the result into patches. For a five-second, 24 frames a second clip at 1,280 by 720, that leaves roughly 30 latent frames of 40 by 23 patches, or about 27,000 tokens. A single 1,024 pixel image in part 1 was 4,096. Attention cost grows with the square of the token count, so the video costs something like forty times as much per step as the image, and doubling the clip's length roughly quadruples it.

The published figures for that model make this concrete. Its smaller version, at 5 billion parameters, needs a graphics card with 24 GB of memory and takes up to nine minutes to make one five-second clip at that resolution. Its larger version needs 80 GB. Hosted services run on data-centre hardware and return a clip in a minute or two.

### What this explains

- **Clips are short.** Most models produce 5 to 10 seconds, and the longest hosted ones around 20. This is a memory limit and not a product decision.
- **Resolution is modest.** 720p is the common home resolution, with 1080p and above usually reached by a separate upscaling pass.
- **Long clips are stitched.** "Extend" features generate a new clip that starts from the last frames of the previous one. Each extension is a fresh draw that can only see those few frames, so identity and lighting drift over successive extensions.
- **Cost is per second.** Hosted services price by the second of output, and the price rises steeply with resolution. A few cents to a few tens of cents a second is typical, which makes a minute of finished footage, after discarded takes, a matter of tens of dollars and not cents.
- **Fast versions exist, with the usual trade.** Distilled models that need 4 to 8 steps, as in part 1, make drafts quickly. They are good for testing a prompt and weaker on fine motion.

### Deep dive (optional): experts by noise level

Part 1 said that the task changes character with the noise level: layout at high noise, detail at low noise. One open video model turns that observation into architecture. It holds two complete denoisers. The first handles the early, high-noise steps and is responsible for what is in the shot and how it moves. The second takes over for the late, low-noise steps and refines surfaces. The handover happens at a fixed point on the noise scale.

The model has 27 billion parameters in total and runs 14 billion at any step, so it has the capacity of the larger figure at the running cost of the smaller. This is the mixture-of-experts idea from [part 1 of the language models module](file/590c1ae1-8bf3), applied along the noise axis in place of token by token. It is a neat confirmation that "coarse first, fine last" is a real property of these models and not only a way of speaking.

## 3. Start from an image

**In plain terms.** The best way to make a video clip is usually to make a still picture first, get that exactly right, and then ask the video model to bring it to life. The picture fixes who and what is in the shot, how it is framed and lit. The words then only have to describe what moves. **Who should read it:** everyone who will make video. This is the working method.

Text-to-video works, and it is the wrong default. Part 1 explained why words are poor at fixing composition, and everything part 7 says about briefing a picture applies before you have described any motion at all. Image-to-video separates the two problems.

### Why it is better

- **Composition is settled first, cheaply.** A still takes seconds and costs a cent. You can generate fifty, choose one, and fix its flaws with the tools in part 6 before spending minutes and dollars on video.
- **Consistency comes from the stills.** The same character, product or location across a sequence is an image problem, solved with the references and LoRAs in part 6. Every shot then starts from an image in which those are already right.
- **The prompt gets simpler.** With the first frame given, the prompt describes only change: what moves, how the camera moves, what happens by the end.
- **It can start from reality.** A photograph of your actual product, location or presenter can be the first frame, subject to the consent rules in part 6.

### The variations

| Input | What the model does | Used for |
| --- | --- | --- |
| First frame | Continues from it | The standard method |
| First and last frame | Finds a plausible path between them | Controlled transitions. A product turning from front to side. Getting a shot to end where the next begins |
| Reference images | Keeps a character, object or style that appears in them, in a new scene | The same presenter or product across different shots |
| A video | Keeps its motion and structure and changes its look, as image-to-image does for stills | Restyling footage. Turning a rough animatic or a phone recording into a finished shot |
| A video and a character | Replaces the performer in the footage, keeping the performance | Animating a designed character from an actor's movement |
| Speech audio and a portrait | Animates the face and body to match the speech | Presenters, dubbing, lip-sync |

Several of these were separate add-ons a year ago and are built into current models. The direction is the one part 2 noted for images: generating, editing and working from references are merging into single models.

## 4. Motion, camera and sound

**In plain terms.** You direct a video model the way you would brief a camera operator: what the subject does, and what the camera does. Film vocabulary works, because that is what the training descriptions used. The newest models also produce the sound, speech included, together with the picture. **Who should read it:** everyone. Part 7 turns this into prompt-writing advice.

### Two kinds of movement

Every shot has subject motion, which is what happens in the scene, and camera motion, which is how the viewpoint moves. Models treat them separately, and prompts should too. A shot with neither specified comes back as the training data's default: a slow push-in on a subject doing very little.

Camera language is well understood by current models: static shot, pan, tilt, dolly in, tracking shot, orbit, crane up, handheld, rack focus. So are shot sizes and lens terms from part 7's vocabulary of pictures. Subject motion is harder. Simple, continuous actions work well: walking, turning, pouring, wind in hair, waves, traffic. Interactions between objects, sequences of distinct actions, and anything with a precise outcome are unreliable, for reasons section 5 gives.

One action per shot is the rule that saves the most time. A prompt that asks for a character to walk in, sit down, pick up a cup and smile is asking for four shots, and will get a muddle of them.

### Controlling motion directly

Where words are not enough, the control techniques from part 6 have video counterparts. A driving video supplies the motion, as a sequence of poses or depth maps, and the model paints a new subject onto it. Some tools let you draw a path for an object or the camera to follow. These are the tools for anything choreographed.

### Sound

Until 2025, generated video was silent, and sound was added afterwards. Several leading hosted models, and at least one open one, now generate picture and sound in a single process: ambient sound, effects timed to what happens on screen, music, and speech with matching lip movement. The audio is a second compressed stream, denoised jointly with the video so that the two agree, in the same way that frames agree with each other.

This changes what a shot can be, since a line of dialogue can now be generated with its delivery. It also sharpens the likeness problem in part 6: a convincing clip of a real person saying something they never said is now a single prompt.

## 5. What goes wrong

**In plain terms.** The model has learned what footage looks like, not how the world works. Things that are out of sight can be forgotten. Liquids, collisions and hands doing things go wrong. People's faces drift over a long shot. And text or fine pattern that would survive in a still often swims in motion. **Who should read it:** everyone. Read this before you review generated footage.

Part 1's principle applies in full: the model reproduces appearance. In a still, that fails in small places. In video it fails in time.

- **Physics.** Motion is plausible and not simulated. Poured liquid may not fill the glass, or may fill it twice. Objects pass through each other, bounce wrongly or lose momentum. Cause and effect can run slightly out of order. Walking figures occasionally swap legs.
- **Object permanence.** What leaves the frame, or passes behind something, is no longer anywhere. It may come back different, or not at all. A person who turns away and back may return with a changed face or clothes.
- **Identity drift.** Over a long clip, and across extensions, faces and proportions slide. It is gradual enough to miss on first viewing and obvious when the first and last frames are compared.
- **Hands, text and fine pattern.** Every weakness from part 2 is harder in motion, because it must now be right in every frame and consistent between them. Lettering that would hold in a still often shimmers or mutates.
- **Morphing.** Asked for a change it cannot animate, the model dissolves one thing into another.
- **Sameness of motion.** Left to itself a model favours slow, floaty, continuous movement. Fast, abrupt or comic timing is rare in its output and hard to ask for.
- **Counting and relationships.** As in stills, and they can change mid-shot: five people become six.

The review habit is to watch each clip several times looking at one thing each time: the hands, the background, the face at the start against the face at the end, anything that leaves and re-enters. Flaws that are invisible at full speed in a social feed are obvious on a large screen or on a second viewing.

Many of these are improving quickly with scale, and vendors describe their newest models as simulating physics. Treat that as a direction and not a guarantee. The model that gets a bouncing ball right has learned what bouncing balls look like more thoroughly. It has not learned mechanics, and it will be wrong in situations it saw rarely.

## 6. The model families

**In plain terms.** The best video models are hosted services, and they are ahead of the open ones by more than in images. Open video models exist and are good, and they run on a high-end graphics card if you are patient. **Who should read it:** anyone choosing a tool. The table will date quickly.

As of September 2026:

| Family | From | Open weights | Notes |
| --- | --- | --- | --- |
| Veo | Google | No | Among the first with native sound, in 2025. Clips of several seconds with extension, up to 4K |
| Sora | OpenAI | No | The 2024 research that showed diffusion transformers scale to video. The second version, late 2025, added synchronised sound |
| Kling | Kuaishou | No | Strong human motion and performance |
| Seedance | ByteDance | No | Multi-shot consistency and reference inputs |
| Hailuo | MiniMax | No | Image-to-video realism |
| Runway | Runway | No | The most developed editing and video-to-video tools |
| Wan | Alibaba | Yes, Apache 2.0 | The reference open family. 27 billion parameters with 14 billion active, and a 5 billion version for 24 GB cards. Separate versions for speech-driven video and for replacing a performer |
| HunyuanVideo | Tencent | Yes, own licence | Strong faces. A smaller, more efficient version in late 2025 |
| LTX | Lightricks | Yes | Built for speed on consumer hardware. Its second generation, opened in January 2026, generates sound and picture together, and has been updated through 2026 |
| CogVideoX, Mochi | Zhipu, Genmo | Yes | Earlier open families, still used for their add-ons |

Three points matter more than the rows.

- **The gap is wider than in images.** Open video models trail the best hosted ones by something like six months to a year. Training at this scale needs more data and compute than most publishers of open models have.
- **Open models take the same add-ons.** LoRAs for a character, a style or a kind of motion, control inputs and distilled fast versions all exist for the main open families, and part 6's methods apply. This is the reason to use them.
- **The field is turning towards worlds.** Several labs now describe their video models as world models: systems that predict how a scene evolves and can be steered as it plays, with uses in games, simulation and robotics. For making footage this changes little yet. It is where the research effort is going. [Part 2 of the other AI models module](file/96c3f08a-d417) covers them.

## 7. Working in shots

**In plain terms.** Plan a sequence as a film-maker would, as a list of shots. Make a still for each shot, get the stills consistent with each other, turn each into a clip, generate several takes, and edit the best together in ordinary editing software. Sound, titles and anything that must be exact go on at the end. **Who should read it:** everyone who will produce more than a single clip.

The workflow that produces usable results looks less like prompting and more like production.

1. **Write a shot list.** One action and one camera move per shot, each a few seconds long. This is the unit the model can deliver.
2. **Make the key stills.** One image for the start of each shot, and for the end where it matters, using part 6's tools to hold characters, products and style constant across them. Most of the creative decisions, and most of the consistency, are settled here.
3. **Animate each still.** Image-to-video, with a prompt that describes only the motion. Generate several takes of each, since takes are fresh draws and most will have a flaw.
4. **Review as section 5 describes,** and choose.
5. **Finish conventionally.** Cut in an editor. Upscale and interpolate frames if needed. Add titles and any exact text as real graphics. Add or replace sound. Colour-grade across shots, which hides a good deal of drift between them.

The ratio of generated to used footage is high. Ten takes for one keeper is ordinary, which is why per-second prices understate the real cost of a finished minute, and why fast draft models earn their place.

What this suits today: short social and advertising pieces, b-roll, establishing shots, product and concept visualisation, animated storyboards and pre-visualisation, and backgrounds. What it does not suit: long continuous takes, dialogue scenes that must cut together, precise action, and anything where a real event is being represented.

### The whiteboard version

A video model is part 1's machine with time added: the whole clip starts as noise and is cleaned up together, so its frames agree. That costs memory and compute in proportion to the square of the clip's length, so a clip is a few seconds. The model makes shots, and a person makes sequences. Start each shot from a still, because a still fixes composition and carries consistency, and let the prompt describe only the motion: one action, one camera move. Expect physics, things that leave the frame, and faces over time to go wrong, and review for them. Assemble, title and grade in ordinary editing tools.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| How a video model works | A diffusion transformer denoising a spatio-temporally compressed latent, with attention across all frames | It starts with static for the whole clip and cleans up every frame together, which is why the frames agree |
| Why clips are short | Attention cost is quadratic in tokens, and tokens grow linearly with duration | The whole clip has to fit in the machine at once. Twice as long is about four times the work |
| Image-to-video | Conditioning the denoiser on an encoded first frame, so the text need only specify motion | Make the picture first, then ask for it to move. The picture settles who, where and how it looks |
| Extension | A new generation conditioned on the final frames of the last | Another clip that starts where the last one stopped. It only remembers those last frames, so things drift |
| Native audio | A second latent stream for sound, denoised jointly with the video latents | It makes the sound with the picture, so footsteps land on the steps and lips match the words |

## Misconceptions to correct

Three claims come up constantly. Agree with the true part first, then add what it leaves out.

### "It can make a film from a prompt"

**True:** a single prompt produces a few seconds of footage that can look like a frame from a finished film, with sound.

**Misleading:** it produces a shot. Nothing carries from one shot to the next unless a person arranges it, and the characters, setting and light in the next clip are a fresh draw. A two-minute piece is dozens of shots, each planned, generated several times over, reviewed and edited.

**What to say:** "It makes shots, and very good ones. A film is still made the usual way: a shot list, consistent designs, an edit. It replaces the camera crew for some shots, not the director or the editor."

### "Video is just a lot of images, so it will cost a bit more"

**True:** a clip is a stack of frames, and the model is the same kind of machine as an image model.

**Misleading:** the frames are generated together, and the cost grows with the square of the clip's length. A few seconds costs what hundreds or thousands of stills would, takes minutes and not seconds, and most takes are discarded. A finished minute is a budget line.

**What to say:** "Budget it per finished second and assume we throw away nine takes in ten. It is far cheaper than a shoot and far dearer than stills."

### "The new models understand physics"

**True:** the newest models get everyday motion right far more often, and their makers describe them as simulating the world.

**Misleading:** they have learned what motion looks like, from footage. They are right where footage was plentiful and wrong where it was not, with no way of knowing the difference. Nothing that depends on a correct physical outcome should rest on them.

**What to say:** "It is a very good impression of physics, not physics. Fine for a wave breaking, not for showing how our mechanism works."

## Glossary

Every technical term used in this part, in plain language and in alphabetical order. Terms from part 1 are not repeated.

| Term | Meaning |
| --- | --- |
| Camera motion | How the viewpoint moves during a shot: pan, tilt, dolly, orbit and so on |
| Driving video | Footage whose motion is copied onto a different subject |
| Extension | Lengthening a clip by generating a new one from its final frames |
| First and last frame | Giving the model the opening and closing images of a shot and letting it find the motion between |
| Frame interpolation | Creating in-between frames to make motion smoother or slower |
| Identity drift | The gradual change of a face or object over a clip or across extensions |
| Image-to-video | Generating a clip that begins from a given still image |
| Native audio | Sound generated together with the picture, in one process |
| Object permanence | Keeping track of things while they are out of sight. Video models are poor at it |
| Shot | One continuous piece of footage from one camera setup. The unit a video model produces |
| Spatio-temporal latent | The compressed form of a clip, reduced in width, height and time |
| Subject motion | What happens within the scene, as distinct from how the camera moves |
| Take | One generated attempt at a shot |
| Video-to-video | Generating from existing footage, keeping its motion and changing its look |
| World model | A model that predicts how a scene evolves and can be steered as it runs. A direction video research is taking |

## Sources

Figures and dates in this part come from these documents, read in September 2026.

- [Wan 2.2](https://github.com/Wan-Video/Wan2.2), for the compression ratios, the two experts divided by noise level, 27 billion parameters with 14 billion active, the memory and time figures, and the speech-driven and character-replacement versions
- [Wan: Open and Advanced Large-Scale Video Generative Models](https://arxiv.org/abs/2503.20314), 2025, for the architecture
- [Video generation models as world simulators](https://openai.com/index/video-generation-models-as-world-simulators/), OpenAI, 2024, for diffusion transformers on space-time patches
- [Video Diffusion Models](https://arxiv.org/abs/2204.03458), 2022, for joint denoising of frames
- [LTX](https://en.wikipedia.org/wiki/LTX-2), for the open release in January 2026 and joint sound and picture generation
- [AI video generation models: 2026 guide](https://wavespeed.ai/blog/posts/ai-video-generation-models-2026/), May 2026, for the survey of hosted and open families

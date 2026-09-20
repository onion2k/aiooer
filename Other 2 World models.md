# Part 2: World Models

2026-09-19 · Chris Neale

## About this part

This is the second of four parts in the other AI models module. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). The format is the same as elsewhere: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 25 minutes.

The generative media module met world models twice in passing. [Its part 3](file/9a63f5d1-7c40) said that video research is turning towards them, and [its part 5](file/1f7a3b94-e652) said that generated 3D scenes are arriving from the same direction. This part is about what they are. It leans on [part 1 of that module](file/7c41d2a9-1e05) for how a model generates video at all, and can be read without it.

### What part 2 gives you

Part 2 builds one idea: a video model predicts what a scene looks like next, and a world model predicts what it looks like next given what you do. That one addition, an action, turns a film into a place. It is why these models matter for robots, vehicles and games, where the point is to try things, and why their failures matter more: a simulator that is plausibly wrong teaches the wrong lesson.

## 1. What a world model is

**In plain terms.** A world model is an AI that has learned how some part of the world behaves, well enough to predict what happens next, and in particular what happens next if you do something. Push the cup and it slides. Turn left and the street comes into view. It is a learned simulator. A video generator makes a clip for you to watch. A world model makes a situation you can act in. **Who should read it:** everyone.

### Prediction, conditioned on action

Every model in this course predicts. A language model predicts the next token. A video model predicts frames that fit a prompt. A world model predicts the next state of an environment from the current state and an action.

```
video model:   prompt                  ->  a whole clip
world model:   state now + an action   ->  state next      (and again, and again)
```

The loop on the second line is the point. The output of one step is the input to the next, and something outside the model, a person with a controller or a robot's control program, chooses the action each time. The model has to respond to choices it could not foresee, and stay consistent with everything it has already shown.

"State" can mean different things, and section 2 sorts current systems by it: a frame of video, a 3D scene, or an abstract summary that is never drawn at all.

### An old idea with new machinery

The idea comes from reinforcement learning, where an agent learns by trial and error. Trials in the real world are slow, costly and sometimes dangerous. If the agent first learns a model of its environment, it can practise inside the model. A 2018 paper titled simply "World Models" trained an agent on a simple driving game entirely inside its own learned dream of the game, then put it into the real game, where the policy worked. The Dreamer line of agents has since used the same approach to master well over a hundred tasks with one algorithm, learning by imagining outcomes.

Those models were small and each knew one game. What has changed since 2024 is the machinery of the generative media module: video models trained on enormous amounts of footage have absorbed a great deal about how the visible world behaves, and they can be made to take actions as input. The ambition now is a general world model: one that can simulate many environments it was never specifically taught.

### A word used two ways

You will also hear "world model" used about language models, as a question: does an LLM have an internal model of the world, or only of text? That is a debate about what is represented inside a network. This part uses the term in its engineering sense: a model built to predict how an environment changes. The two are related, and keeping them apart saves arguments.

## 2. Four kinds being built

**In plain terms.** Groups are building world models in four different ways. One generates a playable video, frame by frame, as you steer. One generates a real 3D scene that you can walk around and export. One is a toolkit for robot and vehicle makers, producing realistic training footage and predicting actions. And one never draws a picture at all: it predicts in its own internal shorthand, which is cheaper and may be closer to how animals do it. **Who should read it:** everyone can read the table. The rest is for the curious.

| | Interactive video | Persistent 3D | Physical AI platform | Latent prediction |
| --- | --- | --- | --- | --- |
| Example | Google DeepMind's Genie 3 | World Labs' Marble | NVIDIA's Cosmos 3 | Meta's V-JEPA 2 |
| The state is | The frames so far | A 3D scene | Video, with text, sound and actions | An abstract representation, never rendered |
| You get | A world you steer in real time | A scene you can explore, edit and export | Synthetic footage, predictions and action plans for machines | Predictions a planner can use |
| Strength | Anything can happen. Events can be prompted | Stays put. What is behind you is still there | Built for robots and vehicles, and open | Cheap. Ignores detail that does not matter |
| Weakness | Drifts. Remembers about a minute | Static. Little happens in it | Heavy. Physics is plausible, not guaranteed | Nothing to look at. Hard to inspect |
| Open | No. A limited research preview | No. A hosted product with free and paid tiers | Yes. Weights published | Yes. Weights published |

The table was written in September 2026.

### Interactive video: Genie 3

Genie 3, announced by Google DeepMind in August 2025, generates an environment from a text prompt and lets a person or an agent move through it in real time, at 720p and 24 frames a second. Each frame is generated from the frames before it and the latest input. Nothing is stored as geometry. The world exists only as the model's running prediction.

That makes two things notable. The first is consistency: turn away from a wall you painted and turn back, and the paint is still there, with the announcement describing visual memory reaching back about a minute and interaction holding together for a few minutes. Nobody programmed object permanence. It emerged from training. The second is promptable events: while the world runs, a typed instruction can change the weather or bring a new character in.

DeepMind's own list of limits is candid: a small set of actions, difficulty with several independent agents at once, no accurate reproduction of real places, poor text, and minutes of interaction, not hours.

### Persistent 3D: Marble

World Labs, founded by Fei-Fei Li, took the other route. Its product Marble, released in November 2025, turns text, photographs, video or a rough 3D layout into a 3D scene, exported as Gaussian splats, the representation part 5 of the generative media module described, or as triangle meshes, or rendered to video along an exact camera path.

Because the result is actual geometry, consistency is free. The room behind you cannot change, because it is a fixed object and not a prediction. Scenes can be edited, extended and joined. The price is that a scene is still: it is a place and not yet a situation. The company names interactivity as the next step. For design, film planning, games and simulation backdrops, a consistent place is already useful, and it drops into existing 3D tools in a way a stream of frames does not.

### Physical AI platform: Cosmos 3

NVIDIA's Cosmos models are aimed at makers of robots and vehicles, and are published openly. Cosmos 3, launched in June 2026, is described as one system that reasons about a scene, generates how it will unfold, and predicts actions, taking in and producing text, images, video, ambient sound and action trajectories. Its design pairs a transformer that reasons about objects, motion and space with a second that generates the video and the actions. It comes in a large version for accuracy, a small one for fast reasoning, and an edge version for running on the machine itself.

Its customers use it for three jobs, which section 3 describes: making synthetic training footage, testing a robot's control program against imagined futures, and as a starting point for models that output actions directly.

### Latent prediction: V-JEPA 2

Generating pixels is expensive, and most pixels are irrelevant. To decide whether a cup will fall, the exact texture of the tablecloth does not matter. Meta's V-JEPA 2, from the research programme led by Yann LeCun, is trained to predict the abstract representation of the missing or future part of a video, never the pixels. It learned from over a million hours of video, and then from a small amount of robot data, and the paper reports it planning simple picking and placing with robot arms in settings it had not seen.

The argument for this route is that prediction in a compact space is cheaper and is not distracted by unpredictable detail, such as leaves moving in the wind. The argument against is that you cannot watch what the model imagines, which makes it harder to debug and to trust.

### Deep dive (optional): why generated worlds drift

An interactive video world is autoregressive in the sense of part 1 of the language models module: each frame is predicted from earlier frames, including frames the model itself produced. Small errors therefore feed back. A texture that is slightly off in one frame is the ground truth for the next. Over hundreds of frames the scene wanders, and the generative media module described the same drift in long video clips.

Memory makes it worse. Attending to every earlier frame grows too costly within seconds, so the model keeps a limited window, or a compressed summary, of the past. Whatever falls out of that memory can be contradicted later: you walk around the block and the street you started from has changed.

Three remedies are being pursued. Longer and smarter memory, including explicit stores of what has been seen from where. Hybrid designs that build up a 3D representation as they go and generate frames consistent with it, which borrows the persistence of the second column of the table. And training on the model's own outputs, so that it learns to recover from its errors and does not compound them. Published real-time systems in 2026 report stable interaction of minutes. Hours remain out of reach.

## 3. What they are for

**In plain terms.** The main customers are not people who want to watch or play. They are teams building robots and self-driving vehicles, who need millions of practice situations, including dangerous ones that can never be staged. A world model can supply those. Games, film planning and design get something too. **Who should read it:** everyone.

### Practice for machines

- **Synthetic training data.** A vehicle needs to have seen a child run out from between parked cars in rain at dusk. Collecting that on real roads is slow and, for the worst cases, impossible. A world model can generate variations of a recorded scene: different weather, lighting, traffic, and rare events placed on demand.
- **Testing a policy.** A robot's control program is called its policy. Before trying a new one on hardware, run it against a world model and see what the model predicts would happen. It is faster and breaks nothing. The answer is a prediction, so it screens out bad policies better than it certifies good ones.
- **Training inside the model.** The 2018 idea at scale: an agent acts in the generated world and learns from the outcome. DeepMind has shown one of its game-playing agents pursuing goals inside Genie 3 worlds. The hope is a supply of varied environments without limit, in place of each one being built by hand.
- **Planning.** A robot with a world model can imagine the results of several possible actions and pick the best, step by step. V-JEPA 2's robot results work this way.

### For people

- **Games and prototypes.** A designer can describe a level and walk through it minutes later. It is a sketch, and that is what early design needs.
- **Film and design.** A consistent 3D scene from a few photographs is a location scout, a previsualisation set and a virtual backdrop. The shot-planning advice in part 3 of the generative media module applies.
- **Training and education.** Places and situations to rehearse in, where accuracy requirements are modest.

### Where the money is going

The scale of investment says how seriously this is taken. World Labs raised about a billion dollars in early 2026. NVIDIA has organised a coalition of labs and robot makers around its open models. The reason is a belief that robots are held back by data as language models once were, and that the missing data can only be made, not collected.

## 4. What goes wrong

**In plain terms.** A world model's physics is learned from watching, not written down as laws. It is usually about right and sometimes quietly wrong, and nothing flags the difference. For a game that hardly matters. For training a machine that will act in the real world, a convincing mistake in the simulator becomes a real mistake later. **Who should read it:** everyone. Anyone buying or relying on simulation should read it twice.

### Plausible is not correct

The generative media module's central warning carries over: these models produce what looks right. A generated liquid pours convincingly and may not conserve its volume. An object may pass through another when the camera is not looking closely. Collisions, friction and the behaviour of cloth, fluids and soft things are learned as appearances.

A conventional physics simulator is wrong in known ways: its laws are simplified, and engineers know which. A learned world model is wrong in unknown ways, which vary with the scene. That is the trade. The learned model covers the messy visual variety of the real world, which hand-built simulators cannot, and gives up guarantees.

### The gap back to reality

Robotics has long had a name for policies that work in simulation and fail on hardware: the sim-to-real gap. World models move the gap. An agent trained inside a model will learn to exploit the model's mistakes, exactly as part 2 of the language models module described models exploiting flawed reward signals. If objects in the model are easier to grasp than in life, the agent learns a grasp that fails in life.

The practical responses are the ones you would expect. Mix generated data with real data. Test on real hardware before trusting anything. Use the world model to find failures, which it is good at, more than to prove safety, which it cannot do.

### The rest of the list

- **Drift and forgetting**, as the deep dive described. Minutes, not hours.
- **A narrow set of actions.** Moving and looking work. Fine manipulation, tools and conversations with characters mostly do not.
- **Several agents at once** are hard to keep independent and consistent.
- **Real places** are not reproduced accurately. A generated city is a city-like place.
- **Cost.** Generating video in real time takes data-centre hardware for each user. It is far from a games console.
- **Evaluation.** There is no agreed measure of whether a world model's physics is right. Most published evidence is video that looks good.

### The whiteboard version

A world model is a learned simulator: state plus action gives next state, again and again. Some draw every frame, some build a 3D place, some serve robot makers, some never draw at all. Their main use is practice for machines that must act in the real world. Their physics is learned by watching, so it is plausible and unguaranteed, and anything trained inside one must be tested outside it.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| World model | A model that predicts the next state of an environment from the current state and an action, applied repeatedly | A learned simulator. It predicts what happens next if you do this |
| World model versus video model | Generation conditioned on a stream of actions at every step, versus on a prompt once | A video model makes a film. A world model makes a place you can act in |
| Interactive video world | Frames generated autoregressively in real time from past frames and control input, with no explicit geometry | A game that is being imagined as you play it. Nothing exists until you look at it |
| Persistent 3D world | Generation of an explicit 3D representation, such as Gaussian splats, which is then rendered conventionally | A real 3D set, built from a description. It cannot change behind your back, because it is an object |
| Latent world model | Prediction in a learned representation space, never decoded to pixels | It imagines outcomes in its own shorthand without drawing them, which is cheaper |
| Synthetic data for physical AI | Generated sensor footage, with controlled variation and rare events, used to train and test policies | Millions of practice situations for robots and cars, including the dangerous ones nobody can stage |
| Sim-to-real gap | The loss in performance when a policy trained in simulation meets the real world, from the simulator's errors | What worked in the rehearsal fails on the night, because the rehearsal room was not quite like the theatre |

## Misconceptions to correct

### "It is just a video generator with a joystick"

**True:** many world models are built from video models, and what you see is generated video.

**Misleading:** responding to actions changes the problem. The model must stay consistent with choices it could not predict, remember what it has shown, and run fast enough to react. Some world models produce 3D scenes or no picture at all.

**What to say:** "A video model shows you something. A world model lets you, or a robot, try something and see what happens. That is what makes it useful for training machines."

### "It has learned physics"

**True:** these models have absorbed a great deal about how things move, fall, collide and persist, without being told any laws.

**Misleading:** they learned appearances. Their physics is usually plausible and sometimes wrong, with no signal of which. They do not conserve mass or energy unless it happens to look right.

**What to say:** "It has learned what physics looks like. That is enough to practise in, and not enough to certify anything. Whatever is learned in it gets tested in the real world."

### "With this, robots will not need real-world data"

**True:** generated data can multiply a small amount of real data many times over, and cover rare cases that cannot be collected.

**Misleading:** a model trained only inside another model learns that model's mistakes. Every serious programme mixes generated and real data and validates on hardware.

**What to say:** "It makes our real data go much further. It does not replace it, and it never replaces the final test on the real machine."

## Glossary

Terms introduced in this part, in plain language and in alphabetical order. Gaussian splats and drift are explained in the generative media module.

| Term | Meaning |
| --- | --- |
| Action | The input a person or agent gives at each step, such as move, turn or grip, which the world model must respond to |
| Environment | The world, real or simulated, that an agent acts in |
| Imagination training | Training an agent on experience generated by a world model, not by the real environment |
| Latent | An abstract internal representation, as opposed to pixels |
| Object permanence | Things staying where they were left when out of view |
| Physical AI | AI for machines that act in the physical world, such as robots and vehicles |
| Policy | The program that chooses an agent's or robot's actions |
| Promptable event | A change to a running generated world made by a typed instruction, such as a change of weather |
| Reinforcement learning | Learning by trial and error, guided by rewards |
| Sim-to-real gap | The difference between how a policy performs in simulation and in the real world |
| State | Everything about the environment at one moment that matters for what happens next |
| Synthetic data | Training data produced by a model, not recorded from the world |
| World model | A model that predicts how an environment changes, in particular in response to actions |

## Sources

Descriptions and figures come from each developer's own announcement or paper, read in September 2026, and the capabilities described are as claimed by the developers. None of these systems has an agreed independent benchmark. The account of failure modes in section 4, beyond the limits the developers list themselves, rests on the drafter's general knowledge.

- [Genie 3: a new frontier for world models](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/), Google DeepMind, August 2025, for the resolution, frame rate, memory, promptable events, the agent experiments, the listed limitations and the research preview
- [Marble: a multimodal world model](https://www.worldlabs.ai/blog/marble-world-model), World Labs, November 2025, for the inputs, the export formats, editing, and interactivity as future work
- [World Labs announces new funding](https://www.worldlabs.ai/blog/funding-2026), February 2026, for the scale of investment
- [NVIDIA launches Cosmos 3](https://nvidianews.nvidia.com/news/nvidia-launches-cosmos-3-the-open-frontier-foundation-model-for-physical-ai), June 2026, for the two-transformer design, the modes it takes in and produces, the three versions, open publication and the coalition
- [World Simulation with Video Foundation Models for Physical AI](https://arxiv.org/abs/2511.00062), NVIDIA, October 2025, for the earlier Cosmos models' use in synthetic data, policy evaluation and closed-loop simulation
- [V-JEPA 2](https://arxiv.org/abs/2506.09985), Meta, June 2025, for prediction in representation space, the million hours of video, and planning with robot arms
- [World Models](https://arxiv.org/abs/1803.10122), Ha and Schmidhuber, 2018, for an agent trained inside its own learned model
- [Mastering Diverse Domains through World Models](https://arxiv.org/abs/2301.04104), Hafner and others, 2023, for the Dreamer agents
- [World Models: A Comprehensive Survey](https://arxiv.org/abs/2606.00133), May 2026, for the breadth of the field

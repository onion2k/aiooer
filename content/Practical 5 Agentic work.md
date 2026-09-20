# Part 5: Agentic Work

2026-09-20 · Chris Neale

## About this part

This is the fifth of nine parts in the practical AI module. The aims of the guide, the layout every part follows and suggested reading routes are in [Introduction](file/0a139f54-ef01). The format is the same as elsewhere: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 30 minutes.

[Part 4](file/8d27b5e4-c019) was about the files that extend an agent: skills, agent definitions and the plugins that bundle them. This part is about what happens when one runs. The word "agent" means something different here from the file called `AGENTS.md` in [part 3](file/f3a91c20-6d4e) and from the agent definition in part 4. Here it means the thing itself: a model in a loop, given tools and a goal, working until it decides it is done.

### What part 5 gives you

Part 5 builds one idea: an agent is a model in a loop, and nearly everything that makes one reliable is built around the model rather than into it. The loop is four lines of code. What decides whether it works is the brief, the feedback, the limits, where it runs and who checks it, and those are the subject of this part.

## 1. The loop

**In plain terms.** An agent is a model running in a loop: look at the goal, choose an action, see the result, decide what to do next, and repeat until done. This is how AI moves from answering questions to completing tasks, such as fixing a bug across several files, running the tests, reading the failures and trying again. Agents are powerful and less predictable. More steps mean more chances to go wrong, so they need clear goals, fast feedback and firm limits. **Who should read it:** everyone.

### The loop

```python
messages = [system_prompt, task]
while True:
    reply = model(messages, tools)
    messages.append(reply)
    if not reply.tool_calls:
        break                       # the model considers the task done
    for call in reply.tool_calls:
        result = execute(call)      # your code, your rules
        messages.append(result)
```

That is the whole idea. The intelligence sits in the model. The reliability comes from everything around it: the tools, the brief, the feedback and the limits. The software that supplies those is called a harness. Part 7 covers the tools.

### Workflow or agent

|  | Workflow | Agent |
| --- | --- | --- |
| Who decides the steps | You, in code | The model, at run time |
| Behaviour | Predictable and testable | Flexible and variable |
| Cost and latency | Low and known | Higher and variable |
| Suits | Repeatable processes with a known shape: triage a ticket, summarise a PR, extract fields | Open-ended tasks where the path is unknown: investigate a bug, implement a feature |

Use the simplest design that works. Many things proposed as agents are better built as workflows with a model call at two or three points. Reserve agents for work where you cannot write down the steps in advance.

### What makes an agent succeed

- **A clear goal and a definition of done.** "Fix the failing test in the payments module without changing its public interface" works. "Improve the code" does not.
- **Feedback from the environment.** Tests, compilers, type checkers and linters tell the agent whether a step worked. This is the verification theme from parts 2 and 3 of the language models module, and it is the largest single factor in agent reliability.
- **Good tools**, designed as part 7 describes.
- **A plan before action**, for anything sizeable. Have the agent write a plan, review it, then let it proceed. A wrong plan caught early costs a minute. Caught late it costs the whole run.
- **Limits** on steps, spend and time.

### Levels of autonomy

There are three broad levels of autonomy: the agent suggests and a person acts; the agent acts after each approval; the agent acts freely inside a sandbox and reports at the end. The first two run at human speed, because a person is in every step. Only the third runs at the AI's speed.

The third level is safe only where nothing in reach can do lasting harm and the result can be checked automatically. So the engineering goal is to make that true for as much work as possible: sandboxes, scoped credentials, strong tests and easy rollback. Every piece of that groundwork moves another class of task from supervised to delegated.

## 2. Surviving a long task

**In plain terms.** An agent's working memory is its context, and a long task fills it. As it fills, the agent gets slower, dearer and more forgetful. Small mistakes also add up over many steps. Good harnesses deal with both: they tidy the memory as they go, keep notes outside it, hand noisy work to helpers, and check the work between steps. **Who should read it:** engineers. Others can read "Compounding error" and move on.

### Managing context

Part 3 of the language models module shows that a filling context degrades quality and raises cost. Agents counter this in four ways:

- **Compaction.** Summarise progress and continue from the summary.
- **Notes files.** The agent records decisions and progress in a file and re-reads it. This is memory outside the context, and it survives a restart.
- **Sub-agents.** Exploration is delegated to a fresh context that returns only a summary. The main context stays clean, and sub-agents can run in parallel. Section 4 covers them.
- **Just-in-time loading.** Keep file paths and references in context, and load contents only when needed. Skills, in section 3, apply the same idea to instructions.

### Compounding error

Part 3 of the language models module gives the arithmetic: 98% reliability per step gives 36% over 50 steps. The counters are checkpoints to return to, such as a commit after each working step, and automatic verification between steps. Human attention is best spent at the start, on the plan, where a minute of review prevents an hour of wasted work. Review at the end should be proportional to risk, which section 6 sets out.

### Multi-agent systems

An orchestrating agent can hand parts of a task to worker agents. This suits broad, parallel work such as researching many sources or searching a large codebase. It multiplies token use several times over and adds coordination failures. Do not begin there. Add agents when a single one demonstrably runs out of context or time.

### Deep dive (optional): compaction strategies

Four techniques are in use, from cheapest to most invasive.

- **Clearing old tool results.** Bulky outputs from early steps are dropped, and the record that the call happened is kept. This is safe and recovers a lot of space.
- **Summarisation.** The model writes a state summary covering the goal, decisions made, files touched, open problems and next steps. The session restarts from that plus the most recent turns. The risk is losing a subtle constraint mentioned once, long ago.
- **Persistent notes.** Progress is written to a file outside the context as the task goes on, so a restart loses little.
- **Sub-agent isolation.** Noisy work never enters the main context at all.

There is a trade-off with prompt caching from part 3 of the language models module. Compaction rewrites the start of the context, which invalidates the cache. Good harnesses therefore compact rarely and in large steps, not a little on every turn.

## 3. Delegation and running in parallel

**In plain terms.** One agent working alone runs out of room on a long task, and works one thing at a time. Two answers: hand parts of the job to fresh helpers with clean memories, and run several agents at once on separate work. Both help. Both cost more than people expect. **Who should read it:** engineers, and anyone puzzled by an agent that "spawned" something.

### Sub-agents at run time

[Part 4](file/8d27b5e4-c019) covered what a sub-agent definition declares. What matters here is what delegation does. The helper starts with an empty context holding its own prompt and the task it was handed, works, perhaps reading fifty files, and returns a few paragraphs. The fifty files never touch the main context.

That buys three things: the main conversation stays clean, several helpers can run at once, and a helper can be given narrower tools than its parent, which is one of the defences in [part 9](file/7a3f2c68-91de).

It costs two. The helper knows only what it was told, so the hand-off is a brief, and part 3's contractor test applies to it in full; agents are not always good at writing briefs for one another. And a summary loses detail the parent cannot see it has lost.

### Several agents at once

An orchestrating agent can hand parts of a task to worker agents. This suits broad, parallel work such as researching many sources or searching a large codebase. It multiplies token use several times over and adds coordination failures. Do not begin there. Add agents when a single one demonstrably runs out of context or time.

The same caution applies to a person running several agents side by side, each on its own branch. It is the pattern that gets the most out of these tools, and it moves the constraint onto the person: you can direct three agents and review one at a time.

### What the measurements show

A production-scale study of one coding agent in June 2026, covering 3.2 million users and 13 million sessions, found the shape of this work plainly. A session is a few user turns, each unfolding into a long autonomous loop of model calls almost always paired with running a tool. Cached context is reused about 90% of the time within a turn and only about 55% across turns, and is thrown away entirely when the model is switched or the context is compacted. The idle gaps between turns, while a person reads and decides, are far longer than the agent's own bursts of work.

Two things follow. The cost of an agent is dominated by what happens inside a turn, which is why the context work in section 2 pays. And the person is the slow part, which is the argument for parallel work and for [part 1 of the AI in the organisation module](file/d6e2a95b-3f14).

## 4. Where the agent runs

**In plain terms.** An agent can run in your editor while you watch, in your terminal, or on someone else's computer while you do something else. The last kind, which takes a ticket and comes back with a pull request, is the one that changes how a team works, and the one that needs the firmest limits. **Who should read it:** everyone.

| Where | What it looks like | Suits | Watch for |
| --- | --- | --- | --- |
| In the editor | Completions and a chat panel, you driving every step | Small changes, exploring | The gain is capped by your reading speed |
| In the terminal | You give a task and watch it work, steering as it goes | Most day-to-day work | Long sessions going stale |
| In the background, on your machine | It works while you do something else | Well-specified tasks | Knowing what it did |
| In the cloud | You hand over a ticket; it works in its own sandbox and opens a pull request | Well-specified, independent work; migrations; backfilling tests | The queue of pull requests nobody has read |
| In the pipeline | It reviews changes, triages failures, drafts notes | Work that must happen every time | Noise, as [part 1 of the AI in the organisation module](file/d6e2a95b-3f14) found for review agents |

### Cloud agents in particular

By 2026 every major vendor offers one: you assign a task and it works alone, in an isolated environment, for minutes or hours, then returns a pull request. They are billed by usage rather than by seat, and the published rate cards put active use in the range of a hundred to a couple of hundred dollars per developer per month, which is small against a developer's time and large against the seat prices teams are used to.

What to know before adopting one:

- **The sandbox is the safety.** The agent has its own environment, its own credentials and no access to yours. That is what makes it safe to leave alone, and it means the environment has to be good enough to build and test in, or the agent is working blind.
- **It cannot ask you a question.** Anything ambiguous will be guessed. That puts all the weight on the brief, which is [part 3](file/f3a91c20-6d4e).
- **The bottleneck moves immediately.** Agents that open pull requests faster than people can review them create a queue, not throughput. That is the finding in part 1 of the AI in the organisation module, and it is the single most common way a cloud agent programme disappoints.
- **Benchmarks are not the job.** The published scores on standard task sets rose from about 2% to nearly 80% between late 2023 and early 2026, which is a real advance and still says nothing about your codebase. Run your own.

### What adopting agents did to real repositories

A longitudinal study published in January 2026 compared open-source repositories before and after their first agent-generated pull request, against matched controls. It found large early gains in velocity, but only where the agent was the first AI tool the project had used; where an AI-assisted editor was already in use, the throughput gain was small or short-lived. The quality signals moved the other way and stayed moved: static-analysis warnings up by roughly 18% and cognitive complexity by roughly 39%.

Read that as the same lesson the rest of this guide keeps arriving at. The agent produces more; whether that reaches anyone depends on the verification around it, and what it costs shows up later, in code nobody wants to touch.

## 5. Coding agents in practice

**In plain terms.** A coding agent is an agent with a developer's tools: it can search the codebase, read and edit files, run commands and tests, and use version control. Given a task, it explores, makes changes, runs the tests, fixes what breaks and presents the result for review. The large gains come from changing how people work around it, not from watching it type. **Who should read it:** everyone. Managers should read "Working at the agent's pace".

### How one works

The tools are file search, file read, file edit, a shell and version control, often with web or documentation search and MCP servers on top. At the start of a session the agent loads the instruction files from part 3 and the descriptions of its skills. Then it loops: explore, plan, edit, run, observe, adjust, and finally summarise what it did.

Four form factors are common:

- **Editor assistant:** inline completion and chat, with the developer driving every step
- **Interactive agent:** runs in the terminal or editor, carries out multi-step tasks while the developer watches and steers
- **Background agent:** takes a ticket, works in its own cloud environment, and returns a pull request
- **Pipeline agent:** runs in CI to review pull requests, triage failures or draft release notes

### Working patterns that hold up

- **Plan, review, execute.** Approve the approach before code is written. This is the cheapest and most valuable place for human attention.
- **Test first.** Have the agent write a failing test from the bug report, confirm that it fails, then fix the code. This guards against the reward hacking described in part 2 of the language models module.
- **Commit often.** Small commits are checkpoints to roll back to.
- **Fresh session per task.** This avoids the stale context problems from part 3 of the language models module.
- **Independent review.** Have a fresh session, with no knowledge of the author, review every diff before a person sees it.
- **Review by risk, not by habit.** A person remains accountable for what is merged. How they discharge that changes. Automated checks and AI review cover everything. Human reading concentrates on design decisions and on high-risk paths such as money, security, personal data and regulated logic, with spot checks elsewhere.

### Working at the agent's pace

The common first pattern is one developer, one agent, watching it work and then reading every line it wrote. This feels responsible, and it caps the gain. The agent waits for the person, and total throughput is set by human reading speed.

Teams that get much more from these tools change the shape of the work:

- **Run agents in parallel.** One engineer directs several tasks at once, each in its own branch or environment, and moves between them as they need input.
- **Hand off to background agents.** Well-specified tickets go to agents that return tested pull requests. Nobody watches them work.
- **Shift effort to the two ends.** The engineer's time moves to specifying the task well and to deciding whether the result is acceptable. The middle belongs to the agent.
- **Invest in verification you can trust.** Reading every line is a substitute for tests, types and checks you do not have. Each improvement to automated verification reduces how much must be read.
- **Do what was not worth doing before.** Build three prototypes to choose between instead of debating one. Backfill tests on legacy code. Complete the migration that was always deferred. Write the internal tool nobody had time for.

Measure whether it worked. Directing five agents at once feels enormously productive, and that feeling is not evidence. In the best-known trial, experienced developers took 19% longer with AI tools and still believed they had been 20% faster. Before changing how the team works, record a baseline: how long work takes from start to release, how much comes back as rework, how many defects escape. Then watch those figures and not the activity, since pull requests opened, lines written and tokens spent all soar whether or not anything reaches a customer sooner. Section 7 of [part 2 of the AI in the organisation module](file/3e89a4fc-a0bc) sets out the evidence and the measures.

None of this removes accountability. It changes where assurance comes from. Skipping review without stronger automated verification simply moves the cost to production. [Part 2 of the AI in the organisation module](file/3e89a4fc-a0bc) covers how to make this shift across a team.

### Where they still struggle

- large cross-cutting changes in code without tests
- ambiguous requirements, where the hard part is deciding what to build
- proprietary frameworks with no documentation in the repository
- subtle concurrency and performance problems
- visual fidelity in user interfaces, unless the agent can see the rendered result, which part 6 covers
- differences between its sandbox and your real environment

### The whiteboard version

An agent is a model in a loop with tools, a brief, feedback and limits. It is reliable in proportion to how well it can check its own work, so tests and types matter more than the model. On a long task it runs out of room, so it summarises, takes notes and hands work to helpers. It can run in your editor, your terminal, or on someone else's computer and come back with a pull request, and that last kind moves the bottleneck onto whoever reviews it.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Agent | A model in a loop, choosing tool calls based on results until a goal is met | An AI that works through a task step by step, checking the result of each step before the next |
| Workflow vs agent | Steps fixed in code with model calls at set points, versus steps chosen by the model at run time | A checklist where the AI helps with certain steps, versus giving the AI the goal and letting it work out the steps |
| Compaction | Replacing the early context with a summary so a long task can continue | When its memory fills, it writes itself a handover note and carries on from that |
| Sub-agent | A separate agent loop with its own context, prompt, tools and model, returning a summary | A helper sent off to do the legwork, who comes back with the answer and not the pile of paper |
| Cloud agent | An agent running unattended in an isolated environment, returning a pull request | We hand it a ticket and it comes back with finished work for review. Nobody watches it |
| Compounding error | Per-step reliability multiplied over many steps, so long runs need verification between them | Small mistakes stack up. Fifty steps at 98% right is right about a third of the time |
| The moving bottleneck | Raising agent throughput shifts the constraint to review and verification | Making the work arrive faster does nothing if the queue to check it gets longer |

## Misconceptions to correct

### "An agent is just a smarter model"

**True:** better models do make better agents.

**Misleading:** an agent is a model plus tools, a loop, a brief, feedback and limits. Two agents on the same model can differ enormously. Much of what makes one work is ordinary engineering around it: tests, clear tasks and sensible permissions.

**What to say:** "The model is the engine. Whether the vehicle gets anywhere depends on everything we build around it, and most of that is in our hands."

### "More agents will get it done faster"

**True:** independent pieces of work do finish sooner when several agents take one each.

**Misleading:** every hand-off is a brief that can be misunderstood, every summary drops detail, and the token bill multiplies. Work that is not really independent gets slower, because the agents now have to be reconciled. And the person reviewing is still one person.

**What to say:** "We add a helper when one agent is running out of room or time, not before. One well-briefed agent with good tests beats a committee."

### "Cloud agents mean we ship more"

**True:** an agent that takes a ticket and returns a tested pull request is a real change in what a team can attempt, and the benchmark scores behind them have genuinely transformed since 2023.

**Misleading:** they produce pull requests, which is not the same as shipping. Measured on real repositories, the velocity gain was large only where no AI tool was in use before, while the quality signals worsened and stayed worse. What decides the outcome is whether review and verification can keep up.

**What to say:** "They change what we can attempt. Whether any of it reaches a customer depends on review, so we widen that first and measure what gets delivered, not what gets opened."

## Glossary

Terms introduced in this part, in plain language and in alphabetical order. Skills, agent definitions and plugins are defined in part 4.

| Term | Meaning |
| --- | --- |
| Agent | A model running in a loop, choosing actions and reacting to their results until a task is done |
| Background agent | An agent that works unattended while you do something else |
| Cloud agent | An agent that runs in its own environment on someone else's computer and returns finished work |
| Coding agent | An agent with a developer's tools: file search and editing, a shell and version control |
| Compaction | Replacing the early part of a long context with a summary so that the task can continue |
| Multi-agent system | Several agents working on parts of one task, usually directed by an orchestrating agent |
| Orchestrator | The agent that divides a task and hands parts to other agents |
| Sandbox | The isolated environment a cloud agent works in, with its own credentials and no access to yours |
| Workflow | A process whose steps are fixed in code, with model calls at chosen points |

## Sources

Figures come from these, read in September 2026. The studies are of open-source repositories and of one vendor's product, so they show direction rather than what your team would see. The description of where agents run, and the advice throughout, rests on the drafter's general knowledge, and the products named date fastest of all.

- [Agentic Coding in the Wild: Characterizing GitHub Copilot Traces at Production Scale](https://arxiv.org/abs/2608.00101), July 2026, for the shape of a session, the cache figures within and across turns, and the long idle gaps while a person decides
- [AI IDEs or Autonomous Agents? Measuring the Impact of Coding Agents on Software Development](https://arxiv.org/abs/2601.13597), January 2026, for the velocity gains only where no AI tool came before, and the rises of about 18% in static-analysis warnings and 39% in cognitive complexity
- [An Empirical Study of Harness Design for Coding Agents](https://arxiv.org/abs/2609.20804), September 2026, for context management mattering most as the budget tightens, and for cutting before summarising

# Part 2: Skills, Agents and Plugins

2026-09-19 · Chris Neale

## About this part

This is the second of six parts in the practical AI module. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). The format is the same as elsewhere: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 35 minutes.

[Part 1](file/f3a91c20-6d4e) covered the text that stands in front of every request. This part covers the thing that reads it. It explains what an agent is, how one survives a long task, and the three ways a team now extends one: skills, which package know-how; sub-agents, which isolate work; and plugins, which bundle both for sharing. It ends with how coding agents are used in practice. [Part 4 of the running AI locally module](file/b7d15e92-4c60) covers what changes when the model behind the agent is small and the computer is yours.

### What part 2 gives you

Part 2 builds one idea: an agent is a model in a loop, and nearly everything that makes one reliable is built around the model, not into it. The pieces have names now, and the names are easy to confuse. A skill is something the agent knows. A sub-agent is somewhere the agent works. A plugin is a box that either can be shipped in. Each spends the context differently, and each is also a way for someone else's text or code to reach your machine.

## 1. Agents

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

That is the whole idea. The intelligence sits in the model. The reliability comes from everything around it: the tools, the brief, the feedback and the limits. The software that supplies those is called a harness. Part 4 covers the tools.

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
- **Good tools**, designed as part 4 describes.
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

## 3. Skills

**In plain terms.** A skill is a folder holding written instructions for one kind of job, such as "how we cut a release" or "how to fill in this form", sometimes with a script or a template beside them. The agent sees only a one-line description of each skill until a task calls for one, and then it reads the rest. It is how a team gives an agent its procedures without making every conversation carry all of them. **Who should read it:** everyone. If your team has a procedure written down anywhere, it is a candidate.

### What a skill is

Part 1 drew a line between what an agent should always know and what it needs sometimes. The instruction file holds the first. Skills hold the second.

The format is an open one. Anthropic published it as Agent Skills in December 2025, it is maintained at agentskills.io, and dozens of agents and editors from other vendors now read it. A skill is a directory with one required file, `SKILL.md`. That file opens with a short header giving a name and a description, and the rest is Markdown instructions in whatever form helps.

```file
---
name: cut-release
description: Prepares and tags a release of the billing service. Use when asked to release, ship, tag or publish a version, or to write release notes.
---

# Cutting a release

1. Run scripts/check-clean.sh. Stop if it reports uncommitted changes.
2. Read references/VERSIONING.md to choose the version number.
3. Update CHANGELOG.md from the merged pull requests since the last tag.
   Copy the layout of assets/changelog-entry.md.
4. Open a pull request titled "Release <version>". Do not tag until it is merged.

If the check script fails for any other reason, stop and report. Do not work around it.
```

Beside it the folder may hold `scripts/` for code the agent can run, `references/` for longer documents, and `assets/` for templates and data.

### Loaded in three stages

The design is called progressive disclosure, and it is what lets an agent have a hundred skills without drowning in them.

| Stage | What is loaded | When | Rough cost |
| --- | --- | --- | --- |
| Metadata | The name and description of every skill | At the start of every session | About 100 tokens each |
| Instructions | The body of one `SKILL.md` | When the agent decides the task calls for it, or you invoke it by name | The specification recommends under 5,000 tokens and under 500 lines |
| Resources | A reference file, a script, a template | When the instructions point to it and the step needs it | Only what is read |

A script is the extreme case. The agent runs it and reads its output, and the code itself need never enter the context at all.

### The description is a prompt

The agent chooses a skill by matching the task against the descriptions, in the same way that part 4 will show it choosing a tool. So the description decides whether the skill is ever used. The specification asks for it to say both what the skill does and when to use it, with the words a person would use when asking. "Helps with PDFs" will rarely be picked. "Extracts text and tables from PDF files, fills PDF forms and merges PDFs. Use when the user mentions PDFs, forms or document extraction" will.

Two failure modes follow. Vague descriptions mean a useful skill is ignored. Overlapping descriptions mean the wrong one is loaded. When a skill "does not work", check first whether it was loaded at all.

### What makes a good one

- One job per skill. A skill called "engineering practices" is an instruction file in the wrong place.
- Steps, examples of input and output, and the edge cases that have bitten before.
- A script for anything that must be done the same way every time. Instructions are interpreted. Code is executed.
- An explicit stopping rule: what to do when a step fails.
- Reference files one level below `SKILL.md`, each short. The agent loads whole files.

Some harnesses let a skill be marked so that only a person can invoke it, typically with a command such as `/cut-release`. Use that for anything with side effects, such as deploying or sending messages. The agent should not decide for itself that now is a good time to release.

### Skill, instruction file or tool

| You want the agent to | Use | Because |
| --- | --- | --- |
| Always follow a convention | The instruction file | It must be present in every session |
| Follow a procedure when the job comes up | A skill | It costs a line until it is needed |
| Reach a system it cannot reach | A tool or an MCP server, from part 4 | Skills add knowledge, not access |
| Use that system the way your team does | A skill alongside the tool | Access and know-how are separate, and a useful integration needs both |
| Be unable to do something | A hook or a permission, from part 6 | Instructions are requests |

## 4. Sub-agents

**In plain terms.** A sub-agent is a second agent that the first one starts, gives a job to, and hears back from. It has its own fresh memory, so the mess it makes while searching or reading never clutters the main conversation. Only its summary comes back. It is the difference between doing the research at your own desk and sending someone to the library. **Who should read it:** engineers, and anyone puzzled by why their agent "spawned" something.

### What one is

A sub-agent is defined by a short file: a name, a description of when to use it, a system prompt of its own, and optionally a list of the tools it may use and the model it runs on. When the main agent delegates to it, the harness starts a new loop with a new, empty context holding that prompt and the task it was handed. The sub-agent works, perhaps reading fifty files, and returns a few paragraphs. The fifty files never touch the main context.

### What it is for

- **Isolation.** Work that produces a lot of output you will not refer to again: searching a codebase, reading logs, surveying documentation.
- **Parallel work.** Several sub-agents can run at once on independent questions.
- **Narrower permissions.** A reviewer sub-agent can be given read-only tools. A sub-agent that reads untrusted web pages can be given no access to anything private, which is one of the defences in part 6.
- **A different model.** A cheap, fast model for searching and a strong one for deciding.
- **A second opinion.** A reviewer with a fresh context has not read the author's reasoning and is not anchored by it.

### What it costs

The sub-agent does not know what the main agent knows. It gets only what it is told, so the hand-off is a brief, and part 1's contractor test applies to it in full. Agents are not always good at writing briefs for each other. A vague delegation comes back as a confident, irrelevant summary.

A summary also loses detail, and the main agent cannot see what was left out. Tokens are spent in both contexts, so the total goes up even as the main context stays small. Sub-agents are worth it when the work is noisy or parallel. For a small, focused task they add cost and a chance of misunderstanding.

### Skill or sub-agent

The two are often confused because both are defined by a Markdown file with a description. They solve opposite problems. A skill brings knowledge into the current context. A sub-agent keeps work out of it. They also combine: a sub-agent can be started with particular skills already loaded, and a skill can say that its steps should run in a sub-agent.

## 5. Plugins, and what you are installing

**In plain terms.** A plugin is a package that bundles skills, sub-agents and the other extensions of a coding agent, so that a whole team, or the public, can install the same set with one command. Catalogues of them are called marketplaces. It is convenient, and it is a software supply chain: installing one puts someone else's instructions and code in charge of an agent that has your files and your shell. **Who should read it:** everyone who might click install, and anyone who sets policy for those who do.

### What is in the box

The details here are Claude Code's, and other harnesses have equivalents. A plugin is a directory with a small manifest and any of the following:

- skills
- sub-agent definitions
- hooks, which are scripts the harness runs at fixed points such as before a tool call or after an edit
- configuration for MCP servers and language servers
- executables added to the agent's path

A marketplace is a catalogue, usually a Git repository, listing plugins and where to fetch them. A team can host a private one, and a repository's settings can name the plugins its contributors should have. A plugin's skills are prefixed with its name, so two plugins can both have a `review` skill without colliding.

The test for whether you need one is simple. Start with loose files in one project. Make a plugin when a second repository needs the same setup.

### Hooks are the enforcing part

Hooks deserve a note of their own because they are different in kind from everything else in this part. A skill is text the model interprets. A hook is code the harness runs, every time, whatever the model thinks. A hook that runs the formatter after every edit always runs. A hook that refuses any command touching the production configuration always refuses.

This is the mechanism part 1 pointed to when it said an instruction is a request and not a guarantee. If a rule must hold, put it in a hook.

### A supply chain

Skills and plugins are distributed through open catalogues, mostly without mandatory review. Research through 2026 has been consistent about the risk.

- A skill's text is operational, not passive. One study of a public skill registry found that wording in `SKILL.md` alone could push a malicious skill up the search results, get it chosen over an honest equivalent in about three-quarters of paired trials, and slip past the registry's own screening in a third or more of attempts.
- Harm need not look like an instruction. Another study hid malicious steps inside the code examples and configuration templates in a skill's documentation. Agents copied them during normal work. Attacks written as explicit instructions were blocked every time under strong defences, and the disguised ones got through in roughly one run in eight to one run in three, depending on the agent and model.
- A script in a skill, a hook, or an executable in a plugin is ordinary code running with your privileges. No model has to be fooled.

The response is the one used for any dependency, with one addition.

- Install from sources you would accept code from. Prefer a private marketplace with reviewed contents.
- Read what you install. A skill is short, and that is the point of the format.
- Pin versions, and review updates as changes to code.
- Assume a skill can do whatever the agent can do, and limit the agent accordingly. Part 6 covers how.
- The addition: read the prose as carefully as the scripts. In this supply chain, a paragraph is executable.

## 6. Coding agents in practice

**In plain terms.** A coding agent is an agent with a developer's tools: it can search the codebase, read and edit files, run commands and tests, and use version control. Given a task, it explores, makes changes, runs the tests, fixes what breaks and presents the result for review. The large gains come from changing how people work around it, not from watching it type. **Who should read it:** everyone. Managers should read "Working at the agent's pace".

### How one works

The tools are file search, file read, file edit, a shell and version control, often with web or documentation search and MCP servers on top. At the start of a session the agent loads the instruction files from part 1 and the descriptions of its skills. Then it loops: explore, plan, edit, run, observe, adjust, and finally summarise what it did.

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
- visual fidelity in user interfaces, unless the agent can see the rendered result, which part 3 covers
- differences between its sandbox and your real environment

### The whiteboard version

The model is the engine. The harness is the vehicle. Instruction files are what the driver always knows, skills are the manuals in the glovebox, sub-agents are colleagues sent on errands, and plugins are how a whole fleet gets the same kit. Hooks are the only part that works like a brake.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Agent | A model in a loop, choosing tool calls based on results until a goal is met | An AI that works through a task step by step, checking the result of each step before the next |
| Workflow vs agent | Steps fixed in code with model calls at set points, versus steps chosen by the model at run time | A checklist where the AI helps with certain steps, versus giving the AI the goal and letting it work out the steps |
| Skill | A directory with a `SKILL.md` whose description is always in context and whose body loads on demand | A procedure manual the AI takes off the shelf only when that job comes up |
| Progressive disclosure | Metadata at start-up, instructions on activation, resources on reference | It reads the spine of every manual, opens one when needed, and turns to the appendix only if the page says to |
| Sub-agent | A separate agent loop with its own context, prompt, tools and model, returning a summary | A helper sent off to do the legwork, who comes back with the answer and not the pile of paper |
| Plugin | A versioned bundle of skills, sub-agents, hooks and server configuration, distributed through a marketplace | A kit that gives everyone's AI assistant the same procedures and safeguards in one install |
| Hook | Code the harness runs on a lifecycle event, able to block the action, independent of the model | A rule the software enforces, as opposed to one we ask the AI to follow |
| Coding agent | An agent with file, shell and version-control tools that iterates against tests | An AI that can read our code, make changes, run the tests and fix what it broke, then hand us the result to review |

## Misconceptions to correct

### "An agent is just a smarter model"

**True:** better models do make better agents.

**Misleading:** an agent is a model plus tools, a loop, a brief, feedback and limits. Two agents on the same model can differ enormously. Much of what makes one work is ordinary engineering around it: tests, clear tasks and sensible permissions.

**What to say:** "The model is the engine. Whether the vehicle gets anywhere depends on everything we build around it, and most of that is in our hands."

### "A skill is only text, so it is safe to install"

**True:** most skills are a page of Markdown, and a page of Markdown cannot run by itself.

**Misleading:** an agent acts on what it reads, with your files and your shell. Published attacks have worked through wording alone, and skills can also carry scripts that run as ordinary code.

**What to say:** "For an agent, instructions are code. We install skills the way we install software: from sources we trust, after reading them, at a pinned version."

### "More agents will get it done faster"

**True:** independent pieces of work do finish sooner when several agents take one each.

**Misleading:** every hand-off is a brief that can be misunderstood, every summary drops detail, and the token bill multiplies. Work that is not really independent gets slower, because the agents now have to be reconciled.

**What to say:** "We add a helper when one agent is running out of room or time, not before. One well-briefed agent with good tests beats a committee."

## Glossary

Terms introduced in this part, in plain language and in alphabetical order. Earlier terms are defined in part 1 and in the glossaries of the language models module.

| Term | Meaning |
| --- | --- |
| Agent | A model running in a loop, choosing actions and reacting to their results until a task is done |
| Background agent | A coding agent that works on a ticket unattended and returns a pull request |
| Coding agent | An agent with a developer's tools: file search and editing, a shell and version control |
| Compaction | Replacing the early part of a long context with a summary so that the task can continue |
| Hook | A script the harness runs at a fixed point, such as before a tool call, which can block the action |
| Marketplace | A catalogue of plugins, usually a Git repository, that a harness can install from |
| Multi-agent system | Several agents working on parts of one task, usually directed by an orchestrating agent |
| Orchestrator | The agent that divides a task and hands parts to other agents |
| Plugin | A package of skills, sub-agents, hooks and server configuration that installs as one unit |
| Progressive disclosure | Loading a little about everything and the detail of one thing only when it is needed |
| Skill | A folder of instructions, and sometimes scripts and templates, that an agent loads on demand to follow a procedure |
| `SKILL.md` | The required file in a skill, holding its name, its description and its instructions |
| Sub-agent | An agent started by another agent, with its own context, which returns a summary |
| Supply chain | Everything you install that someone else wrote, and the route it took to reach you |
| Workflow | A process whose steps are fixed in code, with model calls at chosen points |

## Sources

Formats, behaviours and figures in this part come from these documents, read in September 2026. The harnesses change monthly, so check each one's current documentation.

- [Agent Skills: specification](https://agentskills.io/specification), for the directory layout, the header fields, the three stages of loading and the recommended sizes
- [Claude Code: extend Claude Code](https://code.claude.com/docs/en/features-overview), for how skills, sub-agents, hooks and plugins differ, when each loads and what each costs in context
- [Claude Code: create plugins](https://code.claude.com/docs/en/plugins), for what a plugin contains, its manifest, namespacing and marketplaces
- [Under the Hood of SKILL.md: Semantic Supply-chain Attacks on AI Agent Skill Registry](https://arxiv.org/abs/2605.11418), May 2026, for the effect of wording alone on discovery, selection and screening
- [Supply-Chain Poisoning Attacks Against LLM Coding Agent Skill Ecosystems](https://arxiv.org/abs/2604.03081), April 2026, for payloads hidden in a skill's examples and templates, and the bypass rates
- [MalSkills: Detecting Malicious Skills in the Agentic Supply Chain](https://arxiv.org/abs/2603.27204), March 2026, for why detection is hard when the evidence is spread across prose, code and configuration

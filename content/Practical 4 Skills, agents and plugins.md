# Part 4: Skills, Agents and Plugins

2026-09-20 · Chris Neale

## About this part

This is the fourth of nine parts in the practical AI module. The aims of the guide, the layout every part follows and suggested reading routes are in [Introduction](file/0a139f54-ef01). The format is the same as elsewhere: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 25 minutes.

[Part 3](file/f3a91c20-6d4e) covered the instruction file that is loaded in every session. This part covers the three things a team writes to extend an agent beyond it, all of them files in a folder the harness reads: a **skill**, which is know-how fetched when a job calls for it; an **agent**, which is a definition of a helper the main agent can hand work to; and a **plugin**, which bundles both, and hooks, so a whole team installs the same set at once.

"Agent" is a word this guide uses three ways, and they are worth keeping apart. In part 3 it is `AGENTS.md`, the file of standing instructions. Here it is an agent definition: a short file declaring a helper's prompt, its tools and its model. In [part 5](file/1d8f42a6-b93e) it is the thing itself, a model running in a loop. This part is about the files. Part 5 is about what happens when one runs.

### What part 4 gives you

Part 4 builds one idea: these are three answers to one question, which is how a team's know-how reaches an agent without being pasted into every conversation. A skill is something the agent knows. An agent definition is somewhere it can send work. A plugin is the box either ships in. Each spends the context differently, and each is also a way for someone else's text and code to reach your machine.

## 1. Skills

**In plain terms.** A skill is a folder holding written instructions for one kind of job, such as "how we cut a release" or "how to fill in this form", sometimes with a script or a template beside them. The agent sees only a one-line description of each skill until a task calls for one, and then it reads the rest. It is how a team gives an agent its procedures without making every conversation carry all of them. **Who should read it:** everyone. If your team has a procedure written down anywhere, it is a candidate.

### What a skill is

Part 3 drew a line between what an agent should always know and what it needs sometimes. The instruction file holds the first. Skills hold the second.

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

The agent chooses a skill by matching the task against the descriptions, in the same way that part 7 will show it choosing a tool. So the description decides whether the skill is ever used. The specification asks for it to say both what the skill does and when to use it, with the words a person would use when asking. "Helps with PDFs" will rarely be picked. "Extracts text and tables from PDF files, fills PDF forms and merges PDFs. Use when the user mentions PDFs, forms or document extraction" will.

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
| Reach a system it cannot reach | A tool or an MCP server, from part 7 | Skills add knowledge, not access |
| Use that system the way your team does | A skill alongside the tool | Access and know-how are separate, and a useful integration needs both |
| Be unable to do something | A hook or a permission, from part 9 | Instructions are requests |

## 2. Agent definitions

**In plain terms.** An agent definition is a short file describing a helper the main agent can hand a job to: what it is for, how it should behave, which tools it may use and which model it runs on. Writing one is how a team says "when the job is reviewing a change, use this reviewer, with these instructions and read-only tools". What happens when the helper actually runs is [part 5](file/1d8f42a6-b93e). **Who should read it:** engineers.

### What the file declares

A definition is Markdown with a short header, kept beside the skills in the same folder the harness reads. It declares:

- **A name**, which is how it is addressed.
- **A description of when to use it**, which the main agent matches against the task exactly as it matches a skill's description. The same warning applies: vague descriptions mean the helper is never chosen.
- **A system prompt of its own**, which is the whole of its briefing. It does not inherit the conversation.
- **The tools it may use,** optionally. This is the useful part: a reviewer can be given read-only tools, and a helper that reads untrusted web pages can be given nothing private to leak.
- **The model it runs on,** optionally. A cheap, fast model for searching, a strong one for deciding.
- **Skills to preload,** optionally, so it starts knowing a procedure.

### Why write one

- **Isolation.** Work that produces a lot of output nobody will refer to again: searching a codebase, reading logs, surveying documentation.
- **Narrower permissions,** as above, which is one of the defences in [part 9](file/7a3f2c68-91de).
- **A second opinion.** A reviewer that has not read the author's reasoning is not anchored by it.
- **A procedure with a person attached.** A definition plus its preloaded skills is a role, written down.

### Skill or agent definition

The two are often confused, because both are a Markdown file with a name and a description. They solve opposite problems. A skill brings knowledge into the current context. An agent definition creates somewhere to send work so that it stays out of the current context. They combine: a definition can preload skills, and a skill can say its steps should run in a helper.

## 3. Plugins, and what you are installing

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

This is the mechanism part 3 pointed to when it said an instruction is a request and not a guarantee. If a rule must hold, put it in a hook.

### A supply chain

Skills and plugins are distributed through open catalogues, mostly without mandatory review. Research through 2026 has been consistent about the risk.

- A skill's text is operational, not passive. One study of a public skill registry found that wording in `SKILL.md` alone could push a malicious skill up the search results, get it chosen over an honest equivalent in about three-quarters of paired trials, and slip past the registry's own screening in a third or more of attempts.
- Harm need not look like an instruction. Another study hid malicious steps inside the code examples and configuration templates in a skill's documentation. Agents copied them during normal work. Attacks written as explicit instructions were blocked every time under strong defences, and the disguised ones got through in roughly one run in eight to one run in three, depending on the agent and model.
- A script in a skill, a hook, or an executable in a plugin is ordinary code running with your privileges. No model has to be fooled.

The response is the one used for any dependency, with one addition.

- Install from sources you would accept code from. Prefer a private marketplace with reviewed contents.
- Read what you install. A skill is short, and that is the point of the format.
- Pin versions, and review updates as changes to code.
- Assume a skill can do whatever the agent can do, and limit the agent accordingly. Part 9 covers how.
- The addition: read the prose as carefully as the scripts. In this supply chain, a paragraph is executable.

### The whiteboard version

The model is the engine. The harness is the vehicle. Instruction files are what the driver always knows, skills are the manuals in the glovebox, sub-agents are colleagues sent on errands, and plugins are how a whole fleet gets the same kit. Hooks are the only part that works like a brake.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Agent definition | A file declaring a helper's name, description, prompt, tools and model | A written role for a helper the AI can hand work to |
| Skill | A directory with a `SKILL.md` whose description is always in context and whose body loads on demand | A procedure manual the AI takes off the shelf only when that job comes up |
| Progressive disclosure | Metadata at start-up, instructions on activation, resources on reference | It reads the spine of every manual, opens one when needed, and turns to the appendix only if the page says to |
| Sub-agent | The helper an agent definition describes, run with its own context and returning a summary | A helper sent off to do the legwork, who comes back with the answer and not the pile of paper |
| Plugin | A versioned bundle of skills, sub-agents, hooks and server configuration, distributed through a marketplace | A kit that gives everyone's AI assistant the same procedures and safeguards in one install |
| Hook | Code the harness runs on a lifecycle event, able to block the action, independent of the model | A rule the software enforces, as opposed to one we ask the AI to follow |

## Misconceptions to correct

### "Agents, skills and plugins are three names for the same thing"

**True:** all three are Markdown files with a name and a description, kept in the same folder, and a plugin can contain the other two.

**Misleading:** they answer different questions. A skill brings know-how into the conversation. An agent definition sends work out of it. A plugin is how either travels to another repository or another team.

**What to say:** "A skill is something it knows, an agent is somewhere it sends work, and a plugin is the box they ship in."

### "A skill is only text, so it is safe to install"

**True:** most skills are a page of Markdown, and a page of Markdown cannot run by itself.

**Misleading:** an agent acts on what it reads, with your files and your shell. Published attacks have worked through wording alone, and skills can also carry scripts that run as ordinary code.

**What to say:** "For an agent, instructions are code. We install skills the way we install software: from sources we trust, after reading them, at a pinned version."

### "If the agent ignored my skill, the skill is broken"

**True:** a skill that is never used is worth nothing, and it is maddening to watch one sit there.

**Misleading:** the agent chooses by matching the task against the description, so a skill that never fires usually has a description that does not sound like the job, or one that overlaps with another. The body is rarely the problem.

**What to say:** "It picks by the description. If ours is not being chosen, we rewrite the description in the words someone would actually use."

## Glossary

Terms introduced in this part, in plain language and in alphabetical order. Earlier terms are defined in part 3 and in the glossaries of the language models module.

| Term | Meaning |
| --- | --- |
| Hook | A script the harness runs at a fixed point, such as before a tool call, which can block the action |
| Agent definition | A file declaring a helper: its name, when to use it, its prompt, its tools and its model |
| Marketplace | A catalogue of plugins, usually a Git repository, that a harness can install from |
| Plugin | A package of skills, sub-agents, hooks and server configuration that installs as one unit |
| Progressive disclosure | Loading a little about everything and the detail of one thing only when it is needed |
| Skill | A folder of instructions, and sometimes scripts and templates, that an agent loads on demand to follow a procedure |
| `SKILL.md` | The required file in a skill, holding its name, its description and its instructions |
| Sub-agent | An agent started by another agent, with its own context, which returns a summary |
| Supply chain | Everything you install that someone else wrote, and the route it took to reach you |

## Sources

Formats, behaviours and figures in this part come from these documents, read in September 2026. The harnesses change monthly, so check each one's current documentation.

- [Agent Skills: specification](https://agentskills.io/specification), for the directory layout, the header fields, the three stages of loading and the recommended sizes
- [Claude Code: extend Claude Code](https://code.claude.com/docs/en/features-overview), for how skills, sub-agents, hooks and plugins differ, when each loads and what each costs in context
- [Claude Code: create plugins](https://code.claude.com/docs/en/plugins), for what a plugin contains, its manifest, namespacing and marketplaces
- [Under the Hood of SKILL.md: Semantic Supply-chain Attacks on AI Agent Skill Registry](https://arxiv.org/abs/2605.11418), May 2026, for the effect of wording alone on discovery, selection and screening
- [Supply-Chain Poisoning Attacks Against LLM Coding Agent Skill Ecosystems](https://arxiv.org/abs/2604.03081), April 2026, for payloads hidden in a skill's examples and templates, and the bypass rates
- [MalSkills: Detecting Malicious Skills in the Agentic Supply Chain](https://arxiv.org/abs/2603.27204), March 2026, for why detection is hard when the evidence is spread across prose, code and configuration

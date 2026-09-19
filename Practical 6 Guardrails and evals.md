# Part 6: Guardrails and Evals

2026-09-19 · @Someone

## About this part

This is the sixth of seven parts in the practical AI module. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). The format is the same as elsewhere: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 25 minutes.

Parts 1 to 5 built a system: instructions, skills, media, tools and retrieved documents, all feeding a model that acts. This part is about trusting it. Guardrails limit what can go wrong. Evals measure how often it goes right. Section 3 condenses parts 1 to 6 into a checklist for reviewing any AI feature. [Part 7](file/d6e2a95b-3f14) then applies all of it along the whole software lifecycle, and holds the module's two reference sections.

### What part 6 gives you

Part 6 builds one idea: you cannot make a model reliable, and you can make a system reliable. Do not depend on the model behaving well. Arrange things so that misbehaviour cannot do much harm, and measure how often the whole thing succeeds on real cases. Both are ordinary engineering, and both are what allow a person to step out of the loop, which is where the speed is.

## 1. Guardrails

**In plain terms.** Guardrails are the controls around a model that limit the damage when it is wrong or has been manipulated. The principle is not to rely on the model behaving well, but to design things so that misbehaviour cannot do much harm. The methods are those of ordinary security: minimal permissions, approval for risky actions, isolation and logging. **Who should read it:** everyone. Anyone approving an AI rollout should be able to ask about each of these.

### One guardrail per failure

| Failure from part 3 of the language models module | Guardrail |
| --- | --- |
| Hallucination | Ground answers in sources, check citations, verify by running things |
| Non-determinism | Validate output, retry with the error, limit steps and time |
| Prompt injection | Least privilege, approval gates, isolation of untrusted content, sandboxing |
| Stale knowledge | Supply current documentation and version information |
| Sycophancy | Neutral prompts and independent review in a fresh context |
| Compounding error | Checkpoints and automatic verification between steps |

### Asked, or enforced

[Part 1](file/f3a91c20-6d4e) made a distinction that this section depends on. A line in an instruction file or a skill is a request. The model usually honours it, and it is not a control. A guardrail is something that holds whatever the model decides.

| Layer | Example | Holds if the model is manipulated |
| --- | --- | --- |
| Instruction | "Never push to main" in the instruction file | No |
| Permission setting in the harness | The push command is on a deny list, or needs approval | Yes, within the harness |
| Hook | A script that inspects every command and blocks a push to main | Yes, within the harness |
| Sandbox | The agent runs in a container with no credentials for the remote | Yes |
| The system itself | The branch is protected on the server, and the agent's token cannot write to it | Yes, whatever runs the agent |

Work from the bottom of that table upwards. The strongest control is the one furthest from the model. Use instructions to make good behaviour likely, and the lower layers to make bad outcomes impossible.

### Defending against prompt injection

Start from the assumption that an injection will sometimes succeed, and limit what it can achieve. The routes in have multiplied through this module: a web page, a tool result or a tool's own description from [part 4](file/c9146f3b-27a8), a retrieved passage from [part 5](file/0b8e5d17-f4c2), text inside an image from [part 3](file/52e0a7c9-b3f6), and an installed skill from [part 2](file/8d27b5e4-c019).

- **Least privilege.** Read-only by default. Narrowly scoped tokens. No production credentials in a development agent.
- **Break the dangerous combination.** Part 3 of the language models module named it: private data, untrusted content and an outbound channel, all in one agent. Remove at least one. An agent that browses the web gets no secrets. An agent with repository access gets a network allow-list.
- **Approval gates.** A person confirms consequential actions: sending messages, merging, deploying, deleting, spending money.
- **Isolate untrusted content.** Process it in a separate model call that has no tools, and pass on only a structured result, such as a category or extracted fields. A sub-agent with no tools and no private context is a convenient way to do it.
- **Sandboxing.** Run agent actions in a container or virtual machine with no access to the host file system and restricted network access.
- **Keep secrets out of the context.** Credentials are injected by the tool layer at execution time. The model never sees them, so it cannot be tricked into revealing them.

Classifiers that detect injection attempts are a useful extra layer. They are not sufficient alone. They are models too, and an attacker who can rephrase until the agent obeys can rephrase until the classifier passes it.

### Treat output as untrusted input

Model output that flows into another system needs the same handling as user input. Validate it against a schema. Escape it before rendering in a browser. Use parameterised queries, and never build SQL from it directly. Never pass it to `eval`. Before installing a package the model suggested, check that it exists and is the one you meant, because part 3 of the language models module described how invented package names are exploited.

### Handling variability

When validation fails, retry and include the validation error in the retry, so that the model can correct itself. Provide a fallback for repeated failure. Give actions idempotency keys, so that a retried step does not send two emails or create two tickets. Put limits on steps, time and spend for every agent run.

### Approval without fatigue

If every action needs approval, people stop reading and click yes. Reserve approval for actions that are irreversible or high-impact, and let low-risk ones proceed. Make each request informative: show the exact command, or the actual diff, not a summary of intent.

Remember too that every approval gate is a point where the system runs at human speed. Place each one deliberately, and ask what would need to be true, in sandboxing, permissions or automated checks, for it to be removed.

### Observability

Log prompts, tool calls, outputs, approvals, token counts and cost, grouped into one trace per task. Include what was retrieved and which skills were loaded, since part 5 showed that most diagnosis starts there. You need this to debug failures, which cannot otherwise be reproduced. You need it for audit, which matters in any regulated business. And you need it as the raw material for the evals in the next section.

## 2. System-level evals

**In plain terms.** An eval is a test suite for an AI feature: a set of realistic inputs and a way of scoring the outputs. It tells you whether the thing works, and whether a prompt change or a new model made it better or worse. It lets you argue from evidence. Without one, every change is a guess and every vendor claim is unverifiable. It is the most important practice in this module and the one most often skipped. **Who should read it:** everyone can read the main text. Skip the deep dive.

### Why ordinary tests are not enough

A unit test asserts one exact result. An AI feature has many acceptable outputs, varies between runs, and fails partially. So the question changes from "does it pass?" to "how often does it succeed across a representative set?"

### Build the dataset

- Start with 20 to 50 cases. A small, real set beats a large synthetic one.
- Draw them from real usage or your backlog. This is the same asset part 2 of the language models module recommended for comparing models.
- Include easy, typical, hard and adversarial cases, including an injection attempt if the feature reads untrusted content, and ugly scans if it reads documents.
- Turn every production failure into a new case. The set becomes your regression suite.
- Hold some cases back, and do not tune prompts against them. Otherwise you fit the prompt to the test, the same fault part 2 of the language models module criticised in public benchmarks.

### Three kinds of grader

| Grader | Examples | Use |
| --- | --- | --- |
| Code | Exact match, schema valid, tests pass, quoted text really appears in the source | First choice. Cheap, fast and reliable |
| Model | An LLM scores the output against a written rubric | For open-ended quality. Must be calibrated against human labels |
| Human | An engineer reviews a sample | The reference standard. Use it to calibrate the others and for spot checks |

For a coding agent, a case is a repository state plus a task. The grader checks that hidden tests pass, that the lint is clean, that the test files were not tampered with and that the diff touches only what it should. Record cost, time and number of steps alongside success.

### Evaluate the parts as well as the whole

This module's pieces can each be measured alone, and a failure is much easier to find that way.

| Piece | Question | Measure |
| --- | --- | --- |
| Instruction file or prompt | Did the change help? | Success rate on the set, before and after |
| Skill | Is it loaded when it should be, and only then? Does it improve the result? | Activation rate on prompts that should and should not trigger it. Success with and without the skill |
| Tool | Does the model pick the right tool and fill in valid arguments? | Share of cases with the correct call |
| Retrieval | Did the right passage reach the context? | Share of questions whose marked passage is in the top results, as part 5 described |
| Document reading | Are the extracted fields right? | Field-by-field accuracy against hand-labelled documents |

Some harnesses now ship this for their own extensions. Claude Code, for example, can run a plugin against a set of test prompts several times with and without the plugin loaded, to show what the plugin contributes.

### Read the outputs first

Before building any grader, read 50 real outputs and sort the failures into categories by hand. This shows what actually goes wrong, which is rarely what you assumed. Teams that skip this step build elaborate scoring for the wrong problem.

### Reading the numbers

Run each case three to five times, because results vary between runs. Track success rate, cost per task, latency and the mix of failure categories.

Be honest about sample size. With 30 cases, a difference of under 10 to 15 percentage points could easily be chance. Small sets are good for catching regressions and large differences. They cannot settle a close contest.

### When to run them

- on every change to a prompt, tool, skill or instruction file, ideally in CI
- before upgrading a model version
- when a new model is released, to compare it in an afternoon
- continuously, on a sample of production traffic

### Monitoring in production

Watch the signals users give without being asked: whether suggestions are accepted, edited or regenerated, and whether people give up on a task. Score a sample of live outputs with your graders. Put cost and latency on a dashboard, and alert on the failure rate as you would for any service.

### Working is not the same as helping

An eval answers "does it do the task?". It cannot answer "was the task worth doing this way?". A feature can pass nine cases in ten and leave the work around it no faster, because the time went to checking its output, or because the step it sped up was never the constraint. That second question needs a figure from before the feature existed: how long the job took, how often it went wrong, what it cost. Take it before launch, because it cannot be recovered afterwards, and people's sense of how much a tool helps them is reliably generous. Then report the outcome, such as tickets resolved or time to release, and not the usage. Section 7 of [part 4 of the language models module](file/3e89a4fc-a0bc) covers the measures.

### Deep dive (optional): biases in LLM judges

Model graders are convenient and have known, measurable biases.

- **Position bias.** In side-by-side comparisons, judges favour one position. Run each comparison in both orders and average.
- **Verbosity bias.** Longer answers score higher, whether or not they are better. Tell the judge to ignore length, and check that it does.
- **Self-preference.** Models favour output from their own family. When comparing vendors, use a judge from a third party, or several judges.
- **Deference.** A confident tone or a claimed authority in the answer sways the verdict, which is the judge's own sycophancy at work.
- **Unstable scales.** Scores from 1 to 10 drift and cluster. Prefer pass or fail against specific, checkable criteria, or pairwise comparison.

Two habits keep a model grader honest. Have it write its reasoning before its verdict. And calibrate it: label 50 to 100 cases by hand, measure how often the judge agrees, and repeat the check whenever the judge model changes.

## 3. A design review checklist

**In plain terms.** These are the questions to ask when someone proposes an AI feature or workflow, whether your own team, a vendor or another department. A proposal that cannot answer them is not ready. **Who should read it:** everyone. This section is the module in usable form.

**Purpose and fit**

- What does success look like, and how will it be measured?
- Does this need an agent, or would a fixed workflow with a model call do?
- What happens today without it, and what is the cost of a wrong output?
- What is the baseline: how long it takes, how often it goes wrong and what it costs now? Who measured it, before this was built?
- Where is a person in the loop, and does that make the whole thing run at human pace? What would have to be true to take them out of the routine cases?

**Context**

- What does the model need to know, and where does that come from?
- Which instruction files and skills shape it, who owns them, and are they short?
- Is the source material accurate, current and free of contradictions?
- Does retrieval respect the permissions of the person asking?
- How large is the context per call, including images and tool definitions, and is it laid out for caching?

**Tools and permissions**

- Which tools and servers can it reach, and is each one necessary?
- Which skills, plugins and servers came from outside, and who reviewed them?
- What is the most damaging thing it could do with the access it has?
- Does it combine private data, untrusted content and an outbound channel?
- Which rules are requests to the model, and which are enforced by something else?
- Which actions need a person's approval, and will that person see enough to judge?

**Failure handling**

- What happens when the output is invalid, wrong or missing?
- Is output validated before anything downstream uses it?
- Are there limits on steps, time and spend?

**Evidence**

- Is there an eval set drawn from real cases, and what is the current success rate?
- Which delivery outcome should move, and by how much, against the baseline? When will that be checked?
- Which model version is pinned, and what is the process for upgrading it?
- Are prompts, skills and instruction files in version control and reviewed?

**Operations**

- What will it cost per task and per month, using the model from part 3 of the language models module?
- Are prompts, tool calls, retrieved passages and outputs logged and traceable?
- Who owns it once it is live?

### The whiteboard version

Assume the model will sometimes be wrong and sometimes be fooled. Give it the least access that does the job, put the controls in software and not in the prompt, keep a record of everything, and keep a set of real cases that tells you the success rate. Then you can let it run.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Guardrail | A control outside the model that bounds the effect of a wrong or manipulated output | A safety rail. We do not count on the AI never slipping. We make sure a slip cannot take it over the edge |
| Sandbox | An isolated execution environment with restricted file and network access | A sealed room for the AI to work in, where mistakes cannot reach anything important |
| Least privilege | Granting only the minimum permissions and scopes the task requires | The AI gets the keys to the rooms it needs and no others |
| The dangerous combination | Private data, untrusted content and an outbound channel in one agent enable exfiltration by injection | If it can read our secrets, read strangers' text and send messages out, a stranger can ask it to post our secrets. We always remove one of the three |
| Approval gate | A human confirmation required before an irreversible or high-impact action | The AI does the routine work alone and asks before anything that cannot be undone |
| Eval | A dataset of representative cases with automated graders, run on every change | A test suite for the AI feature. It tells us the success rate, and whether a change helped or hurt |
| LLM as judge | Using a model with a rubric to grade open-ended outputs, calibrated against human labels | Using one AI to mark another's work, after checking that its marking agrees with ours |
| Trace | The full record of one task: prompts, retrieved passages, tool calls, outputs and cost | The flight recorder. When something goes wrong, we can see exactly what it was told and what it did |

## Misconceptions to correct

### "We have told it not to, so it will not"

**True:** current models follow clear instructions well, and a written prohibition prevents most accidents.

**Misleading:** an instruction is text in the context, competing with every other piece of text there, including text an attacker wrote. Nothing enforces it. Under manipulation, or deep in a long task, it can lose.

**What to say:** "Instructions make good behaviour likely. For anything that must not happen, we remove the ability: no credentials, no write access, or a check in software that blocks it."

### "A person approves everything, so it is safe"

**True:** a person reviewing each action can catch what the model gets wrong, and for irreversible actions a person should.

**Misleading:** people asked to approve everything stop reading within days, and the system then has the appearance of oversight without the substance. It also runs at human speed.

**What to say:** "We save approvals for the few actions that cannot be undone, and we show the approver the exact command or change. Everything else is made safe by limits and checks, so that nobody needs to watch it."

### "We tried it and it worked"

**True:** trying it is the right first step, and a good demonstration shows that the task is possible.

**Misleading:** a handful of attempts says little about a system whose output varies and whose failures are partial. It says nothing about next month's model or last week's prompt change.

**What to say:** "A demo shows it can work. A set of fifty real cases, run every time we change something, shows how often it does. We decide on the second."

## Glossary

Terms introduced in this part, in plain language and in alphabetical order. Earlier terms are defined in parts 1 to 5 and in the glossaries of the language models module.

| Term | Meaning |
| --- | --- |
| Approval gate | A point where a person must confirm before an action goes ahead |
| Baseline | The figures for a piece of work before the AI feature existed: how long it took, how often it went wrong, what it cost |
| Classifier | A model that sorts input into categories, such as "injection attempt" or "safe" |
| Eval | A set of test cases with a scoring method, used to measure how well an AI feature works |
| Grader | The part of an eval that decides whether an output is acceptable: code, a model or a person |
| Guardrail | A control outside the model that limits the harm a wrong or manipulated output can do |
| Held-out set | Test cases kept aside and never used while tuning, to give an honest measure |
| Idempotency key | An identifier that ensures a repeated request takes effect only once |
| Least privilege | Giving a system only the permissions it needs for its task |
| LLM as judge | Using a model to grade the outputs of a model |
| Observability | Logging and tracing that lets you see what a system did and why |
| Position bias | A judge model's tendency to favour an answer because of where it appears |
| Regression suite | Tests kept to make sure that problems fixed once do not return |
| Rubric | Written criteria that a grader scores against |
| Sandbox | An isolated place for an agent to run, with restricted access to files and the network |
| Trace | The full record of one task: every prompt, tool call, output and cost |

## Sources

This part sets out established practice from the drafter's general knowledge, and most of it carries over from the part of the language models module that this module replaced. Two details come from documentation read in September 2026.

- [Claude Code: extend Claude Code](https://code.claude.com/docs/en/features-overview), for hooks as enforcement where instructions are requests
- [Claude Code: create plugins](https://code.claude.com/docs/en/plugins), for running a plugin against test prompts with and without it loaded

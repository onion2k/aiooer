# Part 4: AI in the Engineering Team

2026-09-18 · Chris Neale

## About this part

Part 4 is about the team, and it makes one claim: tools do not produce speed, redesigned work does. A team can give every engineer the best model available and see almost no change in what it delivers. Another team with the same tools can ship several times as much. The difference is whether the work was reorganised around what the AI can do, or the AI was fitted into work that stayed the same.

Parts 1 to 3 supplied what you need to make that change responsibly: what these systems are good at, how they fail, and how to build checks that do not depend on a person reading everything. This part applies it to how a team plans, builds, reviews, measures and grows.

The format is unchanged. Reading time is about 45 minutes.

## 1. Two ways to adopt AI

**In plain terms.** There are two ways to use AI at work. The first is to do the same job in the same way with less effort: the AI drafts, and you check all of it. It is comfortable, and the gains are modest. The second is to change how the job is done so that the AI's speed is not held back by ours: a different division of labour, checking done by machines, and more things attempted. It is harder, and it is where the large gains are. Most teams are in the first mode and believe they have adopted AI. **Who should read it:** everyone. This section is the argument of the whole part.

### The two modes

|  | Effort-saving | Redesign |
| --- | --- | --- |
| Unit of work | A person with an assistant | A person directing several agents |
| Who sets the pace | The person | The agent, within limits set by the person |
| How work is checked | A person reads everything | Automated checks on everything, human review by risk |
| What gets done | The same backlog, a little sooner | The backlog, plus work that was never worth doing |
| What is measured | Usage and satisfaction | Cycle time, throughput and outcomes |
| Typical gain | 10% to 30% on the coding portion | Multiples, on suitable work |

### The ceiling on effort-saving

The first mode has a hard limit, and the arithmetic is simple. Coding is only part of the time it takes to deliver a change. Suppose it is a quarter, with the rest spent waiting for review, testing, clarifying requirements and releasing.

| Coding speed-up | Overall speed-up when coding is 25% of cycle time |
| --- | --- |
| 2 times faster | 1.14 times |
| 10 times faster | 1.29 times |
| Infinitely faster | 1.33 times |

No model improvement can lift a team past that ceiling. The only way through is to speed up the other three quarters, and that means changing the process. Redesign is not the ambitious option. It is the only option that leads anywhere.

### Why effort-saving is the default

It is worth understanding why sensible people settle there, because exhortation will not move them.

- **It feels responsible.** Reading every line seems like diligence, and nobody was ever criticised for it.
- **Trust has not been earned.** Without reliable automated checks, reading everything really is the only way to know the code is right.
- **The process assumes human pace.** Review queues, test cycles, sprint rituals and release trains were all sized for people typing.
- **The incentives point that way.** If output expectations stay the same, using AI to reduce personal effort is entirely rational. If going faster only brings more work, slack is the better deal.

Three of those four are properties of the system, not of the individuals. An engineer cannot go faster than the review queue, the test suite and the release process allow, whatever tools they hold. Changing those is management work.

### A fair word for the first mode

Effort-saving is not worthless. It is the on-ramp. People learn what the tools can do, where they fail and how to brief them. The mistake is stopping there and calling it adoption. The rest of this part is about what comes next.

## 2. Where the time goes

**In plain terms.** Writing code is a minor part of delivering software. Most of the elapsed time is waiting: for a review, for an answer, for a test run, for a release slot. AI makes the writing fast, which makes the waiting more obvious and often worse, because more work arrives at the same narrow points. Find the narrowest point and widen it. Speeding up anything else achieves nothing. **Who should read it:** everyone.

### The value stream

Follow one change from idea to production: refined, in development, in review, in test, released. At each stage there is time when someone is working on it and time when it sits in a queue. The share of elapsed time spent in active work is called flow efficiency, and in most teams it is well under half.

The theory of constraints gives the rule. A system's throughput is set by its narrowest point. Improving any other stage only builds a queue in front of that point. Faster coding upstream of a slow review process produces a growing pile of open pull requests, and nothing more.

### What the studies found

| Study | Setting | Finding |
| --- | --- | --- |
| Controlled experiment, 2022 | Developers building a small web server from scratch | The group with an AI assistant finished 55.8% faster |
| METR randomised trial, 2025 | 16 experienced developers, 246 real tasks in mature open-source projects they knew well, early-2025 tools | Tasks took 19% longer with AI. The developers had forecast a 24% speed-up and afterwards still believed they had been 20% faster |
| DORA survey research, 2024 | Tens of thousands of professionals | Individuals reported higher productivity. A 25% rise in AI adoption was associated with 1.5% lower delivery throughput and 7.2% lower delivery stability |
| DORA survey research, 2025 | As above | The link with throughput turned positive. The link with stability stayed negative. AI was described as amplifying a team's existing strengths and weaknesses |

### Reading them together

- **Gains are real on isolated, greenfield or unfamiliar tasks.** That is where the first study sits.
- **Gains are smallest for experts in code they know well, using interactive tools in effort-saving mode.** The METR participants spent their time prompting, waiting and reviewing output. That is a precise picture of the first mode from section 1.
- **Perception is unreliable.** People felt faster while being slower. A 39-point gap between belief and measurement is reason enough to measure.
- **Local speed did not reach delivery.** DORA's explanation for 2024 was that AI led to larger batches of change, which are riskier, while the fundamentals downstream had not changed.

The tools have moved on a great deal since early 2025, so treat the specific numbers as dated. The two durable lessons are the perception gap, and that the result depends on the system the tool is placed in.

### Where the bottleneck goes

When coding speeds up, the constraint moves to one of these:

- **Review.** More pull requests, and larger ones, waiting on the same few reviewers.
- **Testing.** Slow continuous integration, flaky tests and limited QA capacity.
- **Decisions.** Engineering now waits for product answers. "What should we build?" becomes the constraint.
- **Integration.** Parallel work produces merge conflicts and duplicated effort.
- **Release.** Approval steps, release trains and change boards sized for a slower flow.

### Finding yours

Take the last 30 completed tickets. For each, record how long it spent waiting at each stage, using timestamps your tracker and source host already hold. The stage with the largest total wait is your constraint. That is where AI, and your own effort, should go first. Section 10 builds this into a plan.

## 3. Verification at machine speed

**In plain terms.** People read every line of AI-written code because they have no other way to know it is right. The answer is not to stop checking. It is to build ways of checking that do not depend on a person reading: automated tests, automated reviewers, small changes, and releases that can be undone in minutes. Human attention then goes to the few places where it really matters. This is the biggest single enabler of going faster. **Who should read it:** everyone. Non-technical readers can skim the first table.

### Assurance has to come from somewhere

Confidence that a change is safe can come from many sources. Line-by-line human reading is the most expensive of them, and one of the least reliable. Studies of code review have long found that reviewers' defect detection falls away sharply once a change passes a few hundred lines. A person skimming a 1,500-line AI-generated diff is performing a ritual, not a check.

The question for a team is therefore not "should we review less?" It is "where should our assurance come from, and how much of it can run without us?"

### The assurance stack

| Layer | What it catches | Time |
| --- | --- | --- |
| Types and linters | Invented methods, wrong signatures, convention breaches | Seconds |
| Unit and integration tests | Behaviour that changed when it should not have | Minutes |
| Security scanning | Vulnerable or unknown dependencies, leaked secrets, common flaws | Minutes |
| AI review in a fresh context | Logic errors, missing cases, tampered tests, scope creep | Minutes |
| Preview environment and end-to-end tests | Integration and interface failures | Minutes to an hour |
| Feature flags, canary release, automatic rollback | Whatever escaped the layers above, contained quickly | Minutes in production |
| Monitoring and alerting | Problems that only real traffic reveals | Continuous |
| Human review | Whether this is the right change, and risks no tool understands | Hours, so reserve it |

Every layer above the last row runs at machine speed. The more you trust them, the less a person has to read.

### A different review question

The reviewer's question changes from "is each line correct?" to three others. Is this the right change? Is it adequately tested? What is the damage if it is wrong, and how fast can we undo it?

In practice that means reading the specification and the tests more carefully than the implementation. If the tests truly pin down the required behaviour, the implementation matters much less, and it can be regenerated at will.

### Review by risk

| Tier | Examples | Human review |
| --- | --- | --- |
| Low | Internal tools, tests, documentation, prototypes, scripts, refactoring under strong test coverage | Automated checks and AI review. A person samples, say one change in five, often after merge |
| Medium | Ordinary product features behind a flag | A person reviews the approach and the tests, and skims the rest |
| High | Payments and balances, authentication, personal data, regulated logic such as responsible-gambling controls, infrastructure permissions, data migrations | Full human review with a second reviewer, exactly as today |

Agree the tiers with security and compliance before you use them. Encode them as path-based ownership rules in the repository, so that tooling enforces the policy and nobody has to remember it. In a regulated business, this written policy is also what you show an auditor.

### What must be true first

Trusting code that nobody read line by line is reasonable only when these hold:

- **Tests you believe.** They would fail if the behaviour broke. Check by breaking something on purpose, or with mutation testing.
- **Fast continuous integration**, ideally under ten minutes, so that agents and people get feedback while it is useful.
- **Small changes**, so that any failure is easy to locate and revert.
- **Rollback in minutes**, and feature flags for anything user-facing.
- **Monitoring that would notice** a problem before a customer reports it.
- **Ownership rules** that route high-risk paths to people automatically.

Where these do not hold, you have found your investment backlog. It is work that agents are well suited to: backfilling tests on legacy code is tedious for people and cheap for a model. The loop reinforces itself. Better verification allows more delegation, and delegation builds better verification.

### Two warnings

**The capability trap.** Under delivery pressure, it is tempting to skip this groundwork and simply review less. Output rises for a quarter. Then defects, rework and incidents consume the gain and more. The investment has to be protected like any other preventive work.

**Accept and watch the residual risk.** No stack catches everything. Track the defect escape rate and the change failure rate. If they rise, tighten a tier or strengthen a layer. The goal is a deliberate level of risk, not zero and not unknown.

## 4. Working patterns at AI pace

**In plain terms.** Day-to-day work changes shape. An engineer writes a clear specification, sets several pieces of work going, and judges what comes back. Less time goes on typing and on watching an AI type. The familiar rules about finishing what you start and keeping changes small still apply, and matter more. **Who should read it:** everyone.

### The specification is the new source

When implementation is cheap, the scarce skill is saying exactly what is wanted. A good task specification states the problem, the acceptance criteria as concrete examples or tests, the constraints, and what is out of scope. Fifteen to thirty minutes spent here regularly saves hours.

This also moves review upstream. A colleague can review a one-page specification in five minutes, and an error caught there costs almost nothing. The same error caught in a finished diff costs the whole run. Peer review of specifications is the cheapest quality practice a team can adopt.

### The directing cycle

The engineer's loop becomes: specify, dispatch, verify, integrate. Time shifts to the first and third steps. The second belongs to the agent, and the fourth is mostly automated.

- **Parallel work.** One engineer runs several agent tasks at once, each in its own branch or environment. Three to five is a realistic ceiling, because human attention is the limit. Choose tasks that touch different areas, to avoid merge conflicts.
- **Background work.** Tickets that are "agent-ready" go to background agents and come back as tested pull requests. A ticket is agent-ready when it has clear acceptance criteria, pointers to the relevant code and a way to verify the result. Writing tickets to that standard helps human engineers too.
- **Overnight work.** Long-running tasks such as migrations, test backfill and dependency upgrades run outside working hours, and are triaged in the morning.

### Limits on work in progress still apply

Agents make starting work free. Finishing it still costs human attention. An engineer can easily end a day with ten half-verified pull requests and nothing shipped. Limit the number of items awaiting a person's judgement, and finish before starting more. The old rule holds: value comes from work completed, not work begun.

### Keep batches small

The 2024 DORA finding in section 2 was traced to larger batches of change. AI makes a 2,000-line change as easy to produce as a 200-line one, and it is ten times harder to verify and to revert. Ask agents to split work into a series of small, independently shippable changes. Set a size guideline for pull requests and have tooling flag breaches.

### What changes in planning

- **Estimates move.** For many tasks the implementation cost collapses, and the uncertainty shifts to specifying the work and verifying it. Estimate those.
- **Capacity is no longer typing time.** It is the team's capacity to specify, decide and verify.
- **Show, do not describe.** A working prototype settles a design argument faster than a document. Bring one to the meeting.
- **Regenerate, do not patch.** When a generated solution is wrong in approach, fix the specification and run it again. Editing it by hand is often slower.

### Token cost is not the constraint

Part 3 showed that heavy agent use costs a few dollars per engineer per day. Running three attempts in parallel to pick the best, or letting an agent work overnight, is cheap next to an hour of a person's time. Teams that ration tokens while engineers wait have the economics backwards.

## 5. Doing what you would not have done

**In plain terms.** The largest gain may not be doing today's work faster. It may be the work that was never worth doing at human cost and now takes an hour of an agent's time: the migration that was always deferred, the tests nobody wrote, three prototypes where you would have built one. When the cost of an attempt falls tenfold, the list of things worth attempting grows. **Who should read it:** everyone.

### The economics

Every team carries a long list of things that would be valuable and never rise above the line: too tedious, too large, too uncertain. Those judgements were made at human cost. Many of them are now wrong, and few teams have revisited them.

### Where to look

| Category | Examples |
| --- | --- |
| Decide by building | Three prototypes of competing approaches in a day. A spike before an estimate. A clickable prototype for a product discussion in place of a document |
| Pay down debt | Test backfill on legacy modules. Dependency and framework upgrades. Migrations done file by file with tests as the guard. Dead code removal. Adding types. Adopting a lint rule across the whole repository |
| Quality work that usually gets cut | Edge-case tests. Accessibility fixes. Better error messages and logging. Runbooks. Documentation kept current. Decision records drafted from pull request history |
| Internal tools | Admin screens, data-fix scripts, dashboards, test data generators, one-off analysis tools |
| Investigation | Analysing logs and incidents. Learning an unfamiliar codebase or vendor SDK. Root-cause hypotheses. A security read-through of your own code |
| Experiments | More variants in each A/B test. Faster turnaround from idea to live experiment |
| Operations | Triage of flaky tests and CI failures. Reducing alert noise. First drafts of postmortems |

### Choose what compounds

Cheap to build is not cheap to own. Every line shipped is a line to maintain, a prototype is not a product, and saying no still matters. More output is not the same as more value.

Give priority to work that compounds: anything that widens your constraint from section 2, strengthens the verification stack from section 3, or lowers the future cost of change. Test backfill, faster CI and completed migrations all make the next piece of AI-assisted work faster and safer.

### Make it a habit

Keep a visible list titled "not worth it before". Add to it whenever someone says "we would never have time for that". Review it each quarter, and reserve explicit capacity for it. These items also make the most persuasive stories when you report upward, because they are things the organisation can see that it would not otherwise have had.

## 6. Quality and accountability at speed

**In plain terms.** AI-written code goes wrong in recognisable ways, and each has an automatic check that catches it. Someone must still own every change. And the team must go on understanding its own system, even when it did not type most of it. **Who should read it:** everyone can read the ownership and comprehension sections. The table is for engineers.

### Failure patterns and what catches them

| Pattern | Catch it with |
| --- | --- |
| Plausible but wrong logic | Tests written from the specification, not from the implementation |
| Duplicated logic, because the agent did not find the existing helper | Duplication detection, a codebase map in the instruction file, AI review |
| Over-engineering and needless abstraction | Size limits, a reviewer prompt that asks "what could be removed?" |
| Unneeded or invented dependencies | Dependency allow-list and lockfile checks |
| Swallowed errors and silent fallbacks | Lint rules on empty catch blocks, AI review |
| Weakened or tautological tests | Mutation testing, a rule flagging test changes alongside fixes |
| Security gaps: injection, missing authorisation, secrets in code | Security scanning, and the high-risk tier for sensitive paths |
| Drift from team conventions | Linters, formatters and the instruction file |
| Changes outside the task's scope | Diff size limits, AI review against the ticket |
| Deprecated APIs | Types, compiler warnings, current documentation in the context |

Part 2 explained why several of these occur. A model rewarded for passing checks will sometimes satisfy the check and miss the intent.

### The ownership model

The person who dispatches a task and merges the result owns it. "The agent wrote it" is never an acceptable line in a postmortem.

Accountability does not mean having read every line. It means having made sure that the assurance was adequate for the risk tier. A surgeon is accountable for an operation without having personally sterilised the instruments, because there is a system they can rely on and are responsible for using.

When something escapes, the blameless question is which layer of the stack should have caught it. The action is to strengthen that layer, and not to reintroduce blanket manual review.

### Comprehension debt

This is the new risk. Code that nobody on the team has read or understands works well until an incident at 2am, when someone must reason about it under pressure.

- **Keep architecture human-owned.** People decide module boundaries, data models and interfaces. Agents fill them in.
- **Require a summary with every change.** The agent writes what changed and why, and drafts a decision record for anything structural.
- **Keep modules small.** Understanding can then be rebuilt quickly. Comprehension has become cheaper too: a model can explain an unfamiliar module on demand, which softens this risk without removing it.
- **Test for on-call readiness.** Ask whether the engineer on call could diagnose this service. If not, that is a gap to close before the incident.
- **Keep high-risk code human-understood, always.**

### Entropy

Many small generated changes let a codebase drift towards inconsistency and duplication. Schedule regular clean-up runs by agents, with a person setting the direction, and keep the instruction file current so that new work follows the patterns you want.

## 7. Measuring impact

**In plain terms.** Count what is delivered, not how busy people look. AI makes activity numbers soar: more code, more pull requests, more commits. Delivery can stay flat the whole time. The right measures show whether finished work reaches customers sooner and breaks less often. **Who should read it:** everyone can read the main text. The deep dives are for those designing the measurement.

### What not to measure

- lines of code, commits and pull request counts
- the percentage of code written by AI
- suggestion acceptance rates
- tokens consumed or licences activated
- hours saved, as estimated by the people concerned

The first four measure activity and are easily inflated, by accident or on purpose. The last is unreliable for the reason section 2 gave: people who were 19% slower believed they were 20% faster.

### What to measure

| Measure | What it shows | What to watch for with AI |
| --- | --- | --- |
| Cycle time, split by stage | Where time is really spent | Coding time falls while review or test waiting grows |
| Finished items per week | Real throughput | Should rise. If it is flat while pull requests rise, work is piling up |
| Review wait time | Whether review is the constraint | Usually the first thing to worsen |
| Pull request size | Batch size, a leading indicator of risk | Tends to creep upward |
| Change failure rate and time to restore | Stability | The measure that fell in DORA's research |
| Rework rate | The share of changes that fix recent changes | Rises when speed outruns verification |
| Defect escape rate | Whether the assurance stack is working | The check on review-by-risk |
| Work in progress | Whether people finish or only start | Agents make starting free |

Add a product outcome measure, so that faster delivery is tied to something the business values. Add a short, regular survey on what helps and what gets in the way.

### Two signatures

**Effort-saving adoption:** usage up, satisfaction up, pull requests up, cycle time flat, review queue longer, pull requests larger, stability down.

**Redesign:** cycle time falling stage by stage, pull request size steady or down, change failure rate steady, more items finished, and long-deferred debt items closing.

If your dashboard shows the first pattern, you have a tooling rollout and not yet a change in how work is done.

### Ground rules

- **Baseline first.** Four to six weeks of history can usually be pulled retrospectively from your tracker and source host.
- **Compare a team with its own past.** Do not compare individuals or teams with each other, because their work differs.
- **Never use these figures for individual performance.** The moment you do, people manage the number, and you lose both honesty and the measure.
- **Report upward with outcomes first:** delivery measures, one or two stories of things that would never otherwise have been done, and cost per engineer from part 3 beside them.

### Deep dive (optional): reading productivity studies critically

New studies appear monthly and are quoted selectively. Seven questions sort them quickly.

1. Who took part? Novices gain more than experts, and strangers to a codebase more than its maintainers.
2. What was the task? Greenfield exercises flatter AI. Mature codebases do not.
3. Which tools, and when? Results from tools a year old say little about today's.
4. What was measured? Task time, delivered value and self-report are different things.
5. Was there a learning curve? In the METR trial, most participants had limited prior experience of the tool they used.
6. Who paid for it? Vendor studies are not worthless, and they are not neutral.
7. How large was it? Sixteen developers is a careful study and a small one.

Then ask the only question that matters: how closely does the setting match yours?

### Deep dive (optional): DORA and SPACE with AI in the picture

DORA's delivery measures are deployment frequency, lead time for changes, change failure rate and time to restore service, with rework rate added more recently. They measure the system and not individuals, which is why they hold up well when AI inflates individual activity.

SPACE is a framework for developer productivity with five dimensions: satisfaction, performance, activity, communication and efficiency. Its central advice is never to rely on one dimension. That advice matters more now, because AI specifically inflates the activity dimension while leaving the others untouched. A balanced set would take cycle time for efficiency, change failure rate for performance, a survey for satisfaction and review wait for communication, and would treat activity counts as context only.

### Deep dive (optional): a fair pilot in a small team

You cannot randomise eight people into two groups and learn anything. There are three workable designs.

- **Before and after**, against a baseline. It is simple, and it is confounded by changes in the mix of work. Offset this by comparing similar kinds of ticket.
- **Randomise by task.** For a few weeks, flip a coin for each suitable ticket to decide whether the new way of working is used. This is the METR design, and it is the most rigorous option for a small team.
- **Stagger across teams**, so that later adopters act as a comparison for earlier ones.

Whichever you choose, decide the measure in advance. Run for six to eight weeks, so that you get past the learning dip. Include the redesign elements from sections 3 and 4, or you will only measure effort-saving mode and confirm its ceiling. Write down beforehand what result would change your decision.

## 8. People and skills

**In plain terms.** The valuable skills shift from writing code to specifying work, judging results and designing checks. Adoption will be uneven, and some of the resistance will be well-founded. People change how they work when the new way is visibly better and when going faster benefits them too. Junior engineers need particular care, because the tasks they used to learn on are the ones agents now do. **Who should read it:** everyone. The deep dive is optional.

### The skill shift

| Less central | More central |
| --- | --- |
| Typing out an implementation | Specifying precisely what is wanted |
| Recalling syntax and APIs | Breaking work into independent, verifiable pieces |
| Line-by-line reviewing | Judging whether a result is right and adequately tested |
| Writing tests afterwards | Designing verification up front |
| Knowing one codebase by heart | System design, and debugging code you did not write |

The skills on the left still matter, because you cannot judge what you could not have written. They are no longer where most of the hours go.

### Uneven adoption

Expect a few enthusiasts, a majority who dabble, and some who decline. Mandates and usage quotas produce the activity signature from section 7 and little else. What spreads practice is seeing it work.

- Run a short weekly session in which someone shows a real piece of work, including what went wrong.
- Pair enthusiasts with sceptics on a real task.
- Keep prompts, instruction files and agent-ready ticket templates in a shared repository that everyone improves.
- Name two or three champions, and give them time for it.

### Take the resistance seriously

Much of it is reasonable. Some engineers had poor experiences with earlier, weaker tools. Some have well-founded quality concerns, which sections 3 and 6 exist to answer. Some find meaning in the craft of writing code. Many fear that gains will be turned into headcount cuts or simply higher targets.

Answer honestly. Say what the gains are for: more scope, paying down debt, less crunch. Make no promises you cannot keep. Involve the sceptics in designing the verification stack, because their instincts about what could go wrong are exactly what it needs.

### Fix the incentive

Section 1 noted that effort-saving is rational when going faster only earns more work. Change what is recognised. Credit the people who build the verification that lets everyone delegate more, who write the tickets that agents can complete, and who produce shared tooling. This is preventive, enabling work, and it stays invisible unless you make it visible.

### Junior engineers

The risk is real. The small, well-defined tasks that juniors once learned on are the ones agents do best. A junior who only prompts can ship code they do not understand and cannot judge.

The opportunity is also real. A patient tutor is available at any hour, and exposure to varied problems comes faster than it used to.

- Juniors explain the code they submit, in their own words.
- Schedule deliberate practice without AI for the fundamentals, as a musician practises scales.
- Pair juniors with seniors on reviewing agent output, which teaches judgement directly.
- Give juniors ownership of verification work such as tests, checks and evals. It builds the central skill.
- Keep hiring them. A team that stops has no seniors in five years.

### Seniors, hiring and roles

Senior engineers can lose sharpness in design and debugging if they only ever supervise. Rotate them through hands-on work on the hardest problems.

In interviews, allow AI and watch how the candidate directs and checks it. Assess specification, judgement of output, debugging and system design. How fast someone types a sorting algorithm tells you little now.

QA moves from executing tests towards verification strategy and tooling. Platform and developer-experience work gains in value, because it is what lets everyone else delegate.

### Watch the load

Directing several agents means constant switching of attention and a stream of judgement calls. It is more tiring than it looks. Watch for fatigue, and do not assume that an engineer with five agents running is having an easy day.

### Deep dive (optional): how AI code review tools work

A review tool is triggered when a pull request opens or changes. It gathers context: the diff, the surrounding files, the repository's instruction file, the linked ticket and sometimes static analysis results. Agentic reviewers go further, searching the codebase and running the code.

It then makes one or more model passes, often with separate prompts for defects, security, tests and conventions. The output is filtered and ranked before anything is posted. This step is the heart of the product, because noise is what kills these tools. Once engineers learn to ignore the comments, the tool is worthless. Better tools learn from the comments a team dismisses.

Three limits are worth knowing. The reviewer knows the intent of a change only if the ticket is linked and well written. It judges architectural direction poorly. And a reviewer from the same model family as the author shares its blind spots, so use a different model, or at least a different prompt and a fresh context.

In the assurance stack it is a first pass on every change, with severe findings blocking the merge. Measure its precision, meaning the share of its comments that led to a change, and tune it or replace it if that figure is low.

## 9. Beyond developers

**In plain terms.** Every role around engineering can use these tools, and should, because the constraint does not stay in engineering. If developers speed up and product decisions, testing or releases do not, the team is no faster. **Who should read it:** everyone.

| Role | High-value uses | Watch for |
| --- | --- | --- |
| QA | Test cases from specifications, exploratory test charters, writing and maintaining end-to-end scripts, triage of flaky tests, test data | Tests that mirror the implementation instead of the requirement |
| Product | Prototypes to test an idea, critique of a draft specification for gaps and edge cases, synthesis of customer feedback, plain-language analytics queries | Fluent documents that nobody has thought through |
| Design | Rapid variants, prototypes in real code | Inconsistency with the design system |
| Support | Reply drafts, answers from the knowledge base with sources, ticket classification and routing, case summaries | Invented policy. Ground every answer in approved content |
| Operations | Log and alert triage, incident timelines and postmortem drafts, runbooks, infrastructure-as-code changes, cloud cost analysis | Write access to production. Keep approval gates |
| Data and BI | SQL from a question plus the schema, analysis notebooks | Plausible queries that answer a slightly different question |
| Compliance and legal | Questions answered from policy documents with citations, first-pass checks of a change against the rules | Final judgement stays with a person |
| Engineering managers | Synthesising status across tools, ticket hygiene, first drafts of documents | Personal data about staff. Keep it out of general tools |

### The constraint crosses boundaries

Section 2 listed "decisions" as a place where the bottleneck lands. When engineering can build in a day what took a fortnight, the scarce resource becomes knowing what to build. Bring product and design into the change early. A product manager who can test three ideas with working prototypes in a week changes the pace of the whole team.

### Non-developers building software

Product managers and analysts can now build working prototypes and small internal tools themselves. This is very good for learning and for speed. It needs one guardrail: a clear line between a personal or sandboxed tool and anything that touches customer data or production, with engineering review at that line.

## 10. A 90-day plan

**In plain terms.** Three months, in three phases: find out where time really goes, build the checks that let you delegate and try the new ways of working on low-risk work, then spread what worked and find the next constraint. **Who should read it:** everyone who will run or sponsor the change.

### Days 1 to 30: baseline and find the constraint

- Pull baseline measures from existing tools: cycle time by stage, pull request size, review wait, change failure rate, rework rate.
- Map the value stream for the last 30 tickets and name the constraint, as in section 2.
- Settle the basics: approved tools, licences, and an instruction file in each main repository, as [part 1 of the practical AI module](file/f3a91c20-6d4e) describes.
- Agree the risk tiers from section 3 with security and compliance. Write them down.
- Choose two or three champions and give them time.
- Start the "not worth it before" list from section 5.

### Days 31 to 60: build verification and pilot the new patterns

- Attack the constraint directly. If it is review, add an AI first pass and a pull request size limit. If it is testing, put agents on test backfill and CI speed.
- Close the biggest gap in "what must be true first" from section 3.
- Pilot spec-first work and background agents with the champions, on the low-risk tier only.
- Pick one long-deferred migration or debt item as a showcase, and finish it.
- Build a small eval set for your coding agent on your own repository, as [part 6 of the practical AI module](file/7a3f2c68-91de) describes.
- Hold the weekly show-and-tell.

### Days 61 to 90: spread and embed

- Extend the working patterns to the whole team.
- Codify what worked: an agent-ready ticket template, review-by-risk encoded as repository ownership rules, and a short team working agreement.
- Compare the measures with the baseline, using the two signatures from section 7.
- Find the new constraint. It will have moved, quite possibly out of engineering.
- Report upward: delivery outcomes, one or two stories of work that would never otherwise have happened, and cost per engineer.
- Plan the next quarter around the new constraint.

### What to expect

Output usually dips in the first few weeks, while people learn and the verification work draws effort. Gains are uneven across people and across kinds of work. When the constraint leaves engineering, the conversation you need is with product, release management or compliance, and part 5 prepares you for it.

### What not to do

- Do not set usage quotas or track individuals.
- Do not promise headcount savings.
- Do not remove review before the assurance stack is ready to replace it.
- Do not run the pilot on effort-saving mode alone, because it will only confirm the ceiling.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Effort-saving vs redesign | Using AI inside an unchanged, human-paced process, versus restructuring specification, verification and release so that agents set the pace | Using AI to do the same job with less effort, versus changing the job so that the AI's speed actually reaches the customer |
| The ceiling | By Amdahl's law, if coding is 25% of cycle time, infinite coding speed yields at most 1.33 times overall | Writing code is only a quarter of the wait. Make it instant and we are still only a third faster, unless we fix the rest |
| The constraint | The stage with the longest queue time sets system throughput. Gains elsewhere only build inventory | The narrowest part of the pipe decides the flow. Speeding up anything else just makes a bigger puddle in front of it |
| Assurance stack | Layered automated verification: types, tests, scanning, AI review, progressive delivery and monitoring, with human review reserved for high-risk paths | Many automatic safety nets, so that people check only what truly needs a person |
| Review by risk | Path-based tiers determining the required level of human review, enforced by repository ownership rules | Our experts look hardest at payments and player data, and lightly at internal tools, in place of reading everything equally |
| Agent-ready ticket | A task with explicit acceptance criteria, pointers to the relevant code and an automated means of verification | A job described clearly enough that it can be handed over and checked without a conversation |
| Batch size | The amount of change per release. Risk and review cost grow faster than linearly with size | Many small deliveries, not a few big ones. Small ones are easy to check and easy to undo |
| Comprehension debt | Code in production that no team member has read or can reason about under incident conditions | Parts of our own system that nobody here understands. Fine until something breaks at night |
| Flow measures vs activity measures | Cycle time, throughput and failure rates, versus commits, lines of code and AI usage share | Are customers getting finished work sooner and with fewer problems? That, not how busy everyone looks |
| Capability trap | Deferring investment in verification to raise short-term output, which erodes later capacity through rework | Skipping the groundwork to look fast now, and paying for it with firefighting later |

## Misconceptions to correct

### "AI makes everyone a 10x developer"

**True:** on some tasks, such as boilerplate, unfamiliar code, prototypes and migrations, the speed-up really is that large.

**Misleading:** coding is a fraction of delivery time, so even infinite coding speed gives a modest overall gain unless the rest of the process changes. Measured results range from much faster to slower, depending on the person, the task and the way of working.

**What to say:** "It can make writing code ten times faster. Writing code is about a quarter of how long delivery takes. The big gains come when we change the other three quarters, and that is a process change, not a tool purchase."

### "The percentage of AI-written code shows how well we are doing"

**True:** it shows that the tools are being used.

**Misleading:** it measures activity and is trivially inflated. A team can reach 80% AI-written code while shipping no sooner and breaking more. It also rewards generating more code, when less code is usually better.

**What to say:** "That number tells us people have the tool open. What I report is whether finished work reaches customers sooner and fails less often."

### "Reviewing every line carefully is the safe option"

**True:** human judgement is essential, and some code must always be read closely.

**Misleading:** reviewers catch far fewer defects in large diffs than in small ones, so blanket manual review gives a feeling of safety more than the substance. It also caps the team at reading speed. Layered automated checks, with close human review kept for high-risk code, are both safer and faster.

**What to say:** "Reading everything feels safe and is not. Nobody reviews a thousand lines well. We are moving our safety into automatic checks that never tire, and keeping our experts' attention for payments, security and regulated logic, where it counts."

### "Juniors no longer need to learn the fundamentals"

**True:** juniors can now produce working code far beyond what they could write alone.

**Misleading:** the scarce skill is judging whether output is right, and that rests on the fundamentals. Someone who cannot judge cannot be given ownership, and ownership is what makes an engineer valuable.

**What to say:** "The tools raise the floor, and they raise the importance of judgement even more. We still teach the fundamentals, because those are what let someone tell a good answer from a plausible one."

## Glossary

Terms introduced in this part, in plain language and in alphabetical order. Earlier terms are defined in the glossaries of parts 1 to 3.

| Term | Meaning |
| --- | --- |
| Activity measure | A count of how much was done, such as commits or lines of code, as opposed to what was delivered |
| Agent-ready ticket | A task written clearly enough, with a way to check the result, that an agent can complete it unattended |
| Amdahl's law | The rule that speeding up one part of a process improves the whole only in proportion to that part's share |
| Assurance stack | The layers of automatic and human checks that together give confidence a change is safe |
| Baseline | Measurements taken before a change, to compare against afterwards |
| Batch size | How much change is bundled into one release or pull request |
| Canary release | Releasing a change to a small share of users first, to catch problems before everyone is affected |
| Capability trap | Skipping investment in how work gets done in order to deliver more now, which reduces what can be delivered later |
| Change failure rate | The share of releases that cause a problem needing a fix |
| Comprehension debt | Code running in production that nobody on the team understands |
| Constraint (bottleneck) | The stage of a process that limits the output of the whole |
| Cycle time | The elapsed time from starting work on a change to releasing it |
| Defect escape rate | The share of defects found in production and not before it |
| DORA measures | Four widely used measures of software delivery: deployment frequency, lead time, change failure rate and time to restore |
| Effort-saving mode | Using AI to do the same work in the same way with less personal effort |
| Feature flag | A switch that turns a feature on or off in production without a new release |
| Flow efficiency | The share of elapsed time in which someone is actively working on an item |
| Goodhart's law | When a measure becomes a target, it stops being a good measure |
| Mutation testing | Deliberately introducing small faults into code to check that the tests notice |
| Ownership rules | Repository settings that require named people to approve changes to particular paths |
| Progressive delivery | Releasing gradually, with automatic checks and rollback, to limit the impact of a bad change |
| Redesign mode | Reorganising how work is specified, checked and released so that AI sets the pace |
| Review by risk | Matching the depth of human review to how much damage a faulty change could do |
| Rework rate | The share of changes that exist to fix other recent changes |
| Rollback | Undoing a release and returning to the previous version |
| SPACE | A framework for developer productivity covering satisfaction, performance, activity, communication and efficiency |
| Spec-first | Writing and reviewing a precise specification before any code is generated |
| Theory of constraints | The management principle that improvement effort belongs at the bottleneck |
| Throughput | The amount of finished work delivered per unit of time |
| Value stream | The full sequence of steps a piece of work goes through, from idea to customer |
| Work in progress (WIP) | Work that has been started and not finished |

## Sources

Figures for the studies cited in section 2 were checked against these reports of them.

- [Report: AI tools slow down experienced developers by 19%](https://diginomica.com/node/29061), diginomica, on the METR randomised trial: 16 developers, 246 tasks, 19% slower, a forecast of 24% faster
- [METR study coverage](https://texxr.com/887839/mets-study-finds-ai-tools-slow-open-source-devs), for the participants' belief afterwards that they had been 20% faster
- [DORA 2024: AI and platform engineering fall short](https://thenewstack.io/dora-2024-ai-and-platform-engineering-fall-short/), The New Stack, for the 1.5% throughput and 7.2% stability figures
- [DORA 2024](https://redmonk.com/rstephens/2024/11/26/dora2024/), RedMonk, for the same figures and the contrast with self-reported productivity
- [The bottleneck AI coding assistants moved rather than removed](https://thinkpieces.stavros.io/posts/the-bottleneck-ai-coding-assistants-moved-rather-than-remove/), for the DORA 2025 update and the 55.8% controlled-experiment result

The remaining figures in this part, including the speed-up ceiling table, are arithmetic or illustrative.

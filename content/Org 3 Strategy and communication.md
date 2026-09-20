# Part 3: Strategy, Risk and Communication

2026-09-18 · Chris Neale

## About this part

Part 3 covers the decisions that sit above the team, and how to talk about everything in this course to people who have not read it. Part 2 ended with the constraint leaving engineering. When that happens, progress depends on procurement, legal, security, finance and senior leadership, and on your ability to make the case to each in their own terms.

Sections 1 to 4 cover the market, the build-or-buy decision, the legal and data risks, and governance. Section 5 builds the investment case from the cost model in part 3 of the language models module and the measures in part 2. Section 6 is the communication toolkit. Section 7 covers keeping all of it current.

Two reference sections follow. They consolidate this module's two-audience explanations and misconceptions, for use on their own.

A caution on sections 3 and 4. They describe the questions to ask and the shape of good answers. They are not legal advice, and the regulatory detail is correct only as of the date above. Confirm specifics with your own legal and compliance colleagues. Reading time is about 45 minutes.

## 1. The landscape

**In plain terms.** A handful of companies build the most capable models. The big cloud providers resell them. Hundreds of tool makers build products on top. Alongside them is a growing set of models anyone can download and run. The lead changes hands every few months and prices keep falling, so the sensible posture is to avoid betting everything on one supplier and to keep what you build portable. **Who should read it:** everyone.

### Four layers

| Layer | Who | What you buy from them |
| --- | --- | --- |
| Model labs | A few labs building the most capable models, mostly in the US and China | Direct API access and their own assistants and coding agents |
| Cloud platforms | The major cloud providers | The same models under your existing contract, with regional hosting |
| Tool makers | Hundreds of companies, from start-ups to established vendors | Coding assistants, review tools, support bots, search and meeting tools built on the labs' models |
| Open-weight ecosystem | Labs that publish weights, plus hosting services | Models you can run yourself or rent cheaply, as part 3 of the language models module describes |

### How the market behaves

- **The lead rotates.** The best model for coding this quarter is often not the best next quarter. Part 2 of the language models module explains why: each lab's gains arrive in steps.
- **Features converge.** A capability one vendor launches is usually matched by the others within about six months.
- **Prices fall.** Part 2 of the language models module puts the fall at around tenfold a year for a fixed level of quality.
- **Tool makers are fragile.** Many will be acquired, outcompeted by the labs or closed. Prefer tools whose configuration and data you can export.
- **Outages happen.** Every major provider has had them. Anything important needs a fallback.

### Limiting lock-in

Total independence is not worth its cost. A few habits keep switching affordable.

| Portable, so invest freely | Vendor-specific, so invest with care |
| --- | --- |
| Your eval sets | Fine-tuned models |
| Instruction files and specifications | Proprietary agent features and workflow builders |
| MCP servers for your internal systems | Prompts tuned tightly to one model's quirks |
| Your verification stack and test suites | Data held only inside a vendor's product |
| Clean, current documentation |  |

An eval set, which [part 9 of the practical AI module](file/7a3f2c68-91de) covers, matters most. With it, switching models is an afternoon's test and a configuration change. Without it, every switch is a leap of faith, which in practice means you never switch.

A practical arrangement is one primary vendor, a second under contract and tested, and most tools configured so that the model behind them can be changed.

## 2. Build, buy or wait

**In plain terms.** For general productivity, buy a product. Where the value lies in your own data and processes, assemble something from vendor models and your own context. Building or training your own models is almost never right. Waiting is reasonable for a specific product in a fast-moving niche, and costly as a general stance, because what you lose is a year of learning how to work differently. **Who should read it:** everyone.

| Option | What it means | Right when |
| --- | --- | --- |
| Buy | Off-the-shelf products: coding agents, chat assistants, review tools, support tools | The need is common to most companies and the product works with your systems |
| Assemble | Vendor models through an API, plus your own context, tools, guardrails and evals, which [the practical AI module](file/f3a91c20-6d4e) covers | The value comes from your data, your domain rules or your workflow |
| Build | Fine-tuned or self-hosted models, or an internal AI platform | You have a narrow, very high-volume task, or a hard data constraint. See part 3 of the language models module |
| Wait | Defer this purchase | The need is modest and the products in that niche are changing every quarter |

### Five questions

1. **Is this a differentiator?** If every competitor can buy the same thing, buy it too and move on. Spend your own engineering where you are different.
2. **Where does the value come from?** If it comes from your data and domain knowledge, assemble. No vendor has those.
3. **Will a vendor ship this within six months?** If so, a custom build will be obsolete before it pays back.
4. **How deep must the integration go?** Deep integration with internal systems favours assembling, with MCP servers as the reusable part.
5. **What would it cost to leave?** Check it against the portability table in section 1.

### Waiting has a cost

It is sensible to defer a particular product. It is a mistake to defer the change in working practices from part 2. Those take a team months to learn, and the learning does not come bundled with next year's better model. A team that starts a year later starts a year behind on the part that is hardest to buy.

## 3. Data, IP and legal risk

**In plain terms.** Four questions cover most of the risk. Will the vendor train on our data? Where does our data go, and for how long? Who owns what the AI produces? Which rules apply to us? On business contracts the answers are mostly reassuring. The real exposure is usually staff using personal accounts on free tools, where none of those protections apply. **Who should read it:** everyone can read the main text. The deep dives are for whoever handles procurement and compliance.

### The product tier decides the terms

The same model is sold under very different terms depending on how you buy it.

| Tier | Typical position on training with your data | Typical controls |
| --- | --- | --- |
| Free and personal consumer plans | May be used for training unless the user opts out | Few. No organisational oversight |
| Team and enterprise plans | Not used for training by default | Admin console, single sign-on, audit logs, retention settings |
| API and cloud platform access | Not used for training by default | Contractual data processing terms, regional hosting, retention options |

Part 1 of the language models module explains that a model does not learn from your conversations as you type. Whether a vendor may later train on them is a matter of contract, and this table is where it is decided.

### Shadow AI is the real leak

If approved tools are missing, slow to arrive or worse than the free ones, people use personal accounts. Source code, customer details and credentials then pass under consumer terms that nobody reviewed. The remedy is not a ban, which only hides the practice. It is to provide good approved tools quickly, which section 4 covers.

### What goes into prompts

Personal data sent to a model is processed by a third party, and data protection law applies in the usual way: a lawful basis, a processing agreement, data minimisation and attention to international transfers. For most engineering work the simple answer is to keep real customer data out of prompts. Use synthetic or masked data in development, and keep production data behind tools that enforce access control, as [part 7 of the practical AI module](file/c9146f3b-27a8) describes.

Secrets are a separate matter. Credentials should never appear in a prompt or sit in a repository that an agent reads. [Part 9 of the practical AI module](file/7a3f2c68-91de) explains how to inject them at the tool layer.

### Who owns the output

Vendors' business terms generally assign the output to you, and several offer indemnity against copyright claims arising from it, subject to conditions. Whether copyright exists at all in purely machine-generated material is unsettled and differs by country. For internal code this rarely matters. It deserves legal attention if you license code to others, or if ownership of the code is a material asset in a sale or investment.

A smaller risk is reproduction. A model can occasionally emit a passage close to something in its training data, which may carry a licence. Several tools can filter or flag output that matches public code. Turn that on, and keep your existing licence scanning.

### Sector rules still apply

Regulators hold the licensed business responsible for outcomes, whatever produced them. In iGaming that covers safer-gambling interactions, anti-money-laundering controls, fairness of games and the handling of player data. "The AI did it" is not a defence. This is the practical reason for keeping regulated logic in the high-risk review tier from part 2, and for an audit trail.

Check each vendor's acceptable use policy too. Some include restrictions that touch gambling-related uses, and it is better to find that during procurement than afterwards.

### Deep dive (optional): reading enterprise AI terms

A checklist for the contract and the data processing agreement.

- **Training.** Are our inputs and outputs excluded from model training by default, without an opt-out step?
- **Retention.** How long are prompts and outputs kept? Is a zero-retention option available, and what does it disable?
- **Human access.** Can vendor staff read our content for abuse monitoring or support, and under what controls?
- **Location.** Where is data processed and stored? Which regions can we pin it to? Who are the sub-processors?
- **Transfers.** What mechanism covers transfers out of the UK or EU?
- **Security.** Which certifications are held, such as SOC 2 and ISO 27001? What are the breach notification terms?
- **Output rights.** Is ownership of output assigned to us?
- **Indemnity.** Is there intellectual property indemnity for output, and which conditions void it, such as switching off filters?
- **Model changes.** How much notice is given before a model version is retired? Part 2 of the language models module explains why versions need pinning.
- **Service levels.** What uptime commitment, what remedies, and what cap on liability?
- **Acceptable use.** Are there sector restrictions that affect us?

Apply the same checklist to tool makers from section 1, and add one question: which model providers does the tool send our data to, and under what terms?

### Deep dive (optional): the regulatory picture at the time of writing

**European Union.** The AI Act applies in stages, and it matters if you serve EU customers. Prohibited practices and obligations on providers of general-purpose models already apply. Transparency duties, such as telling people when they are dealing with an AI system, have applied since 2 August 2026. The obligations for stand-alone high-risk systems were deferred by an amending regulation that took effect in July 2026, and now apply from 2 December 2027. High-risk AI embedded in regulated products follows on 2 August 2028. High-risk categories include recruitment and credit scoring. Most internal engineering use falls outside them. Customer-facing automated decisions deserve a proper assessment.

**United Kingdom.** There is no single AI statute. Existing regulators apply existing law to AI within their remits. Data protection law, including its rules on solely automated decisions with significant effects, is the most relevant general regime, alongside consumer protection and equality law. Sector regulators, including the gambling regulator, expect licensees to manage the risks of any technology they use.

**In practice.** Keep a simple register of where AI is used, on what data and for what decisions. It answers most regulators' first questions, and it is the basis for deciding which uses need a formal assessment. Anything that makes or materially shapes decisions about individual customers should go to compliance before it is built.

## 4. Governance that does not kill adoption

**In plain terms.** Good governance makes the safe way the easy way. If getting an approved tool takes three months, people will use unapproved ones within three days. A one-page policy based on the kind of data involved, a short list of approved tools, and a fast route for approving new ones do more for safety than a thick rulebook nobody reads. **Who should read it:** everyone.

### Rules by data class

| Data class | Examples | Where it may go |
| --- | --- | --- |
| Public | Open-source code, published documentation, marketing copy | Any tool |
| Internal | Source code, internal documents, tickets, architecture | Approved tools on business terms only |
| Confidential | Player personal data, financial records, security findings, unreleased commercial plans | Approved tools with a data processing agreement and regional hosting, and only where there is a defined need |
| Restricted | Credentials, payment card data, identity documents | Never in a prompt. Handled only by tools that inject or mask them |

Four rows that people can remember are better than forty they cannot.

### The one-page policy

- which tools are approved, and for which data classes
- the rule on personal accounts: not for anything above public
- the ownership principle from part 2: whoever merges it owns it
- the review-by-risk tiers, by reference
- what to do if something goes wrong, and that reporting it is blame-free
- who to ask, and how long an answer takes

### A fast approval route

New tools appear every week, and some will be worth having. Publish a route with a stated turnaround, such as two weeks, using the checklist from section 3. Offer a lighter path for trials on public or synthetic data. Speed here is a security control, because it removes the reason for shadow AI.

### Agents and integrations

[Part 9 of the practical AI module](file/7a3f2c68-91de) sets out the controls. Governance decides who signs them off.

- An allow-list of MCP servers, with an owner for each.
- Default credentials that are read-only and narrowly scoped.
- Any agent with write access to production, customer communication or money movement requires a named owner, an approval gate and a review by security.
- The AI use register from section 3 is kept current.

### Keep it small

A working group of four or five people, from engineering, security, legal or compliance and one business function, meeting fortnightly, will outperform a large committee. Give it authority to approve. Review the policy each quarter, because the tools will have changed.

### Measure governance too

Track the time taken to approve a tool, the share of staff with access to an approved tool, and the number of exceptions requested. If approvals are slow or exceptions are frequent, the policy is pushing people around it.

## 5. The investment case

**In plain terms.** The tools themselves are cheap. The real investment is people's time: learning new ways of working and building the automatic checks that let the AI run at its own pace. The return is more delivered work, sooner, plus things that would never otherwise have been done. Ask for a quarter's funding with clear measures and a decision point, and not for a leap of faith. Do not promise headcount cuts. **Who should read it:** everyone who will make or judge the case.

### Count all the costs

An illustrative first year for a team of 20 engineers. It uses the cost model from part 3 of the language models module and a loaded cost of $500 per engineer-day. Substitute your own figures.

| Cost line | Basis | Year one |
| --- | --- | --- |
| Tools and tokens | 20 engineers at about $160 a month | $38,000 |
| Learning time | 3 days per engineer | $30,000 |
| Verification groundwork | 15% of team capacity for one quarter: tests, CI speed, rollback, ownership rules | $90,000 |
| Champions | 2 people at 10% for the year | $22,000 |
| Governance, security and legal review | Estimate | $10,000 |
| Total |  | $190,000 |

Three points stand out. Tools are a fifth of the total. The largest line is the verification groundwork from part 2, and it would have been worth doing without AI. The total is about 9% of what the team costs in a year, which is $2.2 million on these assumptions.

### Three scenarios for the return

| Scenario | What happens | Gain in delivered work | Value against a $2.2M team |
| --- | --- | --- | --- |
| Effort-saving only | Tools rolled out, process unchanged. Coding is 1.3 times faster and is a quarter of cycle time | About 6% | $130,000 |
| Partial redesign | The main constraint is widened, and review by risk covers the low tier | About 20% | $440,000 |
| Full redesign | Spec-first work, background agents and a trusted assurance stack across the team | About 40% on suitable work | $880,000 |

The first scenario does not pay back the investment in year one. This is the most useful row in the case. It tells leadership that buying licences alone yields a marginal return, and that the return lies in the process change. It also keeps the ask honest.

The percentages are planning assumptions and not forecasts. Replace them with your own baseline and pilot results as they arrive.

### Benefits beyond throughput

- deferred migrations and debt items completed, with their named risk reductions
- test coverage and release safety improved, visible in the change failure rate
- shorter time from idea to live experiment
- stronger hiring and retention, because good engineers want to work this way
- an organisation that learns the new practices early

### Ask for a staged bet

Match the request to the 90-day plan in part 2.

1. **Quarter one.** Fund the tools, learning time and verification groundwork. State the baseline, the constraint you will attack and the measures you will report.
2. **Decision point.** Show the before-and-after measures and the signature from part 2, section 7. Continue, adjust or stop.
3. **Quarters two to four.** Extend to the whole team and the neighbouring functions, funded against results.

This lowers the risk for the sponsor. It also commits you to measurement, which protects you from the perception gap described in part 2.

### What not to promise

- **Headcount reduction.** It poisons adoption, and it is rarely what happens. Demand for software expands to absorb the capacity.
- **A specific multiplier.** Offer a range with a measured baseline.
- **Immediate gains.** Expect a dip in the first weeks.
- **Zero risk.** Promise a deliberate, monitored level of risk.

### Deep dive (optional): the total cost of self-hosting

Part 3 of the language models module gives the headline: a server for a large open model rents for $15,000 to $20,000 a month, and internal traffic keeps it under 20% utilised. A full comparison adds the lines that are easy to forget.

| Cost line | Self-hosted | API or cloud platform |
| --- | --- | --- |
| Compute | Fixed, around the clock, whatever the usage | Pay per token |
| Engineering | Roughly half an engineer to one engineer for the serving stack, upgrades and on-call | None |
| Model evaluation | Each new open model must be tested and deployed by you | The vendor upgrades, and you re-run your evals |
| Quality gap | Open models trail the best closed ones by months. Price that as lower success rates on hard tasks | The best closed models |
| Capacity planning | Peaks need headroom, so average utilisation falls further | Elastic, within rate limits |
| Security and compliance | Entirely yours, which is the point if that is the requirement | Shared, under contract |

On these lines, self-hosting rarely wins on cost below very large, steady volumes. Where it is chosen, it is chosen for control. Present it that way, as the price of a constraint, and test first whether a cloud contract with regional hosting and zero retention would satisfy the same constraint for far less.

## 6. The communication toolkit

**In plain terms.** Different audiences care about different things, and the same facts need different openings. Executives want outcomes, risk and cost. Engineers want honesty about limits and respect for their craft. Sceptics want evidence, and enthusiasts want realism. This section gives an approach for each and rehearsed answers to the questions you are most likely to face. **Who should read it:** everyone.

### Audiences

| Audience | Cares about | Lead with | Avoid |
| --- | --- | --- | --- |
| Executives and directors | Delivery, risk, cost, competitive position | The outcome and the staged ask from section 5 | Mechanics, model names, tool enthusiasm |
| Finance | Total cost, payback, predictability | The full cost table and how spend is capped | A licence count presented as the whole cost |
| Product | Speed of learning, scope, quality | Prototypes in days and more experiments | Implying that engineering no longer needs clear requirements |
| Security and compliance | Data, access, auditability, accountability | Data classes, review by risk, the audit trail | Asking for blanket approval |
| Engineers | Craft, quality, autonomy, job security | Honest limits, what the gains will be used for, their part in designing the checks | Hype, quotas, vendor statistics |
| Sceptics | Evidence and failure modes | The studies in part 2, including the unflattering ones, and your own baseline | Dismissing their concerns. They are often right about specifics |
| Enthusiasts | New capability and speed | The constraint and the assurance stack | Letting enthusiasm skip the groundwork |

### Three habits for any audience

- **Consequence before mechanism.** Say "long documents make it less accurate, so we give it the right ten pages", and explain attention only if someone asks.
- **Agree with the true part first.** Every misconception in this course contains one, which is why each entry begins with it.
- **Say what you do not know.** Nobody can forecast this field two years out. "We re-test every quarter" is a stronger position than a confident prediction.

### Hard questions

**"Will this replace developers?"** It replaces much of the typing and little of the job. The scarce work is deciding what to build, specifying it precisely and judging whether the result is right and safe. Those matter more now. I expect the same people to deliver considerably more, and the role to move towards direction and verification.

**"Then why can't we cut the team?"** We could bank the gain as cost, once. Or we could use it to ship what is stuck in the backlog and clear the debt that slows us down, which compounds. Competitors have the same tools, so the advantage goes to whoever delivers more with them. Cutting first also ends adoption, because nobody improves a process that removes their own job.

**"Is our data safe?"** On our business contracts the vendor does not train on our data, retention is limited and hosting is regional. We classify data and keep the sensitive classes out of prompts. The real risk is people using personal accounts, so we make sure the approved tools are good and quick to obtain.

**"Why did it get this wrong?"** It rebuilds answers from patterns and does not look them up, so where its knowledge is thin it produces something plausible. That is inherent, and it is getting rarer. We manage it as we would a capable new hire: give it the source material, check in proportion to the stakes and automate the checks where we can.

**"A competitor says half their code is written by AI."** That figure measures typing, not delivery. A team can reach it and ship no sooner. Ask what happened to their cycle time and their failure rate. Those are the numbers I will report for us.

**"Why are we not moving faster on this?"** We can hand out licences tomorrow, and we would gain about 6%. The large gains need automatic checks we can trust, so that people are not reading every line. We are building those this quarter, and that is what unlocks the rest.

**"How do we know it is working?"** We took a baseline before we started. We report cycle time, finished work, review wait and failure rate against it each month, with the cost beside them.

### Deep dive (optional): fielding the AGI question

Sooner or later a meeting turns to whether AI will surpass people, take every job or pose an existential danger. You will not settle it, and you do not need to.

Acknowledge that serious, well-informed people disagree widely, both on timescales and on risk, and that you hold your own view loosely. Then bring it back to the decision in the room. The plan in this course does not depend on the answer. If progress is fast, a team that has learned to direct and verify AI work is best placed. If progress stalls, the same team has better tests, faster releases and cleaner code. Re-testing every quarter, and keeping people accountable for outcomes, holds up either way.

A useful closing line is: "I can't tell you where this ends. I can tell you what it can do for us this quarter, how we will check, and that we will look again in three months."

## 7. Staying current

**In plain terms.** This field changes every few months, and most of the commentary is noise. You do not need to follow all of it. You need a few reliable sources, a quick way to test new models against your own work, and a quarterly habit of asking what is now possible that was not before. **Who should read it:** everyone.

### What to follow

- **Vendor release notes and system cards** for the models you use. They are primary sources, and the limitations sections are candid.
- **One or two independent evaluators** who test models on realistic tasks and publish their methods.
- **Practitioner write-ups** from engineers describing real workflows, including what failed. They are worth more than any launch event.
- **Your own eval results.** On the question that matters to you, they are the most reliable source there is.

Skip the daily news cycle, social media benchmark claims and anything that promises a revolution by a given date.

### Assessing a new model in an afternoon

1. Read the release notes and system card for price, speed, context length, training cutoff and known limitations.
2. Run your eval set under the same conditions as your current model, three runs per case.
3. Compare success rate, cost per task and latency. Read the failures, not only the scores.
4. Give it three tasks from your "not worth it before" list, or that the current model could not do. New capability shows up here first.
5. Decide whether to switch now, switch for some task types, or wait. Record the result, so that the next comparison has a history.

### The quarterly review

Once a quarter, with the working group from section 4, take an hour over four questions.

- **What can the tools do now that they could not three months ago?** Re-test two or three things that failed.
- **Where is our constraint now?** It will have moved.
- **Are the risk tiers still right?** Stronger verification may justify moving some work down a tier. An incident may justify moving some up.
- **What is still on the "not worth it before" list, and what should we add?**

### What would change the picture

Most announcements change little. A few developments would justify rethinking your plans:

- agents that reliably complete tasks lasting days, where today the limit is hours
- dependable long-term memory across sessions
- a further collapse in the cost of top-tier capability
- a serious security incident that reveals a new class of attack on agents
- regulation that reaches your use cases directly

### In closing

The course makes one argument. These systems are statistical machines with known strengths and predictable failure modes. Because the failures are predictable, you can build checks that do not depend on a person reading everything. Once you have those checks, you can let the AI work at its own pace, reorganise the team around direction and verification, and take on work that was never worth attempting. The tools will keep changing. Understanding the mechanism, measuring honestly and redesigning the work will serve you through every change.

## Core explanations

The seven ideas from this module that you will explain most often, each in one line for a non-technical listener, with the part that holds the detail. The complete two-audience tables remain at the end of each part. The language models module and the practical AI module keep lists of their own.

| Idea | Say it like this | Part |
| --- | --- | --- |
| Whole-process gain | Making one step instant helps only as much as that step mattered, and coding is a small step. We improve the whole line | 1 |
| AI first-pass review | A tireless first reader checks everything, so that people read only what needs a person | 1 |
| The oracle problem | Ask it to test the code against itself, and it will confirm that the code does what it does. Tests come from what the code should do | 1 |
| Effort-saving vs redesign | Doing the same job with less effort, versus changing the job so that the AI's speed reaches the customer | 2 |
| The constraint | The narrowest part of the pipe decides the flow. Speeding up anything else makes a bigger puddle in front of it | 2 |
| Assurance stack | Many automatic safety nets, so that people check only what truly needs a person | 2 |
| Review by risk | Our experts look hardest at payments and player data and lightly at internal tools, in place of reading everything equally | 2 |

## Misconceptions quick reference

The seven misconceptions from this module, each with a one-line response. Every one contains some truth, so open by agreeing with that. The full entries, with what is true and what is misleading, are in parts 1 and 2.

| Claim | Short response | Part |
| --- | --- | --- |
| "AI in software development means AI writing the code" | Writing code was never the slow part. We use AI along the whole line, starting where our work waits longest | 1 |
| "We have an AI reviewer now, so review is covered" | It does the first pass on everything, so people review design and risk. We track how many of its comments are acted on | 1 |
| "The AI wrote tests and they all pass, so the code works" | We generate tests from what the code should do, and break the code on purpose to check that the tests notice | 1 |
| "AI makes everyone a 10x developer" | It makes typing ten times faster, and typing is a quarter of delivery. The gain comes from changing the rest | 2 |
| "Percentage of AI-written code shows success" | That shows the tool is open. I report whether finished work arrives sooner and fails less | 2 |
| "Reviewing every line is the safe option" | Nobody reviews a thousand lines well. We move safety into automatic checks and keep experts for what counts | 2 |
| "Juniors no longer need fundamentals" | The tools raise the floor, and raise the value of judgement more. Judgement rests on fundamentals | 2 |

## Glossary

Terms introduced in this part, in plain language and in alphabetical order. Earlier terms are defined in the glossaries of parts 1 and 2, and of the practical AI and language models modules.

| Term | Meaning |
| --- | --- |
| Acceptable use policy | A vendor's rules on what its service may and may not be used for |
| AI use register | A simple record of where AI is used in the organisation, on what data and for what decisions |
| Audit log | A record of who did what and when, kept for security and compliance |
| Cloud platform | A major cloud provider's service that offers several vendors' models under one contract |
| Data class | A category of information, such as public, internal, confidential or restricted, that determines how it may be handled |
| Data processing agreement | The contract governing how a supplier handles personal data on your behalf |
| Data residency | A commitment about the countries or regions in which data is stored and processed |
| EU AI Act | The European Union's law regulating AI systems according to risk, applying in stages |
| General-purpose model | In the EU AI Act, a model that can serve many uses, such as an LLM. Its provider carries specific obligations |
| High-risk system | In the EU AI Act, an AI system used in listed sensitive areas such as recruitment or credit, subject to the strictest duties |
| Indemnity | A supplier's promise to cover certain legal costs, for example copyright claims over AI output |
| Loaded cost | The full cost of an employee, including salary, taxes, benefits and overheads |
| Lock-in | Dependence on one supplier that makes switching costly |
| Payback | The time taken for the benefits of an investment to cover its cost |
| Portability | How easily what you have built can move to a different supplier |
| Retention | How long a supplier keeps your data |
| Shadow AI | Use of AI tools that the organisation has not approved, often through personal accounts |
| Single sign-on | Logging in to a tool with your company identity, so that access can be controlled centrally |
| Staged bet | Funding released in steps, each dependent on measured results from the step before |
| Sub-processor | A third party that a supplier uses to help process your data |
| System card | A vendor's published report on a model's capabilities, limitations and safety testing |
| Total cost of ownership | Every cost of having something, including people, operations and risk, not only the purchase price |
| Zero data retention | An arrangement in which the vendor stores none of your prompts or outputs after responding |

## Sources

The EU AI Act dates in section 3 were checked against these pages. Figures in section 5 are illustrative arithmetic built on the cost model in part 3 of the language models module.

- [EU AI Act's High-Risk Deadline: Deferred, Not Cancelled](https://labs.cloudsecurityalliance.org/research/csa-research-note-eu-ai-act-high-risk-deadline-omnibus-20260/), Cloud Security Alliance, for the amending regulation's entry into force on 27 July 2026 and the new dates of 2 December 2027 and 2 August 2028
- [EU AI Act Omnibus Agreement: Postponed High-Risk Deadlines and Other Key Changes](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/), Gibson Dunn, for the transparency obligations applying from 2 August 2026
- [Law delaying EU's 'high-risk' AI rules finalised](https://www.pinsentmasons.com/out-law/news/law-delaying-eu-high-risk-ai-rules-finalised), Pinsent Masons

The description of the UK position is general and was not checked against a current source. Confirm it, and anything specific to gambling regulation, with your compliance team.

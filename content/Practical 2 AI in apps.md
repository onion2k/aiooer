# Part 2: AI in Apps

2026-09-20 · Chris Neale

## About this part

This is the second of nine parts in the practical AI module. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). The format is the same as elsewhere: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 25 minutes.

[Part 1](file/b4e9d0a7-3c81) was about the window you go to. This part is about the AI that comes to you: the summarise button in your mail, the assistant in the corner of your documents, the suggestion in your editor, the reply the support tool drafted before you opened the ticket. Most people in an organisation now meet far more AI this way than in any chat window, and meet it without ever choosing to.

### What part 2 gives you

Part 2 builds one idea: in an app, someone else wrote the prompt. The vendor chose the model, the instructions and, most importantly, what context it is given about you and your work. That is why an in-app feature can be startlingly good at the one thing it was built for and useless a step outside it, and it is why judging one is a different skill from using a chat window well.

## 1. What an in-app feature is

**In plain terms.** It is a chat assistant with the conversation already written for you. The vendor decided the model, the standing instructions and what the model is allowed to see, and gave you a button instead of a message box. You supply the click and, at most, a sentence. **Who should read it:** everyone.

### What was decided for you

| In a chat window | In an app |
| --- | --- |
| You pick the model and the mode | The vendor picked, and may change it without telling you |
| You write the instructions | The vendor wrote them, and you cannot read them |
| You choose what to supply | The app supplies your document, thread, ticket or file automatically |
| You see the whole conversation | You see a result |
| You choose the account and terms | Your organisation's contract with that vendor governs it, if it has one |

The third row is the one that matters most, and it cuts both ways. An in-app feature usually has better context than you would have given it by hand: your actual document, the whole thread, the customer's history, the file you have open. That is why the summary of a meeting inside the meeting tool is often better than the one you would get by pasting a transcript into chat. It is also why the same feature knows things about you that you did not consciously hand over.

### Four kinds you will meet

- **Writing aids.** Rewrite, shorten, change the tone, fix the grammar, suggest the next sentence. In mail, documents, chat apps, forms.
- **Summaries and catch-ups.** What happened in this thread, this meeting, this channel, while you were away.
- **In-app assistants.** A panel you can ask questions of, which can see your data in that product: "what did we agree with this customer", "which deals slipped".
- **Agents inside the product.** They act: triage the ticket, draft and send the reply, fill in the fields, open the pull request. [Part 5](file/1d8f42a6-b93e) covers what an agent is; the difference here is that you did not build it and cannot see its instructions.

The four are in rising order of usefulness and of risk, and they arrive in that order in most products.

## 2. Why they behave differently

**In plain terms.** An in-app feature is tuned narrowly, so it is often better than chat at its one job and much worse just outside it. It also gives you fewer ways to correct it: there is no conversation to steer, and often no way to say "not like that". **Who should read it:** everyone.

### Better inside the lines

The vendor knows what you are trying to do, which is an advantage no general assistant has. A summarise button in a ticketing tool has been given the ticket, the customer, the history and a prompt written by people who watched a thousand tickets. Expect it to beat a paste into a chat window for that job.

### Worse outside them

Ask the same feature to do something half a step away and it will often still answer, in the same confident voice, having been given neither the right context nor the right instructions. The failure is quiet: you cannot see that the prompt did not fit, only that the result reads plausibly.

### Less room to steer

Chat gives you a conversation: say what is wrong and try again. Most in-app features give you a button, a regenerate, and sometimes a sentence of guidance. When the output is not right, you usually cannot find out why, because the instructions and the context are both invisible. The practical answer is to know which jobs the feature is good at, use it for those, and go to a chat window or a purpose-built tool for the rest.

### They change under you

The vendor can swap the model, rewrite the prompt or widen the context without a release note. A feature you tested in March may behave differently in September. That is an argument for measuring what matters on a schedule rather than once, which is section 4.

## 3. What they are good for

**In plain terms.** They are at their best on work that is small, frequent, tied to the thing in front of you, and easy to check at a glance. They are at their worst when the cost of a quiet mistake is high and nobody is really reading. **Who should read it:** everyone.

### Where they earn their place

- **Catching up.** A thread of forty messages, a meeting you missed, a channel after a week away. You can check the summary against the thread in seconds if something looks off.
- **First drafts in place.** A reply, a description, a release note, a summary field nobody enjoys filling in.
- **Tidying.** Grammar, tone, length, formatting, translation.
- **Finding.** Asking your own documents or tickets a question, instead of remembering the right keyword. [Part 8](file/0b8e5d17-f4c2) explains what is happening underneath.
- **The dull middle of a process.** Suggesting the category, the priority, the tags, the linked issue, with a person confirming.

The pattern is that the material is right there, the answer is quick to sanity-check, and a mistake costs a moment.

### Where they do not

- **Anything where a quiet error is expensive** and nothing downstream would catch it: figures in a report, terms in a contract, a clinical or legal detail.
- **Work that needs your judgement about people**: appraisals, references, anything about a colleague or a candidate.
- **Decisions dressed as summaries.** A summary that drops the one dissenting voice in a thread has made a decision for you and not told you.
- **Anything the feature cannot see the context for.** If it has half the story, it will answer from half the story.

### The summary problem, in particular

Summaries are the most-used in-app feature and the easiest to over-trust, because there is nothing obviously wrong with a fluent summary of something you did not read. What a summary loses is the outlier: the one objection, the caveat, the person who said "only if". For a catch-up that is fine. Before acting on something that matters, open the thread.

## 4. Judging one

**In plain terms.** Vendors publish striking figures about their own AI features, and those figures are usually produced by a firm the vendor paid. That does not make them false; it makes them not yours. The only number worth planning with is the one you measure on your own work. **Who should read it:** anyone deciding whether to turn one on, or to pay for it.

### About those studies

The two big productivity suites both publish commissioned studies with large returns: figures such as 9 hours saved per user per month, or 105 minutes a week, with returns on investment from tens of per cent into the hundreds. The pattern is worth knowing. They are typically Total Economic Impact studies written by an analyst firm for the vendor, built on a composite organisation assembled from interviews rather than on one real deployment, with the assumptions chosen by people who want a good answer. The spread inside them tells its own story: one of those studies reports a range from 52% to 468% depending on how deeply the thing was adopted, which is another way of saying the result depends almost entirely on what the customer does.

This is the course's fourth idea in the wild. [Part 9](file/7a3f2c68-91de) sets out how to measure an AI feature properly, and [part 2 of the AI in the organisation module](file/3e89a4fc-a0bc) has the evidence on how badly people judge their own productivity gains. For an in-app feature the cheap version is:

1. **Take the figure before.** How long the job takes now, how often it comes back, how often it is wrong.
2. **Turn it on for some people and not others,** for a few weeks.
3. **Compare the outcome, not the usage.** Tickets resolved, not AI suggestions accepted.

That is a fortnight's work and it beats any commissioned study for your purposes, because it is about you.

### The questions to ask before turning one on

- **What does it see?** Which of our data reaches the model, and does that match what those documents are allowed to touch?
- **Where does it go, and is it kept?** Is it covered by our existing contract with this vendor, or is this a new processor?
- **Does it train on our data?** What is the default, and did anyone change it?
- **Who can use it?** Does it respect the permissions of the person asking, or does it answer from everything the connector can reach? This is the retrieval trap from [part 8](file/0b8e5d17-f4c2), and it is the commonest serious mistake in in-app assistants.
- **What can it do, not just read?** A feature that drafts is very different from one that sends.
- **How would we know it got worse?** Since the vendor can change it silently.

### The permissions trap, in particular

An assistant indexed with a broad connector will happily answer from documents the person asking should never have seen. It is a data breach with a friendly interface, and it usually arrives not through malice but through a connector set up once, generously, to make a demonstration work. Ask specifically whether results are filtered by the asker's own access at the moment of asking.

## 5. Living with them

**In plain terms.** These features arrive whether or not anyone decided to adopt them, often switched on by default in an update. The useful posture is neither banning them nor ignoring them: know which are on, make the approved path the easy one, and check the ones that act. **Who should read it:** everyone. Leaders should read all of it.

### They arrive on their own

Most organisations discover an in-app AI feature after it has been on for a month. Vendors ship them enabled, and an update to a tool you already pay for is not a procurement event. The result is a set of AI features nobody chose, which is the same shape of problem as the personal accounts in [part 1](file/b4e9d0a7-3c81), arriving from the opposite direction: there, people went round the organisation; here, the organisation's own software brought AI in through the front door.

### What actually works

- **Know what is on.** A list of the AI features live in the tools you already pay for, and who turned them on. Most organisations cannot produce this, and it is a morning's work.
- **Make the approved path the easy one.** People use unapproved tools because the approved one is slower, worse or fenced off. That is a product problem, not a discipline problem.
- **Gate the ones that act.** A feature that drafts can be left alone. A feature that sends, posts, merges, deploys or spends needs the approval gates from [part 9](file/7a3f2c68-91de), whoever built it.
- **Decide about training.** One setting, once, per vendor, written down.
- **Re-ask on a schedule.** Once a quarter: what is new, what changed, what is still worth paying for.

### When to use the app's AI, and when your own

| | Use what the app gives you | Build your own |
| --- | --- | --- |
| The job | Ordinary, inside the app's own domain | Yours, across systems, or your competitive difference |
| The context it needs | Already in that product | Spread across several, or in your own data |
| The bar | A person glances at it | It must be measured, logged and defended |
| The cost | A seat you already pay for | Real engineering, and the rest of this module |

Most work belongs in the left column, and saying so is not defeatism. The engineering in parts 3 to 9 is worth its cost when the job is yours, repeated, and consequential. When it is a summary of a thread, take the button.

### The whiteboard version

In an app, someone else wrote the prompt and chose what the model can see. That makes these features good at their one job, quietly bad just outside it, and hard to steer when they are wrong. They arrive switched on. Know which are live, trust the vendor's figures no further than your own measurement, ask what each one can see and what it can do, and gate the ones that act.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| In-app AI | A vendor-authored prompt over a vendor-chosen model with product context injected automatically | The AI built into software you already use. Someone else wrote its instructions |
| Context advantage | The feature is given the working object and its history without the user assembling it | It can already see the document, the thread and the customer, so it starts better informed than a chat window |
| Narrow tuning | Optimised for a single task, with no conversation to steer it back | Excellent at its one job and quietly poor a step outside it |
| Silent change | The vendor may alter model, prompt or context without a release note | It can change under us, so we re-check the things that matter |
| Vendor study | A commissioned analysis over a composite organisation, with assumptions set by the sponsor | Their numbers, from their consultants, about a company that does not exist. Useful as a prompt to measure our own |
| Permission-aware retrieval | Results filtered by the asking user's access rights at query time | It must only answer from documents that person is allowed to read |
| Shadow adoption | Features enabled by default in existing tools, outside any procurement decision | AI that arrived in an update, that nobody chose |

## Misconceptions to correct

### "The AI in our tools is safer, because we already use those tools"

**True:** an existing vendor is already under contract, already assessed, and already holds much of the data, so the ground is better than a personal account somewhere new.

**Misleading:** a new AI feature can mean a new processor, a new default about training, and a far wider reach across your data than the product had before. The contract you signed may predate all of it.

**What to say:** "Being an existing supplier is a good start, not an answer. For each AI feature we ask what it can see, where that goes, and whether it trains on it."

### "The vendor's study shows it pays for itself"

**True:** these features do save time, and the studies are not invented.

**Misleading:** they are commissioned by the vendor, modelled on a composite organisation, and swing by a factor of ten depending on how the customer adopts. They are marketing built on a real method.

**What to say:** "Their figure is about a company that does not exist. Ours takes a fortnight: measure the job now, switch it on for half the team, compare the outcome."

### "It summarised the thread, so I know what happened"

**True:** summaries are the most useful thing these features do, and usually accurate about the main thrust.

**Misleading:** a summary drops the outlier, which is often the part that mattered: the one objection, the condition, the person who disagreed. It reads exactly as confidently either way.

**What to say:** "Good enough to catch up. Before I act on it, I open the thread."

## Glossary

Terms introduced in this part, in plain language and in alphabetical order. Earlier terms are defined in part 1 and in the intro module.

| Term | Meaning |
| --- | --- |
| Composite organisation | An invented company assembled from several interviews, on which a commissioned study models its figures |
| Connector | A link that lets an AI feature reach a store of your data |
| In-app AI | An AI feature inside software you use for something else |
| Permission-aware | Answering only from what the person asking is allowed to see |
| Processor | Under data protection law, a party that handles personal data on your behalf |
| Total Economic Impact | A commissioned study format reporting a return on investment for a vendor's product |

## Sources

Read in September 2026. The productivity figures are vendor-commissioned and are quoted here as an example of what to be careful of, not as evidence of anything.

- [Microsoft 365 Copilot and Google Workspace with Gemini return-on-investment studies](https://www.microsoft.com/en-us/microsoft-365-copilot/copilot-vs-gemini-enterprise), as summarised in comparisons of the two suites, for the hours saved and the range of returns reported
- [2026 AI Adoption and Risk Report](https://www.cyberhaven.com/press-releases/cyberhaven-2026-ai-adoption-risk-report), Cyberhaven, February 2026, for how much of what reaches AI tools is sensitive

The account of how in-app features behave, what they are good and poor at, and the questions to ask before turning one on rests on the drafter's general knowledge.

# Part 2: Using It: The Basics

2026-09-20 · Chris Neale

## About this part

This is the second of three parts in the intro to AI module, which is optional and written for readers without much experience of AI. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). Reading time is about 15 minutes.

[Part 1](file/a7f20c15-9d3e) said what these tools are. This part is about sitting down with one. It covers what a conversation is, how to ask for what you want, how to check what you get, and what should never be typed in. The [practical AI module](file/f3a91c20-6d4e) takes every one of these further.

### What part 2 gives you

Part 2 builds one idea: treat it as a very capable new colleague who knows nothing about your situation. You would brief such a person properly, give them the documents, read their work before it went out, and not hand them the keys to everything on the first day. The same four habits are most of what using AI well means.

## 1. A conversation, not a search box

**In plain terms.** People who are new to AI tend to type three words, as they would into a search engine, and judge it on the first reply. It works much better as a conversation. Say what you actually want, in full sentences, and then respond to what comes back: "shorter", "more formal", "you have misunderstood the second point". **Who should read it:** everyone new to this.

### What it remembers

Within one conversation the assistant can see everything said so far, so you can build on earlier replies without repeating yourself. Between conversations it remembers nothing, unless the product has a memory feature, in which case it is re-reading notes it kept, not recalling you.

Two practical consequences follow.

- **Start a new conversation for a new topic.** Old material stays in view and gets in the way. A long, wandering conversation gives worse answers than a fresh one.
- **When it goes wrong, start again.** If it has misunderstood badly, arguing rarely helps, because the misunderstanding is still there in the conversation above. Open a new one and ask better.

### Give it the material

It does not know your document, your email thread, your spreadsheet or your code. Describing them is a poor substitute for supplying them. Paste the text in, or attach the file, and then ask. The difference in quality is large, and it is the single most common thing beginners leave out.

## 2. Asking well

**In plain terms.** The quality of what you get depends mostly on the quality of what you ask. There are no magic words. A good request says what you want, who it is for, why, and what shape the answer should take, exactly as a good request to a person would. **Who should read it:** everyone. It takes two minutes to learn and pays back for ever.

### The parts of a good request

- **The task.** One clear statement of what you want produced.
- **The situation.** Who it is for and why. "A summary" is vague. "A summary for our finance director, who has five minutes and cares about cost and risk" is not.
- **The material.** The thing to work from, pasted or attached.
- **Constraints.** Length, tone, what to leave out, what must not change.
- **The shape of the answer.** A table, three bullet points, an email, a list of questions.
- **Permission to be unsure.** "If you do not know, say so" reduces invention noticeably.

Compare two requests for the same thing.

```prompt
Write about our new returns policy.
```

```prompt
Below is our new returns policy. Write an email to customers who bought
in the last 30 days, telling them what has changed and what, if anything,
they need to do. Friendly and plain, under 150 words, no legal language.
If anything in the policy is unclear, list your questions first and do
not guess.

[the policy, pasted here]
```

The second takes a minute longer to write and saves ten minutes of going back and forth.

### Then improve it

The first reply is a draft. Say what is wrong with it, specifically: "too long", "the second paragraph is the important one, lead with that", "less cheerful". You can also ask it to help you ask: "What else would you need to know to do this well?" is one of the most useful questions there is.

[Part 3 of the practical AI module](file/f3a91c20-6d4e) turns this into a method, under the name context engineering.

## 3. Checking what you get

**In plain terms.** The reply will be fluent, well organised and confident whether or not it is right. So the polish tells you nothing. You are responsible for what you send, sign or ship, and a quick check in proportion to the stakes is part of the job. **Who should read it:** everyone. This is the habit that separates people who get value from AI from people who get embarrassed by it.

### What to check, and how hard

| What you asked for | What can go wrong | A sensible check |
| --- | --- | --- |
| Rewording, tidying, shortening your own text | Little. It may drop a nuance or change your meaning | Read it through |
| A summary of something you supplied | It can miss the point, or add something that was not there | Skim the original for the main points. Spot-check anything surprising |
| Facts, figures, dates, names | It may invent them | Verify each one that matters against a real source |
| Quotations and references | It can produce quotes nobody said, and papers, cases or links that do not exist | Open every one. Never pass on a reference you have not seen |
| Calculations | It can make arithmetic slips, especially without tools | Redo them, or ask it to show the working and use a calculator or code |
| Code | It may use functions that do not exist, or do something subtly different from what you asked | Run it. Test it. Read what it changed |
| Advice on law, health, money or safety | It may be out of date, wrong for your country, or simply wrong | Treat it as a starting point for a conversation with someone qualified |

### Useful habits

- **Ask where it came from.** If the assistant can search, ask for sources and open them. If it cannot, treat facts as unverified.
- **Ask it to check itself.** "What in this answer are you least sure of?" and "What would someone who disagreed say?" both work better than you would expect. They are not a substitute for checking.
- **Do not lead the witness.** Ask "is this right?" and it will tend to say yes. Ask "what is wrong with this?" and you will learn more.
- **Be careful where it matters.** The effort should follow the consequences. A brainstorm needs no checking. A figure in a board paper needs a source.

## 4. What not to put in

**In plain terms.** Anything you type goes to another company's computers. With a properly approved work tool that is usually fine, because a contract says what they may do with it. With a free consumer app it may not be. Know which tools your organisation has approved, and keep confidential material, personal data and passwords out of everything else. **Who should read it:** everyone.

### The short list

- **Use the tools your organisation has approved**, signed in with your work account. The protections usually depend on it. If you do not know what is approved, ask before you paste.
- **Never paste passwords, keys or credentials.** Not into any AI tool, approved or not.
- **Personal data about customers, colleagues or candidates** is covered by data protection law wherever it goes. Leave it out unless you know the tool is approved for it.
- **Confidential business material**, such as unreleased figures, contracts, source code and security details, belongs only in tools cleared for it.
- **What comes out is your responsibility.** If you send it, publish it or merge it, it is yours, whoever drafted it.

[Part 3 of the AI in the organisation module](file/bbb9efdd-e221) covers the contracts, the law and the policy behind this list.

### The whiteboard version

Talk to it in full sentences and keep talking. Tell it what you want, for whom, why and in what shape, and give it the material. Read everything before you use it, and check facts, quotes and numbers against something real. Use approved tools, and keep secrets and personal data out. It is a capable colleague who knows nothing about your situation and is sometimes wrong.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Conversation | Each reply is generated from the whole conversation so far, and nothing persists between sessions | It can see everything said in this chat, and nothing from any other |
| Prompt | The text supplied to the model, including instructions, material and earlier turns | What you ask, plus everything you give it to work from |
| Supplying material | Placing the source text in the context, so that the answer is grounded in it | Paste the document in. Do not describe it |
| Verification | Checking outputs against an independent source, in proportion to the cost of an error | Read it before you use it, and check what matters against something real |
| Approved tool | A product covered by terms on data retention, training and access | The ones work has a contract with, which say what happens to what you type |

## Misconceptions to correct

### "There is a trick to getting good answers"

**True:** how you ask makes a very large difference, and people who are good at it get much more from the same tool.

**Misleading:** the skill is not secret phrases. It is being clear about what you want and giving it what it needs, which is the same skill as briefing a person well.

**What to say:** "There are no magic words. I say what I want, who it is for and why, and I give it the material."

### "It sounded confident, so it is probably right"

**True:** most of what a good assistant says is right, most of the time.

**Misleading:** it sounds equally confident when it is wrong. Fluency and accuracy are unrelated, and the mistakes are often the specific details: a number, a name, a reference.

**What to say:** "The tone tells me nothing. I check the details that matter, every time."

### "It is just a chat, so it does not matter what I type"

**True:** with an approved tool under a proper agreement, ordinary work material is usually fine.

**Misleading:** what you type is sent to and may be kept by another company. In the wrong tool, a pasted contract or a customer list is a data breach.

**What to say:** "I use the tools we have approved, and I keep credentials, personal data and anything confidential out of the rest."

## Glossary

Terms introduced in this part, in plain language and in alphabetical order. Earlier terms are defined in part 1.

| Term | Meaning |
| --- | --- |
| Approved tool | An AI product your organisation has agreed terms with and cleared for work use |
| Attachment | A file given to the assistant to work from |
| Brief | A request that says what is wanted, for whom, why, and in what shape |
| Conversation | One continuous exchange, in which the assistant can see everything said so far |
| Memory feature | A product feature that stores notes between conversations and shows them to the model again |
| Personal data | Information about an identifiable person, which data protection law covers wherever it is sent |
| Prompt | What you give the model: your request and any material with it |
| Source | Where a fact came from, which you can open and read for yourself |

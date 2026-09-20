# Part 1: What AI Is

2026-09-20 · Chris Neale

## About this part

This is the first of three parts in the intro to AI module. The module is optional. It is for anyone who has come to the course without much experience of AI, or who uses it a little and has never been told what it is. If you use an AI assistant most days, skip to [part 1 of the practical AI module](file/b4e9d0a7-3c81), which is where the course proper begins. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). Reading time is about 15 minutes.

The three parts answer three questions. What is this thing? How do I use it without getting into trouble? What can it actually do? None of them needs any technical background.

### What part 1 gives you

Part 1 builds one idea: today's AI is software that has learned patterns from an enormous amount of human writing, and produces new writing that fits those patterns. That single fact explains why it is so capable, why it sounds so sure of itself, and why it is sometimes confidently wrong.

## 1. What people mean by AI now

**In plain terms.** "AI" has meant many things over seventy years. When people say it today they nearly always mean one kind: software you can talk to in ordinary language, which writes back. ChatGPT, Claude, Gemini and Copilot are the best-known examples. The same technology also writes code, and close relatives of it make pictures, video and music. **Who should read it:** everyone new to this.

### A few words that get mixed up

| Word | What it means |
| --- | --- |
| Artificial intelligence (AI) | The broad name for software that does things we used to think needed a person: recognising speech, recommending films, playing chess, writing text |
| Machine learning | The way nearly all modern AI is made. The software is not given rules. It is shown a great many examples and works out the patterns for itself |
| Generative AI | AI that produces something new, such as text, an image or a piece of music, as opposed to sorting or scoring what already exists |
| Large language model (LLM) | The kind of generative AI that works with text. It is the engine inside every chat assistant |
| Model | One trained piece of AI. Companies release new ones a few times a year, each with a name and a version |
| Assistant, or chatbot | A product built around a model: the app or web page you type into |

The last two lines matter more than they look. The **model** is the engine and the **product** is the car. ChatGPT is a product from OpenAI, Claude is a product from Anthropic, Gemini is from Google and Copilot is from Microsoft, and each runs on models that its maker updates regularly. The same model can also sit, unseen, inside other software: your email, your code editor, a customer-service window.

### Why it arrived so suddenly

The ideas are decades old. What changed around 2022 is that models trained on a vast amount of text, using a vast amount of computing power, turned out to be good at almost any task that can be put into words, and a chat window made them usable by anyone. Nothing had to be programmed for each task. You simply ask.

## 2. What a language model does

**In plain terms.** A language model has read a large share of the text people have published, and learned what tends to follow what. When you type something, it continues it, one small piece at a time, with whatever is most likely to come next. Doing that well across everything humans write about required it to absorb a great deal about language, facts, reasoning and code. It is not looking anything up, and it is not thinking the way you do. **Who should read it:** everyone. This is the idea the rest of the course rests on.

### Predicting what comes next

Your phone suggests the next word as you type. A language model does the same thing, on a scale that changes what it is. To predict the next word of a legal contract, a cooking recipe, a physics explanation and a Python program, it helps to have picked up some law, some cooking, some physics and some Python. So it did. Nobody taught it those subjects. They came along with getting better at the prediction.

When you ask it a question, it is not retrieving a stored answer. It is writing the text that would most plausibly follow your question, a word-piece at a time. Usually that is a good answer, because good answers are what usually follow questions in the text it learned from.

### It knows two things

This is the most useful thing to hold on to.

- **What it absorbed in training.** Broad, and fuzzy at the edges, like your memory of a book you read years ago. It also stops at a date, some months before the model was released. It knows nothing that happened after.
- **What is in front of it now.** Your message, anything you paste or attach, and the conversation so far. This it knows exactly.

It knows nothing about you, your company or your work unless it is in that second category. Most of the skill in using AI well is about putting the right things in front of it, and [part 2](file/4c8be1d6-27fa) starts there.

### What it is not

- **It is not a search engine.** On its own it works from memory. Many assistants can now search the web as well, and when they do they are reading the results like anyone else.
- **It is not a database.** It has no list of facts to check. A fact it states and a fact it has invented come out the same way.
- **It does not learn from talking to you.** A conversation does not change the model. Tomorrow it will not remember today, unless the product has a memory feature that stores notes and shows them to it again.
- **It is not a person.** It has no experiences, no stake in the answer and no knowledge of whether it is right. It writes fluently in the first person because people do.

The [language models module](file/590c1ae1-8bf3) explains all of this properly, for readers who want the mechanism. You do not need it to use these tools well.

## 3. The kinds you will meet

**In plain terms.** The same technology turns up in several forms. There are chat assistants you talk to, coding tools that write and change software, tools that make images and video, and AI tucked inside products you already use. They share their strengths and their weaknesses. **Who should read it:** everyone. It is a map of the rest of the course.

| Kind | What it does | Where the course covers it |
| --- | --- | --- |
| Chat assistant | Answers questions, drafts and rewrites text, explains, summarises, translates, talks through problems | The practical AI module |
| Coding assistant or agent | Suggests code as you type, or takes a task and carries it out: reading files, making changes, running tests | [Part 5 of the practical AI module](file/1d8f42a6-b93e) |
| AI inside other products | Summaries in your email, search in your documents, replies in a support window | The practical AI module, on connecting AI to your own systems |
| Image, video, music and 3D generators | Make media from a description | The generative media module |
| Models you run yourself | Smaller models that run on your own computer, with nothing sent anywhere | The running AI locally module |

An **agent** is worth a word, since you will hear it often. A chat assistant answers and stops. An agent is given a goal and some tools, such as the ability to search, read files or run programs, and works through the task step by step, checking its own results as it goes. It is the same model underneath, allowed to act.

## 4. Why it is sometimes wrong

**In plain terms.** Because it writes what is plausible, not what it has checked, it will sometimes write something plausible and false, in exactly the same confident tone as everything else. This is not a fault that will be fixed next year. It comes from how the thing works. Everyone who uses AI well has simply built the habit of checking what matters. **Who should read it:** everyone. If you read one section, read this one.

### The main ways it goes wrong

- **It makes things up.** Where it does not know, it fills the gap with something that sounds right: a statistic, a quotation, a book title, a function that does not exist. The word for this is hallucination.
- **It is out of date.** It does not know about anything after its training stopped, and it will not always tell you that.
- **It agrees too easily.** It was trained on what people liked, and people like being agreed with. If you suggest an answer, it tends to find reasons you are right.
- **It varies.** Ask the same thing twice and you may get two different answers.
- **It can be led astray by what it reads.** If it reads a web page or a document that contains instructions, it may follow them, as if you had given them.

None of this makes it useless, any more than a brilliant, well-read colleague who sometimes misremembers is useless. It makes it something to work with knowingly. [Part 2](file/4c8be1d6-27fa) covers how.

### The whiteboard version

Today's AI is a language model: software that learned the patterns of human writing and continues whatever you give it. It knows what it absorbed in training, which is broad, fuzzy and dated, and what you put in front of it, which is exact. It is a product built on a model, not a search engine, a database or a person. It writes what is plausible, so it is usually right and sometimes confidently wrong.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Language model | A neural network trained to predict the next token of text, at very large scale | Software that has read an enormous amount and continues whatever you write with what is most likely to come next |
| Model and product | A trained set of weights, versus an application that calls it | The engine, and the car built around it |
| Training and context | Knowledge stored in the weights up to a cutoff date, versus the text supplied in the current request | What it remembers from its reading, and what you have just shown it |
| Hallucination | Fluent output that is not grounded in training data or context | It fills gaps with plausible inventions, in the same confident voice as the facts |
| Agent | A model given tools and run in a loop until a goal is met | An AI that is allowed to act, step by step, and check its own work |

## Misconceptions to correct

### "It looks things up"

**True:** many assistants can search the web or your documents when asked, and then they really are reading sources.

**Misleading:** by default it is writing from memory, with nothing to check against. It cannot tell you which of its statements it is sure of.

**What to say:** "Unless it shows me where something came from, it is working from memory. For anything that matters, I ask for the source or check it myself."

### "It understands me"

**True:** it follows ordinary language, picks up on tone and context, and responds in a way that feels like being understood.

**Misleading:** it is producing text that fits. It has no idea what your situation is beyond what you have typed, and no stake in whether its answer helps you.

**What to say:** "It is very good with language. It knows only what I tell it, so I tell it more than I would tell a colleague."

### "It is learning from everything I type"

**True:** some products keep your conversations, and some vendors may use them to train future models unless your plan or settings say otherwise.

**Misleading:** the model does not change as you talk to it, and it will not remember you tomorrow unless the product stores notes for it. What happens to your data is a matter of the product's terms, not of the technology.

**What to say:** "It does not learn as I type. Whether the company keeps what I type is a settings and contract question, and I check that before pasting anything sensitive."

## Glossary

Terms introduced in this part, in plain language and in alphabetical order.

| Term | Meaning |
| --- | --- |
| Agent | An AI given a goal and some tools, which works through a task step by step |
| Artificial intelligence (AI) | Software that does things we used to think needed a person |
| Assistant, or chatbot | A product you talk to in ordinary language, built around a model |
| Context | Everything in front of the model now: your message, attachments and the conversation so far |
| Generative AI | AI that produces new text, images, sound or video |
| Hallucination | A plausible statement the model has made up |
| Large language model (LLM) | A model trained on a very large amount of text, which works by predicting what comes next |
| Machine learning | Making software by showing it examples, not by writing rules |
| Model | One trained piece of AI, with a name and a version |
| Training | The process in which a model learns from examples, before anyone uses it |
| Training cutoff | The date a model's knowledge stops |

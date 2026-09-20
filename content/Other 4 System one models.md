# Part 4: System One Models

2026-09-19 · Chris Neale

## About this part

This is the fourth of four parts in the other AI models module. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). The format is the same as elsewhere: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 30 minutes.

This part needs a warning that the others do not. "System One model" is a name coined by one company, TypeSafe AI, for a category that at the time of writing contains one product, its model Jev, announced on 15 September 2026, four days before this was written, and available only to people let in from a waiting list. Every performance figure here is the vendor's own. The part is in the course because the idea behind the product is sound and older than the product, and is worth understanding whether or not this company or this name lasts. Read the description of Jev as an example, and the rest as the lesson.

### What part 4 gives you

Part 4 builds one idea: most of what software asks of an AI is a decision, not a piece of writing, and a decision should come back as a typed value with a probability you can trust. Is this message spam? Which team should get this ticket? How severe is this, from one to five? Asking a text generator for those is like asking an essayist to tick a box. It works, slowly, and the tick arrives wrapped in prose with no honest measure of doubt. A model built only to decide can be far faster and cheaper, and can say how sure it is.

## 1. Decisions, not text

**In plain terms.** When a person uses an AI, they want words back. When a program uses an AI, it nearly always wants something much smaller: yes or no, one choice from a list, a score. Today programs get that by asking a chat model and then picking the answer out of its reply. A system one model skips the chat. It can only answer in the form you asked for, and it tells you how confident it is. **Who should read it:** everyone.

### The name

The psychologist Daniel Kahneman described two modes of human thinking. System 1 is fast, automatic and intuitive: recognising a face, sensing that a sentence is rude. System 2 is slow, deliberate and effortful: working out a tax return. Reasoning models, which part 2 of the language models module described writing out long deliberations before answering, are the field's System 2. TypeSafe's name claims the other mode: a model for snap judgements.

The analogy is loose. Kahneman's point about System 1 was that it is quick and error-prone in systematic ways, and the company argues its model is the more reliable tool for the jobs it fits. Take the name as a label for "fast judgement, no deliberation" and do not lean on it further.

### How much of AI in software is deciding

Look at the uses this course has recommended for models inside systems. Classification, routing and triage, in part 1 of this module. Guardrail checks and grading outputs, in [part 9 of the practical AI module](file/7a3f2c68-91de). Choosing whether a retrieved passage is relevant. Deciding whether an agent's step succeeded. Each has a known set of possible answers, is made again and again, and feeds straight into an `if` statement.

Using a general language model for these has four costs.

- **Speed and price.** Part 3 of the language models module showed that output is generated one token at a time and is the expensive part. A model asked for one word still carries the machinery for writing essays.
- **Parsing.** The answer comes as text. [Part 7 of the practical AI module](file/c9146f3b-27a8) showed how structured output forces the shape, and the content inside the shape is still generated text.
- **Invented options.** Asked to choose among five teams, a text generator can name a sixth. Constrained decoding prevents that, and not every system uses it.
- **No usable confidence.** This is the important one. Ask a chat model how sure it is and it will write "90%", because that is a plausible thing to write. The number is more text. It was not measured, and studies have repeatedly found such stated confidence to be poorly matched to accuracy. So the program cannot tell a safe decision from a coin toss, and every decision must be treated alike.

## 2. How Jev works, as described

**In plain terms.** You give Jev some information and a list of questions, and for each question you say what kind of answer you want: a yes-or-no, a pick from your list, or a position on your scale. It answers all of them at once, in about a tenth of a second, each with a probability. It cannot write a sentence. **Who should read it:** engineers. Others can read the table of three question types and move on.

### What goes in and what comes out

The input is a state, meaning the data to judge, which can include free text, and a set of typed questions, each with instructions in plain language. The output is one typed value for each question, with probabilities attached.

| Question type | You define | It returns |
| --- | --- | --- |
| Yes or no, which the vendor calls a Noul | The question | The probability that the answer is yes |
| Choice | Up to 255 options, each with a description | One of your options, with a probability for each |
| Score | An ordered scale, with a description of each level | A level on your scale, with a confidence |

A request, as an independent write-up shows it, looks like this.

```json
{
  "state": { "message": "My card was charged twice for the same order." },
  "questions": {
    "department": {
      "type": "choice",
      "instructions": "Which department handles this?",
      "criteria": {
        "billing": "Charges, refunds and invoices",
        "technical": "Faults in the product",
        "account": "Sign-in and personal details"
      }
    },
    "is_urgent": {
      "type": "noul",
      "instructions": "Does the customer need an answer today?"
    }
  }
}
```

The reply would give `billing` with a probability for each of the three departments, and a probability for `is_urgent`. The field names are illustrative, since the interface is in early access and may change.

### What is different inside

The vendor has published little about the architecture, and no size. It says three things.

- **No text generation.** The model has no ability to produce strings. Its only outputs are the typed values. The company's phrase is that giving up strings buys everything else.
- **All answers in one pass.** Where a language model generates token after token, Jev produces every answer to every question together. Adding questions to a request adds little time. The company quotes 70 to 500 milliseconds end to end, and the independent write-up found most requests near 100.
- **Trained for calibration.** The company names its method Reinforcement Learning for Calibrated Decisions. The aim is that the probabilities mean what they say, which section 3 explains.

On price, the vendor charges for input at about four US cents a million tokens and nothing for output. Its headline comparison with large language models, roughly two hundred times faster and four hundred times cheaper, comes from its own workflow tests, and it says itself that those are at the high end of what users will see.

### The "zero hallucination" claim

The company reports a hallucination rate of 0% and is open about what it means by that: the figure is not measured. It follows from the design, since the model can only return a value of the declared type, from the declared options. It can never invent a sixth department.

That is a real property and a narrower one than the phrase suggests. The model can still choose the wrong department. A wrong answer in a valid shape is still a wrong answer. What the design removes is one class of error, the malformed or invented output, and what it adds is a probability that lets you catch some of the rest.

## 3. Calibration

**In plain terms.** A forecaster who says "70% chance of rain" is calibrated if it rains on about 70% of the days they say that. A calibrated model's "95% sure" is right about 95 times in 100. That is what lets software act alone on the confident answers and send the doubtful ones to a person or a bigger model. It is a promise about many answers on average. It says nothing certain about any single one. **Who should read it:** everyone. This idea is worth having even if you never use this product.

### Why it is the point

A decision with a trustworthy probability can be handled by policy.

| The model says | The system does |
| --- | --- |
| 98% spam | Filter it, with no human involved |
| 70% spam | Deliver it with a warning, or send it to a stronger model |
| 50% spam | Treat it as unknown. Deliver it, and log it for labelling |

Without the probability, all three are "spam" or "not spam", and the system is either too cautious everywhere or too bold everywhere. With it, automation can be confined to the cases where the model is sure, and [part 9 of the practical AI module](file/7a3f2c68-91de) argued that this is how people get out of the loop safely: not by trusting the model more, but by knowing when to.

### What it does not mean

Calibration is a property of many predictions taken together. Of all the answers given at 90%, about nine in ten are right. Which one in ten is wrong, it cannot say. A single confident answer can be wrong, and in a large enough volume some will be, every day. Thresholds must therefore be set by the cost of a mistake. An action that cannot be undone may deserve a threshold that almost nothing passes.

Calibration also belongs to a model on a kind of data. A model calibrated on its makers' test sets may be overconfident on your tickets, your jargon, your language. Nothing in a vendor's claim can settle that. Your own labelled cases can.

### Why chat models are poor at it

A language model straight out of pretraining is, perhaps surprisingly, quite well calibrated about its next token: when it gives a token 80%, it is right about 80% of the time, because that is exactly what its training optimised. The post-training that part 2 of the language models module described, which makes the model helpful and agreeable, damages this. The model learns to sound confident, because people rate confident answers highly. Some APIs expose the underlying token probabilities, and they can be used as a confidence signal with care, and they are not what the model says when you ask it how sure it is.

### Deep dive (optional): checking calibration yourself

You need a few hundred cases with known right answers, from your own data.

1. Run the model on all of them, keeping each answer and its probability.
2. Sort the answers into bins by stated probability: 50 to 60%, 60 to 70%, and so on.
3. For each bin, work out the share that were actually right.
4. Compare. In a calibrated model the bin of answers around 85% is right about 85% of the time. Plotted, stated confidence against actual accuracy, the points lie on the diagonal. Points below it mean overconfidence.

Two summary numbers are common. Expected calibration error is the average gap between stated and actual, weighted by how many answers fall in each bin. The Brier score is the mean squared difference between the probability given and what happened, and rewards being both calibrated and decisive.

Two cautions apply. Bins with few cases are noisy, so a gap in a bin of twelve answers means little. And good calibration alone is not enough: a model that says 50% to everything on a balanced yes-or-no task is perfectly calibrated and useless. Look at accuracy too, and at how many answers clear your threshold, since that is the share you can automate.

If a model is miscalibrated in a consistent way, it can often be corrected after the fact by fitting a simple mapping from its stated probabilities to the observed ones on your labelled set. That works for any model that gives a number, including the older tools in the next section.

## 4. What came before

**In plain terms.** Making a fast yes-or-no or pick-one decision with a confidence score is not new. Spam filters have done it for decades. The older tools need to be trained on thousands of your own examples for each new question. A chat model needs no training and can be given the question in words, and is slow and vague about its confidence. The new claim is to have both: ask in words, and get a fast, typed, honest answer. **Who should read it:** engineers choosing a tool.

| | Trained classifier | Language model with structured output | System one model, as claimed |
| --- | --- | --- | --- |
| Example | A small fine-tuned model such as a BERT variant, or the tiny task-specific models of part 1 | Any chat model with a schema | Jev |
| New question needs | Labelled examples and a training run | A prompt | Instructions and a list of options |
| Speed | Milliseconds | Hundreds of milliseconds to seconds | About a tenth of a second |
| Output | A label and a score | Text forced into a shape | A typed value and a probability |
| Confidence | A real number, often needing calibration | Unreliable if asked for. Token probabilities where exposed | Claimed calibrated |
| Can reason about the case | No | Yes, at a price | Little. No multi-step reasoning |
| You can run it yourself | Yes | Yes, with open models | No. Hosted, early access |

### The honest comparison

For a stable, high-volume decision on which you have labelled data, a trained classifier is still hard to beat. It is fast, cheap, runs anywhere, and its calibration can be measured and corrected. Its weakness is the cost of a new question: every new category or policy means new labels and a new training run.

A language model's strength is exactly that a new question costs a sentence. Much classification moved to LLMs for that reason alone, and teams accepted the speed, cost and confidence problems as the price.

The system one proposal is a classifier that takes its task in words. If the claims hold up, it removes the classifier's main weakness and the LLM's main three. Whether they hold on data unlike the vendor's is what early users will find out. The idea does not depend on this vendor. The tiny models of [part 1](file/e4b7a1d3-5c92) reach the same place from the other side, and nothing stops a general model vendor exposing a decision-only mode with calibrated outputs.

## 5. Where it fits

**In plain terms.** Use a decision model when you already know the possible answers, you make the same kind of decision again and again, and you can do something sensible with "not sure". Do not use one where the answer has to be written, worked out in steps, or calculated. The best arrangement pairs the two: the fast model decides what it can and passes the rest up. **Who should read it:** everyone.

### The three conditions

The vendor's own guidance is a good test for any tool of this kind. Reach for it when three things are true at once.

1. **You know the set of possible answers.** Departments, categories, levels of severity, yes or no.
2. **You make the decision repeatedly.** The cost of each decision matters, and there will be enough cases to measure.
3. **You can act on a confidence.** There is somewhere for uncertain cases to go.

### Good fits

- routing and triage of messages, tickets and documents
- the guardrail checks of [part 9 of the practical AI module](file/7a3f2c68-91de): is this input an injection attempt, is this output on topic, does this action need approval
- grading in evals, where part 6 warned about the biases of chat models as judges, and a calibrated score is worth more than an eloquent one
- filtering and labelling very large sets of records, where cost for each record decides whether the job is possible
- decisions in the middle of an interaction, where a second's wait is too long
- the small decisions inside an agent's loop: did that step work, which tool family is relevant, is the task finished

### Poor fits

The independent write-up lists where Jev did badly, and the list would hold for any model that answers without deliberating: arithmetic, comparing dates, questions needing several steps of reasoning, and a relevant detail buried in a large irrelevant state. Add anything that needs a written answer, anything where the options cannot be listed in advance, and extracting an arbitrary value from text, where the advice is to choose from a deck of cards you supply and not to ask for a free value.

### Fast and slow together

Kahneman's two systems work as a pair, and so should these. The fast model takes every case. Those it is sure of are acted on. Those it is not go to a reasoning model, or to a person, with the fast model's probabilities attached as a starting point. If nine cases in ten clear the threshold, the expensive model's bill falls by about 90% and the typical response time falls further, while the hard cases get the same attention as before.

This is the first-pass pattern that part 1 of this module recommended for small models, with one improvement: the hand-over is decided by a measured probability and not by a guess.

### Adopting one

Treat it like any new instrument, and the house advice of this course applies in full.

- **Run it in shadow.** Let it decide alongside the current process, without acting, and record both.
- **Label the outcomes**, and check accuracy and calibration on your own data as the deep dive describes.
- **Set thresholds from your costs**, not from a default.
- **Automate the low-risk, high-confidence paths first**, and widen from there.
- **Keep measuring.** Your data will drift, and a vendor in early access will change its model.
- **Mind the dependency.** A hosted model from a young company, with no open weights, is a risk to plan for. Keep the old path working.

### The whiteboard version

Most AI calls inside software are decisions: yes or no, pick one, rate it. A text generator makes them slowly and cannot say honestly how sure it is. A decision model returns only a typed answer and a probability. If that probability is calibrated, which you check on your own data, software can act alone on the sure cases and pass the rest up. The product is days old and its numbers are its maker's. The pattern is worth adopting with whatever tool earns it.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| System one model | A model whose only outputs are typed values with probabilities, produced in a single pass without text generation | An AI that can only tick boxes, very quickly, and says how sure it is of each tick |
| Typed decision | An output constrained by construction to a declared type: a boolean probability, one of an enumerated set, or a level on an ordered scale | It must answer in the form we asked for. It cannot reply with anything else |
| Calibration | Agreement between stated probabilities and observed frequencies over many predictions | When it says 90% sure, it is right about nine times in ten |
| Thresholding | Acting automatically above a confidence chosen from the cost of errors, and escalating below it | We let it handle the cases it is sure of, and send the rest to a person or a bigger model |
| Zero-shot classification | Classifying against categories described in natural language, with no task-specific training | We describe the pigeonholes in words, and it sorts the post. No examples needed |
| Valid is not correct | Type safety rules out malformed and invented outputs, not wrong choices | It can never pick a box that is not on the form. It can still pick the wrong box |
| Fast and slow together | A cheap calibrated model handles confident cases and routes uncertain ones to a reasoning model | A quick first look at everything, and a careful second look only where the first was unsure |

## Misconceptions to correct

### "It never hallucinates"

**True:** it cannot produce an output outside the type and options you declared, so invented categories and malformed replies are impossible by design.

**Misleading:** the vendor itself says the figure is a consequence of design, not a measurement. The model can still choose wrongly among valid options, and a wrong answer in a tidy shape is easier to overlook than a garbled one.

**What to say:** "It cannot make up an answer that is not on our list. It can still pick the wrong one from the list, so we measure its accuracy like anything else."

### "It is 95% confident, so this answer is right"

**True:** if the model is well calibrated on our kind of data, about 95 in 100 such answers are right.

**Misleading:** that is a statement about the hundred, not about this one. At volume, confident mistakes happen daily. And calibration measured on the vendor's data may not hold on ours.

**What to say:** "The confidence tells us how often to expect a mistake, not where it is. We set the bar by what a mistake costs, and we check the confidence against our own cases."

### "This replaces language models"

**True:** for the many calls that are really decisions, a decision model may be far faster and cheaper, and those calls are a large share of what software asks.

**Misleading:** it cannot write, explain, reason in steps or handle a question whose answers cannot be listed. It is a component that works beside a language model.

**What to say:** "It takes the box-ticking off the big model's hands. The big model still does the thinking and the writing, on fewer, harder cases."

## Glossary

Terms introduced in this part, in plain language and in alphabetical order.

| Term | Meaning |
| --- | --- |
| Brier score | A measure of probabilistic predictions: the average squared gap between the probability given and what happened. Lower is better |
| Calibration | How well a model's stated probabilities match how often it is right |
| Cardinality | The number of options a choice can be made from |
| Classifier | A model that assigns an input to one of a fixed set of categories |
| Expected calibration error | The average gap between stated confidence and actual accuracy, across bins of predictions |
| Overconfidence | Stating higher probabilities than the results justify |
| Shadow mode | Running a new system alongside the old one without letting it act, to compare them |
| System 1 and System 2 | Daniel Kahneman's names for fast, intuitive thinking and slow, deliberate thinking |
| System one model | One vendor's term for a model that returns fast, typed decisions with probabilities and no text |
| Threshold | The confidence above which a system acts without asking |
| Typed value | A value that must be of a declared kind, such as a yes-or-no, one of a list, or a level on a scale |
| Zero-shot | Doing a task from a description alone, with no examples to train on |

## Sources

This part describes one product from its vendor's announcement and one independent write-up, both read in September 2026, days after the launch. Every speed, price and quality figure is the vendor's, from tests it designed, and it says as much. No independent benchmark existed at the time of writing. The account of calibration, of how post-training affects it, and of classifiers rests on the drafter's general knowledge.

- [Introducing System One Models and Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev), TypeSafe AI, September 2026, for the category, the three question types, the limit of 255 options, single-pass output, the training method's name, the latency and price, the basis of the 0% figure, the recommended and unsuitable uses, and early access
- [A deep dive into Jev, TypeSafe's System One model](https://flaviocopes.com/jev/), Flavio Copes, September 2026, for the shape of a request, the observation that calibration is an aggregate property, the tasks it handles badly, the caution about the vendor's comparisons, and adoption by shadow mode
- *Thinking, Fast and Slow*, Daniel Kahneman, 2011, for System 1 and System 2

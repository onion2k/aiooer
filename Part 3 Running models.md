# Part 3: Running Models: Context, Cost, Performance and Failure Modes

2026-09-18 · @Someone

## About this part

Part 3 covers what happens when a model is put to work: how a request is processed, what it costs, how fast it runs, and how it fails. Parts 1 and 2 explained the machine and its training. This part turns that into numbers you can budget with and failure patterns you can predict.

It is the hinge of the course. Sections 1 to 6 are about performance and money. Section 7 maps each characteristic failure back to its cause in parts 1 and 2, and forward to its mitigation in part 4.

The numbers in this part also support the course's main argument. Tokens are cheap next to people's time, so the economic question is rarely what the AI costs. It is whether a person is waiting on the AI, or the AI is waiting on a person. And because each failure mode has a known cause, each can be met with an automatic check, which is what allows people to step back.

The format is unchanged: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. All prices are illustrative, in US dollars because that is how vendors quote them. Check current price lists before you budget. Reading time is about 40 minutes.

## 1. Anatomy of a request

**In plain terms.** A request has two phases. First the model reads your whole prompt in one go, which is fast. Then it writes its answer one chunk at a time, which is slow. That is why a long document gets a quick start but a long answer takes a while, and why output costs several times more than input. **Who should read it:** non-technical readers need only "Two numbers describe speed".

### Prefill: reading the prompt

All prompt tokens are processed together in one parallel pass. This phase keeps the GPU's arithmetic units fully busy, and it handles thousands of tokens per second. It produces two things: the first output token, and a stored record of the prompt that section 2 describes.

### Decode: writing the answer

Output tokens are produced one at a time. Each one needs a full pass through every layer, and each pass has to read the model's active weights out of GPU memory. The arithmetic is trivial by comparison. The GPU spends most of its time waiting for memory.

Providers therefore batch many users' requests together, so one read of the weights serves dozens of answers at once. This is the core economics of serving a model. It also creates a trade-off you feel as a customer: bigger batches lower the cost per token and slow each individual response.

### Two numbers describe speed

- **Time to first token.** The wait before anything appears. It grows with prompt length, queueing at the provider, and any thinking the model does first.
- **Output speed.** Tokens per second once it starts. It depends on model size and provider load, and ranges from tens to a few hundred tokens per second.

Total time is roughly the first plus output length divided by the second. A 1,000-token answer at 80 tokens per second takes about 12 seconds to write. If the model first thinks for 5,000 tokens, add another minute before the visible answer begins.

### What this means for design

- **Output length drives latency.** For interactive tools, ask for a diff and not the whole file, a verdict before the essay, a short answer by default.
- **Stream the output.** Showing tokens as they arrive does not make the response faster, but it changes how the wait feels.
- **Run independent calls in parallel.** Ten calls take about as long as one. Agent designs that fan work out to sub-agents rely on this.
- **Use batch processing for non-urgent work.** Vendors give a large discount for jobs that can wait hours, because they can fill idle capacity with them.

The last two points lead somewhere important. An engineer who sits watching an agent work has combined the slowness of decode with the cost of a person. Design the work so that neither waits on the other: dispatch the task, do something else, and come back to a verified result. Part 5 describes working this way.

### Deep dive (optional): speculative decoding

Decode is slow because it is sequential. Speculative decoding recovers some parallelism. A small, fast draft model proposes the next several tokens. The large model then checks all of them in a single parallel pass, the same way it reads a prompt.

Wherever the large model agrees with the draft, the tokens are accepted. At the first disagreement, the large model's own token is used and the rest of the draft is discarded. Done properly, the output is statistically identical to what the large model would have produced alone.

The gain depends on how predictable the text is. Boilerplate code and formulaic prose see speed-ups of two to three times. Novel reasoning sees less. Some recent models build the drafting step into the model itself with extra output heads that predict several tokens ahead. This technique is one reason providers can offer faster modes of the same model, and why output speed varies with content.

## 2. The KV cache and prompt caching

**In plain terms.** To avoid re-reading the whole conversation for every new chunk it writes, the model keeps working notes on everything it has read so far. Vendors can hold on to those notes between requests. If your next request begins with the same material, such as the same instructions and documents, that part is charged at a fraction of the normal price and starts faster. For tools that send a large context again and again, like coding agents, this is the difference between affordable and not. **Who should read it:** non-technical readers can skip to "Prompt caching".

### The KV cache

Part 1 showed that attention compares each new token with the keys and values of every earlier token. Because of causal masking, those keys and values never change once computed. So the serving system computes them once and stores them. This store is the KV cache.

Without it, producing each new token would mean reprocessing the entire sequence. With it, each step only computes the new token's own vectors and reads the rest.

The price is memory. The cache grows with every token in the context, and every active request has its own. It is often the cache, not the model weights, that limits how many users can share a GPU. This is why some vendors charge a higher rate for requests beyond a certain context length.

### Prompt caching

Normally the cache is discarded when a request ends. Prompt caching keeps it for a while. If a later request starts with exactly the same tokens, the provider skips prefill for that stretch and reuses the stored cache.

Three rules govern it:

- **Exact prefix match.** Caching works from the first token forward. Any change at position N invalidates everything after N.
- **Short lifetime.** Entries expire after minutes, typically between five minutes and an hour, refreshed each time they are used.
- **Discounted reads.** Cached input tokens usually cost around a tenth of the normal input price. Some vendors apply caching automatically. Others have you mark cache points, and charge a small premium to write an entry.

### Designing for the cache

- Put stable content first: system prompt, tool definitions, reference documents. Put what varies, such as the user's question, last.
- Keep timestamps, request IDs and anything else that changes per call out of the top of the prompt.
- Treat conversation history as append-only. Editing or reordering earlier turns throws the cache away.
- Keep tool definitions in a fixed order.
- Monitor the cache hit rate. APIs report cached token counts in every response, so this is easy to track.

### Why agents depend on it

An agent re-sends its whole growing history on every step. A 50-step task averaging 40,000 tokens of context per step consumes 2 million input tokens. At an illustrative $3 per million, that is $6 of input for one task.

With a 90% cache hit rate and cached reads at $0.30 per million, the same task costs about $1.14 of input. That is a five-fold reduction from prompt layout alone. A team that breaks caching by accident, for example with a timestamp in the system prompt, can multiply its bill without noticing.

### Deep dive (optional): KV cache memory arithmetic

The cache size per token is: 2 (one key, one value) x layers x key-value heads x head dimension x bytes per number.

Take the open 70-billion-parameter model from part 1: 80 layers, 8 key-value heads, head dimension 128, 16-bit numbers. That gives 2 x 80 x 8 x 128 x 2 = 327,680 bytes, or about 320 KB per token. A 128,000-token context therefore needs roughly 42 GB of cache for a single request. The model's weights take 140 GB, and a high-end GPU holds 80 GB.

One long-context request can occupy as much memory as dozens of short ones. That is the real cost behind long-context pricing, and the reason providers work so hard on the techniques in the next deep dive.

### Deep dive (optional): grouped-query attention and FlashAttention

The arithmetic above already includes a major saving. The model has 64 query heads but only 8 key-value heads. Groups of eight query heads share one set of keys and values. This is grouped-query attention, and it cuts the cache eight-fold for a small quality cost. With a full 64 key-value heads, the same 128,000-token request would need about 335 GB.

Other designs go further. One compresses keys and values into a single small vector per token and expands it when needed. Another makes most layers attend only to a recent window of tokens, leaving a few layers to look at everything.

FlashAttention attacks a different problem. Standard attention builds an n-by-n grid of scores, which for long sequences will not fit in the GPU's small, fast on-chip memory. FlashAttention computes exactly the same result in blocks that do fit, and never stores the full grid. Memory use becomes linear in sequence length, and speed improves several-fold. The amount of computation is still quadratic. It is the technique that made contexts of 100,000 tokens and beyond practical.

## 3. Context windows in practice

**In plain terms.** The context window is how much the model can take in at once. A 200,000-token window holds about 150,000 words, or some 500 pages, and advertised sizes now reach a million tokens or more. But models do not use long inputs evenly. Accuracy falls as the input grows, details in the middle get missed, and irrelevant material actively distracts. Bigger inputs also cost more and run slower. Give the model what it needs, not everything you have. **Who should read it:** everyone.

### Everything shares one window

The window holds the system prompt, tool definitions, conversation history, attached documents, tool results, the model's thinking and its output. All of it competes for the same space. A generous set of connected tools can consume tens of thousands of tokens before the user has typed a word.

For code, a useful estimate is ten tokens per line. A 200,000-token window therefore holds 15,000 to 20,000 lines with nothing else in it. A mid-sized service fits. A monorepo does not, which is why coding agents search and read selectively.

Output has its own, smaller limit, typically in the tens of thousands of tokens. A model cannot emit a large codebase in one response, whatever the input window.

### Advertised length and effective length

Vendors demonstrate long context with a "needle in a haystack" test: plant one sentence in a huge document and ask for it back. Modern models pass this at nearly 100% across their full window. It is also the easiest long-context task there is.

Harder tasks degrade well before the limit. Combining a dozen facts scattered through a document, tracking how a value changes across a long log, or reasoning over a whole codebase all get less reliable as length grows. Three effects are well documented:

- **Lost in the middle.** Material at the start and end of the context is used best. The middle is used worst.
- **Context rot.** Quality declines as tokens accumulate, even when the window is far from full.
- **Distraction.** Content that is similar to the answer but irrelevant does more harm than random filler. Ten nearly-right documents are worse than one right one.

The causes trace back to parts 1 and 2. Attention weights must sum to 1, so more positions means each gets a thinner share. Training data contains few genuinely long documents whose parts depend on each other. And the window was often stretched after training, as the part 1 deep dive on position encoding described.

### Long sessions go stale

A long working session fills the context with dead ends, superseded instructions and old versions of files. The model cannot tell which version is current as reliably as you can. The symptoms are distinctive: repeating a mistake you already corrected, forgetting a constraint from early on, or contradicting itself.

The fix is procedural. Start a fresh session for each task. When a session must continue, have the model summarise the state, then restart from the summary. Keep durable instructions in a file that is loaded every time, not in chat history. Part 4 covers how agents automate this.

### Working rules

- Put documents before the question, and the key instruction at the very start or very end.
- Curate. Every irrelevant token costs money and a little accuracy.
- Prefer fetching the relevant parts over loading everything. Part 4 covers retrieval.
- Use long context for what it is good at: one-off reading of a whole specification, contract or log file.
- Treat a vendor's maximum as a ceiling for emergencies, not as an operating point.

## 4. Test-time compute

**In plain terms.** Many models can now think before they answer, and you control how much. More thinking gives better answers on hard problems, for more money and a longer wait. On easy tasks it adds cost and nothing else. **Who should read it:** everyone. It is short.

### The dial

Vendors expose thinking as an effort level or a token budget. Thinking tokens are billed at the output rate, including when the product hides or summarises them. A request that thinks for 8,000 tokens and answers in 500 is billed for 8,500 output tokens.

The return follows a familiar shape. Accuracy on hard problems rises roughly in line with the logarithm of thinking tokens, so each doubling buys a similar increment. The first thousand tokens of thinking matter far more than the tenth.

### When it pays

| Task | Thinking | Why |
| --- | --- | --- |
| Debugging a subtle fault | High | Needs hypotheses, elimination and checking |
| Planning a refactor or migration | High | Many interacting constraints |
| Analysing ambiguous requirements | Medium | Benefits from weighing interpretations |
| Routine code generation | Low | The pattern is well known |
| Extraction, classification, formatting | Off | One-step tasks gain nothing |
| Autocomplete and chat replies | Off | Latency matters more than depth |

### Other ways to spend compute at answer time

Thinking longer is one option. There are two others, and both rely on a checker.

- **Sample several answers and select.** Generate five candidate solutions and keep the one that passes the tests, or the answer most candidates agree on.
- **Try, run, observe, retry.** Let the model execute its code, read the error and fix it. This is what a coding agent does.

With a reliable checker, a cheap model given several attempts can beat an expensive model given one. This is the run-time counterpart of the training idea in part 2, section 5: verification converts compute into reliability. Compute is cheap and human attention is scarce, so a good checker lets you spend the first to save the second. It is another reason to invest in tests.

## 5. Pricing and capacity

**In plain terms.** You pay per token, at four different rates: input, output (several times dearer), cached input (much cheaper) and batch (about half price for work that can wait). Seat-based tools wrap this in a subscription with usage caps. Rate limits restrict how much you can use per minute. A simple spreadsheet predicts the bill well, and the biggest lever in it is how much context you send on each call. **Who should read it:** everyone, and budget holders especially.

### The four prices

Illustrative rates for a mid-tier model, per million tokens:

| Token type | Illustrative price | Relative to input |
| --- | --- | --- |
| Input | $3.00 | 1x |
| Output, including thinking | $15.00 | 5x |
| Cached input (read) | $0.30 | 0.1x |
| Batch, input and output | Half the usual rate | 0.5x |

A vendor's large tier is commonly around five times these figures, and its small tier between a third and a tenth. The ratios between token types are more stable than the absolute prices, which fall every year.

### Two ways to buy

- **Pay as you go through the API.** You are billed for exactly the tokens used. This suits products and automation. Cost scales with usage and needs monitoring.
- **Seats.** Coding assistants and chat products charge per user per month, with usage caps. Heavy users often get more than their subscription would buy at API rates, until they hit the cap. This suits individual productivity use and makes budgeting simple.

Most organisations end up with both. The same models are also sold through the major cloud platforms, which can simplify procurement and data residency. Section 6 compares the routes.

### Rate limits

API accounts are limited on requests per minute, input tokens per minute and output tokens per minute. Limits rise with spending history. Agents hit the token limits quickly, because each step re-sends a large context.

Three practices avoid trouble. Handle "429 Too Many Requests" responses with exponential backoff. Request limit increases before a rollout, not during it. For a production system that needs guaranteed capacity, ask about reserved throughput.

### A worked cost model: a coding agent for one developer

Take the agent task from section 2: 50 model calls, averaging 40,000 tokens of context and 600 tokens of output per call, thinking included. Assume five such tasks a day and 20 working days a month, at the illustrative rates above.

| Line | With 90% cache hits | With no caching |
| --- | --- | --- |
| Fresh input per task | 0.2M tokens = $0.60 | 2.0M tokens = $6.00 |
| Cached input per task | 1.8M tokens = $0.54 | none |
| Output per task | 30,000 tokens = $0.45 | 30,000 tokens = $0.45 |
| Cost per task | $1.59 | $6.45 |
| Per developer per day | $7.95 | $32.25 |
| Per developer per month | $159 | $645 |

Four lessons come out of the table.

- **Input dominates.** Output is five times dearer per token, yet input is most of the bill, because agents re-send context on every call.
- **Caching is worth a factor of four.** It is the first thing to verify in any agent deployment.
- **Context size is the biggest lever.** Halve the average context and the bill nearly halves. Curation pays twice, in cost and in the accuracy effects from section 3.
- **Tier choice multiplies everything.** The same workload on a large-tier model costs roughly five times as much.

For scale: a fully loaded engineer costs in the order of a dollar a minute. At about $8 a day, the tool pays for itself if it saves under ten minutes. That is a low bar, and it exposes a common economic mistake. Teams ration tokens, or have an engineer supervise every step, and so save dollars while spending hours.

The real questions are about quality and workflow: how to let the agent run without a person in the loop, and how to trust the result. Part 5 takes those up, and part 6 turns this model into a full investment case.

Expect wide variation between people. Heavy users can consume ten times what light users do. Build the spreadsheet with tasks per day, calls per task, average context, cache hit rate, output per call and price per tier as inputs, and check it against a month of real usage data.

### Cost controls

- Issue separate API keys per team or project, with budgets and alerts on each.
- Set a maximum output token limit on every call.
- Cap the number of steps an agent may take. A loop that never terminates is the classic surprise bill.
- Review cache hit rate and average context size monthly, alongside spend.

## 6. Model selection and hosting

**In plain terms.** There are two decisions here. Which size of model does each job need? And do you call the vendor directly, go through your cloud provider, or run an open model yourself? For nearly every team, paying per use is cheaper and better than self-hosting. Running your own is justified by strict data constraints or very high steady volume, and rarely by hopes of saving money. **Who should read it:** everyone can read the main text. Skip the deep dive.

### Tiering and routing

Part 2 gave the method for choosing a tier: prove the task with the best model, then step down until your tests fail. Once you have more than one model in play, there are three ways to route work.

- **Static assignment.** Each task type is pinned to a tier: small for classification, medium for code generation, large for planning. This is simple and predictable. Start here.
- **Cascade.** Try the small model first and escalate if a check fails or confidence is low. This works well when most cases are easy and you have a check.
- **Sub-agents.** A large model plans and delegates routine sub-tasks, such as searching files or summarising logs, to small models.

### Four ways to get a model

| Route | What you get | Watch for |
| --- | --- | --- |
| Vendor API, direct | Newest models and features first | A separate contract and security review |
| Major cloud platform | Existing contract, regional hosting, your access controls, committed-spend discounts | New features can arrive later |
| Open-weight model on a hosting service | Low per-token prices, wide choice | Quality varies by host for the "same" model, often through undisclosed quantisation |
| Open-weight model, self-hosted | Full control of data and a fixed cost | You run the GPUs. The models trail the frontier |

"Open-weight" means the trained weights can be downloaded and run by anyone, subject to a licence that varies by model. The best open models trail the best closed ones by several months to a year on the hardest work, and are competitive for many routine tasks.

### Self-hosting economics

A large open model needs a server with around eight high-end GPUs to hold its weights and caches. Rented, that costs in the region of $15,000 to $20,000 a month running continuously. Compare that with the cost model in section 5: it is the API bill for about 100 developers using agents heavily, on a stronger model.

The self-hosted server only wins if it is kept busy around the clock with batched traffic. Internal use is bursty and concentrated in office hours, so utilisation is usually under 20%. Add the engineering time for the serving stack, upgrades, monitoring and evaluation of each new open model.

Self-hosting is the right answer in a few cases:

- regulation or contracts forbid sending the data to any third party, and contractual controls cannot satisfy them
- the environment is air-gapped
- you have a very high, steady volume of one narrow task that a small model handles
- you need on-device or ultra-low-latency inference

Small models change the sums. A model under about 30 billion parameters runs on a single GPU, or a well-specified laptop, and is cheap and simple to operate.

For most data-sensitivity concerns there is a middle path: a major cloud platform, with regional hosting and contractual terms that exclude training on your data and limit retention. Part 6 covers how to evaluate those terms.

### Deep dive (optional): quantisation

Quantisation stores weights with fewer bits. Models are typically trained at 16 bits per weight. Storing them at 8 bits halves the memory, and 4 bits quarters it. Because decode speed is limited by reading weights from memory, as section 1 explained, smaller weights also mean faster output.

The quality cost depends on how far you go. 8-bit is close to lossless. 4-bit carries a small, measurable loss, felt most in reasoning, code and long-context work, and more in small models than in large ones. Below 4 bits, quality falls away quickly.

The memory sums explain its popularity. A 70-billion-parameter model needs 140 GB at 16-bit, 70 GB at 8-bit and 35 GB at 4-bit. The last fits on one workstation GPU or a high-memory laptop.

You will meet several format names. GGUF is the usual choice for running models locally on CPUs and laptops. GPTQ and AWQ target GPUs. FP8 is an 8-bit floating-point format with direct hardware support on recent GPUs, and some models are now trained in it from the start.

The practical warning concerns hosted open models. Two providers offering the same named model may be serving different precisions, and few say so. If you use one, run your own test set against that specific provider.

## 7. Failure modes from first principles

**In plain terms.** LLMs fail in characteristic ways that follow from how they are built. They state false things with confidence. They give different answers to the same question. They can be hijacked by instructions hidden in a document they read. They do not know about recent changes. And they lean towards agreeing with you. None of these will be fully fixed. They are managed by how you design the system around the model. **Who should read it:** everyone. This is the most important section of the part.

| Failure | Root cause | Main defence (part 4) |
| --- | --- | --- |
| Hallucination | Recall is reconstruction, and training rewarded confident guesses | Ground answers in supplied sources, and verify with tools |
| Non-determinism | Random sampling, plus variation in the serving infrastructure | Validate outputs, retry, and measure over many runs |
| Prompt injection | No hard boundary between instructions and data | Least privilege, approval gates, isolating untrusted content |
| Stale knowledge | Training data ends at a cutoff | Put current documentation and versions in the context |
| Sycophancy | Preference training rewarded agreement | Neutral framing and independent review |
| Compounding errors | Small per-step error rates multiply over long tasks | Checkpoints and automatic verification between steps |

### Hallucination

Three causes stack up. First, part 1 showed that the model regenerates facts from weights and has no built-in signal for "I have no record of that". Producing a plausible continuation is all it ever does. Second, training rewarded it. Pretraining rewards plausible text, and both preference training and most benchmarks score a confident guess above an honest "I don't know", like an exam with no penalty for wrong answers. Third, rare facts are weakly stored, as part 2 explained.

For engineers it shows up in specific places:

- API methods, parameters and command-line flags that look right and do not exist
- packages that do not exist. Attackers register commonly invented package names, so installing one without checking is a supply-chain risk
- details that are correct for a different version of the library
- invented configuration keys, URLs and citations
- confident descriptions of your own system when the model was not given the relevant code

Rates have fallen substantially with newer models, reasoning and grounding. They have not reached zero, and the errors that remain are more fluent and so harder to spot.

The defences are practical. Give the model the source material and ask it to quote or cite from it. Let it run code, because a compiler cannot be talked round. Tell it explicitly that "I don't know" is an acceptable answer. Scale your checking to the stakes.

### Non-determinism

Part 1 explained that sampling is random by design. The serving infrastructure adds a second, smaller source, covered in the deep dive below. The consequences are familiar to anyone who has chased a flaky test: a feature that worked yesterday, a bug report you cannot reproduce, a demo that goes differently on stage.

Manage it as you would any unreliable component. Validate outputs against a schema or a check, and retry on failure. Judge quality by success rate over many runs, never by one run. Pin model versions. Log full prompts and responses so that failures can be examined afterwards.

### Prompt injection

The model receives a single stream of tokens. System prompt, user message, web page and tool output all arrive the same way. Nothing in the architecture marks which parts are instructions and which are merely data to be processed.

The closest analogy is SQL injection, with one painful difference: there is no equivalent of the parameterised query. Any text the model reads can attempt to instruct it, including web pages, emails, PDFs, code comments, issue tickets, tool descriptions and tool results. The instruction-hierarchy training from part 2 helps, and it does not hold against a determined attacker.

The risk scales with what the model is able to do. A chatbot that gets injected gives a wrong answer. An agent with tools can leak data or take destructive action. The combination to avoid is an agent that has all three of: access to private data, exposure to untrusted content, and a way to send data out.

For coding agents, untrusted content includes a README in a dependency, a comment in a pull request from outside, or the body of a public issue. Part 4 covers the defences: least privilege, human approval for consequential actions, sandboxing, and keeping secrets out of the context.

### Stale knowledge

The model's knowledge ends at its cutoff and is thin for the months before it. In practice it suggests deprecated APIs, older versions of frameworks, superseded best practice and last year's model names. It also does not know what it does not know, so it will not warn you that something may have changed.

The fix is cheap: put the current documentation, your lockfile or the relevant version numbers in the context, or give the model a search tool.

### Sycophancy, operationally

Part 2 explained where it comes from. In daily use it has three costs. The model confirms a flawed plan because you sounded committed to it. It abandons a correct position when you push back. And it reviews code more gently when it believes the author is present.

Ask without signalling the answer you want. Request the strongest objections explicitly. Run reviews in a fresh context that has no stake in the work.

### Compounding errors in long tasks

A model that gets each step right 98% of the time completes a 50-step task without error only 36% of the time. Agents therefore need verification between steps, such as running tests, checking types and confirming that a file really changed, and they need checkpoints to return to. This is why part 4 treats fast automatic feedback as the foundation of agent work.

### Two smaller habits

- **Overreach.** Agents sometimes do more than was asked: reformatting untouched files, upgrading a dependency, refactoring nearby code. Keep tasks tightly scoped and review the full diff.
- **Shortcuts.** Models sometimes leave placeholders such as "rest of implementation here", or stub out a hard part. Combined with the reward hacking described in part 2, this means "the tests pass" is a claim to verify, not a conclusion.

### What this means for speed

Every failure in this section has a known cause, and so every one has a defence that can run automatically: grounding and citation checks, schema validation and retries, sandboxing and scoped permissions, tests between steps. A person reading everything the model produces is the fallback for when those defences are missing. It is slow, and part 5 shows it is less reliable than it feels.

Build the defences and the person can step back to the decisions that need them. This is the link between understanding how models fail and being able to work at their pace.

### Deep dive (optional): why temperature 0 is not deterministic

At temperature 0 the sampler always takes the top-scoring token, so identical inputs should give identical outputs. In hosted APIs they often do not.

The cause is floating-point arithmetic. Adding the same numbers in a different order gives very slightly different results. GPU routines choose their order of operations according to the shape of the work, and that shape depends on how many other requests are batched with yours. Batch composition changes from moment to moment with load.

The differences are tiny, in the last decimal places of the logits. But when two candidate tokens are nearly tied, a tiny difference flips the winner. From that token onward the two runs are continuing different texts, and they diverge. Mixture-of-experts models add a further dependence on the batch, because expert capacity is shared across requests.

Research in 2025 showed that inference can be made fully reproducible using routines whose results do not depend on batch size, at some cost in speed. Hosted APIs do not generally run this way. Other sources of drift include a vendor updating the model behind an unchanged alias, and requests landing on different hardware. Some APIs accept a seed parameter, which is best effort only.

The working conclusion: temperature 0 makes output far more consistent, and you should still not write a test that asserts an exact string.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Prefill and decode | Parallel, compute-bound processing of the prompt, then sequential, memory-bound generation of each output token | It reads fast and writes slowly. Long answers, not long questions, are what make you wait |
| KV cache | Stored keys and values for every earlier token, so each new token needs only its own computation | The model's working notes on what it has read, kept so it need not re-read everything for each word |
| Prompt caching | Reuse of a stored KV cache across requests that share an exact prefix, at a discounted input rate | If we start each request with the same material, the vendor remembers it briefly and charges us about a tenth for that part |
| Context window | Maximum total tokens of input, thinking and output in one call | How much the model can hold in view at once. Roughly 500 pages for a typical model |
| Context rot | Declining accuracy as context grows, from diluted attention and distraction, well before the limit | The more we pile in front of it, the more it misses. A focused brief beats a document dump |
| Thinking budget | A cap on reasoning tokens produced before the answer, billed as output | How long we let it think before replying. More helps on hard problems and costs more |
| Rate limit | Per-minute caps on requests and on input and output tokens | A speed limit on our account. Heavy automation needs a higher one arranged in advance |
| Quantisation | Storing weights at reduced precision, such as 8 or 4 bits, trading a little quality for memory and speed | A compressed copy of the model. Smaller and faster, slightly less sharp |
| Open-weight model | A model whose trained weights can be downloaded and run by anyone, under a licence | A model we could run on our own servers, instead of renting access |
| Hallucination | Fluent output unsupported by the training data or the context, from reconstruction-based recall and incentives to guess | It fills gaps with plausible inventions and says them in the same confident voice as the facts |
| Prompt injection | Instructions embedded in data the model processes, exploiting the absence of an instruction and data boundary | Text hidden in a document or web page that tells the AI to do something else, and it may obey |
| Non-determinism | Output variation from sampling and from batch-dependent numerics in serving | Ask twice and you may get two different answers. We design for that and do not assume consistency |

## Misconceptions to correct

### "A million-token window means it reads everything equally well"

**True:** the model can accept that much, and it will find a single planted fact almost anywhere in it.

**Misleading:** accuracy on anything harder falls as the input grows, the middle is used worst, and near-relevant clutter actively misleads. The full window is also slow and expensive on every call.

**What to say:** "It can take the whole thing, and it will do a better job with the right ten pages. Our effort should go into choosing what to give it."

### "Hallucination is a bug that will be patched out"

**True:** rates are falling with each generation, and grounding in sources reduces them a great deal.

**Misleading:** it follows from how the model recalls and how it was rewarded, so it shrinks and does not vanish. Planning on zero is planning to be caught out.

**What to say:** "It is getting rarer, not going away. We treat the model like a capable new hire: we give it the source material and we check work in proportion to the stakes."

### "Self-hosting will be cheaper"

**True:** per-token prices for open models are low, and a fully loaded server does beat API prices.

**Misleading:** our usage is bursty, so the server would sit idle most of the time while costing the same. The open models are weaker than the frontier, and someone has to run the stack.

**What to say:** "We would pay for a server around the clock to use it a few hours a day, for a weaker model. If the concern is data, a cloud contract with the right terms addresses it for far less."

### "Set temperature to zero and it becomes reliable"

**True:** low temperature makes output much more consistent.

**Misleading:** consistent is not the same as correct. A model can be consistently wrong. Even at zero, hosted models are not perfectly repeatable.

**What to say:** "That setting reduces variety. Reliability comes from checking the output, and from measuring how often it is right across many runs."

## Glossary

Terms introduced in this part, in plain language and in alphabetical order. Earlier terms are defined in the glossaries of parts 1 and 2.

| Term | Meaning |
| --- | --- |
| Air-gapped | Physically cut off from outside networks |
| Batch processing | Submitting non-urgent requests to be run within hours, in return for a large discount |
| Batching | The provider running many users' requests through the model together to share the cost |
| Cache hit rate | The share of input tokens served from the prompt cache. A key cost metric for agents |
| Cascade | Trying a small model first and passing the task to a larger one only when needed |
| Compaction | Summarising a long session and restarting from the summary to clear out stale context |
| Compounding error | The way small per-step failure rates multiply into a high failure rate over a long task |
| Context rot | The decline in accuracy as more tokens accumulate in the context |
| Decode | The phase in which the model writes its output, one token at a time |
| Exponential backoff | Retrying a failed request after waits that double each time |
| FlashAttention | A method of computing attention in small blocks that makes long contexts practical |
| Grounding | Supplying source material in the prompt so the model answers from it and not from memory |
| Grouped-query attention | Sharing keys and values across groups of attention heads to shrink the KV cache |
| Hallucination | Fluent output that is false or unsupported |
| KV cache | The stored keys and values for every token read so far, which save the model from reprocessing them |
| Lost in the middle | The tendency for models to use the start and end of a long context better than the middle |
| Needle in a haystack | A test that plants one fact in a long document and asks the model to retrieve it |
| Non-determinism | Getting different outputs from the same input |
| Open-weight model | A model whose trained weights can be downloaded and run by anyone, under a licence |
| Output speed | Tokens produced per second once the response has started |
| Prefill | The phase in which the model reads the whole prompt in one parallel pass |
| Prompt caching | Reusing the stored processing of a repeated prompt prefix, billed at a reduced rate |
| Prompt injection | Text in a document, web page or tool result that tries to give the model instructions |
| Quantisation | Storing a model's weights with fewer bits to save memory and gain speed |
| Rate limit | A cap on requests or tokens per minute for an account |
| Reserved throughput | Guaranteed model capacity bought in advance |
| Routing | Deciding which model handles which request |
| Sandboxing | Running an agent's actions in an isolated environment where mistakes cannot do damage |
| Seed | A number that fixes the random choices in sampling, on a best-effort basis |
| Self-hosting | Running a model on hardware you operate or rent |
| Speculative decoding | Having a small model draft several tokens for the large model to verify at once, to speed up output |
| Streaming | Showing output as it is generated instead of waiting for the full response |
| Sub-agent | A separate model call, often on a smaller model, handed one part of a larger task |
| Supply-chain risk | The danger of pulling in malicious code through a dependency, including one a model invented |
| Thinking budget | The cap on how many reasoning tokens a model may produce before answering |
| Time to first token | The delay between sending a request and receiving the first piece of the response |
| Utilisation | The share of time that hardware is doing useful work |

# Guide 02: Reader B, the Naive Bayes classifier

**You write:** `core/classifier.py` (about 40 lines) and `core/train_classifier.py`
**When:** week 2, September 21 to 27
**Target:** 95% or better on held-back fake letters, and you can explain every
line at a whiteboard.

This is the piece of the project that is most clearly *yours*. It is a machine
learning model you built from arithmetic, with no library doing the thinking.
Judges notice that.

## What the thing actually does

It answers one question: **which of the three letters is this?** It takes the
text OCR pulled off the photo and returns a letter type. No dates, no names. One
question, answered offline, with no internet.

That narrowness is the point. Reader A (the LLM) does the rich extraction.
Reader B exists so that something you fully control and fully understand has an
independent vote, and so the app still works on a plane.

## The concepts, in order

### Bag of words

You throw away word order and keep only which words appeared and how often.
"county discontinued your benefits" becomes `{county: 1, discontinued: 1,
your: 1, benefits: 1}`. It sounds far too crude to work. It works remarkably
well, because for this job the vocabulary really does separate the classes.

### The probability you actually want

Given the words in this letter, which letter type is most likely? Written down:

```
P(letter type | words)
```

You cannot compute that directly. Bayes' rule flips it into things you can count:

```
P(type | words)  is proportional to  P(type) * P(words | type)
```

- `P(type)` is the **prior**: how common is this type in training? If you
  generate 800 of each, all three priors are equal and the term does nothing.
  Write it anyway, because it is one line and the moment your class counts are
  uneven it starts mattering.
- `P(words | type)` is the **likelihood**: how likely are these exact words in a
  letter of this type?

### Where "naive" comes from

Computing `P(words | type)` properly would mean knowing how every word interacts
with every other word. The naive assumption is: **pretend every word is
independent given the class.** Then the likelihood is just a product:

```
P(words | type) = P(word1 | type) * P(word2 | type) * ...
```

This assumption is false. "Notice" and "action" are obviously not independent.
It still works, because you only need the *ranking* of the three scores to be
right, not the actual probabilities. Say exactly that at the whiteboard. Knowing
your model's assumption is wrong and why it does not matter is the difference
between using a technique and understanding it.

### Each word's probability is a count

```
P(word | type) = (times the word appears in that type's letters) / (total words in that type's letters)
```

That is it. "Training" is counting. There is no gradient descent, no epochs,
nothing to converge. You loop through the training files once and tally.

### Add-one smoothing, and why it saves you

Problem: if a word never appeared in MC 355 training letters, `P(word | MC 355)`
is zero, and one zero in a product makes the whole thing zero. A single unseen
word would veto an entire class no matter how much the other fifty words agree.

Fix: add 1 to every count, and add the vocabulary size to every denominator.

```
P(word | type) = (count + 1) / (total words in type + size of vocabulary)
```

Nothing is ever zero. Adding the vocabulary size to the bottom keeps each class's
probabilities summing to 1. This is **Laplace smoothing**, and "why do we add 1?"
is the single most likely question you will be asked about this file.

### Logs, and why the naive version breaks without them

Multiplying 300 small probabilities gives a number so tiny the computer rounds it
to zero. Every class scores zero and you cannot rank them. This is called
**underflow**.

Fix: take the logarithm and add instead of multiply. `log(a*b) = log(a)+log(b)`,
and logs of small numbers are comfortably sized negatives. The ranking is
unchanged because log is increasing. So:

```
score(type) = log P(type) + sum over words of log P(word | type)
```

Pick the highest score. Scores will be large negative numbers like -1847.3. That
is correct and expected.

### Words you have never seen

A real letter will contain words absent from training. Simplest policy: skip
them. State your policy in a comment, because it is a real decision.

## The shape of the two files

`classifier.py` holds the model: turning text into words, training from counted
examples, and scoring a new document. `train_classifier.py` is the script that
loads `data/synthetic/`, splits it, calls the trainer, prints accuracy, and
writes the model out. Keeping them apart matters because week 2 exports the
trained model to `app/public/model.json` so the browser can run it, and Claude
writes the browser side to match your Python exactly. The cleaner the split, the
easier that is.

Think in terms of: something that tokenizes, something that trains, something
that predicts, something that saves and loads. Plain functions. No classes needed
unless you want one.

## Decisions that are yours

1. **Tokenizing.** Lowercase? Strip punctuation? Keep numbers, or replace every
   digit run with a marker like `<NUM>`? That last one is interesting: case
   numbers are random noise and probably hurt, but "90 days" might be a real
   signal. Try both and let the accuracy table decide.
2. **Stop words.** Drop "the", "and", "of"? They appear everywhere so they
   contribute nearly equally to every class and mostly cancel out. Dropping them
   shrinks the model. Your call, with a reason.
3. **Counts or presence?** Count a word five times if it appears five times
   (multinomial), or just once (Bernoulli)? Multinomial is the usual choice.
4. **The train/test split.** 80/20, per CONTEXT.md. Shuffle with a fixed seed so
   your numbers reproduce. Never let a test letter influence training.
5. **What "unknown" means at prediction time.** If the top two scores are nearly
   tied, is that an answer or a shrug? This connects directly to the "must agree"
   logic in week 2 and to the unknown-class decision from guide 01.

## Worked example, in a different domain

Classifying text messages as **spam** or **ham** (not spam). Training set:

| Message | Class |
|---|---|
| "win free money now" | spam |
| "free money click here" | spam |
| "see you at practice" | ham |
| "you left your jacket here" | ham |

**Vocabulary** (unique words across everything): win, free, money, now, click,
here, see, you, at, practice, left, your, jacket. That is **13 words**.

**Spam word counts:** win 1, free 2, money 2, now 1, click 1, here 1.
Total spam words = 8.
**Ham word counts:** see 1, you 2, at 1, practice 1, left 1, your 1, jacket 1,
here 1. Total ham words = 9.

**Priors:** 2 spam, 2 ham out of 4, so `P(spam) = P(ham) = 0.5`.

Now classify the new message **"free money here"**.

With add-one smoothing, denominators are `8 + 13 = 21` for spam and `9 + 13 = 22`
for ham.

Spam:
- `P(free|spam)  = (2+1)/21 = 3/21 = 0.1429`
- `P(money|spam) = (2+1)/21 = 3/21 = 0.1429`
- `P(here|spam)  = (1+1)/21 = 2/21 = 0.0952`
- score = log(0.5) + log(0.1429) + log(0.1429) + log(0.0952)
- score = -0.693 + (-1.945) + (-1.945) + (-2.352) = **-6.936**

Ham:
- `P(free|ham)  = (0+1)/22 = 1/22 = 0.0455`
- `P(money|ham) = (0+1)/22 = 1/22 = 0.0455`
- `P(here|ham)  = (1+1)/22 = 2/22 = 0.0909`
- score = log(0.5) + log(0.0455) + log(0.0455) + log(0.0909)
- score = -0.693 + (-3.091) + (-3.091) + (-2.398) = **-9.273**

`-6.936` beats `-9.273`, so: **spam**. Correct.

Look at what smoothing did. "free" and "money" never appear in ham. Without
smoothing, ham's score would be exactly zero, and "here" agreeing with ham would
count for nothing. With smoothing, ham stays in the race and simply loses on the
evidence. That is the behaviour you want, and that example is the answer to
"why add 1?"

Work that example on paper before you write code. If you can reproduce those
numbers by hand, the code is transcription.

## Testing it

- **80/20 split**, fixed seed. Report accuracy on the 20% the model never saw.
- **A confusion matrix.** A 3 by 3 grid: true type down the side, predicted type
  across the top. Overall accuracy hides the interesting failure. If MC 239 A is
  being called MC 355, that is a specific, fixable problem, and it is exactly the
  kind of chart that looks good on the evaluation dashboard.
- **Real clinic letters**, when they arrive. Test only. Never train on them.
  Expect a lower number than on fakes. The gap between the two is one of the most
  honest things in your whole submission, so publish it rather than hiding it.
- **Sanity check:** feed it a letter you wrote yourself that is obviously an
  MC 355. If it says MC 239 A, something is wrong in tokenizing, not in the math.

## Done checklist

- [ ] Roughly 40 lines, and you understand all of them.
- [ ] Add-one smoothing is in, and you can say why in one sentence.
- [ ] Log space, and you can say what breaks without it.
- [ ] Priors computed from the data, not hard-coded.
- [ ] Fixed random seed, so the accuracy number reproduces.
- [ ] Confusion matrix saved to `core/eval/`.
- [ ] Model exports to JSON for the browser.
- [ ] Unseen-word policy written in a comment.

## The whiteboard test

Four questions, two minutes each:

1. Explain Naive Bayes to someone who has not taken statistics.
2. Why "naive"? What is the assumption, is it true, and why does the model work
   anyway?
3. Why add 1 to every count?
4. Why logs?

Ask Claude to quiz you on these. That is reviewing, which is allowed and is
genuinely what the guide is for.

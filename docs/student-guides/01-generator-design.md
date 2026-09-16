# Guide 01: the fake-letter generator design

**You write:** `data/generator_design.md`
**When:** tonight, September 15. Everything in week 1 and week 2 waits on it.
**It is a document, not code.** No Python. Prose, lists and tables.

## Why this file decides how good the whole project is

The generator makes the thousands of fake letters your classifier trains on.
A classifier cannot learn anything that is not in its training data, and it will
happily learn things you did not mean to teach it.

Here is the failure that gets students every time. Suppose every fake MC 355 you
generate has the words "Request for Information" at exactly the same spot, and
every MC 239 A has "Notice of Action" at a different fixed spot. Your classifier
hits 99% accuracy and you feel great. Then you photograph a real letter where the
county used a slightly different heading, and it collapses. The model did not
learn what an MC 355 is. It learned where your generator puts text.

So the real question this file answers is: **what varies in real county mail, and
what stays fixed?** Get that right and the model learns the letter. Get it wrong
and the model learns your generator.

You now have the real templates in `data/templates/` to answer that from:
`mc210rv_eng.pdf`, `mc355_eng.pdf`, and `mc239a.pdf`. Open all three and read
them before writing a word of the design. The MC 239 A is one page and it is the
most important letter in the project, so read that one twice.

## What a good design document contains

### 1. One section per letter type

Three sections: the MC 210 RV renewal packet cover letter, the MC 355, and the
MC 239 A discontinuance. For each one, describe:

- **What the page looks like.** Header, county block, address block, body,
  footer. A rough sketch in words is fine. Someone who has never seen the letter
  should be able to picture it.
- **The fixed text.** The boilerplate that is the same on every copy. This is
  what the classifier will actually key on, so write down the exact phrases.
- **The variable fields.** Everything the county fills in.

### 2. For every variable field, the range it is drawn from

A table per letter works well: field name, what it is, and how it varies. Be
specific about format, because format variation is most of what OCR has to cope
with. A date is not just "a date." Is it `03/04/2026`, `March 4, 2026`,
`3/4/26`? If real letters use more than one, your fakes must too.

Think about: notice date, due date, effective date, case number, worker name,
worker number, phone number, office address and hours, the person's name, other
household members, the list of missing items, the regulation citations, and the
county (Santa Clara or San Mateo, since those are your two).

### 3. What you deliberately do NOT randomize, and why

Just as important. If a real MC 355 always says "REQUEST FOR INFORMATION" at the
top, keep it fixed. Randomizing something that is genuinely fixed in real life
teaches the model that the phrase does not matter, which is exactly backwards.

### 4. How a photo differs from a PDF

Your users photograph paper. Your generator makes clean digital pages. That gap
is where accuracy goes to die. List what you will simulate: slight rotation,
uneven lighting or shadow, a crease or fold line, slight blur, the page not
filling the frame, maybe a thumb at the edge. Give rough ranges, for example
"rotation between negative 3 and positive 3 degrees."

Decide how many of your 800 per type are clean and how many are degraded. There
is a real tradeoff and you should state your reasoning.

### 5. The label file

Say exactly what `labels.csv` records per generated image.

One insight worth acting on: the generator **knows the true value of every field
it stamped**. If you record those values in `labels.csv`, not just the letter
type, you get a ground-truth test set for Reader A (the LLM extractor) for free.
That is a large amount of week 3 evaluation work bought with one extra column
per field tonight. Strongly consider it.

### 6. The edge cases you include on purpose

The letters that are hard. A notice dated the last day of a month. A discontinuance
where the effective date is the same day as the notice date. A letter listing
five missing items instead of one. A renewal with the property supplement
(required for renewals due on or after January 1, 2026, per ACWDL 25-14) and one
without. Name them, because if they are not in the design they will not be in the
data, and you will find out in week 4 when it is expensive.

## Decisions that are yours, which I am not going to make for you

1. **Does the classifier get an "unknown" class?** CLAUDE.md says anything that
   is not one of the three letters is "unknown" and gets the generic path. So:
   do you generate a fourth pile of not-our-letter documents to train on, or do
   you decide "unknown" using a confidence threshold on the three classes
   instead? Both are legitimate. They lead to different generators and different
   accuracy tables. Pick one and write down why.
2. **How many of the 800 per type are degraded, and how badly?** Too clean and
   it fails on real photos. Too degraded and it never learns the clean signal.
3. **Which fields share a distribution across letter types?** Case numbers and
   worker names presumably look the same on all three. Saying so once and
   referring back keeps the document short.
4. **How do you keep the test set honest?** If the same random seed or the same
   fake person appears in both training and test, your accuracy number is a lie.
   State the rule you will follow.

## Worked example, in a different domain

Suppose you were generating fake **library overdue notices** to train a
classifier to tell "overdue notice" from "hold ready for pickup."

> ### Letter type: overdue notice
>
> **Layout:** Library logo top left. Branch name and address below it. Patron
> name and address in the middle left. Body. Fine schedule in a box at the bottom.
>
> **Fixed text:** The heading "OVERDUE NOTICE" and the sentence "Please return
> the following item(s) to any branch." Present on every copy, never varied.
>
> **Variable fields:**
>
> | Field | What it is | How it varies |
> |---|---|---|
> | Branch name | Which library | 1 of 12 branch names |
> | Patron name | The borrower | Random first and last from a name list |
> | Due date | When it was due | Uniform over the last 60 days; formats `03/04/2026`, `March 4, 2026`, `3/4/26` in a 60/30/10 split |
> | Item count | How many books | 1 to 4, weighted toward 1 |
> | Fine amount | Money owed | $0.25 to $12.00, always 2 decimal places |
>
> **Not randomized:** the fine schedule box. It is identical on every real notice,
> so it stays identical here.
>
> **Photo realism:** rotation negative 3 to positive 3 degrees; brightness 0.7 to
> 1.2; a fold line across the middle on 30% of images; slight blur on 20%.
> 60% clean, 40% degraded.
>
> **Edge cases on purpose:** a notice with 4 items so the body runs long and
> pushes the fine box down; a due date of February 29; a patron with a very long
> name that wraps.
>
> **labels.csv columns:** `filename, letter_type, branch, patron_name, due_date,
> due_date_raw_format, item_count, fine_amount`

Notice what that example does: it commits to actual numbers, it explains one
choice ("weighted toward 1"), and it records ground truth beyond just the class
label. Yours should do the same for Medi-Cal letters. Do not copy the structure
mechanically; your letters have different fields and different reasons.

## Done checklist

- [ ] All three letter types have their own section.
- [ ] Every variable field has a stated range or list, with formats.
- [ ] Fixed boilerplate is written out, quoted exactly from the real PDF.
- [ ] Photo realism ranges are numbers, not adjectives.
- [ ] `labels.csv` columns are listed explicitly.
- [ ] The "unknown" class decision is made and the reason is written down.
- [ ] Train/test contamination rule is stated.
- [ ] At least three deliberate edge cases per letter type.
- [ ] Someone else could build the generator from this document without asking
      you a single question. That is the bar.

## The whiteboard test

A judge points at your accuracy table and asks: **"How do I know your classifier
learned to read the letter instead of memorizing your generator?"**

Your answer lives in this document. It sounds like: here is what I varied, here
is why, here is what I kept fixed because it is genuinely fixed in real mail, and
here is the score on real clinic letters that my generator never saw. If you can
say that in two minutes, this file did its job.

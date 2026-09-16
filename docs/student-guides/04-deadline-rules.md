# Guide 04: the deadline rules and their tests

**You write:** `core/rules/deadlines.json` and `core/rules/test_deadlines.py`
**When:** week 3
**Done when:** 20 tests pass.

plan v3 calls the legal logic "the product." This is that file.

## What it is, and what it is not

`deadlines.json` is **data, not code.** It is a list of rules. Each rule says:
for this kind of letter, starting from this date, count this many days, and here
is the law that says so.

The code that reads the file and does the counting is `app/src/deadlines.ts`,
which Claude writes. It must be a **pure function**: same inputs always give the
same answer, and today's date is passed in rather than read from the system
clock. That is what makes deadlines testable. A test for "90 days after a
discontinuance" that secretly depends on when you run it is not a test.

**Decide your JSON shape first and tell Claude, so the evaluator is built to
match.** Changing the shape after the evaluator exists means rewriting both.

## What every rule needs

- **An id.** Stable, referenced by tests and by the UI.
- **Which letter type it applies to.**
- **The anchor**: which date it counts from (notice date, due date, effective
  date). Different rules use different anchors, and mixing them up is the classic
  bug.
- **The offset**: how many days, and forward or backward.
- **The citation.** Every rule carries the law it comes from. This is what lets a
  countdown card show "W&IC 10951" next to the clock, and it is a large part of
  why judges will believe the app.
- **What the user sees.** The plain-language label on the countdown.

The rules from CLAUDE.md, which you encode with citations:

| Rule | Window | Authority |
|---|---|---|
| Renewal due date | printed on the letter | the letter itself |
| MC 355 response | 30 days from notice date | on the notice |
| Cure period after discontinuance | 90 days | W&IC 14005.37; MEDIL I14-60; I15-22E; ACWDL 25-14 for assets |
| State hearing request | 90 days from notice date | W&IC 10951 |
| Aid paid pending | before the effective date | W&IC 10951 |
| Covered California special enrollment | 90 days after discontinuance | 10 CCR 6504(f)(6) |

All the cited documents are in `data/templates/`. Read the actual sentence in
the actual letter before you encode a rule from it. If you cannot point at the
sentence, you cannot defend the rule.

## Decisions that are yours

1. **Weekends and holidays.** If a deadline lands on a Sunday, does it move to
   Monday? For some legal deadlines yes, for others no. **Do not guess, and do
   not let a language model guess for you.** Find it in the letters or ask the
   legal aid contact. If you cannot confirm it, encode the conservative reading
   (the earlier date) and write a comment saying the question is open. Telling
   someone they have longer than they do is the one error this app must never
   make.
2. **Inclusive counting.** Is the notice date day 0 or day 1? This shifts every
   deadline by one. Pick it, write it down, and test it.
3. **The holiday list.** 2026 and 2027 state holidays, if holidays matter. Data,
   in the file, not code.
4. **Missing anchors.** If a discontinuance letter has no effective date, what
   happens to rules anchored on it? Suppressed, or shown as unknown? There is a
   right answer for users, and it is not "crash."

## Worked example, in a different domain

Library book rules, as data:

```json
{
  "rules": [
    {
      "id": "return_by",
      "applies_to": "checkout_receipt",
      "anchor": "checkout_date",
      "offset_days": 21,
      "direction": "after",
      "label": "Return the book by this date",
      "citation": "Library Policy 4.2"
    },
    {
      "id": "renew_deadline",
      "applies_to": "checkout_receipt",
      "anchor": "checkout_date",
      "offset_days": 18,
      "direction": "after",
      "label": "Last day you can renew online",
      "citation": "Library Policy 4.7"
    }
  ]
}
```

Two rules, same anchor, different offsets, each carrying its citation. Your file
is this idea with real law attached. Do not copy the field names blindly; yours
need things this example has no use for.

## The 20 tests

plan v3 names the cases. Write them as data-driven tests: a table of
(letter type, dates in, expected deadlines out), one test that loops the table.

Cover:
- A plain case for each of the three letter types.
- **Month ends.** 30 days after January 31. 90 days after November 30.
- **A leap year.** February 29, 2028 exists; 2026 and 2027 have no February 29.
- **A deadline landing on a weekend**, testing whatever you decided in decision 1.
- **A holiday**, same.
- **A discontinuance with all three clocks running at once**, which is the demo
  case, so it must be right on camera.
- **A missing anchor date.**
- **An already-expired deadline.** Negative days remaining must not display as a
  cheerful countdown.
- **The boundary**: exactly on the effective date. Does aid paid pending still
  apply? This is the same boundary the county-mistake rules turn on in guide 05,
  so get it right once here.

## Done checklist

- [ ] Every rule has a citation you can point to in a real document.
- [ ] Inclusive-counting decision written down and tested.
- [ ] Weekend and holiday decision written down, or flagged as an open question.
- [ ] No dates hard-coded anywhere; today is an input.
- [ ] 20 tests, all green, one command.
- [ ] JSON shape agreed with Claude before the evaluator was written.

## The whiteboard test

**"Where does this 90 days come from?"**

You should be able to name the statute, open the PDF in `data/templates/`, and
point at the sentence. That is a very different answer from "the AI said so," and
it is the answer this whole file exists to make possible.

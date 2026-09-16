# Guide 06: the checker

**You write:** `core/checker.py` (about 30 lines) and `core/test_checker.py`
**When:** week 4

The smallest student-owned file and one of the most persuasive. It is the last
thing between a user and sending a wrong form to the county.

## What it does

Before anything is sent, read the **filled form** and compare every field against
the **facts the user confirmed**. Any mismatch blocks sending and shows both
values side by side.

The insight worth stating out loud: the app filled the form from the confirmed
facts, so in theory they cannot disagree. In practice, they can. Fields get
mapped to the wrong box, a date gets reformatted and mangled, a name gets
truncated, a value gets written to page 2 instead of page 1. The checker catches
the bug class you did not anticipate, which is exactly why it reads the finished
artifact rather than trusting the process that produced it.

This is the same reason a pilot reads a checklist out loud while looking at the
instruments, instead of trusting that they set them correctly a minute ago.

## The one hard part: normalizing before comparing

`03/04/2026` and `2026-03-04` are the same date and different strings. `John
Smith` and `JOHN SMITH ` are the same name. A checker that flags those is noise,
and a noisy checker gets ignored, which is worse than no checker.

So compare meaning, not characters: parse dates to a common form, trim and
collapse whitespace, normalize case for names, strip formatting from phone
numbers.

But do not normalize so aggressively that you hide a real error. If `March 4` and
`April 3` both collapse to something equal, you have built a checker that cannot
fail. The test for a planted wrong date is what proves you did not.

## Decisions that are yours

1. **Which fields are checked.** All of them, or the ones that matter? A missing
   middle initial is not a crisis; a wrong effective date is.
2. **Blocking versus warning.** CLAUDE.md says a mismatch blocks. Is every
   mismatch equally blocking, or is there a warn tier? If there is, be careful:
   a warn tier is how safety features quietly die.
3. **Missing versus wrong.** Is a blank field where a fact exists a mismatch? It
   probably is.
4. **What the user sees.** Both values, labelled clearly enough that a stressed
   person can tell which is which and which one to fix.

## The tests

- **The planted wrong date blocks.** This is the demo moment, on camera, so it
  must be certain. plan v3 lists it explicitly.
- **A correct form passes.** The false-positive case.
- **Format differences do not trip it:** `03/04/2026` versus `2026-03-04` passes.
- **A blank field where a fact exists.**
- **Two mismatches at once**, both reported, not just the first.
- **A near-miss:** `2026-03-04` versus `2026-04-03`. Must fail. This is what
   proves your date normalizing is not too aggressive.

## Done checklist

- [ ] About 30 lines and you understand every one.
- [ ] Normalizes dates, whitespace, and case before comparing.
- [ ] Reports every mismatch, not just the first.
- [ ] Reports both values so the user can act.
- [ ] The planted wrong date test is green and filmable.
- [ ] The near-miss date test proves normalizing is not hiding errors.

## The whiteboard test

**"The app filled the form from the confirmed facts. Why check it against the
same facts?"**

Because filling is code and code has bugs, and the failure mode is a wrong
document arriving at a county office with someone's coverage attached to it. The
checker reads the finished artifact instead of trusting the process. Cheap to
write, and it catches the bug you did not think of.

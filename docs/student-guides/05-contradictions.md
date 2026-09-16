# Guide 05: the county-mistake rules

**You write:** `core/contradictions.py` (about 50 lines) and `core/test_contradictions.py`
**When:** week 4

plan v3 calls this "the feature no one else has." Propel explains notices. Nava
helps caseworkers fill forms. Nobody tells the person that **the county broke its
own rule.** This file is that.

## What it does

Input: the timeline. A dated list of what happened, mixing what the county sent
with what the user did, including upload receipts and fax receipts.

Output: which rules fired, and the facts that fired them, so the app can explain
itself and the LLM can draft a rescission request from real facts rather than
vibes.

Two rules, from CLAUDE.md:

1. **Returned before the effective date but discontinued anyway.** The county
   shall rescind the termination and restore benefits while it waits for
   verification. DHCS MEDIL I15-22, citing ACWDL 11-23, Q25.
2. **Information received inside the 90-day cure period, nothing restored.**
   Must be treated as received timely. W&IC 14005.37(a); MEDIL I15-22E.

Read both letters in `data/templates/` before encoding either. `medil_I15-22.pdf`
and `medil_I15-22E.pdf` are two pages each.

## The design that matters

Rules **decide**, the LLM **writes**. The LLM never determines whether a
violation occurred; it only turns a violation your code found into readable
English. Keep that boundary crisp, because it is the thing that makes the feature
trustworthy, and it is what you say when a judge asks whether the AI might be
accusing the county wrongly.

A rule that fires should return enough to justify itself: which rule, the dates
involved, and the citation. "Violation: true" is not enough to draft a letter
from, and not enough to show a user who deserves to know why.

## Decisions that are yours

1. **What a timeline event looks like.** Minimum: a date, a kind, and a
   description. Probably a source too, since "the county says they sent it" and
   "I have an upload receipt" carry very different weight.
2. **Boundary behaviour.** "Before the effective date" on exactly the effective
   date: does the rule fire? Same boundary as guide 04. Decide once, test both
   sides.
3. **Evidence strength.** Does an unverified user claim fire a rule, or does it
   need a receipt? Accusing a county of a violation on no evidence is a bad
   outcome for a user heading into a hearing.
4. **Can both rules fire at once?** Probably yes. Make sure the output handles it.

## The tests: three per rule, minimum

For each rule:
- **A clear violation.** Fires.
- **A clean case.** Does not fire. This is the one students skip, and a rule that
  fires on everything is worse than no rule.
- **The edge**, exactly on the boundary date.

Plus: empty timeline, events out of order, both rules firing together.

## Done checklist

- [ ] Both rules carry their citation in the output.
- [ ] Output has enough facts to draft a letter from.
- [ ] Clean cases tested, not just violations.
- [ ] Boundary tested on both sides.
- [ ] No LLM call anywhere in this file.

## The whiteboard test

**"What if your app tells someone the county made a mistake, and it did not?"**

Answer with the design: rules decide and the model only writes; every rule cites
a specific state letter; clean cases are tested; and the user reviews and edits
the draft before anything is signed or sent.

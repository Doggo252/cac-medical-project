# TODO

Schedule for ReplyBy, cut against real available hours. Updated September 15, 2026.

Deadline: **Monday October 26, 2026, 9:00 am Pacific.** Submit **Saturday
October 24.**

## The time budget

| Day | Hours |
|---|---|
| Monday | 0 |
| Tuesday | 1 |
| Wednesday | 1 |
| Thursday | 1.5 |
| Friday | 1 |
| Saturday | 2.5 |
| Sunday | 2.5 |
| **Per week** | **9.5** |

| Week | Dates | Hours |
|---|---|---|
| 1 | Tue 09/15 to Sun 09/20 | 9.5 |
| 2 | Mon 09/21 to Sun 09/27 | 9.5 |
| 3 | Mon 09/28 to Sun 10/04 | 9.5 |
| 4 | Mon 10/05 to Sun 10/11 | 9.5 |
| 5 | Mon 10/12 to Sun 10/18 | 9.5 |
| 6 | Mon 10/19 to Sat 10/24 | 7.0 |
| | **Total** | **54.5** |


## How the week is shaped

- **Saturday and Sunday** carry the authored pieces: the classifier, the rules
  file, the county-mistake rules. These need a long enough run to hold the whole
  problem in your head.
- **Thursday** takes one medium coding chunk.
- **Tuesday, Wednesday, Friday** take reading, decisions, reviews, documents, and
  emails. Things that finish in an hour.
- **Monday** is the slip day. It costs nothing to lose, so overruns land there.

Legend: **[N]** Neil writes it. **[C]** Claude writes it.

---

## Week 1: Tue 9/15 to Sun 9/20
*Goal: generator design done, 800 letters per type.*

- [ ] **Wed 9/16 (1h)** [N] Read guide 01. Open `mc239a.pdf` (1 page, read it
      twice) and `mc355_eng.pdf` (3 pages). Write the **MC 239 A section** of
      `data/generator_design.md`.
- [ ] **Thu 9/17 (1.5h)** [N] MC 355 and MC 210 RV cover-letter sections. Then
      finish the document: photo-realism numbers, `labels.csv` columns, edge
      cases, and the two decisions (unknown class, train/test contamination
      rule). Hand to Claude.
- [ ] **Fri 9/18 (1h)** [C] writes `data/generate.py`. [N] compares 10 rendered
      letters against the real PDFs and says what looks fake.
- [ ] **Sat 9/19 (2.5h)** [C] fixes the generator from those notes and generates
      800 per type. [N] **sits with Grandpa and looks at his real Medi-Cal mail**,
      redacting the case number. One real letter is worth more for testing than
      800 fake ones.
- [ ] **Sun 9/20 (2.5h)** [N] **Replace Ravenswood (declined 9/16).** Email
      Sourcewise HICAP and Community Health Partnership; with a parent, call
      SALA's North County line. Contacts are in `SOURCES.md` section F. Then:
      problem statement in your own words. Confirm the
      app name. Decide Phaxio or SRFax. Buffer.

> Thursday now carries the whole rest of the design because Tuesday was
> postponed. If it overruns, Monday 9/21 is free.

**Checkpoint 9/20:** fake letters generated. App on the phone and forms
downloaded are already done.

---

## Week 2: Mon 9/21 to Sun 9/27, the two readers
*The heaviest authored week, and the biggest schedule risk in the project.*

- [ ] **Tue 9/22 (1h)** [N] **Follow up with Bay Area Legal Aid** if no reply,
      and with any new contacts from Sunday. Then read the concept sections of guide 02. No code.
- [ ] **Wed 9/23 (1h)** [N] Work the spam example from guide 02 on paper.
      Reproduce `-6.936` and `-9.273` by hand. Do not write code until you can.
- [ ] **Thu 9/24 (1.5h)** [N] Write `prompts/extract.md` (guide 03).
- [ ] **Fri 9/25 (1h)** [C] shows the camera and OCR wiring. [N] verifies the
      redaction rule blanks every digit string of 6 or more characters.
- [ ] **Sat 9/26 (2.5h)** [N] **Write `core/classifier.py` by hand.** Tokenize,
      train, predict, running against the synthetic data.
- [ ] **Sun 9/27 (2.5h)** [N] `core/train_classifier.py`: 80/20 split, fixed
      seed, accuracy, confusion matrix into `core/eval/`, export `model.json`.

> Risk: if the classifier is not at 95% by Sunday night it eats Tuesday 9/29,
> and week 3 has no slack.

**Checkpoint 9/27:** photo of a printed mock letter returns structured facts on
the phone; both readers wired.

---

## Week 3: Mon 9/28 to Sun 10/4, facts, deadlines, explanations

- [ ] **Tue 9/29 (1h)** [N] Write the "must agree" logic. Decide what the app
      does when the two readers disagree.
- [ ] **Wed 9/30 (1h)** [N] Read guide 04. Open `medil_I14-60.pdf` and
      `medil_I15-22E.pdf` and find the actual sentence establishing the 90-day
      cure period. Decide inclusive counting. **Email legal aid the weekend and
      holiday question** so the answer has time to come back.
- [ ] **Thu 10/1 (1.5h)** [N] Explanation prompts, English and Spanish, plus the
      grounding check that rejects invented dates.
- [ ] **Fri 10/2 (1h)** [N] Review the confirm screen. Define which fields flag
      as low confidence.
- [ ] **Sat 10/3 (2.5h)** [N] **Write `core/rules/deadlines.json`** with
      citations. Send Claude the JSON shape in the first ten minutes so the
      evaluator gets built in parallel.
- [ ] **Sun 10/4 (2.5h)** [N] **Write the 20 deadline tests.** All green.
      Accuracy numbers saved to `core/eval/`.

**Checkpoint 10/4:** photo to countdown works end to end, with accuracy numbers.

---

## Week 4: Mon 10/5 to Sun 10/11, mistakes, forms, checker, vault

- [ ] **Tue 10/6 (1h)** [N] Read `medil_I15-22.pdf` and `medil_I15-22E.pdf`
      properly. Write both county-mistake rules out in plain English before any
      code.
- [ ] **Wed 10/7 (1h)** [N] Review the timeline screen. Decide the timeline event
      shape and the evidence-strength rule.
- [ ] **Thu 10/8 (1.5h)** [N] **Write `core/checker.py`** (about 30 lines).
- [ ] **Fri 10/9 (1h)** [N] Checker tests, including the near-miss
      (`2026-03-04` against `2026-04-03`).
- [ ] **Sat 10/10 (2.5h)** [N] **Write `core/contradictions.py`** (about 50
      lines) plus 6 tests, 3 per rule.
- [ ] **Sun 10/11 (2.5h)** [N] Rescission and hearing-reason prompts. Full end to
      end run.

**Checkpoint 10/11: scope freeze. Nothing new after this except the agent.**

---

## Week 5: Mon 10/12 to Sun 10/18, agent, hardening, people

- [ ] **Tue 10/13 (1h)** [N] Read guide 07. Draft the eight tool names, one-line
      purposes, and the `send_fax` guard.
- [ ] **Wed 10/14 (1h)** [N] Finish `agent/TOOLS.md`: inputs, outputs,
      preconditions, side effects, action-log format, what the agent may not do,
      iteration cap. Hand to Claude. **This must land before `loop.py` is written.**
- [ ] **Thu 10/15 (1.5h)** [C] builds `agent/loop.py` and the fax call. [N] runs
      the **airplane-mode test** and the **guard test**: an unsigned send must
      refuse and log why.
- [ ] **Fri 10/16 (1h)** [N] Counselor email review.
- [ ] **Sat 10/17 (2.5h)** [N] Real fax round trip to a test number. Ten clean
      end-to-end phone runs in different lighting. Write down the top five fixes.
- [ ] **Sun 10/18 (2.5h)** [N] Fix the top five. **Write the video script**
      (under 450 words). Record a rough cut as insurance against week 6.

**Checkpoint 10/18:** agent with a real fax round trip; evaluation dashboard;
airplane-mode test; user testing done.

---

## Week 6: Mon 10/19 to Sat 10/24, video and submission

- [ ] **Tue 10/20 (1h)** [C] repo cleanup: README, one-command test run. [N]
      reviews.
- [ ] **Wed 10/21 (1h)** [N] Submission write-up plus the AI disclosure copied
      from `AI-USE.md`.
- [ ] **Thu 10/22 (1.5h)** [N] **Record the app** on a phone stand. Record the
      story separately.
- [ ] **Fri 10/23 (1h)** [N] Edit to under three minutes.
- [ ] **Sat 10/24 (2.5h)** [N] **Whiteboard rehearsal**: the classifier, the
      rules, the checker, the agent guard, two minutes each, recorded once. Final
      check. **Submit.** Confirm the confirmation email arrives.

---

## Standing risks

- **One lost Saturday costs a week of authored output.** The four heaviest files
  (classifier, rules, contradictions, TOOLS.md) all land on weekends.
- **Week 6 gives 1.5 hours to record and 1 hour to edit.** Thin if a take goes
  wrong, which is why the rough cut on Sunday 10/18 is insurance, not busywork.
- **Offline testing needs a real HTTPS address.** Service workers do not run over
  plain HTTP, so the phone on local wifi cannot register one. This is a week 5
  problem, not a week 1 bug.

## Open questions

- [ ] Is Grandpa currently on Medi-Cal, and can one of his real letters be
      photographed, with permission and the case number redacted?
- [ ] Phaxio or SRFax, and which parent sets up the account?
- [ ] Do weekend and holiday rules move a Medi-Cal deadline? Ask legal aid. Do
      not let a language model guess this one.

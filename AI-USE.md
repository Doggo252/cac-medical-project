# AI use disclosure

This file lists every session where AI (Claude, through Claude Code) was used on
this project. It is kept because the Congressional App Challenge requires full
disclosure of AI use, and because AI is not allowed to be the whole technical
effort.

The split of work is written down in `CLAUDE.md`. In short: the letter
classifier, the legal deadline rules and their tests, the form checker, the
county-mistake rules, every LLM prompt, the agent tool spec, and the fake-letter
design are written by hand by the student. AI writes the app shell, the
backend plumbing, and the glue around those pieces.

Entries are appended newest last.

## 2026-09-15
Files created or edited: repository layout, `app/`, `backend/`, `Makefile`, `SOURCES.md`, `NEXT_VERSION.md`, `TODO.md`, `docs/student-guides/`, `data/templates/`, `data/handbook/`.
What I did: set up the app shell, backend, and tests; downloaded and verified the official forms; wrote study guides for the student-owned files; built the schedule.
What the student did: wrote the planning documents and CLAUDE.md, set the scope and time budget, contacted partner organizations, tested the app on a phone.

## 2026-09-16
Files created or edited: `SOURCES.md`, `TODO.md`, `data/templates/`.
What I did: researched replacement partner organizations; found CalSAWS example notices; reviewed the student's design draft and answered questions.
What the student did: wrote the MC 239 A section of `data/generator_design.md` and made its design decisions.

## 2026-09-17
Files created or edited: none.
What I did: reviewed the student's design drafts and answered questions.
What the student did: finished `data/generator_design.md`.

## 2026-09-18
Files created or edited: `data/generate.py`, `data/test_generate.py`, `pytest.ini`.
What I did: wrote the fake-letter generator from the student's design and improved its realism from the student's feedback; generated 800 letters per type.
What the student did: reviewed the sample letters and directed the changes (fonts, handwriting, layout mix).

## 2026-09-20
Files created or edited: `data/generate.py`, `data/test_generate.py`, `data/real/`, `docs/problem-statement.md`.
What I did: compared two real letters with the design; updated the generator to the real formats; edited the wording of the student's problem statement; researched fax services.
What the student did: collected and redacted real letters, updated the design from them, wrote the problem statement, chose the app name (ReplyBy), sent outreach emails.

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
What the student did: chose the idea and scope in earlier planning chats with Claude (which drafted the planning documents), set the time budget, contacted partner organizations, tested the app on a phone.

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
Files created or edited: `data/generate.py`, `data/test_generate.py`, `data/real/`, `docs/problem-statement.md`, `app/src/Capture.tsx`, `app/src/ocr.ts`, `app/src/image.ts`, `app/scripts/copy-ocr-files.mjs`.
What I did: compared two real letters with the design; updated the generator to the real formats; edited the wording of the student's problem statement; researched fax services; built the photo capture and on-phone text reading (OCR) screen.
What the student did: collected and redacted real letters, updated the design from them, wrote the problem statement, chose the app name (ReplyBy), sent outreach emails.

## 2026-09-22 to 2026-09-24
Files created or edited: none.
What I did: quizzed the student on the classifier concepts and checked his hand-worked example; reviewed drafts of `prompts/extract.md` and pointed out problems.
What the student did: worked the Naive Bayes example by hand; wrote `prompts/extract.md`.

## 2026-09-25
Files created or edited: `app/src/redact.ts`, `app/src/redact.test.ts`, `backend/redact.py`, `backend/tests/test_redact.py`.
What I did: wrote the redaction code (on the phone, with a server-side backup) and its tests.
What the student did: decided the redaction rule: blank case numbers, ID numbers, names and addresses; keep the worker's details.

## 2026-09-26
Files created or edited: `data/extract_text.py`.
What I did: wrote the script that saves each fake letter's text for training; reviewed the student's classifier as he wrote it and pointed out bugs.
What the student did: wrote `core/classifier.py` by hand (tokenize, train, predict, save, load).

## 2026-09-27
Files created or edited: `app/src/classify.ts`, `app/src/Capture.tsx`, `app/src/redact.ts`, `backend/main.py`, `backend/llm.py`, `backend/redact.py`, their tests, `core/eval/ocr_accuracy.py`, `core/eval/reader_b_ocr.md`, `data/generate.py`.
What I did: reviewed the student's training script; wrote the browser version of his classifier; built Reader A (the `/extract` endpoint using Gemini); installed Tesseract, measured the classifier on OCR text, and hardened the redaction after testing it on OCR output and the real letters; added the student's OTHER pile to the generator.
What the student did: wrote `core/train_classifier.py`; designed the fourth "OTHER" letter type and its mix; retrained the classifier on four types (98.4%); set up the Gemini API key.

## 2026-09-29
Files created or edited: `app/src/readerA.ts`, `app/src/Capture.tsx`, `app/vite.config.ts`.
What I did: reviewed the student's must-agree function; wired both readers and his rule into the camera screen.
What the student did: fixed the letter type names in `prompts/extract.md`; wrote the must-agree rule (`app/src/agree.ts`) and its four cases.

## 2026-09-30 to 2026-10-01
Files created or edited: `backend/main.py`, `backend/grounding.py`, `backend/tests/test_explain.py`, `backend/tests/test_grounding.py`, `TODO.md`.
What I did: reviewed drafts of the student's explanation prompt; built the `/explain` endpoint and the check that rejects explanations with dates not in the facts.
What the student did: found the legal sources for the 90-day rule and the weekend rule, decided how days are counted, wrote `prompts/explain.md`, and decided to rework the agent without faxing.

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

Files created or edited: repository layout and placeholder files; `AI-USE.md`,
`SOURCES.md`, `NEXT_VERSION.md`, `.gitignore`, `Makefile`, `pytest.ini`,
`.claude/launch.json`; the whole `app/` folder (React with Vite, hand-written
PWA manifest and service worker, icons, placeholder home screen);
`backend/main.py`, `backend/.env.example`, `backend/requirements.txt`,
`backend/tests/test_health.py`; placeholder-only files in `core/`, `prompts/`,
`agent/loop.py` and `data/generate.py`.

What I did (Claude): steps 2 through 6 of the first-session list in CLAUDE.md.
Built the repository skeleton, the installable app shell, and the FastAPI
backend with a `/health` endpoint that reports whether the API keys loaded but
never reveals them. Set up `make test-py` and `make test-js` with one passing
test each. Chose to hand-write the service worker rather than add a PWA plugin,
to keep the dependency list short and the offline behaviour readable.

What the student did: wrote `fullplan.md` and `CLAUDE.md`, which set the whole
architecture, the ownership split, and the six-week schedule. Decided against
reusing the Firebase backend from an earlier scrapped project after we talked
through the tradeoff, keeping the privacy design (data stays on the phone)
intact. Confirmed the app opens and runs on the phone over wifi.

Student-owned files remain empty placeholders, as intended: the classifier, the
deadline rules and tests, the checker, the county-mistake rules, the prompts,
the agent tool spec, and the generator design.

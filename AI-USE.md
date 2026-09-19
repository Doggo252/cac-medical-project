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

## 2026-09-15 (second session)

Files created or edited: `data/templates/` (16 PDFs downloaded or repaired),
`data/handbook/` (two Santa Clara County pages moved here), `SOURCES.md`
(rewritten with the URLs that actually work).

What I did (Claude): diagnosed why most of the downloaded forms would not open.
They were not damaged. `dhcs.ca.gov` is behind Imperva/Incapsula bot protection,
so scripted downloads received a small HTML block page that had been saved under
a `.pdf` filename. Worked out that the forms index uses `/file/<id>-pdf/`
redirect links rather than direct `.pdf` paths, cleared the bot check in a real
browser, and reused its session cookie to fetch the files. Found NA Back 9 on
the CDSS site, since it is a CDSS form and appears on neither DHCS index, and
found the MEDIL letters at their new addresses after the old DHCS letters index
turned into a 404. Verified every file by opening it and reading its first page,
then rewrote `SOURCES.md` with a table of file, document, page count and source
URL, plus a note on the bot protection so this does not cost time again.

What the student did: downloaded the first batch of forms by hand, noticed the
files were unreadable, and reported it. The three that were already correct
(`mc355_eng`, `mc355_spa`, `calsaws_renewal_factsheet`) were the student's
manual downloads, and `mc355_spa` matched the official file byte for byte.

Still open: the source link for `calsaws_renewal_factsheet.pdf` was not
recorded at download time and needs to be added to `SOURCES.md`.

## 2026-09-15 (third session)

Files created or edited: `CLAUDE.md` and `CONTEXT.md` (replaced with the updated
planning versions), `fullplan.md` renamed to `replyby-plan-v3-ai-first.md`,
`SOURCES.md` (rewritten again, merging the fuller planning version with verified
links), `NEXT_VERSION.md`, `data/templates/` (three more letters),
`data/handbook/` (handbook index added), and a new `docs/student-guides/` folder
with eight guides.

What I did (Claude): took in the updated planning documents and applied the
senior-track change through the repository. The main renewal form is now the
MC 210 RV (non-MAGI, seniors and people with disabilities) rather than the
MC 216, and asset reporting under ACWDL 25-14 adds a property supplement, so
MC 216 and MC 217 moved to `NEXT_VERSION.md`. Downloaded and verified MEDIL
I20-39, ACWDL 01-39 and ACWDL 23-15, and the county handbook index. Confirmed the
CalSAWS fact sheet source URL, which was the open question left from the previous
session; it matches the existing file byte for byte. Rewrote `SOURCES.md` to
combine the planning version's research, law and partner sections with the links
verified by download, and recorded two corrections: MC 239 A does exist as a
public blank PDF, and NA Back 9 is a CDSS form that is not enclosed in ACWDL
23-19. Wrote `docs/student-guides/`, one guide per student-owned file, each
covering concepts, the decisions the student must make, a worked example in an
unrelated domain, a done checklist, and the whiteboard question. No student-owned
file was written or edited.

What the student did: wrote and supplied the updated `CLAUDE.md`, `CONTEXT.md`
and plan v3, which set the senior track, the ownership split, the story and the
schedule. Chose the non-MAGI senior track. Sent the outreach emails to Ravenswood
Family Health Network and Bay Area Legal Aid.

Note on the guides: they explain and structure but do not contain the
implementation of any student-owned file. The worked examples are deliberately
set in other domains (spam filtering, library notices, pizza orders) so that the
translation to Medi-Cal is the student's own work.

## 2026-09-15 (fourth session)

Files created or edited: `TODO.md` (new), `SOURCES.md`, `data/templates/`
(two more PDFs).

What I did (Claude): rebuilt the schedule against the hours actually available
(9.5 per week, none on Monday) rather than the 12 per week plan v3 assumed, and
saved it as `TODO.md` with the resulting 17.5 hour shortfall stated plainly and
one recommended cut. Chased the remaining gaps in `SOURCES.md`: found the
Spanish NA Back 9 (the filename is `NABACK9SP.PDF`, not `NABACK9.PDF` in a
Spanish folder), found a stable `/file/` redirect for the DHCS 8249 hearing form
to replace a raw upload path carrying a WordPress `-1` suffix, and established
that DHCS publishes only one other MC 239 blank (the DRA-6 citizenship notice),
which means the other MC 239 variants are assembled inside CalSAWS. Extracted
and summarized the printed field structure of the MC 239 A and MC 355 so the
student does not spend a one-hour slot reading PDFs.

What the student did: set the real time budget, which changed the schedule
materially. Postponed the generator design by a day, which is recorded in
`TODO.md`.

Note: the field inventory handed over is a reading of two public forms the
student already has on disk. Every design decision it raises (whether denials
are generated, whether there is an unknown class, what varies and by how much)
was left open for the student to answer in `data/generator_design.md`.

## 2026-09-16

Files created or edited: `SOURCES.md` (section F), `TODO.md`.

What I did (Claude): after Ravenswood declined, researched replacement partners
in the district using web search and the organizations' own websites, and
recorded verified contact details. Found that Ravenswood was the only north
county clinic in the Community Health Partnership network, so recommended
senior-focused organizations instead: SALA, Sourcewise HICAP, the Mountain View
Senior Center, and the Legal Aid Society of San Mateo County. Added the outreach
to the schedule. Drafted an email for the student to adapt; nothing was sent.

What the student did: sent the original outreach, received and reported
Ravenswood's reply, and decides who to contact and what to send.

## 2026-09-16 (second session)

Files created or edited: `SOURCES.md`, `data/templates/` (two CalSAWS PDFs).

What I did (Claude): answered the student's question about how to specify date
formats when the official forms are blank. Searched the templates and handbook
for format evidence, and found and downloaded a CalSAWS example Notice of Action
that shows the real computer-generated layout with placeholder fields. Corrected
an earlier statement of mine: the 2007 MC 239 A blank gives the discontinuance as
a month, but the CalSAWS notice uses a full date placeholder.

What the student did: is writing `data/generator_design.md` and raised the
question about missing formats. All design decisions remain the student's.

## 2026-09-16 (third session)

Files created or edited: `AI-USE.md` only. No project files edited by Claude.

What I did (Claude): reviewed the student's draft of `data/generator_design.md`
several times and pointed out gaps (missing blanks, vague ranges, a MAGI versus
non-MAGI mix-up, the "Notice for" field). Explained how to handle unknown formats
by writing labeled guesses. Looked up real Title 22 section numbers in ACWDL 25-14
(sections 50175 and 50179 for missing information) for the student to choose
from. Searched for a real filled MC 239 A online; none is public.

What the student did: wrote the MC 239 A section of `data/generator_design.md`,
chose the reasons and section numbers, and made three design decisions: only
discontinuances, a 50-50 mix of the 2007 and CalSAWS layouts, and telling the
user when they photograph the back of the notice.

## 2026-09-17

Files created or edited: `AI-USE.md` only. No project files edited by Claude.

What I did (Claude): reviewed the student's `data/generator_design.md` several
times as they wrote the MC 355 and MC 210 RV sections. Pointed out gaps (missing
discontinuance month in the label list, the MC 355 30-day window, a 15 degree
photo tilt being unrealistic). Searched for real filled examples of the MC 355
and MC 210 RV; none are public. Found that page 45 of `acwdl_20-21.pdf` shows
the MC 210 RV page 1 with every prepopulated field marked, which confirmed the
renewal due date is printed as "Month day, Year". Explained that `labels.csv` is
produced by the generator itself rather than gathered from the internet.

What the student did: finished `data/generator_design.md`. Wrote the MC 355 and
MC 210 RV sections, chose the photo variation split, the layout mix (70-30
CalSAWS to 2007) with reasons, the label columns, and three hard cases per
letter type.

## 2026-09-18

Files created or edited: `data/generate.py`, `data/test_generate.py`,
`pytest.ini` (added `data` to the test folders).

What I did (Claude): wrote the fake-letter generator from the student's
`data/generator_design.md`. It fills the real MC 355 and MC 210 RV PDFs through
their form fields, writes onto the 2007 MC 239 A at measured positions, and
rebuilds the CalSAWS layout from the discontinuance wording of the CalSAWS
example (the example itself mixes in denial text and a DRAFT watermark). It then
applies the student's five photo effects and hard cases, and writes
`labels.csv`. Added 7 tests checking the design's rules (10-day notice, 30-day
MC 355 window, case number format, 70-30 layout split, reproducibility). Made a
15-letter sample and a review sheet.

Assumptions I made where the design was silent, all flagged to the student and
set as constants at the top of the file: 60 days to return the renewal, 10% of
letters get a hard case, and office hours / worker fax left blank in the labels
when a layout does not print them.

What the student did: wrote the design this code follows, and reviews the
sample letters against the real forms.
Update (2026-09-18): the student corrected the layout mix to 30% CalSAWS and
70% 2007 form. Changed `CALSAWS_SHARE` and its test to match.
Update (2026-09-18, later): at the student's request, filled-in values no longer
all use one Arial-like font. Each letter now gets a "pen": one of five print
fonts, or (50% of the time, on the fillable layouts) one of four handwriting
fonts in black or blue ink with a slight wobble. Fonts come from macOS, so
nothing was downloaded. The CalSAWS layout stays fully printed, since the county
computer prints that whole page. Added a `writing` column to `labels.csv` and
2 tests (text is shrunk rather than silently dropped; about half handwritten).
Update (2026-09-18, later still): the student said the filled-in values looked
pasted on. Each value now sits on the same line as its printed label at the
label's size (measured from the PDF text), handwriting ink is slightly
see-through, Marker Felt was dropped as too heavy, and a light shared blur,
grain, and paper tint is applied to every page so the form and the values look
like one printout. Fixed a bug where the 2007 form's header values were not
drawn at all, and added a test that checks every value reaches the page.
Update (2026-09-18, evening): spent more time on realism at the student's
request. Rewrote the photo step: pages now lie on a gradient table surface
with a cast shadow, get mild camera perspective, uneven light, darker corners,
a warm or cool tint, sensor grain, and a random JPEG quality. The thumb is a
shaded, out-of-focus shape instead of a flat oval; the bottom-cut photos now
run the page off the frame instead of chopping a scan; folds have a soft
crease. The county stamp on the 2007 form is now a real rubber-stamp image
(patchy ink, slight rotation, optional date line). Mailing address blocks are
printed even on handwritten letters, since they show through the envelope
window. Fixed a bug where a random number inside a lookup table drew rings on
every photo. 4 more tests (perspective math, every effect renders, hard cases
render, stamp image).
Update (2026-09-18, night): generated the full set, 800 letters per type
(2,400 images, 812 MB, in the gitignored `data/synthetic/`). Splits match the
design: 30% CalSAWS, 44% handwritten, 20% per photo type, 10% hard cases.

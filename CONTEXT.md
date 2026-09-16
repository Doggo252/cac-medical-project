# CONTEXT.md

Everything decided in the planning sessions (September 10 to 15, 2026), in one place. Read this first, then CLAUDE.md, then the plan files. Put all of these in the repo root.

## Who and what

- Builder: Neil Patil, 9th grade, Mountain View High School. Working alone. Comfortable building with AI coding tools; rebuilding hand-coding skill.
- Competition: Congressional App Challenge, California District 16. Registered. Deadline Monday, October 26, 2026, 9:00 am Pacific. Internal target: submit Saturday, October 24.
- Judging: quality of the idea (creativity, originality), implementation (user experience, design), demonstrated excellence of coding. Local judges, mostly from the three-minute demo video; they may ask to see the code and to have parts explained.
- Rules that shape the build: AI tools are allowed but every use must be disclosed, and AI cannot be the entire technical effort.
- Budget: about 12 hours a week, plus a 30-minute daily Python warm-up through September 27.

## The app: ReplyBy (working name)

One sentence: photograph a Medi-Cal letter and the app tells you what it means, computes the exact deadlines, fills your response, checks it, catches the county's mistakes, faxes it, and keeps proof.

Program: Medi-Cal only, senior track (the "non-MAGI" side, for people 65 and over and people with disabilities). Counties: Santa Clara and San Mateo (the district). Language: English first, Spanish if on schedule.

The three letters the app recognizes:
1. MC 210 RV renewal packet (pre-filled annual renewal for seniors) with its cover letter and due date. Since January 2026 it includes a property supplement because asset reporting was reinstated for seniors (ACWDL 25-14).
2. MC 355, Request for Information. 30 days to respond.
3. MC 239 A discontinuance, for not returning the renewal or not providing requested documents or asset information. Triggers the 90-day cure period.
Anything else: "unknown," generic guidance, no guessing.

Forms the app fills or produces: state hearing request (on the NA Back 9), MC 355 response, MC 210 RV signature page plus checklist plus cover sheet (never retype the packet), a generated rescission request letter. Next version: MC 382 authorized representative (helper mode).

## The story for the video

Real start: Neil spent weeks last year helping his grandfather, who is on Medi-Cal, find a dentist who accepts it. While helping, he saw the pile of renewal mail and realized the dentist search only mattered if the renewal envelope got answered. New this year: seniors must report assets again, one more page to miss. Honesty rules: do not claim Grandpa was discontinued if he was not; say "if he had missed it" or use a clinic composite with permission. Action item: sit with Grandpa and look at his actual Medi-Cal mail; it is likely a real MC 210 RV or MC 355 and becomes a real test letter.

## Why this idea (the reasoning, in case a judge or teacher asks)

- The problem: people lose Medi-Cal over paperwork, not eligibility. About 69% of the 25 million+ people dropped during the 2023 to 2024 unwinding were procedural. In CalFresh, 1 in 3 LA County denials came from a missed interview; over 44% of SNAP denial and termination actions in 2022 were improper. Federal changes bring more frequent renewals for many adults in 2027.
- Why it can win: the letters come from a small set of official templates (learnable), the deadlines are written in law (computable), and the county's own rules say what it must do (checkable). CA-16's recent winners (SightSense 2024, camera assistant for blind users; Relink 2025, AI job-search agent for formerly incarcerated people) were a specific person, a camera or agent visibly doing something, a real origin story, and a polished mobile flow. ReplyBy matches that pattern.
- Prior art: Propel (the biggest EBT app) prototyped an LLM tool that explains a SNAP notice and listed as open problems: notices that are themselves wrong, sending PII to model APIs, and a background agent that triages. Nava and Amplifi built a caseworker-side form filler. Nobody has shipped a citizen-side app that executes the response, catches county mistakes, and keeps proof. That is the lane. Cite both in the submission.
- Ideas considered and set aside: GigProof (gig-income proof packet), OneReport (report a life change to every agency once), CaseReplay (process-mining a broken case), ShockRelay (job loss across three programs), a CalFresh version of ReplyBy. Reasons are in cac-final-concept.md.

## The AI in the product (this is the center of the entry)

- Two independent readers that must agree: Reader A is an LLM that returns structured facts from the (redacted) letter text; Reader B is a Naive Bayes classifier Neil trains on synthetic letters generated from the official templates. Disagreement means the app asks the user instead of guessing.
- Deadlines and county-mistake detection come from cited rules with tests, never from the model.
- The LLM writes plain-language explanations (four languages) and drafts the appeal text, grounded only in confirmed facts; outputs that invent a date are rejected.
- Renewal Rescue, an agent with a fixed set of eight tools (assemble packet, gap check, send fax, poll receipt, file receipt, schedule check, draft appeal, notify user). Every step shows in an on-screen action log. The send-fax tool is locked in code behind "checker passed and user signed."
- An evaluation dashboard showing accuracy of both readers on synthetic and real letters and their disagreement rate.

## Ownership (the disclosure story)

AI coding tools build the plumbing: web app, camera, OCR wiring, confirm screen, PDF filling, storage, offline, backend, the agent loop, the fax integration, charts. Neil authors and can explain at a whiteboard: the fake-letter generator design, the Naive Bayes classifier (about 40 hand-written lines), the rules file and its tests, the county-mistake rules (about 50 lines), the checker (about 30 lines), every prompt, the agent tool spec and guards, and the evaluation set. Every session gets a dated entry in AI-USE.md. The full split is in CLAUDE.md, Rule 1.

## Stack

React with Vite as an installable web app; Tesseract.js OCR in the browser; Python FastAPI backend holding the LLM and fax keys; Claude via the Anthropic API with structured output; hand-written Naive Bayes exported to JSON and run in the browser; JSON rules evaluated by a pure TypeScript function; pdf-lib for forms; IndexedDB with SHA-256 hashes for the vault; PyMuPDF and Pillow for synthetic letters; pytest and Vitest; Phaxio or SRFax for fax (week 5).

## Privacy and safety rules (enforced in code)

Redact digit strings of 6+ characters before any LLM call. Keys only in backend env vars. Nothing sent to a county without a confirmation tap after signing. Explanations rejected if they contain a date not in the confirmed facts. Everything except the LLM calls and sending works in airplane mode.

## Status as of September 15, 2026

Done:
- Registered for the competition.
- Emails drafted and being sent to Ravenswood Family Health Network (development@ravenswoodfhn.org, CC volunteeropportunities@ravenswoodfhn.org) and Bay Area Legal Aid (communications@baylegal.org, CC tbrady@baylegal.org), asking by email only for: which letters seniors bring in most (Ravenswood) or which county-notice mistakes are common (BayLegal), redacted or blank sample letters, a 10-minute review of the app's explanations in early October, and an optional one-sentence quote. Mom (Seema) copied. Follow up Tuesday, September 22 if no reply.
- Planning documents written (see file list).

Not started: everything in the repo. No code exists yet.

## Milestones

- Sun Sept 20: fake letters generated (800 per type), blank app installs on the phone, backend runs locally, forms downloaded per SOURCES.md.
- Sun Sept 27: photo of a printed mock letter returns structured facts on the phone; both readers wired; disagreement case handled.
- Sun Oct 4: photo to countdown end to end; accuracy numbers saved.
- Sun Oct 11: full flow including forms, checker, timeline, vault. Scope freeze.
- Sun Oct 18: agent with a real fax round trip; evaluation dashboard; airplane-mode test; user testing by email done.
- Sat Oct 24: submit.

## Files from the planning sessions (drop all into the repo root)

- CLAUDE.md: the standing brief Claude Code reads every session. Ownership rules, stack, layout, domain facts, first-session task list. Already updated to the MC 210 RV senior track.
- SOURCES.md: verified links for every form, the county handbook pages with the discontinuance wording, the state rules letters, law citations, research sources, partner contacts, and a curl block that downloads everything.
- replyby-plan-v3-ai-first.md: the current plan. Features with the AI marked, ownership map, week-by-week tables (you versus AI tool), testing, video outline, disclosure text, risks.
- replyby-plan-v2.md: plain-language version of the problem, features with form types explained, and testing. Still accurate except it predates the senior track and the two-reader design.
- replyby-feature-spec.md and replyby-solo-plan.md: earlier, more detailed feature list (team-sized) and the first solo re-scope with the Medi-Cal variant. Reference only.
- cac-final-concept.md: the winner analysis, the six-idea scorecard, and the prior-art section.
- congressional-app-challenge-concepts.md: the original three concepts with research citations.

## First things to do in Claude Code

1. Create the repo folder, copy CLAUDE.md, CONTEXT.md, SOURCES.md, and the plan files into it.
2. Open Claude Code in that folder and paste: "Read CLAUDE.md and CONTEXT.md fully. Summarize Rule 1 and Rule 2 back to me in two sentences, then run the download commands in SOURCES.md section G, then start the First Session list in CLAUDE.md one step at a time, stopping after step 6 so I can check the app opens on my phone."
3. Tonight, without Claude Code: write data/generator_design.md yourself (which fields to randomize and what each of the three letters looks like). It is a short document, not code, and it is the first thing you own.

## Open questions to settle this week

- Is Grandpa currently on Medi-Cal, and can you photograph one of his real letters (with his permission, redacting the case number)?
- Which fax service (Phaxio or SRFax) and who sets up the account with a parent.
- LLM API key: parent on billing, spending cap set.

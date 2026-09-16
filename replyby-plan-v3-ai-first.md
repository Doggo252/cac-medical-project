# ReplyBy: Build Plan v3 (AI-first)

September 12, 2026. Replaces v2. Deadline: Monday, October 26, 2026 at 9:00 am Pacific. Target: submit Saturday, October 24.

---

## 0. Two different questions about AI

People mix these up, so separate them from the start.

1. **Is AI a feature of the app?** Yes, and it is the center of the product. This plan makes AI and machine learning do the hard work: reading letters, understanding them, drafting responses, and running the agent that gets the response delivered.
2. **Are AI tools used to build the app?** Yes, heavily, with full disclosure. The competition allows this. The only rule is that AI cannot be the entire technical effort, so this plan names the parts you author and can explain.

The instructor is right that an app without AI will not stand out. The rule does not push against that. It only asks that you own a real piece of the work.

---

## 1. The problem (short version)

When Medi-Cal (California's free health coverage) needs something from you, it mails a letter. Miss the date or misread the letter and coverage ends, even if you still qualify. About 69% of people dropped from Medicaid during the 2023 to 2024 unwinding lost coverage for paperwork reasons, not eligibility. Federal changes make renewals more frequent for many adults starting in 2027, so this gets worse. Existing tools explain the letter. Nothing responds to it, sends it, keeps the proof, or catches the county's mistakes. ReplyBy does.

---

## 2. What the app does, and where the AI is

You photograph a Medi-Cal letter. Here is what happens, step by step, with the AI parts marked.

**Step 1. The phone reads the words off the photo.** A text-reading library runs in the browser. The photo never leaves the phone. Before anything is sent to an AI service, the app blanks out long digit strings (case numbers, Social Security numbers) so the AI sees the words but not the identifiers.

**Step 2. Two independent readers figure out what the letter is.** (AI, and the heart of the app.)
- Reader A is a large language model (an LLM, the same kind of system behind Claude or ChatGPT). It receives the letter text and returns a structured answer: letter type, notice date, effective date, what the county is asking for, whether appeal-rights language is present.
- Reader B is a small classifier you trained yourself on thousands of realistic fake letters generated from the state's official templates. It only answers one question, which letter type this is, but it does so with no internet and no outside service.
- If the two readers disagree, the app does not guess. It shows the user both answers and asks. This "two readers must agree" design is the reason the app is not a chatbot wrapper, and it is the line you say in the video.

**Step 3. You check the facts.** Every extracted value is shown beside the spot on the photo it came from, with a confidence level. You tap to fix anything. Nothing downstream runs until you confirm.

**Step 4. The deadlines are computed, not guessed.** (Rules, not AI.) A rules file you wrote turns the letter type and dates into exact deadlines with the law each comes from: the 90-day cure period after a discontinuance, the 90-day hearing window, the "file before this date and coverage continues" cutoff, the renewal due date. Holidays and weekends handled. Every rule has a test.

**Step 5. The app explains the letter in your language.** (AI.) The LLM writes a two-sentence plain-language explanation and an urgency level, grounded only in the confirmed facts, in English, Spanish, Vietnamese or Chinese. The app blocks any explanation that mentions a date not in the confirmed facts.

**Step 6. The county-mistake check.** (Rules decide, AI writes.) Every letter and receipt goes on a dated timeline. Two rules run: "you returned the form before the effective date but were discontinued anyway" (the county must restore coverage while it checks) and "you sent the missing information inside the 90-day cure period and nothing was restored." If a rule fires, the LLM drafts the rescission request and the hearing request reason statement from the timeline facts, and you edit before signing.

**Step 7. Fill and sign.** The app fills the hearing request and the MC 355 information-request response from your confirmed facts. For the 19-page renewal packet, it produces the checklist of sections to answer, a signature page, and a cover sheet rather than retyping the packet.

**Step 8. The checker.** (Rules.) Before sending, a plain comparison re-reads the finished form and matches every field to the confirmed facts. Any mismatch blocks sending and shows both values.

**Step 9. Renewal Rescue, the agent.** (AI with tools, the second showpiece.) After you tap Send, an LLM agent takes over with a fixed set of tools it is allowed to call: assemble packet, gap check, send fax, poll receipt, file receipt, schedule check, draft appeal, notify user. It reasons about what to do next and shows every step in an on-screen action log. It cannot call "send fax" unless the checker passed and you signed; that guard is code, not a prompt. It faxes the packet to the county's document line, waits for the receipt, files it in the vault, starts the 90-day countdown, and if no restoration letter is logged by a set date, drafts the appeal and alerts you.

**Step 10. The receipt vault.** Everything sent is stored with time, destination, and a digital fingerprint of the file. One tap produces a proof letter for a hearing.

**Step 11. The evaluation dashboard.** (ML engineering, and your evidence.) A screen in the app, and a notebook in the repo, that shows how accurate Reader A and Reader B are on fake letters and on real redacted letters, and how often they disagree. Judges rarely see a student measure their own AI. This is what makes "we use AI" credible.

---

## 3. Why this is not a wrapper (say this in the video)

- Two independent readers, one you trained, must agree before anything happens.
- Deadlines and mistake detection come from cited rules with tests, never from the model.
- The agent can only act through a fixed set of tools, and the dangerous tool is locked behind code, not a prompt.
- Accuracy is measured and shown on screen, on real letters from a clinic.
- Every AI output is grounded in facts the user confirmed, and the app rejects outputs that invent a date.

---

## 4. Ownership map: what you author, what AI tools build

**Your rule for the six weeks.** AI coding tools (Claude Code, Cursor, or similar) build the plumbing. You author the pieces below, using AI as a tutor and reviewer, and you must be able to explain each in two minutes at a whiteboard. Log every AI contribution in AI-USE.md from day one.

| Piece | You author | AI tool builds | Why it is yours |
|---|---|---|---|
| Fake-letter generator | The design, the list of fields to randomize, the labels | Library calls for stamping text and rendering images | It is the dataset; you decide what "realistic" means |
| Reader B, the classifier | The classifier itself, written by hand (a word-counting Naive Bayes classifier, about 40 lines), the train/test split, the accuracy table | Nothing | This is the trained model you can explain line by line |
| Reader A, the LLM extraction | The prompt, the output format, the "must agree" logic, the redaction rules | The API call and the backend that hides the key | You design what the model is asked and how it is checked |
| Rules file and tests | Every rule, every citation, every test case | Test runner setup | The legal logic is the product |
| County-mistake rules | The two rules and their tests, written by hand (about 50 lines) | Timeline screen | This is the feature no one else has |
| The checker | Written by hand (about 30 lines) | The screen that shows the mismatch | Simple, and it proves you understand the safety design |
| Agent tools and guards | The list of tools, what each does, the guard that locks "send fax," the action-log format | The agent loop, fax service call, scheduling | You decide what the agent may do |
| Prompts for explanations and drafts | All prompts, the grounding check | Nothing | The quality of every AI sentence is your design |
| Evaluation dashboard | What to measure, the labeled test set | The chart screen | Measurement is the ML engineering |
| Everything else (camera, OCR setup, PDF filling, storage, offline, styling, backend) | Review and understand at a high level | Builds it | Disclosed plumbing |

Hand-written total: about 120 lines. Authored (designed and iterated, with AI assisting on syntax): the rules file, prompts, tool definitions, test cases, and the dataset design. That is a real technical contribution, and it lines up with the interesting parts.

---

## 5. Week by week

Budget: about 12 hours a week, plus a 30-minute daily Python warm-up in weeks 1 and 2 (files, loops, dictionaries, dates, functions, tests).

### Week 1 (Sept 14 to 20): foundations and data

| Task | Who | Done when |
|---|---|---|
| Register on the competition site; start AI-USE.md | You | Confirmation received; first log entry |
| Download the three official letters (renewal cover letter, MC 355 information request, MC 239 discontinuance), the MC 355 and hearing request PDFs, and the Santa Clara County handbook pages on discontinuance language | You | In the repo with source links |
| Project setup: web app that installs to the home screen, plus a tiny backend for the LLM key and fax | AI tool | Blank app opens on your phone |
| Fake-letter generator | You design; AI tool writes library calls | 800 labeled images per letter type |
| Email MayView Community Health Center and Bay Area Legal Aid's health consumer line for a 20-minute visit and redacted example letters | You | Visit scheduled |

### Week 2 (Sept 21 to 27): the two readers

| Task | Who | Done when |
|---|---|---|
| Reader B: write the Naive Bayes classifier by hand, train, test on held-back 20% | You (AI as tutor) | 95% or better on fake letters; you can explain it at a whiteboard |
| Reader A: write the extraction prompt and the structured output format; the redaction rules | You | Returns correct type and dates on 20 fake letters |
| Backend call to the LLM; camera and text reading in the browser | AI tool | Photo of a printed mock letter comes back as structured facts |
| "Must agree" logic | You (AI as tutor) | Disagreement case shows both answers and asks |
| Clinic visit; collect 5 to 10 redacted letters (test set only, never training) | You, with a parent | Letters in a private folder |

### Week 3 (Sept 28 to Oct 4): facts, rules, explanations

| Task | Who | Done when |
|---|---|---|
| Confirm screen with fields beside the photo | AI tool builds; you define the confidence flags | Planted wrong date is easy to spot and fix |
| Rules file with citations, holiday list, 20 tests | You | All tests pass |
| Countdown cards | AI tool | Discontinuance shows three clocks correctly |
| Explanation prompts in four languages, plus the grounding check that rejects invented dates | You | Counselor approves English and Spanish wording |
| Evaluation notebook: Reader A and Reader B accuracy on fake and real letters, disagreement rate | You define; AI tool charts | Numbers saved to the repo |

Checkpoint Sunday, Oct 4: photo to countdown works end to end, and you have accuracy numbers.

### Week 4 (Oct 5 to 11): mistakes, forms, checker, vault

| Task | Who | Done when |
|---|---|---|
| Timeline screen | AI tool | Events show in date order |
| County-mistake rules, by hand, with three tests each | You | Violation flagged, clean case not, edge case handled |
| Appeal and rescission drafts from timeline facts | You write prompts; AI tool wires them | Legal aid volunteer says the draft is usable |
| Fill hearing request and MC 355; signature pad; renewal checklist and cover sheet | AI tool | Counselor accepts the output |
| The checker, by hand | You | Planted wrong date blocks sending |
| Receipt vault and proof letter; reminders | AI tool | Proof letter generated |

Checkpoint Sunday, Oct 11: full flow runs end to end. Scope freeze.

### Week 5 (Oct 12 to 18): the agent, hardening, people

| Task | Who | Done when |
|---|---|---|
| Renewal Rescue: define the eight tools, the guard on "send fax," the action-log format | You | Written spec in the repo |
| Agent loop, fax service, scheduled check | AI tool | Real fax round trip to a test number; receipt in the vault |
| Evaluation dashboard screen | AI tool | Numbers from week 3 shown in the app |
| Offline mode for everything except the AI calls and sending | AI tool | Airplane-mode test passes for steps 1, 3, 4, 8, 10 |
| Second clinic visit: counselor and one family member try it | You | Notes, top five fixes, one filmed sentence with permission |
| Fix list | AI tool with you directing | List empty |

### Week 6 (Oct 19 to 24): video and submission

| Task | Who | Done when |
|---|---|---|
| Script the three-minute video | You | Under 450 words |
| Record app on a phone stand; story and counselor quote separately; edit | You | Under three minutes |
| Write-up with the AI disclosure copied from AI-USE.md | You | Complete |
| Repository: README, one-command test run, training notebook, evaluation numbers | AI tool with you reviewing | A stranger can run the tests |
| Whiteboard rehearsal: explain Reader B, the rules, the checker, the agent guard, each in two minutes | You | Recorded once, watched back |
| Submit Saturday, Oct 24 | You | Confirmation received |

---

## 6. Testing

- **Reader B:** 80/20 split on fake letters; separate score on real clinic letters; confusion chart. Targets: 95% fake, 90% real.
- **Reader A:** same test set; score letter type and each date field. Report accuracy and how often it invents a date (must be zero after the grounding check).
- **Agreement:** how often A and B disagree, and whether the user was asked every time.
- **Rules:** 20 test cases including month ends, holidays, a Friday, and a discontinuance with all three clocks. One command, all green, before every commit.
- **County-mistake rules:** three cases each (clear violation, clean case, edge on the effective date).
- **Checker:** planted wrong date must block, on camera.
- **Agent:** the guard test. Try to trigger "send fax" without a signature; it must refuse and log why. Then a real fax to a test number.
- **Grounding:** feed the explanation prompt a letter with no effective date; the output must not contain one.
- **Ten clean end-to-end phone runs** in different lighting before filming.
- **People:** two 20-minute sessions in week 5. Say nothing, watch, write down every hesitation, fix the top five.
- **Privacy:** with the network monitor open, confirm the only outbound calls are the redacted text to the LLM and the fax after Send.

---

## 7. The video (three minutes)

1. 0:00 to 0:25: one family, one discontinuance letter, one deadline.
2. 0:25 to 1:05: photograph; both readers agree on screen; facts highlighted; one corrected by hand; three countdowns with citations; explanation switches to Spanish.
3. 1:05 to 1:45: add the upload receipt; timeline flags "returned before the effective date"; rescission request and hearing request draft themselves; checker catches a planted wrong date; sign.
4. 1:45 to 2:25: Renewal Rescue runs with the action log visible; fax receipt lands in the vault; 90-day countdown starts.
5. 2:25 to 2:45: the evaluation dashboard, the rules tests running green, the guard refusing an unsigned send.
6. 2:45 to 3:00: the counselor's sentence and the numbers.

---

## 8. Disclosure text (adapt in your own words)

"I used AI coding tools as a pair programmer for the interface, the camera and PDF handling, storage, offline mode, and the backend, logged in AI-USE.md. I designed the AI system: the two-reader agreement check, the extraction and explanation prompts, the agent's tools and guards, and the evaluation set. I wrote the Naive Bayes classifier, the deadline rules and tests, the county-mistake rules, and the checker myself, and I can walk through each one."

---

## 9. Risks

- **LLM cost and keys:** a letter costs cents. Keep the key on the backend, never in the app. Cap spending.
- **Reader A drifts or is slow:** Reader B and the rules still work offline; the app degrades to "type only" rather than failing.
- **You cannot explain a core piece:** that is the signal to rewrite it by hand until you can. Do the whiteboard rehearsal in week 6, not on submission day.
- **Scope:** three letter types, one program, two counties. Nothing new after October 11 except the agent.

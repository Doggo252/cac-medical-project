# CLAUDE.md: Medi-Cal Coverage Helper

## What this project is

An app that helps Californians sign up for and keep Medi-Cal coverage. Built by a high-school student for the 2026 Congressional App Challenge (CA-16). Submission deadline: late October 2026, judged on a 1–3 minute demo video plus written answers. Judging criteria: quality of the idea, implementation/UX, and coding excellence.

The app's one-sentence job: **"Don't lose your Medi-Cal."**

## Core architecture principle

**Rules as data, engine as service, UI as client.**

- All eligibility criteria, income limits, and work-requirement exemption categories live in versioned JSON files under `/rules`, never hard-coded in application logic.
- A backend API evaluates rules deterministically. No LLM calls in the eligibility path: determinations must be reproducible and traceable to published sources.
- The frontend is a friendly question-flow client that only talks to our own API.

## Tech stack

- **Language:** TypeScript everywhere (strict mode on). No plain JS files.
- **Frontend:** React + Vite + Tailwind CSS. Mobile-first; assume users are on phones.
- **Backend:** Firebase Cloud Functions (TypeScript). The rules engine runs server-side in callable functions (`screen`, `hoursCheck`), never in the client, so determinations stay consistent and rules updates don't require app redeploys.
- **Database:** Cloud Firestore. Per-user data under `users/{uid}/...`; Firestore Security Rules must enforce that users can only read/write their own documents (plus read-only caregiver grants for P1 feature 8).
- **Auth:** Firebase Auth (email link or Google sign-in). No passwords to manage.
- **Reminders:** Scheduled Cloud Function (Cloud Scheduler) runs daily, finds upcoming deadlines, sends via Twilio (SMS) / SendGrid (email). Wrap both behind a `notifier` module with a console/log fallback so everything runs locally without API keys.
- **Local dev & testing:** Firebase Emulator Suite (Auth, Firestore, Functions) for all local work; never develop against production. Vitest for the rules engine and function logic.

## Directory structure

```
/rules        JSON rule files (see schema below); versioned in git, bundled into functions at deploy
/functions    Cloud Functions (TypeScript): rules engine, screen/hoursCheck callables, reminder scheduler, notifier
/web          React + Vite + Tailwind app
/tests        Golden persona test suite (runs against the rules engine directly + via emulator)
firestore.rules   Security rules: treat as code, review on every data-model change
```

## Feature priorities

Build strictly in this order. A working, polished P0 beats a broken P0+P1.

**P0: demo backbone**

1. Rules engine + API: callable functions `screen` (answers → eligibility result + plain-language explanation) and `hoursCheck` (logged activities → monthly total, pace, shortfall warning).
2. Eligibility screener UI: TurboTax-style one-question-per-screen yes/no flow (household size, income, age, pregnancy, disability, student status). Ends in "You likely qualify through [pathway]. Here's why."
3. Work-hours tracker (hero feature): exemption check first; if not exempt, log jobs/classes/training/volunteering; live "62 of 80 hours this month" progress bar; on-pace/behind warning.
4. Renewal & reporting reminders: scheduled job checks upcoming deadlines and fires SMS/email; countdown dashboard.
5. Personalized document checklist generated from screener answers, ending in a deep link to BenefitsCal.

**P1: differentiators** 6. Coverage risk status: red/yellow/green dashboard indicator combining hours pace + upcoming deadlines + unreported changes. 7. Life-event checker: "new job / moved / income changed" → does it affect eligibility, what to report, by when. 8. Caregiver view: read-only invite so a family member can see deadlines, hours status, and risk indicator. 9. County office finder: geocoded lookup with hours and phone.

**P2: stretch (cut freely)** 10. Spanish language support (externalize all UI strings from day one to make this cheap later). 11. Calendar export (.ics) for deadlines.

## Rules file schema

Every rule object MUST include provenance fields:

```json
{
  "id": "income_limit_household_2",
  "value": ...,
  "effective_date": "2026-01-01",
  "source_url": "https://www.dhcs.ca.gov/...",
  "source_name": "DHCS 2026 income limit chart",
  "last_verified": "2026-08-01"
}
```

- Rules come ONLY from primary sources: DHCS publications, All County Welfare Directors Letters, official income-limit charts. Never from blogs, news articles, or model memory. If a value can't be traced to a primary source, leave a `TODO_VERIFY` placeholder and flag it; do not guess.
- The UI must display "Based on rules verified [date]" wherever a determination is shown.

## Accuracy guardrails (non-negotiable)

- The app **screens**, it never **determines**. Output language is always "you likely qualify" / "you may not qualify," and every result screen links to the official application. Only the county makes determinations.
- Scope: cover common pathways well (income-based adults, children, pregnancy, 65+, work-requirement exemptions). For complex cases (share of cost, long-term care, complex immigration status), the correct output is "your situation needs a human: contact your county office," not a guess.
- Golden persona tests: `/tests/personas/` holds 25–30 fictional applicants with known correct outcomes. Every change to `/rules` or the engine must pass the full suite. Add a persona for every bug found.
- No scraping or automation of BenefitsCal or any state system. No claiming integrations that don't exist. The hand-off is a deep link plus a prepared checklist.

## Privacy

- User data lives in Firestore, scoped per user; Security Rules deny all access by default and allow only owner (and explicit read-only caregiver grants). No analytics, no third-party trackers.
- The anonymous screener must work WITHOUT sign-in; only create an account (and store data) when the user opts into hours tracking or reminders.
- Store the minimum: don't ask for SSN, immigration document numbers, or exact income if a range suffices for screening.
- Phone/email are used only for reminders the user explicitly turned on.

## Conventions

- Small commits with clear messages; one feature per branch.
- Every callable function gets at least one test before moving on; run everything against the Emulator Suite.
- Shared types (rule schemas, screener answers, results) live in a `/shared` types package imported by both `/web` and `/functions`: one source of truth.
- Plain-language everywhere: target a middle-school reading level in all UI copy; no jargon without an inline explanation.
- Externalize user-facing strings into `/web/src/strings.ts` from the start (enables P2 translation).
- Accessibility basics: semantic HTML, labels on all inputs, keyboard-navigable flow.

## Things to never do

- Never hard-code an eligibility number in application code.
- Never call an LLM to decide eligibility.
- Never invent a rule value, income limit, or exemption; flag `TODO_VERIFY` instead.
- Never add features out of priority order without asking.
- Never claim in UI copy that the app enrolls people or connects to state systems.

## Demo target (keep in mind while building)

The 3-minute video arc: confused person → screener says "you likely qualify" → logs hours, progress bar fills → risk status flips yellow → reminder text arrives → coverage saved. Every P0 feature should look good on a phone screen recording.

Do not assume anything. Always ask clarifying questions.

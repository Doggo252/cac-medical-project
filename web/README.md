# /web

The screener UI (P0 feature 2). React + Vite + Tailwind, mobile-first, one
question per screen.

## Running it

From the repo root:

```bash
npm run dev
```

That builds the functions, starts the Auth/Firestore/Functions emulators, and
runs Vite at http://localhost:5173. Ctrl-C stops everything.

Two-terminal alternative, useful when you're changing functions a lot:

```bash
npm run dev:emulators   # terminal 1
npm run dev:web         # terminal 2
```

The Functions emulator does **not** hot-reload TypeScript. After editing
anything under `/functions` or `/rules`, re-run `npm run build` (or restart
`dev:emulators`) or you'll be testing stale code.

## Rules this app follows

- **It never evaluates a rule.** Every answer comes from the `screen` callable.
  There is no client-side engine and no fallback: if the API is unreachable the
  UI says so rather than making something up.
- **It never reads `/rules` directly.** Even the "Where our numbers come from"
  panel goes through the `rulesStatus` callable.
- **All copy lives in `src/strings.ts`.** Nothing hard-coded in JSX. This is what
  makes P2 Spanish support a matter of adding a second object.
- **Results always show provenance.** `rulesVerifiedThrough` becomes "Based on
  rules verified [date]"; when it's null the UI says the numbers aren't
  confirmed yet instead of staying quiet.

## Files

| File                     | What it holds                                          |
| ------------------------ | ------------------------------------------------------ |
| `src/strings.ts`         | Every user-facing string, incl. exemption labels        |
| `src/questions.ts`       | The question flow, including which questions to skip    |
| `src/api.ts`             | The only calls to our backend                           |
| `src/firebase.ts`        | Client setup; points at the emulators in dev, always    |
| `src/Screener.tsx`       | P0-2: the anonymous screener flow                       |
| `src/hours/`             | P0-3: sign-in gate, exemption picker, dashboard, log    |
| `src/components/`        | ProgressBar, QuestionCard, ResultCard, RulesPanel       |

`showIf` on a question must return true while the answer it depends on is still
unknown; otherwise the progress bar's denominator grows as you answer, which
reads as the flow getting longer the more you do.

## Hours tracker (P0-3)

Routing is a two-view hash router: `#/` screener, `#/hours` tracker.

- **Sign-in is tracker-only and passwordless.** The screener stays anonymous;
  an account exists solely so logged hours have somewhere to live. Two paths:
  Google, or an emailed sign-in link (per CLAUDE.md, no passwords to manage).
  A link opened on the same device completes silently via the locally stored
  email; on a different device the person retypes their email (Firebase's
  phishing guard). In the emulator, sent links are captured at
  `http://127.0.0.1:9099/emulator/v1/projects/cac-medical-project/oobCodes`.
  The dashed "Dev sign-in" button is emulator-gated and signs in a fake user
  without a popup.
- **Exemption check comes first.** The 13 categories come from the
  `work_requirement_exemption_categories` rule via `rulesStatus`, so a new
  exemption in /rules appears in the UI with no code change. The engine, not
  the client, decides whether a stored category means exempt.
- **The client does no hours math.** Activities live in
  `users/{uid}/activities` (owner-only per firestore.rules); every change
  re-calls `hoursCheck` and renders its result.
- **"Not required yet" banner** is driven by the hours rule's
  `effective_date` (2027-01-01) from the API. When the date passes, the banner
  retires itself; the UI never hard-codes the date.

## Not wired up yet

Reminders (P0-4) and the document checklist (P0-5).

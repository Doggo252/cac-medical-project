# /rules

Every eligibility number this app uses lives here as data, never in application
code. The engine looks rules up by `id`; if a rule is missing or unverified, the
engine says so instead of guessing.

## Rule states

A rule is in exactly one of two states:

| State          | `value`                | `source_url` / `source_name` | `last_verified` |
| -------------- | ---------------------- | ---------------------------- | --------------- |
| **Unverified** | the string `TODO_VERIFY` | must be empty              | must be `null`  |
| **Verified**   | a real value           | required, must be a `.gov` URL | required ISO date |

There is no third state. A number that cannot be traced to a primary source
stays `TODO_VERIFY`.

`tests/rules-provenance.test.ts` enforces the table above on every rule file, so
a half-filled rule fails CI rather than shipping.

## Allowed sources

Primary sources only:

- DHCS publications and official income-limit charts (`dhcs.ca.gov`)
- All County Welfare Directors Letters (ACWDLs)
- Other California state or federal `.gov` publications (`ca.gov`, `medicaid.gov`, `cms.gov`)

Never a blog, a news article, a summary site, or model memory.

## Verifying a rule

1. Find the value in a primary source.
2. Replace `"value": "TODO_VERIFY"` with the real value.
3. Fill in `source_url`, `source_name`, and `last_verified` (today's date).
4. Bump `version` in the rule file.
5. Update any golden persona in `/tests/personas/` marked
   `"pending_rule_verification": true` that depends on this rule — its expected
   outcome will move off `needs_human`.
6. Run `npm test`. The full persona suite must pass.

## Current status

All 40 rules in `medi-cal-core.rules.json` are verified as of **2026-08-08**
(rule set version 1.0.0):

| Rules | Value | Source |
| --- | --- | --- |
| `income_limit_magi_adult_*` (HH 1-12) | 138% FPL monthly | ACWDL 26-01 Enclosure 1, eff. 2026-01-01 |
| `income_limit_children_*` (HH 1-12) | 266% FPL monthly (ACA OTLIC) | ACWDL 26-01 Enclosure 1, eff. 2026-01-01 |
| `income_limit_pregnancy_*` (HH 1-12) | 213% FPL monthly | ACWDL 26-01 Enclosure 1, eff. 2026-01-01 |
| `income_limit_seniors_*` (HH 1-2 only) | A&D FPL individual/couple | ACWDL 26-01, eff. 2026-04-01 |
| `work_requirement_monthly_hours` | 80 | DHCS H.R. 1 fact sheet (§71119, P.L. 119-21), eff. 2027-01-01 |
| `work_requirement_exemption_categories` | 13 categories | DHCS H.R. 1 fact sheet |

Deliberate gaps, all of which the engine reports honestly instead of guessing:

- **Seniors, household 3+**: the Aged & Disabled FPL program defines individual
  and couple limits only. No rule exists → `rule_missing` → `needs_human`.
- **The $580/month earnings alternative** to the 80-hour requirement is noted in
  the rule but not modeled by the engine yet.
- **A&D FPL counts income after disregards**; the screener compares gross
  income, which can only under-promise, never over-promise.

The 2027 FPL letter (expected ~January 2027) will obsolete every income rule at
once — regenerate rather than hand-edit. The file is generated; keep the
generator's number tables in sync with the chart, not the other way around.

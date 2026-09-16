# Sources

Every official form, notice, and rule the app relies on. Anything the app tells
a user should be traceable back to something on this list.

## Forms

| Form | What it is | Where it came from | Saved copy |
| --- | --- | --- | --- |
| MC 216 | Medi-Cal annual renewal packet (about 19 pages, pre-filled by the county) | DHCS forms index | `data/templates/` |
| MC 355 | Request for Information. County allows 30 days to respond | DHCS forms index | `data/templates/` |
| MC 239 A | Discontinuance notice for not returning the renewal | DHCS forms index | `data/templates/` |
| NA Back 9 | Hearing rights and the state hearing request form, printed on the back of notices | DHCS forms index | `data/templates/` |
| MC 382 | Appointment of Authorized Representative (next version, not used yet) | DHCS forms index | `data/templates/` |

Forms indexes:
- https://www.dhcs.ca.gov/formsandpubs/forms/Pages/Index-MC200.aspx
- https://www.dhcs.ca.gov/formsandpubs/forms/Pages/MCEDFormsMC300.aspx

## Law and policy letters

| Rule the app uses | Authority |
| --- | --- |
| 90-day cure period after discontinuance; returning the information restores coverage back to the discontinuance date with no new application | W&IC 14005.37; DHCS MEDIL I14-60; DHCS MEDIL I15-22E |
| State hearing request within 90 days of the notice date; benefits continue if the request is made before the effective date | W&IC 10951 |
| Information returned before the effective date but discontinued anyway: the county shall rescind and restore benefits while it waits for verification | DHCS MEDIL I15-22, citing ACWDL 11-23, Q25 |
| Information received inside the 90-day cure period must be treated as received timely | W&IC 14005.37(a); DHCS MEDIL I15-22E |
| MC 355 response window of 30 days | Printed on the notice itself |
| Covered California special enrollment window of 90 days after losing Medi-Cal | Covered California special enrollment rules |

DHCS MEDIL letters (I14-60, I15-22, I15-22E):
- https://www.dhcs.ca.gov/services/medi-cal/eligibility/letters/

## Notice wording

Santa Clara County Medi-Cal handbook, notices chapters:
- https://stgenssa.sccgov.org/debs/program_handbooks/medi-cal/

Used to make the fake letters read like real county mail. Saved pages live in
`data/handbook/`.

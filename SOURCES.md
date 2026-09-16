# SOURCES.md

Every official form, letter, rule, and research source used by ReplyBy.
Downloaded files live in `data/templates/` and `data/handbook/`.

Last verified September 15, 2026. 23 PDFs and 3 HTML pages. Every file listed below was downloaded, opened,
and checked: the page count and the first page of text match the document it
claims to be.

## Before you download anything: the bot-protection trap

`dhcs.ca.gov` sits behind Imperva/Incapsula bot protection. Three things follow,
and all three cost time the first time around:

1. **A plain `curl` or `wget` gets a block page, not the file.** It is a small
   HTML page, roughly 212 or 958 bytes. If your command saved it as `something.pdf`
   it will look like a corrupted PDF. It is not corrupted. It is an error page
   with the wrong file extension.
2. **A browser user agent does not help.** The block is a JavaScript challenge.
   Only a real browser, or a `curl` carrying an `incap_ses_*` cookie from a
   browser that already passed the challenge, gets through.
3. **The links are redirects, not `.pdf` paths.** They look like
   `https://www.dhcs.ca.gov/file/mc-210-eng-pdf/` and resolve to
   `wp-content/uploads/...`. A script that looks for links ending in `.pdf`
   finds almost nothing.

The reliable method is to open each link in a browser and save the file.

One more shape worth knowing: some documents also sit at a raw
`wp-content/uploads/...` path, sometimes with a `-1` or `-2` suffix that
WordPress adds when a filename collides. Prefer the `/file/<id>-pdf/` redirect
where one exists, because the raw path changes when the document is re-uploaded.
Every link in this file is the stable form where a stable form exists.

Check a download from the repository root:

```bash
head -c 5 data/templates/mc210rv_eng.pdf
```

Real PDFs begin with `%PDF-`. Anything beginning with `<html` is a block page.

To check every file at once:

```bash
for f in data/templates/*.pdf; do head -c 5 "$f" | grep -q '%PDF' || echo "BAD: $f"; done
```

## A. Forms (`data/templates/`)

| Form | What it is | File | Pages | Link |
|---|---|---|---|---|
| MC 210 RV (Rev 10/20) | **The main one.** Annual renewal for seniors and people with disabilities (non-MAGI). Pre-populated by the county. The one Grandpa receives. | `mc210rv_eng.pdf` | 21 | https://www.dhcs.ca.gov/file/mc-210-eng-pdf/ |
| MC 210 RV Spanish | Same form, Spanish | `mc210rv_spa.pdf` | 21 | https://www.dhcs.ca.gov/file/mc-210-spa-pdf/ |
| MC 355 (07/18) | Medi-Cal Request for Information. The "we need one more document" letter. 30 days to respond. | `mc355_eng.pdf` | 3 | https://www.dhcs.ca.gov/file/mc-355-eng-0718-pdf/ |
| MC 355 Spanish | Same form, Spanish | `mc355_spa.pdf` | 3 | https://www.dhcs.ca.gov/file/mc-355-spa-0718-pdf/ |
| MC 239 A | Medi-Cal Notice of Action, Denial/Discontinuance of Benefits. The blank state template. | `mc239a.pdf` | 1 | https://www.dhcs.ca.gov/file/mc239a-pdf/ |
| MC 239 DRA-6 (02/10) | Information Notice, unable to verify US citizenship or identity. The only MC 239 sibling DHCS publishes as a blank. | `mc239dra6_eng.pdf` | 1 | https://www.dhcs.ca.gov/file/mc239dra-6eng-pdf/ |
| NA Back 9 | Hearing rights and the state hearing request, printed on the back of every Notice of Action. | `na_back_9_eng.pdf` | 1 | https://www.cdss.ca.gov/cdssweb/entres/forms/English/NABACK9.PDF |
| NA Back 9 Spanish | Same form, Spanish. Note the different filename: `NABACK9SP.PDF`, not `NABACK9.PDF` under a Spanish folder. | `na_back_9_spa.pdf` | 1 | https://www.cdss.ca.gov/cdssweb/entres/forms/Spanish/NABACK9SP.PDF |
| DHCS 8249 (Rev 09/2021) | Form to File a State Hearing. The standalone hearing request form. | `state_hearing_request.pdf` | 4 | https://www.dhcs.ca.gov/file/state-fair-hearing-form-pdf/ |
| MC 216 (Rev 10/20) | Annual renewal for families and most adults (MAGI). Reference and next version. | `mc216_eng.pdf` | 19 | https://www.dhcs.ca.gov/file/mc-216-eng-pdf/ |
| MC 217 (10/20) | Renewal for mixed households (MAGI plus non-MAGI). Reference only. | `mc217_eng.pdf` | 22 | https://www.dhcs.ca.gov/file/mc-217-eng-pdf/ |
| MC 382 (06/18) | Appointment of Authorized Representative. Next version (helper mode). | `mc382.pdf` | 3 | https://www.dhcs.ca.gov/file/mc382_0618-pdf/ |
| MC 380 (06/18) | Notice of Authorized Representative Appointment. Reference only. | `mc380.pdf` | 2 | https://www.dhcs.ca.gov/file/mc380_0618-pdf/ |

Two corrections to earlier notes, both verified on September 15:

- **MC 239 A does exist as a public blank PDF.** An earlier draft of this file
  said the MC 239 notices are generated inside CalSAWS and have no public PDF.
  The filled notices are generated there, but DHCS publishes the blank template
  at the link above. It is one page and it carries every field the extractor
  needs: notice date, case number, worker name and number, the denial and
  discontinuance checkboxes, the effective month, the reason, and the Title 22
  regulation lines. This is the single most important template in the project.
- **The other MC 239 notices are not published as blanks.** CLAUDE.md refers to
  sibling MC 239 letters for not providing requested documents or asset
  information. Searching the DHCS forms index turns up exactly one other MC 239
  blank, the DRA-6 citizenship notice above. The rest are assembled inside
  CalSAWS from the MC 239 A shell plus a reason, which is why the generator
  builds them by varying the reason and the missing-items list on the MC 239 A
  rather than by copying separate templates.
- **NA Back 9 is a CDSS form, not a DHCS form.** That is why it is on neither
  DHCS forms index. ACWDL 23-19 is only the two-page cover letter announcing the
  revised version; the form itself is not inside that PDF. Get it from CDSS at
  the link above.

Forms index pages (for anything above that moves):
- MC 200 series (renewals): https://www.dhcs.ca.gov/formsandpubs/forms/Pages/Index-MC200.aspx
- MC 300 series (MC 355, MC 380 to 382): https://www.dhcs.ca.gov/formsandpubs/forms/Pages/MCEDFormsMC300.aspx
- All Medi-Cal Eligibility Division forms: https://www.dhcs.ca.gov/forms-laws-publications/forms/medi-cal-eligibility-division-forms/

## B. Notice wording (`data/handbook/`)

The MC 239 notices a person actually receives are filled in by the county
computer system (CalSAWS), so the wording counties must use is published in
Santa Clara County's own Medi-Cal handbook rather than as a PDF.

| Page | What it contains | File | Link |
|---|---|---|---|
| Medi-Cal Handbook home | Index of all chapters | `scc_handbook_index.html` | https://stgenssa.sccgov.org/debs/program_handbooks/medi-cal/index.htm |
| Notices of Action chapter | What every NOA must contain; the MC 239 A rules (list only the missing items and the names they apply to; cite regulations and hearing rights); MC 355 is not a substitute for a NOA | `scc_noa_chapter.html` | https://stgenssa.sccgov.org/debs/program_handbooks/medi-cal/assets/12ReptChangeNOA/NOA.htm |
| Redetermination forms chapter | Which renewal forms are used when; NOA required after every renewal decision | `scc_rd_forms.html` | https://stgenssa.sccgov.org/debs/program_handbooks/medi-cal/assets/10Redeterminations/MCRDForms.htm |

Note: the handbook index needs the explicit `index.htm`. The bare directory URL
returns 404.

Ask the clinic and legal aid for redacted real examples of the MC 239 A and
MC 355. Those go in `data/real/`, which is gitignored, and are used as a test
set only, never for training.

## C. State rules letters (`data/templates/`)

These are the citations that go into `core/rules/deadlines.json` and
`core/contradictions.py`.

| Letter | Rule it establishes | File | Pages | Link |
|---|---|---|---|---|
| MEDIL I15-22 (Aug 2015) | If a renewal form or information arrives after the due date but before the discontinuance date, the county must rescind the termination and restore benefits while it waits for verification (citing ACWDL 11-23, Q25). Applies to MC 216, MC 210 RV, MC 604 IPS, and MC 355. | `medil_I15-22.pdf` | 2 | https://www.dhcs.ca.gov/file/i15-22-pdf/ |
| MEDIL I15-22E (Jan 2016) | Information received after the discontinuance date but within the 90-day cure period must be treated as received timely (W&IC 14005.37(a)). Also: MC 355 allows 30 days. | `medil_I15-22E.pdf` | 2 | https://www.dhcs.ca.gov/file/i15-22e-pdf/ |
| MEDIL I14-60 | 90-day cure period after discontinuance. | `medil_I14-60.pdf` | 2 | https://www.dhcs.ca.gov/file/i14-60-pdf/ |
| ACWDL 25-14 (June 2025) | Renewals due on or after January 1, 2026: non-MAGI members must report and verify assets; a property supplement is inserted with the MC 210 RV; discontinuance for failing to provide asset information gets a 90-day cure period. | `acwdl_25-14.pdf` | 22 | https://www.dhcs.ca.gov/file/25-14-pdf/ |
| ACWDL 20-21 (Oct 2020) | Defines the three pre-populated renewal forms (MC 216, MC 210 RV, MC 217) and the ex parte review required before any form is sent (W&IC 14005.37(e),(f)). | `acwdl_20-21.pdf` | 84 | https://www.dhcs.ca.gov/file/20-21-pdf/ |
| MEDIL I20-39 | Introduces the MC 217 mixed-household renewal form. | `medil_I20-39.pdf` | 46 | https://www.dhcs.ca.gov/file/i20-39-pdf/ |
| ACWDL 23-19 (Oct 2023) | Revised NA Back 9 hearing-rights page; must be attached to every county-generated Medi-Cal NOA. | `acwdl_23-19.pdf` | 2 | https://www.dhcs.ca.gov/file/23-19-pdf/ |
| ACWDL 01-39 (July 2001) | Creates the MC 355 under SB 87; counties may not request information already provided or not needed. | `acwdl_01-39.pdf` | 6 | https://www.dhcs.ca.gov/file/c01-39-pdf/ |
| ACWDL 23-15 | Clarification of authorized representative policy (MC 380, 381, 382); county must share notices with the AR on request. | `acwdl_23-15.pdf` | 2 | https://www.dhcs.ca.gov/file/23-15-pdf/ |
| CalSAWS renewal processing fact sheet | Confirms the three renewal packets and the rescission report. | `calsaws_renewal_factsheet.pdf` | 10 | https://www.calsaws.org/wp-content/uploads/2023/08/CIT-0286-23-Medi-Cal-Renewal-Processing-Fact-Sheet.pdf |

**The old DHCS letters index is gone.** Links of the form
`https://www.dhcs.ca.gov/services/medi-cal/eligibility/letters/Documents/I15-22.pdf`
now return 404, and so does the index page
`https://www.dhcs.ca.gov/services/medi-cal/eligibility/letters/`. DHCS
reorganized the site and the letters are served from `/file/<id>-pdf/` instead.
The pattern is the letter number lowercased, with ACWDLs from 2001 carrying a
leading `c` (`c01-39`). The links in the table above are the working ones.

Also on the fair hearing process:
- DHCS Medi-Cal Fair Hearing page: https://www.dhcs.ca.gov/services/medi-cal-resources/medi-cal-fair-hearing/

## D. Law citations (cite by section in the rules file)

- **W&IC 14005.37**: renewal process, ex parte review, and the 90-day cure period after discontinuance (subsections (a), (e), (f), (i)).
- **W&IC 10951**: state hearing must be requested within 90 days of the notice.
- **W&IC 14005.39**: DHCS-initiated discontinuances (out of state, voluntary).
- **10 CCR 6504(f)(6)**: Covered California special enrollment window after Medi-Cal discontinuance.
- Full text at leginfo.legislature.ca.gov, searching by code and section.

## E. Research and evidence (for the write-up and video)

| Source | What it supports | Link |
|---|---|---|
| KFF Medicaid Enrollment and Unwinding Tracker | 25 million+ disenrolled during unwinding; about 69% procedural | https://www.kff.org/medicaid/medicaid-enrollment-and-unwinding-tracker/ |
| Code for America, National Safety Net Scorecard | 1 in 3 LA County CalFresh denials from missed interviews; client quotes on confusing notices | https://codeforamerica.org/explore/scorecard/the-national-safety-net-scorecard/ |
| CBPP on SNAP payment accuracy | Over 44% of state denial and termination actions improper in 2022 | https://www.cbpp.org/research/food-assistance/snap-includes-extensive-payment-accuracy-system |
| Giannella et al., AEJ Policy 2024 | Interview is the key barrier; applicant-initiated interviews raised approvals 6 points | https://www.aeaweb.org/articles?id=10.1257/pol.20220701 |
| Propel, "Using AI to help SNAP recipients make sense of notices" | Closest prior art; lists open problems (incorrect notices, PII, background agent) | https://www.propel.app/insights/using-ai-for-snap-notices/ |
| Propel, "Using AI to help SNAP recipients diagnose and restore lost benefits" | Follow-up work; targeted actions instead of reapplying | https://www.propel.app/insights/using-ai-to-help-snap-recipients-diagnose-and-restore-lost-benefits/ |
| Route Fifty, Nava and Amplifi caseworker assistant (Mar 2026) | Prior art on the caseworker side; flags AI-filled fields with explanations | https://www.route-fifty.com/artificial-intelligence/2026/03/open-source-ai-assistant-shows-promise-california-caseworkers-service-delivery/412378/ |
| Congressional App Challenge, 2025 winners | What has won, including CA-16 | https://www.congressionalappchallenge.us/2025-winners/ |

## F. Local partners

Verified September 16, 2026.

### Status

| Organization | Status |
|---|---|
| Ravenswood Family Health Network | **Declined** (replied September 16, 2026). |
| Bay Area Legal Aid, Health Consumer Center | Emailed September 15. Follow up Tuesday, September 22 if no reply. |

Ravenswood's Mountain View clinic was the only north Santa Clara County member
of the Community Health Partnership clinic network, so there is no obvious
general clinic to swap in. The replacements below are senior-focused instead,
which fits the MC 210 RV senior track better anyway.

### Replacement candidates

| Organization | Why it fits | Contact | Link |
|---|---|---|---|
| **Senior Adults Legal Assistance (SALA)** | Free elder law office for Santa Clara County residents 60 and over, no income test. Handles Medi-Cal and other public benefits problems, so it sees county notice mistakes directly. Holds appointments at the Mountain View Senior Center. | Phone only on the site. Central 408-295-5991; North County 650-969-8656. 1425 Koll Circle, Suite 109, San Jose, CA 95112. M to F, 9 am to 5 pm. | http://www.sala.org/ |
| **Sourcewise HICAP** (Health Insurance Counseling and Advocacy Program) | Free one-on-one counseling for Medicare beneficiaries in Santa Clara County, including people on both Medicare and Medi-Cal, which is most of the senior track. Volunteer counselors present at senior centers. | hicapinterest@mysourcewise.com (volunteer interest form address); 408-350-3200 option 2; volunteer coordinator 408-350-3245; state line 1-800-434-0222. | https://mysourcewise.com/programs-services/medicare-options/ |
| **Mountain View Senior Center** | Local. Hosts HICAP (2nd Tuesday, 8:30 to 10:30 am) and SALA (1st Wednesday, 10 am to noon) appointments. A natural place to find seniors for week 5 user testing. | Front desk 650-903-6330. 266 Escuela Ave, Mountain View, CA 94040. | https://www.mountainview.gov/our-city/departments/community-services/recreation/senior-center/social-services |
| **Legal Aid Society of San Mateo County**, Elder and Disability Rights Program | Covers the San Mateo half of the district. Helps residents 60 and over with government benefits including Medi-Cal. | 650-558-0915 (program page); 650-517-8919 (listed in search results for senior appointments, unconfirmed on the program page). 330 Twin Dolphin Drive, Suite 123, Redwood City, CA 94065. | https://www.legalaidsmc.org/elder-disability-rights |
| **Community Health Partnership** | Santa Clara County clinic consortium with Medi-Cal enrollment counselors. Worth one email asking for a referral to another clinic. | info@chpscc.org; health coverage line 408-579-6028. 408 N. Capitol Ave, San Jose, CA 95133. | https://chpscc.org/healthaccess/ |

### Unchanged

- **Bay Area Legal Aid**, Health Consumer Center: 855-693-7285 (hotline, for clients). Email: communications@baylegal.org, CC tbrady@baylegal.org. Santa Clara office: 4 North Second Street, Suite 600, San Jose.
- **Santa Clara County Medi-Cal Service Center**: 408-758-3800 or 877-962-3633. North County Social Services office: 1330 W. Middlefield Rd, Mountain View, CA 94043.

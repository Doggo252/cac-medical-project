/**
 * Regenerates /rules/medi-cal-core.rules.json from transcribed primary-source
 * tables.
 *
 * Run with: npm run rules:generate   (Node 24 executes TypeScript natively)
 *
 * The tables below are transcribed VERBATIM from the cited documents; that
 * transcription is the one manual step, so when a new FPL letter lands
 * (expected ~January each year): update the tables and dates from the new
 * enclosure, bump VERSION, run this script, and let the golden persona suite
 * tell you which expectations moved. Never edit the JSON by hand; it will be
 * overwritten.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const VERSION = "1.0.0";
const LAST_VERIFIED = "2026-08-08";

const ENCLOSURE_1_URL =
  "https://www.dhcs.ca.gov/services/medi-cal-resources/medi-cal-eligibility-division/all-county-welfare-directors-medi-cal-eligibility-division-information-letters/2026-fpl-calculation-chart-monthly-values-enclosure-1/";
const ACWDL_26_01_URL =
  "https://www.dhcs.ca.gov/services/medi-cal/eligibility/letters/Documents/26-01.pdf";
const HR1_FACT_SHEET_URL =
  "https://www.dhcs.ca.gov/wp-content/uploads/2026/05/HR1-DHCS-Fact-Sheet-2026.pdf";

const ENCLOSURE_1_NAME =
  "DHCS ACWDL 26-01 (Jan 21, 2026), Enclosure 1: 2026 FPL Calculation Chart (Monthly Values)";
const HR1_FACT_SHEET_NAME =
  "DHCS Proposed Trailer Bill fact sheet on H.R. 1: Conforming State to Federal Law (May 2026)";

// Monthly values transcribed verbatim from Enclosure 1, household sizes 1-12.
const FPL_138 = [1836, 2490, 3143, 3795, 4450, 5102, 5755, 6409, 7062, 7715, 8369, 9022];
const FPL_213 = [2833, 3843, 4851, 5858, 6868, 7875, 8883, 9892, 10900, 11907, 12917, 13924];
const FPL_266 = [3538, 4799, 6057, 7315, 8576, 9835, 11093, 12354, 13612, 14870, 16131, 17389];

interface GeneratedRule {
  id: string;
  description: string;
  value: number | string | readonly string[];
  unit: string;
  effective_date: string;
  source_url: string;
  source_name: string;
  last_verified: string;
  notes: string;
}

function incomeRule(
  pathway: string,
  size: number,
  value: number,
  effectiveDate: string,
  pctNote: string,
  extraNote = ""
): GeneratedRule {
  return {
    id: `income_limit_${pathway}_monthly_household_${size}`,
    description: `Highest monthly household income (household of ${size}) at which an applicant on the ${pathway} pathway likely qualifies. ${pctNote}`,
    value,
    unit: "usd_per_month",
    effective_date: effectiveDate,
    source_url: ENCLOSURE_1_URL,
    source_name: ENCLOSURE_1_NAME,
    last_verified: LAST_VERIFIED,
    notes:
      `Program-to-percentage mapping from ACWDL 26-01 Enclosure 3 (Program Descriptions by FPL). ` +
      `MAGI FPL figures effective January 1, 2026 per the letter. ${extraNote}`.trim(),
  };
}

const rules: GeneratedRule[] = [];

// MAGI adults 19-64. Enclosure 3: "138% FPL = ACA New Adults Ages 19-64".
FPL_138.forEach((value, i) =>
  rules.push(
    incomeRule(
      "magi_adult",
      i + 1,
      value,
      "2026-01-01",
      "Enclosure 3: '138% FPL = ACA New Adults Ages 19-64'."
    )
  )
);

// Children under 19. Enclosure 3: "266% FPL = ACA OTLIC".
FPL_266.forEach((value, i) =>
  rules.push(
    incomeRule(
      "children",
      i + 1,
      value,
      "2026-01-01",
      "Enclosure 3: '266% FPL = ACA OTLIC' (Optional Targeted Low-Income Children), the ceiling for full-scope children's Medi-Cal.",
      "Lower FPL bands (208% infants, 142% ages 1-6, 133% ages 6-19) determine funding source, not the eligibility ceiling. Children in households above 266% up to 322% may have MCAP/C-CHIP options in some counties."
    )
  )
);

// Pregnancy. Enclosure 3: "213% FPL = Full-Scope Coverage for ACA Pregnant Persons".
FPL_213.forEach((value, i) =>
  rules.push(
    incomeRule(
      "pregnancy",
      i + 1,
      value,
      "2026-01-01",
      "Enclosure 3: '213% FPL = Full-Scope Coverage for ACA Pregnant Persons'.",
      "Pregnant applicants above 213% up to 322% FPL may qualify for MCAP; the screener's likely_not_eligible copy already routes them to the county."
    )
  )
);

// Seniors 65+: Aged & Disabled FPL program, individual and couple only.
// Enclosure 3: "138% FPL = ... FPL Program for Aged & Disabled"; ACWDL 26-01
// sets the ABD effective date at April 1, 2026. Household sizes 3+ have no
// direct A&D value; they are deliberately absent so the engine reports rule_missing
// and routes to the county.
const SENIORS: ReadonlyArray<readonly [number, number]> = [
  [1, 1836],
  [2, 2490],
];
for (const [size, value] of SENIORS) {
  rules.push({
    id: `income_limit_seniors_monthly_household_${size}`,
    description: `Highest countable monthly income (${size === 1 ? "individual" : "couple"}) at which an adult 65+ likely qualifies through the Aged & Disabled FPL program.`,
    value,
    unit: "usd_per_month",
    effective_date: "2026-04-01",
    source_url: ACWDL_26_01_URL,
    source_name: "DHCS ACWDL 26-01 (Jan 21, 2026): 2026 Federal Poverty Levels",
    last_verified: LAST_VERIFIED,
    notes:
      "Enclosure 3 maps '138% FPL = FPL Program for Aged & Disabled'; the letter sets the ABD FPL effective date at April 1, 2026. CAVEAT: A&D FPL is non-MAGI, so counties compare COUNTABLE income after disregards, and a gross-income screen may understate eligibility. The screener's language and county hand-off absorb this. Household sizes 3+ intentionally have no rule (engine reports rule_missing → needs_human).",
  });
}

// Work / community engagement requirement: H.R. 1 §71119 (P.L. 119-21).
rules.push({
  id: "work_requirement_monthly_hours",
  description:
    "Hours of qualifying work, community service, work-program participation, or education a non-exempt MAGI New Adult Group member (ages 19-64) must complete each month to keep coverage.",
  value: 80,
  unit: "hours_per_month",
  effective_date: "2027-01-01",
  source_url: HR1_FACT_SHEET_URL,
  source_name: HR1_FACT_SHEET_NAME,
  last_verified: LAST_VERIFIED,
  notes:
    "Implements H.R. 1 (P.L. 119-21) sec. 71119; DHCS must comply by January 1, 2027 (WIC 14005.69). Applies to non-disabled adults 19-64 in the MAGI New Adult Group who are not pregnant and not on Medicare Part A/B. Compliance is verified at application (preceding month) and renewal (at least one month of the preceding six). H.R. 1 also allows satisfying the requirement by EARNING >= $580/month (80h x federal minimum wage $7.25) or, for seasonal workers, a 6-month average. This engine currently tracks hours only; the earnings alternative is not yet modeled. Requirement is not yet in force in 2026: hours tracked now build the habit ahead of enforcement.",
});

rules.push({
  id: "work_requirement_exemption_categories",
  description:
    "Categories that exempt an adult from the monthly work/community engagement requirement entirely.",
  value: [
    "american_indian_urban_indian",
    "caregiver_child_13_or_younger_or_disabled_person",
    "veteran_total_disability",
    "medically_frail_blind_disabled",
    "substance_use_disorder_or_disabling_mental_health",
    "physical_intellectual_developmental_disability",
    "serious_or_complex_medical_condition",
    "meeting_calfresh_calworks_work_requirements",
    "drug_or_alcohol_treatment_program",
    "currently_incarcerated",
    "pregnant_or_postpartum_12_months",
    "enrolled_in_school_or_training",
    "short_term_hardship",
  ],
  unit: "category_list",
  effective_date: "2027-01-01",
  source_url: HR1_FACT_SHEET_URL,
  source_name: HR1_FACT_SHEET_NAME,
  last_verified: LAST_VERIFIED,
  notes:
    "Category ids are our stable slugs for the exemption list quoted in the DHCS fact sheet (H.R. 1 sec. 71119). short_term_hardship covers the fact sheet's list: natural disaster, medical emergency requiring hospitalization, living in an area with high unemployment, needing out-of-state medical travel. The fact sheet also reserves 'any other exemptions approved by the federal government or listed in California's state plan'; revisit when DHCS issues implementing county letters. Note: school/training enrollment appears BOTH as an exemption and as a qualifying activity in the fact sheet; recorded as printed.",
});

const ruleSet = { rule_set_id: "medi-cal-core", version: VERSION, rules };

const outPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "rules",
  "medi-cal-core.rules.json"
);
writeFileSync(outPath, JSON.stringify(ruleSet, null, 2) + "\n");
console.log(`Wrote ${rules.length} rules to ${outPath}`);

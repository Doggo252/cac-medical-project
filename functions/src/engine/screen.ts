import {
  Pathway,
  Reason,
  ScreenResult,
  ScreenerAnswers,
} from "../../../shared/src/index";
import { InvalidInputError } from "./errors";
import { RuleBook, RuleTrace } from "./ruleBook";

/**
 * Where every result sends the user. This app screens; only the county
 * determines. The hand-off is a link plus a checklist; there is no
 * integration with any state system and the copy must never imply one.
 */
const BENEFITS_CAL_URL = "https://benefitscal.com/";

/**
 * Which pathway a set of answers is screened against.
 *
 * Order matters and is deliberate: age brackets first, then pregnancy, then the
 * general adult pathway. A pregnant applicant under 19 is screened as a child
 * because that pathway is broader.
 *
 * Not yet handled: `hasDisability` and `isFullTimeStudent` are collected but do
 * not change the pathway. Disability-based coverage is non-MAGI and often
 * involves share of cost, which CLAUDE.md puts out of scope. Routing it
 * correctly needs its own rules and a product decision, so it is deliberately
 * not guessed at here.
 */
function choosePathway(answers: ScreenerAnswers): Pathway {
  if (answers.age < 19) return "children";
  if (answers.isPregnant) return "pregnancy";
  if (answers.age >= 65) return "seniors";
  return "magi_adult";
}

const PATHWAY_REASON = {
  children: {
    code: "pathway_children",
    message: "You are under 19, so we checked the rules for children.",
  },
  pregnancy: {
    code: "pathway_pregnancy",
    message: "You are pregnant, so we checked the rules for pregnancy coverage.",
  },
  seniors: {
    code: "pathway_seniors",
    message: "You are 65 or older, so we checked the rules for older adults.",
  },
  magi_adult: {
    code: "pathway_magi_adult",
    message: "You are an adult under 65, so we checked the income rules for adults.",
  },
} as const;

/**
 * Rule id holding the monthly income limit for a pathway and household size.
 *
 * Built from the answers rather than hard-coded, so adding a household size is
 * a change to /rules and nothing else. A size with no rule yet comes back
 * "missing", which the engine reports honestly instead of falling back to a
 * nearby number.
 */
function incomeLimitRuleId(pathway: Pathway, householdSize: number): string {
  return `income_limit_${pathway}_monthly_household_${householdSize}`;
}

function assertValidAnswers(answers: ScreenerAnswers): void {
  const problems: string[] = [];
  if (!Number.isInteger(answers.householdSize) || answers.householdSize < 1) {
    problems.push("householdSize must be a whole number of 1 or more");
  }
  if (!Number.isFinite(answers.monthlyIncomeUsd) || answers.monthlyIncomeUsd < 0) {
    problems.push("monthlyIncomeUsd must be zero or more");
  }
  if (!Number.isFinite(answers.age) || answers.age < 0 || answers.age > 120) {
    problems.push("age must be between 0 and 120");
  }
  for (const key of [
    "isPregnant",
    "hasDisability",
    "isFullTimeStudent",
    "needsLongTermCare",
    "hasComplexImmigrationStatus",
  ] as const) {
    if (typeof answers[key] !== "boolean") problems.push(`${key} must be true or false`);
  }
  if (problems.length > 0) {
    throw new InvalidInputError(`Invalid screener answers: ${problems.join("; ")}`);
  }
}

/**
 * Screens a set of answers against the rule book.
 *
 * Deterministic and side-effect free: same answers plus same rule set always
 * produce the same result. No model is consulted anywhere in this path.
 */
export function screen(answers: ScreenerAnswers, book: RuleBook): ScreenResult {
  assertValidAnswers(answers);

  const trace = new RuleTrace();
  const finish = (
    outcome: ScreenResult["outcome"],
    pathway: Pathway | null,
    headline: string,
    reasons: readonly Reason[],
    nextStepLabel: string
  ): ScreenResult => ({
    outcome,
    pathway,
    headline,
    reasons,
    unverifiedRuleIds: trace.unverifiedIds,
    missingRuleIds: trace.missingIds,
    rulesVerifiedThrough: book.verifiedThrough(trace.usedIds),
    ruleSetVersion: book.version,
    nextStep: { label: nextStepLabel, url: BENEFITS_CAL_URL },
  });

  // Scope guards run first. For these cases the correct output is "your
  // situation needs a human", never a guess.
  if (answers.needsLongTermCare) {
    return finish(
      "needs_human",
      null,
      "Your situation needs a person to look at it.",
      [
        {
          code: "out_of_scope_long_term_care",
          message:
            "Long-term care and share-of-cost rules are complicated. A county worker can walk you through them.",
          ruleIds: [],
        },
      ],
      "Contact your county office"
    );
  }

  if (answers.hasComplexImmigrationStatus) {
    return finish(
      "needs_human",
      null,
      "Your situation needs a person to look at it.",
      [
        {
          code: "out_of_scope_immigration",
          message:
            "Immigration status can change which coverage you can get. A county worker can tell you what applies to you.",
          ruleIds: [],
        },
      ],
      "Contact your county office"
    );
  }

  const pathway = choosePathway(answers);
  const pathwayReason: Reason = { ...PATHWAY_REASON[pathway], ruleIds: [] };

  const ruleId = incomeLimitRuleId(pathway, answers.householdSize);
  const limit = trace.record(book.number(ruleId));

  if (limit.status === "missing") {
    return finish(
      "needs_human",
      pathway,
      "We can't check this one yet.",
      [
        pathwayReason,
        {
          code: "rule_missing",
          message:
            "We don't have the income limit for a household your size yet, so we can't give you an answer. Your county can.",
          ruleIds: [ruleId],
        },
      ],
      "Contact your county office"
    );
  }

  if (limit.status === "unverified") {
    return finish(
      "needs_human",
      pathway,
      "We can't check this one yet.",
      [
        pathwayReason,
        {
          code: "rule_unverified",
          message:
            "We are still confirming this year's income limit with the state, so we won't guess. Your county can tell you today.",
          ruleIds: [ruleId],
        },
      ],
      "Contact your county office"
    );
  }

  if (answers.monthlyIncomeUsd <= limit.value) {
    return finish(
      "likely_eligible",
      pathway,
      "You likely qualify for Medi-Cal.",
      [
        pathwayReason,
        {
          code: "income_within_limit",
          message:
            `Your household income is at or under the monthly limit of ` +
            `$${limit.value.toLocaleString("en-US")} for ${answers.householdSize} ` +
            `${answers.householdSize === 1 ? "person" : "people"}.`,
          ruleIds: [ruleId],
        },
      ],
      "Start your application on BenefitsCal"
    );
  }

  return finish(
    "likely_not_eligible",
    pathway,
    "You may not qualify for Medi-Cal this way.",
    [
      pathwayReason,
      {
        code: "income_over_limit",
        message:
          `Your household income is above the monthly limit of ` +
          `$${limit.value.toLocaleString("en-US")} for ${answers.householdSize} ` +
          `${answers.householdSize === 1 ? "person" : "people"}. ` +
          `Other programs may still help, and only your county can say for sure.`,
        ruleIds: [ruleId],
      },
    ],
    "Check your options on BenefitsCal"
  );
}

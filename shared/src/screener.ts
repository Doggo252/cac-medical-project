/**
 * Screener contract — the input and output of the `screen` callable.
 *
 * Language discipline: this app SCREENS, it never DETERMINES. Every outcome
 * below is phrased as "likely", and every result carries a link to the official
 * application. Only the county makes determinations.
 */

/**
 * Answers collected by the question flow.
 *
 * Privacy: these are sent to the API but are NOT persisted for anonymous
 * screening. Nothing here identifies the user — no name, no SSN, no immigration
 * document numbers.
 */
export interface ScreenerAnswers {
  /** Number of people in the tax household, including the applicant. */
  readonly householdSize: number;
  /** Household income before taxes, in whole US dollars per month. */
  readonly monthlyIncomeUsd: number;
  /** Applicant age in years. */
  readonly age: number;
  readonly isPregnant: boolean;
  readonly hasDisability: boolean;
  readonly isFullTimeStudent: boolean;
  /** Scope guard: long-term care and share-of-cost cases need a human. */
  readonly needsLongTermCare: boolean;
  /** Scope guard: complex immigration status needs a human. */
  readonly hasComplexImmigrationStatus: boolean;
}

/** Coverage pathways this screener covers. */
export type Pathway = "children" | "pregnancy" | "seniors" | "magi_adult";

export type ScreenOutcome =
  | "likely_eligible"
  | "likely_not_eligible"
  /** Out of scope, or a required rule is not verified. Route to the county. */
  | "needs_human";

export type ReasonCode =
  | "pathway_children"
  | "pathway_pregnancy"
  | "pathway_seniors"
  | "pathway_magi_adult"
  | "income_within_limit"
  | "income_over_limit"
  | "rule_unverified"
  | "rule_missing"
  | "out_of_scope_long_term_care"
  | "out_of_scope_immigration";

/**
 * One traceable step in the determination.
 *
 * `code` is what the UI should localize (P2 Spanish support); `message` is the
 * English fallback. `ruleIds` makes every result auditable back to /rules.
 */
export interface Reason {
  readonly code: ReasonCode;
  readonly message: string;
  readonly ruleIds: readonly string[];
}

export interface NextStep {
  readonly label: string;
  readonly url: string;
}

export interface ScreenResult {
  readonly outcome: ScreenOutcome;
  readonly pathway: Pathway | null;
  /** Plain-language headline, middle-school reading level. */
  readonly headline: string;
  readonly reasons: readonly Reason[];
  /** Rules the engine needed but which are still TODO_VERIFY. */
  readonly unverifiedRuleIds: readonly string[];
  /** Rules the engine needed but which do not exist in the rule set yet. */
  readonly missingRuleIds: readonly string[];
  /**
   * Oldest `last_verified` among the rules actually used — the weakest link.
   * Null when no verified rule was used. Drives the UI's
   * "Based on rules verified [date]" line.
   */
  readonly rulesVerifiedThrough: string | null;
  readonly ruleSetVersion: string;
  readonly nextStep: NextStep;
}

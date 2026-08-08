/**
 * Work-hours tracker contract — the input and output of the `hoursCheck`
 * callable. This is the hero feature: exemption check first, then hours.
 */

export type ActivityKind = "job" | "school" | "training" | "volunteer";

export interface ActivityLog {
  readonly id: string;
  readonly kind: ActivityKind;
  /** ISO date (YYYY-MM-DD) the hours were worked. */
  readonly date: string;
  readonly hours: number;
}

export interface HoursCheckInput {
  /** Month being checked, as YYYY-MM. */
  readonly month: string;
  /** ISO date (YYYY-MM-DD) to measure pace against — normally today. */
  readonly asOfDate: string;
  readonly activities: readonly ActivityLog[];
  /**
   * Exemption category the user selected, or null if they claim none.
   * Validated against the `work_requirement_exemption_categories` rule.
   */
  readonly exemptionCategory: string | null;
}

export type HoursStatus =
  /** Exempt from the work requirement — no hours target applies. */
  | "exempt"
  /** Logged hours already meet the monthly target. */
  | "met"
  /** Not there yet, but ahead of the pace needed to finish the month. */
  | "on_pace"
  /** Behind the pace needed to finish the month. */
  | "behind"
  /** A required rule is unverified or missing, so no target can be applied. */
  | "unknown";

export interface HoursCheckResult {
  readonly month: string;
  /** Sum of logged hours in the month. Pure arithmetic — never rule-dependent. */
  readonly totalHours: number;
  /** Monthly hours target, or null when the rule is unverified/missing. */
  readonly targetHours: number | null;
  /** Hours still needed this month, or null when there is no target. */
  readonly remainingHours: number | null;
  /** Hours the user should have logged by `asOfDate` to stay on pace. */
  readonly expectedByNow: number | null;
  readonly status: HoursStatus;
  /** Plain-language summary, middle-school reading level. */
  readonly message: string;
  readonly unverifiedRuleIds: readonly string[];
  readonly missingRuleIds: readonly string[];
  readonly rulesVerifiedThrough: string | null;
  readonly ruleSetVersion: string;
}

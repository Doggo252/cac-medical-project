/**
 * Rule file schema: the contract every JSON file under /rules must satisfy.
 *
 * A rule is either VERIFIED (its `value` traces to a primary source) or
 * UNVERIFIED (its `value` is the literal TODO_VERIFY sentinel). There is no
 * third state, and there is no such thing as a guessed value: if a number
 * cannot be traced to DHCS, an All County Welfare Directors Letter, or an
 * official income-limit chart, it stays TODO_VERIFY and the engine refuses to
 * screen with it.
 */

/** Sentinel stored in `value` when a rule has no primary source yet. */
export const TODO_VERIFY = "TODO_VERIFY";
export type TodoVerify = typeof TODO_VERIFY;

/** The value shapes a rule may carry once verified. */
export type RuleValue = number | string | boolean | readonly string[];

export interface Rule {
  /** Stable, human-readable identifier. Referenced by the engine, never a magic number. */
  readonly id: string;
  /** Plain-language description of what this rule controls. */
  readonly description: string;
  /** The verified value, or TODO_VERIFY if it has no primary source yet. */
  readonly value: RuleValue | TodoVerify;
  /** Unit of `value`, e.g. "usd_per_month", "hours_per_month", "category_list". */
  readonly unit: string;
  /** ISO date (YYYY-MM-DD) the rule takes effect. */
  readonly effective_date: string;
  /** Primary-source URL. Empty string only while the rule is TODO_VERIFY. */
  readonly source_url: string;
  /** Human-readable source name, e.g. "DHCS 2026 income limit chart". */
  readonly source_name: string;
  /** ISO date the value was last checked against the source. Null while TODO_VERIFY. */
  readonly last_verified: string | null;
  /** Optional free-text note for whoever verifies this rule next. */
  readonly notes?: string;
}

export interface RuleSet {
  readonly rule_set_id: string;
  /** Bumped whenever any rule in the file changes. Surfaced in every API result. */
  readonly version: string;
  readonly rules: readonly Rule[];
}

/** True when the rule carries a real value traced to a primary source. */
export function isVerified(rule: Rule): boolean {
  return rule.value !== TODO_VERIFY;
}

/**
 * A rule as reported to the client by the `rulesStatus` callable.
 *
 * The frontend never reads /rules directly; it asks the API, same as it does
 * for a determination. Published income limits are public information, so the
 * values are included as-is (an unverified rule reports the TODO_VERIFY
 * sentinel, which is the honest answer).
 */
export interface RuleStatus {
  readonly id: string;
  readonly description: string;
  readonly unit: string;
  readonly value: RuleValue | TodoVerify;
  readonly verified: boolean;
  readonly effectiveDate: string;
  readonly sourceName: string;
  readonly sourceUrl: string;
  readonly lastVerified: string | null;
  readonly notes: string | null;
}

export interface RulesStatusResult {
  readonly ruleSetId: string;
  readonly version: string;
  readonly verifiedCount: number;
  readonly totalCount: number;
  readonly rules: readonly RuleStatus[];
}

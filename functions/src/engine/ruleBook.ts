import { Rule, RuleSet, TODO_VERIFY, isVerified } from "../../../shared/src/index";

/** Result of asking the rule book for a value. Never throws, never guesses. */
export type Lookup<T> =
  | { readonly status: "verified"; readonly rule: Rule; readonly value: T }
  | { readonly status: "unverified"; readonly rule: Rule }
  | { readonly status: "missing"; readonly id: string };

/**
 * Read-only view over a validated rule set.
 *
 * Every number the engine uses comes through here, which is what keeps
 * eligibility values out of application code. A lookup has three outcomes and
 * the engine must handle all three; that is how `TODO_VERIFY` turns into an
 * honest "we can't tell you yet" instead of a wrong answer.
 */
export class RuleBook {
  private readonly byId: ReadonlyMap<string, Rule>;

  constructor(private readonly ruleSet: RuleSet) {
    this.byId = new Map(ruleSet.rules.map((rule) => [rule.id, rule]));
  }

  get version(): string {
    return this.ruleSet.version;
  }

  get ruleSetId(): string {
    return this.ruleSet.rule_set_id;
  }

  /** Every rule id in the set, used by the provenance tests. */
  get ids(): readonly string[] {
    return this.ruleSet.rules.map((rule) => rule.id);
  }

  get rules(): readonly Rule[] {
    return this.ruleSet.rules;
  }

  number(id: string): Lookup<number> {
    const rule = this.byId.get(id);
    if (rule === undefined) return { status: "missing", id };
    if (!isVerified(rule)) return { status: "unverified", rule };
    if (typeof rule.value !== "number") {
      // Unreachable: parseRuleSet rejects a numeric-unit rule with a non-number
      // value at load time. Guarded anyway so a bad rule can never be silently
      // coerced into a screening decision.
      throw new Error(`Rule "${id}" is verified but its value is not a number`);
    }
    return { status: "verified", rule, value: rule.value };
  }

  stringList(id: string): Lookup<readonly string[]> {
    const rule = this.byId.get(id);
    if (rule === undefined) return { status: "missing", id };
    if (!isVerified(rule)) return { status: "unverified", rule };
    if (!Array.isArray(rule.value)) {
      throw new Error(`Rule "${id}" is verified but its value is not a list`);
    }
    return { status: "verified", rule, value: rule.value };
  }

  /**
   * Oldest `last_verified` among the given rules: the weakest link, and the
   * date the UI shows as "Based on rules verified [date]". Null when none of
   * them is verified.
   */
  verifiedThrough(ids: readonly string[]): string | null {
    let oldest: string | null = null;
    for (const id of ids) {
      const rule = this.byId.get(id);
      if (rule === undefined || rule.value === TODO_VERIFY || rule.last_verified === null) continue;
      if (oldest === null || rule.last_verified < oldest) oldest = rule.last_verified;
    }
    return oldest;
  }
}

/**
 * Collects which rules a determination touched, so every result can report what
 * it relied on and what it was missing.
 */
export class RuleTrace {
  private readonly used = new Set<string>();
  private readonly unverified = new Set<string>();
  private readonly missing = new Set<string>();

  record<T>(lookup: Lookup<T>): Lookup<T> {
    if (lookup.status === "missing") {
      this.missing.add(lookup.id);
    } else if (lookup.status === "unverified") {
      this.unverified.add(lookup.rule.id);
    } else {
      this.used.add(lookup.rule.id);
    }
    return lookup;
  }

  get usedIds(): string[] {
    return [...this.used];
  }

  get unverifiedIds(): string[] {
    return [...this.unverified];
  }

  get missingIds(): string[] {
    return [...this.missing];
  }
}

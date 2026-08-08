import { RulesStatusResult, isVerified } from "../../../shared/src/index";
import { RuleBook } from "./ruleBook";

/**
 * Reports what the rule book currently knows and what it is still missing.
 *
 * This backs the transparency requirement: the UI has to be able to say which
 * numbers are sourced, from where, and as of when — not just show a verdict.
 */
export function rulesStatus(book: RuleBook): RulesStatusResult {
  const rules = book.rules.map((rule) => ({
    id: rule.id,
    description: rule.description,
    unit: rule.unit,
    value: rule.value,
    verified: isVerified(rule),
    effectiveDate: rule.effective_date,
    sourceName: rule.source_name,
    sourceUrl: rule.source_url,
    lastVerified: rule.last_verified,
    notes: rule.notes ?? null,
  }));

  return {
    ruleSetId: book.ruleSetId,
    version: book.version,
    verifiedCount: rules.filter((rule) => rule.verified).length,
    totalCount: rules.length,
    rules,
  };
}

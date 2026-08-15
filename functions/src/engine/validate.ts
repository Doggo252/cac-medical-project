import { Rule, RuleSet, TODO_VERIFY } from "../../../shared/src/index";
import { RuleValidationError } from "./errors";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Units whose verified value must be a finite number. Checked at load time so
 * the engine can rely on the type without defensive branches at screening time.
 */
const NUMERIC_UNITS = new Set(["usd_per_month", "hours_per_month", "percent_fpl", "age_years"]);

/** Units whose verified value must be an array of strings. */
const LIST_UNITS = new Set(["category_list"]);

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/**
 * A verified rule must cite a government publication. This is the mechanical
 * half of "primary sources only"; it cannot tell a DHCS chart from a DHCS
 * press release, but it does stop a blog or a news article from landing here.
 */
function isPrimarySourceUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  return url.hostname === "gov" || url.hostname.endsWith(".gov");
}

function validateRule(raw: unknown, index: number, problems: string[]): void {
  const where = `rules[${index}]`;
  if (typeof raw !== "object" || raw === null) {
    problems.push(`${where}: expected an object`);
    return;
  }
  const rule = raw as Record<string, unknown>;
  const id = typeof rule.id === "string" ? rule.id : null;
  const label = id === null ? where : `${where} (${id})`;

  if (id === null || id.length === 0) problems.push(`${where}: "id" must be a non-empty string`);
  if (typeof rule.description !== "string" || rule.description.length === 0) {
    problems.push(`${label}: "description" must be a non-empty string`);
  }
  if (typeof rule.unit !== "string" || rule.unit.length === 0) {
    problems.push(`${label}: "unit" must be a non-empty string`);
  }
  if (!isIsoDate(rule.effective_date)) {
    problems.push(`${label}: "effective_date" must be an ISO date (YYYY-MM-DD)`);
  }
  if (typeof rule.source_name !== "string") {
    problems.push(`${label}: "source_name" must be a string`);
  }
  if (typeof rule.source_url !== "string") {
    problems.push(`${label}: "source_url" must be a string`);
    return;
  }
  if (rule.notes !== undefined && typeof rule.notes !== "string") {
    problems.push(`${label}: "notes" must be a string when present`);
  }

  // The heart of the schema: a rule is either fully unverified or fully cited.
  // There is no partially-sourced middle ground.
  if (rule.value === TODO_VERIFY) {
    if (rule.source_url !== "") {
      problems.push(`${label}: unverified rules must have an empty "source_url"`);
    }
    if (rule.source_name !== "") {
      problems.push(`${label}: unverified rules must have an empty "source_name"`);
    }
    if (rule.last_verified !== null) {
      problems.push(`${label}: unverified rules must have "last_verified": null`);
    }
    return;
  }

  if (!isPrimarySourceUrl(rule.source_url)) {
    problems.push(
      `${label}: verified rules need a "source_url" on an https .gov domain ` +
        `(primary sources only; no blogs, news articles, or model memory)`
    );
  }
  if (typeof rule.source_name !== "string" || rule.source_name.length === 0) {
    problems.push(`${label}: verified rules need a non-empty "source_name"`);
  }
  if (!isIsoDate(rule.last_verified)) {
    problems.push(`${label}: verified rules need "last_verified" as an ISO date`);
  }

  const unit = typeof rule.unit === "string" ? rule.unit : "";
  if (NUMERIC_UNITS.has(unit)) {
    if (typeof rule.value !== "number" || !Number.isFinite(rule.value)) {
      problems.push(`${label}: unit "${unit}" requires a finite number "value"`);
    }
  } else if (LIST_UNITS.has(unit)) {
    if (!Array.isArray(rule.value) || rule.value.some((entry) => typeof entry !== "string")) {
      problems.push(`${label}: unit "${unit}" requires an array of strings as "value"`);
    }
  }
}

/**
 * Parses and validates a raw rule file. Throws rather than returning a partial
 * rule set: a malformed rule must never reach a screening decision.
 */
export function parseRuleSet(raw: unknown): RuleSet {
  if (typeof raw !== "object" || raw === null) {
    throw new RuleValidationError("<unknown>", ["expected an object at the top level"]);
  }
  const candidate = raw as Record<string, unknown>;
  const ruleSetId = typeof candidate.rule_set_id === "string" ? candidate.rule_set_id : "<unknown>";
  const problems: string[] = [];

  if (typeof candidate.rule_set_id !== "string" || candidate.rule_set_id.length === 0) {
    problems.push(`"rule_set_id" must be a non-empty string`);
  }
  if (typeof candidate.version !== "string" || candidate.version.length === 0) {
    problems.push(`"version" must be a non-empty string`);
  }
  if (!Array.isArray(candidate.rules)) {
    problems.push(`"rules" must be an array`);
    throw new RuleValidationError(ruleSetId, problems);
  }

  candidate.rules.forEach((rule, index) => validateRule(rule, index, problems));

  const seen = new Set<string>();
  for (const rule of candidate.rules as Array<Record<string, unknown>>) {
    if (typeof rule?.id !== "string") continue;
    if (seen.has(rule.id)) problems.push(`duplicate rule id "${rule.id}"`);
    seen.add(rule.id);
  }

  if (problems.length > 0) throw new RuleValidationError(ruleSetId, problems);

  return {
    rule_set_id: candidate.rule_set_id as string,
    version: candidate.version as string,
    rules: candidate.rules as readonly Rule[],
  };
}

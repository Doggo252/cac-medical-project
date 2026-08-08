import coreRuleSetJson from "../../rules/medi-cal-core.rules.json";
import { RuleBook, parseRuleSet } from "./engine/index";

/**
 * The rule set is imported, validated, and frozen at module load. If a rule
 * file is malformed the function fails to start — loudly, at deploy time —
 * rather than screening someone against a broken rule.
 *
 * `rootDir` in functions/tsconfig.json is the repo root, so /rules is compiled
 * into functions/lib alongside the code and ships with the deploy.
 */
export const coreRuleSet = parseRuleSet(coreRuleSetJson);

export const coreRuleBook = new RuleBook(coreRuleSet);

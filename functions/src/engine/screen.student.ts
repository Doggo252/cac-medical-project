/**
 * Stage 04: YOUR rules engine.
 *
 * This is the heart transplant. When this file passes all nine golden
 * personas, it replaces screen.ts and becomes the code that runs in
 * production, the code a judge may ask you to explain.
 *
 * HOW TO WORK ON THIS
 *   Run: npm run learn      (it watches this file and reports persona results)
 *   Do NOT open screen.ts until you are green. Read it afterward to compare.
 *   Everything you need you have already written in learn/01, 02, and 03.
 *
 * WHAT IT MUST DO, in order:
 *
 *   1. Scope guards first. If needsLongTermCare, return needs_human with the
 *      single reason code "out_of_scope_long_term_care" and pathway null.
 *      Same for hasComplexImmigrationStatus with "out_of_scope_immigration".
 *      No rule lookups happen in these cases.
 *
 *   2. Pick the pathway (your 03 exercise 1 logic).
 *
 *   3. Build the income-limit rule id from the pathway and household size
 *      (your 01 exercise 4 logic), then look it up with book.number(id).
 *
 *   4. Handle all three lookup outcomes:
 *        missing    -> needs_human, reason "rule_missing",   id in missingRuleIds
 *        unverified -> needs_human, reason "rule_unverified", id in unverifiedRuleIds
 *        verified   -> compare income to the value:
 *                        income <= limit -> likely_eligible,  "income_within_limit"
 *                        otherwise       -> likely_not_eligible, "income_over_limit"
 *
 *   5. Every result carries the pathway reason FIRST, then the outcome
 *      reason. Check the reasonCodes arrays in tests/personas/ to see the
 *      exact order and codes expected.
 *
 *   6. rulesVerifiedThrough is the oldest last_verified among the rules you
 *      actually used, or null if you used none. Do not compute this by hand:
 *      RuleTrace and book.verifiedThrough() do it for you (see below).
 *
 * THE ONE NEW CONCEPT: RuleTrace
 *   You asked earlier how unverifiedRuleIds and missingRuleIds get filled in.
 *   This is the answer. Wrap every lookup:
 *
 *     const trace = new RuleTrace();
 *     const limit = trace.record(book.number(ruleId));
 *
 *   trace.record() remembers which bucket the lookup fell into and hands the
 *   lookup straight back to you. Then at the end:
 *
 *     trace.unverifiedIds        -> string[]
 *     trace.missingIds           -> string[]
 *     book.verifiedThrough(trace.usedIds) -> string | null
 *
 * MESSAGES: the persona tests only check reason CODES, not message text, so
 * write the plain-language messages in your own words. Middle-school reading
 * level, and never state a determination: "likely", never "you qualify".
 */
import type { Pathway, Reason, ScreenResult, ScreenerAnswers } from "../../../shared/src/index";
import { RuleBook, RuleTrace } from "./ruleBook";

const BENEFITS_CAL_URL = "https://benefitscal.com/";

export function screen(answers: ScreenerAnswers, book: RuleBook): ScreenResult {
  throw new Error("TODO: write your rules engine here");
}

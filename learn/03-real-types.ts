/**
 * Exercise 03: the REAL types.
 *
 * No more Mini versions. This file imports the actual types your app runs
 * on, from shared/src/screener.ts. Open that file in a split view and read
 * it top to bottom before you start; it is the vocabulary of your whole app,
 * and every exercise here is about producing values that fit those shapes.
 *
 * New concepts in this set:
 *   - Importing types from another file
 *   - Union types like `"a" | "b"`: a value must be one of the listed options
 *   - `| null`: a value that might be missing
 *   - Building an object literal that matches an interface
 *   - Optional early returns (guard clauses)
 */
import type {
  Pathway,
  Reason,
  ScreenOutcome,
  ScreenResult,
  ScreenerAnswers,
} from "../shared/src/screener";

/**
 * WORKED EXAMPLE: a function that returns a union type.
 *
 * `Pathway` is `"children" | "pregnancy" | "seniors" | "magi_adult"`.
 * TypeScript will refuse to compile if you return any other string. Try it:
 * change "children" to "child", save, and read the error. Then change it
 * back. That error is TypeScript doing its actual job.
 */
export function pathwayForChild(): Pathway {
  return "children";
}

/**
 * EXERCISE 1: choosePathway, for real this time.
 *
 * Same logic as 02, but the input is the real ScreenerAnswers and the
 * output is the real Pathway type. Order matters exactly as before.
 * Read ScreenerAnswers in shared/src/screener.ts to find the field names.
 */
export function choosePathway(answers: ScreenerAnswers): Pathway {
  if (answers.age < 19){
      return "children"
    }
    if (answers.isPregnant){
      return "pregnancy"
    }
    if (answers.age >= 65){
      return "seniors"
    }
    else{
      return "magi_adult"
    }
}

/**
 * EXERCISE 2: guard clauses. Which cases need a human?
 *
 * Your engine refuses to guess for two situations: long-term care and
 * complex immigration status. Return true if EITHER is set on the answers,
 * false otherwise. Field names are in ScreenerAnswers.
 *
 * Hint: `||` means "or".
 */
export function needsHuman(answers: ScreenerAnswers): boolean {
  if (answers.needsLongTermCare || answers.hasComplexImmigrationStatus){
    return true
  }
  else return false
}

/**
 * EXERCISE 3: build a Reason object.
 *
 * `Reason` (see shared/src/screener.ts) has three fields: code, message,
 * ruleIds. Return one whose code is "income_within_limit", whose message is
 * exactly:
 *   `Your household income is at or under the monthly limit of $${limit}.`
 * and whose ruleIds is an array holding just the one ruleId you were given.
 *
 * Hint: an object literal looks like  { code: ..., message: ..., ruleIds: [...] }
 * TypeScript will tell you if you misspell a field or forget one.
 */
export function withinLimitReason(limit: number, ruleId: string): Reason {
  return {code: "income_within_limit", message: `Your household income is at or under the monthly limit of $${limit}.`, ruleIds: [ruleId]}
}

/**
 * EXERCISE 4: pick the outcome, with `| null` in play.
 *
 * `limit` is `number | null`. Null means "no verified rule exists for this
 * case." Return:
 *   - "needs_human"         if limit is null (never guess)
 *   - "likely_eligible"     if income <= limit
 *   - "likely_not_eligible" otherwise
 *
 * Hint: check for null FIRST. After `if (limit === null) return ...;`,
 * TypeScript knows limit is a plain number for the rest of the function.
 * This is called "narrowing" and you'll use it constantly.
 */
export function outcomeFor(income: number, limit: number | null): ScreenOutcome {
  if (limit === null){
    return "needs_human"
  }
  if (income <= limit){
    return "likely_eligible"
  }
  else {
    return "likely_not_eligible"
  }
}

/**
 * EXERCISE 5: assemble a full ScreenResult.
 *
 * This is the shape your API returns to the phone. Given the pieces, build
 * one. Read the ScreenResult interface carefully; every field is required.
 * Fill them like this:
 *   outcome, pathway, reasons:  from the parameters
 *   headline:                   "You likely qualify for Medi-Cal." if outcome is
 *                               "likely_eligible", otherwise "We can't say yet."
 *   unverifiedRuleIds:          []   (empty list)
 *   missingRuleIds:             []
 *   rulesVerifiedThrough:       "2026-08-08"
 *   ruleSetVersion:             "1.0.0"
 *   nextStep:                   { label: "Start on BenefitsCal", url: "https://benefitscal.com/" }
 *
 * When TypeScript stops complaining, you have built the exact object the
 * real engine builds. Compare yours to the `finish` helper in
 * functions/src/engine/screen.ts afterward.
 */
export function buildResult(
  outcome: ScreenOutcome,
  pathway: Pathway | null,
  reasons: Reason[]
): ScreenResult {
  let headline = ""
  let nextStep = { label: "Start on BenefitsCal", url: "https://benefitscal.com/" }
  if (outcome === "likely_eligible"){
    headline = "You likely qualify for Medi-Cal."
  }
  else{
    headline = "We can't say yet."
  }


  return {outcome: outcome, pathway: pathway, reasons: reasons, headline: headline, unverifiedRuleIds: [], missingRuleIds: [], rulesVerifiedThrough: "2026-08-08", ruleSetVersion: "1.0.0", nextStep: nextStep}
}

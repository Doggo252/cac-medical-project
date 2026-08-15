/**
 * Exercise 01, the alphabet: numbers, strings, booleans, functions.
 *
 * Every exercise here is a tiny version of something REAL in your app.
 * Replace each `throw new Error("TODO")` line with a `return` of your own.
 * Keep `npm run learn` running in a terminal; it re-checks on every save.
 */

/**
 * WORKED EXAMPLE (already done: read it, run it, then copy the pattern).
 *
 * A function takes inputs (in parentheses, each with a type after the colon)
 * and returns one output (type after the arrow-less `):` at the end).
 *
 * `monthly: number` means "monthly is a number." That label is the entire
 * secret of TypeScript; everything else is regular JavaScript.
 */
export function yearlyFromMonthly(monthly: number): number {
  return monthly * 12;
}

/**
 * EXERCISE 1: Your first function.
 *
 * The DHCS chart gives yearly amounts; your app shows monthly. Convert a
 * yearly dollar amount to monthly, rounded to the nearest whole dollar.
 *
 * Hints: divide by 12. `Math.round(x)` rounds a number.
 */
export function monthlyFromYearly(yearly: number): number {
  return Math.round(yearly / 12);
}

/**
 * EXERCISE 2: The most important comparison in your whole app.
 *
 * Return true when income is at or under the limit, false otherwise.
 * This one comparison is the heart of `screen.ts`: a person is "likely
 * eligible" when their income is <= the limit for their household size.
 *
 * Hint: `income <= limit` is already a true/false value. You can return it
 * directly; no if needed (though an if works too).
 */
export function isUnderLimit(income: number, limit: number): boolean {
  return income <= limit;
}

/**
 * EXERCISE 3: Words that change with the number.
 *
 * Your result screen says "for 1 person" but "for 4 people". Return
 * "1 person" when size is 1, and (for example) "4 people" when size is 4.
 *
 * Hints: an if statement chooses between two paths. To glue a number into
 * a string, use backticks and ${}:   `${size} people`
 */
export function householdLabel(size: number): string {
  if (size === 1) {
    return "1 person";
  }
  if (size > 1) {
    return `${size} people`;
  }
  return "Error";
}

/**
 * EXERCISE 4: Building an id out of pieces.
 *
 * Your rules engine looks up income limits by id, like
 * "income_limit_magi_adult_monthly_household_4", built from a pathway
 * ("magi_adult") and a household size (4). Build that exact string.
 *
 * Hint: same backtick trick as exercise 3, twice in one string.
 */
export function incomeLimitRuleId(pathway: string, size: number): string {
  return `income_limit_${pathway}_monthly_household_${size}`;
}

/**
 * EXERCISE 5: Your first real decision function.
 *
 * A tiny screener: given a monthly income and a monthly limit, return the
 * outcome string your app uses: "likely_eligible" when income is at or
 * under the limit, "likely_not_eligible" when it's over.
 *
 * Hint: if / else, returning a different string in each branch. Bonus: can
 * you use your own isUnderLimit from exercise 2 inside this one?
 */
export function screenOutcome(income: number, limit: number): string {
  if (income <= limit) {
    return "likely_eligible";
  } else {
    return "likely_not_eligible";
  }
}

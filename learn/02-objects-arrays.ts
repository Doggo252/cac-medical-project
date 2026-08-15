/**
 * Exercise 02: objects, arrays, loops.
 *
 * New concept: an `interface` describes the SHAPE of an object: which
 * fields it has and their types. Your app's ScreenerAnswers is exactly this.
 */

/** A trimmed-down version of your app's ScreenerAnswers. */
export interface MiniAnswers {
  age: number;
  isPregnant: boolean;
}

/** A trimmed-down version of your app's ActivityLog. */
export interface MiniActivity {
  date: string; // "2026-08-05"
  hours: number;
}

/** A trimmed-down rule, like the ones in /rules. */
export interface MiniRule {
  id: string;
  value: number;
}

/**
 * WORKED EXAMPLE: reading a field from an object uses a dot.
 */
export function isAdult(answers: MiniAnswers): boolean {
  return answers.age >= 18;
}

/**
 * EXERCISE 1: Your engine's pathway logic, miniature edition.
 *
 * Return, in this order (order matters; it's a real design decision
 * in screen.ts):
 *   - "children"   if age is under 19
 *   - "pregnancy"  if isPregnant
 *   - "seniors"    if age is 65 or older
 *   - "magi_adult" otherwise
 *
 * Hint: several ifs that each return. A pregnant 17-year-old should get
 * "children"; check your order against that.
 */
export function choosePathway(answers: MiniAnswers): string {
  if (!isAdult(answers)){
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
 * EXERCISE 2: Add up an array with a loop.
 *
 * Return the total of all hours in the list.
 *
 * Hint:
 *   let total = 0;
 *   for (const activity of activities) { ... }
 */
export function totalHours(activities: MiniActivity[]): number {
  let total = 0
  for (const activity of activities){
    total += activity.hours
  }
  return total
}

/**
 * EXERCISE 3: Keep only this month's entries.
 *
 * Given activities and a month like "2026-08", return only the activities
 * whose date starts with that month. This is real logic from hours.ts.
 *
 * Hint: strings have .startsWith("..."), or compare date.slice(0, 7).
 * Build a new empty array [] and .push(...) matches into it.
 */
export function activitiesInMonth(
  activities: MiniActivity[],
  month: string
): MiniActivity[] {
  let month_activities = []
  for (const activity of activities){
    if (activity.date.startsWith(month)){
      month_activities.push(activity)
    }
  }
  return month_activities
}

/**
 * EXERCISE 4: Find a rule by id, and be honest when it's missing.
 *
 * Return the VALUE of the rule whose id matches, or null if no rule
 * matches. This is RuleBook.number() in miniature, and returning null
 * instead of guessing is your app's whole philosophy in one function.
 *
 * Hint: loop over rules; if rule.id === id, return rule.value. After the
 * loop ends (nothing matched), return null.
 */
export function findRuleValue(rules: MiniRule[], id: string): number | null {
  for (const rule of rules){
    if (rule.id === id){
      return rule.value
    }
  }
  return null

}

/**
 * EXERCISE 5: Put it all together.
 *
 * Given activities, a month, and a target, return one of:
 *   "met":    this month's total is at or above target
 *   "behind": below target
 *
 * Use your own totalHours and activitiesInMonth. Composing small functions
 * into bigger ones is 90% of programming.
 */
export function monthStatus(
  activities: MiniActivity[],
  month: string,
  target: number
): string {
  const month_activities = activitiesInMonth(activities, month)
  const total = totalHours(month_activities)
  if (total < target){
    return "behind"
  }
  if (total >= target){
    return "met"
  }
  else return "Error"
}

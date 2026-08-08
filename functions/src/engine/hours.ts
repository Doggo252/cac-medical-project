import { HoursCheckInput, HoursCheckResult } from "../../../shared/src/index";
import { InvalidInputError } from "./errors";
import { RuleBook, RuleTrace } from "./ruleBook";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const HOURS_RULE_ID = "work_requirement_monthly_hours";
const EXEMPTIONS_RULE_ID = "work_requirement_exemption_categories";

function assertValidInput(input: HoursCheckInput): void {
  const problems: string[] = [];
  if (!MONTH_PATTERN.test(input.month)) problems.push("month must look like YYYY-MM");
  if (!DATE_PATTERN.test(input.asOfDate)) problems.push("asOfDate must look like YYYY-MM-DD");
  if (!Array.isArray(input.activities)) {
    problems.push("activities must be an array");
  } else {
    for (const activity of input.activities) {
      if (!DATE_PATTERN.test(activity.date)) {
        problems.push(`activity ${activity.id}: date must look like YYYY-MM-DD`);
      }
      if (!Number.isFinite(activity.hours) || activity.hours < 0) {
        problems.push(`activity ${activity.id}: hours must be zero or more`);
      }
    }
  }
  if (problems.length > 0) {
    throw new InvalidInputError(`Invalid hours check input: ${problems.join("; ")}`);
  }
}

/** Days in `month`, computed in UTC so a user's timezone can't shift the month. */
function daysInMonth(month: string): number {
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));
  return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
}

/**
 * How far into `month` we are on `asOfDate`: 0 before the month starts, the
 * full month once it has ended.
 */
function daysElapsed(month: string, asOfDate: string, totalDays: number): number {
  const asOfMonth = asOfDate.slice(0, 7);
  if (asOfMonth < month) return 0;
  if (asOfMonth > month) return totalDays;
  return Math.min(Number(asOfDate.slice(8, 10)), totalDays);
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Totals a month's logged activities and compares them to the work requirement.
 *
 * Exemptions are checked first, by design — nobody should be asked to log hours
 * they do not owe. `totalHours` is plain arithmetic and is always reported, even
 * when the rules needed to judge it are unverified.
 */
export function hoursCheck(input: HoursCheckInput, book: RuleBook): HoursCheckResult {
  assertValidInput(input);

  const trace = new RuleTrace();
  const totalHours = round(
    input.activities
      .filter((activity) => activity.date.slice(0, 7) === input.month)
      .reduce((sum, activity) => sum + activity.hours, 0)
  );

  const finish = (
    status: HoursCheckResult["status"],
    message: string,
    targetHours: number | null,
    expectedByNow: number | null
  ): HoursCheckResult => ({
    month: input.month,
    totalHours,
    targetHours,
    remainingHours: targetHours === null ? null : round(Math.max(0, targetHours - totalHours)),
    expectedByNow,
    status,
    message,
    unverifiedRuleIds: trace.unverifiedIds,
    missingRuleIds: trace.missingIds,
    rulesVerifiedThrough: book.verifiedThrough(trace.usedIds),
    ruleSetVersion: book.version,
  });

  // Exemption check first.
  if (input.exemptionCategory !== null) {
    const exemptions = trace.record(book.stringList(EXEMPTIONS_RULE_ID));
    if (exemptions.status !== "verified") {
      return finish(
        "unknown",
        "We are still confirming the state's exemption list, so we can't check your exemption yet. Your county office can.",
        null,
        null
      );
    }
    if (exemptions.value.includes(input.exemptionCategory)) {
      return finish(
        "exempt",
        "You don't have to log work hours right now. Keep an eye on your renewal date.",
        null,
        null
      );
    }
    // Their claimed category is not on the list, so the hours rules still apply.
  }

  const target = trace.record(book.number(HOURS_RULE_ID));
  if (target.status !== "verified") {
    return finish(
      "unknown",
      `You have logged ${totalHours} hours this month. We are still confirming how many hours the state requires, so we won't guess at a goal.`,
      null,
      null
    );
  }

  const totalDays = daysInMonth(input.month);
  const elapsed = daysElapsed(input.month, input.asOfDate, totalDays);
  const expectedByNow = round((target.value * elapsed) / totalDays);
  const remaining = round(Math.max(0, target.value - totalHours));

  if (totalHours >= target.value) {
    return finish(
      "met",
      `You hit your goal — ${totalHours} of ${target.value} hours this month.`,
      target.value,
      expectedByNow
    );
  }
  if (totalHours >= expectedByNow) {
    return finish(
      "on_pace",
      `You are on track — ${totalHours} of ${target.value} hours. ${remaining} to go this month.`,
      target.value,
      expectedByNow
    );
  }
  return finish(
    "behind",
    `You are behind — ${totalHours} of ${target.value} hours. You need ${remaining} more before the month ends.`,
    target.value,
    expectedByNow
  );
}

/**
 * The checker for exercise 01. You don't need to edit this file, but DO
 * read it. Each `expect(...)` line says: "calling your function with these
 * inputs should give this output." Tests are just examples with teeth.
 */
import { describe, expect, it } from "vitest";

import {
  householdLabel,
  incomeLimitRuleId,
  isUnderLimit,
  monthlyFromYearly,
  screenOutcome,
  yearlyFromMonthly,
} from "./01-basics";

describe("worked example (already green)", () => {
  it("yearlyFromMonthly: $1,836/month is $22,032/year", () => {
    expect(yearlyFromMonthly(1836)).toBe(22032);
    expect(yearlyFromMonthly(0)).toBe(0);
  });
});

describe("exercise 1: monthlyFromYearly", () => {
  it("converts the real 2026 FPL: $15,960/year is $1,330/month", () => {
    expect(monthlyFromYearly(15960)).toBe(1330);
  });
  it("rounds to the nearest dollar: $22,032/year is $1,836/month", () => {
    expect(monthlyFromYearly(22032)).toBe(1836);
  });
  it("rounds correctly when the division isn't clean", () => {
    expect(monthlyFromYearly(10000)).toBe(833); // 833.33... rounds down
    expect(monthlyFromYearly(10010)).toBe(834); // 834.16... rounds down to 834
  });
});

describe("exercise 2: isUnderLimit", () => {
  it("under the limit is true", () => {
    expect(isUnderLimit(1500, 1836)).toBe(true);
  });
  it("exactly AT the limit still counts (this is a real app decision!)", () => {
    expect(isUnderLimit(1836, 1836)).toBe(true);
  });
  it("over the limit is false", () => {
    expect(isUnderLimit(2000, 1836)).toBe(false);
  });
});

describe("exercise 3: householdLabel", () => {
  it("one person is singular", () => {
    expect(householdLabel(1)).toBe("1 person");
  });
  it("more than one is plural", () => {
    expect(householdLabel(2)).toBe("2 people");
    expect(householdLabel(12)).toBe("12 people");
  });
});

describe("exercise 4: incomeLimitRuleId", () => {
  it("builds the exact id the rules engine looks up", () => {
    expect(incomeLimitRuleId("magi_adult", 4)).toBe(
      "income_limit_magi_adult_monthly_household_4"
    );
    expect(incomeLimitRuleId("pregnancy", 2)).toBe(
      "income_limit_pregnancy_monthly_household_2"
    );
  });
});

describe("exercise 5: screenOutcome", () => {
  it("at or under the limit: likely eligible", () => {
    expect(screenOutcome(1500, 1836)).toBe("likely_eligible");
    expect(screenOutcome(1836, 1836)).toBe("likely_eligible");
  });
  it("over the limit: likely not eligible", () => {
    expect(screenOutcome(2000, 1836)).toBe("likely_not_eligible");
  });
});

import { describe, expect, it } from "vitest";

import type { ScreenerAnswers } from "../shared/src/screener";
import {
  buildResult,
  choosePathway,
  needsHuman,
  outcomeFor,
  pathwayForChild,
  withinLimitReason,
} from "./03-real-types";

/** Maya from persona p001: the plainest case in the app. */
const maya: ScreenerAnswers = {
  householdSize: 1,
  monthlyIncomeUsd: 1500,
  age: 34,
  isPregnant: false,
  hasDisability: false,
  isFullTimeStudent: false,
  needsLongTermCare: false,
  hasComplexImmigrationStatus: false,
};

/** Small helper: Maya with some fields changed. */
function like(overrides: Partial<ScreenerAnswers>): ScreenerAnswers {
  return { ...maya, ...overrides };
}

describe("worked example", () => {
  it("pathwayForChild", () => {
    expect(pathwayForChild()).toBe("children");
  });
});

describe("exercise 1: choosePathway with real types", () => {
  it("routes the four pathways", () => {
    expect(choosePathway(like({ age: 8 }))).toBe("children");
    expect(choosePathway(like({ age: 28, isPregnant: true }))).toBe("pregnancy");
    expect(choosePathway(like({ age: 70 }))).toBe("seniors");
    expect(choosePathway(maya)).toBe("magi_adult");
  });
  it("pregnant 17-year-old is still children", () => {
    expect(choosePathway(like({ age: 17, isPregnant: true }))).toBe("children");
  });

  // Boundary cases. Bugs hide at the edges, never in the middle: a test at
  // age 8 passes whether the cutoff is 18 or 19, so it proves nothing about
  // where the line actually sits. Test the last value on each side.
  it("18 is still a child, 19 is an adult (the cutoff is under 19)", () => {
    expect(choosePathway(like({ age: 18 }))).toBe("children");
    expect(choosePathway(like({ age: 19 }))).toBe("magi_adult");
  });
  it("64 is an adult, 65 is a senior", () => {
    expect(choosePathway(like({ age: 64 }))).toBe("magi_adult");
    expect(choosePathway(like({ age: 65 }))).toBe("seniors");
  });
});

describe("exercise 2: needsHuman", () => {
  it("false for the plain case", () => {
    expect(needsHuman(maya)).toBe(false);
  });
  it("true for long-term care", () => {
    expect(needsHuman(like({ needsLongTermCare: true }))).toBe(true);
  });
  it("true for complex immigration status", () => {
    expect(needsHuman(like({ hasComplexImmigrationStatus: true }))).toBe(true);
  });
});

describe("exercise 3: withinLimitReason", () => {
  it("builds the exact Reason object", () => {
    expect(withinLimitReason(1836, "income_limit_magi_adult_monthly_household_1")).toEqual({
      code: "income_within_limit",
      message: "Your household income is at or under the monthly limit of $1836.",
      ruleIds: ["income_limit_magi_adult_monthly_household_1"],
    });
  });
});

describe("exercise 4: outcomeFor", () => {
  it("null limit means needs_human, never a guess", () => {
    expect(outcomeFor(1500, null)).toBe("needs_human");
  });
  it("at or under the limit is likely_eligible", () => {
    expect(outcomeFor(1500, 1836)).toBe("likely_eligible");
    expect(outcomeFor(1836, 1836)).toBe("likely_eligible");
  });
  it("over the limit is likely_not_eligible", () => {
    expect(outcomeFor(2000, 1836)).toBe("likely_not_eligible");
  });
});

describe("exercise 5: buildResult", () => {
  const reason = {
    code: "income_within_limit" as const,
    message: "test",
    ruleIds: ["r1"],
  };

  it("assembles a complete, correctly shaped ScreenResult", () => {
    const result = buildResult("likely_eligible", "magi_adult", [reason]);
    expect(result).toEqual({
      outcome: "likely_eligible",
      pathway: "magi_adult",
      headline: "You likely qualify for Medi-Cal.",
      reasons: [reason],
      unverifiedRuleIds: [],
      missingRuleIds: [],
      rulesVerifiedThrough: "2026-08-08",
      ruleSetVersion: "1.0.0",
      nextStep: { label: "Start on BenefitsCal", url: "https://benefitscal.com/" },
    });
  });

  it("uses the cautious headline for any other outcome", () => {
    expect(buildResult("needs_human", null, []).headline).toBe("We can't say yet.");
    expect(buildResult("likely_not_eligible", "magi_adult", []).headline).toBe(
      "We can't say yet."
    );
  });
});

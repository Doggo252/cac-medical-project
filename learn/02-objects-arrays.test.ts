import { describe, expect, it } from "vitest";

import {
  activitiesInMonth,
  choosePathway,
  findRuleValue,
  isAdult,
  monthStatus,
  totalHours,
  type MiniActivity,
} from "./02-objects-arrays";

const august: MiniActivity[] = [
  { date: "2026-08-03", hours: 6.5 },
  { date: "2026-08-05", hours: 4 },
  { date: "2026-07-28", hours: 40 }, // July, which must be excluded for month "2026-08"
];

describe("worked example", () => {
  it("isAdult", () => {
    expect(isAdult({ age: 34, isPregnant: false })).toBe(true);
    expect(isAdult({ age: 12, isPregnant: false })).toBe(false);
  });
});

describe("exercise 1: choosePathway", () => {
  it("routes by age and pregnancy", () => {
    expect(choosePathway({ age: 8, isPregnant: false })).toBe("children");
    expect(choosePathway({ age: 28, isPregnant: true })).toBe("pregnancy");
    expect(choosePathway({ age: 70, isPregnant: false })).toBe("seniors");
    expect(choosePathway({ age: 34, isPregnant: false })).toBe("magi_adult");
  });
  it("a pregnant 17-year-old is screened as a child (order matters)", () => {
    expect(choosePathway({ age: 17, isPregnant: true })).toBe("children");
  });
});

describe("exercise 2: totalHours", () => {
  it("adds everything up", () => {
    expect(totalHours(august)).toBe(50.5);
  });
  it("empty list is zero", () => {
    expect(totalHours([])).toBe(0);
  });
});

describe("exercise 3: activitiesInMonth", () => {
  it("keeps only August", () => {
    const result = activitiesInMonth(august, "2026-08");
    expect(result).toHaveLength(2);
    expect(result.map((a) => a.date)).toEqual(["2026-08-03", "2026-08-05"]);
  });
  it("a month with nothing returns an empty list", () => {
    expect(activitiesInMonth(august, "2026-01")).toEqual([]);
  });
});

describe("exercise 4: findRuleValue", () => {
  const rules = [
    { id: "work_requirement_monthly_hours", value: 80 },
    { id: "income_limit_magi_adult_monthly_household_1", value: 1836 },
  ];
  it("finds a rule by id", () => {
    expect(findRuleValue(rules, "work_requirement_monthly_hours")).toBe(80);
  });
  it("returns null for a missing rule, never a guess", () => {
    expect(findRuleValue(rules, "income_limit_magi_adult_monthly_household_9")).toBeNull();
  });
});

describe("exercise 5: monthStatus", () => {
  it("met when August total (10.5) reaches the target", () => {
    expect(monthStatus(august, "2026-08", 10)).toBe("met");
    expect(monthStatus(august, "2026-08", 10.5)).toBe("met");
  });
  it("behind when under target", () => {
    expect(monthStatus(august, "2026-08", 80)).toBe("behind");
  });
  it("July's 40 hours don't leak into August", () => {
    expect(monthStatus(august, "2026-08", 20)).toBe("behind");
  });
});

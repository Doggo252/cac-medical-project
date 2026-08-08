import { describe, expect, it } from "vitest";

import { TODO_VERIFY } from "../shared/src/index";
import { RuleValidationError, parseRuleSet } from "../functions/src/engine/index";
import coreRuleSetJson from "../rules/medi-cal-core.rules.json";

/**
 * Provenance guardrails. These exist so a half-sourced rule fails the build
 * instead of quietly becoming an eligibility answer.
 */
describe("rule provenance", () => {
  const ruleSet = parseRuleSet(coreRuleSetJson);

  it("loads the core rule set", () => {
    expect(ruleSet.rule_set_id).toBe("medi-cal-core");
    expect(ruleSet.rules.length).toBeGreaterThan(0);
  });

  it("keeps every rule either fully unverified or fully cited", () => {
    for (const rule of ruleSet.rules) {
      if (rule.value === TODO_VERIFY) {
        expect(rule.source_url, `${rule.id} source_url`).toBe("");
        expect(rule.last_verified, `${rule.id} last_verified`).toBeNull();
      } else {
        expect(rule.source_url, `${rule.id} source_url`).toMatch(/^https:\/\//);
        expect(rule.last_verified, `${rule.id} last_verified`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("rejects a value that claims a non-government source", () => {
    expect(() =>
      parseRuleSet({
        rule_set_id: "bad",
        version: "0.0.1",
        rules: [
          {
            id: "income_limit_magi_adult_monthly_household_1",
            description: "Copied off a blog.",
            value: 1732,
            unit: "usd_per_month",
            effective_date: "2026-01-01",
            source_url: "https://some-benefits-blog.example.com/medi-cal-limits",
            source_name: "A blog",
            last_verified: "2026-08-01",
          },
        ],
      })
    ).toThrow(RuleValidationError);
  });

  it("rejects a real value that forgot its source", () => {
    expect(() =>
      parseRuleSet({
        rule_set_id: "bad",
        version: "0.0.1",
        rules: [
          {
            id: "work_requirement_monthly_hours",
            description: "Remembered, not sourced.",
            value: 80,
            unit: "hours_per_month",
            effective_date: "2026-01-01",
            source_url: "",
            source_name: "",
            last_verified: null,
          },
        ],
      })
    ).toThrow(RuleValidationError);
  });

  it("rejects a TODO_VERIFY rule that pretends to be verified", () => {
    expect(() =>
      parseRuleSet({
        rule_set_id: "bad",
        version: "0.0.1",
        rules: [
          {
            id: "work_requirement_monthly_hours",
            description: "Sentinel value with a stale citation attached.",
            value: TODO_VERIFY,
            unit: "hours_per_month",
            effective_date: "2026-01-01",
            source_url: "https://www.dhcs.ca.gov/",
            source_name: "DHCS",
            last_verified: "2026-08-01",
          },
        ],
      })
    ).toThrow(RuleValidationError);
  });

  it("rejects duplicate rule ids", () => {
    const duplicate = {
      id: "work_requirement_monthly_hours",
      description: "Placeholder.",
      value: TODO_VERIFY,
      unit: "hours_per_month",
      effective_date: "2026-01-01",
      source_url: "",
      source_name: "",
      last_verified: null,
    };
    expect(() =>
      parseRuleSet({ rule_set_id: "bad", version: "0.0.1", rules: [duplicate, duplicate] })
    ).toThrow(RuleValidationError);
  });
});

import { describe, expect, it } from "vitest";

import { RuleBook, parseRuleSet, rulesStatus } from "../functions/src/engine/index";
import coreRuleSetJson from "../rules/medi-cal-core.rules.json";

const book = new RuleBook(parseRuleSet(coreRuleSetJson));

describe("rulesStatus", () => {
  const status = rulesStatus(book);

  it("reports the rule set it is describing", () => {
    expect(status.ruleSetId).toBe("medi-cal-core");
    expect(status.version).toBe(book.version);
    expect(status.totalCount).toBe(book.rules.length);
  });

  it("reports every rule as verified with full provenance", () => {
    expect(status.verifiedCount).toBe(status.totalCount);
    for (const rule of status.rules) {
      expect(rule.verified, rule.id).toBe(true);
      expect(rule.sourceUrl, rule.id).toMatch(/^https:\/\/.*\.gov\//);
      expect(rule.lastVerified, rule.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(rule.sourceName.length, rule.id).toBeGreaterThan(0);
    }
  });

  it("carries a note on every rule for the next person who verifies it", () => {
    for (const rule of status.rules) {
      expect(rule.notes, rule.id).not.toBeNull();
      expect(rule.description.length, rule.id).toBeGreaterThan(0);
    }
  });
});

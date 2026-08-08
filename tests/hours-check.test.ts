import { describe, expect, it } from "vitest";

import type { ActivityLog } from "../shared/src/index";
import { RuleBook, hoursCheck, parseRuleSet } from "../functions/src/engine/index";
import coreRuleSetJson from "../rules/medi-cal-core.rules.json";

const book = new RuleBook(parseRuleSet(coreRuleSetJson));

/**
 * The verified work-requirement rules (DHCS H.R. 1 fact sheet, May 2026):
 * 80 hours/month, with the exemption list checked before any hours math.
 */
const VERIFIED_DATE = "2026-08-08";

function log(date: string, hours: number, id = date): ActivityLog {
  return { id, kind: "job", date, hours };
}

describe("hoursCheck", () => {
  it("totals only the requested month's hours", () => {
    const result = hoursCheck(
      {
        month: "2026-08",
        asOfDate: "2026-08-15",
        activities: [log("2026-08-03", 20), log("2026-08-10", 22.5), log("2026-07-28", 40)],
        exemptionCategory: null,
      },
      book
    );

    // July hours are excluded; the August total is plain arithmetic.
    expect(result.totalHours).toBe(42.5);
    expect(result.targetHours).toBe(80);
    expect(result.rulesVerifiedThrough).toBe(VERIFIED_DATE);
  });

  it("marks a listed exemption as exempt and asks for no hours", () => {
    const result = hoursCheck(
      {
        month: "2026-08",
        asOfDate: "2026-08-15",
        activities: [],
        exemptionCategory: "pregnant_or_postpartum_12_months",
      },
      book
    );

    expect(result.status).toBe("exempt");
    expect(result.targetHours).toBeNull();
    expect(result.rulesVerifiedThrough).toBe(VERIFIED_DATE);
  });

  it("applies the hours target when a claimed category is not on the list", () => {
    const result = hoursCheck(
      {
        month: "2026-08",
        asOfDate: "2026-08-16",
        activities: [log("2026-08-05", 20)],
        exemptionCategory: "not_a_real_category",
      },
      book
    );

    // Not exempt, so the 80-hour requirement still applies.
    expect(result.status).not.toBe("exempt");
    expect(result.targetHours).toBe(80);
  });

  it("flags someone behind the pace they need", () => {
    // Halfway through a 31-day month, 80 hours means ~41.3 expected. 20 is behind.
    const result = hoursCheck(
      {
        month: "2026-08",
        asOfDate: "2026-08-16",
        activities: [log("2026-08-05", 20)],
        exemptionCategory: null,
      },
      book
    );

    expect(result.totalHours).toBe(20);
    expect(result.targetHours).toBe(80);
    expect(result.remainingHours).toBe(60);
    expect(result.expectedByNow).toBe(41.3);
    expect(result.status).toBe("behind");
  });

  it("calls someone on pace when they are ahead of the run rate", () => {
    const result = hoursCheck(
      {
        month: "2026-08",
        asOfDate: "2026-08-16",
        activities: [log("2026-08-05", 50)],
        exemptionCategory: null,
      },
      book
    );

    expect(result.status).toBe("on_pace");
    expect(result.remainingHours).toBe(30);
  });

  it("reports the goal as met once the target is reached", () => {
    const result = hoursCheck(
      {
        month: "2026-08",
        asOfDate: "2026-08-28",
        activities: [log("2026-08-05", 40), log("2026-08-20", 45)],
        exemptionCategory: null,
      },
      book
    );

    expect(result.status).toBe("met");
    expect(result.remainingHours).toBe(0);
  });

  it("rejects malformed input instead of silently dropping it", () => {
    expect(() =>
      hoursCheck(
        {
          month: "August 2026",
          asOfDate: "2026-08-16",
          activities: [],
          exemptionCategory: null,
        },
        book
      )
    ).toThrow(/month must look like YYYY-MM/);

    expect(() =>
      hoursCheck(
        {
          month: "2026-08",
          asOfDate: "2026-08-16",
          activities: [{ id: "a1", kind: "job", date: "2026-08-05", hours: -4 }],
          exemptionCategory: null,
        },
        book
      )
    ).toThrow(/hours must be zero or more/);
  });

  it("keeps every exemption category the DHCS fact sheet lists", () => {
    // A category disappearing from /rules would silently strip someone's
    // exemption. Pin the full list so that edit has to be deliberate.
    const lookup = book.stringList("work_requirement_exemption_categories");
    expect(lookup.status).toBe("verified");
    if (lookup.status !== "verified") return;
    expect([...lookup.value].sort()).toEqual(
      [
        "american_indian_urban_indian",
        "caregiver_child_13_or_younger_or_disabled_person",
        "veteran_total_disability",
        "medically_frail_blind_disabled",
        "substance_use_disorder_or_disabling_mental_health",
        "physical_intellectual_developmental_disability",
        "serious_or_complex_medical_condition",
        "meeting_calfresh_calworks_work_requirements",
        "drug_or_alcohol_treatment_program",
        "currently_incarcerated",
        "pregnant_or_postpartum_12_months",
        "enrolled_in_school_or_training",
        "short_term_hardship",
      ].sort()
    );
  });
});

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import type { ScreenerAnswers, ScreenResult } from "../shared/src/index";
import { RuleBook, parseRuleSet, screen } from "../functions/src/engine/index";
import coreRuleSetJson from "../rules/medi-cal-core.rules.json";

/**
 * Golden persona suite.
 *
 * Each file in ./personas is a fictional applicant with a known correct
 * outcome. Every change to /rules or the engine must keep the whole suite
 * green, and every bug found gets a new persona here.
 */

interface Persona {
  readonly id: string;
  readonly summary: string;
  readonly answers: ScreenerAnswers;
  readonly expected: {
    readonly outcome: ScreenResult["outcome"];
    readonly pathway: ScreenResult["pathway"];
    readonly reasonCodes: readonly string[];
    readonly unverifiedRuleIds: readonly string[];
    readonly missingRuleIds: readonly string[];
    readonly rulesVerifiedThrough: string | null;
  };
  readonly pending_rule_verification?: boolean;
  readonly note?: string;
}

const personaDir = join(dirname(fileURLToPath(import.meta.url)), "personas");

const personas: Persona[] = readdirSync(personaDir)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => JSON.parse(readFileSync(join(personaDir, file), "utf8")) as Persona);

const book = new RuleBook(parseRuleSet(coreRuleSetJson));

describe("golden personas", () => {
  it("finds at least one persona to run", () => {
    expect(personas.length).toBeGreaterThan(0);
  });

  for (const persona of personas) {
    describe(`${persona.id}: ${persona.summary}`, () => {
      const result = screen(persona.answers, book);

      it("reaches the expected outcome and pathway", () => {
        expect(result.outcome).toBe(persona.expected.outcome);
        expect(result.pathway).toBe(persona.expected.pathway);
      });

      it("explains itself with the expected reasons, in order", () => {
        expect(result.reasons.map((reason) => reason.code)).toEqual(
          persona.expected.reasonCodes
        );
        for (const reason of result.reasons) {
          expect(reason.message.length).toBeGreaterThan(0);
        }
      });

      it("reports which rules it could not use", () => {
        expect([...result.unverifiedRuleIds].sort()).toEqual(
          [...persona.expected.unverifiedRuleIds].sort()
        );
        expect([...result.missingRuleIds].sort()).toEqual(
          [...persona.expected.missingRuleIds].sort()
        );
      });

      it("reports the verification date the UI has to display", () => {
        expect(result.rulesVerifiedThrough).toBe(persona.expected.rulesVerifiedThrough);
        expect(result.ruleSetVersion).toBe(book.version);
      });

      it("never states a determination and always hands off", () => {
        // The app screens; only the county determines.
        expect(result.headline).not.toMatch(/\byou (do|don't|do not) qualify\b/i);
        expect(result.nextStep.url).toMatch(/^https:\/\//);
        expect(result.nextStep.label.length).toBeGreaterThan(0);
      });
    });
  }
});

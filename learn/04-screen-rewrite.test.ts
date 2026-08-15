/**
 * Stage 04's judge: the real golden persona suite, pointed at YOUR engine.
 *
 * These are the exact same personas and the exact same checks that guard
 * production in tests/personas.test.ts. The only difference is the import on
 * the next line. When this file is fully green, your engine is correct and we
 * swap it in.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import type { ScreenResult, ScreenerAnswers } from "../shared/src/index";
import { RuleBook, parseRuleSet } from "../functions/src/engine/index";
import { screen } from "../functions/src/engine/screen.student";
import coreRuleSetJson from "../rules/medi-cal-core.rules.json";

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
}

const personaDir = join(dirname(fileURLToPath(import.meta.url)), "..", "tests", "personas");

const personas: Persona[] = readdirSync(personaDir)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => JSON.parse(readFileSync(join(personaDir, file), "utf8")) as Persona);

const book = new RuleBook(parseRuleSet(coreRuleSetJson));

describe("YOUR engine vs the golden personas", () => {
  for (const persona of personas) {
    describe(persona.id, () => {
      it("reaches the expected outcome and pathway", () => {
        const result = screen(persona.answers, book);
        expect(result.outcome).toBe(persona.expected.outcome);
        expect(result.pathway).toBe(persona.expected.pathway);
      });

      it("explains itself with the expected reason codes, in order", () => {
        const result = screen(persona.answers, book);
        expect(result.reasons.map((reason) => reason.code)).toEqual(
          persona.expected.reasonCodes
        );
        for (const reason of result.reasons) {
          expect(reason.message.length).toBeGreaterThan(0);
        }
      });

      it("reports which rules it could not use", () => {
        const result = screen(persona.answers, book);
        expect([...result.unverifiedRuleIds].sort()).toEqual(
          [...persona.expected.unverifiedRuleIds].sort()
        );
        expect([...result.missingRuleIds].sort()).toEqual(
          [...persona.expected.missingRuleIds].sort()
        );
      });

      it("reports the verification date the UI has to display", () => {
        const result = screen(persona.answers, book);
        expect(result.rulesVerifiedThrough).toBe(persona.expected.rulesVerifiedThrough);
        expect(result.ruleSetVersion).toBe(book.version);
      });

      it("never states a determination and always hands off", () => {
        const result = screen(persona.answers, book);
        expect(result.headline).not.toMatch(/\byou (do|don't|do not) qualify\b/i);
        expect(result.nextStep.url).toMatch(/^https:\/\//);
        expect(result.nextStep.label.length).toBeGreaterThan(0);
      });
    });
  }
});

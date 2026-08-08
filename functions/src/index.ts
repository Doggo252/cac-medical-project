import { setGlobalOptions } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { HoursCheckInput, ScreenerAnswers } from "../../shared/src/index";
import {
  InvalidInputError,
  hoursCheck as runHoursCheck,
  rulesStatus as runRulesStatus,
  screen as runScreen,
} from "./engine/index";
import { coreRuleBook } from "./ruleSet";

// Cost ceiling: 2 instances × 80 concurrent requests (v2 default) is far more
// than a demo app needs, and it hard-bounds worst-case spend if something
// starts hammering the public callables. Scale-to-zero keeps idle cost at $0.
setGlobalOptions({ maxInstances: 2 });

function asRecord(data: unknown): Record<string, unknown> {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new HttpsError("invalid-argument", "Expected an object of answers.");
  }
  return data as Record<string, unknown>;
}

function toHttpsError(error: unknown): never {
  if (error instanceof InvalidInputError) {
    throw new HttpsError("invalid-argument", error.message);
  }
  throw error;
}

/**
 * Screens a set of answers and returns a result plus a plain-language
 * explanation.
 *
 * Deliberately unauthenticated: the screener must work without sign-in, and
 * nothing it receives is stored. (Abuse protection belongs in App Check, not in
 * a sign-in wall.)
 */
export const screen = onCall({ cors: true }, (request) => {
  const answers = asRecord(request.data) as unknown as ScreenerAnswers;
  try {
    return runScreen(answers, coreRuleBook);
  } catch (error) {
    return toHttpsError(error);
  }
});

/**
 * Reports which rules are sourced, from where, and as of when.
 *
 * Unauthenticated: this is published public information, and showing it is how
 * the app stays honest about what it does and does not know.
 */
export const rulesStatus = onCall({ cors: true }, () => runRulesStatus(coreRuleBook));

/**
 * Totals a month of logged activities against the work requirement.
 *
 * Requires sign-in, because logged hours are per-user data.
 */
export const hoursCheck = onCall({ cors: true }, (request) => {
  if (request.auth === undefined) {
    throw new HttpsError("unauthenticated", "Sign in to track your hours.");
  }
  const input = asRecord(request.data) as unknown as HoursCheckInput;
  try {
    return runHoursCheck(input, coreRuleBook);
  } catch (error) {
    return toHttpsError(error);
  }
});

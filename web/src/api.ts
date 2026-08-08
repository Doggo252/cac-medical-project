import { httpsCallable } from "firebase/functions";

import type {
  HoursCheckInput,
  HoursCheckResult,
  RulesStatusResult,
  ScreenResult,
  ScreenerAnswers,
} from "@shared";
import { functions } from "./firebase";

/**
 * The only way this app gets an answer.
 *
 * There is no client-side copy of the rules engine and no fallback path — if
 * the API can't be reached, the UI says so rather than making something up.
 */
const screenCallable = httpsCallable<ScreenerAnswers, ScreenResult>(functions, "screen");
const rulesStatusCallable = httpsCallable<void, RulesStatusResult>(functions, "rulesStatus");
const hoursCheckCallable = httpsCallable<HoursCheckInput, HoursCheckResult>(
  functions,
  "hoursCheck"
);

export async function screen(answers: ScreenerAnswers): Promise<ScreenResult> {
  const response = await screenCallable(answers);
  return response.data;
}

export async function fetchRulesStatus(): Promise<RulesStatusResult> {
  const response = await rulesStatusCallable();
  return response.data;
}

export async function hoursCheck(input: HoursCheckInput): Promise<HoursCheckResult> {
  const response = await hoursCheckCallable(input);
  return response.data;
}

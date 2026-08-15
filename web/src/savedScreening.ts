import { Timestamp, deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import type { Pathway, ScreenOutcome, ScreenResult } from "@shared";
import { db } from "./firebase";

/**
 * The saved eligibility check: an explicit, opt-in copy of a screening
 * RESULT, never the answers behind it.
 *
 * Store-the-minimum: outcome, pathway, reason codes, and rule provenance are
 * enough to redisplay the result and (later) feed the risk indicator. Income,
 * household size, and every other answer stay unstored, so removing this doc
 * removes everything the screener ever knew about the person.
 *
 * One doc per user (`screenings/latest`); saving again overwrites, so there
 * is no silent history accumulating.
 */
export interface SavedScreening {
  readonly outcome: ScreenOutcome;
  readonly pathway: Pathway | null;
  readonly reasonCodes: readonly string[];
  readonly ruleSetVersion: string;
  readonly rulesVerifiedThrough: string | null;
  /** Set from the server clock at save time. */
  readonly savedAt: Date | null;
}

const screeningDoc = (uid: string) => doc(db, "users", uid, "screenings", "latest");

export async function saveScreening(uid: string, result: ScreenResult): Promise<void> {
  await setDoc(screeningDoc(uid), {
    outcome: result.outcome,
    pathway: result.pathway,
    reasonCodes: result.reasons.map((reason) => reason.code),
    ruleSetVersion: result.ruleSetVersion,
    rulesVerifiedThrough: result.rulesVerifiedThrough,
    savedAt: serverTimestamp(),
  });
}

export async function loadScreening(uid: string): Promise<SavedScreening | null> {
  const snapshot = await getDoc(screeningDoc(uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    outcome: data.outcome as ScreenOutcome,
    pathway: (data.pathway as Pathway | null) ?? null,
    reasonCodes: (data.reasonCodes as string[] | undefined) ?? [],
    ruleSetVersion: (data.ruleSetVersion as string | undefined) ?? "?",
    rulesVerifiedThrough: (data.rulesVerifiedThrough as string | null) ?? null,
    savedAt: data.savedAt instanceof Timestamp ? data.savedAt.toDate() : null,
  };
}

export async function deleteScreening(uid: string): Promise<void> {
  await deleteDoc(screeningDoc(uid));
}

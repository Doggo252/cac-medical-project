import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import type { ActivityKind, ActivityLog } from "@shared";
import { db } from "../firebase";

/**
 * Firestore access for the hours tracker.
 *
 * Everything lives under users/{uid}/... — firestore.rules enforces that only
 * the owner can read or write it. This module stores and lists; every
 * judgment about the hours (totals, pace, exemptions) happens server-side in
 * the hoursCheck callable.
 */

export interface StoredSettings {
  /** Exemption category slug, null = "none of these apply", undefined = never asked. */
  readonly exemptionCategory: string | null;
}

const settingsDoc = (uid: string) => doc(db, "users", uid, "settings", "hours");
const activitiesCol = (uid: string) => collection(db, "users", uid, "activities");

export async function loadSettings(uid: string): Promise<StoredSettings | null> {
  const snapshot = await getDoc(settingsDoc(uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return { exemptionCategory: (data.exemptionCategory as string | null) ?? null };
}

export async function saveExemption(uid: string, category: string | null): Promise<void> {
  await setDoc(
    settingsDoc(uid),
    { exemptionCategory: category, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function addActivity(
  uid: string,
  activity: { kind: ActivityKind; date: string; hours: number }
): Promise<void> {
  await addDoc(activitiesCol(uid), { ...activity, createdAt: serverTimestamp() });
}

export async function deleteActivity(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "activities", id));
}

/**
 * Live subscription to one month's activities, newest first. Returns the
 * unsubscribe function. Month prefix filtering uses the YYYY-MM-DD string
 * order — no timezone math, same convention as the engine.
 */
export function watchMonthActivities(
  uid: string,
  month: string,
  onChange: (activities: ActivityLog[]) => void,
  onError: (error: Error) => void
): () => void {
  const monthQuery = query(
    activitiesCol(uid),
    where("date", ">=", `${month}-01`),
    where("date", "<=", `${month}-31`),
    orderBy("date", "desc")
  );
  return onSnapshot(
    monthQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            kind: data.kind as ActivityKind,
            date: data.date as string,
            hours: data.hours as number,
          };
        })
      );
    },
    onError
  );
}

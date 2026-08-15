import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { fetchRulesStatus } from "../api";
import { auth, signOut } from "../firebase";
import { ExemptionPicker } from "../hours/ExemptionPicker";
import { SignInCard } from "../hours/SignInCard";
import { loadSettings, saveExemption, type StoredSettings } from "../hours/storage";
import { deleteScreening, loadScreening, type SavedScreening } from "../savedScreening";
import { strings } from "../strings";

/**
 * The account home: who you're signed in as, your exemption answer, and the
 * sign-out button, all in one predictable place, reachable from the header
 * chip on every screen.
 */
export function Profile() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => onAuthStateChanged(auth, (nextUser) => setUser(nextUser)), []);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
      {user === undefined && (
        <p className="py-12 text-center text-lg text-slate-500" aria-live="polite">
          {strings.loading.checking}
        </p>
      )}
      {user === null && (
        <SignInCard
          heading={strings.profile.signedOutHeading}
          body={strings.profile.signedOutBody}
        />
      )}
      {user != null && <SignedInProfile user={user} />}
    </div>
  );
}

/**
 * The saved eligibility check, if any. Reuses the result badges so the
 * profile shows exactly what the result screen showed: same words, same
 * caution that only the county decides.
 */
function ScreeningSection({ uid }: { readonly uid: string }) {
  // undefined = loading; null = nothing saved.
  const [screening, setScreening] = useState<SavedScreening | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    loadScreening(uid)
      .then((stored) => {
        if (!cancelled) setScreening(stored);
      })
      .catch(() => {
        if (!cancelled) setScreening(null);
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return (
    <>
      <h3 className="mt-7 text-sm font-semibold tracking-wide text-slate-500 uppercase">
        {strings.profile.screening.heading}
      </h3>

      {screening === undefined ? (
        <p className="mt-2 text-base text-slate-500">{strings.loading.checking}</p>
      ) : screening === null ? (
        <>
          <p className="mt-2 text-base leading-relaxed text-slate-700">
            {strings.profile.screening.none}
          </p>
          <a
            href="#/"
            className="mt-3 inline-block rounded-xl border-2 border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-600 hover:text-teal-800"
          >
            {strings.profile.screening.runCheck}
          </a>
        </>
      ) : (
        <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${TONE[screening.outcome].badge}`}
          >
            {strings.result[screening.outcome].badge}
          </span>
          {screening.pathway !== null && (
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {strings.profile.screening.pathwayLine(
                strings.profile.screening.pathways[screening.pathway] ?? screening.pathway
              )}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            {screening.savedAt !== null &&
              strings.profile.screening.savedOn(
                screening.savedAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              )}
            {screening.rulesVerifiedThrough !== null &&
              ` · ${strings.result.verifiedThrough(screening.rulesVerifiedThrough)}`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="#/"
              className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-600 hover:text-teal-800"
            >
              {strings.profile.screening.checkAgain}
            </a>
            <button
              type="button"
              onClick={() => {
                void deleteScreening(uid).then(() => setScreening(null));
              }}
              className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:border-red-400 hover:text-red-700"
            >
              {strings.profile.screening.remove}
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            {strings.profile.screening.removeHint}
          </p>
        </div>
      )}
    </>
  );
}

/** Badge tones, mirrored from the result card so outcomes look identical. */
const TONE = {
  likely_eligible: { badge: "bg-emerald-100 text-emerald-900 ring-emerald-200" },
  likely_not_eligible: { badge: "bg-amber-100 text-amber-900 ring-amber-200" },
  needs_human: { badge: "bg-sky-100 text-sky-900 ring-sky-200" },
} as const;

function SignedInProfile({ user }: { readonly user: User }) {
  // undefined = loading; null = signed in but exemption never answered.
  const [settings, setSettings] = useState<StoredSettings | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [categories, setCategories] = useState<readonly string[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSettings(user.uid)
      .then((stored) => {
        if (!cancelled) setSettings(stored);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user.uid]);

  // The category list is only needed once the person wants to change their
  // answer, so fetch it lazily, from the API as always.
  useEffect(() => {
    if (!editing || categories !== null) return;
    let cancelled = false;
    fetchRulesStatus()
      .then((status) => {
        const rule = status.rules.find(
          (candidate) => candidate.id === "work_requirement_exemption_categories"
        );
        if (!cancelled) setCategories(Array.isArray(rule?.value) ? rule.value : []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [editing, categories]);

  const memberSince =
    user.metadata.creationTime !== undefined
      ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  return (
    <section aria-labelledby="profile-heading">
      <h2 id="profile-heading" className="text-2xl font-semibold text-slate-900">
        {strings.profile.heading}
      </h2>

      <dl className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
        <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {strings.profile.emailLabel}
        </dt>
        <dd className="mt-0.5 text-base font-medium break-all text-slate-900">
          {user.email ?? "-"}
        </dd>
        {memberSince !== null && (
          <dd className="mt-1 text-sm text-slate-500">
            {strings.profile.memberSince(memberSince)}
          </dd>
        )}
      </dl>

      <ScreeningSection uid={user.uid} />

      <h3 className="mt-7 text-sm font-semibold tracking-wide text-slate-500 uppercase">
        {strings.profile.exemptionHeading}
      </h3>

      {editing ? (
        categories === null ? (
          <p className="mt-3 text-base text-slate-500" aria-live="polite">
            {strings.loading.checking}
          </p>
        ) : (
          <div className="mt-3">
            <ExemptionPicker
              categories={categories}
              initial={settings?.exemptionCategory ?? null}
              onSave={(category) => {
                void saveExemption(user.uid, category)
                  .then(() => {
                    setSettings({ exemptionCategory: category });
                    setEditing(false);
                  })
                  .catch(() => setError(true));
              }}
            />
          </div>
        )
      ) : (
        <>
          <p className="mt-2 text-base leading-relaxed text-slate-700">
            {settings === undefined
              ? strings.loading.checking
              : settings === null
                ? strings.profile.exemptionUnanswered
                : settings.exemptionCategory === null
                  ? strings.profile.exemptionNotExempt
                  : strings.profile.exemptionExempt(
                      strings.tracker.exemption.categories[settings.exemptionCategory] ??
                        settings.exemptionCategory
                    )}
          </p>
          {settings !== undefined && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-3 rounded-xl border-2 border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-600 hover:text-teal-800"
            >
              {strings.profile.changeAnswer}
            </button>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-700">
          {strings.tracker.errors.loadFailed}
        </p>
      )}

      <div className="mt-8 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={() => void signOut()}
          className="w-full rounded-xl border-2 border-red-300 px-6 py-3.5 text-base font-semibold text-red-700 transition hover:border-red-500 hover:bg-red-50"
        >
          {strings.profile.signOut}
        </button>
        <p className="mt-2 text-center text-sm text-slate-500">{strings.profile.signOutHint}</p>
      </div>
    </section>
  );
}

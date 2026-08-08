import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import type { ActivityLog, HoursCheckResult, RulesStatusResult } from "@shared";
import { fetchRulesStatus, hoursCheck } from "../api";
import { auth, signOut } from "../firebase";
import { strings } from "../strings";
import { ActivityForm } from "./ActivityForm";
import { ExemptionPicker } from "./ExemptionPicker";
import { HoursProgress } from "./HoursProgress";
import { SignInCard } from "./SignInCard";
import { currentMonth, formatLongDate, todayIso } from "./dates";
import {
  addActivity,
  deleteActivity,
  loadSettings,
  saveExemption,
  watchMonthActivities,
  type StoredSettings,
} from "./storage";

/**
 * P0 feature 3, the hero: exemption check first; if not exempt, log
 * activities and watch the live "X of 80 hours" bar.
 *
 * Division of labor: Firestore stores, the hoursCheck callable judges, this
 * component renders. No hours math happens in the client.
 */
export function HoursTracker() {
  // undefined = auth state still resolving.
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => onAuthStateChanged(auth, (nextUser) => setUser(nextUser)), []);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
      {user === undefined && <Loading />}
      {user === null && <SignInCard />}
      {user != null && <SignedIn user={user} />}
    </div>
  );
}

function SignedIn({ user }: { readonly user: User }) {
  // undefined = still loading from Firestore; null = signed in but never asked.
  const [settings, setSettings] = useState<StoredSettings | null | undefined>(undefined);
  const [rules, setRules] = useState<RulesStatusResult | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [changingAnswer, setChangingAnswer] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadSettings(user.uid), fetchRulesStatus()])
      .then(([storedSettings, rulesStatus]) => {
        if (cancelled) return;
        setSettings(storedSettings);
        setRules(rulesStatus);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user.uid]);

  const exemptionRule = rules?.rules.find(
    (rule) => rule.id === "work_requirement_exemption_categories"
  );
  const hoursRule = rules?.rules.find((rule) => rule.id === "work_requirement_monthly_hours");
  const categories = Array.isArray(exemptionRule?.value) ? exemptionRule.value : [];

  if (loadFailed) return <LoadError />;
  if (settings === undefined || rules === null) return <Loading />;

  const needsExemptionAnswer = settings === null || changingAnswer;

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-2xl font-semibold text-slate-900">{strings.tracker.heading}</h2>
        <button
          type="button"
          onClick={() => void signOut()}
          className="shrink-0 text-sm font-medium text-slate-500 underline underline-offset-4 hover:text-slate-800"
        >
          {strings.tracker.signIn.signOut}
        </button>
      </div>

      <FutureStartBanner effectiveDate={hoursRule?.effectiveDate} />

      {needsExemptionAnswer ? (
        <div className="mt-6">
          <ExemptionPicker
            categories={categories}
            initial={settings?.exemptionCategory ?? null}
            onSave={(category) => {
              void saveExemption(user.uid, category).then(() => {
                setSettings({ exemptionCategory: category });
                setChangingAnswer(false);
              });
            }}
          />
        </div>
      ) : (
        <Dashboard
          user={user}
          exemptionCategory={settings.exemptionCategory}
          onChangeAnswer={() => setChangingAnswer(true)}
        />
      )}
    </div>
  );
}

/**
 * The "ready for the future" framing. The start date comes from the rule's
 * effective_date via the API — when DHCS moves the date, this banner follows
 * with no code change. Once the date passes, the banner retires itself.
 */
function FutureStartBanner({ effectiveDate }: { readonly effectiveDate: string | undefined }) {
  if (effectiveDate === undefined || todayIso() >= effectiveDate) return null;
  return (
    <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
      <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold tracking-wide text-sky-900 uppercase">
        {strings.tracker.notYetBanner.badge}
      </span>
      <p className="mt-2 text-sm leading-relaxed text-sky-950">
        {strings.tracker.notYetBanner.body(formatLongDate(effectiveDate))}
      </p>
    </div>
  );
}

function Dashboard({
  user,
  exemptionCategory,
  onChangeAnswer,
}: {
  readonly user: User;
  readonly exemptionCategory: string | null;
  readonly onChangeAnswer: () => void;
}) {
  const month = currentMonth();
  const [activities, setActivities] = useState<ActivityLog[] | null>(null);
  const [result, setResult] = useState<HoursCheckResult | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(
    () =>
      watchMonthActivities(user.uid, month, setActivities, () => setLoadFailed(true)),
    [user.uid, month]
  );

  // Re-judge whenever the log changes. The callable is cheap and stateless.
  useEffect(() => {
    if (activities === null) return;
    let cancelled = false;
    hoursCheck({ month, asOfDate: todayIso(), activities, exemptionCategory })
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [activities, exemptionCategory, month]);

  if (loadFailed) return <LoadError />;
  if (activities === null || result === null) return <Loading />;

  if (result.status === "exempt") {
    return (
      <section className="mt-6" aria-live="polite">
        <h3 className="text-xl font-semibold text-slate-900">
          {strings.tracker.exemption.exemptHeading}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          {strings.tracker.exemption.exemptBody}
        </p>
        <ChangeAnswerButton onClick={onChangeAnswer} />
        <Provenance result={result} />
      </section>
    );
  }

  return (
    <div className="mt-6">
      <HoursProgress result={result} />

      <h3 className="mt-8 text-sm font-semibold tracking-wide text-slate-500 uppercase">
        {strings.tracker.dashboard.logHeading}
      </h3>
      <div className="mt-3">
        <ActivityForm onAdd={(activity) => addActivity(user.uid, activity)} />
      </div>

      <h3 className="mt-8 text-sm font-semibold tracking-wide text-slate-500 uppercase">
        {strings.tracker.dashboard.listHeading}
      </h3>
      <ActivityList
        activities={activities}
        onDelete={(id) => void deleteActivity(user.uid, id)}
      />

      <ChangeAnswerButton onClick={onChangeAnswer} />
      <Provenance result={result} />
    </div>
  );
}

function ActivityList({
  activities,
  onDelete,
}: {
  readonly activities: readonly ActivityLog[];
  readonly onDelete: (id: string) => void;
}) {
  if (activities.length === 0) {
    return <p className="mt-3 text-sm text-slate-500">{strings.tracker.dashboard.emptyLog}</p>;
  }
  return (
    <ul className="mt-3 divide-y divide-slate-100">
      {activities.map((activity) => {
        const description = `${strings.tracker.form.kinds[activity.kind] ?? activity.kind}, ${activity.date}, ${activity.hours}h`;
        return (
          <li key={activity.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="text-base font-medium text-slate-800">
                {strings.tracker.form.kinds[activity.kind] ?? activity.kind}
                <span className="ml-2 font-semibold text-teal-700">{activity.hours}h</span>
              </p>
              <p className="text-sm text-slate-500">{activity.date}</p>
            </div>
            <button
              type="button"
              onClick={() => onDelete(activity.id)}
              aria-label={strings.tracker.form.deleteAriaLabel(description)}
              className="shrink-0 text-sm font-medium text-slate-400 underline underline-offset-4 hover:text-red-700"
            >
              {strings.tracker.form.delete}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ChangeAnswerButton({ onClick }: { readonly onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 block text-sm font-medium text-slate-500 underline underline-offset-4 hover:text-slate-800"
    >
      {strings.tracker.exemption.change}
    </button>
  );
}

function Provenance({ result }: { readonly result: HoursCheckResult }) {
  return (
    <div className="mt-6 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">
      {result.rulesVerifiedThrough === null ? (
        <p>{strings.result.notVerifiedYet}</p>
      ) : (
        <p>{strings.result.verifiedThrough(result.rulesVerifiedThrough)}</p>
      )}
      <p className="mt-1 font-mono text-xs text-slate-400">
        {strings.result.ruleSetVersion(result.ruleSetVersion)}
      </p>
    </div>
  );
}

function Loading() {
  return (
    <p className="py-12 text-center text-lg text-slate-500" aria-live="polite">
      {strings.loading.checking}
    </p>
  );
}

function LoadError() {
  return (
    <section aria-live="assertive" className="py-6">
      <h3 className="text-xl font-semibold text-slate-900">{strings.error.heading}</h3>
      <p className="mt-2 text-base leading-relaxed text-slate-600">
        {strings.tracker.errors.loadFailed}
      </p>
    </section>
  );
}

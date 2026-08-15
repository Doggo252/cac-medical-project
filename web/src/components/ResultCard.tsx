import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import type { ScreenResult } from "@shared";
import { auth } from "../firebase";
import { SignInCard } from "../hours/SignInCard";
import { saveScreening } from "../savedScreening";
import { strings } from "../strings";

interface ResultCardProps {
  readonly result: ScreenResult;
  readonly onStartOver: () => void;
}

const TONE = {
  likely_eligible: {
    badge: "bg-emerald-100 text-emerald-900 ring-emerald-200",
    accent: "border-emerald-500",
  },
  likely_not_eligible: {
    badge: "bg-amber-100 text-amber-900 ring-amber-200",
    accent: "border-amber-500",
  },
  needs_human: {
    badge: "bg-sky-100 text-sky-900 ring-sky-200",
    accent: "border-sky-500",
  },
} as const;

export function ResultCard({ result, onStartOver }: ResultCardProps) {
  const tone = TONE[result.outcome];
  const copy = strings.result[result.outcome];

  return (
    <section aria-labelledby="result-headline" aria-live="polite">
      <span
        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${tone.badge}`}
      >
        {copy.badge}
      </span>

      <h2 id="result-headline" className="mt-4 text-3xl font-semibold text-balance text-slate-900">
        {result.headline}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-slate-600">{copy.note}</p>

      <h3 className="mt-8 text-sm font-semibold tracking-wide text-slate-500 uppercase">
        {strings.result.whyHeading}
      </h3>
      <ul className={`mt-3 space-y-3 border-l-4 pl-4 ${tone.accent}`}>
        {result.reasons.map((reason) => (
          // The API returns a plain-language `message` alongside a stable
          // `code`. P2 Spanish support switches this to a lookup on `code`.
          <li key={reason.code} className="text-base leading-relaxed text-slate-700">
            {reason.message}
            {reason.ruleIds.length > 0 && (
              <span className="mt-1 block font-mono text-xs break-all text-slate-400">
                {reason.ruleIds.join(", ")}
              </span>
            )}
          </li>
        ))}
      </ul>

      <a
        href={result.nextStep.url}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-8 block w-full rounded-xl bg-teal-700 px-6 py-4 text-center text-lg font-semibold text-white transition hover:bg-teal-800"
      >
        {result.nextStep.label} ↗
      </a>

      {result.outcome === "likely_eligible" && <KeepCoverageSection />}

      <SaveResultButton result={result} />

      <Provenance result={result} />

      <button
        type="button"
        onClick={onStartOver}
        className="mt-6 text-sm font-medium text-slate-500 underline underline-offset-4 hover:text-slate-800"
      >
        {strings.result.startOver}
      </button>
    </section>
  );
}

/**
 * The opt-in auth flow after a positive screen. The screener itself never
 * requires an account; this section offers one, framed around what the
 * account is actually FOR (tracking hours to keep coverage).
 *
 * Signed out: a CTA that expands into the shared sign-in card; the moment
 * sign-in completes, we hand off to the tracker. Signed in already: a plain
 * link to the tracker.
 */
function KeepCoverageSection() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [expanded, setExpanded] = useState(false);
  const expandedRef = useRef(false);
  expandedRef.current = expanded;

  useEffect(
    () =>
      onAuthStateChanged(auth, (nextUser) => {
        setUser(nextUser);
        // Sign-in finished: collapse back to the signed-in view. Deliberately
        // NO auto-redirect: the person stays on their result, where the
        // save-to-account option and the tracker link are both in reach.
        if (nextUser !== null && expandedRef.current) {
          setExpanded(false);
        }
      }),
    []
  );

  return (
    <section
      aria-labelledby="keep-coverage-heading"
      className="mt-6 rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-4"
    >
      <h3 id="keep-coverage-heading" className="text-base font-semibold text-slate-900">
        {strings.result.keepCoverage.heading}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        {strings.result.keepCoverage.body}
      </p>

      {user != null ? (
        <>
          {user.email !== null && (
            <p className="mt-3 text-sm text-slate-500">
              {strings.result.keepCoverage.signedInAs(user.email)}
            </p>
          )}
          <a
            href="#/hours"
            className="mt-3 block w-full rounded-xl border-2 border-teal-700 px-6 py-3.5 text-center text-base font-semibold text-teal-800 transition hover:bg-teal-100"
          >
            {strings.result.keepCoverage.goToTracker}
          </a>
        </>
      ) : expanded ? (
        <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-900/5">
          <SignInCard />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 w-full rounded-xl border-2 border-teal-700 px-6 py-3.5 text-base font-semibold text-teal-800 transition hover:bg-teal-100"
        >
          {strings.result.keepCoverage.cta}
        </button>
      )}
    </section>
  );
}

/**
 * Opt-in persistence of the result (signed-in users only, any outcome).
 * Saving stores the minimal summary (see savedScreening.ts), never the
 * answers. Nothing is ever saved without this click.
 */
function SaveResultButton({ result }: { readonly result: ScreenResult }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  useEffect(() => onAuthStateChanged(auth, (nextUser) => setUser(nextUser)), []);

  if (user == null) return null;

  if (state === "saved") {
    return (
      <p
        aria-live="polite"
        className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-900"
      >
        {strings.result.save.saved}
      </p>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={state === "saving"}
        onClick={() => {
          setState("saving");
          saveScreening(user.uid, result)
            .then(() => setState("saved"))
            .catch(() => setState("failed"));
        }}
        className="w-full rounded-xl border-2 border-slate-300 px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:border-teal-600 hover:text-teal-800 disabled:border-slate-200 disabled:text-slate-400"
      >
        {state === "saving" ? strings.result.save.saving : strings.result.save.cta}
      </button>
      {state === "failed" && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-700">
          {strings.tracker.errors.saveFailed}
        </p>
      )}
    </div>
  );
}

/**
 * The "Based on rules verified [date]" line, required wherever a determination
 * is shown. When no rule used was verified, saying nothing would be misleading,
 * so the honest version gets shown instead.
 */
function Provenance({ result }: { readonly result: ScreenResult }) {
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

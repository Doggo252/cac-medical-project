import type { ScreenResult } from "@shared";
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
 * The "Based on rules verified [date]" line, required wherever a determination
 * is shown. When no rule used was verified, saying nothing would be misleading
 * — so the honest version gets shown instead.
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

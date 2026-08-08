import type { HoursCheckResult } from "@shared";
import { strings } from "../strings";

/**
 * The hero visual: "62 of 80 hours this month" with a live bar and a pace
 * chip. Every number here comes from the hoursCheck result — the client does
 * no hours math at all.
 */
export function HoursProgress({ result }: { readonly result: HoursCheckResult }) {
  const chip = {
    met: "bg-emerald-100 text-emerald-900 ring-emerald-200",
    on_pace: "bg-emerald-100 text-emerald-900 ring-emerald-200",
    behind: "bg-amber-100 text-amber-900 ring-amber-200",
    exempt: "bg-sky-100 text-sky-900 ring-sky-200",
    unknown: "bg-slate-100 text-slate-700 ring-slate-200",
  }[result.status];

  const barColor = result.status === "behind" ? "bg-amber-500" : "bg-teal-600";
  const percent =
    result.targetHours === null || result.targetHours === 0
      ? 0
      : Math.min(100, Math.round((result.totalHours / result.targetHours) * 100));

  return (
    <section aria-label={strings.tracker.heading}>
      <div className="flex items-baseline justify-between gap-2">
        <p>
          <span className="text-4xl font-bold text-slate-900">
            {result.targetHours === null
              ? result.totalHours
              : strings.tracker.dashboard.hoursOf(result.totalHours, result.targetHours)}
          </span>
          <span className="ml-2 text-sm text-slate-500">
            {strings.tracker.dashboard.hoursUnit}
          </span>
        </p>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${chip}`}
        >
          {strings.tracker.dashboard.status[result.status]}
        </span>
      </div>

      {result.targetHours !== null && (
        <div
          className="mt-4 h-4 w-full overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={result.totalHours}
          aria-valuemin={0}
          aria-valuemax={result.targetHours}
          aria-label={`${result.totalHours} of ${result.targetHours} ${strings.tracker.dashboard.hoursUnit}`}
        >
          <div
            className={`h-full rounded-full transition-[width] duration-500 ease-out ${barColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {/* The engine's plain-language summary — pace, shortfall, or exempt. */}
      <p className="mt-3 text-base leading-relaxed text-slate-600" aria-live="polite">
        {result.message}
      </p>
    </section>
  );
}

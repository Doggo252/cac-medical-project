import { strings } from "../strings";

interface ProgressBarProps {
  readonly current: number;
  readonly total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="mb-6">
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={strings.nav.progress(current, total)}
      >
        <div
          className="h-full rounded-full bg-teal-600 transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-slate-500">{strings.nav.progress(current, total)}</p>
    </div>
  );
}

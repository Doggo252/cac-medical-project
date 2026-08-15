import { useState } from "react";

import type { ActivityKind } from "@shared";
import { strings } from "../strings";
import { todayIso } from "./dates";

const KINDS: readonly ActivityKind[] = ["job", "school", "training", "volunteer"];

interface ActivityFormProps {
  readonly onAdd: (activity: { kind: ActivityKind; date: string; hours: number }) => Promise<void>;
}

export function ActivityForm({ onAdd }: ActivityFormProps) {
  const [kind, setKind] = useState<ActivityKind>("job");
  const [date, setDate] = useState(todayIso());
  const [hoursText, setHoursText] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  const hours = Number(hoursText);
  const hoursValid = hoursText.trim() !== "" && Number.isFinite(hours) && hours >= 0.5 && hours <= 24;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitAttempted(true);
        if (!hoursValid || saving) return;
        setSaving(true);
        setSaveFailed(false);
        onAdd({ kind, date, hours })
          .then(() => {
            // Fresh slate for the next entry; a cleared field is not an error.
            setHoursText("");
            setSubmitAttempted(false);
          })
          .catch(() => setSaveFailed(true))
          .finally(() => setSaving(false));
      }}
    >
      <fieldset>
        <legend className="text-sm font-semibold text-slate-700">
          {strings.tracker.form.kindLabel}
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {KINDS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={kind === option}
              onClick={() => setKind(option)}
              className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
                kind === option
                  ? "border-teal-700 bg-teal-700 text-white"
                  : "border-slate-200 bg-white text-slate-800 hover:border-teal-500"
              }`}
            >
              {strings.tracker.form.kinds[option]}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="activity-date" className="text-sm font-semibold text-slate-700">
            {strings.tracker.form.dateLabel}
          </label>
          <input
            id="activity-date"
            type="date"
            value={date}
            max={todayIso()}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 focus:border-teal-600 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="activity-hours" className="text-sm font-semibold text-slate-700">
            {strings.tracker.form.hoursLabel}
          </label>
          <input
            id="activity-hours"
            type="number"
            inputMode="decimal"
            step="0.5"
            min={0.5}
            max={24}
            value={hoursText}
            onChange={(event) => setHoursText(event.target.value)}
            aria-invalid={submitAttempted && !hoursValid}
            aria-describedby="activity-hours-error"
            className="mt-2 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 focus:border-teal-600 focus:outline-none"
          />
        </div>
      </div>

      {submitAttempted && !hoursValid && (
        <p id="activity-hours-error" role="alert" className="mt-2 text-sm font-medium text-red-700">
          {strings.tracker.form.hoursRange}
        </p>
      )}
      {saveFailed && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-700">
          {strings.tracker.errors.saveFailed}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-4 w-full rounded-xl bg-teal-700 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-teal-800 disabled:bg-slate-300"
      >
        {strings.tracker.form.submit}
      </button>
    </form>
  );
}

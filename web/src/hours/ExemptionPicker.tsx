import { useState } from "react";

import { strings } from "../strings";

interface ExemptionPickerProps {
  /** Slugs from the work_requirement_exemption_categories rule, via the API. */
  readonly categories: readonly string[];
  readonly initial: string | null;
  readonly onSave: (category: string | null) => void;
}

/**
 * The exemption check — deliberately the FIRST thing the tracker asks.
 * Nobody should be logging hours they don't owe.
 *
 * The category list comes from the rules API, so a new exemption in /rules
 * shows up here with no UI change. A slug without a label yet still renders
 * (as its slug) rather than silently disappearing — an ugly label is a bug,
 * a missing exemption option is a harm.
 */
export function ExemptionPicker({ categories, initial, onSave }: ExemptionPickerProps) {
  // undefined = nothing chosen yet; null = "none of these apply".
  const [choice, setChoice] = useState<string | null | undefined>(initial);

  const optionBase =
    "block w-full cursor-pointer rounded-xl border-2 px-4 py-3 text-left text-base leading-snug transition";
  const chosen = "border-teal-700 bg-teal-50 text-teal-900";
  const unchosen = "border-slate-200 bg-white text-slate-800 hover:border-teal-500";

  return (
    <section aria-labelledby="exemption-heading">
      <h2 id="exemption-heading" className="text-2xl font-semibold text-balance text-slate-900">
        {strings.tracker.exemption.heading}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-slate-600">
        {strings.tracker.exemption.body}
      </p>

      <div role="radiogroup" aria-labelledby="exemption-heading" className="mt-6 flex flex-col gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            role="radio"
            aria-checked={choice === category}
            onClick={() => setChoice(category)}
            className={`${optionBase} ${choice === category ? chosen : unchosen}`}
          >
            {strings.tracker.exemption.categories[category] ?? category}
          </button>
        ))}
        <button
          type="button"
          role="radio"
          aria-checked={choice === null}
          onClick={() => setChoice(null)}
          className={`${optionBase} font-semibold ${choice === null ? chosen : unchosen}`}
        >
          {strings.tracker.exemption.none}
        </button>
      </div>

      <button
        type="button"
        disabled={choice === undefined}
        onClick={() => {
          if (choice !== undefined) onSave(choice);
        }}
        className="mt-6 w-full rounded-xl bg-teal-700 px-6 py-4 text-lg font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {strings.tracker.exemption.confirm}
      </button>
    </section>
  );
}

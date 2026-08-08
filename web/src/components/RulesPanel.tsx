import { useEffect, useState } from "react";

import type { RulesStatusResult } from "@shared";
import { fetchRulesStatus } from "../api";
import { strings } from "../strings";

/**
 * Shows which numbers are sourced and which aren't.
 *
 * The data comes from the `rulesStatus` callable — the client never reads
 * /rules directly, same as it never evaluates one.
 */
export function RulesPanel() {
  const [status, setStatus] = useState<RulesStatusResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchRulesStatus()
      .then((value) => {
        if (!cancelled) setStatus(value);
      })
      .catch(() => {
        // A missing rules panel must never break the screener.
        if (!cancelled) setStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === null) return null;

  return (
    <details className="mt-8 rounded-xl border border-slate-200 bg-white">
      <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-slate-700">
        {strings.rulesPanel.heading}
        <span className="ml-2 font-normal text-slate-500">
          — {strings.rulesPanel.summary(status.verifiedCount, status.totalCount)}
        </span>
      </summary>

      <div className="border-t border-slate-200 px-5 py-4">
        <p className="text-sm leading-relaxed text-slate-500">
          {strings.rulesPanel.devOnlyNote}
        </p>

        <ul className="mt-4 space-y-4">
          {status.rules.map((rule) => (
            <li key={rule.id} className="border-l-2 border-slate-200 pl-4">
              <p className="font-mono text-xs break-all text-slate-500">{rule.id}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{rule.description}</p>

              <p className="mt-2 text-sm">
                {rule.verified ? (
                  <span className="font-semibold text-emerald-700">
                    {JSON.stringify(rule.value)}{" "}
                    <span className="font-normal text-slate-500">({rule.unit})</span>
                  </span>
                ) : (
                  <span className="rounded bg-amber-100 px-2 py-0.5 font-semibold text-amber-900">
                    {strings.rulesPanel.unverified}
                  </span>
                )}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {rule.verified && rule.sourceUrl !== "" ? (
                  <a
                    href={rule.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline underline-offset-2"
                  >
                    {rule.sourceName}
                  </a>
                ) : (
                  strings.rulesPanel.noSource
                )}
                {" · "}
                {strings.rulesPanel.effectiveFrom(rule.effectiveDate)}
                {rule.lastVerified !== null &&
                  ` · ${strings.rulesPanel.verifiedOn(rule.lastVerified)}`}
              </p>

              {rule.notes !== null && (
                <p className="mt-2 text-xs leading-relaxed text-slate-400 italic">{rule.notes}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

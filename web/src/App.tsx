import { useEffect, useState } from "react";

import { Screener } from "./Screener";
import { RulesPanel } from "./components/RulesPanel";
import { HoursTracker } from "./hours/HoursTracker";
import { strings } from "./strings";

/**
 * Hash routing, deliberately tiny: "" → screener, "#/hours" → tracker. The
 * back button and demo deep links work, and no router dependency is needed
 * for a two-view app.
 */
type Route = "screener" | "hours";

function routeFromHash(): Route {
  return window.location.hash === "#/hours" ? "hours" : "screener";
}

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash);

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="min-h-dvh">
      <header className="mx-auto w-full max-w-md px-5 pt-8 pb-4">
        <p className="text-sm font-semibold tracking-wide text-teal-700 uppercase">
          {strings.app.name}
        </p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{strings.app.tagline}</p>
      </header>

      <nav aria-label={strings.app.name} className="mx-auto w-full max-w-md px-5 pb-4">
        <div className="grid grid-cols-2 gap-2">
          <Tab
            href="#/"
            active={route === "screener"}
            title={strings.home.screenerCard.title}
            body={strings.home.screenerCard.body}
          />
          <Tab
            href="#/hours"
            active={route === "hours"}
            title={strings.home.trackerCard.title}
            body={strings.home.trackerCard.body}
          />
        </div>
      </nav>

      <main className="mx-auto w-full max-w-md px-5 pb-16">
        {route === "screener" ? <Screener /> : <HoursTracker />}
        <RulesPanel />
      </main>
    </div>
  );
}

function Tab({
  href,
  active,
  title,
  body,
}: {
  readonly href: string;
  readonly active: boolean;
  readonly title: string;
  readonly body: string;
}) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-xl border-2 px-4 py-3 transition ${
        active
          ? "border-teal-700 bg-teal-700 text-white"
          : "border-slate-200 bg-white text-slate-800 hover:border-teal-500"
      }`}
    >
      <span className="block text-sm font-bold">{title}</span>
      <span className={`mt-0.5 block text-xs leading-snug ${active ? "text-teal-50" : "text-slate-500"}`}>
        {body}
      </span>
    </a>
  );
}

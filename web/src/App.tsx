import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { Screener } from "./Screener";
import { RulesPanel } from "./components/RulesPanel";
import { auth } from "./firebase";
import { HoursTracker } from "./hours/HoursTracker";
import { Profile } from "./profile/Profile";
import { strings } from "./strings";

/**
 * Hash routing, deliberately tiny: "" → screener, "#/hours" → tracker,
 * "#/profile" → account. Back button and demo deep links work with no router
 * dependency.
 */
type Route = "screener" | "hours" | "profile";

function routeFromHash(): Route {
  if (window.location.hash === "#/hours") return "hours";
  if (window.location.hash === "#/profile") return "profile";
  return "screener";
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
      <header className="mx-auto flex w-full max-w-md items-start justify-between gap-3 px-5 pt-8 pb-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-teal-700 uppercase">
            {strings.app.name}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{strings.app.tagline}</p>
        </div>
        <AccountChip active={route === "profile"} />
      </header>

      <nav aria-label={strings.app.name} className="mx-auto w-full max-w-md px-5 pb-4">
        <div className="grid grid-cols-2 gap-2">
          <Tab href="#/" active={route === "screener"} label={strings.home.tabs.screener} />
          <Tab href="#/hours" active={route === "hours"} label={strings.home.tabs.hours} />
        </div>
      </nav>

      <main className="mx-auto w-full max-w-md px-5 pb-16">
        {route === "screener" && <Screener />}
        {route === "hours" && <HoursTracker />}
        {route === "profile" && <Profile />}
        <RulesPanel />
      </main>
    </div>
  );
}

/**
 * The one always-visible account affordance. Signed in: a circle with your
 * initial. Signed out: a plain "Sign in" button. Both land on #/profile,
 * which is where sign-in, sign-out, and account details all live.
 */
function AccountChip({ active }: { readonly active: boolean }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => onAuthStateChanged(auth, (nextUser) => setUser(nextUser)), []);

  // Auth state still resolving: reserve the space, avoid a layout jump.
  if (user === undefined) return <div className="h-10 w-10" aria-hidden="true" />;

  if (user === null) {
    return (
      <a
        href="#/profile"
        className={`mt-1 shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition ${
          active
            ? "border-teal-700 bg-teal-700 text-white"
            : "border-slate-300 text-slate-700 hover:border-teal-600 hover:text-teal-800"
        }`}
      >
        {strings.home.accountChip.signIn}
      </a>
    );
  }

  const initial = (user.email ?? "?").charAt(0).toUpperCase();
  return (
    <a
      href="#/profile"
      aria-label={strings.home.accountChip.profileAria}
      aria-current={active ? "page" : undefined}
      className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold transition ${
        active
          ? "bg-teal-700 text-white ring-2 ring-teal-700 ring-offset-2"
          : "bg-teal-100 text-teal-900 hover:ring-2 hover:ring-teal-600 hover:ring-offset-2"
      }`}
    >
      {initial}
    </a>
  );
}

function Tab({
  href,
  active,
  label,
}: {
  readonly href: string;
  readonly active: boolean;
  readonly label: string;
}) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-xl border-2 px-4 py-3 text-center text-sm font-bold transition ${
        active
          ? "border-teal-700 bg-teal-700 text-white"
          : "border-slate-200 bg-white text-slate-800 hover:border-teal-500"
      }`}
    >
      {label}
    </a>
  );
}

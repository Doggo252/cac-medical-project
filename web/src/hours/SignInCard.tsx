import { useEffect, useRef, useState } from "react";

import {
  completeEmailLink,
  devSignIn,
  hasPendingEmailLink,
  sendEmailLink,
  signInWithGoogle,
  storedEmailForSignIn,
  usingEmulator,
} from "../firebase";
import { strings } from "../strings";

/**
 * The account gate for the tracker — and ONLY the tracker. The screener stays
 * anonymous; an account exists solely so logged hours have somewhere to live.
 *
 * Two sign-in paths, both passwordless: Google, or an emailed sign-in link.
 * When the page URL is itself a sign-in link, this card becomes the
 * completion step instead.
 */
export function SignInCard() {
  // If the URL carries a sign-in link, we are completing, not starting.
  const [completing] = useState(hasPendingEmailLink);

  return completing ? <CompleteLink /> : <StartSignIn />;
}

function StartSignIn() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  async function attempt(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
    } catch {
      setError(strings.tracker.errors.saveFailed);
    }
  }

  function sendLink(event: React.FormEvent) {
    event.preventDefault();
    // The browser's own email validation, surfaced with our words.
    if (emailInputRef.current?.checkValidity() !== true || email.trim() === "") {
      setError(strings.tracker.signIn.emailInvalid);
      return;
    }
    const target = email.trim();
    setError(null);
    void sendEmailLink(target)
      .then(() => setSentTo(target))
      .catch(() => setError(strings.tracker.errors.saveFailed));
  }

  if (sentTo !== null) {
    return (
      <section aria-live="polite">
        <h2 className="text-2xl font-semibold text-balance text-slate-900">
          {strings.tracker.signIn.heading}
        </h2>
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-base leading-relaxed text-emerald-900">
          {strings.tracker.signIn.emailSent(sentTo)}
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="signin-heading">
      <h2 id="signin-heading" className="text-2xl font-semibold text-balance text-slate-900">
        {strings.tracker.signIn.heading}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-slate-600">{strings.tracker.signIn.body}</p>

      <button
        type="button"
        onClick={() => void attempt(signInWithGoogle)}
        className="mt-8 w-full rounded-xl bg-teal-700 px-6 py-4 text-lg font-semibold text-white transition hover:bg-teal-800"
      >
        {strings.tracker.signIn.googleButton}
      </button>

      <div className="mt-6 flex items-center gap-3" aria-hidden="true">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm text-slate-400">{strings.tracker.signIn.or}</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={sendLink} noValidate className="mt-6">
        <label htmlFor="signin-email" className="text-sm font-semibold text-slate-700">
          {strings.tracker.signIn.emailLabel}
        </label>
        <input
          id="signin-email"
          ref={emailInputRef}
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={error !== null}
          className="mt-2 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-teal-600 focus:outline-none"
        />
        <button
          type="submit"
          className="mt-3 w-full rounded-xl border-2 border-teal-700 px-6 py-3.5 text-base font-semibold text-teal-800 transition hover:bg-teal-50"
        >
          {strings.tracker.signIn.emailSend}
        </button>
      </form>

      {usingEmulator && (
        <button
          type="button"
          onClick={() => void attempt(devSignIn)}
          className="mt-4 w-full rounded-xl border-2 border-dashed border-slate-300 px-6 py-3 text-sm font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
        >
          {strings.tracker.signIn.devButton}
        </button>
      )}

      {error !== null && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}

/**
 * Completes a sign-in link. Same device: the stored email finishes it
 * silently. Different device: ask for the email — Firebase requires it so a
 * forwarded or intercepted link is useless on its own.
 */
function CompleteLink() {
  const [needsEmail, setNeedsEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const autoAttempted = useRef(false);

  useEffect(() => {
    if (autoAttempted.current) return;
    autoAttempted.current = true;
    const stored = storedEmailForSignIn();
    if (stored === null) {
      setNeedsEmail(true);
      return;
    }
    completeEmailLink(stored).catch(() => {
      // Stored email didn't match the link (or the code expired) — let the
      // person type the address rather than failing silently.
      setNeedsEmail(true);
      setError(strings.tracker.signIn.linkFailed);
    });
  }, []);

  if (!needsEmail) {
    return (
      <p className="py-12 text-center text-lg text-slate-500" aria-live="polite">
        {strings.loading.checking}
      </p>
    );
  }

  return (
    <section aria-labelledby="confirm-heading">
      <h2 id="confirm-heading" className="text-2xl font-semibold text-balance text-slate-900">
        {strings.tracker.signIn.confirmHeading}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-slate-600">
        {strings.tracker.signIn.confirmBody}
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          void completeEmailLink(email.trim()).catch(() =>
            setError(strings.tracker.signIn.linkFailed)
          );
        }}
        className="mt-6"
      >
        <label htmlFor="confirm-email" className="text-sm font-semibold text-slate-700">
          {strings.tracker.signIn.emailLabel}
        </label>
        <input
          id="confirm-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-teal-600 focus:outline-none"
        />
        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-teal-700 px-6 py-4 text-lg font-semibold text-white transition hover:bg-teal-800"
        >
          {strings.tracker.signIn.confirmButton}
        </button>
      </form>

      {error !== null && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}

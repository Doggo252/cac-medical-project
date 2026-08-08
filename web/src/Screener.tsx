import { useState } from "react";

import type { ScreenResult } from "@shared";
import { screen } from "./api";
import { ProgressBar } from "./components/ProgressBar";
import { QuestionCard } from "./components/QuestionCard";
import { ResultCard } from "./components/ResultCard";
import { completeAnswers, visibleQuestions, type Draft } from "./questions";
import { strings } from "./strings";

type Phase = "intro" | "questions" | "loading" | "result" | "error";

/**
 * P0 feature 2: the anonymous eligibility screener. One question per screen;
 * answers go to the `screen` callable and are never stored.
 */
export function Screener() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [draft, setDraft] = useState<Draft>({});
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ScreenResult | null>(null);

  const questions = visibleQuestions(draft);
  const question = questions[step];

  async function submit(finalDraft: Draft) {
    setPhase("loading");
    try {
      setResult(await screen(completeAnswers(finalDraft)));
      setPhase("result");
    } catch {
      setPhase("error");
    }
  }

  function handleAnswer(value: number | boolean) {
    if (question === undefined) return;
    const next: Draft = { ...draft, [question.id]: value };
    setDraft(next);

    // Answering can change which later questions apply, so recompute against
    // the new draft rather than the stale one.
    if (step + 1 >= visibleQuestions(next).length) {
      void submit(next);
    } else {
      setStep(step + 1);
    }
  }

  function startOver() {
    setDraft({});
    setStep(0);
    setResult(null);
    setPhase("intro");
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
      {phase === "intro" && <Intro onStart={() => setPhase("questions")} />}

      {phase === "questions" && question !== undefined && (
        <>
          <ProgressBar current={step + 1} total={questions.length} />
          <QuestionCard
            key={question.id}
            question={question}
            value={draft[question.id]}
            onAnswer={handleAnswer}
            onBack={step > 0 ? () => setStep(step - 1) : null}
          />
        </>
      )}

      {phase === "loading" && (
        <p className="py-12 text-center text-lg text-slate-500" aria-live="polite">
          {strings.loading.checking}
        </p>
      )}

      {phase === "result" && result !== null && (
        <ResultCard result={result} onStartOver={startOver} />
      )}

      {phase === "error" && <ErrorState onRetry={startOver} />}
    </div>
  );
}

function Intro({ onStart }: { readonly onStart: () => void }) {
  return (
    <section aria-labelledby="intro-heading">
      <h1 id="intro-heading" className="text-2xl font-semibold text-balance text-slate-900">
        {strings.intro.heading}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-slate-600">{strings.intro.body}</p>
      <p className="mt-2 text-sm text-slate-500">{strings.intro.timeEstimate}</p>

      <button
        type="button"
        onClick={onStart}
        className="mt-8 w-full rounded-xl bg-teal-700 px-6 py-4 text-lg font-semibold text-white transition hover:bg-teal-800"
      >
        {strings.intro.start}
      </button>

      <div className="mt-8 rounded-lg bg-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-700">
          {strings.intro.disclaimerHeading}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{strings.intro.disclaimer}</p>
      </div>
    </section>
  );
}

function ErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <section aria-live="assertive">
      <h2 className="text-2xl font-semibold text-slate-900">{strings.error.heading}</h2>
      <p className="mt-3 text-base leading-relaxed text-slate-600">{strings.error.body}</p>
      <p className="mt-2 text-sm text-slate-500">{strings.error.offlineHint}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-8 w-full rounded-xl bg-teal-700 px-6 py-4 text-lg font-semibold text-white transition hover:bg-teal-800"
      >
        {strings.error.retry}
      </button>
    </section>
  );
}

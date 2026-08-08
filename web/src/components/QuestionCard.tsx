import { useEffect, useRef, useState } from "react";

import type { Question } from "../questions";
import { strings } from "../strings";

interface QuestionCardProps {
  readonly question: Question;
  readonly value: number | boolean | undefined;
  readonly onAnswer: (value: number | boolean) => void;
  readonly onBack: (() => void) | null;
}

export function QuestionCard({ question, value, onAnswer, onBack }: QuestionCardProps) {
  return (
    <section aria-labelledby="question-prompt">
      <h2 id="question-prompt" className="text-2xl font-semibold text-balance text-slate-900">
        {question.prompt}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-slate-600">{question.help}</p>

      <div className="mt-8">
        {question.kind === "number" ? (
          <NumberAnswer
            question={question}
            value={typeof value === "number" ? value : undefined}
            onAnswer={onAnswer}
          />
        ) : (
          <BooleanAnswer value={typeof value === "boolean" ? value : undefined} onAnswer={onAnswer} />
        )}
      </div>

      {onBack !== null && (
        <button
          type="button"
          onClick={onBack}
          className="mt-8 text-sm font-medium text-slate-500 underline underline-offset-4 hover:text-slate-800"
        >
          ← {strings.nav.back}
        </button>
      )}
    </section>
  );
}

function NumberAnswer({
  question,
  value,
  onAnswer,
}: {
  question: Extract<Question, { kind: "number" }>;
  value: number | undefined;
  onAnswer: (value: number) => void;
}) {
  const [text, setText] = useState(String(value ?? question.defaultValue));
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset and refocus whenever the flow moves to a different question.
  useEffect(() => {
    setText(String(value ?? question.defaultValue));
    setSubmitAttempted(false);
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [question.id, question.defaultValue, value]);

  const trimmed = text.trim();
  const parsed = Number(trimmed);
  const isEmpty = trimmed === "";
  const isNumber = !isEmpty && Number.isFinite(parsed);
  const inRange = isNumber && parsed >= question.min && parsed <= question.max;

  /**
   * What's wrong, in words. Out-of-range and non-numeric values explain
   * themselves as soon as they're typed — that's the moment the person can act
   * on it. An empty field only complains once they've tried to continue, so the
   * form doesn't scold them for clearing it.
   */
  const error = !isNumber
    ? isEmpty
      ? submitAttempted
        ? strings.validation.required
        : null
      : strings.validation.notANumber
    : inRange
      ? null
      : question.rangeMessage;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitAttempted(true);
        // The button stays enabled even when the value is unusable, so that
        // pressing it explains the problem instead of doing nothing.
        if (inRange) onAnswer(parsed);
      }}
    >
      <label htmlFor="answer-input" className="sr-only">
        {question.prompt}
      </label>
      <div
        className={`flex items-center gap-2 rounded-xl border-2 bg-white px-4 py-3 ${
          error === null
            ? "border-slate-200 focus-within:border-teal-600"
            : "border-red-400 focus-within:border-red-500"
        }`}
      >
        {question.prefix !== undefined && (
          <span aria-hidden="true" className="text-2xl font-semibold text-slate-400">
            {question.prefix}
          </span>
        )}
        <input
          id="answer-input"
          ref={inputRef}
          type="number"
          inputMode="numeric"
          min={question.min}
          max={question.max}
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-invalid={error !== null}
          aria-describedby={error === null ? "answer-unit" : "answer-unit answer-error"}
          className="w-full bg-transparent text-2xl font-semibold text-slate-900 outline-none"
        />
      </div>
      <p id="answer-unit" className="mt-2 text-sm text-slate-500">
        {question.unit}
      </p>

      {error !== null && (
        <p
          id="answer-error"
          role="alert"
          className="mt-3 text-sm leading-relaxed font-medium text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        className="mt-6 w-full rounded-xl bg-teal-700 px-6 py-4 text-lg font-semibold text-white transition hover:bg-teal-800"
      >
        {strings.nav.continue}
      </button>
    </form>
  );
}

function BooleanAnswer({
  value,
  onAnswer,
}: {
  value: boolean | undefined;
  onAnswer: (value: boolean) => void;
}) {
  const base =
    "w-full rounded-xl border-2 px-6 py-5 text-lg font-semibold transition focus-visible:outline-2";
  const chosen = "border-teal-700 bg-teal-700 text-white";
  const unchosen = "border-slate-200 bg-white text-slate-900 hover:border-teal-600 hover:bg-teal-50";

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => onAnswer(true)}
        aria-pressed={value === true}
        className={`${base} ${value === true ? chosen : unchosen}`}
      >
        {strings.nav.yes}
      </button>
      <button
        type="button"
        onClick={() => onAnswer(false)}
        aria-pressed={value === false}
        className={`${base} ${value === false ? chosen : unchosen}`}
      >
        {strings.nav.no}
      </button>
    </div>
  );
}

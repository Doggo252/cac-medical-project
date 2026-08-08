import type { ScreenerAnswers } from "@shared";
import { strings } from "./strings";

/**
 * The question flow: one question per screen, in order.
 *
 * The order is deliberate. Cheap, non-threatening questions come first
 * (household, income, age) and the two scope-guard questions come last, once
 * someone has already invested a little and understands what the tool is for.
 *
 * `showIf` keeps the flow short — nobody should be asked whether they are
 * pregnant at 71, or whether they're a full-time student at 58.
 *
 * A `showIf` must return true while the answer it depends on is still unknown.
 * Otherwise the progress bar's denominator grows as you answer ("Question 3 of
 * 6" becoming "Question 4 of 7"), which reads as the flow getting longer the
 * more you do. Hiding a question only once we know it doesn't apply means the
 * count can shrink but never grow.
 */

export type Draft = Partial<ScreenerAnswers>;

interface BaseQuestion {
  readonly id: keyof ScreenerAnswers;
  readonly prompt: string;
  readonly help: string;
  readonly showIf?: (draft: Draft) => boolean;
}

export interface NumberQuestion extends BaseQuestion {
  readonly kind: "number";
  readonly unit: string;
  readonly min: number;
  readonly max: number;
  /**
   * Shown when the typed value falls outside [min, max]. Written per question
   * so it can explain the likely mistake — entering a yearly income instead of
   * a monthly one, say — rather than just restating the bounds.
   */
  readonly rangeMessage: string;
  /** Prefix shown inside the input, e.g. "$". */
  readonly prefix?: string;
  readonly defaultValue: number;
}

export interface BooleanQuestion extends BaseQuestion {
  readonly kind: "boolean";
}

export type Question = NumberQuestion | BooleanQuestion;

export const QUESTIONS: readonly Question[] = [
  {
    id: "householdSize",
    kind: "number",
    prompt: strings.questions.householdSize.prompt,
    help: strings.questions.householdSize.help,
    unit: strings.questions.householdSize.unit,
    rangeMessage: strings.questions.householdSize.rangeMessage,
    min: 1,
    max: 12,
    defaultValue: 1,
  },
  {
    id: "monthlyIncomeUsd",
    kind: "number",
    prompt: strings.questions.monthlyIncomeUsd.prompt,
    help: strings.questions.monthlyIncomeUsd.help,
    unit: strings.questions.monthlyIncomeUsd.unit,
    rangeMessage: strings.questions.monthlyIncomeUsd.rangeMessage,
    min: 0,
    max: 100000,
    prefix: "$",
    defaultValue: 0,
  },
  {
    id: "age",
    kind: "number",
    prompt: strings.questions.age.prompt,
    help: strings.questions.age.help,
    unit: strings.questions.age.unit,
    rangeMessage: strings.questions.age.rangeMessage,
    min: 0,
    max: 120,
    defaultValue: 18,
  },
  {
    id: "isPregnant",
    kind: "boolean",
    prompt: strings.questions.isPregnant.prompt,
    help: strings.questions.isPregnant.help,
    showIf: (draft) => draft.age === undefined || (draft.age >= 10 && draft.age <= 60),
  },
  {
    id: "hasDisability",
    kind: "boolean",
    prompt: strings.questions.hasDisability.prompt,
    help: strings.questions.hasDisability.help,
  },
  {
    id: "isFullTimeStudent",
    kind: "boolean",
    prompt: strings.questions.isFullTimeStudent.prompt,
    help: strings.questions.isFullTimeStudent.help,
    showIf: (draft) => draft.age === undefined || (draft.age >= 14 && draft.age <= 30),
  },
  {
    id: "needsLongTermCare",
    kind: "boolean",
    prompt: strings.questions.needsLongTermCare.prompt,
    help: strings.questions.needsLongTermCare.help,
  },
  {
    id: "hasComplexImmigrationStatus",
    kind: "boolean",
    prompt: strings.questions.hasComplexImmigrationStatus.prompt,
    help: strings.questions.hasComplexImmigrationStatus.help,
  },
];

/** The questions that apply given what has been answered so far. */
export function visibleQuestions(draft: Draft): readonly Question[] {
  return QUESTIONS.filter((question) => question.showIf?.(draft) ?? true);
}

/**
 * Fills in the questions that were skipped by `showIf`.
 *
 * A skipped question is always a "no" — we skip it precisely because the answer
 * is not in doubt. The API requires a complete set of answers, so this is where
 * the flow's shortcuts get reconciled with the contract.
 */
export function completeAnswers(draft: Draft): ScreenerAnswers {
  return {
    householdSize: draft.householdSize ?? 1,
    monthlyIncomeUsd: draft.monthlyIncomeUsd ?? 0,
    age: draft.age ?? 0,
    isPregnant: draft.isPregnant ?? false,
    hasDisability: draft.hasDisability ?? false,
    isFullTimeStudent: draft.isFullTimeStudent ?? false,
    needsLongTermCare: draft.needsLongTermCare ?? false,
    hasComplexImmigrationStatus: draft.hasComplexImmigrationStatus ?? false,
  };
}

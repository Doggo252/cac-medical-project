# Learning TypeScript, with your own app as the textbook

This folder is your practice space. Nothing in here ships to users, and the
main test suite ignores it, so you can't break the real app from here.

## The loop (this is the whole method)

1. Open an exercise file (start with `01-basics.ts`).
2. Run, in a terminal at the project root:

   ```
   npm run learn
   ```

   This starts a watcher: every time you save a file, the tests re-run and
   tell you which exercises pass. Leave it running while you work.
3. Replace one `throw new Error("TODO...")` with your own code. Save. Watch
   the test go from red to green. Repeat.

Being stuck for 15+ minutes is the signal to ask Claude, but ask for a HINT
or an EXPLANATION, not the answer. You're building the muscle that answers
judges' questions in October.

## Rules for this folder

- You type every line. No pasting AI-written code into exercises.
- Green tests are the goal, but EXPLAINING your green code is the win
  condition. After each exercise, say out loud what each line does. If you
  can't, ask Claude to explain a concept, then delete your code and redo the
  exercise from scratch.

## The path

| Stage | What | Why it matters |
| --- | --- | --- |
| `01-basics.ts` | Variables, functions, numbers, strings, booleans | The alphabet |
| `02` (next) | Objects, arrays, loops | ScreenerAnswers IS an object; activities IS an array |
| `03` | Reading `shared/src/screener.ts` for real | It's the vocabulary of your whole app |
| `04` | Rewriting `functions/src/engine/screen.ts` yourself | The heart transplant: the golden persona tests in `/tests` judge your version |
| `05` | Rewriting `hours.ts` (the pace math) | Your hero feature, in your handwriting |
| Then | Build P0-4 (reminders) yourself with Claude as tutor | New features are student-authored from here on |

Aim for 45–60 minutes a day. Daily beats weekend marathons; this is a
language, and languages are learned by showing up.

## Experimenting freely

Node runs TypeScript directly. To just try things without tests:

```
node learn/scratch.ts
```

Make `scratch.ts` yourself and print anything with `console.log(...)`.

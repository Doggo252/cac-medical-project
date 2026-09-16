# Guide 07: the agent tool spec and guards

**You write:** `agent/TOOLS.md`
**When:** week 5, before Claude writes `agent/loop.py`
**This is a specification document, not code.**

Renewal Rescue is the second showpiece. An LLM agent decides what to do next and
does it, with every step visible in an on-screen action log. The spec is yours
because **you decide what the agent is allowed to do**, and that is the whole
safety story.

## The eight tools

From plan v3: assemble packet, gap check, send fax, poll receipt, file receipt,
schedule check, draft appeal, notify user.

For each one, write down:

- **Name**, exactly as the agent will call it.
- **What it does**, in one sentence.
- **Inputs**, with types.
- **Outputs**, with types, including what failure looks like.
- **Preconditions**: what must be true before it may run at all.
- **Side effects**: does it touch the outside world, spend money, or send
  something to a county that cannot be recalled?

That last one is the important column. Most of these tools are reversible. One
is not.

## The guard, which is the point

```
send_fax refuses unless checker_passed == True and signed == True
```

This is a **code** guard, not a prompt instruction. The difference is the entire
argument:

- A prompt instruction is a request. Models are talked out of requests. Someone
  types something clever, or the model simply has a bad day, and the instruction
  loses.
- A code guard is a wall. The function checks its preconditions and returns a
  refusal. There is no phrasing that gets through, because nothing is being
  persuaded.

Say exactly that sentence in the video. It is the most sophisticated idea in the
project and it takes fifteen seconds to explain.

Specify what happens on refusal too: the tool returns a refusal, **the refusal is
written to the action log**, and the agent continues rather than crashing. A
guard that fires invisibly teaches nobody anything. A guard that fires and
explains itself is a feature you can film, and plan v3 lists that as a test.

## The action log format

Every step the agent takes shows on screen. Decide what one entry contains:
timestamp, which tool, the inputs (redacted where they must be), the result, and
whether it succeeded, was refused, or errored.

Two audiences, and they are both yours: the user, who deserves to see what is
happening to their case, and the judge, who is watching a video and needs to read
it at a glance.

## Decisions that are yours

1. **What the agent may NOT do.** Write this list explicitly. An agent with no
   stated limits has no limits. Can it retry a fax forever? Can it spend money
   without asking? Can it call the same tool twenty times?
2. **Iteration limit.** What stops an agent that gets confused and loops? A hard
   cap is not a bug, it is a safety feature.
3. **Which failures stop everything** and which are retried.
4. **Does the agent ever wait for the user?** A 90-day countdown is not something
   a loop sits through. Where does it hand back?
5. **What the agent never sees.** The privacy rules redact before the LLM. That
   applies here too.

## Worked example, in a different domain

A tool spec for a homework-reminder agent:

> ### `send_email`
> **Does:** emails the student's teacher.
> **Inputs:** `to` (string), `subject` (string), `body` (string)
> **Outputs:** `{sent: bool, message_id: string or null, error: string or null}`
> **Preconditions:** `draft_approved == True`. Refuses otherwise.
> **Side effects:** Irreversible. An email cannot be unsent.
> **On refusal:** returns `{sent: false, error: "draft not approved"}` and writes
> the refusal to the action log. Does not raise.

Yours will be longer, but that is the level of detail: someone else could
implement the tool from the spec, and the dangerous one states its precondition
as a hard requirement rather than a preference.

## Done checklist

- [ ] All eight tools specified with inputs, outputs, preconditions, side effects.
- [ ] The `send_fax` guard is written as a hard precondition.
- [ ] Refusal behaviour specified, including logging.
- [ ] Action log entry format defined.
- [ ] An explicit list of what the agent may not do.
- [ ] An iteration cap.
- [ ] Detailed enough that Claude can write `loop.py` without asking you anything.

## The whiteboard test

**"What stops the agent from faxing something unsigned?"**

The answer is not "we told it not to." It is: the tool itself refuses, in code,
before it does anything, and the refusal is logged. Then show the test that
proves it. plan v3 puts that test on camera at 2:25.

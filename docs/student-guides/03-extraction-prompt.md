# Guide 03: Reader A, the extraction prompt

**You write:** `prompts/extract.md` (and later `explain.md`, `draft.md`)
**When:** week 2
**Done when:** it returns the right type and dates on 20 fake letters.

Claude writes the API call and the backend that hides the key. What the model is
*asked*, and what shape it must answer in, is yours. That is the part that
determines quality.

## What this prompt has to do

Input: the OCR text of one letter, with digit strings of 6 or more characters
already blanked out by code before it ever leaves the phone. Output: structured
facts, as JSON matching a schema, so the app can use them without parsing prose.

Fields worth extracting, from CLAUDE.md: letter type, notice date, effective
date, what the county is asking for, and whether appeal-rights language is
present.

## The four things that separate a good prompt from a bad one

### 1. A field must be able to say "not present"

The single most dangerous failure in this whole app is a **hallucinated date**.
If the letter has no effective date and the model invents one, the countdown is
wrong, and a wrong countdown is worse than no app at all.

So every date field needs a way to answer "this is not in the letter," and the
prompt has to say plainly that guessing is forbidden and absence is a valid,
expected answer. Models default to being helpful. Helpful here means making
things up. You have to override that explicitly.

Note the difference between "the letter does not contain this" and "OCR was too
blurry to read it." Decide whether you want to tell those apart.

### 2. The output shape is fixed

The model returns JSON matching a schema. Decide field names, types, and date
format now, and use exactly the same names everywhere: prompt, schema, confirm
screen, rules file. Every rename later costs you an afternoon.

Pick one date format and demand it. `YYYY-MM-DD` sorts correctly and is
unambiguous, unlike `03/04/2026`, which is March 4 in California and April 3 in
much of the world.

### 3. Ground everything in the text

The model should report what the letter says, not what it knows about Medi-Cal
generally. It has read the internet; it has opinions about Medi-Cal deadlines.
You do not want them. You want the 90-day cure period to come from your rules
file with a legal citation, not from the model's memory.

Say so in the prompt: report only what appears in this text.

### 4. It is being fed OCR, not clean text

Real input has errors. `MC 355` may arrive as `MC 3S5`. Lines may be out of
order. Two columns may interleave. The prompt should expect that, rather than
assuming tidy input.

## Decisions that are yours

1. **Zero-shot or few-shot?** Just instructions, or worked examples in the
   prompt? Examples usually improve format compliance and cost tokens on every
   call. Try both on the same 20 letters and measure.
2. **Does Reader A see the classifier's answer?** Strong opinion worth
   considering: **no**. The whole value of "two readers must agree" is that the
   readers are independent. Tell Reader A what Reader B thinks and you have one
   reader wearing two hats, and the agreement check becomes theater. If you do
   share it, you must be able to defend why.
3. **Confidence.** Do you ask the model to report confidence per field, and do
   you trust it? Self-reported confidence from language models is unreliable.
   You might get a better signal from whether the two readers agree.
4. **One prompt or three?** One prompt handling all letter types, or a general
   classify step then a type-specific extraction? One is simpler. Three can be
   more precise.

## Worked example, in a different domain

A prompt that extracts facts from a **pizza order confirmation email**:

> You extract facts from pizza order confirmation emails. The text comes from an
> automated email parser and may contain errors or out-of-order lines.
>
> Report only what appears in the text below. Do not use general knowledge about
> pizza restaurants. Do not guess. If a field does not appear in the text, return
> null for it. Returning null is correct and expected; inventing a value is not.
>
> Return JSON exactly matching this shape:
>
> ```json
> {
>   "order_id": "string or null",
>   "order_date": "YYYY-MM-DD or null",
>   "delivery_estimate": "YYYY-MM-DD or null",
>   "items": ["array of strings, empty array if none listed"],
>   "total_cents": "integer or null",
>   "contains_refund_policy": "true or false"
> }
> ```
>
> Rules:
> - Dates must be YYYY-MM-DD. If the text gives a date you cannot convert with
>   certainty, return null rather than guessing the century or the order of day
>   and month.
> - `total_cents` is an integer number of cents. $24.50 becomes 2450.
> - `contains_refund_policy` is true only if refund or return language actually
>   appears in the text.
>
> Text:
> ---
> {text}
> ---

Notice what it does: states the input is messy, forbids outside knowledge,
makes null explicitly correct, fixes one date format, removes an ambiguity
(cents, not dollars), and defines the boolean by what appears in the text rather
than by what the model concludes. Every one of those has a direct counterpart in
your letter prompt.

## Testing it

- Run it on 20 fake letters where `labels.csv` already holds the truth. That is
  the payoff for the extra columns in guide 01.
- Score letter type and each date field separately. An overall percentage hides
  which field is weak.
- **The invented-date test**, which is a privacy-and-safety rule from CLAUDE.md:
  feed it a letter with no effective date. If the output has one, the prompt has
  failed and no amount of downstream code fixes it.
- Run the same letter three times. Different answers means the prompt is
  under-specified.

## Done checklist

- [ ] Every field can be null, and the prompt says null is correct.
- [ ] One date format, stated, with a rule for ambiguous dates.
- [ ] Says the input is OCR text and may contain errors.
- [ ] Forbids outside knowledge about Medi-Cal.
- [ ] Field names match the schema, the confirm screen, and the rules file.
- [ ] Tested on 20 letters with per-field scores saved to `core/eval/`.
- [ ] The no-effective-date test passes.

## The whiteboard test

**"How do you stop the AI from making up a deadline?"**

The real answer has three layers, and you should name all three: the prompt makes
null explicitly valid, the code rejects any explanation containing a date not in
the confirmed facts, and the deadlines themselves never come from the model at
all, they come from your rules file with a citation. Defense in depth. That
answer is a large part of why this project is not a chatbot wrapper.

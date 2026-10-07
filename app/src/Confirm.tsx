// The confirm screen: every fact the readers found, which the user can fix.
// Nothing after this (countdowns, explanation, forms) uses a fact until the
// user says it is right. Flagged facts are marked in yellow, by Neil's rules
// in flags.ts.
import { useState } from 'react'

const LABELS: Record<string, string> = {
  notice_date: 'Date printed on the letter',
  effective_date: 'Date your Medi-Cal stops',
  due_date: 'Date they need your reply by',
  ask: 'What the county is asking for',
  worker_name: "Your worker's name",
  worker_phone: "Your worker's phone number",
  case_number: 'Case number',
}
const isDate = (field: string) => field.endsWith('_date')

type Props = {
  fields: string[]
  facts: Record<string, string | null>
  flags: Record<string, string>
  onConfirm: (facts: Record<string, string | null>) => void
}

export default function Confirm({ fields, facts, flags, onConfirm }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f, facts[f] ?? '']))
  )
  // A flag goes away once the user has looked at the fact and changed it.
  const [checked, setChecked] = useState<Set<string>>(new Set())

  function change(field: string, value: string) {
    setValues((old) => ({ ...old, [field]: value }))
    setChecked((old) => new Set(old).add(field))
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    onConfirm(Object.fromEntries(fields.map((f) => [f, values[f].trim() || null])))
  }

  const flaggedCount = fields.filter((f) => flags[f] && !checked.has(f)).length

  return (
    <form className="card confirm" onSubmit={submit}>
      <h2>Is this right?</h2>
      <p className="meta">
        Check each fact against your letter. Tap any one to fix it.
        {flaggedCount > 0 && ` ${flaggedCount} need${flaggedCount === 1 ? 's' : ''} a second look.`}
      </p>
      {fields.map((field) => {
        const flag = !checked.has(field) ? flags[field] : undefined
        return (
          <label key={field} className={`fact ${flag ? 'flagged' : ''}`}>
            <span className="fact-label">{LABELS[field] ?? field}</span>
            <input
              type={isDate(field) ? 'date' : 'text'}
              value={values[field]}
              onChange={(event) => change(field, event.target.value)}
              inputMode={field === 'worker_phone' ? 'tel' : undefined}
            />
            {flag && <span className="fact-flag">{flag}</span>}
          </label>
        )
      })}
      <button type="submit" className="button primary">
        These are right
      </button>
    </form>
  )
}

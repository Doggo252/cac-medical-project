// The countdown cards: one per deadline from Neil's rules file.
import rulesFile from '../../core/rules/deadlines.json'
import { evaluate, todayOnThisPhone, type Deadline, type RulesFile } from './deadlines'

const rules = rulesFile as RulesFile

// "2026-10-06" becomes "Tuesday, October 6, 2026". UTC so the day never
// shifts with the phone's time zone.
function inWords(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function howLong(d: Deadline): string {
  if (d.status === 'today') return 'Today is the last day'
  if (d.status === 'passed') return `This date passed ${-d.daysLeft!} day${d.daysLeft === -1 ? '' : 's'} ago`
  return `${d.daysLeft} day${d.daysLeft === 1 ? '' : 's'} left`
}

// Color by how close it is. These thresholds match Neil's urgency levels in
// prompts/explain.md (7 days or less is high, up to 30 is medium).
function tone(d: Deadline): string {
  if (d.status === 'passed') return 'passed'
  if (d.daysLeft! <= 7) return 'high'
  if (d.daysLeft! <= 30) return 'med'
  return 'low'
}

export default function Countdowns({ letterType, facts }: { letterType: string; facts: Record<string, unknown> | null }) {
  const deadlines = evaluate(rules, letterType, facts ?? {}, todayOnThisPhone())
  if (deadlines.length === 0) return null

  // Soonest first; ones we cannot work out go last.
  const known = deadlines.filter((d) => d.date !== null).sort((a, b) => a.daysLeft! - b.daysLeft!)
  const unknown = deadlines.filter((d) => d.date === null)

  return (
    <div className="countdowns">
      <h2>Your deadlines</h2>
      {known.map((d) => (
        <div key={d.id} className={`countdown ${tone(d)}`}>
          <p className="countdown-label">{d.label}</p>
          <p className="countdown-days">{howLong(d)}</p>
          <p className="countdown-date">{inWords(d.date!)}</p>
          {d.movedFrom && (
            <p className="countdown-note">Moved from {inWords(d.movedFrom)}, a weekend or holiday.</p>
          )}
          <p className="countdown-law">{d.citation}</p>
        </div>
      ))}
      {unknown.map((d) => (
        <div key={d.id} className="countdown unknown">
          <p className="countdown-label">{d.label}</p>
          <p className="countdown-days">We could not find the date this is counted from.</p>
          <p className="countdown-law">{d.citation}</p>
        </div>
      ))}
    </div>
  )
}

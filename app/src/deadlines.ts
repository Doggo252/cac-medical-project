// Turns Neil's deadline rules (core/rules/deadlines.json) into real dates.
//
// Neil wrote the rules as data; this reads them on the phone, with no
// internet. It must give exactly the same answers as the Python copy in
// core/rules/evaluate.py, which Neil's tests run against.
//
// It is a pure function: the same inputs always give the same output, and
// today's date is passed in, never read from the clock.

export type Rule = {
  id: string
  applies_to: string[]
  anchor: string
  offset_days: number
  direction: 'before' | 'after'
  label: string
  citation: string
  next_business_day?: boolean
}

export type RulesFile = {
  rules: Rule[]
  holidays?: { date: string; name: string }[]
}

export type Deadline = {
  id: string
  label: string
  citation: string
  date: string | null // YYYY-MM-DD, or null if the anchor date is missing
  daysLeft: number | null // negative once it has passed
  status: 'upcoming' | 'today' | 'passed' | 'unknown'
  movedFrom: string | null // the date before moving off a weekend or holiday
}

const DAY_MS = 24 * 60 * 60 * 1000

// Dates are handled as midnight UTC, so a phone's time zone can never shift
// a deadline by a day.
function toTime(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const time = Date.parse(`${value}T00:00:00Z`)
  // Reject dates that do not exist, like February 30.
  if (Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== value) return null
  return time
}

const toText = (time: number) => new Date(time).toISOString().slice(0, 10)

// Moves past Saturdays, Sundays and holidays (Gov Code 6707).
function nextBusinessDay(time: number, holidays: Set<number>): number {
  let day = time
  while ([0, 6].includes(new Date(day).getUTCDay()) || holidays.has(day)) day += DAY_MS
  return day
}

export function evaluate(
  rulesFile: RulesFile,
  letterType: string,
  facts: Record<string, unknown>,
  today: string
): Deadline[] {
  const todayTime = toTime(today)
  if (todayTime === null) throw new Error(`today must be YYYY-MM-DD, got ${today}`)
  const holidays = new Set(
    (rulesFile.holidays ?? []).map((h) => toTime(h.date)).filter((t): t is number => t !== null)
  )

  const deadlines: Deadline[] = []
  for (const rule of rulesFile.rules) {
    if (!rule.applies_to.includes(letterType)) continue
    const result: Deadline = {
      id: rule.id,
      label: rule.label,
      citation: rule.citation,
      date: null,
      daysLeft: null,
      status: 'unknown',
      movedFrom: null,
    }
    const start = toTime(facts[rule.anchor])
    if (start !== null) {
      const step = rule.offset_days * DAY_MS
      let day = rule.direction === 'after' ? start + step : start - step
      if (rule.next_business_day) {
        const moved = nextBusinessDay(day, holidays)
        if (moved !== day) result.movedFrom = toText(day)
        day = moved
      }
      const daysLeft = Math.round((day - todayTime) / DAY_MS)
      result.date = toText(day)
      result.daysLeft = daysLeft
      result.status = daysLeft < 0 ? 'passed' : daysLeft === 0 ? 'today' : 'upcoming'
    }
    deadlines.push(result)
  }
  return deadlines
}

// Today on this phone, as YYYY-MM-DD in the phone's own time zone.
export function todayOnThisPhone(): string {
  return new Date().toLocaleDateString('en-CA')
}

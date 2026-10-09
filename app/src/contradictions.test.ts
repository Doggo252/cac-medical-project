import { describe, expect, it } from 'vitest'
import cases from './fixtures/contradiction_cases.json'
import { checkRule1, checkRule2, findMistakes, type TimelineEvent } from './contradictions'

type Case = {
  events: TimelineEvent[]
  notice_date: string
  effective_date: string
  rule_1: unknown
  rule_2: unknown
}

describe('county-mistake rules on the phone', () => {
  it("gives the same answers as Neil's Python on every saved case", () => {
    for (const c of cases as Case[]) {
      expect(checkRule1(c.events, c.effective_date)).toEqual(c.rule_1)
      expect(checkRule2(c.events, c.notice_date, c.effective_date)).toEqual(c.rule_2)
    }
  })

  it('the saved cases cover both rules firing and not firing', () => {
    const all = cases as Case[]
    expect(all.filter((c) => c.rule_1).length).toBeGreaterThan(20)
    expect(all.filter((c) => c.rule_2).length).toBeGreaterThan(20)
    expect(all.filter((c) => !c.rule_1 && !c.rule_2).length).toBeGreaterThan(20)
  })

  it('the demo case: papers in before the effective date, stopped anyway', () => {
    const events: TimelineEvent[] = [
      { date: '2026-10-20', type: 'papers_received', description: '', subject: '', proof: 'receipt.jpg' },
      { date: '2026-11-02', type: 'coverage_denied', description: '', subject: '', proof: '' },
    ]
    const found = findMistakes(events, '2026-10-01', '2026-10-31')
    expect(found).toHaveLength(1)
    expect(found[0].rule).toBe(1)
    expect(found[0].needs_proof).toBe(false)
  })

  it('finds nothing without both letter dates', () => {
    const events: TimelineEvent[] = [
      { date: '2026-10-20', type: 'papers_sent', description: '', subject: '', proof: '' },
      { date: '2026-11-02', type: 'coverage_denied', description: '', subject: '', proof: '' },
    ]
    expect(findMistakes(events, null, '2026-10-31')).toEqual([])
    expect(findMistakes(events, '2026-10-01', null)).toEqual([])
  })
})

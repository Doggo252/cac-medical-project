// Tests for deadlines.ts. The same cases as core/rules/test_evaluate.py, so
// the phone and the Python copy are held to the same answers.
import { expect, test } from 'vitest'
import { evaluate, type RulesFile } from './deadlines'
import neilsRules from '../../core/rules/deadlines.json'

const FAKE: RulesFile = {
  rules: [
    { id: 'ten_after', applies_to: ['MC355'], anchor: 'notice_date', offset_days: 10, direction: 'after', label: 'L', citation: 'C' },
    { id: 'day_before', applies_to: ['MC_239A'], anchor: 'effective_date', offset_days: 1, direction: 'before', label: 'L', citation: 'C' },
    { id: 'moves', applies_to: ['MC_239A'], anchor: 'notice_date', offset_days: 0, direction: 'after', label: 'L', citation: 'C', next_business_day: true },
  ],
  holidays: [{ date: '2026-10-12', name: 'Columbus Day' }],
}
const TODAY = '2026-10-07'
const one = (id: string, type: string, facts: Record<string, unknown>, today = TODAY) =>
  evaluate(FAKE, type, facts, today).find((d) => d.id === id)!

test('counts after and before', () => {
  expect(one('ten_after', 'MC355', { notice_date: '2026-09-25' }).date).toBe('2026-10-05')
  expect(one('day_before', 'MC_239A', { effective_date: '2026-10-31' }).date).toBe('2026-10-30')
})

test('crosses month and year ends', () => {
  expect(one('ten_after', 'MC355', { notice_date: '2026-12-28' }).date).toBe('2027-01-07')
  expect(one('day_before', 'MC_239A', { effective_date: '2028-03-01' }).date).toBe('2028-02-29')
})

test('only rules for this letter type', () => {
  expect(evaluate(FAKE, 'MC355', {}, TODAY).map((d) => d.id)).toEqual(['ten_after'])
  expect(evaluate(FAKE, 'OTHER', {}, TODAY)).toEqual([])
})

test('Saturday then a holiday moves to Tuesday', () => {
  const d = one('moves', 'MC_239A', { notice_date: '2026-10-10' })
  expect(d.date).toBe('2026-10-13')
  expect(d.movedFrom).toBe('2026-10-10')
})

test('a weekday does not move', () => {
  const d = one('moves', 'MC_239A', { notice_date: '2026-10-08' })
  expect(d.date).toBe('2026-10-08')
  expect(d.movedFrom).toBeNull()
})

test('days left and status', () => {
  expect(one('ten_after', 'MC355', { notice_date: '2026-09-30' }).daysLeft).toBe(3)
  expect(one('ten_after', 'MC355', { notice_date: '2026-09-27' }).status).toBe('today')
  const passed = one('ten_after', 'MC355', { notice_date: '2026-09-01' })
  expect(passed.status).toBe('passed')
  expect(passed.daysLeft).toBe(-26)
})

test('missing or broken dates are unknown', () => {
  for (const bad of [null, '', '10/04/2026', '2026-02-30', 'soon', undefined]) {
    const d = one('ten_after', 'MC355', { notice_date: bad })
    expect(d.status).toBe('unknown')
    expect(d.date).toBeNull()
  }
})

test("Neil's real rules file loads and runs", () => {
  const rules = neilsRules as RulesFile
  expect(rules.rules.length).toBeGreaterThan(0)
  expect(() => evaluate(rules, 'MC_239A', { notice_date: '2026-10-01' }, TODAY)).not.toThrow()
})

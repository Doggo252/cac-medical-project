import { expect, test } from 'vitest'
import { findCaseNumber, findFacts, firstDate, fixCaseNumber } from './localFacts'

// Lines taken from real text-reader output of the fake letters.
test('reads both date styles', () => {
  expect(firstDate('Notice date: 08/13/2026')).toBe('2026-08-13')
  expect(firstDate('due date of November 4, 2026')).toBe('2026-11-04')
  expect(firstDate('Notice Date: 93/02/2026')).toBeNull()
})

test('MC 355: notice date, due date, worker', () => {
  const text = [
    'Notice Date: 07/24/2026',
    'Case Number: 9B7R012',
    'Worker Name: Lorraine Hernandez',
    'Worker Telephone Number: (650) 374-4482',
    'We must receive this information by 08/16/2026 or you may lose your Medi-Cal benefits!',
  ].join('\n')
  const { facts } = findFacts(text, 'MC355', '2026-10-07')
  expect(facts).toEqual({
    notice_date: '2026-07-24', due_date: '2026-08-16', effective_date: null, case_number: '9B7R012',
    worker_name: 'Lorraine Hernandez', worker_phone: '(650) 374-4482',
  })
})

test('2007 MC 239 A: the month becomes the last day of that month', () => {
  const text = 'Notice date: 09/20/2026\nYour eligibility to receive Medi-Cal will be discontinued effective the last day of September :'
  expect(findFacts(text, 'MC_239A', '2026-10-07').facts.effective_date).toBe('2026-09-30')
})

test('a December notice about January means next year', () => {
  const text = 'Notice date: 12/10/2026\ndiscontinued effective the last day of January'
  expect(findFacts(text, 'MC_239A', '2026-12-15').facts.effective_date).toBe('2027-01-31')
})

test('CalSAWS MC 239: the "As of" date', () => {
  const text = 'As of 08/31/2026, Medi-Cal eligibility has been discontinued for the following member(s)'
  expect(findFacts(text, 'MC_239A', '2026-10-07').facts.effective_date).toBe('2026-08-31')
})

test('renewal: the due date in step 3', () => {
  const text = 'Step 3; Send the form with proof by the due date of October 27, 2026'
  expect(findFacts(text, 'MC210_RV', '2026-10-07').facts.due_date).toBe('2026-10-27')
})

test('a garbled case number is repaired, and marked as repaired', () => {
  expect(fixCaseNumber('8T6KO09')).toBe('8T6K009')
  expect(fixCaseNumber('§Z8X103')).toBe('5Z8X103')
  expect(findCaseNumber('Case number: 8T6KO09')).toEqual({ value: '8T6K009', repaired: true })
  expect(findCaseNumber('Case Number: 9B7R012')).toEqual({ value: '9B7R012', repaired: false })
})

test('the all-digit CalHEERS number is skipped for the SAWS one', () => {
  expect(findCaseNumber('CALHEERS CASE NUMBER: 28958444\nSAWS CASE NUMBER: 9S4Y593').value).toBe('9S4Y593')
})

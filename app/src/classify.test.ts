import { expect, test } from 'vitest'
import { predict, tokenize, type Model } from './classify'

// Every expected value below was produced by Neil's Python tokenize() in
// core/classifier.py, so these tests check the browser matches it exactly.
const PYTHON_TOKENIZE: Record<string, string[]> = {
  'Hello, County! Hello.': ['hello', 'county', 'hello'],
  'MC 355 (Rev.07/18)': ['mc', '355', 'rev0718'],
  'State of California\u2014Health and Human Services': ['state', 'of', 'california\u2014health', 'and', 'human', 'services'],
  'Notice\u00a0Date:  12/08/2022': ['notice', 'date', '12082022'],
  '- ... --': [],
  'Worker\tID\nNumber:\u001cA579': ['worker', 'id', 'number', 'a579'],
  'CAF\u00c9 Stra\u00dfe': ['caf\u00e9', 'stra\u00dfe'],
  '\ufeffBOM start': ['\ufeffbom', 'start'],
}

for (const [input, expected] of Object.entries(PYTHON_TOKENIZE)) {
  test(`tokenize matches Python: ${JSON.stringify(input)}`, () => {
    expect(tokenize(input)).toEqual(expected)
  })
}

// Neil's spam example, worked by hand and by his Python code.
const SPAM_MODEL: Model = {
  letters_per_type: { spam: 2, ham: 2 },
  word_counts: {
    spam: { win: 1, free: 2, money: 2, now: 1, click: 1, here: 1 },
    ham: { see: 1, you: 2, at: 1, practice: 1, left: 1, your: 1, jacket: 1, here: 1 },
  },
  words_per_type: { spam: 8, ham: 9 },
  vocab: ['at', 'click', 'free', 'here', 'jacket', 'left', 'money', 'now', 'practice', 'see', 'win', 'you', 'your'],
}

test('predict gives the same scores as the hand-worked spam example', () => {
  const { letterType, scores } = predict(SPAM_MODEL, 'free money here')
  expect(letterType).toBe('spam')
  expect(scores.spam).toBeCloseTo(-6.936, 3)
  expect(scores.ham).toBeCloseTo(-9.273, 3)
})

test('on a tie, the first type wins, like Python max()', () => {
  // No words at all: both scores are just the equal priors.
  expect(predict(SPAM_MODEL, '').letterType).toBe('spam')
})

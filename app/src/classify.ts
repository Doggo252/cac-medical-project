// Reader B in the browser: runs Neil's classifier on the phone.
//
// Neil wrote the classifier in Python (core/classifier.py) and trained it on
// the fake letters. Training saves the word counts to public/model.json. This
// file does the same prediction math in TypeScript so the phone can run it
// with no internet. It must match the Python exactly, step for step, or the
// accuracy numbers Neil measured would not apply to the app.

export type Model = {
  letters_per_type: Record<string, number>
  word_counts: Record<string, Record<string, number>>
  words_per_type: Record<string, number>
  vocab: string[]
}

// Python's str.split() splits on exactly these whitespace characters
// (everything str.isspace() accepts). JavaScript's \s is slightly different,
// so the list is written out to match Python.
const PYTHON_WHITESPACE = /[\t\n\x0b\x0c\r\x1c-\x1f \x85\xa0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+/

// Python's string.punctuation: the 32 ASCII punctuation marks, and nothing
// else. (So a long dash, character U+2014, is not removed, matching Python.)
const PYTHON_PUNCTUATION = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g

// Same as tokenize() in core/classifier.py: split on whitespace, strip
// punctuation, lowercase, and drop anything left empty.
export function tokenize(text: string): string[] {
  const words: string[] = []
  for (const piece of text.split(PYTHON_WHITESPACE)) {
    const word = piece.replace(PYTHON_PUNCTUATION, '').toLowerCase()
    if (word !== '') words.push(word)
  }
  return words
}

// Same as predict() in core/classifier.py, but also returns every score so
// the app can show how sure it was.
export function predict(model: Model, text: string) {
  const words = tokenize(text)
  const types = Object.keys(model.letters_per_type)
  const totalLetters = types.reduce((sum, t) => sum + model.letters_per_type[t], 0)
  const vocabSize = model.vocab.length

  const scores: Record<string, number> = {}
  for (const letterType of types) {
    let score = Math.log(model.letters_per_type[letterType] / totalLetters)
    for (const word of words) {
      const count = model.word_counts[letterType][word] ?? 0
      score += Math.log((count + 1) / (model.words_per_type[letterType] + vocabSize))
    }
    scores[letterType] = score
  }

  // Python's max() keeps the first one on a tie, so only a strictly bigger
  // score takes over here.
  let best = types[0]
  for (const letterType of types) if (scores[letterType] > scores[best]) best = letterType
  return { letterType: best, scores }
}

// Loads the trained model the app ships with.
export async function loadModel(): Promise<Model> {
  const response = await fetch('/model.json')
  if (!response.ok) throw new Error('Could not load the letter classifier.')
  return response.json()
}

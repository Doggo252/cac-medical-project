// Reader A: asks the backend to have the AI read the letter.
//
// This is the one step that needs the internet. The text is scrubbed of
// private details (redact.ts) before it leaves the phone, and the backend
// scrubs it again. If the phone is offline or the server is down, this
// returns null and the app carries on with Reader B alone.
import { redact } from './redact'

export type Facts = Record<string, unknown> & { letter_type?: string | null }

export type ReaderAResult = {
  facts: Facts
  // How many private details were blanked before sending.
  redacted: Record<string, number>
}

// Give up after this long, so a slow connection does not freeze the screen.
const TIMEOUT_MS = 30_000

export async function askReaderA(ocrText: string): Promise<ReaderAResult | null> {
  const { text, counts } = redact(ocrText)
  try {
    const response = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok) return null
    const body = await response.json()
    return { facts: body.facts, redacted: counts }
  } catch (error) {
    console.warn('Reader A unavailable:', error)
    return null
  }
}

import { describe, expect, it } from 'vitest'
import { fingerprint, sha256Plain, shortPrint } from './fingerprint'

const hex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer), (n) => n.toString(16).padStart(2, '0')).join('')

describe('file fingerprints', () => {
  it('matches the known answer for "abc"', () => {
    expect(sha256Plain(new TextEncoder().encode('abc'))).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    )
  })

  it('the step-by-step copy matches the browser on every length from 0 to 300 bytes', async () => {
    for (let length = 0; length <= 300; length++) {
      const data = new Uint8Array(length).map((_, i) => (i * 31 + length * 7) & 255)
      expect(sha256Plain(data)).toBe(hex(await crypto.subtle.digest('SHA-256', data)))
    }
  })

  it('changing one byte changes the fingerprint', async () => {
    const a = new Blob([new Uint8Array([1, 2, 3, 4])])
    const b = new Blob([new Uint8Array([1, 2, 3, 5])])
    expect(await fingerprint(a)).not.toBe(await fingerprint(b))
  })

  it('shows a short version to read out loud', () => {
    expect(shortPrint('3f2a9c01aaaa')).toBe('3F2A 9C01')
  })
})
